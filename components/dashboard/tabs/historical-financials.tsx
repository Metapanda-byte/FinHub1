"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSearchStore } from "@/lib/store/search-store";
import { useIncomeStatements, useBalanceSheets, useCashFlows } from "@/lib/api/financial";
import { formatFinancialNumber, getGrowthIndicator } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { TableLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { CrunchingNumbersCard } from "@/components/ui/crunching-numbers-loader";

const expenseMetrics = new Set([
  "Cost of Revenue",
  "Operating Expenses",
  "Capital Expenditure",
  "Dividends Paid",
  "Total Liabilities"
]);

const formatMetric = (value: number | null | undefined, label?: string, isHeaderRow?: boolean, isDataUnavailable?: boolean, isFuturePeriod?: boolean) => {
  if (isHeaderRow) {
    return '';
  }
  
  // If entire period has no data available
  if (isDataUnavailable) {
    // For future periods, show empty instead of N/A
    if (isFuturePeriod) {
      return '';
    }
    // For historical periods, show N/A for cleaner indication
    return (
      <span className="text-muted-foreground text-xs italic">
        N/A
      </span>
    );
  }
  
  if (value === null || value === undefined || isNaN(value) || value === 0) {
    return '-';
  }
  const isEPS = label?.includes('EPS');
  const isPercentage = label?.includes('Growth') || label?.includes('Margin');
  
  if (isPercentage) {
    return formatPercent(value);
  }
  
  return formatFinancialNumber(value, {
    decimals: isEPS ? 2 : 0,
    useParentheses: true,
    showZeroDecimals: isEPS
  });
};

const formatPercent = (value: number) => {
  const formattedValue = Math.abs(value).toFixed(1);
  return value < 0 ? `(${formattedValue}%)` : `${formattedValue}%`;
};

// Helper function to check if a period/year has any data available
const isPeriodDataUnavailable = (periodMap: Record<string, any>, period: string): boolean => {
  const data = periodMap[period];
  if (!data) return true;
  
  // Check if this period has any meaningful financial data
  const hasRevenue = data.revenue && Math.abs(data.revenue) > 0;
  const hasAssets = data.totalAssets && Math.abs(data.totalAssets) > 0;
  const hasEquity = data.totalStockholdersEquity && Math.abs(data.totalStockholdersEquity) > 0;
  
  return !hasRevenue && !hasAssets && !hasEquity;
};

// Helper function to determine if a period is in the future (after last reported date)
const isPeriodInFuture = (period: string, lastReportedPeriod: string | null, selectedPeriod: 'annual' | 'quarter' | 'semi-annual'): boolean => {
  if (!lastReportedPeriod) return false;
  
  // Parse period strings for comparison
  const parseAnnualPeriod = (p: string) => parseInt(p);
  const parseQuarterlyPeriod = (p: string) => {
    const [year, quarter] = p.split('-');
    const quarterNum = quarter.replace('Q', '');
    return parseInt(year) * 10 + parseInt(quarterNum);
  };
  const parseSemiAnnualPeriod = (p: string) => {
    const [year, half] = p.split('-');
    const halfNum = half.replace('H', '');
    return parseInt(year) * 10 + parseInt(halfNum);
  };
  
  let currentPeriodValue: number;
  let lastReportedPeriodValue: number;
  
  if (selectedPeriod === 'annual') {
    currentPeriodValue = parseAnnualPeriod(period);
    lastReportedPeriodValue = parseAnnualPeriod(lastReportedPeriod);
  } else if (selectedPeriod === 'quarter') {
    currentPeriodValue = parseQuarterlyPeriod(period);
    lastReportedPeriodValue = parseQuarterlyPeriod(lastReportedPeriod);
  } else {
    currentPeriodValue = parseSemiAnnualPeriod(period);
    lastReportedPeriodValue = parseSemiAnnualPeriod(lastReportedPeriod);
  }
  
  return currentPeriodValue > lastReportedPeriodValue;
};

// Helper function to format the last reported period for display
const formatLastReportedPeriod = (period: string | null, selectedPeriod: 'annual' | 'quarter' | 'semi-annual'): string => {
  if (!period) return '';
  return 'LFY';
};

// Helper function to find the last reported period
const findLastReportedPeriod = (periodMap: Record<string, any>, periods: string[]): string | null => {
  // Find all periods that have data
  const periodsWithData = periods.filter(period => !isPeriodDataUnavailable(periodMap, period));
  
  if (periodsWithData.length === 0) return null;
  
  // Sort periods and return the latest one
  return periodsWithData.sort((a, b) => {
    // Simple string comparison works for our normalized period format
    return b.localeCompare(a);
  })[0];
};

// Function to get currency display text based on actual reported currency from financial statements
const getCurrencyDisplayText = (statements: any[]) => {
  // Get the reported currency from the most recent financial statement
  const reportedCurrency = statements?.[0]?.reportedCurrency;
  
  if (!reportedCurrency) return 'In $m unless otherwise specified';
  
  const currency = reportedCurrency.toLowerCase();
  
  const currencyMap: { [key: string]: string } = {
    'usd': '$m',
    'eur': '€m',
    'gbp': '£m',
    'jpy': '¥m',
    'cad': 'C$m',
    'aud': 'A$m',
    'chf': 'CHFm',
    'cny': '¥m',
    'krw': '₩m',
    'inr': '₹m',
    'brl': 'R$m',
    'rub': '₽m',
    'mxn': 'MX$m'
  };
  
  const currencySymbol = currencyMap[currency] || `${reportedCurrency}m`;
  return `In ${currencySymbol} unless otherwise specified`;
};

// Function to detect if a company reports semi-annually (only H1 and H2)
const isSemiAnnualReporter = (statements: any[]) => {
  if (!statements || statements.length < 4) return false;
  
  // Check the pattern of reporting dates - semi-annual reporters typically have:
  // - June 30 (H1) 
  // - December 31 (H2/Full Year)
  
  // Look at more recent data first, but also check historical pattern
  const recentStatements = statements.slice(0, 8); // Last 8 reports
  const allStatements = statements.slice(0, 12); // Last 12 reports for broader pattern
  
  const checkSemiAnnualPattern = (stmts: any[]) => {
    const dates = stmts.map(s => new Date(s.date));
    const months = dates.map(d => d.getMonth() + 1); // getMonth() is 0-indexed
    
    // Count occurrences of each month
    const monthCounts = months.reduce((acc, month) => {
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as { [key: number]: number });
    
    // Semi-annual reporters should primarily have June (6) and December (12)
    const june = monthCounts[6] || 0;
    const december = monthCounts[12] || 0;
    const totalJuneDec = june + december;
    const totalReports = dates.length;
    
    return totalReports > 0 ? (totalJuneDec / totalReports) : 0;
  };
  
  // Check recent pattern first
  const recentRatio = checkSemiAnnualPattern(recentStatements);
  const overallRatio = checkSemiAnnualPattern(allStatements);
  
  // If recent pattern shows quarterly (low ratio) but historical shows semi-annual, 
  // company may have switched - use quarterly
  if (recentRatio < 0.5 && overallRatio >= 0.8) {
    console.log('📊 Company appears to have switched from semi-annual to quarterly reporting');
    return false;
  }
  
  // If 70%+ of reports are in June/December, likely semi-annual
  // Lowered threshold slightly to account for data inconsistencies
  return recentRatio >= 0.7 || overallRatio >= 0.8;
};

// Function to get the correct period label for semi-annual reporters
const getPeriodLabel = (date: string, isSemiAnnual: boolean) => {
  if (!isSemiAnnual) {
    const dateObj = new Date(date);
    const month = dateObj.getMonth() + 1;
    if (month <= 3) return 'Q1';
    else if (month <= 6) return 'Q2';
    else if (month <= 9) return 'Q3';
    else return 'Q4';
  }
  
  // For semi-annual reporters
  const dateObj = new Date(date);
  const month = dateObj.getMonth() + 1;
  return month <= 6 ? 'H1' : 'H2';
};

const formatRatio = (value: number) => {
  return formatFinancialNumber(value, {
    decimals: 0,
    useParentheses: true,
    showZeroDecimals: false,
  });
};

const calculateCAGR = (startValue: number, endValue: number, years: number) => {
  if (startValue === 0 || years === 0) return 0;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
};

// Helper to build periods grouped by year for quarterly data
function getPeriodsByYear(statements: any[]) {
  const periodsByYear: Record<string, string[]> = {};
  statements.forEach(s => {
    if (!s.period) return;
    
    // Use calendarYear if available (for API format like period: "Q3", calendarYear: "2025")
    let year: string;
    if (s.calendarYear) {
      year = s.calendarYear;
    } else {
      // Fallback: Extract 4-digit year from the period string using regex
      const match = s.period.match(/(\d{4})/);
      if (!match) {
        console.warn('[getPeriodsByYear] Could not extract year from period:', s.period, 'and no calendarYear provided');
        return;
      }
      year = match[1];
    }
    
    if (!periodsByYear[year]) periodsByYear[year] = [];
    if (!periodsByYear[year].includes(s.period)) periodsByYear[year].push(s.period);
  });
  
  // Ensure Q1-Q4 order for each year - handle both formats
  Object.keys(periodsByYear).forEach(year => {
    periodsByYear[year] = ['Q1','Q2','Q3','Q4']
      .map(q => {
        // Find the period string that matches this quarter
        // Handle both "Q3" format and "2025-Q3" format
        return periodsByYear[year].find(p => 
          p === q || // Direct match like "Q3"
          (p.includes(year) && p.includes(q)) // Full format like "2025-Q3"
        );
      })
      .filter(Boolean) as string[];
  });
  return periodsByYear;
}

// Helper to get LTM reference date in MMM-YY format from quarterly data
function getLTMReferenceDate(quarterlyMap: Record<string, any>): string {
  if (!quarterlyMap || Object.keys(quarterlyMap).length === 0) return 'LTM';
  
  // Get all periods and sort them to find the most recent
  const periods = Object.keys(quarterlyMap).sort();
  if (periods.length === 0) return 'LTM';
  
  const mostRecentPeriod = periods[periods.length - 1];
  const match = mostRecentPeriod.match(/(\d{4})-Q([1-4])/);
  if (!match) return 'LTM';
  
  const year = match[1];
  const quarter = match[2];
  
  // Convert quarter to month (Q4=Dec, Q3=Sep, Q2=Jun, Q1=Mar)
  const monthMap = { '1': 'Mar', '2': 'Jun', '3': 'Sep', '4': 'Dec' };
  const month = monthMap[quarter as keyof typeof monthMap];
  const yearShort = year.slice(-2); // Get last 2 digits of year
  return `${month}-${yearShort}`;
}

// Helper to calculate LTM (Last Twelve Months) value from quarterly and annual data
function calculateLTM(
  quarterlyMap: Record<string, any>, 
  field: string, 
  periodType: 'annual' | 'semi-annual' | 'quarter',
  annualStatements?: any[]
): number | null {
  if (!quarterlyMap || Object.keys(quarterlyMap).length === 0) return null;
  
  if (periodType === 'semi-annual') {
    // For semi-annual view, we need the last 2 half-year periods
    // Look for the most recent H1 (Q2/June) and H2 (Q4/December) periods
    
    const periods = Object.keys(quarterlyMap).sort();
    const h2Periods = periods.filter(p => {
      const statement = quarterlyMap[p];
      if (!statement?.date) return false;
      const month = new Date(statement.date).getMonth() + 1;
      return month === 12; // December (H2)
    }).sort();
    
    const h1Periods = periods.filter(p => {
      const statement = quarterlyMap[p];
      if (!statement?.date) return false;
      const month = new Date(statement.date).getMonth() + 1;
      return month === 6; // June (H1)
    }).sort();
    
    if (h2Periods.length === 0) return null;
    
    // Get the most recent H2 (December)
    const mostRecentH2 = h2Periods[h2Periods.length - 1];
    const h2Value = quarterlyMap[mostRecentH2]?.[field];
    
    // For semi-annual companies, H2 often contains the full year total
    // But if we have H1 from the same year, sum them for accuracy
    const h2Year = new Date(quarterlyMap[mostRecentH2]?.date).getFullYear();
    const matchingH1 = h1Periods.find(p => {
      const h1Year = new Date(quarterlyMap[p]?.date).getFullYear();
      return h1Year === h2Year;
    });
    
    if (matchingH1) {
      const h1Value = quarterlyMap[matchingH1]?.[field];
      if (h1Value !== null && h1Value !== undefined && !isNaN(h1Value) &&
          h2Value !== null && h2Value !== undefined && !isNaN(h2Value)) {
        return h1Value + h2Value;
      }
    }
    
    // Fallback: use H2 value if it's available (often represents full year)
    if (h2Value !== null && h2Value !== undefined && !isNaN(h2Value)) {
      return h2Value;
    }
    
    return null;
  } else {
    // New LTM calculation logic: Last available FY + most recent quarters in next FY - equivalent quarters in prior FY
    return calculateAdvancedLTM(quarterlyMap, field, annualStatements);
  }
}

// Advanced LTM calculation following the specification:
// LTM = Last Complete FY + YTD of Current FY - YTD of Prior FY
function calculateAdvancedLTM(
  quarterlyMap: Record<string, any>,
  field: string,
  annualStatements?: any[]
): number | null {
  if (!quarterlyMap || Object.keys(quarterlyMap).length === 0) return null;

  // Get all available quarterly periods sorted by date
  const quarterlyPeriods = Object.keys(quarterlyMap).sort((a, b) => {
    const dateA = quarterlyMap[a]?.date;
    const dateB = quarterlyMap[b]?.date;
    if (!dateA || !dateB) return 0;
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });
  
  if (quarterlyPeriods.length === 0) return null;
  
  // Find the most recent quarter to determine current position
  const mostRecentQuarter = quarterlyPeriods[quarterlyPeriods.length - 1];
  const mostRecentData = quarterlyMap[mostRecentQuarter];
  if (!mostRecentData) return null;
  
  // Determine the current fiscal year and last complete fiscal year
  const currentDate = new Date(mostRecentData.date);
  const currentFY = parseInt(mostRecentData.calendarYear);
  
  // Find the most recent fiscal year with complete annual data
  let lastCompleteFY: number | null = null;
  let lastCompleteFYValue: number | null = null;

  // First, try to get from annual statements if available
  if (annualStatements && annualStatements.length > 0) {
    const sortedAnnual = annualStatements
      .filter(stmt => stmt.calendarYear && stmt[field] !== null && stmt[field] !== undefined)
      .sort((a, b) => parseInt(b.calendarYear) - parseInt(a.calendarYear));
    
    // Find the most recent complete fiscal year (should be at least one year before current)
    for (const stmt of sortedAnnual) {
      const fyYear = parseInt(stmt.calendarYear);
      if (fyYear < currentFY) {
        lastCompleteFY = fyYear;
        lastCompleteFYValue = stmt[field];
        break;
      }
    }
  }

  // If no annual data, try to construct from quarterly data
  if (lastCompleteFY === null) {
    // Get all fiscal years from quarterly data
    const fiscalYears = new Set<number>();
    quarterlyPeriods.forEach(period => {
      const statement = quarterlyMap[period];
      if (statement?.calendarYear) {
        fiscalYears.add(parseInt(statement.calendarYear));
      }
    });
    
    const sortedFiscalYears = Array.from(fiscalYears).sort((a, b) => b - a);
    
    // Look for the most recent complete fiscal year before current
    for (const year of sortedFiscalYears) {
      if (year >= currentFY) continue; // Skip current year
      
      const quartersForYear = quarterlyPeriods.filter(period => {
        const statement = quarterlyMap[period];
        return statement?.calendarYear === year.toString();
      });

      if (quartersForYear.length === 4) {
        // Calculate annual value from quarters
        let annualValue = 0;
        let hasAllQuarters = true;
        
        for (const quarter of quartersForYear) {
          const quarterValue = quarterlyMap[quarter]?.[field];
          if (quarterValue === null || quarterValue === undefined || isNaN(quarterValue)) {
            hasAllQuarters = false;
            break;
          }
          annualValue += quarterValue;
        }
        
        if (hasAllQuarters) {
          lastCompleteFY = year;
          lastCompleteFYValue = annualValue;
          break;
        }
      }
    }
  }

  if (lastCompleteFY === null || lastCompleteFYValue === null) {
    // Fallback to simple 4-quarter rolling sum if no complete FY available
    if (quarterlyPeriods.length < 4) return null;
    
    const recentPeriods = quarterlyPeriods.slice(-4);
    let values: number[] = [];
    
    for (const period of recentPeriods) {
      const value = quarterlyMap[period]?.[field];
      if (value !== null && value !== undefined && !isNaN(value)) {
        values.push(value);
      }
    }
    
    if (values.length !== 4) return null;
    return values.reduce((sum, val) => sum + val, 0);
  }

  // Now calculate LTM using the formula:
  // LTM = Last Complete FY + YTD of Current FY - YTD of Prior FY
  
  // Get YTD quarters for current fiscal year
  const currentFYQuarters = quarterlyPeriods.filter(period => {
    const statement = quarterlyMap[period];
    return statement?.calendarYear === currentFY.toString();
  }).sort((a, b) => {
    // Sort by date to ensure proper quarter order
    const dateA = new Date(quarterlyMap[a]?.date);
    const dateB = new Date(quarterlyMap[b]?.date);
    return dateA.getTime() - dateB.getTime();
  });

  // If no quarters in current FY, LTM equals last complete FY
  if (currentFYQuarters.length === 0) {
    return lastCompleteFYValue;
  }

  // Calculate YTD for current fiscal year
  let currentYTD = 0;
  const currentYTDQuarters: string[] = [];
  
  for (const quarter of currentFYQuarters) {
    const value = quarterlyMap[quarter]?.[field];
    if (value !== null && value !== undefined && !isNaN(value)) {
      currentYTD += value;
      currentYTDQuarters.push(quarter);
    }
  }

  // Get the same quarters from the prior fiscal year (lastCompleteFY)
  // We need to match the quarters (e.g., if we have Q1-Q3 of current year, get Q1-Q3 of prior year)
  let priorYTD = 0;
  
  // Determine which quarters we have in current year
  const currentQuarterPeriods = currentYTDQuarters.map(q => {
    const parts = q.split('-');
    return parts[parts.length - 1]; // Get Q1, Q2, Q3, or Q4
  });
  
  // Get the same quarters from lastCompleteFY
  for (const quarterPeriod of currentQuarterPeriods) {
    const priorQuarterKey = `${lastCompleteFY}-${quarterPeriod}`;
    const priorValue = quarterlyMap[priorQuarterKey]?.[field];
    
    if (priorValue !== null && priorValue !== undefined && !isNaN(priorValue)) {
      priorYTD += priorValue;
    }
  }

  // Apply the LTM formula
  const ltmValue = lastCompleteFYValue + currentYTD - priorYTD;
  
  // Debug logging for LTM calculation
  if (field === 'revenue') {
    console.log('LTM Calculation Debug:', {
      field,
      currentFY,
      lastCompleteFY,
      lastCompleteFYValue,
      currentYTD,
      priorYTD,
      ltmValue,
      currentQuarters: currentYTDQuarters.length
    });
  }
  
  return ltmValue;
}

// Helper to normalize period keys
function normalizePeriod(period: string, type: 'annual' | 'semi-annual' | 'quarter', calendarYear?: string, date?: string): string | null {
  if (!period && !date) return null;
  
  if (type === 'annual') {
    // For annual data, use calendarYear if available, otherwise try to extract from period
    if (calendarYear) {
      return calendarYear;
    }
    const yearMatch = period?.match(/(\d{4})/);
    if (!yearMatch) return null;
    return yearMatch[1];
  } else if (type === 'semi-annual' || type === 'quarter') {
    // For quarterly data, we need to determine the quarter from the date
    // API might provide date like "2024-03-31" for Q1, "2024-06-30" for Q2, etc.
    if (date) {
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1; // getMonth() is 0-indexed
      
      let quarter: string;
      if (month <= 3) quarter = 'Q1';
      else if (month <= 6) quarter = 'Q2';
      else if (month <= 9) quarter = 'Q3';
      else quarter = 'Q4';
      
      const result = `${year}-${quarter}`;
      return result;
    }
    
    // Handle direct Q1, Q2, Q3, Q4 format from API (no year in period string)
    if (period && period.match(/^Q[1-4]$/i)) {
      // Direct format like "Q3" - use with calendar year
      if (!calendarYear) {
        return null;
      }
      const result = `${calendarYear}-${period.toUpperCase()}`;
      return result;
    }
    
    // Fallback: try to extract year from period string for other formats
    const yearMatch = period?.match(/(\d{4})/);
    if (!yearMatch) {
      return null;
    }
    const year = yearMatch[1];
    
    const quarterMatch = period.match(/Q([1-4])/i) || 
                       period.match(/([1-4])Q/i) ||
                       period.match(/Quarter\s*([1-4])/i);
    if (!quarterMatch) {
      return null;
    }
    const result = `${year}-Q${quarterMatch[1]}`;
    return result;
  }
  
  return null;
}

export function HistoricalFinancials() {
  const [activeFinancialTab, setActiveFinancialTab] = useState('income-statement');
  const [selectedPeriod, setSelectedPeriod] = useState<'annual' | 'semi-annual' | 'quarter'>('annual');
  const [showSubscriptionWarning, setShowSubscriptionWarning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const currentSymbol = useSearchStore((state) => state.currentSymbol);
  const { toast } = useToast();
  const tableContainerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Map our new period types to API period types
  const apiPeriod = selectedPeriod === 'semi-annual' ? 'quarter' : selectedPeriod;
  
  const { statements: incomeStatements, isLoading: incomeLoading } = useIncomeStatements(currentSymbol || '', apiPeriod);
  const { statements: cashFlowStatements, isLoading: cashFlowLoading } = useCashFlows(currentSymbol || '', apiPeriod);
  const { statements: balanceSheets, isLoading: balanceSheetLoading } = useBalanceSheets(currentSymbol || '', apiPeriod);
  
  // Always fetch quarterly data for LTM calculations
  const { statements: incomeStatementsQuarterly } = useIncomeStatements(currentSymbol || '', 'quarter');
  const { statements: cashFlowStatementsQuarterly } = useCashFlows(currentSymbol || '', 'quarter');
  const { statements: balanceSheetsQuarterly } = useBalanceSheets(currentSymbol || '', 'quarter');

  // Always fetch annual data for LTM calculations
  const { statements: incomeStatementsAnnual } = useIncomeStatements(currentSymbol || '', 'annual');
  const { statements: cashFlowStatementsAnnual } = useCashFlows(currentSymbol || '', 'annual');
  const { statements: balanceSheetsAnnual } = useBalanceSheets(currentSymbol || '', 'annual');

  // Check if quarterly/semi-annual data is actually annual data (indicating fallback)
  useEffect(() => {
    if ((selectedPeriod === 'quarter' || selectedPeriod === 'semi-annual') && incomeStatements && incomeStatements.length > 0) {
      const firstStatement = incomeStatements[0];
      // Check if the period is actually annual (FY) instead of quarterly/semi-annual
      if (firstStatement.period === 'FY' || firstStatement.period?.includes('FY')) {
        setShowSubscriptionWarning(true);
      } else {
        setShowSubscriptionWarning(false);
      }
    } else {
      setShowSubscriptionWarning(false);
    }
  }, [selectedPeriod, incomeStatements]);

  // Auto-scroll to rightmost position when data loads
  useEffect(() => {
    if (!incomeLoading && !cashFlowLoading && !balanceSheetLoading) {
      const scrollToEnd = (container: HTMLDivElement) => {
        container.scrollLeft = container.scrollWidth - container.clientWidth;
      };
      
      // Scroll all table containers to the end
      Object.values(tableContainerRefs.current).forEach(container => {
        if (container) {
          setTimeout(() => scrollToEnd(container), 100);
        }
      });
    }
  }, [incomeLoading, cashFlowLoading, balanceSheetLoading, selectedPeriod, activeFinancialTab, currentSymbol]);

  // Debug: Log reporting pattern analysis for investigation
  if (incomeStatements && incomeStatements.length > 0 && currentSymbol?.includes('RIO')) {
    const recentStatements = incomeStatements.slice(0, 8);
    const dates = recentStatements.map(s => new Date(s.date));
    const months = dates.map(d => d.getMonth() + 1);
    const monthCounts = months.reduce((acc, month) => {
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as { [key: number]: number });
    
    console.log('🔍 Rio Tinto Reporting Analysis:', {
      symbol: currentSymbol,
      selectedPeriod,
      totalReports: incomeStatements.length,
      recentDates: recentStatements.map(s => ({ 
        date: s.date, 
        period: s.period, 
        calendarYear: s.calendarYear,
        month: new Date(s.date).getMonth() + 1
      })),
      monthDistribution: monthCounts,
      june_december_ratio: ((monthCounts[6] || 0) + (monthCounts[12] || 0)) / recentStatements.length,
      isSemiAnnual: isSemiAnnualReporter(incomeStatements)
    });
  }

  if (!currentSymbol || incomeLoading || cashFlowLoading || balanceSheetLoading) {
    return <CrunchingNumbersCard />;
  }

  if (!incomeStatements || !cashFlowStatements || !balanceSheets) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">No Data Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Unable to fetch financial statements.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Build periods for table columns - Always show consistent number of periods
  let years: string[] = [];
  let periodsByYear: Record<string, string[]> = {};
  
  if (selectedPeriod === 'quarter' || selectedPeriod === 'semi-annual') {
    periodsByYear = getPeriodsByYear(incomeStatements);
    
    // Get available years with data
    const availableYears = Object.keys(periodsByYear)
      .filter(year => /\d{4}/.test(year) && periodsByYear[year].length > 0)
      .sort((a, b) => Number(a) - Number(b));
    
    // Always show last 5 years, filling in missing years
    const currentYear = new Date().getFullYear();
    const targetYears = [];
    for (let i = 4; i >= 0; i--) {
      targetYears.push((currentYear - i).toString());
    }
    
    // Use available years where possible, but maintain consistent 5-year structure
    years = targetYears;
    
    // Ensure periodsByYear has entries for all target years (even if empty)
    targetYears.forEach(year => {
      if (!periodsByYear[year]) {
        periodsByYear[year] = selectedPeriod === 'quarter' 
          ? ['Q1', 'Q2', 'Q3', 'Q4'] 
          : ['H1', 'H2'];
      }
    });
  } else {
    // Annual - Show only years with actual data, up to the last reported fiscal year
    const availableYears = Array.from(new Set(incomeStatements.map(s => s.calendarYear)))
      .filter(y => y)
      .sort((a, b) => Number(a) - Number(b));
    
    if (availableYears.length > 0) {
      // Get the last reported fiscal year
      const lastReportedYear = availableYears[availableYears.length - 1];
      
      // Show up to 10 years, but not beyond the last reported fiscal year
      const startYear = Math.max(
        Number(lastReportedYear) - 9, 
        Number(availableYears[0])
      );
      
      years = [];
      for (let year = startYear; year <= Number(lastReportedYear); year++) {
        years.push(year.toString());
      }
    } else {
      // Fallback if no data available
      years = [];
    }
  }

  // Create periodMaps for LTM date calculation
  const incomePeriodMap: Record<string, any> = {};
  incomeStatements.forEach(s => {
    const norm = normalizePeriod(s.period, selectedPeriod, s.calendarYear, s.date);
    if (norm) incomePeriodMap[norm] = s;
  });

  const cashFlowPeriodMap: Record<string, any> = {};
  cashFlowStatements.forEach(s => {
    const norm = normalizePeriod(s.period, selectedPeriod, s.calendarYear, s.date);
    if (norm) cashFlowPeriodMap[norm] = s;
  });

  const balancePeriodMap: Record<string, any> = {};
  balanceSheets.forEach(s => {
    const norm = normalizePeriod(s.period, selectedPeriod, s.calendarYear, s.date);
    if (norm) balancePeriodMap[norm] = s;
  });
  
  // Create quarterly period maps for LTM calculations
  const incomeQuarterlyMap: Record<string, any> = {};
  if (incomeStatementsQuarterly) {
    incomeStatementsQuarterly.forEach(s => {
      const norm = normalizePeriod(s.period, 'quarter', s.calendarYear, s.date);
      if (norm) incomeQuarterlyMap[norm] = s;
    });
  }
  
  const cashFlowQuarterlyMap: Record<string, any> = {};
  if (cashFlowStatementsQuarterly) {
    cashFlowStatementsQuarterly.forEach(s => {
      const norm = normalizePeriod(s.period, 'quarter', s.calendarYear, s.date);
      if (norm) cashFlowQuarterlyMap[norm] = s;
    });
  }
  
  const balanceQuarterlyMap: Record<string, any> = {};
  if (balanceSheetsQuarterly) {
    balanceSheetsQuarterly.forEach(s => {
      const norm = normalizePeriod(s.period, 'quarter', s.calendarYear, s.date);
      if (norm) balanceQuarterlyMap[norm] = s;
    });
  }

  // Updated table rendering for quarters
    const renderFinancialTable = (data: any[], title: string, periodMap?: Record<string, any>, quarterlyMap?: Record<string, any>) => {
    
    // Calculate all periods for the current view
    let allPeriods: string[] = [];
    if (selectedPeriod === 'quarter') {
      allPeriods = years.flatMap(year => ['Q1', 'Q2', 'Q3', 'Q4'].map(q => `${year}-${q}`));
    } else if (selectedPeriod === 'semi-annual') {
      allPeriods = years.flatMap(year => ['H1', 'H2'].map(h => `${year}-${h}`));
    } else {
      allPeriods = years;
    }
    
    // Find the last reported period to distinguish historical vs future data
    const lastReportedPeriod = findLastReportedPeriod(periodMap || {}, allPeriods);
    
    return (
      <div 
        ref={(el) => { tableContainerRefs.current[title] = el; }}
        className="financial-table-wrapper table-scroll-container rounded-lg shadow-sm overflow-auto max-h-[70vh] touch-scroll-x"
      >
        <table className="financial-table border-collapse" style={{ minWidth: 'max-content' }}>
          <thead className="sticky top-0 z-[100] bg-slate-50 dark:bg-slate-900/90 backdrop-blur border-b-2 border-slate-300 dark:border-slate-600">
            <tr className="">
              <th className={cn(
                "text-left py-0.5 px-2 font-semibold text-xs text-slate-800 dark:text-slate-200 align-bottom",
                "min-w-48 sticky left-0 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700"
              )}>
                {title}
              </th>
              {selectedPeriod === 'quarter'
                ? years.map(year => (
                    <th key={year} colSpan={4} className="text-center py-0.5 px-1 font-semibold text-xs text-slate-800 dark:text-slate-200 align-bottom">FY{year.slice(-2)}</th>
                  ))
                : selectedPeriod === 'semi-annual'
                ? years.map(year => (
                    <th key={year} colSpan={2} className="text-center py-0.5 px-1 font-semibold text-xs text-slate-800 dark:text-slate-200 align-bottom">FY{year.slice(-2)}</th>
                  ))
                : [...years.map(year => (
                    <th key={year} className="text-center py-0.5 px-1 font-semibold text-xs text-slate-800 dark:text-slate-200 align-bottom" style={{ minWidth: '50px' }}>{`FY ${year}`}</th>
                  )), 
                  <th key="ltm" className="text-center py-0.5 px-1 font-semibold text-xs text-slate-800 dark:text-slate-200 align-bottom bg-blue-50 dark:bg-blue-900/30" style={{ minWidth: '50px' }}>LTM</th>]}
            </tr>
            {(selectedPeriod === 'quarter' || selectedPeriod === 'semi-annual') && (() => {
              const periods = selectedPeriod === 'semi-annual' ? ["H1", "H2"] : ["Q1","Q2","Q3","Q4"];
              
              return (
                <tr className="border-none">
                  <th className="text-left py-0.5 px-2 text-xs font-medium text-slate-600 dark:text-slate-400 align-bottom border-none min-w-48 sticky left-0 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground italic">{getCurrencyDisplayText(incomeStatements)}</span>
                    </div>
                  </th>
                  {years.flatMap((year, yearIndex) => periods.map((period, periodIndex) => {
                    const currentPeriod = `${year}-${period}`;
                    const shouldShowLastReported = selectedPeriod === 'quarter' && currentPeriod === lastReportedPeriod;
                    return (
                      <th key={year+period} className="text-center py-0.5 px-1 text-xs font-medium text-slate-700 dark:text-slate-300 align-bottom border-none" style={{ minWidth: '50px' }}>
                        <div className="flex flex-col">
                          <span>{period}</span>
                          {lastReportedPeriod && shouldShowLastReported && (
                            <span className="text-xs text-muted-foreground italic">
                              {formatLastReportedPeriod(lastReportedPeriod, selectedPeriod)}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  }))}

                </tr>
              );
            })()}
            {selectedPeriod === 'annual' && (
              <tr className="border-none">
                <th className="text-left py-0.5 px-2 text-xs font-medium text-slate-600 dark:text-slate-400 align-bottom border-none min-w-48 sticky left-0 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground italic">{getCurrencyDisplayText(incomeStatements)}</span>
                  </div>
                </th>
                {years.map((year, index) => (
                  <th key={year} className="text-center py-0.5 px-1 text-xs font-medium text-slate-600 dark:text-slate-400 align-bottom border-none" style={{ minWidth: '50px' }}>
                    {lastReportedPeriod && year === lastReportedPeriod && (
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground italic">
                          {formatLastReportedPeriod(lastReportedPeriod, selectedPeriod)}
                        </span>
                      </div>
                    )}
                  </th>
                ))}
                <th key="ltm-sub" className="text-center py-0.5 px-1 text-xs font-medium text-slate-700 dark:text-slate-300 align-bottom border-none bg-blue-50 dark:bg-blue-900/30" style={{ minWidth: '50px' }}>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground italic">{quarterlyMap ? getLTMReferenceDate(quarterlyMap) : 'LTM'}</span>
                  </div>
                </th>
              </tr>
            )}
          </thead>
          <tbody className="bg-white dark:bg-slate-950">
            {data.map((row, index) => {
              const isExpense = expenseMetrics.has(row.label);
              const hasBorder = row.hasBorder;
              const isEBITDA = row.isEBITDA;
              const nextRow = data[index + 1];
              const isLastBorderRow = hasBorder && (!nextRow || !nextRow.hasBorder);
              return (
                <tr 
                  key={row.label} 
                  className={cn(
                    "group transition-colors relative",
                    row.isImportant && !row.isEBITDA ? "before:absolute before:inset-y-0 before:left-6 before:right-6 before:bg-slate-100 dark:before:bg-slate-800 before:-z-10" : "",
                    row.isEBITDA ? "before:absolute before:inset-y-0 before:left-6 before:right-6 before:bg-blue-100 dark:before:bg-blue-900 before:-z-10" : "",
                    row.hasBorderTop ? "after:absolute after:top-0 after:left-0 after:right-0 after:h-px after:bg-slate-800 dark:after:bg-slate-200 after:z-40" : "",
                    row.isMargin ? "text-slate-500 dark:text-slate-400" : "",
                    "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <td className={cn(
                    "py-0.5 text-xs flex items-center gap-1",
                    row.isIndented ? "px-3" : "px-2",
                    row.isImportant ? "font-semibold" : "",
                    row.isBold ? "font-bold" : "",
                    row.isMargin ? "text-slate-500 dark:text-slate-400" : "",
                    "min-w-48 sticky left-0 z-0 border-r border-slate-200 dark:border-slate-700"
                  )}>
                    {row.label}
                  </td>
                  {selectedPeriod === 'quarter'
                    ? (() => {
                        const periods = ["Q1","Q2","Q3","Q4"];
                        return years.flatMap(year => periods.map(period => {
                          const dataPeriod = `${year}-${period}`;
                          const isUnavailable = isPeriodDataUnavailable(periodMap || {}, dataPeriod);
                          const isFuture = isPeriodInFuture(dataPeriod, lastReportedPeriod, selectedPeriod);
                          
                        return (
                          <td key={`${year}-${period}`} className={cn(
                            "text-right py-0.5 px-1 text-xs tabular-nums relative z-10",
                            row.isImportant ? "font-semibold" : "",
                            row.isMargin ? "text-slate-500 dark:text-slate-400" : "",
                            isUnavailable && !isFuture ? "bg-muted/20" : ""
                          )} style={{ minWidth: '50px' }}>
                            {formatMetric(row[dataPeriod], row.label, row.isHeaderRow, isUnavailable, isFuture)}
                          </td>
                        );
                      }));
                    })()
                    : selectedPeriod === 'semi-annual'
                    ? (() => {
                        const periods = ["H1", "H2"];
                        return [...years.flatMap(year => periods.map(period => {
                          // For semi-annual, we'll map H1->Q2 and H2->Q4 data, or use calculated H1/H2 values
                          const dataPeriod = `${year}-${period}`;
                          const isUnavailable = isPeriodDataUnavailable(periodMap || {}, dataPeriod);
                          const isFuture = isPeriodInFuture(dataPeriod, lastReportedPeriod, selectedPeriod);
                          
                        return (
                          <td key={`${year}-${period}`} className={cn(
                            "text-right py-0.5 px-1 text-xs tabular-nums relative z-10",
                            row.isImportant ? "font-semibold" : "",
                            row.isMargin ? "text-slate-500 dark:text-slate-400" : "",
                            isUnavailable && !isFuture ? "bg-muted/20" : ""
                          )} style={{ minWidth: '50px' }}>
                            {formatMetric(row[dataPeriod], row.label, row.isHeaderRow, isUnavailable, isFuture)}
                          </td>
                        );
                      }))];
                    })()
                    : [...years.map(year => {
                        const isUnavailable = isPeriodDataUnavailable(periodMap || {}, year);
                        const isFuture = isPeriodInFuture(year, lastReportedPeriod, selectedPeriod);
                        return (
                        <td key={year} className={cn(
                          "text-right py-0.5 px-1 text-xs tabular-nums relative z-10",
                          row.isImportant ? "font-semibold" : "",
                          row.isMargin ? "text-slate-500 dark:text-slate-400" : "",
                          isUnavailable && !isFuture ? "bg-muted/20" : ""
                        )} style={{ minWidth: '50px' }}>
                          {formatMetric(row[year], row.label, row.isHeaderRow, isUnavailable, isFuture)}
                        </td>
                      )}),
                      <td key="ltm" className={cn(
                        "text-right py-0.5 px-1 text-xs tabular-nums font-medium bg-blue-50 dark:bg-blue-900/30 relative z-10",
                        row.isImportant ? "font-semibold" : "",
                        row.isMargin ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-slate-100"
                      )} style={{ minWidth: '50px' }}>
                        {formatMetric(row.ltm, row.label, row.isHeaderRow)}
                      </td>]}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const processIncomeStatements = (quarterlyMap?: Record<string, any>, annualData?: any[]) => {
    const type = selectedPeriod;
    // For LTM calculations, determine the appropriate period type
    const ltmPeriodType = selectedPeriod === 'annual' ? 'quarter' : selectedPeriod;
    
    // Build a map of normalized period -> statement
    // For semi-annual mode, we need to use quarterly data (since apiPeriod='quarter')
    const periodMap: Record<string, any> = {};
    const statementData = selectedPeriod === 'semi-annual' ? incomeStatements : incomeStatements;
    statementData.forEach(s => {
      const norm = normalizePeriod(s.period, selectedPeriod === 'semi-annual' ? 'quarter' : type, s.calendarYear, s.date);
      if (norm) periodMap[norm] = s;
    });
    
    // Helper function to get quarterly data for semi-annual calculations
    const getQuarterlyData = (year: string, quarter: string, field: string): number | null => {
      const quarterKey = `${year}-${quarter}`;
      
      // In semi-annual mode, the quarterly data is in periodMap (built from quarterly API data)
      // In other modes, use the passed quarterlyMap for LTM calculations
      const quarterData = type === 'semi-annual' ? periodMap[quarterKey] : quarterlyMap?.[quarterKey];
      
      // Debug logging for semi-annual mode
      if (type === 'semi-annual' && field === 'revenue' && year === '2024') {
        console.log(`🔍 Semi-annual debug: ${quarterKey} -> ${quarterData?.[field]} (Available keys: ${Object.keys(periodMap).slice(0, 8).join(', ')})`);
      }
      
      return quarterData?.[field] ?? null;
    };
    
    // Helper function to calculate semi-annual values from quarters
    const getSemiAnnualValue = (period: string, field: string, isNegative: boolean = false): number | null => {
      if (type !== 'semi-annual' || !period.includes('-H')) {
        const value = periodMap[period]?.[field] ?? null;
        return value !== null && isNegative ? -value : value;
      }
      
      const [year, half] = period.split('-');
      let q1Value, q2Value, q3Value, q4Value;
      
      if (half === 'H1') {
        // H1 = Q1 + Q2
        q1Value = getQuarterlyData(year, 'Q1', field) || 0;
        q2Value = getQuarterlyData(year, 'Q2', field) || 0;
        const sum = q1Value + q2Value;
        return sum === 0 ? null : (isNegative ? -sum : sum);
      } else {
        // H2 = Q3 + Q4
        q3Value = getQuarterlyData(year, 'Q3', field) || 0;
        q4Value = getQuarterlyData(year, 'Q4', field) || 0;
        const sum = q3Value + q4Value;
        return sum === 0 ? null : (isNegative ? -sum : sum);
      }
    };
    
    // Generate periods based on selected period type
    let periods: string[];
    if (type === 'annual') {
      periods = years;
    } else if (type === 'semi-annual') {
      // For semi-annual view, generate H1 and H2 periods (calculated from quarters)
      periods = years.flatMap(year => ['H1','H2'].map(h => `${year}-${h}`));
    } else {
      // For quarterly view, generate all quarters
      periods = years.flatMap(year => ['Q1','Q2','Q3','Q4'].map(q => `${year}-${q}`));
    }
    const data = [
      {
        label: "Revenue",
        isImportant: true,
        isBold: true,
        ...Object.fromEntries(periods.map(p => [p, getSemiAnnualValue(p, 'revenue')])),
        ltm: quarterlyMap ? calculateLTM(quarterlyMap, 'revenue', ltmPeriodType, annualData) : null,
        unit: 'millions'
      },
      {
        label: "(-) COGS",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, getSemiAnnualValue(p, 'costOfRevenue', true)])),
        ltm: quarterlyMap ? (() => {
          const ltmValue = calculateLTM(quarterlyMap, 'costOfRevenue', ltmPeriodType, annualData);
          return ltmValue ? -ltmValue : null;
        })() : null,
        unit: 'millions'
      },
      {
        label: "Gross Profit",
        isImportant: true,
        hasBorderTop: true,
        ...Object.fromEntries(periods.map(p => [p, getSemiAnnualValue(p, 'grossProfit')])),
        ltm: quarterlyMap ? calculateLTM(quarterlyMap, 'grossProfit', ltmPeriodType, annualData) : null,
        unit: 'millions'
      },
      {
        label: "% Margin",
        isMargin: true,
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.grossProfit && periodMap[p]?.revenue ? (periodMap[p].grossProfit / periodMap[p].revenue) * 100 : null])),
        ltm: quarterlyMap ? (() => {
          const ltmGross = calculateLTM(quarterlyMap, 'grossProfit', ltmPeriodType, annualData);
          const ltmRevenue = calculateLTM(quarterlyMap, 'revenue', ltmPeriodType, annualData);
          return ltmGross && ltmRevenue ? (ltmGross / ltmRevenue) * 100 : null;
        })() : null,
        unit: 'percentage'
      },
      {
        label: "(-) R&D",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, getSemiAnnualValue(p, 'researchAndDevelopmentExpenses', true)])),
        ltm: quarterlyMap ? (() => {
          const ltmValue = calculateLTM(quarterlyMap, 'researchAndDevelopmentExpenses', ltmPeriodType, annualData);
          return ltmValue ? -ltmValue : null;
        })() : null,
        unit: 'millions'
      },
      {
        label: "(-) SG&A",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, (() => {
          // Intelligently use the best available SG&A data
          const separateSales = periodMap[p]?.salesAndMarketingExpenses || 0;
          const separateGA = periodMap[p]?.generalAndAdministrativeExpenses || 0;
          const combinedSGA = periodMap[p]?.sellingGeneralAndAdministrativeExpenses || 0;
          
          // If we have individual components with actual values, sum them
          if (separateSales > 0 || separateGA > 0) {
            const total = separateSales + separateGA;
            return total > 0 ? -total : null;
          }
          
          // Otherwise use the combined SG&A field
          return combinedSGA > 0 ? -combinedSGA : null;
        })()])),
        ltm: quarterlyMap ? (() => {
          const salesLTM = calculateLTM(quarterlyMap, 'salesAndMarketingExpenses', ltmPeriodType, annualData) || 0;
          const gaLTM = calculateLTM(quarterlyMap, 'generalAndAdministrativeExpenses', ltmPeriodType, annualData) || 0;
          const combinedLTM = calculateLTM(quarterlyMap, 'sellingGeneralAndAdministrativeExpenses', ltmPeriodType, annualData) || 0;
          
          if (salesLTM > 0 || gaLTM > 0) {
            const total = salesLTM + gaLTM;
            return total > 0 ? -total : null;
          }
          
          return combinedLTM > 0 ? -combinedLTM : null;
        })() : null,
        unit: 'millions'
      },
      {
        label: "(-) Other Op Expenses",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.otherExpenses ? -periodMap[p].otherExpenses : null])),
        ltm: quarterlyMap ? (() => {
          const ltmValue = calculateLTM(quarterlyMap, 'otherExpenses', ltmPeriodType, annualData);
          return ltmValue ? -ltmValue : null;
        })() : null,
        unit: 'millions'
      },
      {
        label: "(-) Total Op Expenses",
        isIndented: true,
        isBold: true,
        isImportant: true,
        ...Object.fromEntries(periods.map(p => [p, (() => {
          const rd = periodMap[p]?.researchAndDevelopmentExpenses || 0;
          const separateSales = periodMap[p]?.salesAndMarketingExpenses || 0;
          const separateGA = periodMap[p]?.generalAndAdministrativeExpenses || 0;
          const combinedSGA = periodMap[p]?.sellingGeneralAndAdministrativeExpenses || 0;
          const other = periodMap[p]?.otherExpenses || 0;
          
          // Use the same logic as the SG&A line above
          const sgaTotal = (separateSales > 0 || separateGA > 0) ? (separateSales + separateGA) : combinedSGA;
          const total = rd + sgaTotal + other;
          
          return total > 0 ? -total : null;
        })()])),
        ltm: quarterlyMap ? (() => {
          const rdLTM = calculateLTM(quarterlyMap, 'researchAndDevelopmentExpenses', ltmPeriodType, annualData) || 0;
          const salesLTM = calculateLTM(quarterlyMap, 'salesAndMarketingExpenses', ltmPeriodType, annualData) || 0;
          const gaLTM = calculateLTM(quarterlyMap, 'generalAndAdministrativeExpenses', ltmPeriodType, annualData) || 0;
          const combinedSGALTM = calculateLTM(quarterlyMap, 'sellingGeneralAndAdministrativeExpenses', ltmPeriodType, annualData) || 0;
          const otherLTM = calculateLTM(quarterlyMap, 'otherExpenses', ltmPeriodType, annualData) || 0;
          
          const sgaTotalLTM = (salesLTM > 0 || gaLTM > 0) ? (salesLTM + gaLTM) : combinedSGALTM;
          const totalLTM = rdLTM + sgaTotalLTM + otherLTM;
          
          return totalLTM > 0 ? -totalLTM : null;
        })() : null,
        unit: 'millions'
      },
      {
        label: "(+) D&A",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.depreciationAndAmortization ?? null])),
        ltm: quarterlyMap ? calculateLTM(quarterlyMap, 'depreciationAndAmortization', ltmPeriodType) : null,
        unit: 'millions'
      },
      {
        label: "EBITDA",
        isImportant: true,
        isBold: true,
        isEBITDA: true,
        hasBorderTop: true,
        ...Object.fromEntries(periods.map(p => [p, getSemiAnnualValue(p, 'ebitda')])),
        ltm: quarterlyMap ? calculateLTM(quarterlyMap, 'ebitda', ltmPeriodType, annualData) : null,
        unit: 'millions'
      },
      {
        label: "% Margin",
        isMargin: true,
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.ebitda && periodMap[p]?.revenue ? (periodMap[p].ebitda / periodMap[p].revenue) * 100 : null])),
        ltm: quarterlyMap ? (() => {
          const ltmNum = calculateLTM(quarterlyMap, 'ebitda', ltmPeriodType, annualData);
          const ltmDen = calculateLTM(quarterlyMap, 'revenue', ltmPeriodType, annualData);
          return ltmNum && ltmDen ? (ltmNum / ltmDen) * 100 : null;
        })() : null,
        unit: 'millions'
      },
      {
        label: "(-) D&A",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.depreciationAndAmortization ? -periodMap[p].depreciationAndAmortization : null])),
        ltm: quarterlyMap ? (() => {
          const ltmValue = calculateLTM(quarterlyMap, 'depreciationAndAmortization', ltmPeriodType);
          return ltmValue ? -ltmValue : null;
        })() : null,
        unit: 'millions'
      },
      {
        label: "Operating Income",
        isImportant: true,
        hasBorderTop: true,
        ...Object.fromEntries(periods.map(p => [p, getSemiAnnualValue(p, 'operatingIncome')])),
        ltm: quarterlyMap ? calculateLTM(quarterlyMap, 'operatingIncome', ltmPeriodType) : null,
        unit: 'millions'
      },
      {
        label: "% Margin",
        isMargin: true,
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.operatingIncome && periodMap[p]?.revenue ? (periodMap[p].operatingIncome / periodMap[p].revenue) * 100 : null])),
        ltm: quarterlyMap ? (() => {
          const ltmNum = calculateLTM(quarterlyMap, 'operatingIncome', ltmPeriodType);
          const ltmDen = calculateLTM(quarterlyMap, 'revenue', ltmPeriodType);
          return ltmNum && ltmDen ? (ltmNum / ltmDen) * 100 : null;
        })() : null,
        unit: 'millions'
      },
      {
        label: "(+) Interest Income",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.interestIncome ?? null])),
        ltm: quarterlyMap ? calculateLTM(quarterlyMap, 'interestIncome', ltmPeriodType) : null,
        unit: 'millions'
      },
      {
        label: "(-) Interest Expense",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.interestExpense ? -periodMap[p].interestExpense : null])),
        ltm: quarterlyMap ? (() => {
          const ltmValue = calculateLTM(quarterlyMap, 'interestExpense', ltmPeriodType);
          return ltmValue ? -ltmValue : null;
        })() : null,
        unit: 'millions'
      },
      {
        label: "(+/-) Other Non-Op Income",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.totalOtherIncomeExpensesNet ?? null])),
        ltm: quarterlyMap ? calculateLTM(quarterlyMap, 'totalOtherIncomeExpensesNet', ltmPeriodType) : null,
        unit: 'millions'
      },
      {
        label: "(+/-) Extraordinary Items",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.extraordinaryItems ?? null])),
        ltm: quarterlyMap ? calculateLTM(quarterlyMap, 'extraordinaryItems', ltmPeriodType) : null,
        unit: 'millions'
      },
      {
        label: "Income Before Tax",
        isImportant: true,
        hasBorderTop: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.incomeBeforeTax ?? null])),
        ltm: quarterlyMap ? calculateLTM(quarterlyMap, 'incomeBeforeTax', ltmPeriodType) : null,
        unit: 'millions'
      },
      {
        label: "(-) Income Tax Expense",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.incomeTaxExpense ? -periodMap[p].incomeTaxExpense : null])),
        ltm: quarterlyMap ? (() => {
          const ltmValue = calculateLTM(quarterlyMap, 'incomeTaxExpense', ltmPeriodType);
          return ltmValue ? -ltmValue : null;
        })() : null,
        unit: 'millions'
      },
      {
        label: "Net Income",
        isImportant: true,
        isBold: true,
        hasBorderTop: true,
        ...Object.fromEntries(periods.map(p => [p, getSemiAnnualValue(p, 'netIncome')])),
        ltm: quarterlyMap ? calculateLTM(quarterlyMap, 'netIncome', ltmPeriodType, annualData) : null,
        unit: 'millions'
      },
      {
        label: "% Margin",
        isMargin: true,
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.netIncome && periodMap[p]?.revenue ? (periodMap[p].netIncome / periodMap[p].revenue) * 100 : null])),
        ltm: quarterlyMap ? (() => {
          const ltmNum = calculateLTM(quarterlyMap, 'netIncome', ltmPeriodType, annualData);
          const ltmDen = calculateLTM(quarterlyMap, 'revenue', ltmPeriodType, annualData);
          return ltmNum && ltmDen ? (ltmNum / ltmDen) * 100 : null;
        })() : null,
        unit: 'millions'
      },
      {
        label: "Diluted EPS",
        isImportant: true,
        ...Object.fromEntries(periods.map(p => [p, (() => {
          // Use epsDiluted if available, otherwise calculate from netIncome / diluted shares
          const epsDiluted = periodMap[p]?.epsDiluted;
          if (epsDiluted !== null && epsDiluted !== undefined) {
            return epsDiluted;
          }
          const netIncomeMillions = periodMap[p]?.netIncome; // Net income is in millions
          const rawShares = periodMap[p]?.weightedAverageShsOutDil || 
                           periodMap[p]?.weightedAverageShsOut || 
                           periodMap[p]?.weightedAverageSharesOutstandingDiluted ||
                           periodMap[p]?.dilutedAverageShares ||
                           null;
          if (netIncomeMillions && rawShares && rawShares !== 0) {
            // Convert to millions - most APIs provide raw share count
            const sharesInMillions = rawShares / 1000000;
            // EPS = Net Income (millions) / Shares (millions) = dollars per share
            return netIncomeMillions / sharesInMillions;
          }
          return periodMap[p]?.eps ?? null;
        })()])),
        ltm: type === 'annual' ? (() => {
          const last = periodMap[years[years.length - 1]];
          if (!last) return null;
          const epsDiluted = last.epsDiluted;
          if (epsDiluted !== null && epsDiluted !== undefined) {
            return epsDiluted;
          }
          const netIncomeMillions = last.netIncome;
          const rawShares = last.weightedAverageShsOutDil || last.weightedAverageShsOut || last.weightedAverageSharesOutstandingDiluted || last.dilutedAverageShares || null;
          if (netIncomeMillions && rawShares && rawShares !== 0) {
            const sharesInMillions = rawShares / 1000000;
            return netIncomeMillions / sharesInMillions;
          }
          return last.eps ?? null;
        })() : (quarterlyMap ? (() => {
          const ltmNetIncomeMillions = calculateLTM(quarterlyMap, 'netIncome', ltmPeriodType);
          let ltmRawShares = calculateLTM(quarterlyMap, 'weightedAverageShsOutDil', ltmPeriodType);
          if (!ltmRawShares) ltmRawShares = calculateLTM(quarterlyMap, 'weightedAverageShsOut', ltmPeriodType);
          if (!ltmRawShares) ltmRawShares = calculateLTM(quarterlyMap, 'weightedAverageSharesOutstandingDiluted', ltmPeriodType);
          if (!ltmRawShares) ltmRawShares = calculateLTM(quarterlyMap, 'dilutedAverageShares', ltmPeriodType);
          
          if (ltmNetIncomeMillions && ltmRawShares && ltmRawShares !== 0) {
            const ltmSharesInMillions = ltmRawShares / 1000000;
            return ltmNetIncomeMillions / ltmSharesInMillions;
          }
          return calculateLTM(quarterlyMap, 'epsDiluted', ltmPeriodType) || calculateLTM(quarterlyMap, 'eps', ltmPeriodType);
        })() : null),
        unit: 'dollars'
      }
    ];
    
    return data;
  };

  const processCashFlowStatements = (quarterlyMap?: Record<string, any>, annualData?: any[]) => {
    const type = selectedPeriod;
    // For LTM calculations, determine the appropriate period type
    const ltmPeriodType = selectedPeriod === 'annual' ? 'quarter' : selectedPeriod;
    // Build a map of normalized period -> statement
    const periodMap: Record<string, any> = {};
    cashFlowStatements.forEach(s => {
      const norm = normalizePeriod(s.period, selectedPeriod === 'semi-annual' ? 'quarter' : type, s.calendarYear, s.date);
      if (norm) periodMap[norm] = s;
    });
    
    // Helper function to get quarterly data for semi-annual calculations
    const getQuarterlyData = (year: string, quarter: string, field: string): number | null => {
      const quarterKey = `${year}-${quarter}`;
      
      // In semi-annual mode, the quarterly data is in periodMap (built from quarterly API data)
      // In other modes, use the passed quarterlyMap for LTM calculations
      const quarterData = type === 'semi-annual' ? periodMap[quarterKey] : quarterlyMap?.[quarterKey];
      
      return quarterData?.[field] ?? null;
    };
    
    // Helper function to calculate semi-annual values from quarters
    const getSemiAnnualValue = (period: string, field: string, isNegative: boolean = false): number | null => {
      if (type !== 'semi-annual' || !period.includes('-H')) {
        const value = periodMap[period]?.[field] ?? null;
        return value !== null && isNegative ? -value : value;
      }
      
      const [year, half] = period.split('-');
      
      if (half === 'H1') {
        // H1 = Q1 + Q2
        const q1Value = getQuarterlyData(year, 'Q1', field) || 0;
        const q2Value = getQuarterlyData(year, 'Q2', field) || 0;
        const sum = q1Value + q2Value;
        return sum === 0 ? null : (isNegative ? -sum : sum);
      } else {
        // H2 = Q3 + Q4
        const q3Value = getQuarterlyData(year, 'Q3', field) || 0;
        const q4Value = getQuarterlyData(year, 'Q4', field) || 0;
        const sum = q3Value + q4Value;
        return sum === 0 ? null : (isNegative ? -sum : sum);
      }
    };
    
    // Generate periods based on selected period type
    let periods: string[];
    if (type === 'annual') {
      periods = years;
    } else if (type === 'semi-annual') {
      // For semi-annual view, generate H1 and H2 periods (calculated from quarters)
      periods = years.flatMap(year => ['H1','H2'].map(h => `${year}-${h}`));
    } else {
      // For quarterly view, generate all quarters
      periods = years.flatMap(year => ['Q1','Q2','Q3','Q4'].map(q => `${year}-${q}`));
    }
    const data = [
      {
        label: "Net Income",
        isImportant: true,
        isBold: true,
        ...Object.fromEntries(periods.map(p => [p, getSemiAnnualValue(p, 'netIncome')])),
        ltm: quarterlyMap ? calculateLTM(quarterlyMap, 'netIncome', ltmPeriodType) : null,
        unit: 'millions'
      },
      {
        label: "(+) D&A",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.depreciationAndAmortization ?? null])),
        ltm: quarterlyMap ? calculateLTM(quarterlyMap, 'depreciationAndAmortization', ltmPeriodType) : null,
        unit: 'millions'
      },
      {
        label: "(+) Stock-Based Comp",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.stockBasedCompensation ?? null])),
        ltm: quarterlyMap ? calculateLTM(quarterlyMap, 'stockBasedCompensation', ltmPeriodType) : null,
        unit: 'millions'
      },
      {
        label: "(+/-) Working Capital",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.changeInWorkingCapital ?? null])),
        ltm: quarterlyMap ? calculateLTM(quarterlyMap, 'changeInWorkingCapital', ltmPeriodType) : null,
        unit: 'millions'
      },
      {
        label: "(+) Other Operating Activities",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, (() => {
          const otherOperating = periodMap[p]?.otherOperatingActivities || 0;
          return otherOperating !== 0 ? otherOperating : null;
        })()])),
        unit: 'millions'
      },
      {
        label: "Operating Cash Flow",
        isImportant: true,
        isBold: true,
        hasBorderTop: true,
        ...Object.fromEntries(periods.map(p => [p, getSemiAnnualValue(p, 'operatingCashFlow')])),
        ltm: quarterlyMap ? calculateLTM(quarterlyMap, 'operatingCashFlow', ltmPeriodType) : null,
        unit: 'millions'
      },
      {
        label: "(-) Capital Expenditure",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.capitalExpenditure ?? null])),
        ltm: quarterlyMap ? calculateLTM(quarterlyMap, 'capitalExpenditure', ltmPeriodType) : null,
        unit: 'millions'
      },
      {
        label: "(-) Acquisitions",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.acquisitionsNet ?? null])),
        ltm: quarterlyMap ? calculateLTM(quarterlyMap, 'acquisitionsNet', ltmPeriodType) : null,
        unit: 'millions'
      },
      {
        label: "(+/-) Investment Activities",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, (() => {
          const purchases = periodMap[p]?.purchasesOfInvestments || 0;
          const sales = periodMap[p]?.salesMaturitiesOfInvestments || 0;
          const net = sales - purchases;
          return net !== 0 ? net : null;
        })()])),
        ltm: type === 'annual' ? (() => {
          const last = periodMap[years[years.length - 1]];
          if (!last) return null;
          const purchases = last.purchasesOfInvestments || 0;
          const sales = last.salesMaturitiesOfInvestments || 0;
          const net = sales - purchases;
          return net !== 0 ? net : null;
        })() : null,
        unit: 'millions'
      },
      {
        label: "(+/-) Other Investing Activities",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, (() => {
          const other = periodMap[p]?.otherInvestingActivites || 0;
          return other !== 0 ? other : null;
        })()])),
        unit: 'millions'
      },
      {
        label: "Investing Cash Flow",
        isImportant: true,
        hasBorderTop: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.netCashUsedForInvestingActivites ?? periodMap[p]?.investingCashFlow ?? null])),
        ltm: quarterlyMap ? (calculateLTM(quarterlyMap, 'netCashUsedForInvestingActivites', ltmPeriodType) ?? calculateLTM(quarterlyMap, 'investingCashFlow', ltmPeriodType)) : null,
        unit: 'millions'
      },
      {
        label: "(-) Debt Repayment",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.debtRepayment ?? null])),
        unit: 'millions'
      },
      {
        label: "(+) Stock Issuance",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.commonStockIssued ?? null])),
        unit: 'millions'
      },
      {
        label: "(-) Stock Repurchase",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.commonStockRepurchased ?? null])),
        unit: 'millions'
      },
      {
        label: "(-) Dividends Paid",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.dividendsPaid ?? null])),
        unit: 'millions'
      },
      {
        label: "(+) Other Financing Activities",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, (() => {
          const otherFinancing = periodMap[p]?.otherFinancingActivites || 0;
          return otherFinancing !== 0 ? otherFinancing : null;
        })()])),
        unit: 'millions'
      },
      {
        label: "Financing Cash Flow",
        isImportant: true,
        hasBorderTop: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.netCashUsedProvidedByFinancingActivities ?? periodMap[p]?.financingCashFlow ?? null])),
        ltm: quarterlyMap ? (calculateLTM(quarterlyMap, 'netCashUsedProvidedByFinancingActivities', ltmPeriodType) ?? calculateLTM(quarterlyMap, 'financingCashFlow', ltmPeriodType)) : null,
        unit: 'millions'
      },
      {
        label: "Net Change in Cash",
        isImportant: true,
        isBold: true,
        hasBorderTop: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.netChangeInCash ?? null])),
        ltm: quarterlyMap ? calculateLTM(quarterlyMap, 'netChangeInCash', ltmPeriodType) : null,
        unit: 'millions'
      },
      {
        label: "Cash at Beginning of Period",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.cashAtBeginningOfPeriod ?? null])),
        ltm: quarterlyMap ? calculateLTM(quarterlyMap, 'cashAtBeginningOfPeriod', ltmPeriodType) : null,
        unit: 'millions'
      },
      {
        label: "Cash at End of Period",
        isIndented: true,
        isBold: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.cashAtEndOfPeriod ?? null])),
        ltm: quarterlyMap ? calculateLTM(quarterlyMap, 'cashAtEndOfPeriod', ltmPeriodType) : null,
        unit: 'millions'
      }
    ];
    
    return data;
  };

  const processBalanceSheets = (quarterlyMap?: Record<string, any>, annualData?: any[]) => {
    const type = selectedPeriod;
    // For LTM calculations, determine the appropriate period type (balance sheets typically don't need LTM)
    const ltmPeriodType = selectedPeriod === 'annual' ? 'quarter' : selectedPeriod;
    // Build a map of normalized period -> statement
    const periodMap: Record<string, any> = {};
    balanceSheets.forEach(s => {
      const norm = normalizePeriod(s.period, selectedPeriod === 'semi-annual' ? 'quarter' : type, s.calendarYear, s.date);
      if (norm) periodMap[norm] = s;
    });
    // Generate periods based on selected period type
    let periods: string[];
    if (type === 'annual') {
      periods = years;
    } else if (type === 'semi-annual') {
      // For semi-annual view, generate Q2 and Q4 periods (H1->Q2, H2->Q4)
      periods = years.flatMap(year => ['Q2','Q4'].map(q => `${year}-${q}`));
    } else {
      // For quarterly view, generate all quarters
      periods = years.flatMap(year => ['Q1','Q2','Q3','Q4'].map(q => `${year}-${q}`));
    }
    const data = [
      // ASSETS SECTION
      {
        label: "ASSETS",
        isImportant: true,
        isBold: true,
        hasBorderTop: true,
        isHeaderRow: true,
        ...Object.fromEntries(periods.map(p => [p, null])), // Header row
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Current Assets:",
        isImportant: true,
        ...Object.fromEntries(periods.map(p => [p, (() => {
          // Calculate current assets as sum of components
          const cash = periodMap[p]?.cashAndCashEquivalents || 0;
          const shortTermInv = periodMap[p]?.shortTermInvestments || 0;
          const receivables = periodMap[p]?.netReceivables || 0;
          const inventory = periodMap[p]?.inventory || 0;
          const otherCurrent = periodMap[p]?.otherCurrentAssets || 0;
          const total = cash + shortTermInv + receivables + inventory + otherCurrent;
          return total > 0 ? total : null;
        })()])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Cash & Equivalents",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.cashAndCashEquivalents ?? null])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Short Term Investments",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.shortTermInvestments ?? null])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Net Receivables",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.netReceivables ?? null])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Inventory",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.inventory ?? null])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Other Current Assets",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, (() => {
          const other = periodMap[p]?.otherCurrentAssets || 0;
          return other !== 0 ? other : null;
        })()])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Non-Current Assets:",
        isImportant: true,
        hasBorderTop: true,
        ...Object.fromEntries(periods.map(p => [p, (() => {
          // Calculate non-current assets as sum of components
          const ppe = periodMap[p]?.propertyPlantEquipmentNet || 0;
          const goodwill = periodMap[p]?.goodwill || 0;
          const intangible = periodMap[p]?.intangibleAssets || 0;
          const longTermInv = periodMap[p]?.longTermInvestments || 0;
          const otherNonCurrent = periodMap[p]?.otherNonCurrentAssets || 0;
          const total = ppe + goodwill + intangible + longTermInv + otherNonCurrent;
          return total > 0 ? total : null;
        })()])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "PP&E Net",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.propertyPlantEquipmentNet ?? null])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Goodwill",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.goodwill ?? null])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Intangible Assets",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.intangibleAssets ?? null])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Long Term Investments",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, (() => {
          const investments = periodMap[p]?.longTermInvestments || 0;
          return investments !== 0 ? investments : null;
        })()])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Other Non-Current Assets",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, (() => {
          const other = periodMap[p]?.otherNonCurrentAssets || 0;
          return other !== 0 ? other : null;
        })()])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Total Assets",
        isImportant: true,
        isBold: true,
        hasBorderTop: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.totalAssets ?? null])),
        ltm: null,
        unit: 'millions'
      },
      // LIABILITIES & EQUITY SECTION
      {
        label: "LIABILITIES & EQUITY",
        isImportant: true,
        isBold: true,
        hasBorderTop: true,
        isHeaderRow: true,
        ...Object.fromEntries(periods.map(p => [p, null])), // Header row
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Current Liabilities:",
        isImportant: true,
        ...Object.fromEntries(periods.map(p => [p, (() => {
          // Calculate current liabilities as sum of components
          const payables = periodMap[p]?.accountPayables || 0;
          const shortTermDebt = periodMap[p]?.shortTermDebt || 0;
          const deferredRev = periodMap[p]?.deferredRevenue || 0;
          const otherCurrent = periodMap[p]?.otherCurrentLiabilities || 0;
          const total = payables + shortTermDebt + deferredRev + otherCurrent;
          return total > 0 ? total : null;
        })()])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Accounts Payable",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.accountPayables ?? null])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Short Term Debt",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.shortTermDebt ?? null])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Deferred Revenue",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, (() => {
          const deferred = periodMap[p]?.deferredRevenue || 0;
          return deferred !== 0 ? deferred : null;
        })()])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Other Current Liabilities",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, (() => {
          const other = periodMap[p]?.otherCurrentLiabilities || 0;
          return other !== 0 ? other : null;
        })()])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Non-Current Liabilities:",
        isImportant: true,
        hasBorderTop: true,
        ...Object.fromEntries(periods.map(p => [p, (() => {
          // Calculate non-current liabilities as sum of components
          const longTermDebt = periodMap[p]?.longTermDebt || 0;
          const deferredRevNonCurrent = periodMap[p]?.deferredRevenueNonCurrent || 0;
          const otherNonCurrent = periodMap[p]?.otherNonCurrentLiabilities || 0;
          const total = longTermDebt + deferredRevNonCurrent + otherNonCurrent;
          return total > 0 ? total : null;
        })()])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Long Term Debt",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.longTermDebt ?? null])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Deferred Revenue (Non-Current)",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, (() => {
          const deferred = periodMap[p]?.deferredRevenueNonCurrent || 0;
          return deferred !== 0 ? deferred : null;
        })()])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Other Non-Current Liabilities",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, (() => {
          const other = periodMap[p]?.otherNonCurrentLiabilities || 0;
          return other !== 0 ? other : null;
        })()])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Total Liabilities",
        isImportant: true,
        isBold: true,
        hasBorderTop: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.totalLiabilities ?? null])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Shareholders' Equity:",
        isImportant: true,
        hasBorderTop: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.totalStockholdersEquity ?? null])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Common Stock",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.commonStock ?? null])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Retained Earnings",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.retainedEarnings ?? null])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Other Equity",
        isIndented: true,
        ...Object.fromEntries(periods.map(p => [p, (() => {
          const total = periodMap[p]?.totalStockholdersEquity || 0;
          const common = periodMap[p]?.commonStock || 0;
          const retained = periodMap[p]?.retainedEarnings || 0;
          const other = total - common - retained;
          return other !== 0 ? other : null;
        })()])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Total Equity",
        isImportant: true,
        isBold: true,
        hasBorderTop: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.totalStockholdersEquity ?? null])),
        ltm: null,
        unit: 'millions'
      },
      {
        label: "Total Liabilities & Equity",
        isImportant: true,
        isBold: true,
        hasBorderTop: true,
        ...Object.fromEntries(periods.map(p => [p, (() => {
          const liabilities = periodMap[p]?.totalLiabilities || 0;
          const equity = periodMap[p]?.totalStockholdersEquity || 0;
          return liabilities + equity > 0 ? liabilities + equity : null;
        })()])),
        ltm: null,
        unit: 'millions'
      }
    ];
    
    return data;
  };

  // Helper function to format data for export
  const formatDataForExport = (data: any[], title: string) => {
    const exportData: any[] = [];
    
    // Create header row
    const headerRow = ['Financial Metric'];
    years.forEach(year => {
      if (selectedPeriod === 'quarter') {
        ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
          headerRow.push(`${year} ${q}`);
        });
      } else if (selectedPeriod === 'semi-annual') {
        ['H1', 'H2'].forEach(h => {
          headerRow.push(`${year} ${h}`);
        });
      } else {
        headerRow.push(year);
      }
    });
    // Add LTM column for quarterly data
    if (selectedPeriod === 'quarter') {
      headerRow.push('LTM');
    }
    exportData.push(headerRow);
    
    // Add data rows
    data.forEach(row => {
      const dataRow = [row.label];
      years.forEach(year => {
        if (selectedPeriod === 'quarter') {
          ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
            const period = `${year}-${q}`;
            const value = row[period];
            dataRow.push(value !== null && value !== undefined 
              ? typeof value === 'number' 
                ? value
                : value
              : null);
          });
        } else if (selectedPeriod === 'semi-annual') {
          ['H1', 'H2'].forEach(h => {
            const period = `${year}-${h}`;
            const value = row[period];
            dataRow.push(value !== null && value !== undefined 
              ? typeof value === 'number' 
                ? value
                : value
              : null);
          });
        } else {
          const value = row[year];
          dataRow.push(value !== null && value !== undefined 
            ? typeof value === 'number' 
              ? value
              : value
            : null);
        }
      });
      // Add LTM value for quarterly data
      if (selectedPeriod === 'quarter') {
        const ltmValue = row.ltm;
        dataRow.push(ltmValue !== null && ltmValue !== undefined 
          ? typeof ltmValue === 'number' 
            ? ltmValue
            : ltmValue
          : null);
      }
      exportData.push(dataRow);
    });
    
    return exportData;
  };

  const exportToCSV = (data: any[], filename: string) => {
    // Convert data to CSV format
    const csvContent = data.map(row => 
      row.map((cell: any) => {
        if (cell === null || cell === undefined) return '';
        if (typeof cell === 'number') {
          return cell.toLocaleString('en-US', { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 2 
          });
        }
        return `"${String(cell).replace(/"/g, '""')}"`;
      }).join(',')
    ).join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = (allData: { incomeData: any[], cashFlowData: any[], balanceSheetData: any[] }, filename: string) => {
    const wb = XLSX.utils.book_new();
    
    // Helper function to format data for Excel with proper structure
    const formatDataForExcel = (data: any[], title: string) => {
      const excelData: any[] = [];
      
      // Add title and metadata
      excelData.push([`${title} - ${currentSymbol}`]);
      excelData.push([`Period: ${selectedPeriod.toUpperCase()}`]);
      excelData.push([`Export Date: ${new Date().toLocaleDateString()}`]);
      excelData.push([]); // Empty row
      
             // Add the formatted data
       data.forEach(row => {
         excelData.push(row.map((cell: any) => {
           if (cell === null || cell === undefined) return '-';
           if (typeof cell === 'number') {
             return cell.toLocaleString('en-US', { 
               minimumFractionDigits: 0, 
               maximumFractionDigits: 2 
             });
           }
           return cell;
         }));
       });
      
      return excelData;
    };
    
    // Convert data to Excel format with proper structure
    const incomeSheet = XLSX.utils.aoa_to_sheet(formatDataForExcel(allData.incomeData, "Income Statement"));
    const cashFlowSheet = XLSX.utils.aoa_to_sheet(formatDataForExcel(allData.cashFlowData, "Cash Flow Statement"));
    const balanceSheet = XLSX.utils.aoa_to_sheet(formatDataForExcel(allData.balanceSheetData, "Balance Sheet"));
    
    // Set column widths for better readability
    const setColumnWidths = (sheet: XLSX.WorkSheet) => {
      const numDataColumns = years.length * (selectedPeriod === 'quarter' ? 4 : selectedPeriod === 'semi-annual' ? 2 : 1);
      sheet['!cols'] = [
        { width: 35 }, // First column (Financial Metric) - wider for longer names
        ...Array(numDataColumns + (selectedPeriod === 'quarter' ? 1 : 0)).fill({ width: 18 }) // Data columns + LTM
      ];
    };
    
    setColumnWidths(incomeSheet);
    setColumnWidths(cashFlowSheet);
    setColumnWidths(balanceSheet);
    
    // Create summary sheet
    const summaryData = [
      ['Financial Summary Report'],
      [],
      [`Company: ${currentSymbol}`],
      [`Period: ${selectedPeriod.toUpperCase()}`],
      [`Export Date: ${new Date().toLocaleDateString()}`],
      [`Export Time: ${new Date().toLocaleTimeString()}`],
      [],
      ['Available Data:'],
      [`• Income Statement: ${allData.incomeData.length - 1} metrics`],
      [`• Cash Flow Statement: ${allData.cashFlowData.length - 1} metrics`],
      [`• Balance Sheet: ${allData.balanceSheetData.length - 1} metrics`],
      [`• Time Periods: ${years.length} years`],
      [],
      ['Note: All values are in millions of USD unless otherwise specified'],
      [],
      ['Data Source: Financial Modeling Prep API'],
      ['Generated by: FinHubIQ Financial Dashboard']
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ width: 60 }];
    
    // Add sheets to workbook
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
    XLSX.utils.book_append_sheet(wb, incomeSheet, "Income Statement");
    XLSX.utils.book_append_sheet(wb, cashFlowSheet, "Cash Flow");
    XLSX.utils.book_append_sheet(wb, balanceSheet, "Balance Sheet");
    
    // Generate Excel file
    XLSX.writeFile(wb, filename);
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    if (isExporting) return; // Prevent multiple exports
    
    setIsExporting(true);
    try {
      // Process and export each statement type
      const incomeData = formatDataForExport(processIncomeStatements(incomeQuarterlyMap, incomeStatementsAnnual), "Income Statement");
      const cashFlowData = formatDataForExport(processCashFlowStatements(cashFlowQuarterlyMap, cashFlowStatementsAnnual), "Cash Flow Statement");
      const balanceSheetData = formatDataForExport(processBalanceSheets(balanceQuarterlyMap, balanceSheetsAnnual), "Balance Sheet");
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const fileExtension = format === 'csv' ? 'csv' : 'xlsx';
      const filename = `${currentSymbol}_Financial_Statements_${selectedPeriod}_${timestamp}.${fileExtension}`;
      
      if (format === 'csv') {
        // Export each statement as separate CSV files
        exportToCSV(incomeData, `${currentSymbol}_Income_Statement_${selectedPeriod}_${timestamp}.csv`);
        exportToCSV(cashFlowData, `${currentSymbol}_Cash_Flow_${selectedPeriod}_${timestamp}.csv`);
        exportToCSV(balanceSheetData, `${currentSymbol}_Balance_Sheet_${selectedPeriod}_${timestamp}.csv`);
        
        toast({
          title: "CSV Export Successful",
          description: `Financial statements exported as 3 separate CSV files`,
          variant: "default",
        });
      } else {
        // Export as Excel
        exportToExcel({ incomeData, cashFlowData, balanceSheetData }, filename);
        
        toast({
          title: "Excel Export Successful",
          description: `Financial statements exported to ${filename}`,
          variant: "default",
        });
      }
      
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: `Error exporting to ${format.toUpperCase()}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
        <CardHeader className="pb-2">
          <div>
            <CardTitle className="text-2xl font-bold" style={{ color: 'var(--finhub-title)' }}>Historical Financials</CardTitle>
            <CardDescription className="text-sm">
              Financial statements for {currentSymbol}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          {showSubscriptionWarning && (
            <Alert className="border-amber-200 bg-amber-50 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>{selectedPeriod === 'quarter' ? 'Quarterly' : 'Semi-annual'} data not available:</strong> Your current API subscription doesn&apos;t include {selectedPeriod} financial data. 
                Showing annual data instead. To access {selectedPeriod} data, please upgrade your Financial Modeling Prep subscription.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeFinancialTab} onValueChange={setActiveFinancialTab} className="space-y-3">
            <div className="premium-tabs flex flex-row items-center justify-between">
              <TabsList className="h-10 bg-transparent border-none p-0 gap-0 justify-start">
                <TabsTrigger 
                  value="income-statement"
                  className="premium-tab-trigger h-10 px-4 text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-200 data-[state=active]:text-foreground data-[state=active]:font-semibold rounded-none bg-transparent shadow-none"
                >
                  Income Statement
                </TabsTrigger>
                <TabsTrigger 
                  value="cash-flow"
                  className="premium-tab-trigger h-10 px-4 text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-200 data-[state=active]:text-foreground data-[state=active]:font-semibold rounded-none bg-transparent shadow-none"
                >
                  Cash Flow
                </TabsTrigger>
                <TabsTrigger 
                  value="balance-sheet"
                  className="premium-tab-trigger h-10 px-4 text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-200 data-[state=active]:text-foreground data-[state=active]:font-semibold rounded-none bg-transparent shadow-none"
                >
                  Balance Sheet
                </TabsTrigger>
              </TabsList>
              
                            <div className="flex items-center gap-2">
                <Select value={selectedPeriod} onValueChange={(value: 'annual' | 'semi-annual' | 'quarter') => setSelectedPeriod(value)}>
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                    <SelectItem value="quarter">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={isExporting}
                      className="h-8 px-3 text-xs"
                    >
                      <Download className="h-3 w-3 mr-1.5" />
                      {isExporting ? "Exporting..." : "Export"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport('excel')}>
                      Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('csv')}>
                      CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <TabsContent value="income-statement" className="mt-3">
              {incomeLoading ? (
                <TableLoadingSkeleton rows={12} />
              ) : (
                renderFinancialTable(processIncomeStatements(incomeQuarterlyMap, incomeStatementsAnnual), "Income Statement", incomePeriodMap, incomeQuarterlyMap)
              )}
            </TabsContent>
            
            <TabsContent value="cash-flow" className="mt-3">
              {cashFlowLoading ? (
                <TableLoadingSkeleton rows={8} />
              ) : (
                renderFinancialTable(processCashFlowStatements(cashFlowQuarterlyMap, cashFlowStatementsAnnual), "Cash Flow Statement", cashFlowPeriodMap, cashFlowQuarterlyMap)
              )}
            </TabsContent>
            
            <TabsContent value="balance-sheet" className="mt-3">
              {balanceSheetLoading ? (
                <TableLoadingSkeleton rows={10} />
              ) : (
                renderFinancialTable(processBalanceSheets(balanceQuarterlyMap, balanceSheetsAnnual), "Balance Sheet", balancePeriodMap, balanceQuarterlyMap)
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
  );
}
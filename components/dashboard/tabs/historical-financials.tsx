"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Download, InfoIcon, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSearchStore } from "@/lib/store/search-store";
import { useIncomeStatements, useBalanceSheets, useCashFlows } from "@/lib/api/financial";
import { formatFinancialNumber, getGrowthIndicator } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

const financialMetricTooltips = {
  revenue: "Total income generated from sales of goods and services",
  grossProfit: "Revenue minus cost of goods sold",
  operatingIncome: "Profit from core business operations",
  netIncome: "Total profit after all expenses and taxes",
  "Operating Cash Flow": "Cash generated from core business operations",
  "Free Cash Flow": "Cash available after capital expenditures",
  "Total Assets": "All resources owned by the company",
  "Total Liabilities": "All debts and obligations",
  "Total Equity": "Shareholders' ownership in the company"
};

const expenseMetrics = new Set([
  "Cost of Revenue",
  "Operating Expenses",
  "Capital Expenditure",
  "Dividends Paid",
  "Total Liabilities"
]);

const formatMetric = (value: number | null | undefined, label?: string) => {
  if (value === null || value === undefined || isNaN(value)) {
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
    // Extract 4-digit year from the period string using regex
    const match = s.period.match(/(\d{4})/);
    if (!match) {
      console.warn('[getPeriodsByYear] Could not extract year from period:', s.period);
      return;
    }
    const year = match[1];
    if (!periodsByYear[year]) periodsByYear[year] = [];
    if (!periodsByYear[year].includes(s.period)) periodsByYear[year].push(s.period);
  });
  // Ensure Q1-Q4 order for each year
  Object.keys(periodsByYear).forEach(year => {
    periodsByYear[year] = ['Q1','Q2','Q3','Q4']
      .map(q => {
        // Find the period string that matches this year and quarter
        return periodsByYear[year].find(p => p.includes(year) && p.includes(q));
      })
      .filter(Boolean) as string[];
  });
  return periodsByYear;
}

// Helper to normalize period keys
function normalizePeriod(period: string, type: 'annual' | 'quarter', calendarYear?: string): string | null {
  if (!period) return null;
  
  if (type === 'annual') {
    // For annual data, use calendarYear if available, otherwise try to extract from period
    if (calendarYear) {
      return calendarYear;
    }
    const yearMatch = period.match(/(\d{4})/);
    if (!yearMatch) return null;
    return yearMatch[1];
  } else {
    // For quarterly data, try to extract year and quarter from period
    const yearMatch = period.match(/(\d{4})/);
    if (!yearMatch) return null;
    const year = yearMatch[1];
    
    // Try to find Q1-Q4 in the string
    const quarterMatch = period.match(/Q([1-4])/i);
    if (!quarterMatch) return null;
    return `${year}-Q${quarterMatch[1]}`;
  }
}

export function HistoricalFinancials() {
  const [isIncomeOpen, setIsIncomeOpen] = useState(true);
  const [isCashFlowOpen, setIsCashFlowOpen] = useState(false);
  const [isBalanceSheetOpen, setIsBalanceSheetOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'annual' | 'quarter'>('annual');
  const [showSubscriptionWarning, setShowSubscriptionWarning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const currentSymbol = useSearchStore((state) => state.currentSymbol);
  const { toast } = useToast();

  const { statements: incomeStatements, isLoading: incomeLoading } = useIncomeStatements(currentSymbol || '', selectedPeriod);
  const { statements: cashFlowStatements, isLoading: cashFlowLoading } = useCashFlows(currentSymbol || '', selectedPeriod);
  const { statements: balanceSheets, isLoading: balanceSheetLoading } = useBalanceSheets(currentSymbol || '', selectedPeriod);

  // Check if quarterly data is actually annual data (indicating fallback)
  useEffect(() => {
    if (selectedPeriod === 'quarter' && incomeStatements && incomeStatements.length > 0) {
      const firstStatement = incomeStatements[0];
      // Check if the period is actually annual (FY) instead of quarterly
      if (firstStatement.period === 'FY' || firstStatement.period?.includes('FY')) {
        setShowSubscriptionWarning(true);
      } else {
        setShowSubscriptionWarning(false);
      }
    } else {
      setShowSubscriptionWarning(false);
    }
  }, [selectedPeriod, incomeStatements]);

  // Debug: Log the structure of the first two income statements
  if (incomeStatements && incomeStatements.length > 0) {
    console.log('[DEBUG] Sample income statement:', incomeStatements[0]);
    if (incomeStatements[1]) console.log('[DEBUG] Second income statement:', incomeStatements[1]);
    console.log('[DEBUG] All keys in first:', Object.keys(incomeStatements[0]));
    console.log('[DEBUG] All periods:', incomeStatements.map(s => s.period));
  }

  if (!currentSymbol || incomeLoading || cashFlowLoading || balanceSheetLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold">Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <div className="animate-pulse space-y-4">
                <div className="h-4 w-48 bg-muted rounded"></div>
                <div className="h-4 w-36 bg-muted rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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

  // Build periods for table columns
  let years: string[] = [];
  let periodsByYear: Record<string, string[]> = {};
  if (selectedPeriod === 'quarter') {
    periodsByYear = getPeriodsByYear(incomeStatements);
    // Only include years that have at least one valid quarter
    years = Object.keys(periodsByYear)
      .filter(year => /\d{4}/.test(year) && periodsByYear[year].length > 0)
      .sort((a, b) => Number(a) - Number(b));
    // Debug logs
    console.log('[DEBUG] All periods in data:', incomeStatements.map(s => s.period));
    console.log('[DEBUG] years:', years);
    console.log('[DEBUG] periodsByYear:', periodsByYear);
  } else {
    years = Array.from(new Set(incomeStatements.map(s => s.calendarYear)))
      .filter(y => y)
      .sort()
      .slice(-5);
  }

  // Updated table rendering for quarters
  const renderFinancialTable = (data: any[], title: string) => {
    return (
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full">
          <thead className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <tr className="border-b border-border/50">
              <th className="text-left py-4 px-6 font-semibold text-sm text-muted-foreground w-1/4 align-bottom">
                {title}
              </th>
              {selectedPeriod === 'quarter'
                ? years.map(year => (
                    <th key={year} colSpan={4} className="text-center py-4 px-6 font-semibold text-sm text-muted-foreground align-bottom">FY{year.slice(-2)}</th>
                  ))
                : years.map(year => (
                    <th key={year} className="text-right py-4 px-6 font-semibold text-sm text-muted-foreground align-bottom">FY {year}</th>
                  ))}
            </tr>
            {selectedPeriod === 'quarter' && (
              <tr className="border-b border-border/50">
                <th className="text-left py-2 px-6 text-xs text-muted-foreground align-bottom">In $m unless otherwise specified</th>
                {years.map(year => ["Q1","Q2","Q3","Q4"].map(q => (
                  <th key={year+q} className="text-right py-2 px-3 text-xs text-muted-foreground align-bottom">{q}</th>
                )))}
              </tr>
            )}
            {selectedPeriod === 'annual' && (
              <tr className="border-b border-border/50">
                <th className="text-left py-2 px-6 text-xs text-muted-foreground align-bottom">In $m unless otherwise specified</th>
                {years.map(year => (
                  <th key={year} className="text-right py-2 px-6 text-xs text-muted-foreground align-bottom"></th>
                ))}
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-border/50">
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
                    "group transition-colors",
                    row.isImportant ? "bg-muted/30" : "",
                    hasBorder ? "border-x-2 border-t-2 border-border/50" : "",
                    isLastBorderRow ? "border-b-2" : "",
                    isEBITDA ? "bg-muted/10 hover:bg-muted/20" : "hover:bg-muted/50"
                  )}
                >
                  <td className={cn(
                    "py-3 px-6 text-sm flex items-center gap-2",
                    row.isImportant ? "font-semibold" : "",
                    row.isItalic ? "italic" : "",
                    isEBITDA ? "text-primary" : ""
                  )}>
                    {row.label}
                    {financialMetricTooltips[row.label] && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 text-muted-foreground/60" />
                          </TooltipTrigger>
                          <TooltipContent>
                            {financialMetricTooltips[row.label]}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </td>
                  {selectedPeriod === 'quarter'
                    ? years.flatMap(year => ["Q1","Q2","Q3","Q4"].map(q => {
                        const period = `${year}-${q}`;
                        return (
                          <td key={period} className={cn(
                            "text-right py-3 px-3 text-sm tabular-nums",
                            row.isImportant ? "font-semibold" : "",
                            row.isItalic ? "italic" : "",
                            isEBITDA ? "text-primary" : ""
                          )}>
                            {formatMetric(row[period], row.label)}
                          </td>
                        );
                      }))
                    : years.map(year => (
                        <td key={year} className={cn(
                          "text-right py-3 px-6 text-sm tabular-nums",
                          row.isImportant ? "font-semibold" : "",
                          row.isItalic ? "italic" : "",
                          isEBITDA ? "text-primary" : ""
                        )}>
                          {formatMetric(row[year], row.label)}
                        </td>
                      ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const processIncomeStatements = () => {
    const type = selectedPeriod;
    // Build a map of normalized period -> statement
    const periodMap: Record<string, any> = {};
    incomeStatements.forEach(s => {
      const norm = normalizePeriod(s.period, type, s.calendarYear);
      if (norm) periodMap[norm] = s;
    });
    // For annual, use years; for quarter, use all year-Qx in periodsByYear
    const periods = type === 'annual'
      ? years
      : years.flatMap(year => ['Q1','Q2','Q3','Q4'].map(q => `${year}-${q}`));
    return [
      {
        label: "Revenue",
        isImportant: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.revenue ?? null])),
        unit: 'millions'
      },
      {
        label: "YoY Growth",
        isItalic: true,
        ...Object.fromEntries(periods.map((p, idx) => {
          if (idx === 0) return [p, null];
          const current = periodMap[p]?.revenue;
          const prev = periodMap[periods[idx - 1]]?.revenue;
          if (!current || !prev) return [p, null];
          return [p, ((current - prev) / Math.abs(prev)) * 100];
        })),
        unit: 'millions'
      },
      {
        label: "Cost of Revenue",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.costOfRevenue ? -periodMap[p].costOfRevenue : null])),
        unit: 'millions'
      },
      {
        label: "Gross Profit",
        isImportant: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.grossProfit ?? null])),
        unit: 'millions'
      },
      {
        label: "Gross Margin %",
        isItalic: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.grossProfit && periodMap[p]?.revenue ? (periodMap[p].grossProfit / periodMap[p].revenue) * 100 : null])),
        unit: 'millions'
      },
      {
        label: "Research & Development",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.researchAndDevelopmentExpenses ? -periodMap[p].researchAndDevelopmentExpenses : null])),
        unit: 'millions'
      },
      {
        label: "SG&A Expenses",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.sellingGeneralAndAdministrativeExpenses ? -periodMap[p].sellingGeneralAndAdministrativeExpenses : null])),
        unit: 'millions'
      },
      {
        label: "Operating Expenses",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.operatingExpenses ? -periodMap[p].operatingExpenses : null])),
        unit: 'millions'
      },
      {
        label: "Operating Income",
        isImportant: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.operatingIncome ?? null])),
        unit: 'millions'
      },
      {
        label: "Operating Margin %",
        isItalic: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.operatingIncome && periodMap[p]?.revenue ? (periodMap[p].operatingIncome / periodMap[p].revenue) * 100 : null])),
        unit: 'millions'
      },
      {
        label: "Interest Income",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.interestIncome ?? null])),
        unit: 'millions'
      },
      {
        label: "Interest Expense",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.interestExpense ? -periodMap[p].interestExpense : null])),
        unit: 'millions'
      },
      {
        label: "Depreciation & Amortization",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.depreciationAndAmortization ? -periodMap[p].depreciationAndAmortization : null])),
        unit: 'millions'
      },
      {
        label: "EBITDA",
        isImportant: true,
        hasBorder: true,
        isEBITDA: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.ebitda ?? null])),
        unit: 'millions'
      },
      {
        label: "EBITDA Margin %",
        isItalic: true,
        hasBorder: true,
        isEBITDA: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.ebitda && periodMap[p]?.revenue ? (periodMap[p].ebitda / periodMap[p].revenue) * 100 : null])),
        unit: 'millions'
      },
      {
        label: "Other Income",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.otherIncome ?? null])),
        unit: 'millions'
      },
      {
        label: "Income Before Tax",
        isImportant: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.incomeBeforeTax ?? null])),
        unit: 'millions'
      },
      {
        label: "Income Tax Expense",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.incomeTaxExpense ? -periodMap[p].incomeTaxExpense : null])),
        unit: 'millions'
      },
      {
        label: "Net Income",
        isImportant: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.netIncome ?? null])),
        unit: 'millions'
      },
      {
        label: "Net Margin %",
        isItalic: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.netIncome && periodMap[p]?.revenue ? (periodMap[p].netIncome / periodMap[p].revenue) * 100 : null])),
        unit: 'millions'
      },
      {
        label: "EPS",
        isImportant: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.eps ?? null])),
        unit: 'millions'
      },
      {
        label: "EPS Diluted",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.epsDiluted ?? null])),
        unit: 'millions'
      }
    ];
  };

  const processCashFlowStatements = () => {
    const type = selectedPeriod;
    // Build a map of normalized period -> statement
    const periodMap: Record<string, any> = {};
    cashFlowStatements.forEach(s => {
      const norm = normalizePeriod(s.period, type, s.calendarYear);
      if (norm) periodMap[norm] = s;
    });
    // For annual, use years; for quarter, use all year-Qx in periodsByYear
    const periods = type === 'annual'
      ? years
      : years.flatMap(year => ['Q1','Q2','Q3','Q4'].map(q => `${year}-${q}`));
    return [
      {
        label: "Net Income",
        isImportant: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.netIncome ?? null])),
        unit: 'millions'
      },
      {
        label: "Depreciation & Amortization",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.depreciationAndAmortization ?? null])),
        unit: 'millions'
      },
      {
        label: "Stock Based Compensation",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.stockBasedCompensation ?? null])),
        unit: 'millions'
      },
      {
        label: "Change in Working Capital",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.changeInWorkingCapital ?? null])),
        unit: 'millions'
      },
      {
        label: "Operating Cash Flow",
        isImportant: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.operatingCashFlow ?? null])),
        unit: 'millions'
      },
      {
        label: "Capital Expenditure",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.capitalExpenditure ? -periodMap[p].capitalExpenditure : null])),
        unit: 'millions'
      },
      {
        label: "Acquisitions",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.acquisitionsNet ? -periodMap[p].acquisitionsNet : null])),
        unit: 'millions'
      },
      {
        label: "Investments",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.purchasesOfInvestments ? -(periodMap[p].purchasesOfInvestments - periodMap[p].salesMaturitiesOfInvestments) : null])),
        unit: 'millions'
      },
      {
        label: "Investing Cash Flow",
        isImportant: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.investingCashFlow ?? null])),
        unit: 'millions'
      },
      {
        label: "Debt Repayment",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.debtRepayment ? -periodMap[p].debtRepayment : null])),
        unit: 'millions'
      },
      {
        label: "Stock Issuance",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.commonStockIssued ?? null])),
        unit: 'millions'
      },
      {
        label: "Stock Repurchase",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.commonStockRepurchased ? -periodMap[p].commonStockRepurchased : null])),
        unit: 'millions'
      },
      {
        label: "Dividends Paid",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.dividendsPaid ? -periodMap[p].dividendsPaid : null])),
        unit: 'millions'
      },
      {
        label: "Financing Cash Flow",
        isImportant: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.financingCashFlow ?? null])),
        unit: 'millions'
      },
      {
        label: "Free Cash Flow",
        isImportant: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.freeCashFlow ?? null])),
        unit: 'millions'
      },
      {
        label: "Net Cash Flow",
        isImportant: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.netCashFlow ?? null])),
        unit: 'millions'
      }
    ];
  };

  const processBalanceSheets = () => {
    const type = selectedPeriod;
    // Build a map of normalized period -> statement
    const periodMap: Record<string, any> = {};
    balanceSheets.forEach(s => {
      const norm = normalizePeriod(s.period, type, s.calendarYear);
      if (norm) periodMap[norm] = s;
    });
    // For annual, use years; for quarter, use all year-Qx in periodsByYear
    const periods = type === 'annual'
      ? years
      : years.flatMap(year => ['Q1','Q2','Q3','Q4'].map(q => `${year}-${q}`));
    return [
      {
        label: "Total Assets",
        isImportant: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.totalAssets ?? null])),
        unit: 'millions'
      },
      {
        label: "Current Assets",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.currentAssets ?? null])),
        unit: 'millions'
      },
      {
        label: "Cash & Equivalents",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.cashAndCashEquivalents ?? null])),
        unit: 'millions'
      },
      {
        label: "Short Term Investments",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.shortTermInvestments ?? null])),
        unit: 'millions'
      },
      {
        label: "Net Receivables",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.netReceivables ?? null])),
        unit: 'millions'
      },
      {
        label: "Inventory",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.inventory ?? null])),
        unit: 'millions'
      },
      {
        label: "PP&E Net",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.propertyPlantEquipmentNet ?? null])),
        unit: 'millions'
      },
      {
        label: "Goodwill",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.goodwill ?? null])),
        unit: 'millions'
      },
      {
        label: "Intangible Assets",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.intangibleAssets ?? null])),
        unit: 'millions'
      },
      {
        label: "Total Liabilities",
        isImportant: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.totalLiabilities ? -periodMap[p].totalLiabilities : null])),
        unit: 'millions'
      },
      {
        label: "Current Liabilities",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.currentLiabilities ? -periodMap[p].currentLiabilities : null])),
        unit: 'millions'
      },
      {
        label: "Accounts Payable",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.accountPayables ? -periodMap[p].accountPayables : null])),
        unit: 'millions'
      },
      {
        label: "Short Term Debt",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.shortTermDebt ? -periodMap[p].shortTermDebt : null])),
        unit: 'millions'
      },
      {
        label: "Long Term Debt",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.longTermDebt ? -periodMap[p].longTermDebt : null])),
        unit: 'millions'
      },
      {
        label: "Total Equity",
        isImportant: true,
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.totalStockholdersEquity ?? null])),
        unit: 'millions'
      },
      {
        label: "Retained Earnings",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.retainedEarnings ?? null])),
        unit: 'millions'
      },
      {
        label: "Common Stock",
        ...Object.fromEntries(periods.map(p => [p, periodMap[p]?.commonStock ?? null])),
        unit: 'millions'
      }
    ];
  };

  const exportToExcel = async () => {
    if (isExporting) return; // Prevent multiple exports
    
    setIsExporting(true);
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Process and export each statement type
      const incomeData = processIncomeStatements();
      const cashFlowData = processCashFlowStatements();
      const balanceSheetData = processBalanceSheets();
      
      // Helper function to format data for Excel with proper structure
      const formatDataForExcel = (data: any[], title: string) => {
        // Create proper Excel structure with clear headers
        const excelData: any[] = [];
        
        // Add title and metadata
        excelData.push([`${title} - ${currentSymbol}`]);
        excelData.push([`Period: ${selectedPeriod.toUpperCase()}`]);
        excelData.push([`Export Date: ${new Date().toLocaleDateString()}`]);
        excelData.push([]); // Empty row
        
        // Create header row
        const headerRow = ['Financial Metric'];
        years.forEach(year => {
          if (selectedPeriod === 'quarter') {
            ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
              headerRow.push(`${year} ${q}`);
            });
          } else {
            headerRow.push(year);
          }
        });
        excelData.push(headerRow);
        
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
                    ? value.toLocaleString('en-US', { 
                        minimumFractionDigits: 0, 
                        maximumFractionDigits: 2 
                      })
                    : value
                  : '-');
              });
            } else {
              const value = row[year];
              dataRow.push(value !== null && value !== undefined 
                ? typeof value === 'number' 
                  ? value.toLocaleString('en-US', { 
                      minimumFractionDigits: 0, 
                      maximumFractionDigits: 2 
                    })
                  : value
                : '-');
            }
          });
          excelData.push(dataRow);
        });
        
        return excelData;
      };
      
      // Convert data to Excel format with proper structure
      const incomeSheet = XLSX.utils.aoa_to_sheet(formatDataForExcel(incomeData, "Income Statement"));
      const cashFlowSheet = XLSX.utils.aoa_to_sheet(formatDataForExcel(cashFlowData, "Cash Flow Statement"));
      const balanceSheet = XLSX.utils.aoa_to_sheet(formatDataForExcel(balanceSheetData, "Balance Sheet"));
      
      // Set column widths for better readability
      const setColumnWidths = (sheet: XLSX.WorkSheet) => {
        const numDataColumns = years.length * (selectedPeriod === 'quarter' ? 4 : 1);
        sheet['!cols'] = [
          { width: 35 }, // First column (Financial Metric) - wider for longer names
          ...Array(numDataColumns).fill({ width: 18 }) // Data columns
        ];
      };
      
      // Apply formatting and styling
      const applySheetFormatting = (sheet: XLSX.WorkSheet, title: string) => {
        setColumnWidths(sheet);
        
        // Add some basic styling if needed
        // Note: XLSX library has limited styling support, but we can set column widths
        // For more advanced styling, you'd need a library like ExcelJS
      };
      
      applySheetFormatting(incomeSheet, "Income Statement");
      applySheetFormatting(cashFlowSheet, "Cash Flow Statement");
      applySheetFormatting(balanceSheet, "Balance Sheet");
      
      // Create summary sheet with proper structure
      const summaryData = [
        ['Financial Summary Report'],
        [],
        [`Company: ${currentSymbol}`],
        [`Period: ${selectedPeriod.toUpperCase()}`],
        [`Export Date: ${new Date().toLocaleDateString()}`],
        [`Export Time: ${new Date().toLocaleTimeString()}`],
        [],
        ['Available Data:'],
        [`• Income Statement: ${incomeData.length} metrics`],
        [`• Cash Flow Statement: ${cashFlowData.length} metrics`],
        [`• Balance Sheet: ${balanceSheetData.length} metrics`],
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
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${currentSymbol}_Financial_Statements_${selectedPeriod}_${timestamp}.xlsx`;
      
      // Generate Excel file
      XLSX.writeFile(wb, filename);
      
      // Show success feedback
      toast({
        title: "Export Successful",
        description: `Financial statements exported to ${filename}`,
        variant: "default",
      });
      
    } catch (error) {
      console.error('❌ Error exporting to Excel:', error);
      toast({
        title: "Export Failed",
        description: "Error exporting to Excel. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-xl font-bold">Historical Financials</CardTitle>
            <CardDescription>
              Financial statements for {currentSymbol}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={(value: 'annual' | 'quarter') => setSelectedPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="quarter">Quarterly</SelectItem>
              </SelectContent>
            </Select>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={exportToExcel}
                    disabled={isExporting}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? "Exporting..." : "Export to Excel"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export all financial statements to Excel with proper formatting</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {showSubscriptionWarning && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Quarterly data not available:</strong> Your current API subscription doesn't include quarterly financial data. 
                Showing annual data instead. To access quarterly data, please upgrade your Financial Modeling Prep subscription.
              </AlertDescription>
            </Alert>
          )}
          <Collapsible
            open={isIncomeOpen}
            onOpenChange={setIsIncomeOpen}
            className="space-y-4"
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between p-4 hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Income Statement</h3>
                  <Badge variant="outline" className="text-xs">
                    {selectedPeriod.toUpperCase()}
                  </Badge>
                </div>
                {isIncomeOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 px-4">
              {renderFinancialTable(processIncomeStatements(), "Income Statement")}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={isCashFlowOpen}
            onOpenChange={setIsCashFlowOpen}
            className="space-y-4"
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between p-4 hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Cash Flow Statement</h3>
                  <Badge variant="outline" className="text-xs">
                    {selectedPeriod.toUpperCase()}
                  </Badge>
                </div>
                {isCashFlowOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 px-4">
              {renderFinancialTable(processCashFlowStatements(), "Cash Flow Statement")}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={isBalanceSheetOpen}
            onOpenChange={setIsBalanceSheetOpen}
            className="space-y-4"
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between p-4 hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Balance Sheet</h3>
                  <Badge variant="outline" className="text-xs">
                    {selectedPeriod.toUpperCase()}
                  </Badge>
                </div>
                {isBalanceSheetOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 px-4">
              {renderFinancialTable(processBalanceSheets(), "Balance Sheet")}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
}
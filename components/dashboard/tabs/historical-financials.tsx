"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Download, InfoIcon } from "lucide-react";
import { useSearchStore } from "@/lib/store/search-store";
import { useIncomeStatements, useBalanceSheets, useCashFlows } from "@/lib/api/financial";
import { formatFinancialNumber, getGrowthIndicator } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
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

export function HistoricalFinancials() {
  const [isIncomeOpen, setIsIncomeOpen] = useState(true);
  const [isCashFlowOpen, setIsCashFlowOpen] = useState(false);
  const [isBalanceSheetOpen, setIsBalanceSheetOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("annual");
  const currentSymbol = useSearchStore((state) => state.currentSymbol);

  const { statements: incomeStatements, isLoading: incomeLoading } = useIncomeStatements(currentSymbol || '');
  const { statements: cashFlowStatements, isLoading: cashFlowLoading } = useCashFlows(currentSymbol || '');
  const { statements: balanceSheets, isLoading: balanceSheetLoading } = useBalanceSheets(currentSymbol || '');

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

  const years = Array.from(new Set(incomeStatements.map(s => s.calendarYear))).sort().slice(-5);

  const renderFinancialTable = (data: any[], title: string) => {
    return (
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full">
          <thead className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <tr className="border-b border-border/50">
              <th className="text-left py-4 px-6 font-semibold text-sm text-muted-foreground w-1/4 align-bottom">
                {title}
              </th>
              {years.map((year) => (
                <th key={year} className="text-right py-4 px-6 font-semibold text-sm text-muted-foreground align-bottom">
                  FY {year}
                </th>
              ))}
              <th className="text-right py-4 px-6 font-semibold text-sm text-muted-foreground align-bottom">
                {title === "Income Statement" ? "5Y CAGR" : ""}
              </th>
            </tr>
            <tr className="border-b border-border/50">
              <th className="text-left py-2 px-6 text-xs text-muted-foreground align-bottom">
                In $m unless otherwise specified
              </th>
              {years.map((year) => (
                <th key={year} className="text-right py-2 px-6 text-xs text-muted-foreground align-bottom">
                  &nbsp;
                </th>
              ))}
              <th className="text-right py-2 px-6 text-xs text-muted-foreground align-bottom">
                &nbsp;
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.map((row, index) => {
              const startValue = row[years[0]];
              const endValue = row[years[years.length - 1]];
              const yearsCount = years.length - 1;
              
              let growthValue;
              let growthIndicator;
              
              if (title === "Income Statement" && row.isImportant) {
                const cagr = calculateCAGR(startValue, endValue, yearsCount);
                growthValue = cagr;
                growthIndicator = cagr >= 0 ? "positive" : "negative";
              } else {
                growthValue = null;
                growthIndicator = "neutral";
              }

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
                  {years.map((year) => (
                    <td key={year} className={cn(
                      "text-right py-3 px-6 text-sm tabular-nums",
                      row.isImportant ? "font-semibold" : "",
                      row.isItalic ? "italic" : "",
                      isEBITDA ? "text-primary" : ""
                    )}>
                      {formatMetric(row[year], row.label)}
                    </td>
                  ))}
                  <td className={cn(
                    "text-right py-3 px-6 text-sm tabular-nums font-medium",
                    row.isImportant ? "font-semibold" : "",
                    row.isItalic ? "italic" : "",
                    isEBITDA ? "text-primary" : "",
                    growthIndicator === "positive" ? "text-green-600 dark:text-green-400" : 
                    growthIndicator === "negative" ? "text-red-600 dark:text-red-400" : ""
                  )}>
                    {growthValue !== null ? `${formatPercent(growthValue)}` : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const processIncomeStatements = () => {
    console.log('Raw income statements:', incomeStatements);
    const rows = [
      {
        label: "Revenue",
        isImportant: true,
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, s.revenue])),
        unit: 'millions'
      },
      {
        label: "YoY Growth",
        isItalic: true,
        ...Object.fromEntries(years.map((year, index) => {
          if (index === 0) return [year, null];
          const currentRevenue = incomeStatements.find(s => s.calendarYear === year)?.revenue;
          const prevRevenue = incomeStatements.find(s => s.calendarYear === years[index - 1])?.revenue;
          if (!currentRevenue || !prevRevenue) return [year, null];
          return [year, ((currentRevenue - prevRevenue) / Math.abs(prevRevenue)) * 100];
        })),
        unit: 'millions'
      },
      {
        label: "Cost of Revenue",
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, -s.costOfRevenue])),
        unit: 'millions'
      },
      {
        label: "Gross Profit",
        isImportant: true,
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, s.grossProfit])),
        unit: 'millions'
      },
      {
        label: "Gross Margin %",
        isItalic: true,
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, (s.grossProfit / s.revenue) * 100])),
        unit: 'millions'
      },
      {
        label: "Research & Development",
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, -s.researchAndDevelopmentExpenses])),
        unit: 'millions'
      },
      {
        label: "SG&A Expenses",
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, -s.sellingGeneralAndAdministrativeExpenses])),
        unit: 'millions'
      },
      {
        label: "Operating Expenses",
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, -s.operatingExpenses])),
        unit: 'millions'
      },
      {
        label: "Operating Income",
        isImportant: true,
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, s.operatingIncome])),
        unit: 'millions'
      },
      {
        label: "Operating Margin %",
        isItalic: true,
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, (s.operatingIncome / s.revenue) * 100])),
        unit: 'millions'
      },
      {
        label: "Interest Income",
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, s.interestIncome])),
        unit: 'millions'
      },
      {
        label: "Interest Expense",
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, -s.interestExpense])),
        unit: 'millions'
      },
      {
        label: "Depreciation & Amortization",
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, -s.depreciationAndAmortization])),
        unit: 'millions'
      },
      {
        label: "EBITDA",
        isImportant: true,
        hasBorder: true,
        isEBITDA: true,
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, s.ebitda])),
        unit: 'millions'
      },
      {
        label: "EBITDA Margin %",
        isItalic: true,
        hasBorder: true,
        isEBITDA: true,
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, (s.ebitda / s.revenue) * 100])),
        unit: 'millions'
      },
      {
        label: "Other Income",
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, s.otherIncome])),
        unit: 'millions'
      },
      {
        label: "Income Before Tax",
        isImportant: true,
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, s.incomeBeforeTax])),
        unit: 'millions'
      },
      {
        label: "Income Tax Expense",
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, -s.incomeTaxExpense])),
        unit: 'millions'
      },
      {
        label: "Net Income",
        isImportant: true,
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, s.netIncome])),
        unit: 'millions'
      },
      {
        label: "Net Margin %",
        isItalic: true,
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, (s.netIncome / s.revenue) * 100])),
        unit: 'millions'
      },
      {
        label: "EPS",
        isImportant: true,
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, s.eps])),
        unit: 'millions'
      },
      {
        label: "EPS Diluted",
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, s.epsDiluted])),
        unit: 'millions'
      }
    ];

    return rows;
  };

  const processCashFlowStatements = () => {
    return [
      {
        label: "Net Income",
        isImportant: true,
        ...Object.fromEntries(cashFlowStatements.map(s => [s.calendarYear, s.netIncome])),
        unit: 'millions'
      },
      {
        label: "Depreciation & Amortization",
        ...Object.fromEntries(cashFlowStatements.map(s => [s.calendarYear, s.depreciationAndAmortization])),
        unit: 'millions'
      },
      {
        label: "Stock Based Compensation",
        ...Object.fromEntries(cashFlowStatements.map(s => [s.calendarYear, s.stockBasedCompensation])),
        unit: 'millions'
      },
      {
        label: "Change in Working Capital",
        ...Object.fromEntries(cashFlowStatements.map(s => [s.calendarYear, s.changeInWorkingCapital])),
        unit: 'millions'
      },
      {
        label: "Operating Cash Flow",
        isImportant: true,
        ...Object.fromEntries(cashFlowStatements.map(s => [s.calendarYear, s.operatingCashFlow])),
        unit: 'millions'
      },
      {
        label: "Capital Expenditure",
        ...Object.fromEntries(cashFlowStatements.map(s => [s.calendarYear, -s.capitalExpenditure])),
        unit: 'millions'
      },
      {
        label: "Acquisitions",
        ...Object.fromEntries(cashFlowStatements.map(s => [s.calendarYear, -s.acquisitionsNet])),
        unit: 'millions'
      },
      {
        label: "Investments",
        ...Object.fromEntries(cashFlowStatements.map(s => [s.calendarYear, -(s.purchasesOfInvestments - s.salesMaturitiesOfInvestments)])),
        unit: 'millions'
      },
      {
        label: "Investing Cash Flow",
        isImportant: true,
        ...Object.fromEntries(cashFlowStatements.map(s => [s.calendarYear, s.investingCashFlow])),
        unit: 'millions'
      },
      {
        label: "Debt Repayment",
        ...Object.fromEntries(cashFlowStatements.map(s => [s.calendarYear, -s.debtRepayment])),
        unit: 'millions'
      },
      {
        label: "Stock Issuance",
        ...Object.fromEntries(cashFlowStatements.map(s => [s.calendarYear, s.commonStockIssued])),
        unit: 'millions'
      },
      {
        label: "Stock Repurchase",
        ...Object.fromEntries(cashFlowStatements.map(s => [s.calendarYear, -s.commonStockRepurchased])),
        unit: 'millions'
      },
      {
        label: "Dividends Paid",
        ...Object.fromEntries(cashFlowStatements.map(s => [s.calendarYear, -s.dividendsPaid])),
        unit: 'millions'
      },
      {
        label: "Financing Cash Flow",
        isImportant: true,
        ...Object.fromEntries(cashFlowStatements.map(s => [s.calendarYear, s.financingCashFlow])),
        unit: 'millions'
      },
      {
        label: "Free Cash Flow",
        isImportant: true,
        ...Object.fromEntries(cashFlowStatements.map(s => [s.calendarYear, s.freeCashFlow])),
        unit: 'millions'
      },
      {
        label: "Net Cash Flow",
        isImportant: true,
        ...Object.fromEntries(cashFlowStatements.map(s => [s.calendarYear, s.netCashFlow])),
        unit: 'millions'
      }
    ];
  };

  const processBalanceSheets = () => {
    return [
      {
        label: "Total Assets",
        isImportant: true,
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, s.totalAssets])),
        unit: 'millions'
      },
      {
        label: "Current Assets",
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, s.currentAssets])),
        unit: 'millions'
      },
      {
        label: "Cash & Equivalents",
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, s.cashAndCashEquivalents])),
        unit: 'millions'
      },
      {
        label: "Short Term Investments",
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, s.shortTermInvestments])),
        unit: 'millions'
      },
      {
        label: "Net Receivables",
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, s.netReceivables])),
        unit: 'millions'
      },
      {
        label: "Inventory",
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, s.inventory])),
        unit: 'millions'
      },
      {
        label: "PP&E Net",
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, s.propertyPlantEquipmentNet])),
        unit: 'millions'
      },
      {
        label: "Goodwill",
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, s.goodwill])),
        unit: 'millions'
      },
      {
        label: "Intangible Assets",
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, s.intangibleAssets])),
        unit: 'millions'
      },
      {
        label: "Total Liabilities",
        isImportant: true,
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, -s.totalLiabilities])),
        unit: 'millions'
      },
      {
        label: "Current Liabilities",
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, -s.currentLiabilities])),
        unit: 'millions'
      },
      {
        label: "Accounts Payable",
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, -s.accountPayables])),
        unit: 'millions'
      },
      {
        label: "Short Term Debt",
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, -s.shortTermDebt])),
        unit: 'millions'
      },
      {
        label: "Long Term Debt",
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, -s.longTermDebt])),
        unit: 'millions'
      },
      {
        label: "Total Equity",
        isImportant: true,
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, s.totalStockholdersEquity])),
        unit: 'millions'
      },
      {
        label: "Retained Earnings",
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, s.retainedEarnings])),
        unit: 'millions'
      },
      {
        label: "Common Stock",
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, s.commonStock])),
        unit: 'millions'
      }
    ];
  };

  const exportToExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Process and export each statement type
    const incomeData = processIncomeStatements();
    const cashFlowData = processCashFlowStatements();
    const balanceSheetData = processBalanceSheets();
    
    // Convert data to Excel format
    const incomeSheet = XLSX.utils.json_to_sheet(incomeData);
    const cashFlowSheet = XLSX.utils.json_to_sheet(cashFlowData);
    const balanceSheet = XLSX.utils.json_to_sheet(balanceSheetData);
    
    // Add sheets to workbook
    XLSX.utils.book_append_sheet(wb, incomeSheet, "Income Statement");
    XLSX.utils.book_append_sheet(wb, cashFlowSheet, "Cash Flow");
    XLSX.utils.book_append_sheet(wb, balanceSheet, "Balance Sheet");
    
    // Generate Excel file
    XLSX.writeFile(wb, `${currentSymbol}_Financial_Statements.xlsx`);
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
            <Select defaultValue={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="ttm">TTM</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportToExcel}>
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
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
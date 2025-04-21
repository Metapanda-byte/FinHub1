"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Download } from "lucide-react";
import { useSearchStore } from "@/lib/store/search-store";
import { useIncomeStatements, useCashFlowStatements, useBalanceSheets } from "@/lib/api/financial";
import { formatFinancialNumber, getGrowthIndicator } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

export function HistoricalFinancials() {
  const [isIncomeOpen, setIsIncomeOpen] = useState(true);
  const [isCashFlowOpen, setIsCashFlowOpen] = useState(false);
  const [isBalanceSheetOpen, setIsBalanceSheetOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("annual");
  const currentSymbol = useSearchStore((state) => state.currentSymbol);

  const { statements: incomeStatements, isLoading: incomeLoading } = useIncomeStatements(currentSymbol || '');
  const { statements: cashFlowStatements, isLoading: cashFlowLoading } = useCashFlowStatements(currentSymbol || '');
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

  const years = [...new Set(incomeStatements.map(s => s.calendarYear))].sort().slice(-5);

  const renderFinancialTable = (data: any[], title: string) => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-background">
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium text-sm w-1/4">{title}</th>
              {years.map((year) => (
                <th key={year} className="text-right py-3 px-4 font-medium text-sm">
                  {year}
                </th>
              ))}
              <th className="text-right py-3 px-4 font-medium text-sm">
                YoY Growth
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const current = row[years[years.length - 1]];
              const previous = row[years[years.length - 2]];
              const growthIndicator = getGrowthIndicator(current, previous);

              return (
                <tr 
                  key={row.label} 
                  className={cn(
                    "border-b hover:bg-muted/50 transition-colors",
                    row.isImportant ? "font-medium" : ""
                  )}
                >
                  <td className="py-3 px-4 text-sm">{row.label}</td>
                  {years.map((year) => (
                    <td key={year} className="text-right py-3 px-4 text-sm">
                      {formatFinancialNumber(row[year])}
                    </td>
                  ))}
                  <td className={cn(
                    "text-right py-3 px-4 text-sm",
                    growthIndicator === "positive" ? "text-green-600 dark:text-green-400" : 
                    growthIndicator === "negative" ? "text-red-600 dark:text-red-400" : ""
                  )}>
                    {((current - previous) / Math.abs(previous) * 100).toFixed(1)}%
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
    return [
      {
        label: "Revenue",
        isImportant: true,
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, s.revenue]))
      },
      {
        label: "Cost of Revenue",
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, s.costOfRevenue]))
      },
      {
        label: "Gross Profit",
        isImportant: true,
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, s.grossProfit]))
      },
      {
        label: "Operating Expenses",
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, s.operatingExpenses]))
      },
      {
        label: "Operating Income",
        isImportant: true,
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, s.operatingIncome]))
      },
      {
        label: "Net Income",
        isImportant: true,
        ...Object.fromEntries(incomeStatements.map(s => [s.calendarYear, s.netIncome]))
      }
    ];
  };

  const processCashFlowStatements = () => {
    return [
      {
        label: "Operating Cash Flow",
        isImportant: true,
        ...Object.fromEntries(cashFlowStatements.map(s => [s.calendarYear, s.operatingCashFlow]))
      },
      {
        label: "Capital Expenditure",
        ...Object.fromEntries(cashFlowStatements.map(s => [s.calendarYear, s.capitalExpenditure]))
      },
      {
        label: "Free Cash Flow",
        isImportant: true,
        ...Object.fromEntries(cashFlowStatements.map(s => [s.calendarYear, s.freeCashFlow]))
      },
      {
        label: "Dividends Paid",
        ...Object.fromEntries(cashFlowStatements.map(s => [s.calendarYear, s.dividendsPaid]))
      }
    ];
  };

  const processBalanceSheets = () => {
    return [
      {
        label: "Total Assets",
        isImportant: true,
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, s.totalAssets]))
      },
      {
        label: "Total Liabilities",
        isImportant: true,
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, s.totalLiabilities]))
      },
      {
        label: "Total Equity",
        isImportant: true,
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, s.totalEquity]))
      },
      {
        label: "Cash & Equivalents",
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, s.cashAndCashEquivalents]))
      },
      {
        label: "Total Debt",
        ...Object.fromEntries(balanceSheets.map(s => [s.calendarYear, s.totalDebt]))
      }
    ];
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xl font-bold">Historical Financials</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
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
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Collapsible
            open={isIncomeOpen}
            onOpenChange={setIsIncomeOpen}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-4">
                  <h3 className="text-lg font-semibold">Income Statement</h3>
                  {isIncomeOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-2">
              {renderFinancialTable(processIncomeStatements(), "Income Statement")}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={isCashFlowOpen}
            onOpenChange={setIsCashFlowOpen}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-4">
                  <h3 className="text-lg font-semibold">Cash Flow Statement</h3>
                  {isCashFlowOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-2">
              {renderFinancialTable(processCashFlowStatements(), "Cash Flow Statement")}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={isBalanceSheetOpen}
            onOpenChange={setIsBalanceSheetOpen}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-4">
                  <h3 className="text-lg font-semibold">Balance Sheet</h3>
                  {isBalanceSheetOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-2">
              {renderFinancialTable(processBalanceSheets(), "Balance Sheet")}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
}
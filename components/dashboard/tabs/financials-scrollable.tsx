"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FinancialStatementTableClean } from "@/components/ui/scrollable-table-clean";
import { formatFinancialNumber } from "@/lib/utils/formatters";
import { useIncomeStatements, useBalanceSheets, useCashFlows } from "@/lib/api/financial";
import { useSearchStore } from "@/lib/store/search-store";
import { Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMediaQuery } from "@/hooks/use-media-query";

export function FinancialsScrollable() {
  const [period, setPeriod] = useState<"annual" | "quarter">("annual");
  const currentSymbol = useSearchStore((state) => state.currentSymbol);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const { statements: incomeStatements, isLoading: incomeLoading } = useIncomeStatements(
    currentSymbol || '',
    period
  );
  const { statements: balanceSheets, isLoading: balanceLoading } = useBalanceSheets(
    currentSymbol || '',
    period
  );
  const { statements: cashFlows, isLoading: cashLoading } = useCashFlows(
    currentSymbol || '',
    period
  );

  if (!currentSymbol) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Select a company to view financials</p>
      </div>
    );
  }

  // Income Statement Metrics
  const incomeMetrics = [
    { key: "revenue", label: "Revenue", format: formatFinancialNumber },
    { key: "costOfRevenue", label: "Cost of Revenue", format: formatFinancialNumber },
    { key: "grossProfit", label: "Gross Profit", format: formatFinancialNumber },
    { key: "grossProfitRatio", label: "Gross Margin %", format: (val: number) => val ? `${(val * 100).toFixed(1)}%` : "-" },
    { key: "operatingExpenses", label: "Operating Expenses", format: formatFinancialNumber },
    { key: "operatingIncome", label: "Operating Income", format: formatFinancialNumber },
    { key: "operatingIncomeRatio", label: "Operating Margin %", format: (val: number) => val ? `${(val * 100).toFixed(1)}%` : "-" },
    { key: "interestExpense", label: "Interest Expense", format: formatFinancialNumber },
    { key: "netIncome", label: "Net Income", format: formatFinancialNumber },
    { key: "netIncomeRatio", label: "Net Margin %", format: (val: number) => val ? `${(val * 100).toFixed(1)}%` : "-" },
    { key: "eps", label: "EPS", format: (val: number) => val ? `$${val.toFixed(2)}` : "-" },
    { key: "epsdiluted", label: "EPS Diluted", format: (val: number) => val ? `$${val.toFixed(2)}` : "-" },
  ];

  // Balance Sheet Metrics
  const balanceMetrics = [
    { key: "cashAndCashEquivalents", label: "Cash & Equivalents", format: formatFinancialNumber },
    { key: "shortTermInvestments", label: "Short-term Investments", format: formatFinancialNumber },
    { key: "totalCurrentAssets", label: "Total Current Assets", format: formatFinancialNumber },
    { key: "propertyPlantEquipmentNet", label: "PP&E (Net)", format: formatFinancialNumber },
    { key: "totalAssets", label: "Total Assets", format: formatFinancialNumber },
    { key: "totalCurrentLiabilities", label: "Current Liabilities", format: formatFinancialNumber },
    { key: "longTermDebt", label: "Long-term Debt", format: formatFinancialNumber },
    { key: "totalLiabilities", label: "Total Liabilities", format: formatFinancialNumber },
    { key: "totalStockholdersEquity", label: "Shareholders' Equity", format: formatFinancialNumber },
    { key: "totalDebt", label: "Total Debt", format: formatFinancialNumber },
    { key: "netDebt", label: "Net Debt", format: formatFinancialNumber },
  ];

  // Cash Flow Metrics
  const cashFlowMetrics = [
    { key: "operatingCashFlow", label: "Operating Cash Flow", format: formatFinancialNumber },
    { key: "depreciationAndAmortization", label: "D&A", format: formatFinancialNumber },
    { key: "capitalExpenditure", label: "CapEx", format: formatFinancialNumber },
    { key: "freeCashFlow", label: "Free Cash Flow", format: formatFinancialNumber },
    { key: "acquisitionsNet", label: "Acquisitions", format: formatFinancialNumber },
    { key: "debtRepayment", label: "Debt Repayment", format: formatFinancialNumber },
    { key: "commonStockRepurchased", label: "Share Buybacks", format: formatFinancialNumber },
    { key: "dividendsPaid", label: "Dividends Paid", format: formatFinancialNumber },
  ];

  // Prepare data for tables
  const prepareTableData = (statements: any[]) => {
    if (!statements || statements.length === 0) return { data: {}, periods: [] };
    
    const periods = statements.slice(0, isMobile ? 5 : 10).map(s => 
      period === "quarter" ? `${s.calendarYear} Q${s.period.replace('Q', '')}` : s.calendarYear
    );
    
    const data: Record<string, any> = {};
    statements.slice(0, isMobile ? 5 : 10).forEach((statement, idx) => {
      data[periods[idx]] = statement;
    });
    
    return { data, periods };
  };

  return (
    <div className="space-y-4 mobile-borderless">
      {/* Controls */}
      <div className="flex items-center justify-between">
        {isMobile && (
          <Alert className="flex-1 mr-2">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Swipe left to see more periods
            </AlertDescription>
          </Alert>
        )}
        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="annual">Annual</SelectItem>
            <SelectItem value="quarter">Quarterly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="balance">Balance</TabsTrigger>
          <TabsTrigger value="cash">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Income Statement</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {incomeLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <FinancialStatementTableClean
                  {...prepareTableData(incomeStatements || [])}
                  metrics={incomeMetrics}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Balance Sheet</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {balanceLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <FinancialStatementTableClean
                  {...prepareTableData(balanceSheets || [])}
                  metrics={balanceMetrics}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Statement</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {cashLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <FinancialStatementTableClean
                  {...prepareTableData(cashFlows || [])}
                  metrics={cashFlowMetrics}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
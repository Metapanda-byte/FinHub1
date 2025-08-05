"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FinancialTable } from "@/components/ui/responsive-table";
import { formatFinancialNumber } from "@/lib/utils/formatters";
import { useIncomeStatements, useBalanceSheets, useCashFlows } from "@/lib/api/financial";
import { useSearchStore } from "@/lib/store/search-store";
import { Loader2 } from "lucide-react";

export function FinancialsMobile() {
  const [period, setPeriod] = useState<"annual" | "quarter">("annual");
  const currentSymbol = useSearchStore((state) => state.currentSymbol);
  
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
        <p className="text-muted-foreground text-sm">Select a company to view financials</p>
      </div>
    );
  }

  // Income Statement Metrics
  const incomeMetrics = [
    { key: "revenue", label: "Revenue", format: formatFinancialNumber },
    { key: "grossProfit", label: "Gross Profit", format: formatFinancialNumber },
    { key: "operatingIncome", label: "Operating Income", format: formatFinancialNumber },
    { key: "netIncome", label: "Net Income", format: formatFinancialNumber },
    { key: "eps", label: "EPS", format: (val: number) => `$${val?.toFixed(2) || '0.00'}` },
  ];

  // Balance Sheet Metrics
  const balanceMetrics = [
    { key: "totalAssets", label: "Total Assets", format: formatFinancialNumber },
    { key: "totalLiabilities", label: "Total Liabilities", format: formatFinancialNumber },
    { key: "totalEquity", label: "Shareholders' Equity", format: formatFinancialNumber },
    { key: "cashAndCashEquivalents", label: "Cash & Equivalents", format: formatFinancialNumber },
    { key: "totalDebt", label: "Total Debt", format: formatFinancialNumber },
  ];

  // Cash Flow Metrics
  const cashFlowMetrics = [
    { key: "operatingCashFlow", label: "Operating Cash Flow", format: formatFinancialNumber },
    { key: "capitalExpenditure", label: "CapEx", format: formatFinancialNumber },
    { key: "freeCashFlow", label: "Free Cash Flow", format: formatFinancialNumber },
    { key: "dividendsPaid", label: "Dividends Paid", format: formatFinancialNumber },
  ];

  // Prepare data for tables
  const prepareTableData = (statements: any[]) => {
    if (!statements || statements.length === 0) return { data: {}, periods: [] };
    
    const periods = statements.slice(0, 5).map(s => 
      period === "quarter" ? s.calendarYear + " Q" + s.period.replace('Q', '') : s.calendarYear
    );
    
    const data: Record<string, any> = {};
    statements.slice(0, 5).forEach((statement, idx) => {
      data[periods[idx]] = statement;
    });
    
    return { data, periods };
  };

  return (
    <div className="space-y-4">
      {/* Period Selector */}
      <div className="flex justify-end">
        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="annual">Annual</SelectItem>
            <SelectItem value="quarter">Quarterly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-8">
          <TabsTrigger value="income" className="text-xs">Income</TabsTrigger>
          <TabsTrigger value="balance" className="text-xs">Balance</TabsTrigger>
          <TabsTrigger value="cash" className="text-xs">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="mt-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Income Statement</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {incomeLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <FinancialTable
                  {...prepareTableData(incomeStatements || [])}
                  metrics={incomeMetrics}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="mt-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Balance Sheet</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {balanceLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <FinancialTable
                  {...prepareTableData(balanceSheets || [])}
                  metrics={balanceMetrics}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash" className="mt-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cash Flow Statement</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {cashLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <FinancialTable
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
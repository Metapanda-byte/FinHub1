"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSearchStore } from "@/lib/store/search-store";
import { useIncomeStatements, useBalanceSheets, useCashFlows, useRevenueSegments, useGeographicRevenue } from "@/lib/api/financial";
import { IncomeStatementLine } from "./IncomeStatementLine";
import { formatFinancialNumber } from "@/lib/utils/formatters";
import { CrunchingNumbersCard } from "@/components/ui/crunching-numbers-loader";

interface FinancialStatementsProps {
  symbol?: string;
}

export function FinancialStatements({ symbol: propSymbol }: FinancialStatementsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'annual' | 'quarter'>('annual');
  const currentSymbol = useSearchStore((state) => state.currentSymbol);
  const symbol = propSymbol || currentSymbol || '';
  
  const { statements: incomeStatements, isLoading: incomeLoading } = useIncomeStatements(symbol);
  const { statements: balanceSheets, isLoading: balanceLoading } = useBalanceSheets(symbol);
  const { statements: cashFlows, isLoading: cashFlowLoading } = useCashFlows(symbol);
  const { segments, isLoading: segmentsLoading } = useRevenueSegments(symbol);
  const { regions, isLoading: regionsLoading } = useGeographicRevenue(symbol);

  if (incomeLoading || balanceLoading || cashFlowLoading || segmentsLoading || regionsLoading) {
    return <CrunchingNumbersCard />;
  }

  if (!incomeStatements.length || !balanceSheets.length || !cashFlows.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Financial Data Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Unable to fetch financial statements for this company.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl font-bold">Historical Financials</CardTitle>
        <div className="flex items-center gap-4">
          {/* ViewModeToggle and PeriodToggle removed as per new_code */}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Income Statement */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Income Statement</h3>
          <div className="overflow-x-auto">
            <table className="w-full financial-table">
              <thead>
                <tr className="">
                  <th className="text-left py-3 px-4 font-medium text-sm">Metric</th>
                  {incomeStatements.map((statement) => (
                    <th key={statement.date} className="text-right py-3 px-4 font-medium text-sm">
                      {selectedPeriod === 'annual' ? statement.calendarYear : statement.period}
                    </th>
                  ))}
                  <th className="text-right py-3 px-4 font-medium text-sm">YoY Growth</th>
                </tr>
              </thead>
              <tbody>
                <IncomeStatementLine
                  label="Revenue"
                  values={incomeStatements.map(s => s.revenue)}
                  isSubtotal
                />

                {/* segments.map(segment => ( */}
                {/* Removed detailed view for segments as per new_code */}
                {/* ))} */}

                <IncomeStatementLine
                  label="Cost of Revenue"
                  values={incomeStatements.map(s => s.costOfRevenue)}
                  isExpense
                  indentLevel={1}
                />

                <IncomeStatementLine
                  label="Gross Profit"
                  values={incomeStatements.map(s => s.grossProfit)}
                  isSubtotal
                />

                {/* viewMode === 'detailed' && ( */}
                {/* Removed detailed view for R&D and SG&A as per new_code */}
                {/* ) */}

                <IncomeStatementLine
                  label="Operating Income"
                  values={incomeStatements.map(s => s.operatingIncome)}
                  isSubtotal
                />

                {/* Add EBITDA section */}
                <IncomeStatementLine
                  label="EBITDA"
                  values={incomeStatements.map(s => s.ebitda)}
                  isSubtotal
                />

                {/* viewMode === 'detailed' && ( */}
                {/* Removed detailed view for EBITDA margin and depreciation as per new_code */}
                {/* ) */}

                {/* viewMode === 'detailed' && ( */}
                {/* Removed detailed view for Interest Income and Interest Expense as per new_code */}
                {/* ) */}

                <IncomeStatementLine
                  label="Income Before Tax"
                  values={incomeStatements.map(s => s.incomeBeforeTax)}
                  isSubtotal
                />

                <IncomeStatementLine
                  label="Income Tax Expense"
                  values={incomeStatements.map(s => s.incomeTaxExpense)}
                  isExpense
                  indentLevel={1}
                />

                <IncomeStatementLine
                  label="Net Income"
                  values={incomeStatements.map(s => s.netIncome)}
                  isSubtotal
                />

                {/* viewMode === 'detailed' && ( */}
                {/* Removed detailed view for EPS as per new_code */}
                {/* ) */}
              </tbody>
            </table>
          </div>
        </section>

        {/* Balance Sheet */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Balance Sheet</h3>
          <div className="overflow-x-auto">
            <table className="w-full financial-table">
              <thead>
                <tr className="">
                  <th className="text-left py-3 px-4 font-medium text-sm">Metric</th>
                  {balanceSheets.map((statement) => (
                    <th key={statement.date} className="text-right py-3 px-4 font-medium text-sm">
                      {selectedPeriod === 'annual' ? statement.calendarYear : statement.period}
                    </th>
                  ))}
                  <th className="text-right py-3 px-4 font-medium text-sm">YoY Growth</th>
                </tr>
              </thead>
              <tbody>
                <IncomeStatementLine
                  label="Total Assets"
                  values={balanceSheets.map(s => s.totalAssets)}
                  isSubtotal
                />

                {/* viewMode === 'detailed' && ( */}
                {/* Removed detailed view for Cash & Equivalents, Short Term Investments, Net Receivables, Inventory as per new_code */}
                {/* ) */}

                <IncomeStatementLine
                  label="Total Liabilities"
                  values={balanceSheets.map(s => s.totalLiabilities)}
                  isSubtotal
                />

                {/* viewMode === 'detailed' && ( */}
                {/* Removed detailed view for Accounts Payable, Short Term Debt, Long Term Debt as per new_code */}
                {/* ) */}

                <IncomeStatementLine
                  label="Total Equity"
                  values={balanceSheets.map(s => s.totalStockholdersEquity)}
                  isSubtotal
                />
              </tbody>
            </table>
          </div>
        </section>

        {/* Cash Flow Statement */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Cash Flow Statement</h3>
          <div className="overflow-x-auto">
            <table className="w-full financial-table">
              <thead>
                <tr className="">
                  <th className="text-left py-3 px-4 font-medium text-sm">Metric</th>
                  {cashFlows.map((statement) => (
                    <th key={statement.date} className="text-right py-3 px-4 font-medium text-sm">
                      {selectedPeriod === 'annual' ? statement.calendarYear : statement.period}
                    </th>
                  ))}
                  <th className="text-right py-3 px-4 font-medium text-sm">YoY Growth</th>
                </tr>
              </thead>
              <tbody>
                <IncomeStatementLine
                  label="Operating Cash Flow"
                  values={cashFlows.map(s => s.operatingCashFlow)}
                  isSubtotal
                />

                {/* viewMode === 'detailed' && ( */}
                {/* Removed detailed view for Net Income, Depreciation & Amortization, Change in Working Capital as per new_code */}
                {/* ) */}

                <IncomeStatementLine
                  label="Capital Expenditure"
                  values={cashFlows.map(s => s.capitalExpenditure)}
                  isExpense
                />

                <IncomeStatementLine
                  label="Free Cash Flow"
                  values={cashFlows.map(s => s.freeCashFlow)}
                  isSubtotal
                />

                {/* viewMode === 'detailed' && ( */}
                {/* Removed detailed view for Dividends Paid and Share Repurchases as per new_code */}
                {/* ) */}
              </tbody>
            </table>
          </div>
        </section>

        {/* Removed detailed view for Revenue Segmentation and Geographic Revenue as per new_code */}
      </CardContent>
    </Card>
  );
}
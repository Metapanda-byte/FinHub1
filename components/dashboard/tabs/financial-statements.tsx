"use client";

import { useBalanceSheets } from "@/lib/api/financial";
import { useIncomeStatements } from "@/lib/api/financial";
import { useCashFlows } from "@/lib/api/financial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";

export function FinancialStatements() {
  const { statements: balanceSheets, loading: balanceSheetsLoading } = useBalanceSheets();
  const { statements: incomeStatements, loading: incomeStatementsLoading } = useIncomeStatements();
  const { statements: cashFlows, loading: cashFlowsLoading } = useCashFlows();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Statements</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="balance-sheet">
          <TabsList>
            <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
            <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
            <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          </TabsList>
          <TabsContent value="balance-sheet">
            {balanceSheetsLoading ? (
              <div>Loading balance sheet data...</div>
            ) : (
              <DataTable data={balanceSheets} />
            )}
          </TabsContent>
          <TabsContent value="income-statement">
            {incomeStatementsLoading ? (
              <div>Loading income statement data...</div>
            ) : (
              <DataTable data={incomeStatements} />
            )}
          </TabsContent>
          <TabsContent value="cash-flow">
            {cashFlowsLoading ? (
              <div>Loading cash flow data...</div>
            ) : (
              <DataTable data={cashFlows} />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 
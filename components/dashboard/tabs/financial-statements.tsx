"use client";

import { useBalanceSheets, useIncomeStatements, useCashFlows } from "@/lib/api/financial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrunchingNumbersCardWithHeader } from "@/components/ui/crunching-numbers-loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { useSearchStore } from "@/lib/store/search-store";

const balanceSheetColumns = [
  { header: "Date", accessorKey: "date" },
  { header: "Total Assets", accessorKey: "totalAssets" },
  { header: "Total Liabilities", accessorKey: "totalLiabilities" },
  { header: "Total Equity", accessorKey: "totalStockholdersEquity" },
];

const incomeStatementColumns = [
  { header: "Date", accessorKey: "date" },
  { header: "Revenue", accessorKey: "revenue" },
  { header: "Net Income", accessorKey: "netIncome" },
  { header: "EBITDA", accessorKey: "ebitda" },
];

const cashFlowColumns = [
  { header: "Date", accessorKey: "date" },
  { header: "Operating Cash Flow", accessorKey: "operatingCashFlow" },
  { header: "Free Cash Flow", accessorKey: "freeCashFlow" },
  { header: "Capital Expenditure", accessorKey: "capitalExpenditure" },
];

export function FinancialStatements() {
  const currentSymbol = useSearchStore((state) => state.currentSymbol);
  const symbol = currentSymbol || '';
  
  const { statements: balanceSheets, isLoading: balanceSheetsLoading } = useBalanceSheets(symbol);
  const { statements: incomeStatements, isLoading: incomeStatementsLoading } = useIncomeStatements(symbol);
  const { statements: cashFlows, isLoading: cashFlowsLoading } = useCashFlows(symbol);

  if (!currentSymbol || balanceSheetsLoading || incomeStatementsLoading || cashFlowsLoading) {
    return (
      <CrunchingNumbersCardWithHeader 
        title="Financial Statements"
        message="Crunching the numbers"
      />
    );
  }

  if (!balanceSheets?.length || !incomeStatements?.length || !cashFlows?.length) {
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
            <DataTable data={balanceSheets} columns={balanceSheetColumns} />
          </TabsContent>
          <TabsContent value="income-statement">
            <DataTable data={incomeStatements} columns={incomeStatementColumns} />
          </TabsContent>
          <TabsContent value="cash-flow">
            <DataTable data={cashFlows} columns={cashFlowColumns} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 
"use client";

import { useIncomeStatements, useBalanceSheets, useCashFlows } from "@/lib/api/financial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchStore } from "@/lib/store/search-store";
import { useEffect, useState } from "react";

// Simple test component that doesn't rely on the store
function TestHistoricalFinancials() {
  const testSymbol = "AAPL";
  
  const { statements: incomeStatements, isLoading: incomeLoading } = useIncomeStatements(testSymbol);
  const { statements: cashFlowStatements, isLoading: cashFlowLoading } = useCashFlows(testSymbol);
  const { statements: balanceSheets, isLoading: balanceSheetLoading } = useBalanceSheets(testSymbol);

  if (incomeLoading || cashFlowLoading || balanceSheetLoading) {
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

  // Simple table display
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Income Statements ({incomeStatements.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Year</th>
                  <th className="text-right">Revenue</th>
                  <th className="text-right">Net Income</th>
                  <th className="text-right">EBITDA</th>
                </tr>
              </thead>
              <tbody>
                {incomeStatements.map((statement, index) => (
                  <tr key={index}>
                    <td>{statement.calendarYear}</td>
                    <td className="text-right">${(statement.revenue / 1e9).toFixed(1)}B</td>
                    <td className="text-right">${(statement.netIncome / 1e9).toFixed(1)}B</td>
                    <td className="text-right">${(statement.ebitda / 1e9).toFixed(1)}B</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Balance Sheets ({balanceSheets.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Year</th>
                  <th className="text-right">Total Assets</th>
                  <th className="text-right">Total Liabilities</th>
                  <th className="text-right">Total Equity</th>
                </tr>
              </thead>
              <tbody>
                {balanceSheets.map((sheet, index) => (
                  <tr key={index}>
                    <td>{sheet.calendarYear}</td>
                    <td className="text-right">${(sheet.totalAssets / 1e9).toFixed(1)}B</td>
                    <td className="text-right">${(sheet.totalLiabilities / 1e9).toFixed(1)}B</td>
                    <td className="text-right">${(sheet.totalStockholdersEquity / 1e9).toFixed(1)}B</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cash Flows ({cashFlowStatements.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Year</th>
                  <th className="text-right">Operating Cash Flow</th>
                  <th className="text-right">Free Cash Flow</th>
                  <th className="text-right">Capital Expenditure</th>
                </tr>
              </thead>
              <tbody>
                {cashFlowStatements.map((flow, index) => (
                  <tr key={index}>
                    <td>{flow.calendarYear}</td>
                    <td className="text-right">${(flow.operatingCashFlow / 1e9).toFixed(1)}B</td>
                    <td className="text-right">${(flow.freeCashFlow / 1e9).toFixed(1)}B</td>
                    <td className="text-right">${(flow.capitalExpenditure / 1e9).toFixed(1)}B</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TestFinancialsPage() {
  const apiKey = process.env.NEXT_PUBLIC_FMP_API_KEY;
  const { setCurrentSymbol, currentSymbol } = useSearchStore();
  const [testSymbol, setTestSymbol] = useState("AAPL");
  
  // Set the current symbol for testing
  useEffect(() => {
    console.log('[TEST] Setting current symbol to:', testSymbol);
    setCurrentSymbol(testSymbol);
  }, [setCurrentSymbol, testSymbol]);

  // Force update the current symbol when testSymbol changes
  useEffect(() => {
    if (currentSymbol !== testSymbol) {
      console.log('[TEST] Force updating current symbol from', currentSymbol, 'to', testSymbol);
      setCurrentSymbol(testSymbol);
    }
  }, [currentSymbol, testSymbol, setCurrentSymbol]);
  
  const { statements: incomeStatements, isLoading: incomeLoading, error: incomeError } = useIncomeStatements(testSymbol);
  const { statements: balanceSheets, isLoading: balanceLoading, error: balanceError } = useBalanceSheets(testSymbol);
  const { statements: cashFlows, isLoading: cashFlowLoading, error: cashFlowError } = useCashFlows(testSymbol);

  // Debug logging
  useEffect(() => {
    console.log('[TEST] Current symbol in store:', currentSymbol);
    console.log('[TEST] Test symbol:', testSymbol);
    console.log('[TEST] Income statements count:', incomeStatements?.length);
    console.log('[TEST] Balance sheets count:', balanceSheets?.length);
    console.log('[TEST] Cash flows count:', cashFlows?.length);
  }, [currentSymbol, testSymbol, incomeStatements, balanceSheets, cashFlows]);

  const handleSymbolChange = (symbol: string) => {
    setTestSymbol(symbol);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Financial Data Test</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>API Key:</strong> {apiKey ? "Configured" : "Not configured"}</p>
          <p><strong>Test Symbol:</strong> {testSymbol}</p>
          <p><strong>Current Symbol in Store:</strong> {currentSymbol || "None"}</p>
          <div className="mt-4 space-x-2">
            <Button onClick={() => handleSymbolChange("AAPL")} variant="outline">Test AAPL</Button>
            <Button onClick={() => handleSymbolChange("MSFT")} variant="outline">Test MSFT</Button>
            <Button onClick={() => handleSymbolChange("GOOGL")} variant="outline">Test GOOGL</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Raw API Data Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold">Income Statements</h4>
            {incomeLoading ? (
              <p>Loading income statements...</p>
            ) : incomeError ? (
              <p className="text-red-500">Error: {incomeError.message}</p>
            ) : (
              <div>
                <p><strong>Count:</strong> {incomeStatements?.length || 0}</p>
                {incomeStatements && incomeStatements.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Sample: {incomeStatements[0].calendarYear} - Revenue: ${(incomeStatements[0].revenue / 1e9).toFixed(1)}B</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold">Balance Sheets</h4>
            {balanceLoading ? (
              <p>Loading balance sheets...</p>
            ) : balanceError ? (
              <p className="text-red-500">Error: {balanceError.message}</p>
            ) : (
              <div>
                <p><strong>Count:</strong> {balanceSheets?.length || 0}</p>
                {balanceSheets && balanceSheets.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Sample: {balanceSheets[0].calendarYear} - Total Assets: ${(balanceSheets[0].totalAssets / 1e9).toFixed(1)}B</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold">Cash Flows</h4>
            {cashFlowLoading ? (
              <p>Loading cash flows...</p>
            ) : cashFlowError ? (
              <p className="text-red-500">Error: {cashFlowError.message}</p>
            ) : (
              <div>
                <p><strong>Count:</strong> {cashFlows?.length || 0}</p>
                {cashFlows && cashFlows.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Sample: {cashFlows[0].calendarYear} - Operating Cash Flow: ${(cashFlows[0].operatingCashFlow / 1e9).toFixed(1)}B</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Tables Test</CardTitle>
        </CardHeader>
        <CardContent>
          <TestHistoricalFinancials />
        </CardContent>
      </Card>
    </div>
  );
} 
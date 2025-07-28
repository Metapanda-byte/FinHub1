"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestSimplePage() {
  const [incomeData, setIncomeData] = useState<any>(null);
  const [balanceData, setBalanceData] = useState<any>(null);
  const [cashFlowData, setCashFlowData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiKey = process.env.NEXT_PUBLIC_FMP_API_KEY;
        const symbol = "AAPL";

        // Make direct API calls without caching
        const [incomeResponse, balanceResponse, cashFlowResponse] = await Promise.all([
          fetch(`https://financialmodelingprep.com/api/v3/income-statement/${symbol}?apikey=${apiKey}&period=annual`),
          fetch(`https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?apikey=${apiKey}&period=annual`),
          fetch(`https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?apikey=${apiKey}&period=annual`)
        ]);

        const [incomeJson, balanceJson, cashFlowJson] = await Promise.all([
          incomeResponse.json(),
          balanceResponse.json(),
          cashFlowResponse.json()
        ]);

        setIncomeData(incomeJson);
        setBalanceData(balanceJson);
        setCashFlowData(cashFlowJson);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Simple API Test</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Simple API Test</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Simple API Test</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Income Statements</CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(incomeData) ? (
            <div>
              <p><strong>Count:</strong> {incomeData.length} records</p>
              {incomeData.length > 0 && (
                <div>
                  <p><strong>Sample:</strong> {incomeData[0].calendarYear} - Revenue: ${(incomeData[0].revenue / 1e9).toFixed(1)}B</p>
                  <p><strong>Period:</strong> {incomeData[0].period}</p>
                </div>
              )}
            </div>
          ) : (
            <p>No data or invalid response</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Balance Sheets</CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(balanceData) ? (
            <div>
              <p><strong>Count:</strong> {balanceData.length} records</p>
              {balanceData.length > 0 && (
                <div>
                  <p><strong>Sample:</strong> {balanceData[0].calendarYear} - Total Assets: ${(balanceData[0].totalAssets / 1e9).toFixed(1)}B</p>
                  <p><strong>Period:</strong> {balanceData[0].period}</p>
                </div>
              )}
            </div>
          ) : (
            <p>No data or invalid response</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cash Flows</CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(cashFlowData) ? (
            <div>
              <p><strong>Count:</strong> {cashFlowData.length} records</p>
              {cashFlowData.length > 0 && (
                <div>
                  <p><strong>Sample:</strong> {cashFlowData[0].calendarYear} - Operating Cash Flow: ${(cashFlowData[0].operatingCashFlow / 1e9).toFixed(1)}B</p>
                  <p><strong>Period:</strong> {cashFlowData[0].period}</p>
                </div>
              )}
            </div>
          ) : (
            <p>No data or invalid response</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
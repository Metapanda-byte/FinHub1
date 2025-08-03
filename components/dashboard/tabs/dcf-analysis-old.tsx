"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, Calculator, DollarSign, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFinancialNumber } from "@/lib/utils/formatters";
import { useDCFAnalysis, useCompanyProfile, useIncomeStatements, useCashFlows, useBalanceSheets, CustomDCFAssumptions } from "@/lib/api/financial";
import { TableLoadingSkeleton } from "@/components/ui/loading-skeleton";

interface DCFCalculationResult {
  projectedFCF: number[];
  terminalValue: number;
  presentValueOfProjectedFCF: number;
  presentValueOfTerminalValue: number;
  enterpriseValue: number;
  equityValue: number;
  impliedSharePrice: number;
  currentStockPrice: number;
  upside: number;
  upsidePercentage: number;
}

interface DCFAnalysisProps {
  symbol: string;
}

export function DCFAnalysis({ symbol }: DCFAnalysisProps) {
  const { dcfData, isLoading: dcfLoading } = useDCFAnalysis(symbol);
  const { profile, isLoading: profileLoading } = useCompanyProfile(symbol);
  const { statements: incomeStatements, isLoading: incomeLoading } = useIncomeStatements(symbol, 'annual');
  const { statements: cashFlowStatements, isLoading: cashFlowLoading } = useCashFlows(symbol, 'annual');
  const { statements: balanceSheets, isLoading: balanceSheetLoading } = useBalanceSheets(symbol, 'annual');

  // Default assumptions based on typical investment banking practices
  const [assumptions, setAssumptions] = useState<CustomDCFAssumptions>({
    discountRate: 10.0, // WACC
    longTermGrowthRate: 2.5, // Terminal growth rate
    projectionYears: 5,
    revenueGrowthRates: [8.0, 7.0, 6.0, 5.0, 4.0], // Declining growth rates
    operatingMarginTarget: 15.0, // Target operating margin
    taxRate: 25.0, // Corporate tax rate
    capexAsPercentOfRevenue: 3.0, // Capex as % of revenue
    workingCapitalChangeAsPercentOfRevenue: 1.0, // Working capital change as % of revenue
  });

  // Reset assumptions when symbol changes or when we get new data
  useEffect(() => {
    if (dcfData && incomeStatements && cashFlowStatements) {
      const latestIncome = incomeStatements[0];
      const latestCashFlow = cashFlowStatements[0];
      
      // Calculate historical averages to set better defaults
      const historicalOperatingMargin = latestIncome.operatingIncome && latestIncome.revenue 
        ? (latestIncome.operatingIncome / latestIncome.revenue) * 100 
        : 15.0;
      
      const historicalCapexPercent = latestCashFlow.capitalExpenditure && latestIncome.revenue
        ? Math.abs(latestCashFlow.capitalExpenditure / latestIncome.revenue) * 100
        : 3.0;

      // Use DCF data if available, otherwise use calculated defaults
      setAssumptions(prev => ({
        ...prev,
        discountRate: dcfData.discountRate || 10.0,
        longTermGrowthRate: dcfData.longTermGrowthRate || 2.5,
        operatingMarginTarget: Math.max(historicalOperatingMargin, 10.0),
        capexAsPercentOfRevenue: Math.min(historicalCapexPercent, 5.0),
      }));
    }
  }, [dcfData, incomeStatements, cashFlowStatements, symbol]);

  // Calculate custom DCF based on user assumptions
  const dcfCalculation = useMemo((): DCFCalculationResult | null => {
    if (!incomeStatements || !cashFlowStatements || !balanceSheets || !profile) return null;

    const latestIncome = incomeStatements[0];
    const latestCashFlow = cashFlowStatements[0];
    const latestBalance = balanceSheets[0];

    if (!latestIncome || !latestCashFlow || !latestBalance) return null;

    const baseRevenue = latestIncome.revenue || 0;
    const currentStockPrice = profile.price || 0;
    const sharesOutstanding = profile.mktCap && currentStockPrice ? profile.mktCap / currentStockPrice : 1;

    // Project Free Cash Flows
    const projectedFCF: number[] = [];
    let projectedRevenue = baseRevenue;

    for (let year = 0; year < assumptions.projectionYears; year++) {
      const growthRate = assumptions.revenueGrowthRates[year] / 100;
      projectedRevenue = projectedRevenue * (1 + growthRate);
      
      const operatingIncome = projectedRevenue * (assumptions.operatingMarginTarget / 100);
      const taxExpense = operatingIncome * (assumptions.taxRate / 100);
      const nopat = operatingIncome - taxExpense;
      
      const capex = projectedRevenue * (assumptions.capexAsPercentOfRevenue / 100);
      const workingCapitalChange = projectedRevenue * (assumptions.workingCapitalChangeAsPercentOfRevenue / 100);
      
      // Assume depreciation is 80% of capex
      const depreciation = capex * 0.8;
      
      const fcf = nopat + depreciation - capex - workingCapitalChange;
      projectedFCF.push(fcf);
    }

    // Calculate terminal value
    const terminalFCF = projectedFCF[projectedFCF.length - 1] * (1 + assumptions.longTermGrowthRate / 100);
    const terminalValue = terminalFCF / ((assumptions.discountRate / 100) - (assumptions.longTermGrowthRate / 100));

    // Calculate present values
    const discountRate = assumptions.discountRate / 100;
    let presentValueOfProjectedFCF = 0;
    
    for (let year = 0; year < projectedFCF.length; year++) {
      presentValueOfProjectedFCF += projectedFCF[year] / Math.pow(1 + discountRate, year + 1);
    }

    const presentValueOfTerminalValue = terminalValue / Math.pow(1 + discountRate, assumptions.projectionYears);
    const enterpriseValue = presentValueOfProjectedFCF + presentValueOfTerminalValue;

    // Calculate equity value
    const totalDebt = latestBalance.totalDebt || 0;
    const cashAndCashEquivalents = latestBalance.cashAndCashEquivalents || 0;
    const netDebt = totalDebt - cashAndCashEquivalents;
    
    const equityValue = enterpriseValue - netDebt;
    const impliedSharePrice = equityValue / sharesOutstanding;

    const upside = impliedSharePrice - currentStockPrice;
    const upsidePercentage = currentStockPrice > 0 ? (upside / currentStockPrice) * 100 : 0;

    return {
      projectedFCF,
      terminalValue,
      presentValueOfProjectedFCF,
      presentValueOfTerminalValue,
      enterpriseValue,
      equityValue,
      impliedSharePrice,
      currentStockPrice,
      upside,
      upsidePercentage
    };
  }, [assumptions, incomeStatements, cashFlowStatements, balanceSheets, profile]);

  const isLoading = dcfLoading || profileLoading || incomeLoading || cashFlowLoading || balanceSheetLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              DCF Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TableLoadingSkeleton rows={8} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dcfCalculation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            DCF Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Unable to perform DCF analysis. Missing required financial data for {symbol}.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const handleAssumptionChange = (field: keyof CustomDCFAssumptions, value: number | number[]) => {
    setAssumptions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGrowthRateChange = (index: number, value: number) => {
    const newRates = [...assumptions.revenueGrowthRates];
    newRates[index] = value;
    handleAssumptionChange('revenueGrowthRates', newRates);
  };

  return (
    <div className="space-y-6">
      {/* Valuation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Valuation Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Label className="text-sm text-muted-foreground">Implied Share Price</Label>
              <div className="text-2xl font-bold text-blue-600">
                ${dcfCalculation.impliedSharePrice.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <Label className="text-sm text-muted-foreground">Current Stock Price</Label>
              <div className="text-2xl font-bold">
                ${dcfCalculation.currentStockPrice.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <Label className="text-sm text-muted-foreground">Upside / (Downside)</Label>
              <div className={cn(
                "text-2xl font-bold flex items-center justify-center gap-1",
                dcfCalculation.upside >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {dcfCalculation.upside >= 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                {dcfCalculation.upsidePercentage.toFixed(1)}%
              </div>
              <div className={cn(
                "text-sm",
                dcfCalculation.upside >= 0 ? "text-green-600" : "text-red-600"
              )}>
                (${dcfCalculation.upside.toFixed(2)})
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Enterprise Value</Label>
              <div className="font-semibold">
                {formatFinancialNumber(dcfCalculation.enterpriseValue, { decimals: 0 })}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Equity Value</Label>
              <div className="font-semibold">
                {formatFinancialNumber(dcfCalculation.equityValue, { decimals: 0 })}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">PV of FCF</Label>
              <div className="font-semibold">
                {formatFinancialNumber(dcfCalculation.presentValueOfProjectedFCF, { decimals: 0 })}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">PV of Terminal Value</Label>
              <div className="font-semibold">
                {formatFinancialNumber(dcfCalculation.presentValueOfTerminalValue, { decimals: 0 })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DCF Assumptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            DCF Assumptions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Core Assumptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="discount-rate">Discount Rate (WACC) %</Label>
              <Input
                id="discount-rate"
                type="number"
                step="0.1"
                value={assumptions.discountRate}
                onChange={(e) => handleAssumptionChange('discountRate', parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="terminal-growth">Terminal Growth Rate %</Label>
              <Input
                id="terminal-growth"
                type="number"
                step="0.1"
                value={assumptions.longTermGrowthRate}
                onChange={(e) => handleAssumptionChange('longTermGrowthRate', parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="operating-margin">Target Operating Margin %</Label>
              <Input
                id="operating-margin"
                type="number"
                step="0.1"
                value={assumptions.operatingMarginTarget}
                onChange={(e) => handleAssumptionChange('operatingMarginTarget', parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tax-rate">Tax Rate %</Label>
              <Input
                id="tax-rate"
                type="number"
                step="0.1"
                value={assumptions.taxRate}
                onChange={(e) => handleAssumptionChange('taxRate', parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          {/* Revenue Growth Assumptions */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Revenue Growth Rates by Year</Label>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {assumptions.revenueGrowthRates.map((rate, index) => (
                <div key={index}>
                  <Label htmlFor={`growth-year-${index + 1}`}>Year {index + 1} %</Label>
                  <Input
                    id={`growth-year-${index + 1}`}
                    type="number"
                    step="0.1"
                    value={rate}
                    onChange={(e) => handleGrowthRateChange(index, parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Additional Assumptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="capex-percent">Capex as % of Revenue</Label>
              <Input
                id="capex-percent"
                type="number"
                step="0.1"
                value={assumptions.capexAsPercentOfRevenue}
                onChange={(e) => handleAssumptionChange('capexAsPercentOfRevenue', parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="wc-percent">Working Capital Change as % of Revenue</Label>
              <Input
                id="wc-percent"
                type="number"
                step="0.1"
                value={assumptions.workingCapitalChangeAsPercentOfRevenue}
                onChange={(e) => handleAssumptionChange('workingCapitalChangeAsPercentOfRevenue', parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projected Free Cash Flows */}
      <Card>
        <CardHeader>
          <CardTitle>Projected Free Cash Flows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-semibold">Year</th>
                  {Array.from({ length: assumptions.projectionYears }, (_, i) => (
                    <th key={i} className="text-right py-2 px-4 font-semibold">
                      {new Date().getFullYear() + i + 1}
                    </th>
                  ))}
                  <th className="text-right py-2 px-4 font-semibold">Terminal</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4 font-medium">Free Cash Flow</td>
                  {dcfCalculation.projectedFCF.map((fcf, index) => (
                    <td key={index} className="text-right py-2 px-4 tabular-nums">
                      {formatFinancialNumber(fcf, { decimals: 0 })}
                    </td>
                  ))}
                  <td className="text-right py-2 px-4 tabular-nums font-semibold">
                    {formatFinancialNumber(dcfCalculation.terminalValue, { decimals: 0 })}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-medium">Growth Rate</td>
                  {assumptions.revenueGrowthRates.map((rate, index) => (
                    <td key={index} className="text-right py-2 px-4 tabular-nums text-muted-foreground">
                      {rate.toFixed(1)}%
                    </td>
                  ))}
                  <td className="text-right py-2 px-4 tabular-nums text-muted-foreground">
                    {assumptions.longTermGrowthRate.toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FMP DCF Comparison */}
      {dcfData && (
        <Card>
          <CardHeader>
            <CardTitle>FMP DCF Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">FMP DCF Value</Label>
                <div className="text-lg font-semibold">${dcfData.dcf?.toFixed(2) || 'N/A'}</div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Your DCF Value</Label>
                <div className="text-lg font-semibold text-blue-600">
                  ${dcfCalculation.impliedSharePrice.toFixed(2)}
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Difference</Label>
                <div className={cn(
                  "text-lg font-semibold",
                  dcfData.dcf && dcfCalculation.impliedSharePrice > dcfData.dcf ? "text-green-600" : "text-red-600"
                )}>
                  {dcfData.dcf ? 
                    `$${(dcfCalculation.impliedSharePrice - dcfData.dcf).toFixed(2)}`
                    : 'N/A'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
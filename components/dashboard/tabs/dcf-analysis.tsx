"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFinancialNumber } from "@/lib/formatters";
import { useDCFAnalysis, useCompanyProfile, useIncomeStatements, useCashFlows, useBalanceSheets, CustomDCFAssumptions } from "@/lib/api/financial";
import { TableLoadingSkeleton } from "@/components/ui/loading-skeleton";

interface DCFCalculationResult {
  projections: {
    year: number;
    revenue: number;
    revenueGrowth: number;
    operatingIncome: number;
    operatingMargin: number;
    ebit: number;
    taxes: number;
    nopat: number;
    depreciation: number;
    capex: number;
    workingCapitalChange: number;
    fcf: number;
    discountFactor: number;
    presentValueFCF: number;
  }[];
  terminalValue: number;
  presentValueOfProjectedFCF: number;
  presentValueOfTerminalValue: number;
  enterpriseValue: number;
  equityValue: number;
  impliedSharePrice: number;
  currentStockPrice: number;
  upside: number;
  upsidePercentage: number;
  wacc: number;
  netDebt: number;
  sharesOutstanding: number;
}

interface SensitivityAnalysis {
  wacc: number;
  operatingMargin: number;
  impliedPrice: number;
  isAboveCurrentPrice: boolean;
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

  // Investment banking standard assumptions
  const [assumptions, setAssumptions] = useState<CustomDCFAssumptions>({
    discountRate: 8.0, // WACC
    longTermGrowthRate: 2.5, // Terminal growth rate
    projectionYears: 5,
    revenueGrowthRates: [10.0, 8.0, 6.0, 5.0, 4.0], // Declining growth rates
    operatingMarginTarget: 20.0, // Target operating margin
    taxRate: 25.0, // Corporate tax rate
    capexAsPercentOfRevenue: 3.0, // Capex as % of revenue
    workingCapitalChangeAsPercentOfRevenue: 1.0, // Working capital change as % of revenue
  });

  // Initialize with company-specific data
  useEffect(() => {
    if (dcfData && incomeStatements && cashFlowStatements && 
        incomeStatements.length > 0 && cashFlowStatements.length > 0) {
      const latestIncome = incomeStatements[0];
      const latestCashFlow = cashFlowStatements[0];
      
      // Add null checks to prevent runtime errors
      if (latestIncome && latestCashFlow) {
        const historicalOperatingMargin = latestIncome.operatingIncome && latestIncome.revenue 
          ? (latestIncome.operatingIncome / latestIncome.revenue) * 100 
          : 20.0;
        
        const historicalCapexPercent = latestCashFlow.capitalExpenditure && latestIncome.revenue
          ? Math.abs(latestCashFlow.capitalExpenditure / latestIncome.revenue) * 100
          : 3.0;

        setAssumptions(prev => ({
          ...prev,
          discountRate: dcfData?.discountRate || 8.0,
          longTermGrowthRate: dcfData?.longTermGrowthRate || 2.5,
          operatingMarginTarget: Math.max(historicalOperatingMargin, 15.0),
          capexAsPercentOfRevenue: Math.min(historicalCapexPercent, 5.0),
        }));
      }
    }
  }, [dcfData, incomeStatements, cashFlowStatements, symbol]);

  // Enhanced DCF calculation with full line item breakdown
  const dcfCalculation = useMemo((): DCFCalculationResult | null => {
    if (!incomeStatements || !cashFlowStatements || !balanceSheets || !profile) return null;

    const latestIncome = incomeStatements[0];
    const latestCashFlow = cashFlowStatements[0];
    const latestBalance = balanceSheets[0];

    if (!latestIncome || !latestCashFlow || !latestBalance) return null;

    const baseRevenue = latestIncome.revenue || 0;
    const currentStockPrice = profile.price || 0;
    const sharesOutstanding = profile.mktCap && currentStockPrice ? profile.mktCap / currentStockPrice : 1;
    const wacc = assumptions.discountRate / 100;

    // Calculate net debt
    const totalDebt = latestBalance.totalDebt || 0;
    const cashAndCashEquivalents = latestBalance.cashAndCashEquivalents || 0;
    const netDebt = totalDebt - cashAndCashEquivalents;

    // Project detailed cash flows
    const projections = [];
    let projectedRevenue = baseRevenue;

    for (let year = 0; year < assumptions.projectionYears; year++) {
      const growthRate = assumptions.revenueGrowthRates[year] / 100;
      projectedRevenue = projectedRevenue * (1 + growthRate);
      
      const operatingIncome = projectedRevenue * (assumptions.operatingMarginTarget / 100);
      const operatingMargin = assumptions.operatingMarginTarget;
      const ebit = operatingIncome; // Simplified - assume EBIT = Operating Income
      const taxes = ebit * (assumptions.taxRate / 100);
      const nopat = ebit - taxes;
      
      const capex = projectedRevenue * (assumptions.capexAsPercentOfRevenue / 100);
      const workingCapitalChange = projectedRevenue * (assumptions.workingCapitalChangeAsPercentOfRevenue / 100);
      const depreciation = capex * 0.8; // Assume depreciation is 80% of capex
      
      const fcf = nopat + depreciation - capex - workingCapitalChange;
      const discountFactor = 1 / Math.pow(1 + wacc, year + 1);
      const presentValueFCF = fcf * discountFactor;

      projections.push({
        year: new Date().getFullYear() + year + 1,
        revenue: projectedRevenue,
        revenueGrowth: assumptions.revenueGrowthRates[year],
        operatingIncome,
        operatingMargin,
        ebit,
        taxes,
        nopat,
        depreciation,
        capex,
        workingCapitalChange,
        fcf,
        discountFactor,
        presentValueFCF
      });
    }

    // Terminal value calculation
    const terminalFCF = projections[projections.length - 1].fcf * (1 + assumptions.longTermGrowthRate / 100);
    const terminalValue = terminalFCF / (wacc - (assumptions.longTermGrowthRate / 100));
    
    const presentValueOfProjectedFCF = projections.reduce((sum, p) => sum + p.presentValueFCF, 0);
    const presentValueOfTerminalValue = terminalValue / Math.pow(1 + wacc, assumptions.projectionYears);
    const enterpriseValue = presentValueOfProjectedFCF + presentValueOfTerminalValue;
    const equityValue = enterpriseValue - netDebt;
    const impliedSharePrice = equityValue / sharesOutstanding;

    const upside = impliedSharePrice - currentStockPrice;
    const upsidePercentage = currentStockPrice > 0 ? (upside / currentStockPrice) * 100 : 0;

    return {
      projections,
      terminalValue,
      presentValueOfProjectedFCF,
      presentValueOfTerminalValue,
      enterpriseValue,
      equityValue,
      impliedSharePrice,
      currentStockPrice,
      upside,
      upsidePercentage,
      wacc: assumptions.discountRate,
      netDebt,
      sharesOutstanding
    };
  }, [assumptions, incomeStatements, cashFlowStatements, balanceSheets, profile]);

  // Sensitivity analysis
  const sensitivityAnalysis = useMemo((): SensitivityAnalysis[][] => {
    if (!dcfCalculation) return [];

    const waccRange: number[] = [];
    const marginRange: number[] = [];
    
    // WACC from 6% to 10% in 0.5% increments
    for (let w = 6.0; w <= 10.0; w += 0.5) {
      waccRange.push(w);
    }
    
    // Operating margin from 10% to 50% in 5% increments
    for (let m = 10.0; m <= 50.0; m += 5.0) {
      marginRange.push(m);
    }

    const sensitivityData: SensitivityAnalysis[][] = [];

    waccRange.forEach(wacc => {
      const row: SensitivityAnalysis[] = [];
      marginRange.forEach(margin => {
        // Recalculate with sensitivity parameters
        const tempAssumptions = { ...assumptions, discountRate: wacc, operatingMarginTarget: margin };
        const baseRevenue = incomeStatements?.[0]?.revenue || 0;
        let projectedRevenue = baseRevenue;
        const projectedFCFs = [];

        for (let year = 0; year < tempAssumptions.projectionYears; year++) {
          const growthRate = tempAssumptions.revenueGrowthRates[year] / 100;
          projectedRevenue = projectedRevenue * (1 + growthRate);
          
          const operatingIncome = projectedRevenue * (margin / 100);
          const taxes = operatingIncome * (tempAssumptions.taxRate / 100);
          const nopat = operatingIncome - taxes;
          
          const capex = projectedRevenue * (tempAssumptions.capexAsPercentOfRevenue / 100);
          const workingCapitalChange = projectedRevenue * (tempAssumptions.workingCapitalChangeAsPercentOfRevenue / 100);
          const depreciation = capex * 0.8;
          
          const fcf = nopat + depreciation - capex - workingCapitalChange;
          projectedFCFs.push(fcf);
        }

        const terminalFCF = projectedFCFs[projectedFCFs.length - 1] * (1 + tempAssumptions.longTermGrowthRate / 100);
        const terminalValue = terminalFCF / ((wacc / 100) - (tempAssumptions.longTermGrowthRate / 100));
        
        const waccDecimal = wacc / 100;
        let presentValueOfProjectedFCF = 0;
        
        for (let year = 0; year < projectedFCFs.length; year++) {
          presentValueOfProjectedFCF += projectedFCFs[year] / Math.pow(1 + waccDecimal, year + 1);
        }

        const presentValueOfTerminalValue = terminalValue / Math.pow(1 + waccDecimal, tempAssumptions.projectionYears);
        const enterpriseValue = presentValueOfProjectedFCF + presentValueOfTerminalValue;
        const equityValue = enterpriseValue - dcfCalculation.netDebt;
        const impliedPrice = equityValue / dcfCalculation.sharesOutstanding;

        row.push({
          wacc,
          operatingMargin: margin,
          impliedPrice,
          isAboveCurrentPrice: impliedPrice > dcfCalculation.currentStockPrice
        });
      });
      sensitivityData.push(row);
    });

    return sensitivityData;
  }, [dcfCalculation, assumptions, incomeStatements]);

  // Terminal Growth sensitivity analysis
  const terminalGrowthSensitivityAnalysis = useMemo((): SensitivityAnalysis[][] => {
    if (!dcfCalculation) return [];

    const waccRange: number[] = [];
    const terminalGrowthRange: number[] = [];
    
    // WACC from 6% to 10% in 0.5% increments
    for (let w = 6.0; w <= 10.0; w += 0.5) {
      waccRange.push(w);
    }
    
    // Terminal growth from 0% to 4% in 0.5% increments
    for (let g = 0.0; g <= 4.0; g += 0.5) {
      terminalGrowthRange.push(g);
    }

    const sensitivityData: SensitivityAnalysis[][] = [];

    waccRange.forEach(wacc => {
      const row: SensitivityAnalysis[] = [];
      terminalGrowthRange.forEach(terminalGrowth => {
        // Recalculate with sensitivity parameters
        const tempAssumptions = { ...assumptions, discountRate: wacc, longTermGrowthRate: terminalGrowth };
        const baseRevenue = incomeStatements?.[0]?.revenue || 0;
        let projectedRevenue = baseRevenue;
        const projectedFCFs = [];

        for (let year = 0; year < tempAssumptions.projectionYears; year++) {
          const growthRate = tempAssumptions.revenueGrowthRates[year] / 100;
          projectedRevenue = projectedRevenue * (1 + growthRate);
          
          const operatingIncome = projectedRevenue * (tempAssumptions.operatingMarginTarget / 100);
          const taxes = operatingIncome * (tempAssumptions.taxRate / 100);
          const nopat = operatingIncome - taxes;
          
          const capex = projectedRevenue * (tempAssumptions.capexAsPercentOfRevenue / 100);
          const workingCapitalChange = projectedRevenue * (tempAssumptions.workingCapitalChangeAsPercentOfRevenue / 100);
          const depreciation = capex * 0.8;
          
          const fcf = nopat + depreciation - capex - workingCapitalChange;
          projectedFCFs.push(fcf);
        }

        const terminalFCF = projectedFCFs[projectedFCFs.length - 1] * (1 + terminalGrowth / 100);
        const terminalValue = terminalFCF / ((wacc / 100) - (terminalGrowth / 100));
        
        const waccDecimal = wacc / 100;
        let presentValueOfProjectedFCF = 0;
        
        for (let year = 0; year < projectedFCFs.length; year++) {
          presentValueOfProjectedFCF += projectedFCFs[year] / Math.pow(1 + waccDecimal, year + 1);
        }

        const presentValueOfTerminalValue = terminalValue / Math.pow(1 + waccDecimal, tempAssumptions.projectionYears);
        const enterpriseValue = presentValueOfProjectedFCF + presentValueOfTerminalValue;
        const equityValue = enterpriseValue - dcfCalculation.netDebt;
        const impliedPrice = equityValue / dcfCalculation.sharesOutstanding;

        row.push({
          wacc,
          operatingMargin: terminalGrowth, // Reusing the field to store terminal growth
          impliedPrice,
          isAboveCurrentPrice: impliedPrice > dcfCalculation.currentStockPrice
        });
      });
      sensitivityData.push(row);
    });

    return sensitivityData;
  }, [dcfCalculation, assumptions, incomeStatements]);

  const isLoading = dcfLoading || profileLoading || incomeLoading || cashFlowLoading || balanceSheetLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              DCF Analysis - Investment Banking Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TableLoadingSkeleton rows={12} />
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
            DCF Analysis - Investment Banking Model
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

      {/* Model Inputs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Model Inputs & Assumptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Core Assumptions */}
            <div className="lg:col-span-3">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-semibold text-slate-700 dark:text-slate-300 pb-2 w-40">Assumption</th>
                      <th className="text-center text-xs font-semibold text-slate-700 dark:text-slate-300 pb-2 w-20">Value</th>
                      <th className="text-left text-xs font-semibold text-slate-700 dark:text-slate-300 pb-2 w-40">Assumption</th>
                      <th className="text-center text-xs font-semibold text-slate-700 dark:text-slate-300 pb-2 w-20">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-1.5 text-xs text-slate-600 dark:text-slate-400">WACC (%)</td>
                      <td className="py-1.5 text-center">
                        <Input
                          type="number"
                          step="0.1"
                          value={assumptions.discountRate}
                          onChange={(e) => handleAssumptionChange('discountRate', parseFloat(e.target.value) || 0)}
                          className="h-6 text-xs text-center border-slate-200 dark:border-slate-700 focus:border-blue-500 w-16 mx-auto"
                        />
                      </td>
                      <td className="py-1.5 text-xs text-slate-600 dark:text-slate-400">Terminal Growth (%)</td>
                      <td className="py-1.5 text-center">
                        <Input
                          type="number"
                          step="0.1"
                          value={assumptions.longTermGrowthRate}
                          onChange={(e) => handleAssumptionChange('longTermGrowthRate', parseFloat(e.target.value) || 0)}
                          className="h-6 text-xs text-center border-slate-200 dark:border-slate-700 focus:border-blue-500 w-16 mx-auto"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-1.5 text-xs text-slate-600 dark:text-slate-400">Target Op. Margin (%)</td>
                      <td className="py-1.5 text-center">
                        <Input
                          type="number"
                          step="0.1"
                          value={assumptions.operatingMarginTarget}
                          onChange={(e) => handleAssumptionChange('operatingMarginTarget', parseFloat(e.target.value) || 0)}
                          className="h-6 text-xs text-center border-slate-200 dark:border-slate-700 focus:border-blue-500 w-16 mx-auto"
                        />
                      </td>
                      <td className="py-1.5 text-xs text-slate-600 dark:text-slate-400">Tax Rate (%)</td>
                      <td className="py-1.5 text-center">
                        <Input
                          type="number"
                          step="0.1"
                          value={assumptions.taxRate}
                          onChange={(e) => handleAssumptionChange('taxRate', parseFloat(e.target.value) || 0)}
                          className="h-6 text-xs text-center border-slate-200 dark:border-slate-700 focus:border-blue-500 w-16 mx-auto"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-1.5 text-xs text-slate-600 dark:text-slate-400">Capex/Revenue (%)</td>
                      <td className="py-1.5 text-center">
                        <Input
                          type="number"
                          step="0.1"
                          value={assumptions.capexAsPercentOfRevenue}
                          onChange={(e) => handleAssumptionChange('capexAsPercentOfRevenue', parseFloat(e.target.value) || 0)}
                          className="h-6 text-xs text-center border-slate-200 dark:border-slate-700 focus:border-blue-500 w-16 mx-auto"
                        />
                      </td>
                      <td className="py-1.5 text-xs text-slate-600 dark:text-slate-400">WC Change/Rev (%)</td>
                      <td className="py-1.5 text-center">
                        <Input
                          type="number"
                          step="0.1"
                          value={assumptions.workingCapitalChangeAsPercentOfRevenue}
                          onChange={(e) => handleAssumptionChange('workingCapitalChangeAsPercentOfRevenue', parseFloat(e.target.value) || 0)}
                          className="h-6 text-xs text-center border-slate-200 dark:border-slate-700 focus:border-blue-500 w-16 mx-auto"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Revenue Growth - Vertical */}
            <div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-semibold text-slate-700 dark:text-slate-300 pb-2">Year</th>
                      <th className="text-center text-xs font-semibold text-slate-700 dark:text-slate-300 pb-2">Growth (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assumptions.revenueGrowthRates.map((rate, index) => (
                      <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-1.5 text-xs text-slate-600 dark:text-slate-400">Year {index + 1}</td>
                        <td className="py-1.5 text-center">
                          <Input
                            type="number"
                            step="0.1"
                            value={rate}
                            onChange={(e) => handleGrowthRateChange(index, parseFloat(e.target.value) || 0)}
                            className="h-6 text-xs text-center border-slate-200 dark:border-slate-700 focus:border-blue-500 w-16 mx-auto"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Model - Excel Style */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Free Cash Flow Projections</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full financial-table">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/90 backdrop-blur">
                <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 sticky left-0 z-30 bg-slate-50 dark:bg-slate-900/90">($M)</th>
                  {dcfCalculation.projections.map((proj) => (
                    <th key={proj.year} className="text-center py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[80px]">
                      {proj.year}E
                    </th>
                  ))}
                  <th className="text-center py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200">Terminal</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-950">
                {/* Revenue Section */}
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 sticky left-0 z-20 bg-blue-25 dark:bg-blue-900/20">Revenue</td>
                  {dcfCalculation.projections.map((proj, index) => (
                    <td key={index} className="text-center py-2 px-3 text-xs md:text-sm tabular-nums">
                      {formatFinancialNumber(proj.revenue, { decimals: 0 })}
                    </td>
                  ))}
                  <td className="text-center py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 pl-8 text-xs md:text-sm text-slate-500 dark:text-slate-400 sticky left-0 z-20 bg-white dark:bg-slate-950">Revenue Growth</td>
                  {dcfCalculation.projections.map((proj, index) => (
                    <td key={index} className="text-center py-2 px-3 text-xs md:text-sm tabular-nums text-slate-500 dark:text-slate-400">
                      {proj.revenueGrowth.toFixed(1)}%
                    </td>
                  ))}
                  <td className="text-center py-2 px-3 text-xs md:text-sm tabular-nums text-slate-500 dark:text-slate-400">
                    {assumptions.longTermGrowthRate.toFixed(1)}%
                  </td>
                </tr>

                {/* Operating Section */}
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 sticky left-0 z-20 bg-white dark:bg-slate-950">Operating Income (EBIT)</td>
                  {dcfCalculation.projections.map((proj, index) => (
                    <td key={index} className="text-center py-2 px-3 text-xs md:text-sm tabular-nums">
                      {formatFinancialNumber(proj.ebit, { decimals: 0 })}
                    </td>
                  ))}
                  <td className="text-center py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 pl-8 text-xs md:text-sm text-slate-500 dark:text-slate-400 sticky left-0 z-20 bg-white dark:bg-slate-950">Operating Margin</td>
                  {dcfCalculation.projections.map((proj, index) => (
                    <td key={index} className="text-center py-2 px-3 text-xs md:text-sm tabular-nums text-slate-500 dark:text-slate-400">
                      {proj.operatingMargin.toFixed(1)}%
                    </td>
                  ))}
                  <td className="text-center py-2 px-3 text-xs md:text-sm tabular-nums text-slate-500 dark:text-slate-400">
                    {assumptions.operatingMarginTarget.toFixed(1)}%
                  </td>
                </tr>

                {/* Tax Section */}
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 sticky left-0 z-20 bg-white dark:bg-slate-950">Less: Taxes</td>
                  {dcfCalculation.projections.map((proj, index) => (
                    <td key={index} className="text-center py-2 px-3 text-xs md:text-sm tabular-nums">
                      ({formatFinancialNumber(proj.taxes, { decimals: 0 })})
                    </td>
                  ))}
                  <td className="text-center py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-yellow-25 dark:bg-yellow-900/20">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 sticky left-0 z-20 bg-yellow-25 dark:bg-yellow-900/20">NOPAT</td>
                  {dcfCalculation.projections.map((proj, index) => (
                    <td key={index} className="text-center py-2 px-3 text-xs md:text-sm tabular-nums font-semibold">
                      {formatFinancialNumber(proj.nopat, { decimals: 0 })}
                    </td>
                  ))}
                  <td className="text-center py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                </tr>

                {/* Cash Flow Adjustments */}
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 sticky left-0 z-20 bg-white dark:bg-slate-950">Add: Depreciation</td>
                  {dcfCalculation.projections.map((proj, index) => (
                    <td key={index} className="text-center py-2 px-3 text-xs md:text-sm tabular-nums">
                      {formatFinancialNumber(proj.depreciation, { decimals: 0 })}
                    </td>
                  ))}
                  <td className="text-center py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 sticky left-0 z-20 bg-white dark:bg-slate-950">Less: Capex</td>
                  {dcfCalculation.projections.map((proj, index) => (
                    <td key={index} className="text-center py-2 px-3 text-xs md:text-sm tabular-nums">
                      ({formatFinancialNumber(proj.capex, { decimals: 0 })})
                    </td>
                  ))}
                  <td className="text-center py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 sticky left-0 z-20 bg-white dark:bg-slate-950">Less: Δ Working Capital</td>
                  {dcfCalculation.projections.map((proj, index) => (
                    <td key={index} className="text-center py-2 px-3 text-xs md:text-sm tabular-nums">
                      ({formatFinancialNumber(proj.workingCapitalChange, { decimals: 0 })})
                    </td>
                  ))}
                  <td className="text-center py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                </tr>

                {/* Free Cash Flow */}
                <tr className="border-b-2 border-slate-300 dark:border-slate-600">
                  <td className="py-3 px-4 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 sticky left-0 z-20 bg-green-25 dark:bg-green-900/20">Unlevered Free Cash Flow</td>
                  {dcfCalculation.projections.map((proj, index) => (
                    <td key={index} className="text-center py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                      {formatFinancialNumber(proj.fcf, { decimals: 0 })}
                    </td>
                  ))}
                  <td className="text-center py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                    {formatFinancialNumber(dcfCalculation.terminalValue, { decimals: 0 })}
                  </td>
                </tr>

                {/* Valuation */}
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm text-slate-500 dark:text-slate-400 sticky left-0 z-20 bg-white dark:bg-slate-950">Discount Factor</td>
                  {dcfCalculation.projections.map((proj, index) => (
                    <td key={index} className="text-center py-2 px-3 text-xs md:text-sm tabular-nums text-slate-500 dark:text-slate-400">
                      {proj.discountFactor.toFixed(3)}
                    </td>
                  ))}
                  <td className="text-center py-2 px-3 text-xs md:text-sm tabular-nums text-slate-500 dark:text-slate-400">
                    {(1 / Math.pow(1 + dcfCalculation.wacc / 100, assumptions.projectionYears)).toFixed(3)}
                  </td>
                </tr>
                <tr className="border-b-2 border-slate-300 dark:border-slate-600">
                  <td className="py-3 px-4 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 sticky left-0 z-20 bg-blue-25 dark:bg-blue-900/20">Present Value</td>
                  {dcfCalculation.projections.map((proj, index) => (
                    <td key={index} className="text-center py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                      {formatFinancialNumber(proj.presentValueFCF, { decimals: 0 })}
                    </td>
                  ))}
                  <td className="text-center py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                    {formatFinancialNumber(dcfCalculation.presentValueOfTerminalValue, { decimals: 0 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </CardContent>
      </Card>

      {/* Valuation Summary & Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Valuation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full">
                <tbody className="bg-white dark:bg-slate-950">
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 px-3 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">PV of Projection Period FCF</td>
                    <td className="py-2 px-3 text-right text-xs md:text-sm tabular-nums">{formatFinancialNumber(dcfCalculation.presentValueOfProjectedFCF, { decimals: 0 })}</td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 px-3 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">PV of Terminal Value</td>
                    <td className="py-2 px-3 text-right text-xs md:text-sm tabular-nums">{formatFinancialNumber(dcfCalculation.presentValueOfTerminalValue, { decimals: 0 })}</td>
                  </tr>
                  <tr className="border-b-2 border-slate-300 dark:border-slate-600">
                    <td className="py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200">Enterprise Value</td>
                    <td className="py-3 px-3 text-right text-xs md:text-sm tabular-nums font-bold">{formatFinancialNumber(dcfCalculation.enterpriseValue, { decimals: 0 })}</td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 px-3 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">Less: Net Debt</td>
                    <td className="py-2 px-3 text-right text-xs md:text-sm tabular-nums">({formatFinancialNumber(dcfCalculation.netDebt, { decimals: 0 })})</td>
                  </tr>
                  <tr className="border-b-2 border-slate-300 dark:border-slate-600">
                    <td className="py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200">Equity Value</td>
                    <td className="py-3 px-3 text-right text-xs md:text-sm tabular-nums font-bold">{formatFinancialNumber(dcfCalculation.equityValue, { decimals: 0 })}</td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 px-3 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">Shares Outstanding (M)</td>
                    <td className="py-2 px-3 text-right text-xs md:text-sm tabular-nums">{(dcfCalculation.sharesOutstanding / 1000000).toFixed(1)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-sm md:text-base font-bold text-slate-800 dark:text-slate-200">Implied Share Price</td>
                    <td className="py-3 px-3 text-right text-sm md:text-base tabular-nums font-bold">${dcfCalculation.impliedSharePrice.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full">
                <tbody className="bg-white dark:bg-slate-950">
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 px-3 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">WACC</td>
                    <td className="py-2 px-3 text-right text-xs md:text-sm tabular-nums">{dcfCalculation.wacc.toFixed(1)}%</td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 px-3 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">Terminal Growth Rate</td>
                    <td className="py-2 px-3 text-right text-xs md:text-sm tabular-nums">{assumptions.longTermGrowthRate.toFixed(1)}%</td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 px-3 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">Terminal Value % of EV</td>
                    <td className="py-2 px-3 text-right text-xs md:text-sm tabular-nums">
                      {((dcfCalculation.presentValueOfTerminalValue / dcfCalculation.enterpriseValue) * 100).toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 px-3 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">Current Stock Price</td>
                    <td className="py-2 px-3 text-right text-xs md:text-sm tabular-nums">${dcfCalculation.currentStockPrice.toFixed(2)}</td>
                  </tr>
                  <tr className={cn(
                    dcfCalculation.upside >= 0 ? "bg-green-25 dark:bg-green-900/20" : "bg-red-25 dark:bg-red-900/20"
                  )}>
                    <td className="py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200">Upside/(Downside)</td>
                    <td className={cn(
                      "py-3 px-3 text-right text-xs md:text-sm tabular-nums font-bold",
                      dcfCalculation.upside >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {dcfCalculation.upsidePercentage.toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sensitivity Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Sensitivity Analysis - Implied Share Price</CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400">WACC vs. Target Operating Margin</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full financial-table">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/90 backdrop-blur">
                <tr>
                  <th className="text-left py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 sticky left-0 z-30 bg-slate-50 dark:bg-slate-900/90">Op. Margin →<br/>WACC ↓</th>
                  {[10, 15, 20, 25, 30, 35, 40, 45, 50].map(margin => (
                    <th key={margin} className="text-center py-3 px-2 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 min-w-[65px]">
                      {margin}%
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-950">
                {sensitivityAnalysis.map((row, rowIndex) => {
                  const wacc = 6.0 + (rowIndex * 0.5);
                  return (
                    <tr key={rowIndex}>
                      <td className="py-2 px-3 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-center sticky left-0 z-20 bg-slate-50 dark:bg-slate-900/90">
                        {wacc.toFixed(1)}%
                      </td>
                      {row.map((cell, colIndex) => {
                        // Check if this is the base case (current model assumptions)
                        const currentWacc = wacc;
                        const currentMargin = [10, 15, 20, 25, 30, 35, 40, 45, 50][colIndex];
                        const isBaseCase = Math.abs(currentWacc - assumptions.discountRate) < 0.25 && 
                                          Math.abs(currentMargin - assumptions.operatingMarginTarget) < 2.5;

                        return (
                          <td 
                            key={colIndex} 
                            className={`py-2 px-2 text-center text-xs md:text-sm tabular-nums font-medium ${
                              isBaseCase 
                                ? 'border-4 border-blue-600 dark:border-blue-400 font-bold' 
                                : 'border border-slate-200 dark:border-slate-700'
                            } ${cell.isAboveCurrentPrice ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                          >
                            ${cell.impliedPrice.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 flex items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded"></div>
              <span>Above Current Price (${dcfCalculation.currentStockPrice.toFixed(2)})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded"></div>
              <span>Below Current Price</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terminal Growth Sensitivity Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Sensitivity Analysis - Implied Share Price</CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400">WACC vs. Terminal Growth Rate</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full financial-table">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/90 backdrop-blur">
                <tr>
                  <th className="text-left py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 sticky left-0 z-30 bg-slate-50 dark:bg-slate-900/90">Terminal Growth →<br/>WACC ↓</th>
                  {[0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0].map(growth => (
                    <th key={growth} className="text-center py-3 px-2 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 min-w-[65px]">
                      {growth.toFixed(1)}%
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-950">
                {terminalGrowthSensitivityAnalysis.map((row, rowIndex) => {
                  const wacc = 6.0 + (rowIndex * 0.5);
                  return (
                    <tr key={rowIndex}>
                      <td className="py-2 px-3 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-center sticky left-0 z-20 bg-slate-50 dark:bg-slate-900/90">
                        {wacc.toFixed(1)}%
                      </td>
                      {row.map((cell, colIndex) => {
                        // Check if this is the base case (current model assumptions)
                        const currentWacc = wacc;
                        const currentTerminalGrowth = [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0][colIndex];
                        const isBaseCase = Math.abs(currentWacc - assumptions.discountRate) < 0.25 && 
                                          Math.abs(currentTerminalGrowth - assumptions.longTermGrowthRate) < 0.25;

                        return (
                          <td 
                            key={colIndex} 
                            className={`py-2 px-2 text-center text-xs md:text-sm tabular-nums font-medium ${
                              isBaseCase 
                                ? 'border-4 border-blue-600 dark:border-blue-400 font-bold' 
                                : 'border border-slate-200 dark:border-slate-700'
                            } ${cell.isAboveCurrentPrice ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                          >
                            ${cell.impliedPrice.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 flex items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded"></div>
              <span>Above Current Price (${dcfCalculation.currentStockPrice.toFixed(2)})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded"></div>
              <span>Below Current Price</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
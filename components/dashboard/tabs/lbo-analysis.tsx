"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, Calculator, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFinancialNumber } from "@/lib/utils/formatters";
import { useCompanyProfile, useIncomeStatements, useCashFlows, useBalanceSheets } from "@/lib/api/financial";
import { TableLoadingSkeleton } from "@/components/ui/loading-skeleton";

interface LBOAssumptions {
  // Transaction Assumptions
  entryMultiple: number;
  exitMultiple: number;
  holdingPeriod: number;
  transactionFees: number; // % of transaction value
  
  // Operating Assumptions
  revenueGrowthRates: number[];
  ebitdaMarginTarget: number;
  taxRate: number;
  capexAsPercentOfRevenue: number;
  workingCapitalChangeAsPercentOfRevenue: number;
  
  // Financing Structure
  totalLeverage: number; // Total Debt / EBITDA
  seniorDebtMultiple: number; // Senior Debt / EBITDA
  subordinatedDebtMultiple: number; // Sub Debt / EBITDA
  seniorDebtRate: number;
  subordinatedDebtRate: number;
  revolvingCreditRate: number;
  revolvingCreditSize: number; // $ millions
  
  // Debt Terms
  seniorDebtAmortization: number; // % annually
  subordinatedDebtAmortization: number; // % annually
  cashSweepRate: number; // % of excess cash to debt paydown
}

interface LBOProjection {
  year: number;
  revenue: number;
  revenueGrowth: number;
  ebitda: number;
  ebitdaMargin: number;
  depreciation: number;
  ebit: number;
  interest: number;
  ebt: number;
  taxes: number;
  netIncome: number;
  capex: number;
  workingCapitalChange: number;
  fcf: number;
  // Debt service details
  seniorInterest: number;
  subordinatedInterest: number;
  revolvingInterest: number;
  mandatoryAmortization: number;
  cashSweep: number;
  totalDebtService: number;
  // Cash flow to equity
  cashAvailableForDebtService: number;
  cashFlowToEquity: number;
  beginningCash: number;
  endingCash: number;
  dividendPayment: number;
  // Debt balances
  seniorDebt: number;
  subordinatedDebt: number;
  totalDebt: number;
  netDebt: number;
  cash: number;
  // Credit metrics
  leverageRatio: number;
  interestCoverage: number;
}

interface LBOCalculationResult {
  entryValuation: {
    currentSharePrice: number;
    entryMultiple: number;
    impliedSharePrice: number;
    impliedPremium: number;
    entryEbitda: number;
    enterpriseValue: number;
    totalDebt: number;
    cash: number;
    equityValue: number;
    transactionFees: number;
    totalEquityRequired: number;
    sharesOutstanding: number;
  };
  projections: LBOProjection[];
  exitAnalysis: {
    exitEbitda: number;
    exitMultiple: number;
    exitEnterpriseValue: number;
    exitDebt: number;
    exitEquityValue: number;
    totalEquityProceeds: number;
    totalReturn: number;
    moic: number;
    irr: number;
  };
  sourcesAndUses: {
    uses: {
      enterpriseValue: number;
      transactionFees: number;
      refinancingCosts: number;
      total: number;
    };
    sources: {
      seniorDebt: number;
      subordinatedDebt: number;
      revolvingCredit: number;
      sponsorEquity: number;
      total: number;
    };
  };
}

interface LBOAnalysisProps {
  symbol: string;
}

export function LBOAnalysis({ symbol }: LBOAnalysisProps) {
  const { profile, isLoading: profileLoading } = useCompanyProfile(symbol);
  const { statements: incomeStatements, isLoading: incomeLoading } = useIncomeStatements(symbol, 'annual');
  const { statements: cashFlowStatements, isLoading: cashFlowLoading } = useCashFlows(symbol, 'annual');
  const { statements: balanceSheets, isLoading: balanceSheetLoading } = useBalanceSheets(symbol, 'annual');

  // Investment banking standard LBO assumptions
  const [assumptions, setAssumptions] = useState<LBOAssumptions>({
    // Transaction Assumptions
    entryMultiple: 12.0,
    exitMultiple: 12.0,
    holdingPeriod: 5,
    transactionFees: 2.5,
    
    // Operating Assumptions
    revenueGrowthRates: [8.0, 6.0, 5.0, 4.0, 3.0],
    ebitdaMarginTarget: 25.0,
    taxRate: 25.0,
    capexAsPercentOfRevenue: 3.0,
    workingCapitalChangeAsPercentOfRevenue: 1.0,
    
    // Financing Structure
    totalLeverage: 5.5,
    seniorDebtMultiple: 4.0,
    subordinatedDebtMultiple: 1.5,
    seniorDebtRate: 6.5,
    subordinatedDebtRate: 9.0,
    revolvingCreditRate: 5.5,
    revolvingCreditSize: 50,
    
    // Debt Terms
    seniorDebtAmortization: 5.0,
    subordinatedDebtAmortization: 0.0,
    cashSweepRate: 75.0,
  });

  // Initialize with company-specific data
  useEffect(() => {
    if (profile && incomeStatements && cashFlowStatements && balanceSheets) {
      const latestIncome = incomeStatements[0];
      const latestCashFlow = cashFlowStatements[0];
      const latestBalance = balanceSheets[0];
      
      const historicalEbitdaMargin = latestIncome.ebitda && latestIncome.revenue 
        ? (latestIncome.ebitda / latestIncome.revenue) * 100 
        : 25.0;
      
      const historicalCapexPercent = latestCashFlow.capitalExpenditure && latestIncome.revenue
        ? Math.abs(latestCashFlow.capitalExpenditure / latestIncome.revenue) * 100
        : 3.0;

      setAssumptions(prev => ({
        ...prev,
        ebitdaMarginTarget: Math.max(historicalEbitdaMargin, 20.0),
        capexAsPercentOfRevenue: Math.min(historicalCapexPercent, 5.0),
      }));
    }
  }, [profile, incomeStatements, cashFlowStatements, balanceSheets, symbol]);

  // Enhanced LBO calculation
  const lboCalculation = useMemo((): LBOCalculationResult | null => {
    if (!profile || !incomeStatements || !cashFlowStatements || !balanceSheets || incomeStatements.length === 0) {
      return null;
    }

    const latestIncome = incomeStatements[0];
    const latestCashFlow = cashFlowStatements[0];
    const latestBalance = balanceSheets[0];

    // Base year data
    const baseRevenue = latestIncome.revenue || 0;
    const baseEbitda = latestIncome.ebitda || (baseRevenue * assumptions.ebitdaMarginTarget / 100);
    const currentCash = latestBalance.cashAndCashEquivalents || 0;
    const currentDebt = (latestBalance.totalDebt || 0);
    const currentSharePrice = profile.price || 0;
    const sharesOutstanding = profile.mktCap && currentSharePrice ? profile.mktCap / currentSharePrice : 0;

    // Entry valuation based on multiple
    const enterpriseValue = baseEbitda * assumptions.entryMultiple;
    const equityValue = enterpriseValue - currentDebt + currentCash;
    const impliedSharePrice = sharesOutstanding > 0 && equityValue > 0 ? equityValue / sharesOutstanding : 0;
    const impliedPremium = currentSharePrice > 0 && impliedSharePrice > 0 ? ((impliedSharePrice / currentSharePrice) - 1) * 100 : 0;

    // Debug logging
    console.log('LBO Debug:', {
      baseEbitda,
      entryMultiple: assumptions.entryMultiple,
      enterpriseValue,
      currentDebt,
      currentCash,
      equityValue,
      sharesOutstanding,
      currentSharePrice,
      impliedSharePrice,
      mktCap: profile.mktCap
    });
    
    const transactionFees = equityValue * assumptions.transactionFees / 100;
    const totalDebtAtEntry = baseEbitda * assumptions.totalLeverage;
    const seniorDebt = baseEbitda * assumptions.seniorDebtMultiple;
    const subordinatedDebt = baseEbitda * assumptions.subordinatedDebtMultiple;
    const totalEquityRequired = equityValue + transactionFees;

    // Sources and Uses
    const sourcesAndUses = {
      uses: {
        enterpriseValue,
        transactionFees,
        refinancingCosts: currentDebt,
        total: enterpriseValue + transactionFees + currentDebt - currentCash,
      },
      sources: {
        seniorDebt,
        subordinatedDebt,
        revolvingCredit: assumptions.revolvingCreditSize,
        sponsorEquity: 0, // Will be calculated as balancing item
        total: 0,
      },
    };
    sourcesAndUses.sources.sponsorEquity = sourcesAndUses.uses.total - 
      (sourcesAndUses.sources.seniorDebt + sourcesAndUses.sources.subordinatedDebt + sourcesAndUses.sources.revolvingCredit);
    sourcesAndUses.sources.total = sourcesAndUses.uses.total;

    // Build projections
    const projections: LBOProjection[] = [];
    let currentSeniorDebt = seniorDebt;
    let currentSubDebt = subordinatedDebt;
    let currentCashBalance = currentCash;

    for (let year = 1; year <= assumptions.holdingPeriod; year++) {
      const growthRate = assumptions.revenueGrowthRates[year - 1] || assumptions.revenueGrowthRates[assumptions.revenueGrowthRates.length - 1];
      const revenue = year === 1 ? baseRevenue * (1 + growthRate / 100) : projections[year - 2].revenue * (1 + growthRate / 100);
      const ebitda = revenue * assumptions.ebitdaMarginTarget / 100;
      const depreciation = revenue * 0.025; // Assume 2.5% of revenue
      const ebit = ebitda - depreciation;
      
      // Detailed interest calculation
      const seniorInterest = currentSeniorDebt * assumptions.seniorDebtRate / 100;
      const subordinatedInterest = currentSubDebt * assumptions.subordinatedDebtRate / 100;
      const revolvingInterest = assumptions.revolvingCreditSize * assumptions.revolvingCreditRate / 100;
      const totalInterest = seniorInterest + subordinatedInterest + revolvingInterest;
      
      const ebt = ebit - totalInterest;
      const taxes = Math.max(0, ebt * assumptions.taxRate / 100);
      const netIncome = ebt - taxes;
      
      const capex = revenue * assumptions.capexAsPercentOfRevenue / 100;
      const workingCapitalChange = revenue * assumptions.workingCapitalChangeAsPercentOfRevenue / 100;
      const fcf = netIncome + depreciation - capex - workingCapitalChange;
      
      // Cash available for debt service
      const beginningCash = currentCashBalance;
      const cashAvailableForDebtService = fcf + beginningCash;
      
      // Debt service waterfall
      const mandatoryAmortization = Math.min(cashAvailableForDebtService, currentSeniorDebt * assumptions.seniorDebtAmortization / 100);
      const cashAfterMandatory = Math.max(0, cashAvailableForDebtService - totalInterest - mandatoryAmortization);
      const cashSweep = Math.min(cashAfterMandatory * assumptions.cashSweepRate / 100, currentSeniorDebt - mandatoryAmortization);
      const subordinatedAmortization = Math.min(
        Math.max(0, cashAfterMandatory - cashSweep), 
        currentSubDebt * assumptions.subordinatedDebtAmortization / 100
      );
      
      const totalDebtService = totalInterest + mandatoryAmortization + cashSweep + subordinatedAmortization;
      
      // Update debt balances
      currentSeniorDebt = Math.max(0, currentSeniorDebt - mandatoryAmortization - cashSweep);
      currentSubDebt = Math.max(0, currentSubDebt - subordinatedAmortization);
      
      const totalDebt = currentSeniorDebt + currentSubDebt;
      
      // Cash flow to equity
      const cashFlowToEquity = cashAvailableForDebtService - totalDebtService;
      const dividendPayment = Math.max(0, cashFlowToEquity * 0.5); // Assume 50% dividend payout
      const endingCash = Math.max(0, cashFlowToEquity - dividendPayment);
      
      // Update current cash for next iteration
      currentCashBalance = endingCash;
      
      const netDebt = totalDebt - currentCashBalance;
      const leverageRatio = totalDebt / ebitda;
      const interestCoverage = ebitda / totalInterest;

      projections.push({
        year,
        revenue,
        revenueGrowth: growthRate,
        ebitda,
        ebitdaMargin: (ebitda / revenue) * 100,
        depreciation,
        ebit,
        interest: totalInterest,
        ebt,
        taxes,
        netIncome,
        capex,
        workingCapitalChange,
        fcf,
        // Debt service details
        seniorInterest,
        subordinatedInterest,
        revolvingInterest,
        mandatoryAmortization,
        cashSweep,
        totalDebtService,
        // Cash flow to equity
        cashAvailableForDebtService,
        cashFlowToEquity,
        beginningCash,
        endingCash,
        dividendPayment,
        // Debt balances
        seniorDebt: currentSeniorDebt,
        subordinatedDebt: currentSubDebt,
        totalDebt,
        netDebt,
        cash: currentCashBalance,
        leverageRatio,
        interestCoverage,
      });
    }

    // Exit analysis
    const finalProjection = projections[projections.length - 1];
    const exitEbitda = finalProjection.ebitda;
    const exitEnterpriseValue = exitEbitda * assumptions.exitMultiple;
    const exitDebt = finalProjection.totalDebt;
    const exitEquityValue = exitEnterpriseValue - exitDebt + finalProjection.cash;
    const totalReturn = exitEquityValue - sourcesAndUses.sources.sponsorEquity;
    const moic = exitEquityValue / sourcesAndUses.sources.sponsorEquity;
    
    // IRR calculation (simplified)
    const irr = (Math.pow(moic, 1 / assumptions.holdingPeriod) - 1) * 100;

    return {
      entryValuation: {
        currentSharePrice,
        entryMultiple: assumptions.entryMultiple,
        impliedSharePrice,
        impliedPremium,
        entryEbitda: baseEbitda,
        enterpriseValue,
        totalDebt: totalDebtAtEntry,
        cash: currentCash,
        equityValue,
        transactionFees,
        totalEquityRequired,
        sharesOutstanding,
      },
      projections,
      exitAnalysis: {
        exitEbitda,
        exitMultiple: assumptions.exitMultiple,
        exitEnterpriseValue,
        exitDebt,
        exitEquityValue,
        totalEquityProceeds: exitEquityValue,
        totalReturn,
        moic,
        irr,
      },
      sourcesAndUses,
    };
  }, [assumptions, profile, incomeStatements, cashFlowStatements, balanceSheets]);

  // IRR sensitivity analysis - Entry Multiple vs Exit Multiple
  const irrSensitivity = useMemo(() => {
    if (!lboCalculation || !profile || !incomeStatements || !balanceSheets) return [];
    
    const baseEbitda = lboCalculation.entryValuation.entryEbitda;
    const entryMultiples = [9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0];
    const exitMultiples = [9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0];
    const results = [];
    
    for (const entryMult of entryMultiples) {
      for (const exitMult of exitMultiples) {
        // Recalculate entry valuation for this entry multiple
        const enterpriseValue = baseEbitda * entryMult;
        const currentDebt = (balanceSheets[0]?.totalDebt || 0);
        const currentCash = (balanceSheets[0]?.cashAndCashEquivalents || 0);
        const equityValue = enterpriseValue - currentDebt + currentCash;
        const transactionFees = equityValue * assumptions.transactionFees / 100;
        
        // Calculate debt structure
        const seniorDebt = baseEbitda * assumptions.seniorDebtMultiple;
        const subordinatedDebt = baseEbitda * assumptions.subordinatedDebtMultiple;
        const totalUsesAdjusted = enterpriseValue + transactionFees + currentDebt - currentCash;
        const sponsorEquity = totalUsesAdjusted - (seniorDebt + subordinatedDebt + assumptions.revolvingCreditSize);
        
        // Calculate exit for this scenario
        const finalEbitda = lboCalculation.projections[lboCalculation.projections.length - 1]?.ebitda || baseEbitda;
        const exitEnterpriseValue = finalEbitda * exitMult;
        const exitDebt = lboCalculation.projections[lboCalculation.projections.length - 1]?.totalDebt || 0;
        const exitCash = lboCalculation.projections[lboCalculation.projections.length - 1]?.cash || 0;
        const exitEquityValue = exitEnterpriseValue - exitDebt + exitCash;
        
        // IRR calculation
        const moic = sponsorEquity > 0 ? exitEquityValue / sponsorEquity : 0;
        const irr = moic > 0 ? (Math.pow(moic, 1 / assumptions.holdingPeriod) - 1) * 100 : -100;
        
        results.push({
          entryMultiple: entryMult,
          exitMultiple: exitMult,
          irr: Math.max(-100, Math.min(100, irr)), // Cap IRR between -100% and 100%
          isBaseCase: Math.abs(entryMult - assumptions.entryMultiple) < 0.1 && 
                     Math.abs(exitMult - assumptions.exitMultiple) < 0.1,
          sponsorEquity,
          exitEquityValue,
          moic,
        });
      }
    }
    
    return results;
  }, [lboCalculation, assumptions.entryMultiple, assumptions.exitMultiple, assumptions.holdingPeriod, assumptions.transactionFees, assumptions.seniorDebtMultiple, assumptions.subordinatedDebtMultiple, assumptions.revolvingCreditSize, profile, incomeStatements, balanceSheets]);

  // IRR Cash Flow Schedule
  const irrCashFlows = useMemo(() => {
    if (!lboCalculation) return [];
    
    const cashFlows = [
      {
        year: 0,
        description: "Initial Investment",
        cashFlow: -lboCalculation.sourcesAndUses.sources.sponsorEquity,
        cumulative: -lboCalculation.sourcesAndUses.sources.sponsorEquity,
      }
    ];
    
    let cumulative = -lboCalculation.sourcesAndUses.sources.sponsorEquity;
    
    // Add annual dividend payments
    for (let year = 1; year < assumptions.holdingPeriod; year++) {
      const projection = lboCalculation.projections[year - 1];
      const dividendPayment = projection?.dividendPayment || 0;
      cumulative += dividendPayment;
      
      cashFlows.push({
        year,
        description: dividendPayment > 0 ? "Dividend Payment" : "No Dividend",
        cashFlow: dividendPayment,
        cumulative,
      });
    }
    
    // Add exit cash flow (including final year dividend)
    const finalProjection = lboCalculation.projections[lboCalculation.projections.length - 1];
    const finalDividend = finalProjection?.dividendPayment || 0;
    const exitCashFlow = lboCalculation.exitAnalysis.exitEquityValue + finalDividend;
    cumulative += exitCashFlow;
    
    cashFlows.push({
      year: assumptions.holdingPeriod,
      description: "Exit Proceeds + Final Dividend",
      cashFlow: exitCashFlow,
      cumulative,
    });
    
    return cashFlows;
  }, [lboCalculation, assumptions.holdingPeriod]);

  if (profileLoading || incomeLoading || cashFlowLoading || balanceSheetLoading) {
    return <TableLoadingSkeleton />;
  }

  if (!lboCalculation) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Unable to calculate LBO analysis. Please ensure financial data is available for {symbol}.
        </AlertDescription>
      </Alert>
    );
  }

  const updateAssumption = (field: keyof LBOAssumptions, value: number | number[]) => {
    setAssumptions(prev => ({ ...prev, [field]: value }));
  };

  const updateRevenueGrowth = (index: number, value: number) => {
    const newGrowthRates = [...assumptions.revenueGrowthRates];
    newGrowthRates[index] = value;
    setAssumptions(prev => ({ ...prev, revenueGrowthRates: newGrowthRates }));
  };

  return (
    <div className="space-y-6">
      {/* LBO Assumptions Input Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Model Inputs & Assumptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Assumptions */}
            <div className="lg:col-span-3">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-semibold text-slate-700 dark:text-slate-300 pb-2 w-40">Transaction</th>
                      <th className="text-center text-xs font-semibold text-slate-700 dark:text-slate-300 pb-2 w-20">Value</th>
                      <th className="text-left text-xs font-semibold text-slate-700 dark:text-slate-300 pb-2 w-40">Operating</th>
                      <th className="text-center text-xs font-semibold text-slate-700 dark:text-slate-300 pb-2 w-20">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-1.5 text-xs text-slate-600 dark:text-slate-400">Entry EV/EBITDA Multiple</td>
                      <td className="py-1.5 text-center">
                        <Input
                          type="number"
                          step="0.1"
                          value={assumptions.entryMultiple}
                          onChange={(e) => updateAssumption('entryMultiple', parseFloat(e.target.value) || 0)}
                          className="h-6 text-xs text-center border-slate-200 dark:border-slate-700 focus:border-blue-500 w-16 mx-auto"
                        />
                      </td>
                      <td className="py-1.5 text-xs text-slate-600 dark:text-slate-400">Target EBITDA Margin (%)</td>
                      <td className="py-1.5 text-center">
                        <Input
                          type="number"
                          step="0.1"
                          value={assumptions.ebitdaMarginTarget}
                          onChange={(e) => updateAssumption('ebitdaMarginTarget', parseFloat(e.target.value) || 0)}
                          className="h-6 text-xs text-center border-slate-200 dark:border-slate-700 focus:border-blue-500 w-16 mx-auto"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-1.5 text-xs text-slate-600 dark:text-slate-400">Exit EV/EBITDA Multiple</td>
                      <td className="py-1.5 text-center">
                        <Input
                          type="number"
                          step="0.1"
                          value={assumptions.exitMultiple}
                          onChange={(e) => updateAssumption('exitMultiple', parseFloat(e.target.value) || 0)}
                          className="h-6 text-xs text-center border-slate-200 dark:border-slate-700 focus:border-blue-500 w-16 mx-auto"
                        />
                      </td>
                      <td className="py-1.5 text-xs text-slate-600 dark:text-slate-400">Tax Rate (%)</td>
                      <td className="py-1.5 text-center">
                        <Input
                          type="number"
                          step="0.1"
                          value={assumptions.taxRate}
                          onChange={(e) => updateAssumption('taxRate', parseFloat(e.target.value) || 0)}
                          className="h-6 text-xs text-center border-slate-200 dark:border-slate-700 focus:border-blue-500 w-16 mx-auto"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-1.5 text-xs text-slate-600 dark:text-slate-400">Holding Period (Years)</td>
                      <td className="py-1.5 text-center">
                        <Input
                          type="number"
                          value={assumptions.holdingPeriod}
                          onChange={(e) => updateAssumption('holdingPeriod', parseInt(e.target.value) || 0)}
                          className="h-6 text-xs text-center border-slate-200 dark:border-slate-700 focus:border-blue-500 w-16 mx-auto"
                        />
                      </td>
                      <td className="py-1.5 text-xs text-slate-600 dark:text-slate-400">CapEx (% of Revenue)</td>
                      <td className="py-1.5 text-center">
                        <Input
                          type="number"
                          step="0.1"
                          value={assumptions.capexAsPercentOfRevenue}
                          onChange={(e) => updateAssumption('capexAsPercentOfRevenue', parseFloat(e.target.value) || 0)}
                          className="h-6 text-xs text-center border-slate-200 dark:border-slate-700 focus:border-blue-500 w-16 mx-auto"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-1.5 text-xs text-slate-600 dark:text-slate-400">Transaction Fees (%)</td>
                      <td className="py-1.5 text-center">
                        <Input
                          type="number"
                          step="0.1"
                          value={assumptions.transactionFees}
                          onChange={(e) => updateAssumption('transactionFees', parseFloat(e.target.value) || 0)}
                          className="h-6 text-xs text-center border-slate-200 dark:border-slate-700 focus:border-blue-500 w-16 mx-auto"
                        />
                      </td>
                      <td className="py-1.5 text-xs text-slate-600 dark:text-slate-400">Total Leverage (Debt/EBITDA)</td>
                      <td className="py-1.5 text-center">
                        <Input
                          type="number"
                          step="0.1"
                          value={assumptions.totalLeverage}
                          onChange={(e) => updateAssumption('totalLeverage', parseFloat(e.target.value) || 0)}
                          className="h-6 text-xs text-center border-slate-200 dark:border-slate-700 focus:border-blue-500 w-16 mx-auto"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-1.5 text-xs text-slate-600 dark:text-slate-400">Senior Debt Multiple</td>
                      <td className="py-1.5 text-center">
                        <Input
                          type="number"
                          step="0.1"
                          value={assumptions.seniorDebtMultiple}
                          onChange={(e) => updateAssumption('seniorDebtMultiple', parseFloat(e.target.value) || 0)}
                          className="h-6 text-xs text-center border-slate-200 dark:border-slate-700 focus:border-blue-500 w-16 mx-auto"
                        />
                      </td>
                      <td className="py-1.5 text-xs text-slate-600 dark:text-slate-400">Senior Debt Rate (%)</td>
                      <td className="py-1.5 text-center">
                        <Input
                          type="number"
                          step="0.1"
                          value={assumptions.seniorDebtRate}
                          onChange={(e) => updateAssumption('seniorDebtRate', parseFloat(e.target.value) || 0)}
                          className="h-6 text-xs text-center border-slate-200 dark:border-slate-700 focus:border-blue-500 w-16 mx-auto"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-1.5 text-xs text-slate-600 dark:text-slate-400"></td>
                      <td className="py-1.5 text-center"></td>
                      <td className="py-1.5 text-xs text-slate-600 dark:text-slate-400">Sub Debt Rate (%)</td>
                      <td className="py-1.5 text-center">
                        <Input
                          type="number"
                          step="0.1"
                          value={assumptions.subordinatedDebtRate}
                          onChange={(e) => updateAssumption('subordinatedDebtRate', parseFloat(e.target.value) || 0)}
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
                            onChange={(e) => updateRevenueGrowth(index, parseFloat(e.target.value) || 0)}
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

      {/* Entry Valuation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Entry Valuation Summary</CardTitle>
          <CardDescription>Entry multiple assumptions and implied share price</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Share Price Analysis</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Share Price</span>
                  <span className="font-semibold">${lboCalculation.entryValuation.currentSharePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Implied Share Price</span>
                  <span className="font-semibold">${lboCalculation.entryValuation.impliedSharePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Implied Premium</span>
                  <span className={cn(
                    "font-semibold",
                    lboCalculation.entryValuation.impliedPremium > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                  )}>
                    {lboCalculation.entryValuation.impliedPremium.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Valuation Metrics</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LTM EBITDA</span>
                  <span className="font-semibold">{formatFinancialNumber(lboCalculation.entryValuation.entryEbitda, { decimals: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entry EV/EBITDA</span>
                  <span className="font-semibold">{lboCalculation.entryValuation.entryMultiple.toFixed(1)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Enterprise Value</span>
                  <span className="font-semibold">{formatFinancialNumber(lboCalculation.entryValuation.enterpriseValue, { decimals: 0 })}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Transaction Size</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Equity Value</span>
                  <span className="font-semibold">{formatFinancialNumber(lboCalculation.entryValuation.equityValue, { decimals: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction Fees</span>
                  <span className="font-semibold">{formatFinancialNumber(lboCalculation.entryValuation.transactionFees, { decimals: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Equity Required</span>
                  <span className="font-semibold">{formatFinancialNumber(lboCalculation.entryValuation.totalEquityRequired, { decimals: 0 })}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources and Uses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Sources & Uses of Funds</CardTitle>
          <CardDescription>Transaction funding structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full financial-table">
                <thead className="bg-slate-50 dark:bg-slate-900/90">
                  <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-bold text-slate-800 dark:text-slate-200">Uses of Funds</th>
                    <th className="text-right py-3 px-4 text-sm font-bold text-slate-800 dark:text-slate-200">Amount ($M)</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-950">
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 px-4 text-sm">Enterprise Value</td>
                    <td className="text-right py-2 px-4 text-sm tabular-nums">{formatFinancialNumber(lboCalculation.sourcesAndUses.uses.enterpriseValue, { decimals: 0 })}</td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 px-4 text-sm">Transaction Fees</td>
                    <td className="text-right py-2 px-4 text-sm tabular-nums">{formatFinancialNumber(lboCalculation.sourcesAndUses.uses.transactionFees, { decimals: 0 })}</td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 px-4 text-sm">Refinancing Costs</td>
                    <td className="text-right py-2 px-4 text-sm tabular-nums">{formatFinancialNumber(lboCalculation.sourcesAndUses.uses.refinancingCosts, { decimals: 0 })}</td>
                  </tr>
                  <tr className="border-t-2 border-slate-300 dark:border-slate-600 bg-blue-25 dark:bg-blue-900/20">
                    <td className="py-3 px-4 text-sm font-bold">Total Uses</td>
                    <td className="text-right py-3 px-4 text-sm font-bold tabular-nums">{formatFinancialNumber(lboCalculation.sourcesAndUses.uses.total, { decimals: 0 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto rounded-lg">
              <table className="w-full financial-table">
                <thead className="bg-slate-50 dark:bg-slate-900/90">
                  <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-bold text-slate-800 dark:text-slate-200">Sources of Funds</th>
                    <th className="text-right py-3 px-4 text-sm font-bold text-slate-800 dark:text-slate-200">Amount ($M)</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-950">
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 px-4 text-sm">Senior Debt</td>
                    <td className="text-right py-2 px-4 text-sm tabular-nums">{formatFinancialNumber(lboCalculation.sourcesAndUses.sources.seniorDebt, { decimals: 0 })}</td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 px-4 text-sm">Subordinated Debt</td>
                    <td className="text-right py-2 px-4 text-sm tabular-nums">{formatFinancialNumber(lboCalculation.sourcesAndUses.sources.subordinatedDebt, { decimals: 0 })}</td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 px-4 text-sm">Revolving Credit</td>
                    <td className="text-right py-2 px-4 text-sm tabular-nums">{formatFinancialNumber(lboCalculation.sourcesAndUses.sources.revolvingCredit, { decimals: 0 })}</td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 px-4 text-sm">Sponsor Equity</td>
                    <td className="text-right py-2 px-4 text-sm tabular-nums">{formatFinancialNumber(lboCalculation.sourcesAndUses.sources.sponsorEquity, { decimals: 0 })}</td>
                  </tr>
                  <tr className="border-t-2 border-slate-300 dark:border-slate-600 bg-green-25 dark:bg-green-900/20">
                    <td className="py-3 px-4 text-sm font-bold">Total Sources</td>
                    <td className="text-right py-3 px-4 text-sm font-bold tabular-nums">{formatFinancialNumber(lboCalculation.sourcesAndUses.sources.total, { decimals: 0 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Financial Projections & Debt Schedule</CardTitle>
          <CardDescription>5-year projected cash flows and credit metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full financial-table">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/90 backdrop-blur">
                <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 sticky left-0 z-30 bg-slate-50 dark:bg-slate-900/90">Line Item</th>
                  {lboCalculation.projections.map((proj) => (
                    <th key={proj.year} className="text-right py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[100px]">
                      Year {proj.year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-950">
                {/* Revenue Section */}
                <tr className="bg-blue-25 dark:bg-blue-900/20 border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold sticky left-0 z-20 bg-blue-25 dark:bg-blue-900/20">Revenue</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums font-semibold">
                      {formatFinancialNumber(proj.revenue, { decimals: 0 })}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm pl-6 sticky left-0 z-20 bg-white dark:bg-slate-950">Revenue Growth (%)</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                      {proj.revenueGrowth.toFixed(1)}%
                    </td>
                  ))}
                </tr>

                {/* EBITDA Section */}
                <tr className="bg-blue-25 dark:bg-blue-900/20 border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold sticky left-0 z-20 bg-blue-25 dark:bg-blue-900/20">EBITDA</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums font-semibold">
                      {formatFinancialNumber(proj.ebitda, { decimals: 0 })}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm pl-6 sticky left-0 z-20 bg-white dark:bg-slate-950">EBITDA Margin (%)</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                      {proj.ebitdaMargin.toFixed(1)}%
                    </td>
                  ))}
                </tr>

                {/* Cash Flow Cascade */}
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm sticky left-0 z-20 bg-white dark:bg-slate-950">Less: Depreciation</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                      ({formatFinancialNumber(proj.depreciation, { decimals: 0 })})
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm sticky left-0 z-20 bg-white dark:bg-slate-950">EBIT</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                      {formatFinancialNumber(proj.ebit, { decimals: 0 })}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm sticky left-0 z-20 bg-white dark:bg-slate-950">Less: Interest Expense</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                      ({formatFinancialNumber(proj.interest, { decimals: 0 })})
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm sticky left-0 z-20 bg-white dark:bg-slate-950">EBT</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                      {formatFinancialNumber(proj.ebt, { decimals: 0 })}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm sticky left-0 z-20 bg-white dark:bg-slate-950">Less: Taxes</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                      ({formatFinancialNumber(proj.taxes, { decimals: 0 })})
                    </td>
                  ))}
                </tr>
                <tr className="bg-yellow-25 dark:bg-yellow-900/20 border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold sticky left-0 z-20 bg-yellow-25 dark:bg-yellow-900/20">Net Income</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums font-semibold">
                      {formatFinancialNumber(proj.netIncome, { decimals: 0 })}
                    </td>
                  ))}
                </tr>

                {/* Free Cash Flow */}
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm sticky left-0 z-20 bg-white dark:bg-slate-950">Plus: Depreciation</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                      {formatFinancialNumber(proj.depreciation, { decimals: 0 })}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm sticky left-0 z-20 bg-white dark:bg-slate-950">Less: CapEx</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                      ({formatFinancialNumber(proj.capex, { decimals: 0 })})
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm sticky left-0 z-20 bg-white dark:bg-slate-950">Less: NWC Change</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                      ({formatFinancialNumber(proj.workingCapitalChange, { decimals: 0 })})
                    </td>
                  ))}
                </tr>
                <tr className="bg-green-25 dark:bg-green-900/20 border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold sticky left-0 z-20 bg-green-25 dark:bg-green-900/20">Free Cash Flow</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums font-semibold">
                      {formatFinancialNumber(proj.fcf, { decimals: 0 })}
                    </td>
                  ))}
                </tr>

                {/* Cash Flow to Equity Waterfall */}
                <tr className="h-2"/>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm sticky left-0 z-20 bg-white dark:bg-slate-950">Plus: Beginning Cash</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                      {formatFinancialNumber(proj.beginningCash, { decimals: 0 })}
                    </td>
                  ))}
                </tr>
                <tr className="bg-purple-25 dark:bg-purple-900/20 border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold sticky left-0 z-20 bg-purple-25 dark:bg-purple-900/20">Cash Available for Debt Service</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums font-semibold">
                      {formatFinancialNumber(proj.cashAvailableForDebtService, { decimals: 0 })}
                    </td>
                  ))}
                </tr>
                
                {/* Debt Service Detail */}
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm pl-6 sticky left-0 z-20 bg-white dark:bg-slate-950">Senior Interest</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                      ({formatFinancialNumber(proj.seniorInterest, { decimals: 0 })})
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm pl-6 sticky left-0 z-20 bg-white dark:bg-slate-950">Subordinated Interest</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                      ({formatFinancialNumber(proj.subordinatedInterest, { decimals: 0 })})
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm pl-6 sticky left-0 z-20 bg-white dark:bg-slate-950">Revolving Interest</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                      ({formatFinancialNumber(proj.revolvingInterest, { decimals: 0 })})
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm pl-6 sticky left-0 z-20 bg-white dark:bg-slate-950">Mandatory Amortization</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                      ({formatFinancialNumber(proj.mandatoryAmortization, { decimals: 0 })})
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm pl-6 sticky left-0 z-20 bg-white dark:bg-slate-950">Cash Sweep</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                      ({formatFinancialNumber(proj.cashSweep, { decimals: 0 })})
                    </td>
                  ))}
                </tr>
                <tr className="bg-red-25 dark:bg-red-900/20 border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold sticky left-0 z-20 bg-red-25 dark:bg-red-900/20">Total Debt Service</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums font-semibold">
                      ({formatFinancialNumber(proj.totalDebtService, { decimals: 0 })})
                    </td>
                  ))}
                </tr>
                
                {/* Cash Flow to Equity */}
                <tr className="bg-blue-25 dark:bg-blue-900/20 border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold sticky left-0 z-20 bg-blue-25 dark:bg-blue-900/20">Cash Flow to Equity</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums font-semibold">
                      {formatFinancialNumber(proj.cashFlowToEquity, { decimals: 0 })}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm pl-6 sticky left-0 z-20 bg-white dark:bg-slate-950">Dividend Payment</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                      ({formatFinancialNumber(proj.dividendPayment, { decimals: 0 })})
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-25 dark:bg-gray-900/20 border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold sticky left-0 z-20 bg-gray-25 dark:bg-gray-900/20">Ending Cash Balance</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums font-semibold">
                      {formatFinancialNumber(proj.endingCash, { decimals: 0 })}
                    </td>
                  ))}
                </tr>

                {/* Debt Schedule */}
                <tr className="h-2"/>
                <tr className="bg-red-25 dark:bg-red-900/20 border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold sticky left-0 z-20 bg-red-25 dark:bg-red-900/20">Total Debt</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums font-semibold">
                      {formatFinancialNumber(proj.totalDebt, { decimals: 0 })}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm pl-6 sticky left-0 z-20 bg-white dark:bg-slate-950">Senior Debt</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                      {formatFinancialNumber(proj.seniorDebt, { decimals: 0 })}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm pl-6 sticky left-0 z-20 bg-white dark:bg-slate-950">Subordinated Debt</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                      {formatFinancialNumber(proj.subordinatedDebt, { decimals: 0 })}
                    </td>
                  ))}
                </tr>

                {/* Credit Metrics */}
                <tr className="h-2"/>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold sticky left-0 z-20 bg-white dark:bg-slate-950">Net Leverage Ratio</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className={cn(
                      "text-right py-2 px-3 text-xs md:text-sm tabular-nums font-semibold",
                      proj.leverageRatio > 4.0 ? "text-red-600 dark:text-red-400" : 
                      proj.leverageRatio > 3.0 ? "text-yellow-600 dark:text-yellow-400" : 
                      "text-green-600 dark:text-green-400"
                    )}>
                      {proj.leverageRatio.toFixed(1)}x
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold sticky left-0 z-20 bg-white dark:bg-slate-950">Interest Coverage</td>
                  {lboCalculation.projections.map((proj) => (
                    <td key={proj.year} className={cn(
                      "text-right py-2 px-3 text-xs md:text-sm tabular-nums font-semibold",
                      proj.interestCoverage < 2.0 ? "text-red-600 dark:text-red-400" : 
                      proj.interestCoverage < 3.0 ? "text-yellow-600 dark:text-yellow-400" : 
                      "text-green-600 dark:text-green-400"
                    )}>
                      {proj.interestCoverage.toFixed(1)}x
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>


      {/* IRR Cash Flow Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">IRR Cash Flow Schedule</CardTitle>
          <CardDescription>Detailed cash flows to equity investors with exit proceeds breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full financial-table">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/90 backdrop-blur">
                <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 sticky left-0 z-30 bg-slate-50 dark:bg-slate-900/90">Line Item</th>
                  <th className="text-right py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[100px]">Year 0</th>
                  {Array.from({ length: assumptions.holdingPeriod }, (_, i) => (
                    <th key={i + 1} className="text-right py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[100px]">
                      Year {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-950">
                {/* Initial Investment */}
                <tr className="bg-red-25 dark:bg-red-900/20 border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold sticky left-0 z-20 bg-red-25 dark:bg-red-900/20">Initial Investment</td>
                  <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums font-semibold text-red-600 dark:text-red-400">
                    ({formatFinancialNumber(lboCalculation.sourcesAndUses.sources.sponsorEquity, { decimals: 0 })})
                  </td>
                  {Array.from({ length: assumptions.holdingPeriod }, () => (
                    <td key={Math.random()} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                  ))}
                </tr>

                {/* Annual Dividends */}
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm sticky left-0 z-20 bg-white dark:bg-slate-950">Annual Dividends</td>
                  <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                  {lboCalculation.projections.map((proj, index) => (
                    <td key={proj.year} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                      {proj.dividendPayment > 0 ? formatFinancialNumber(proj.dividendPayment, { decimals: 0 }) : "-"}
                    </td>
                  ))}
                </tr>

                {/* Exit Analysis Detail */}
                <tr className="h-2"/>
                <tr className="bg-green-25 dark:bg-green-900/20 border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold sticky left-0 z-20 bg-green-25 dark:bg-green-900/20">Exit Analysis</td>
                  <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                  {Array.from({ length: assumptions.holdingPeriod - 1 }, () => (
                    <td key={Math.random()} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                  ))}
                  <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums font-semibold"></td>
                </tr>
                
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm pl-6 sticky left-0 z-20 bg-white dark:bg-slate-950">Exit EBITDA</td>
                  <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                  {Array.from({ length: assumptions.holdingPeriod - 1 }, () => (
                    <td key={Math.random()} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                  ))}
                  <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                    {formatFinancialNumber(lboCalculation.exitAnalysis.exitEbitda, { decimals: 0 })}
                  </td>
                </tr>
                
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm pl-6 sticky left-0 z-20 bg-white dark:bg-slate-950">Exit Multiple</td>
                  <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                  {Array.from({ length: assumptions.holdingPeriod - 1 }, () => (
                    <td key={Math.random()} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                  ))}
                  <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                    {lboCalculation.exitAnalysis.exitMultiple.toFixed(1)}x
                  </td>
                </tr>
                
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm pl-6 sticky left-0 z-20 bg-white dark:bg-slate-950">Exit Enterprise Value</td>
                  <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                  {Array.from({ length: assumptions.holdingPeriod - 1 }, () => (
                    <td key={Math.random()} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                  ))}
                  <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                    {formatFinancialNumber(lboCalculation.exitAnalysis.exitEnterpriseValue, { decimals: 0 })}
                  </td>
                </tr>
                
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm pl-6 sticky left-0 z-20 bg-white dark:bg-slate-950">Less: Exit Debt</td>
                  <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                  {Array.from({ length: assumptions.holdingPeriod - 1 }, () => (
                    <td key={Math.random()} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                  ))}
                  <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                    ({formatFinancialNumber(lboCalculation.exitAnalysis.exitDebt, { decimals: 0 })})
                  </td>
                </tr>
                
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm pl-6 sticky left-0 z-20 bg-white dark:bg-slate-950">Plus: Exit Cash</td>
                  <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                  {Array.from({ length: assumptions.holdingPeriod - 1 }, () => (
                    <td key={Math.random()} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                  ))}
                  <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">
                    {formatFinancialNumber(lboCalculation.projections[lboCalculation.projections.length - 1]?.cash || 0, { decimals: 0 })}
                  </td>
                </tr>

                <tr className="bg-blue-25 dark:bg-blue-900/20 border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold sticky left-0 z-20 bg-blue-25 dark:bg-blue-900/20">Exit Proceeds</td>
                  <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                  {Array.from({ length: assumptions.holdingPeriod - 1 }, () => (
                    <td key={Math.random()} className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">-</td>
                  ))}
                  <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums font-semibold text-green-600 dark:text-green-400">
                    {formatFinancialNumber(lboCalculation.exitAnalysis.exitEquityValue, { decimals: 0 })}
                  </td>
                </tr>

                {/* Total Cash Flow */}
                <tr className="h-2"/>
                <tr className="bg-yellow-25 dark:bg-yellow-900/20 border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold sticky left-0 z-20 bg-yellow-25 dark:bg-yellow-900/20">Total Cash Flow</td>
                  <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums font-semibold text-red-600 dark:text-red-400">
                    ({formatFinancialNumber(lboCalculation.sourcesAndUses.sources.sponsorEquity, { decimals: 0 })})
                  </td>
                  {lboCalculation.projections.map((proj, index) => {
                    const isExitYear = index === lboCalculation.projections.length - 1;
                    const totalCashFlow = isExitYear 
                      ? proj.dividendPayment + lboCalculation.exitAnalysis.exitEquityValue
                      : proj.dividendPayment;
                    
                    return (
                      <td key={proj.year} className={cn(
                        "text-right py-2 px-3 text-xs md:text-sm tabular-nums font-semibold",
                        isExitYear ? "text-green-600 dark:text-green-400" : ""
                      )}>
                        {totalCashFlow > 0 ? formatFinancialNumber(totalCashFlow, { decimals: 0 }) : "-"}
                      </td>
                    );
                  })}
                </tr>

                {/* Cumulative Cash Flow */}
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-4 text-xs md:text-sm font-semibold sticky left-0 z-20 bg-white dark:bg-slate-950">Cumulative Cash Flow</td>
                  {(() => {
                    let cumulative = -lboCalculation.sourcesAndUses.sources.sponsorEquity;
                    const cells = [
                      <td key="year0" className="text-right py-2 px-3 text-xs md:text-sm tabular-nums font-semibold text-red-600 dark:text-red-400">
                        ({formatFinancialNumber(Math.abs(cumulative), { decimals: 0 })})
                      </td>
                    ];
                    
                    lboCalculation.projections.forEach((proj, index) => {
                      const isExitYear = index === lboCalculation.projections.length - 1;
                      const cashFlow = isExitYear 
                        ? proj.dividendPayment + lboCalculation.exitAnalysis.exitEquityValue
                        : proj.dividendPayment;
                      cumulative += cashFlow;
                      
                      cells.push(
                        <td key={proj.year} className={cn(
                          "text-right py-2 px-3 text-xs md:text-sm tabular-nums font-semibold",
                          cumulative < 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                        )}>
                          {cumulative < 0 
                            ? `(${formatFinancialNumber(Math.abs(cumulative), { decimals: 0 })})`
                            : formatFinancialNumber(cumulative, { decimals: 0 })
                          }
                        </td>
                      );
                    });
                    
                    return cells;
                  })()}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">IRR</div>
              <div className="font-semibold text-lg">{lboCalculation.exitAnalysis.irr.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-muted-foreground">MOIC</div>
              <div className="font-semibold text-lg">{lboCalculation.exitAnalysis.moic.toFixed(1)}x</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Return</div>
              <div className="font-semibold">{formatFinancialNumber(lboCalculation.exitAnalysis.totalReturn, { decimals: 0 })}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Holding Period</div>
              <div className="font-semibold">{assumptions.holdingPeriod} years</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IRR Sensitivity Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">IRR Sensitivity Analysis</CardTitle>
          <CardDescription>IRR sensitivity to entry and exit multiples - Base case highlighted</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full financial-table">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/90 backdrop-blur">
                <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-bold text-slate-800 dark:text-slate-200">Entry \ Exit Multiple</th>
                  <th className="text-center py-3 px-3 text-sm font-bold text-slate-800 dark:text-slate-200">9.0x</th>
                  <th className="text-center py-3 px-3 text-sm font-bold text-slate-800 dark:text-slate-200">10.0x</th>
                  <th className="text-center py-3 px-3 text-sm font-bold text-slate-800 dark:text-slate-200">11.0x</th>
                  <th className="text-center py-3 px-3 text-sm font-bold text-slate-800 dark:text-slate-200">12.0x</th>
                  <th className="text-center py-3 px-3 text-sm font-bold text-slate-800 dark:text-slate-200">13.0x</th>
                  <th className="text-center py-3 px-3 text-sm font-bold text-slate-800 dark:text-slate-200">14.0x</th>
                  <th className="text-center py-3 px-3 text-sm font-bold text-slate-800 dark:text-slate-200">15.0x</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-950">
                {[9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0].map((entryMult) => (
                  <tr key={entryMult} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 px-4 text-sm font-semibold">{entryMult.toFixed(1)}x</td>
                    {[9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0].map((exitMult) => {
                      const result = irrSensitivity.find(r => 
                        Math.abs(r.entryMultiple - entryMult) < 0.1 && 
                        Math.abs(r.exitMultiple - exitMult) < 0.1
                      );
                      const irr = result?.irr || 0;
                      const isBaseCase = result?.isBaseCase || false;
                      
                      return (
                        <td 
                          key={exitMult} 
                          className={cn(
                            "text-center py-2 px-3 text-sm tabular-nums",
                            isBaseCase && "border-2 border-blue-600 dark:border-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30",
                            !isBaseCase && irr >= 25 ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300" :
                            !isBaseCase && irr >= 20 ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300" :
                            !isBaseCase && irr >= 15 ? "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300" :
                            !isBaseCase && irr >= 0 ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300" :
                            !isBaseCase ? "bg-red-200 dark:bg-red-900/40 text-red-900 dark:text-red-200" : ""
                          )}
                        >
                          {irr >= 0 ? `${irr.toFixed(1)}%` : `(${Math.abs(irr).toFixed(1)})%`}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 dark:bg-green-900/20 border"></div>
                <span>IRR ≥ 25%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/20 border"></div>
                <span>20% ≤ IRR &lt; 25%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-100 dark:bg-orange-900/20 border"></div>
                <span>15% ≤ IRR &lt; 20%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 dark:bg-red-900/20 border"></div>
                <span>IRR &lt; 15%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600"></div>
                <span>Base Case</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
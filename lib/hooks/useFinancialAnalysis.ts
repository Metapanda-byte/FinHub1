import { useMemo } from 'react';

interface FinancialStatement {
  date: string;
  revenue?: number;
  netIncome?: number;
  operatingIncome?: number;
  ebitda?: number;
  eps?: number;
  operatingCashFlow?: number;
  freeCashFlow?: number;
  totalAssets?: number;
  totalEquity?: number;
  totalDebt?: number;
}

export function useFinancialAnalysis(
  incomeStatements: FinancialStatement[] | null,
  cashFlows: FinancialStatement[] | null,
  balanceSheets: FinancialStatement[] | null
) {
  return useMemo(() => {
    if (!incomeStatements || incomeStatements.length < 2) {
      return null;
    }

    const analysis = {
      revenueAnalysis: analyzeRevenue(incomeStatements),
      profitabilityAnalysis: analyzeProfitability(incomeStatements),
      cashFlowAnalysis: analyzeCashFlow(cashFlows || []),
      balanceSheetAnalysis: analyzeBalanceSheet(balanceSheets || []),
      keyMetrics: calculateKeyMetrics(incomeStatements, balanceSheets || [])
    };

    return analysis;
  }, [incomeStatements, cashFlows, balanceSheets]);
}

function analyzeRevenue(statements: FinancialStatement[]) {
  const revenueData = statements
    .slice(0, 5)
    .map((s, idx) => {
      const prevStatement = statements[idx + 1];
      const yoyGrowth = prevStatement?.revenue
        ? ((s.revenue! - prevStatement.revenue) / prevStatement.revenue) * 100
        : null;
      
      return {
        year: new Date(s.date).getFullYear(),
        revenue: s.revenue,
        yoyGrowth,
        quarterlyAnnotualized: s.revenue! * 4 // If quarterly data
      };
    });

  // Identify significant changes
  const significantChanges = revenueData
    .filter(d => d.yoyGrowth && Math.abs(d.yoyGrowth) > 15)
    .map(d => ({
      year: d.year,
      change: d.yoyGrowth,
      direction: d.yoyGrowth! > 0 ? 'increase' : 'decrease'
    }));

  return {
    data: revenueData,
    significantChanges,
    trend: calculateTrend(revenueData.map(d => d.revenue!))
  };
}

function analyzeProfitability(statements: FinancialStatement[]) {
  const margins = statements.slice(0, 5).map(s => ({
    year: new Date(s.date).getFullYear(),
    grossMargin: s.revenue ? ((s.revenue - (s.revenue - s.operatingIncome!)) / s.revenue) * 100 : 0,
    operatingMargin: s.revenue && s.operatingIncome ? (s.operatingIncome / s.revenue) * 100 : 0,
    netMargin: s.revenue && s.netIncome ? (s.netIncome / s.revenue) * 100 : 0,
  }));

  // Find margin changes
  const marginChanges = margins.map((m, idx) => {
    const prev = margins[idx + 1];
    if (!prev) return null;
    
    return {
      year: m.year,
      operatingMarginChange: m.operatingMargin - prev.operatingMargin,
      netMarginChange: m.netMargin - prev.netMargin
    };
  }).filter(Boolean);

  return {
    margins,
    marginChanges,
    averageOperatingMargin: margins.reduce((sum, m) => sum + m.operatingMargin, 0) / margins.length
  };
}

function analyzeCashFlow(statements: FinancialStatement[]) {
  if (!statements || statements.length === 0) return null;

  const cashFlowData = statements.slice(0, 5).map(s => ({
    year: new Date(s.date).getFullYear(),
    operatingCashFlow: s.operatingCashFlow || 0,
    freeCashFlow: s.freeCashFlow || 0,
    fcfConversion: s.netIncome ? (s.freeCashFlow! / s.netIncome) * 100 : 0
  }));

  return {
    data: cashFlowData,
    averageFCF: cashFlowData.reduce((sum, d) => sum + d.freeCashFlow, 0) / cashFlowData.length,
    fcfTrend: calculateTrend(cashFlowData.map(d => d.freeCashFlow))
  };
}

function analyzeBalanceSheet(statements: FinancialStatement[]) {
  if (!statements || statements.length === 0) return null;

  const leverageData = statements.slice(0, 5).map(s => ({
    year: new Date(s.date).getFullYear(),
    debtToEquity: s.totalEquity ? (s.totalDebt! / s.totalEquity) : 0,
    totalDebt: s.totalDebt || 0,
    totalEquity: s.totalEquity || 0
  }));

  return {
    data: leverageData,
    currentDebtToEquity: leverageData[0]?.debtToEquity || 0,
    debtTrend: calculateTrend(leverageData.map(d => d.totalDebt))
  };
}

function calculateKeyMetrics(income: FinancialStatement[], balance: FinancialStatement[]) {
  const latest = income[0];
  const latestBalance = balance[0] || {};
  
  return {
    currentPE: latest.eps ? latest.netIncome! / latest.eps : null,
    roe: latestBalance.totalEquity ? (latest.netIncome! / latestBalance.totalEquity) * 100 : null,
    currentRatio: latestBalance.totalAssets ? latestBalance.totalAssets / (latestBalance.totalDebt || 1) : null
  };
}

function calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 2) return 'stable';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const change = ((firstAvg - secondAvg) / secondAvg) * 100;
  
  if (change > 5) return 'increasing';
  if (change < -5) return 'decreasing';
  return 'stable';
}
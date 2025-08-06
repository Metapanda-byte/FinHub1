"use client";

import useSWR from 'swr';
import React from 'react';

// Simple fetcher for internal API routes
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
  return response.json();
};

// Company Profile Hook
export function useCompanyProfile(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/financial/profile?symbol=${symbol}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5 * 60 * 1000, // 5 minutes
    }
  );

  return {
    profile: Array.isArray(data) ? data[0] : data,
    isLoading,
    error
  };
}

// Income Statements Hook
export function useIncomeStatements(symbol: string, period: 'annual' | 'quarter' = 'annual') {
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/financial/income-statement?symbol=${symbol}&period=${period}&limit=10` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 24 * 60 * 60 * 1000, // 24 hours
    }
  );

  return {
    statements: data || [],
    isLoading,
    error
  };
}

// Balance Sheets Hook
export function useBalanceSheets(symbol: string, period: 'annual' | 'quarter' = 'annual') {
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/financial/balance-sheet?symbol=${symbol}&period=${period}&limit=10` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 24 * 60 * 60 * 1000, // 24 hours
    }
  );

  return {
    statements: data || [],
    isLoading,
    error
  };
}

// Cash Flow Statements Hook
export function useCashFlows(symbol: string, period: 'annual' | 'quarter' = 'annual') {
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/financial/cash-flow?symbol=${symbol}&period=${period}&limit=10` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 24 * 60 * 60 * 1000, // 24 hours
    }
  );

  return {
    statements: data || [],
    isLoading,
    error
  };
}

// Financial Ratios Hook
export function useFinancialRatios(symbol: string, period: 'annual' | 'quarter' = 'annual') {
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/financial/ratios?symbol=${symbol}&period=${period}&limit=10` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 24 * 60 * 60 * 1000, // 24 hours
    }
  );

  return {
    ratios: data || [],
    isLoading,
    error
  };
}

// Key Metrics Hook
export function useKeyMetrics(symbol: string, period: 'annual' | 'quarter' = 'annual') {
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/financial/key-metrics?symbol=${symbol}&period=${period}&limit=10` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 24 * 60 * 60 * 1000, // 24 hours
    }
  );

  return {
    metrics: data || [],
    isLoading,
    error
  };
}

// Stock Quote Hook
export function useStockQuote(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/financial/quote?symbol=${symbol}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5 * 60 * 1000, // 5 minutes
    }
  );

  return {
    quote: Array.isArray(data) ? data[0] : data,
    isLoading,
    error
  };
}

// Stock Price Data Hook (matching old implementation)
export function useStockPriceData(symbol: string, timeframe?: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/stock/${symbol}/price?timeframe=${timeframe || 'YTD'}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Process data to match old implementation format
  const prices = React.useMemo(() => {
    if (!Array.isArray(data)) return [];
    
    let processedData = data;
    
    // For YTD, filter to only include data from Jan 1 of current year (matching old implementation)
    if (timeframe === 'YTD') {
      const janFirst = new Date(new Date().getFullYear(), 0, 1);
      processedData = data.filter((item: any) => new Date(item.date) >= janFirst);
    }
    
    return processedData;
  }, [data, timeframe]);

  return {
    prices,
    isLoading,
    error
  };
}

// Revenue Segments TTM Hook
export function useRevenueSegmentsTTM(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/stock/${symbol}/revenue-segments` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 24 * 60 * 60 * 1000, // 24 hours
    }
  );

  return {
    segments: data || [],
    referenceDate: data && data.length > 0 ? new Date().toISOString() : null,
    isLoading,
    error
  };
}

// Geographic Revenue TTM Hook
export function useGeographicRevenueTTM(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/stock/${symbol}/geographic-revenue` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 24 * 60 * 60 * 1000, // 24 hours
    }
  );

  return {
    regions: data || [],
    referenceDate: data && data.length > 0 ? new Date().toISOString() : null,
    isLoading,
    error
  };
}

export function useEmployeeCount(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/stock/${symbol}/employee-count` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 24 * 60 * 60 * 1000, // 24 hours
    }
  );

  return {
    employeeCount: data?.employeeCount || null,
    isLoading,
    error
  };
}

export function usePriceTarget(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/stock/${symbol}/price-target` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 24 * 60 * 60 * 1000, // 24 hours
    }
  );

  return {
    priceTarget: data?.priceTarget || null,
    isLoading,
    error
  };
}

export function useAnalystRatings(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/stock/${symbol}/analyst-ratings` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 24 * 60 * 60 * 1000, // 24 hours
    }
  );

  return {
    ratings: data?.ratings || null,
    isLoading,
    error
  };
}

export function useInstitutionalOwnership(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/stock/${symbol}/institutional-ownership` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 24 * 60 * 60 * 1000, // 24 hours
    }
  );

  return {
    ownership: data?.ownership || [],
    isLoading,
    error
  };
}

export function useESGScore(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/stock/${symbol}/esg-score` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 24 * 60 * 60 * 1000, // 24 hours
    }
  );

  return {
    esgScore: data?.esgScore || null,
    isLoading,
    error
  };
}

export function useSECFilings(symbol: string) {
  return { data: [], error: null };
}

export function useEarningsTranscriptDates(symbol: string) {
  return { data: [], error: null };
}

// DCF Analysis Hook
export function useDCFAnalysis(symbol: string, assumptions?: any) {
  return { 
    dcfData: null, 
    isLoading: false, 
    error: new Error('DCF Analysis not yet implemented') 
  };
}

// Custom DCF Assumptions interface
export interface CustomDCFAssumptions {
  discountRate: number;
  longTermGrowthRate: number;
  projectionYears: number;
  revenueGrowthRates: number[];
  operatingMarginTarget: number;
  taxRate: number;
  capexAsPercentOfRevenue: number;
  workingCapitalChangeAsPercentOfRevenue: number;
}
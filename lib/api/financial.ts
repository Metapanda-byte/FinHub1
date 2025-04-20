import axios from 'axios';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase/client';

const API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api/v4';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

async function fetchWithCache<T>(endpoint: string, ticker?: string): Promise<T> {
  if (!ticker) return Promise.reject('No ticker provided');

  try {
    // Check cache first
    console.log(`Checking cache for ${ticker} ${endpoint}`);
    const { data: cachedData, error: cacheError } = await supabase
      .from('api_cache')
      .select('data')
      .eq('ticker', ticker)
      .eq('endpoint', endpoint)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (cacheError) {
      console.error('Cache error:', cacheError);
      throw cacheError;
    }

    if (cachedData) {
      console.log(`Cache hit for ${ticker} ${endpoint}`);
      return cachedData.data as T;
    }

    console.log(`Cache miss for ${ticker} ${endpoint}, fetching from API`);
    // If not in cache, fetch from API
    const url = `${BASE_URL}${endpoint}?symbol=${ticker}&apikey=${API_KEY}&period=annual`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    const data = await response.json();

    // Cache the result
    console.log(`Caching data for ${ticker} ${endpoint}`);
    const expiresAt = new Date(Date.now() + CACHE_DURATION);
    const { error: upsertError } = await supabase
      .from('api_cache')
      .upsert({
        ticker,
        endpoint,
        data,
        expires_at: expiresAt.toISOString()
      }, {
        onConflict: 'ticker,endpoint'
      });

    if (upsertError) {
      console.error('Cache upsert error:', upsertError);
      throw upsertError;
    }

    return data;
  } catch (error) {
    console.error('fetchWithCache error:', error);
    throw error;
  }
}

export function useCompanyProfile(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? ['/profile/' + symbol, symbol] : null,
    ([endpoint, symbol]) => fetchWithCache<CompanyProfile[]>(endpoint, symbol),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
    }
  );

  return {
    profile: data?.[0],
    isLoading,
    error,
  };
}

export function useFinancialRatios(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? [`/ratios/${symbol}`, symbol] : null,
    ([endpoint, symbol]) => fetchWithCache<FinancialRatio[]>(endpoint, symbol),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
    }
  );

  return {
    ratios: data,
    isLoading,
    error,
  };
}

export function useIncomeStatements(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? [`/income-statement/${symbol}`, symbol] : null,
    ([endpoint, symbol]) => fetchWithCache<IncomeStatement[]>(endpoint, symbol),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
    }
  );

  return {
    statements: data,
    isLoading,
    error,
  };
}

export function useCashFlowStatements(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? [`/cash-flow-statement/${symbol}`, symbol] : null,
    ([endpoint, symbol]) => fetchWithCache<CashFlowStatement[]>(endpoint, symbol),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
    }
  );

  return {
    statements: data,
    isLoading,
    error,
  };
}

export function useBalanceSheets(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? [`/balance-sheet-statement/${symbol}`, symbol] : null,
    ([endpoint, symbol]) => fetchWithCache<BalanceSheet[]>(endpoint, symbol),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
    }
  );

  return {
    statements: data,
    isLoading,
    error,
  };
}

export function useStockPrice(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? [`/historical-price-full/${symbol}`, symbol] : null,
    ([endpoint, symbol]) => fetchWithCache<StockPrice>(endpoint, symbol),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5 * 60 * 1000, // 5 minutes for stock prices
    }
  );

  return {
    prices: data?.historical,
    isLoading,
    error,
  };
}

export function useRevenueSegments(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? [`/revenue-segment`, symbol] : null,
    ([endpoint, symbol]) => fetchWithCache<RevenueProductSegment[]>(endpoint, symbol),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
    }
  );

  return {
    segments: data?.filter(s => s.revenue > 0).map(s => ({
      name: s.segment,
      value: s.revenue / 1e9,
      percentage: (s.revenue / s.totalRevenue) * 100
    })) || [],
    isLoading,
    error,
  };
}

export function useGeographicRevenue(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? [`/revenue-geographic`, symbol] : null,
    ([endpoint, symbol]) => fetchWithCache<RevenueGeographicSegment[]>(endpoint, symbol),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
    }
  );

  return {
    regions: data?.filter(r => r.revenue > 0).map(r => ({
      name: r.country,
      value: r.revenue / 1e9,
      percentage: (r.revenue / r.totalRevenue) * 100
    })) || [],
    isLoading,
    error,
  };
}
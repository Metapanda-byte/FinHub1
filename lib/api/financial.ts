import useSWR from 'swr';
import { supabase } from '@/lib/supabase/client';

const API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api/v3';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

async function fetchWithCache<T>(endpoint: string, ticker?: string): Promise<T> {
  if (!ticker) return Promise.reject('No ticker provided');
  if (!API_KEY) return Promise.reject('API key is not configured');

  // Validate ticker format (basic check)
  if (!/^[A-Z0-9.]{1,10}$/.test(ticker)) {
    console.error(`Invalid ticker format: ${ticker}`);
    return Promise.reject('Invalid ticker format');
  }

  try {
    // Check cache first
    const { data: cachedData, error: cacheError } = await supabase
      .from('api_cache')
      .select('data')
      .eq('ticker', ticker)
      .eq('endpoint', endpoint)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (cacheError) {
      console.error(`Cache error for ticker ${ticker}:`, cacheError);
      throw new Error(`Cache error: ${cacheError.message}`);
    }

    if (cachedData) {
      return cachedData.data as T;
    }

    // If not in cache, fetch from API
    const url = `${BASE_URL}/${endpoint}/${ticker}?apikey=${API_KEY}`;
    const response = await fetch(url);
    
    // Check for specific HTTP status codes
    if (response.status === 401 || response.status === 403) {
      throw new Error('Invalid API key or unauthorized access');
    }
    if (response.status === 429) {
      throw new Error('API rate limit exceeded');
    }
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Handle empty data more gracefully
    if (!data) {
      console.warn(`No data returned from API for ticker ${ticker} on endpoint ${endpoint}`);
      return Array.isArray([] as unknown as T) ? [] as unknown as T : {} as T;
    }

    // For array responses, return empty array if no data
    if (Array.isArray(data) && data.length === 0) {
      console.warn(`Empty array returned from API for ticker ${ticker} on endpoint ${endpoint}`);
      return [] as unknown as T;
    }

    if (data.error) {
      console.error(`API Error for ticker ${ticker}:`, data.error);
      throw new Error(`API Error: ${data.error}`);
    }

    // Cache the result
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
      console.error(`Cache update error for ticker ${ticker}:`, upsertError);
      // Don't throw here, just log the error as the API data is still valid
    }

    return data;
  } catch (error) {
    console.error(`fetchWithCache error for ticker ${ticker}:`, error);
    throw error instanceof Error ? error : new Error('An unexpected error occurred');
  }
}

export function useCompanyProfile(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? [`profile`, symbol] : null,
    ([endpoint]) => fetchWithCache<any[]>(endpoint, symbol),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
    }
  );

  return {
    profile: data?.[0] || null,
    isLoading,
    error,
  };
}

export function useIncomeStatements(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? [`income-statement`, symbol] : null,
    ([endpoint]) => fetchWithCache<any[]>(endpoint, symbol),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
    }
  );

  return {
    statements: data || [],
    isLoading,
    error,
  };
}

export function useCashFlowStatements(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? [`cash-flow-statement`, symbol] : null,
    ([endpoint]) => fetchWithCache<any[]>(endpoint, symbol),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
    }
  );

  return {
    statements: data || [],
    isLoading,
    error,
  };
}

export function useBalanceSheets(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? [`balance-sheet-statement`, symbol] : null,
    ([endpoint]) => fetchWithCache<any[]>(endpoint, symbol),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
    }
  );

  return {
    statements: data || [],
    isLoading,
    error,
  };
}

export function useStockPrice(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? [`historical-price-full`, symbol] : null,
    ([endpoint]) => fetchWithCache<any>(endpoint, symbol),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5 * 60 * 1000, // 5 minutes for stock prices
    }
  );

  return {
    prices: data?.historical || [],
    isLoading,
    error,
  };
}

export function useRevenueSegments(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? [`revenue-segment`, symbol] : null,
    ([endpoint]) => fetchWithCache<any[]>(endpoint, symbol),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
    }
  );

  return {
    segments: data?.map((s: any) => ({
      name: s.segment,
      value: s.revenue / 1e9,
      percentage: (s.revenue / s.totalRevenue) * 100
    })).filter((s: any) => s.value > 0).sort((a: any, b: any) => b.value - a.value) || [],
    isLoading,
    error,
  };
}

export function useGeographicRevenue(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? [`revenue-geographic`, symbol] : null,
    ([endpoint]) => fetchWithCache<any[]>(endpoint, symbol),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
    }
  );

  return {
    regions: data?.map((r: any) => ({
      name: r.country,
      value: r.revenue / 1e9,
      percentage: (r.revenue / r.totalRevenue) * 100
    })).filter((r: any) => r.value > 0).sort((a: any, b: any) => b.value - a.value) || [],
    isLoading,
    error,
  };
}

export function useCompetitorAnalysis(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? [`stock-peers`, symbol] : null,
    ([endpoint]) => fetchWithCache<string[]>(endpoint, symbol),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
    }
  );

  return {
    peers: data || [],
    isLoading,
    error,
  };
}
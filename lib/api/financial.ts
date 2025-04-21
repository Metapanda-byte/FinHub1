"use client";

import React from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase/client';

const API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api/v3';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

async function fetchWithCache<T>(endpoint: string, ticker?: string, params?: Record<string, string>): Promise<T | null> {
  if (!ticker) return null;
  if (!API_KEY) throw new Error('API key is not configured');

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
      console.warn(`Cache error for ticker ${ticker}:`, cacheError);
      // Continue with API call if cache fails
    } else if (cachedData) {
      return cachedData.data as T;
    }

    // Construct query parameters
    const queryParams = new URLSearchParams({
      apikey: API_KEY,
      limit: '120',
      ...(params || {})
    });

    // If not in cache, fetch from API
    const url = `${BASE_URL}/${endpoint}/${ticker}?${queryParams}`;
    const response = await fetch(url);
    
    if (response.status === 404) {
      console.warn(`No data available for ticker ${ticker} at endpoint ${endpoint}`);
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Handle empty responses
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.warn(`No data returned for ticker ${ticker} at endpoint ${endpoint}`);
      return null;
    }

    // Handle API error responses
    if (data.error) {
      console.warn(`API error for ticker ${ticker}:`, data.error);
      return null;
    }

    // Cache successful results
    const expiresAt = new Date(Date.now() + CACHE_DURATION);
    await supabase
      .from('api_cache')
      .upsert({
        ticker,
        endpoint,
        data,
        expires_at: expiresAt.toISOString()
      }, {
        onConflict: 'ticker,endpoint'
      });

    return data;
  } catch (error) {
    console.warn(`fetchWithCache error for ticker ${ticker}:`, error);
    return null;
  }
}

export function useCompanyProfile(symbol: string) {
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `profile/${symbol}` : null,
    () => fetchWithCache<any[]>('profile', symbol),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
      shouldRetryOnError: false
    }
  );

  return {
    profile: data?.[0] || null,
    isLoading,
    error,
    mutate
  };
}

export function useIncomeStatements(symbol: string) {
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `income-statement/${symbol}` : null,
    () => fetchWithCache<any[]>('income-statement', symbol),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
      shouldRetryOnError: false
    }
  );

  // Ensure we always return an array, even if empty
  const statements = Array.isArray(data) ? data : [];
  
  return {
    statements,
    isLoading,
    error,
    mutate
  };
}

export function useCashFlowStatements(symbol: string) {
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `cash-flow-statement/${symbol}` : null,
    () => fetchWithCache<any[]>('cash-flow-statement', symbol),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
      shouldRetryOnError: false
    }
  );

  return {
    statements: Array.isArray(data) ? data : [],
    isLoading,
    error,
    mutate
  };
}

export function useBalanceSheets(symbol: string) {
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `balance-sheet-statement/${symbol}` : null,
    () => fetchWithCache<any[]>('balance-sheet-statement', symbol),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
      shouldRetryOnError: false
    }
  );

  return {
    statements: Array.isArray(data) ? data : [],
    isLoading,
    error,
    mutate
  };
}

export function useStockPrice(symbol: string) {
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `historical-price/${symbol}` : null,
    () => fetchWithCache<any>('historical-price', symbol),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5 * 60 * 1000, // 5 minutes for stock prices
      shouldRetryOnError: false
    }
  );

  return {
    prices: data?.historical || [],
    isLoading,
    error,
    mutate
  };
}

export function useRevenueSegments(symbol: string) {
  console.log(`[useRevenueSegments] Hook called for symbol: ${symbol}`);
  
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? ['revenue-product-segmentation', symbol] : null,
    () => fetchWithCache<any[]>('revenue-product-segmentation', symbol),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
      shouldRetryOnError: false
    }
  );

  const segments = React.useMemo(() => {
    console.log('[useRevenueSegments] useMemo executing. Raw SWR data:', data);

    if (!Array.isArray(data) || data.length === 0) {
      console.log('[useRevenueSegments] Returning [] due to invalid/empty raw data.');
      return [];
    }

    const latestYearEntry = data[0];
    console.log('[useRevenueSegments] Latest year entry:', latestYearEntry);

    if (!latestYearEntry?.data || typeof latestYearEntry.data !== 'object') {
      console.log('[useRevenueSegments] Returning [] due to invalid latestYearEntry.data.');
      return [];
    }

    const segmentsObject = latestYearEntry.data;
    console.log('[useRevenueSegments] Segments object:', segmentsObject);

    const totalRevenue = Object.values(segmentsObject).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
    console.log('[useRevenueSegments] Calculated totalRevenue:', totalRevenue);

    if (totalRevenue <= 0) {
      console.log('[useRevenueSegments] Returning [] due to zero totalRevenue.');
      return [];
    }

    const processed = Object.entries(segmentsObject)
      .map(([name, value]) => ({
        name,
        value: Number(value) / 1e9, // Convert to billions
        percentage: (Number(value) / totalRevenue) * 100
      }))
      .filter(segment => segment.value > 0)
      .sort((a, b) => b.value - a.value);

    console.log('[useRevenueSegments] Processed segments:', processed);
    return processed;
  }, [data]);

  return {
    segments,
    isLoading,
    error,
    mutate
  };
}

export function useGeographicRevenue(symbol: string) {
  console.log(`[useGeographicRevenue] Hook called for symbol: ${symbol}`);
  
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? ['revenue-geographic-segmentation', symbol] : null,
    () => fetchWithCache<any[]>('revenue-geographic-segmentation', symbol),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
      shouldRetryOnError: false
    }
  );

  const regions = React.useMemo(() => {
    console.log('[useGeographicRevenue] useMemo executing. Raw SWR data:', data);

    if (!Array.isArray(data) || data.length === 0) {
      console.log('[useGeographicRevenue] Returning [] due to invalid/empty raw data.');
      return [];
    }

    const latestYearEntry = data[0];
    console.log('[useGeographicRevenue] Latest year entry:', latestYearEntry);

    if (!latestYearEntry?.data || typeof latestYearEntry.data !== 'object') {
      console.log('[useGeographicRevenue] Returning [] due to invalid latestYearEntry.data.');
      return [];
    }

    const regionsObject = latestYearEntry.data;
    console.log('[useGeographicRevenue] Regions object:', regionsObject);

    const totalRevenue = Object.values(regionsObject).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
    console.log('[useGeographicRevenue] Calculated totalRevenue:', totalRevenue);

    if (totalRevenue <= 0) {
      console.log('[useGeographicRevenue] Returning [] due to zero totalRevenue.');
      return [];
    }

    const processed = Object.entries(regionsObject)
      .map(([name, value]) => ({
        name,
        value: Number(value) / 1e9, // Convert to billions
        percentage: (Number(value) / totalRevenue) * 100
      }))
      .filter(region => region.value > 0)
      .sort((a, b) => b.value - a.value);

    console.log('[useGeographicRevenue] Processed regions:', processed);
    return processed;
  }, [data]);

  return {
    regions,
    isLoading,
    error,
    mutate
  };
}

export function useCompetitorAnalysis(symbol: string) {
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `stock-peers/${symbol}` : null,
    () => fetchWithCache<string[]>('stock-peers', symbol),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
      shouldRetryOnError: false
    }
  );

  return {
    peers: Array.isArray(data) ? data : [],
    isLoading,
    error,
    mutate
  };
}
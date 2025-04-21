"use client";

import React from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase/client';

const API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60 * 1000,
  requests: new Map<string, number[]>()
};

function canMakeRequest(endpoint: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.windowMs;
  let requests = RATE_LIMIT.requests.get(endpoint) || [];
  requests = requests.filter(timestamp => timestamp > windowStart);
  RATE_LIMIT.requests.set(endpoint, requests);
  return requests.length < RATE_LIMIT.maxRequests;
}

function trackRequest(endpoint: string) {
  const requests = RATE_LIMIT.requests.get(endpoint) || [];
  requests.push(Date.now());
  RATE_LIMIT.requests.set(endpoint, requests);
}

async function fetchWithCache<T>(endpoint: string, ticker?: string, version: string = 'v3'): Promise<T | null> {
  if (!ticker) return null;
  if (!API_KEY) throw new Error('API key is not configured');

  try {
    // Check cache first
    const { data: cachedData, error: cacheError } = await supabase
      .from('api_cache')
      .select('data')
      .eq('ticker', ticker)
      .eq('endpoint', `${version}/${endpoint}`)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (!cacheError && cachedData) {
      console.log(`[Cache Hit] ${version}/${endpoint}/${ticker}`);
      return cachedData.data as T;
    }

    if (!canMakeRequest(endpoint)) {
      console.warn(`[Rate Limit] ${version}/${endpoint}/${ticker} - Too many requests`);
      if (cachedData) {
        console.log(`[Cache Fallback] ${version}/${endpoint}/${ticker} - Using expired cache`);
        return cachedData.data as T;
      }
      return null;
    }

    trackRequest(endpoint);

    const baseUrl = `https://financialmodelingprep.com/api/${version}`;
    const url = version === 'v4'
      ? `${baseUrl}/${endpoint}?symbol=${ticker}&apikey=${API_KEY}&structure=default&period=annual`
      : `${baseUrl}/${endpoint}/${ticker}?apikey=${API_KEY}`;
    
    console.log(`[API Request] ${version}/${endpoint}/${ticker} (${url})`);
    const response = await fetch(url);
    
    if (response.status === 429) {
      console.warn(`[Rate Limit] ${version}/${endpoint}/${ticker} - API rate limit exceeded`);
      if (cachedData) {
        console.log(`[Cache Fallback] ${version}/${endpoint}/${ticker} - Using expired cache`);
        return cachedData.data as T;
      }
      return null;
    }
    
    if (response.status === 404) {
      console.warn(`[Not Found] ${version}/${endpoint}/${ticker}`);
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log(`[API Response Raw Data] ${version}/${endpoint}/${ticker}:`, JSON.stringify(data, null, 2));

    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.warn(`[Empty Response] ${version}/${endpoint}/${ticker}`);
      return null;
    }

    if (data.error) {
      console.warn(`[API Error] ${version}/${endpoint}/${ticker}:`, data.error);
      return null;
    }

    const expiresAt = new Date(Date.now() + CACHE_DURATION);
    await supabase
      .from('api_cache')
      .upsert({
        ticker,
        endpoint: `${version}/${endpoint}`,
        data,
        expires_at: expiresAt.toISOString()
      }, {
        onConflict: 'ticker,endpoint'
      });

    return data;
  } catch (error) {
    console.error(`[Error] ${version}/${endpoint}/${ticker}:`, error);
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

  return {
    statements: Array.isArray(data) ? data : [],
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
      dedupingInterval: 5 * 60 * 1000,
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
    symbol ? `revenue-product-segmentation/${symbol}` : null,
    () => fetchWithCache<any[]>('revenue-product-segmentation', symbol, 'v4'),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
      shouldRetryOnError: false
    }
  );

  const segments = React.useMemo(() => {
    console.log('[useRevenueSegments] Raw data structure:', data);

    if (!Array.isArray(data) || data.length === 0) {
      console.log('[useRevenueSegments] Returning [] due to invalid/empty data.');
      return [];
    }

    // Get the most recent period's data
    const mostRecentEntry = data[0]; // First entry is the most recent
    const dateKey = Object.keys(mostRecentEntry)[0]; // Get the date key
    const segmentData = mostRecentEntry[dateKey]; // Get the segment data

    console.log('[useRevenueSegments] Most recent data:', { date: dateKey, data: segmentData });

    if (!segmentData || typeof segmentData !== 'object') return [];

    // Calculate total revenue
    const totalRevenue = Object.values(segmentData).reduce((sum, value) => sum + (value as number), 0);

    const processed = Object.entries(segmentData)
      .map(([name, revenue]) => ({
        name,
        value: (revenue as number) / 1e9, // Convert to billions
        percentage: ((revenue as number) / totalRevenue) * 100
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
    symbol ? `revenue-geographic-segmentation/${symbol}` : null,
    () => fetchWithCache<any[]>('revenue-geographic-segmentation', symbol, 'v4'),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
      shouldRetryOnError: false
    }
  );

  const regions = React.useMemo(() => {
    console.log('[useGeographicRevenue] Raw data structure:', data);

    if (!Array.isArray(data) || data.length === 0) {
      console.log('[useGeographicRevenue] Returning [] due to invalid/empty data.');
      return [];
    }

    // Get the most recent period's data
    const mostRecentEntry = data[0]; // First entry is the most recent
    const dateKey = Object.keys(mostRecentEntry)[0]; // Get the date key
    const regionData = mostRecentEntry[dateKey]; // Get the region data

    console.log('[useGeographicRevenue] Most recent data:', { date: dateKey, data: regionData });

    if (!regionData || typeof regionData !== 'object') return [];

    // Calculate total revenue
    const totalRevenue = Object.values(regionData).reduce((sum, value) => sum + (value as number), 0);

    const processed = Object.entries(regionData)
      .map(([name, revenue]) => ({
        name: name.replace(' Segment', ''), // Clean up the segment suffix
        value: (revenue as number) / 1e9, // Convert to billions
        percentage: ((revenue as number) / totalRevenue) * 100
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
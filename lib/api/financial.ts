"use client";

import React from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { fetchWithCache } from './fetch';
import type { 
  IncomeStatement, 
  BalanceSheet, 
  CashFlowStatement,
  Period,
  RevenueSegment,
  GeographicRevenue
} from '../types/financial';

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

export function useIncomeStatements(symbol: string, period: Period = 'annual') {
  return useQuery({
    queryKey: ['income-statements', symbol, period],
    queryFn: () => fetchWithCache(`income-statement/${symbol}?period=${period}`) as Promise<IncomeStatement[]>,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useCashFlowStatements(symbol: string, period: Period = 'annual') {
  return useQuery({
    queryKey: ['cash-flow-statements', symbol, period],
    queryFn: () => fetchWithCache(`cash-flow-statement/${symbol}?period=${period}`) as Promise<CashFlowStatement[]>,
    staleTime: 1000 * 60 * 60,
  });
}

export function useBalanceSheets(symbol: string, period: Period = 'annual') {
  return useQuery({
    queryKey: ['balance-sheets', symbol, period],
    queryFn: () => fetchWithCache(`balance-sheet-statement/${symbol}?period=${period}`) as Promise<BalanceSheet[]>,
    staleTime: 1000 * 60 * 60,
  });
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
  return useQuery({
    queryKey: ['revenue-segments', symbol],
    queryFn: () => fetchWithCache(`revenue-segments/${symbol}`) as Promise<RevenueSegment[]>,
    staleTime: 1000 * 60 * 60,
  });
}

export function useGeographicRevenue(symbol: string) {
  return useQuery({
    queryKey: ['geographic-revenue', symbol],
    queryFn: () => fetchWithCache(`geographic-revenue/${symbol}`) as Promise<GeographicRevenue[]>,
    staleTime: 1000 * 60 * 60,
  });
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
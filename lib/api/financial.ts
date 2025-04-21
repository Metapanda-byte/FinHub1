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

export function useCompanyProfile(symbol: string) {
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `profile/${symbol}` : null,
    () => fetchWithCache(`profile/${symbol}`),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 1000 * 60 * 60,
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
    () => fetchWithCache(`historical-price/${symbol}`),
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
    () => fetchWithCache(`stock-peers/${symbol}`),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 1000 * 60 * 60,
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
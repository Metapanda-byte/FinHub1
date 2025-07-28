"use client";

import React from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase/client';

const API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;

// Different cache durations for different types of data
const CACHE_DURATIONS = {
  PROFILE: 7 * 24 * 60 * 60 * 1000, // 7 days - company profile changes rarely
  FINANCIAL_STATEMENTS: 24 * 60 * 60 * 1000, // 24 hours - financial data
  SEGMENTS: 24 * 60 * 60 * 1000, // 24 hours - segment data  
  STOCK_PRICE: 5 * 60 * 1000, // 5 minutes - stock prices change frequently
  EMPLOYEE_COUNT: 30 * 24 * 60 * 60 * 1000, // 30 days - employee count changes rarely
  PEERS: 7 * 24 * 60 * 60 * 1000 // 7 days - peer relationships change rarely
};

const CACHE_DURATION = CACHE_DURATIONS.FINANCIAL_STATEMENTS; // Default

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

async function fetchWithCache<T>(endpoint: string, ticker?: string, version: string = 'v3', period: 'annual' | 'quarter' = 'annual', cacheMs: number = CACHE_DURATION): Promise<T | null> {
  if (!ticker) return null;
      if (!API_KEY) {
      console.warn(`[API Warning] No API key configured for ${endpoint}/${ticker}`);
      return null;
    }

  try {
    // Temporarily bypass cache for testing
    console.log(`[Cache Bypass] ${version}/${endpoint}/${period}/${ticker} - Skipping cache`);

    if (!canMakeRequest(endpoint)) {
      console.warn(`[Rate Limit] ${version}/${endpoint}/${period}/${ticker} - Too many requests`);
      return null;
    }

    trackRequest(endpoint);

    const baseUrl = `https://financialmodelingprep.com/api/${version}`;
    let url: string;
    
    if (version === 'v4') {
      url = `${baseUrl}/${endpoint}?symbol=${ticker}&apikey=${API_KEY}&structure=default&period=${period}`;
    } else if (endpoint.includes('historical-price-full')) {
      // Special handling for historical price data
      url = `${baseUrl}/${endpoint}&apikey=${API_KEY}`;
    } else {
      url = `${baseUrl}/${endpoint}/${ticker}?apikey=${API_KEY}&period=${period}`;
    }
    
    console.log(`[API Request] ${version}/${endpoint}/${period}/${ticker}`);
    console.log(`[API URL] ${url}`);
    
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.status === 429) {
      console.warn(`[Rate Limit] ${version}/${endpoint}/${period}/${ticker} - API rate limit exceeded`);
      return null;
    }
    
    if (response.status === 404) {
      console.warn(`[Not Found] ${version}/${endpoint}/${period}/${ticker}`);
      return null;
    }
    
    if (!response.ok) {
      console.error(`[API Error] ${version}/${endpoint}/${period}/${ticker} - Status: ${response.status}`);
      const errorText = await response.text();
      console.error(`[API Error Details] ${errorText}`);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log(`[API Response] ${version}/${endpoint}/${period}/${ticker} - Data type:`, typeof data);
    console.log(`[API Response] ${version}/${endpoint}/${period}/${ticker} - Is Array:`, Array.isArray(data));
    console.log(`[API Response] ${version}/${endpoint}/${period}/${ticker} - Length:`, Array.isArray(data) ? data.length : 'N/A');
    if (Array.isArray(data) && data.length > 0) {
      console.log(`[API Response] ${version}/${endpoint}/${period}/${ticker} - First item:`, data[0]);
    }
    console.log(`[API Response Is Array] ${version}/${endpoint}/${period}/${ticker}:`, Array.isArray(data));

    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.warn(`[Empty Response] ${version}/${endpoint}/${period}/${ticker}`);
      return null;
    }

    if (data.error) {
      console.warn(`[API Error] ${version}/${endpoint}/${period}/${ticker}:`, data.error);
      return null;
    }

    // Check if the response contains an error message
    if (data["Error Message"]) {
      console.warn(`[API Error] ${version}/${endpoint}/${period}/${ticker}:`, data["Error Message"]);
      return null;
    }

    const expiresAt = new Date(Date.now() + cacheMs);
    await supabase
      .from('api_cache')
      .upsert({
        ticker,
        endpoint: `${version}/${endpoint}/${period}`,
        data,
        expires_at: expiresAt.toISOString()
      }, {
        onConflict: 'ticker,endpoint'
      });

    return data;
  } catch (error) {
    console.error(`[Error] ${version}/${endpoint}/${period}/${ticker}:`, error);
    return null;
  }
}

export interface CompanyProfile {
  symbol: string;
  price: number;
  beta: number;
  volAvg: number;
  mktCap: number;
  lastDiv: number;
  range: string;
  changes: number;
  companyName: string;
  currency: string;
  cik: string;
  isin: string;
  cusip: string;
  exchange: string;
  exchangeShortName: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  country: string;
  fullTimeEmployees: number;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dcfDiff: number;
  dcf: number;
  image: string;
  ipoDate: string;
  defaultImage: boolean;
  isEtf: boolean;
  isActivelyTrading: boolean;
  isAdr: boolean;
  isFund: boolean;
}

function isValidCompanyProfile(data: any): data is CompanyProfile {
  if (!data || typeof data !== 'object') return false;

  // Required fields that must be present and of correct type
  const requiredFields: Array<[string, string]> = [
    ['symbol', 'string'],
    ['companyName', 'string'],
    ['exchange', 'string'],
    ['industry', 'string'],
    ['sector', 'string']
  ];

  for (const [field, type] of requiredFields) {
    if (!(field in data) || typeof data[field] !== type) {
      console.warn(`[Validation] Missing or invalid required field: ${field}`);
      return false;
    }
  }

  // Numeric fields that should be numbers if present
  const numericFields = [
    'price', 'beta', 'volAvg', 'mktCap', 'lastDiv', 'changes',
    'fullTimeEmployees', 'dcfDiff', 'dcf'
  ];

  for (const field of numericFields) {
    if (field in data && (typeof data[field] !== 'number' || isNaN(data[field]))) {
      console.warn(`[Validation] Invalid numeric field: ${field}`);
      data[field] = null;
    }
  }

  // Boolean fields that should be booleans if present
  const booleanFields = ['defaultImage', 'isEtf', 'isActivelyTrading', 'isAdr', 'isFund'];
  
  for (const field of booleanFields) {
    if (field in data && typeof data[field] !== 'boolean') {
      console.warn(`[Validation] Invalid boolean field: ${field}`);
      data[field] = false;
    }
  }

  return true;
}

export function useCompanyProfile(symbol: string) {
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `profile/${symbol}` : null,
    () => fetchWithCache<any[]>('profile', symbol, 'v3', 'annual', CACHE_DURATIONS.PROFILE),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATIONS.PROFILE,
      shouldRetryOnError: false
    }
  );

  const profile = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn(`[CompanyProfile] Invalid or empty data for ${symbol}`);
      return null;
    }

    const profileData = data[0];
    if (!isValidCompanyProfile(profileData)) {
      console.warn(`[CompanyProfile] Invalid profile data structure for ${symbol}`);
      return null;
    }

    // Ensure all required fields have default values
    return {
      ...profileData,
      description: profileData.description || 'No description available',
      ceo: profileData.ceo || 'N/A',
      city: profileData.city || 'N/A',
      state: profileData.state || 'N/A',
      mktCap: profileData.mktCap || 0,
      fullTimeEmployees: profileData.fullTimeEmployees || null
    };
  }, [data, symbol]);

  return {
    profile,
    isLoading,
    error,
    mutate
  };
}

export function useIncomeStatements(symbol: string, period: 'annual' | 'quarter' = 'annual') {
  const { data, error, isLoading, mutate } = useSWR(
    symbol && API_KEY ? `income-statement/${symbol}/${period}` : null,
    async () => {
      if (!API_KEY) {
        console.log(`[useIncomeStatements] No API key available for ${symbol}`);
        throw new Error('API key not configured');
      }
      
      try {
        const result = await fetchWithCache<any[]>('income-statement', symbol, 'v3', period, CACHE_DURATIONS.FINANCIAL_STATEMENTS);
        // Check if the result contains an error message indicating subscription limitation
        if (result && Array.isArray(result) && result.length > 0 && result[0]["Error Message"]) {
          console.warn(`[API Subscription] Quarterly data not available for ${symbol}, falling back to annual`);
          // Fallback to annual data if quarterly is not available
          if (period === 'quarter') {
            return await fetchWithCache<any[]>('income-statement', symbol, 'v3', 'annual', CACHE_DURATIONS.FINANCIAL_STATEMENTS);
          }
        }
        return result;
      } catch (err) {
        console.error(`[API Error] Failed to fetch ${period} data for ${symbol}:`, err);
        // Fallback to annual data on error
        if (period === 'quarter') {
          return await fetchWithCache<any[]>('income-statement', symbol, 'v3', 'annual', CACHE_DURATIONS.FINANCIAL_STATEMENTS);
        }
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATIONS.FINANCIAL_STATEMENTS,
      shouldRetryOnError: false
    }
  );

  // Debug: Log all available quarterly date keys from the API response
  if (Array.isArray(data)) {
    console.log('[DEBUG] All available income statement dates:', data.map(entry => entry.date));
  }

  return {
    statements: Array.isArray(data) ? data : [],
    isLoading,
    error,
    mutate
  };
}

export function useCashFlows(symbol: string, period: 'annual' | 'quarter' = 'annual') {
  const { data, error, isLoading, mutate } = useSWR(
    symbol && API_KEY ? `cash-flow-statement/${symbol}/${period}` : null,
    async () => {
      if (!API_KEY) {
        console.log(`[useCashFlows] No API key available for ${symbol}`);
        throw new Error('API key not configured');
      }
      
      try {
        const result = await fetchWithCache<any[]>('cash-flow-statement', symbol, 'v3', period);
        // Check if the result contains an error message indicating subscription limitation
        if (result && Array.isArray(result) && result.length > 0 && result[0]["Error Message"]) {
          console.warn(`[API Subscription] Quarterly data not available for ${symbol}, falling back to annual`);
          // Fallback to annual data if quarterly is not available
          if (period === 'quarter') {
            return await fetchWithCache<any[]>('cash-flow-statement', symbol, 'v3', 'annual');
          }
        }
        return result;
      } catch (err) {
        console.error(`[API Error] Failed to fetch ${period} data for ${symbol}:`, err);
        // Fallback to annual data on error
        if (period === 'quarter') {
          return await fetchWithCache<any[]>('cash-flow-statement', symbol, 'v3', 'annual');
        }
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATIONS.FINANCIAL_STATEMENTS,
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

export function useBalanceSheets(symbol: string, period: 'annual' | 'quarter' = 'annual') {
  const { data, error, isLoading, mutate } = useSWR(
    symbol && API_KEY ? `balance-sheet-statement/${symbol}/${period}` : null,
    async () => {
      if (!API_KEY) {
        console.log(`[useBalanceSheets] No API key available for ${symbol}`);
        throw new Error('API key not configured');
      }
      
      try {
        const result = await fetchWithCache<any[]>('balance-sheet-statement', symbol, 'v3', period);
        // Check if the result contains an error message indicating subscription limitation
        if (result && Array.isArray(result) && result.length > 0 && result[0]["Error Message"]) {
          console.warn(`[API Subscription] Quarterly data not available for ${symbol}, falling back to annual`);
          // Fallback to annual data if quarterly is not available
          if (period === 'quarter') {
            return await fetchWithCache<any[]>('balance-sheet-statement', symbol, 'v3', 'annual');
          }
        }
        return result;
      } catch (err) {
        console.error(`[API Error] Failed to fetch ${period} data for ${symbol}:`, err);
        // Fallback to annual data on error
        if (period === 'quarter') {
          return await fetchWithCache<any[]>('balance-sheet-statement', symbol, 'v3', 'annual');
        }
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATIONS.FINANCIAL_STATEMENTS,
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

interface StockPriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function useStockPriceData(symbol: string, timeframe: 'YTD' | '1Y' | '5Y' = 'YTD') {
  const FMP_API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;
  // Map timeframe to number of days
  const timeseriesMap = {
    'YTD': 365, // Fetch 1 year of data for YTD, will filter in hook
    '1Y': 365,
    '5Y': 1825,
  };
  const timeseries = timeseriesMap[timeframe] || 365;
  const url = symbol
    ? `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?serietype=line&timeseries=${timeseries}&apikey=${FMP_API_KEY}`
    : null;

  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data, error } = useSWR(url, fetcher);

  // Map FMP data to expected format
  let prices = data?.historical?.map((item: any) => ({
    date: item.date,
    price: item.close,
    volume: item.volume,
  })) || [];
  // For YTD, filter to only include data from Jan 1 of current year
  if (timeframe === 'YTD') {
    const janFirst = new Date(new Date().getFullYear(), 0, 1);
    prices = prices.filter((item: any) => new Date(item.date) >= janFirst);
  }

  return {
    prices,
    isLoading: !error && !data,
    error,
  };
}

export interface RevenueSegment {
  [key: string]: number | RevenueSegment;
}

export interface ProcessedSegment {
  name: string;
  value: number;
  percentage: number;
  children?: ProcessedSegment[];
  fullName?: string;
}

function getSimplifiedLabel(fullName: string): string {
  // Normalize US and Non-US region names for geographic revenue
  const usVariants = [
    'us', 'u.s.', 'u.s', 'united states', 'unitedstates', 'usa', 'u.s.a.'
  ];
  const lower = fullName.trim().toLowerCase();
  if (usVariants.some(v => lower === v || lower.endsWith(' ' + v))) {
    return 'United States';
  }
  // If it's not US, label as Non-US for the geography split
  // (You may want to restrict this only for the geography split, but for now, apply globally)
  return 'Non-US';
}

// NEW: Helper to extract concise segment label
function getConciseSegmentLabel(fullName: string): string {
  // Split by ' - ' and return the last non-empty trimmed part
  const parts = fullName.split(' - ').map(p => p.trim()).filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : fullName.trim();
}

function processNestedRevenueData(data: RevenueSegment, parentName: string = '', isGeography: boolean = false): ProcessedSegment[] {
  console.log(`[DEBUG processNestedRevenueData] isGeography: ${isGeography}, data:`, data);
  
  const processed: ProcessedSegment[] = [];
  let totalRevenue = 0;

  // First pass: calculate total revenue from leaf nodes only
  function calculateLeafTotal(obj: RevenueSegment): number {
    return Object.entries(obj).reduce((sum, [_, value]) => {
      if (typeof value === 'number') {
        return sum + value;
      } else if (typeof value === 'object' && value !== null) {
        return sum + calculateLeafTotal(value);
      }
      return 0;
    }, 0);
  }

  totalRevenue = calculateLeafTotal(data);
  console.log(`[DEBUG processNestedRevenueData] Total revenue: ${totalRevenue}`);

  // Second pass: process segments, only including leaf nodes
  function processLeafNodes(obj: RevenueSegment, currentParentName: string = ''): ProcessedSegment[] {
    const segments: ProcessedSegment[] = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      const name = key.replace(' Segment', '');
      const fullName = currentParentName ? `${currentParentName} - ${name}` : name;
      // Use concise label for segments, but preserve fullName for geography
      const displayName = isGeography ? fullName : getConciseSegmentLabel(fullName);
      
      console.log(`[DEBUG processLeafNodes] Processing key: "${key}", fullName: "${fullName}", displayName: "${displayName}", value:`, value);

      if (typeof value === 'number') {
        // Leaf node - actual revenue value
        const segment = {
          name: displayName,
          value: value / 1e9,
          percentage: totalRevenue > 0 ? (value / totalRevenue) * 100 : 0,
          fullName
        };
        console.log(`[DEBUG processLeafNodes] Created segment:`, segment);
        segments.push(segment);
      } else if (typeof value === 'object' && value !== null) {
        // For parent nodes, only process their children
        const childSegments = processLeafNodes(value, fullName);
        segments.push(...childSegments);
      }
    });

    return segments;
  }

  const leafSegments = processLeafNodes(data, parentName);
  console.log(`[DEBUG processNestedRevenueData] Leaf segments:`, leafSegments);

  // Don't remove duplicates for geography - each region should be unique
  // Remove duplicates only for segments, not geography
  const finalSegments = isGeography ? leafSegments : leafSegments.reduce((acc: ProcessedSegment[], current) => {
    const existingIndex = acc.findIndex(item => item.name === current.name);
    if (existingIndex === -1) {
      acc.push(current);
    } else {
      console.log(`[DEBUG processNestedRevenueData] Duplicate found: "${current.name}"`);
    }
    return acc;
  }, []);

  const result = finalSegments
    .filter(segment => segment.value > 0)
    .sort((a, b) => b.value - a.value);
    
  console.log(`[DEBUG processNestedRevenueData] Final result:`, result);
  return result;
}

export function useRevenueSegments(symbol: string) {
  console.log(`[useRevenueSegments] Hook called for symbol: ${symbol}`);
  
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `revenue-product-segmentation/${symbol}` : null,
    () => fetchWithCache<any[]>('revenue-product-segmentation', symbol, 'v4', 'annual', CACHE_DURATIONS.SEGMENTS),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATIONS.SEGMENTS,
      shouldRetryOnError: false
    }
  );

  const segments = React.useMemo(() => {
    console.log('[useRevenueSegments] Raw data structure:', data);

    if (!Array.isArray(data) || data.length === 0) {
      console.log('[useRevenueSegments] Returning [] due to invalid/empty data.');
      return [];
    }

    const mostRecentEntry = data[0];
    const dateKey = Object.keys(mostRecentEntry)[0];
    const segmentData = mostRecentEntry[dateKey] as RevenueSegment;

    console.log('[useRevenueSegments] Most recent data:', { date: dateKey, data: segmentData });

    if (!segmentData || typeof segmentData !== 'object') return [];

    const processed = processNestedRevenueData(segmentData, '', false);
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
    () => fetchWithCache<any[]>('revenue-geographic-segmentation', symbol, 'v4', 'annual', CACHE_DURATIONS.SEGMENTS),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATIONS.SEGMENTS,
      shouldRetryOnError: false
    }
  );

  const regions = React.useMemo(() => {
    console.log('[useGeographicRevenue] Raw data structure:', data);

    if (!Array.isArray(data) || data.length === 0) {
      console.log('[useGeographicRevenue] Returning [] due to invalid/empty data.');
      return [];
    }

    const mostRecentEntry = data[0];
    const dateKey = Object.keys(mostRecentEntry)[0];
    const regionData = mostRecentEntry[dateKey] as RevenueSegment;

    console.log('[useGeographicRevenue] Most recent data:', { date: dateKey, data: regionData });

    if (!regionData || typeof regionData !== 'object') return [];

    const processed = processNestedRevenueData(regionData, '', true);
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
      dedupingInterval: CACHE_DURATIONS.SEGMENTS,
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

// Helper to aggregate TTM for revenue segments or regions
function aggregateTTMRevenue(
  data: any[],
  getDateKey: (entry: any) => string,
  isGeography: boolean,
  actualTTMRevenue?: number | null
): { ttmSegments: ProcessedSegment[], referenceDate: string | null } {
  if (!Array.isArray(data) || data.length === 0) return { ttmSegments: [], referenceDate: null };

  // Sort by date descending (most recent first)
  const sorted = [...data].sort((a, b) => {
    const dateA = new Date(getDateKey(a));
    const dateB = new Date(getDateKey(b));
    return dateB.getTime() - dateA.getTime();
  });

  // Take last 4 quarters
  const ttmEntries = sorted.slice(0, 4);

  // Aggregate all segment/region values
  const aggregate: RevenueSegment = {};
  ttmEntries.forEach(entry => {
    const dateKey = getDateKey(entry);
    const segmentData = entry[dateKey] as RevenueSegment;
    function addToAggregate(obj: RevenueSegment, target: RevenueSegment) {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'number') {
          target[key] = (target[key] as number || 0) + value;
        } else if (typeof value === 'object' && value !== null) {
          if (!target[key]) target[key] = {};
          addToAggregate(value, target[key] as RevenueSegment);
        }
      }
    }
    addToAggregate(segmentData, aggregate);
  });

  // Use the most recent quarter's date as the reference
  const referenceDate = getDateKey(ttmEntries[0]) || null;

  // Process segments
  let ttmSegments = processNestedRevenueData(aggregate, '', isGeography);
  
  // If we have actual TTM revenue, scale segments to match
  if (actualTTMRevenue && ttmSegments.length > 0) {
    const segmentTotal = ttmSegments.reduce((sum, seg) => sum + seg.value, 0);
    if (segmentTotal > 0 && Math.abs(segmentTotal - actualTTMRevenue) > 0.1) {
      const scaleFactor = actualTTMRevenue / segmentTotal;
      console.log(`[DEBUG] Scaling segments by ${scaleFactor} to match actual TTM revenue`);
      ttmSegments = ttmSegments.map(seg => ({
        ...seg,
        value: seg.value * scaleFactor
      }));
    }
  }

  return { ttmSegments, referenceDate };
}


// Hook to fetch TTM income statement data
function useTTMIncomeData(symbol: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? `income-statement/${symbol}?period=ttm` : null,
    () => fetchWithCache<any[]>('income-statement', symbol, 'v3', 'quarter'),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATIONS.SEGMENTS,
      shouldRetryOnError: false
    }
  );
  
  return { ttmIncome: data?.[0], isLoading, error };
}

export function useRevenueSegmentsTTM(symbol: string) {
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `revenue-product-segmentation/${symbol}` : null,
    () => fetchWithCache<any[]>('revenue-product-segmentation', symbol, 'v4', 'annual', CACHE_DURATIONS.SEGMENTS),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATIONS.SEGMENTS,
      shouldRetryOnError: false
    }
  );
  
  // Fetch TTM income data for accurate revenue totals
  const { ttmIncome } = useTTMIncomeData(symbol);

  const { ttmSegments, referenceDate } = React.useMemo(() => {
    console.log('[DEBUG] useRevenueSegmentsTTM - raw data:', data);
    console.log('[DEBUG] useRevenueSegmentsTTM - symbol:', symbol);
    console.log('[DEBUG] TTM Income data:', ttmIncome);
    if (!Array.isArray(data) || data.length === 0) return { ttmSegments: [], referenceDate: null };
    
    // Use actual TTM revenue to ensure consistency across all companies
    const actualTTMRevenue = ttmIncome?.revenue ? ttmIncome.revenue / 1e9 : null;
    const result = aggregateTTMRevenue(data, entry => Object.keys(entry)[0], false, actualTTMRevenue);
    console.log('[DEBUG] useRevenueSegmentsTTM - processed result:', result);
    return result;
  }, [data, symbol, ttmIncome]);

  return {
    segments: ttmSegments,
    referenceDate,
    isLoading,
    error,
    mutate
  };
}

export function useGeographicRevenueTTM(symbol: string) {
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `revenue-geographic-segmentation/${symbol}` : null,
    () => fetchWithCache<any[]>('revenue-geographic-segmentation', symbol, 'v4', 'annual', CACHE_DURATIONS.SEGMENTS),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATIONS.SEGMENTS,
      shouldRetryOnError: false
    }
  );
  
  // Fetch TTM income data for consistency check
  const { ttmIncome } = useTTMIncomeData(symbol);

  // Debug: Log all available date keys from the API response
  if (Array.isArray(data)) {
    console.log('[DEBUG] All available date keys:', data.map(entry => Object.keys(entry)[0]));
  }

  const { ttmSegments, referenceDate } = React.useMemo(() => {
    console.log('[DEBUG] useGeographicRevenueTTM - raw data:', data);
    if (!Array.isArray(data) || data.length === 0) return { ttmSegments: [], referenceDate: null };
    
    // Use actual TTM revenue to ensure geographic data matches total revenue
    const actualTTMRevenue = ttmIncome?.revenue ? ttmIncome.revenue / 1e9 : null;
    const result = aggregateTTMRevenue(data, entry => Object.keys(entry)[0], true, actualTTMRevenue);
    console.log('[DEBUG] useGeographicRevenueTTM - processed result:', result);
    return result;
  }, [data, symbol, ttmIncome]);

  return {
    regions: ttmSegments,
    referenceDate,
    isLoading,
    error,
    mutate
  };
}

export function useEmployeeCount(symbol: string) {
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `employee-count/${symbol}` : null,
    () => fetchWithCache<any[]>('employee_count', symbol, 'v4', 'annual', CACHE_DURATIONS.EMPLOYEE_COUNT),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATIONS.EMPLOYEE_COUNT,
      shouldRetryOnError: false
    }
  );

  // FMP returns an array of objects, take the most recent (first) entry
  const employeeCount = React.useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return null;
    // The API returns objects like { date: '2023-12-31', employeeCount: 12345 }
    const mostRecent = data[0];
    if (mostRecent && typeof mostRecent.employeeCount === 'number') {
      return mostRecent.employeeCount;
    }
    return null;
  }, [data]);

  return {
    employeeCount,
    isLoading,
    error,
    mutate
  };
}


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
    let url: string;
    
    if (version === 'v4') {
      url = `${baseUrl}/${endpoint}?symbol=${ticker}&apikey=${API_KEY}&structure=default&period=annual`;
    } else if (endpoint.includes('historical-price-full')) {
      // Special handling for historical price data
      url = `${baseUrl}/${endpoint}&apikey=${API_KEY}`;
    } else {
      url = `${baseUrl}/${endpoint}/${ticker}?apikey=${API_KEY}`;
    }
    
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
      console.error(`[API Error] ${version}/${endpoint}/${ticker} - Status: ${response.status}`);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log(`[API Response Raw Data] ${version}/${endpoint}/${ticker}:`, JSON.stringify(data, null, 2));
    console.log(`[API Response Type] ${version}/${endpoint}/${ticker}:`, typeof data);
    console.log(`[API Response Is Array] ${version}/${endpoint}/${ticker}:`, Array.isArray(data));

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
    () => fetchWithCache<any[]>('profile', symbol),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
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

export function useCashFlows(symbol: string) {
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

interface StockPriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function useStockPriceData(symbol: string, timeframe: '1D' | '1W' | '1M' | '1Y' | '5Y' = '1M') {
  const endpoint = timeframe === '1D' 
    ? `historical-chart/1min/${symbol}`
    : `historical-price-full/${symbol}?serietype=line`;

  const { data, error, isLoading } = useSWR<StockPriceData[]>(
    symbol ? endpoint : null,
    async (endpoint: string) => {
      try {
        console.log(`[Stock Price Data] Fetching data for ${symbol} with endpoint ${endpoint}`);
        const response = await fetchWithCache<any>(endpoint, symbol, 'v3');
        console.log(`[Stock Price Data] Raw response for ${symbol}:`, response);

        if (!response || typeof response !== 'object') {
          console.warn(`[Stock Price Data] Invalid response type for ${symbol}:`, typeof response);
          return [];
        }

        let processedData: StockPriceData[] = [];

        if (timeframe === '1D') {
          if (!Array.isArray(response)) {
            console.warn(`[Stock Price Data] Invalid intraday data format for ${symbol}:`, typeof response);
            return [];
          }
          if (!response[0]?.date) {
            console.warn(`[Stock Price Data] Missing date field in intraday data for ${symbol}`);
            return [];
          }
          processedData = response.map((item: any) => ({
            date: item.date,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: item.volume
          }));
        } else {
          // For historical data, we get an object with a historical array
          if (!response.historical || !Array.isArray(response.historical)) {
            console.warn(`[Stock Price Data] Invalid historical data format for ${symbol}:`, response);
            return [];
          }
          if (response.historical.length === 0) {
            console.warn(`[Stock Price Data] Empty historical data array for ${symbol}`);
            return [];
          }
          if (!response.historical[0]?.date || !response.historical[0]?.close) {
            console.warn(`[Stock Price Data] Missing required fields in historical data for ${symbol}:`, response.historical[0]);
            return [];
          }
          processedData = response.historical.map((item: any) => ({
            date: item.date,
            price: item.close
          }));
        }

        console.log(`[Stock Price Data] Processed data for ${symbol}:`, processedData);

        if (processedData.length === 0) {
          console.warn(`[Stock Price Data] No data points found for ${symbol}`);
          return [];
        }

        // Sort by date ascending and filter based on timeframe
        processedData.sort((a: StockPriceData, b: StockPriceData) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });

        // Filter data based on timeframe
        const now = new Date();
        const cutoffDate = new Date();
        switch (timeframe) {
          case '1D':
            cutoffDate.setDate(now.getDate() - 1);
            break;
          case '1W':
            cutoffDate.setDate(now.getDate() - 7);
            break;
          case '1M':
            cutoffDate.setMonth(now.getMonth() - 1);
            break;
          case '1Y':
            cutoffDate.setFullYear(now.getFullYear() - 1);
            break;
          case '5Y':
            cutoffDate.setFullYear(now.getFullYear() - 5);
            break;
        }

        // Set cutoff date to start of day to include all data from that day
        cutoffDate.setHours(0, 0, 0, 0);

        const filteredData = processedData.filter((item: StockPriceData) => {
          const itemDate = new Date(item.date);
          return itemDate >= cutoffDate;
        });

        console.log(`[Stock Price Data] Filtered data for ${symbol}:`, filteredData);
        console.log(`[Stock Price Data] Cutoff date: ${cutoffDate.toISOString()}`);

        if (filteredData.length === 0) {
          console.warn(`[Stock Price Data] No data points within timeframe for ${symbol}`);
          return [];
        }

        return filteredData;
      } catch (error) {
        console.error(`[Stock Price Data] Error processing data for ${symbol}:`, error);
        return [];
      }
    },
    {
      dedupingInterval: timeframe === '1D' ? 60 * 1000 : 5 * 60 * 1000, // 1 min for intraday, 5 min for historical
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        if (retryCount >= 3) return;
        setTimeout(() => revalidate({ retryCount: retryCount + 1 }), 1000);
      }
    }
  );

  return {
    prices: data || [],
    isLoading,
    error,
    mutate: () => {
      // Implementation of mutate function
    }
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
      return sum;
    }, 0);
  }

  totalRevenue = calculateLeafTotal(data);

  // Second pass: process segments, only including leaf nodes
  function processLeafNodes(obj: RevenueSegment, currentParentName: string = ''): ProcessedSegment[] {
    const segments: ProcessedSegment[] = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      const name = key.replace(' Segment', '');
      const fullName = currentParentName ? `${currentParentName} - ${name}` : name;
      // Use concise label for segments, simplified label for geography
      const displayName = isGeography
        ? getSimplifiedLabel(fullName)
        : getConciseSegmentLabel(fullName);

      if (typeof value === 'number') {
        // Leaf node - actual revenue value
        segments.push({
          name: displayName,
          value: value / 1e9,
          percentage: totalRevenue > 0 ? (value / totalRevenue) * 100 : 0,
          fullName
        });
      } else if (typeof value === 'object' && value !== null) {
        // For parent nodes, only process their children
        const childSegments = processLeafNodes(value, fullName);
        segments.push(...childSegments);
      }
    });

    return segments;
  }

  const leafSegments = processLeafNodes(data, parentName);

  // Remove duplicates and sort
  const uniqueSegments = leafSegments.reduce((acc: ProcessedSegment[], current) => {
    const existingIndex = acc.findIndex(item => item.name === current.name);
    if (existingIndex === -1) {
      acc.push(current);
    }
    return acc;
  }, []);

  return uniqueSegments
    .filter(segment => segment.value > 0)
    .sort((a, b) => b.value - a.value);
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

// Helper to aggregate TTM for revenue segments or regions
function aggregateTTMRevenue(
  data: any[],
  getDateKey: (entry: any) => string,
  isGeography: boolean
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

  // Process as before
  const ttmSegments = processNestedRevenueData(aggregate, '', isGeography);

  return { ttmSegments, referenceDate };
}

export function useRevenueSegmentsTTM(symbol: string) {
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

  const { ttmSegments, referenceDate } = React.useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return { ttmSegments: [], referenceDate: null };
    return aggregateTTMRevenue(data, entry => Object.keys(entry)[0], false);
  }, [data]);

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
    () => fetchWithCache<any[]>('revenue-geographic-segmentation', symbol, 'v4'),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
      shouldRetryOnError: false
    }
  );

  const { ttmSegments, referenceDate } = React.useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return { ttmSegments: [], referenceDate: null };
    return aggregateTTMRevenue(data, entry => Object.keys(entry)[0], true);
  }, [data]);

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
    () => fetchWithCache<any[]>('employee_count', symbol, 'v4'),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
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
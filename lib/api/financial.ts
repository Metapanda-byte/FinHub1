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

async function fetchWithCache<T>(endpoint: string, ticker?: string, version: string = 'v3', period: 'annual' | 'quarter' = 'annual'): Promise<T | null> {
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
    
    console.log(`[API Request] ${version}/${endpoint}/${period}/${ticker} (${url})`);
    
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
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log(`[API Response Raw Data] ${version}/${endpoint}/${period}/${ticker}:`, JSON.stringify(data, null, 2));
    console.log(`[API Response Type] ${version}/${endpoint}/${period}/${ticker}:`, typeof data);
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

    const expiresAt = new Date(Date.now() + CACHE_DURATION);
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

export function useIncomeStatements(symbol: string, period: 'annual' | 'quarter' = 'annual') {
  // If no API key, return empty data
  if (!API_KEY) {
    console.log(`[useIncomeStatements] No API key available for ${symbol}`);
    return {
      statements: [],
      isLoading: false,
      error: new Error('API key not configured'),
      mutate: () => Promise.resolve()
    };
  }

  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `income-statement/${symbol}/${period}` : null,
    async () => {
      try {
        const result = await fetchWithCache<any[]>('income-statement', symbol, 'v3', period);
        // Check if the result contains an error message indicating subscription limitation
        if (result && Array.isArray(result) && result.length > 0 && result[0]["Error Message"]) {
          console.warn(`[API Subscription] Quarterly data not available for ${symbol}, falling back to annual`);
          // Fallback to annual data if quarterly is not available
          if (period === 'quarter') {
            return await fetchWithCache<any[]>('income-statement', symbol, 'v3', 'annual');
          }
        }
        return result;
      } catch (err) {
        console.error(`[API Error] Failed to fetch ${period} data for ${symbol}:`, err);
        // Fallback to annual data on error
        if (period === 'quarter') {
          return await fetchWithCache<any[]>('income-statement', symbol, 'v3', 'annual');
        }
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
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
  // If no API key, return empty data
  if (!API_KEY) {
    console.log(`[useCashFlows] No API key available for ${symbol}`);
    return {
      statements: [],
      isLoading: false,
      error: new Error('API key not configured'),
      mutate: () => Promise.resolve()
    };
  }

  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `cash-flow-statement/${symbol}/${period}` : null,
    async () => {
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
      dedupingInterval: 60000,
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
  // If no API key, return empty data
  if (!API_KEY) {
    console.log(`[useBalanceSheets] No API key available for ${symbol}`);
    return {
      statements: [],
      isLoading: false,
      error: new Error('API key not configured'),
      mutate: () => Promise.resolve()
    };
  }

  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `balance-sheet-statement/${symbol}/${period}` : null,
    async () => {
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
      dedupingInterval: 60000,
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
    prices = prices.filter(item => new Date(item.date) >= janFirst);
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

  // Second pass: process segments, only including leaf nodes
  function processLeafNodes(obj: RevenueSegment, currentParentName: string = ''): ProcessedSegment[] {
    const segments: ProcessedSegment[] = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      const name = key.replace(' Segment', '');
      const fullName = currentParentName ? `${currentParentName} - ${name}` : name;
      // Use concise label for all cases (including geography)
      const displayName = getConciseSegmentLabel(fullName);

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

  // Debug: Log all available date keys from the API response
  if (Array.isArray(data)) {
    console.log('[DEBUG] All available date keys:', data.map(entry => Object.keys(entry)[0]));
  }

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

// Mock data for development/testing when API is not available
const mockIncomeStatements = [
  {
    date: "2024-12-31",
    symbol: "AMZN",
    reportedCurrency: "USD",
    cik: "0001018724",
    fillingDate: "2024-02-01",
    acceptedDate: "2024-02-01",
    calendarYear: "2024",
    period: "FY",
    revenue: 574785000000,
    costOfRevenue: 318000000000,
    grossProfit: 256785000000,
    researchAndDevelopmentExpenses: 85000000000,
    generalAndAdministrativeExpenses: 25000000000,
    sellingAndMarketingExpenses: 45000000000,
    sellingGeneralAndAdministrativeExpenses: 70000000000,
    otherExpenses: 5000000000,
    operatingExpenses: 160000000000,
    costAndExpenses: 478000000000,
    operatingIncome: 96785000000,
    interestIncome: 5000000000,
    interestExpense: 2000000000,
    depreciationAndAmortization: 45000000000,
    ebitda: 141785000000,
    ebitdaratio: 0.247,
    otherIncome: 1000000000,
    incomeBeforeTax: 97785000000,
    incomeTaxExpense: 19557000000,
    netIncome: 78228000000,
    eps: 7.82,
    epsDiluted: 7.75,
    weightedAverageShsOut: 10000000000,
    weightedAverageShsOutDil: 10100000000
  },
  {
    date: "2023-12-31",
    symbol: "AMZN",
    reportedCurrency: "USD",
    cik: "0001018724",
    fillingDate: "2024-02-01",
    acceptedDate: "2024-02-01",
    calendarYear: "2023",
    period: "FY",
    revenue: 514004000000,
    costOfRevenue: 288830000000,
    grossProfit: 225174000000,
    researchAndDevelopmentExpenses: 75000000000,
    generalAndAdministrativeExpenses: 22000000000,
    sellingAndMarketingExpenses: 40000000000,
    sellingGeneralAndAdministrativeExpenses: 62000000000,
    otherExpenses: 4000000000,
    operatingExpenses: 141000000000,
    costAndExpenses: 429830000000,
    operatingIncome: 84174000000,
    interestIncome: 4000000000,
    interestExpense: 1800000000,
    depreciationAndAmortization: 42000000000,
    ebitda: 126174000000,
    ebitdaratio: 0.245,
    otherIncome: 800000000,
    incomeBeforeTax: 86174000000,
    incomeTaxExpense: 17234800000,
    netIncome: 68939200000,
    eps: 6.89,
    epsDiluted: 6.82,
    weightedAverageShsOut: 10000000000,
    weightedAverageShsOutDil: 10100000000
  },
  {
    date: "2022-12-31",
    symbol: "AMZN",
    reportedCurrency: "USD",
    cik: "0001018724",
    fillingDate: "2023-02-02",
    acceptedDate: "2023-02-02",
    calendarYear: "2022",
    period: "FY",
    revenue: 514004000000,
    costOfRevenue: 288830000000,
    grossProfit: 225174000000,
    researchAndDevelopmentExpenses: 70000000000,
    generalAndAdministrativeExpenses: 20000000000,
    sellingAndMarketingExpenses: 38000000000,
    sellingGeneralAndAdministrativeExpenses: 58000000000,
    otherExpenses: 3500000000,
    operatingExpenses: 131500000000,
    costAndExpenses: 420330000000,
    operatingIncome: 93674000000,
    interestIncome: 3500000000,
    interestExpense: 1600000000,
    depreciationAndAmortization: 40000000000,
    ebitda: 133674000000,
    ebitdaratio: 0.260,
    otherIncome: 600000000,
    incomeBeforeTax: 94274000000,
    incomeTaxExpense: 18854800000,
    netIncome: 75419200000,
    eps: 7.54,
    epsDiluted: 7.47,
    weightedAverageShsOut: 10000000000,
    weightedAverageShsOutDil: 10100000000
  },
  {
    date: "2021-12-31",
    symbol: "AMZN",
    reportedCurrency: "USD",
    cik: "0001018724",
    fillingDate: "2022-02-03",
    acceptedDate: "2022-02-03",
    calendarYear: "2021",
    period: "FY",
    revenue: 469822000000,
    costOfRevenue: 272344000000,
    grossProfit: 197478000000,
    researchAndDevelopmentExpenses: 65000000000,
    generalAndAdministrativeExpenses: 18000000000,
    sellingAndMarketingExpenses: 35000000000,
    sellingGeneralAndAdministrativeExpenses: 53000000000,
    otherExpenses: 3000000000,
    operatingExpenses: 121000000000,
    costAndExpenses: 393344000000,
    operatingIncome: 76478000000,
    interestIncome: 3000000000,
    interestExpense: 1400000000,
    depreciationAndAmortization: 38000000000,
    ebitda: 114478000000,
    ebitdaratio: 0.244,
    otherIncome: 500000000,
    incomeBeforeTax: 76978000000,
    incomeTaxExpense: 15395600000,
    netIncome: 61582400000,
    eps: 6.16,
    epsDiluted: 6.09,
    weightedAverageShsOut: 10000000000,
    weightedAverageShsOutDil: 10100000000
  },
  {
    date: "2020-12-31",
    symbol: "AMZN",
    reportedCurrency: "USD",
    cik: "0001018724",
    fillingDate: "2021-02-02",
    acceptedDate: "2021-02-02",
    calendarYear: "2020",
    period: "FY",
    revenue: 386064000000,
    costOfRevenue: 233307000000,
    grossProfit: 152757000000,
    researchAndDevelopmentExpenses: 55000000000,
    generalAndAdministrativeExpenses: 16000000000,
    sellingAndMarketingExpenses: 30000000000,
    sellingGeneralAndAdministrativeExpenses: 46000000000,
    otherExpenses: 2500000000,
    operatingExpenses: 103500000000,
    costAndExpenses: 336807000000,
    operatingIncome: 49257000000,
    interestIncome: 2500000000,
    interestExpense: 1200000000,
    depreciationAndAmortization: 35000000000,
    ebitda: 84257000000,
    ebitdaratio: 0.218,
    otherIncome: 400000000,
    incomeBeforeTax: 49657000000,
    incomeTaxExpense: 9931400000,
    netIncome: 39725600000,
    eps: 3.97,
    epsDiluted: 3.93,
    weightedAverageShsOut: 10000000000,
    weightedAverageShsOutDil: 10100000000
  }
];

const mockBalanceSheets = [
  {
    date: "2024-12-31",
    symbol: "AMZN",
    reportedCurrency: "USD",
    cik: "0001018724",
    fillingDate: "2024-02-01",
    acceptedDate: "2024-02-01",
    calendarYear: "2024",
    period: "FY",
    cashAndCashEquivalents: 50000000000,
    shortTermInvestments: 30000000000,
    cashAndShortTermInvestments: 80000000000,
    netReceivables: 40000000000,
    inventory: 25000000000,
    totalCurrentAssets: 150000000000,
    propertyPlantEquipmentNet: 200000000000,
    goodwill: 15000000000,
    intangibleAssets: 10000000000,
    goodwillAndIntangibleAssets: 25000000000,
    longTermInvestments: 20000000000,
    taxAssets: 5000000000,
    otherNonCurrentAssets: 10000000000,
    totalNonCurrentAssets: 265000000000,
    otherAssets: 5000000000,
    totalAssets: 420000000000,
    accountPayables: 60000000000,
    shortTermDebt: 10000000000,
    taxPayables: 8000000000,
    deferredRevenue: 15000000000,
    otherCurrentLiabilities: 20000000000,
    totalCurrentLiabilities: 113000000000,
    longTermDebt: 80000000000,
    deferredRevenueNonCurrent: 5000000000,
    deferredTaxLiabilitiesNonCurrent: 10000000000,
    otherNonCurrentLiabilities: 15000000000,
    totalNonCurrentLiabilities: 110000000000,
    otherLiabilities: 5000000000,
    capitalLeaseObligations: 20000000000,
    totalLiabilities: 228000000000,
    preferredStock: 0,
    commonStock: 10000000000,
    retainedEarnings: 150000000000,
    accumulatedOtherComprehensiveIncomeLoss: 2000000000,
    othertotalStockholdersEquity: 5000000000,
    totalStockholdersEquity: 167000000000,
    totalEquity: 167000000000,
    totalLiabilitiesAndStockholdersEquity: 395000000000,
    minorityInterest: 0,
    totalLiabilitiesAndTotalEquity: 395000000000,
    totalInvestments: 50000000000,
    totalDebt: 90000000000,
    netDebt: 40000000000
  },
  {
    date: "2023-12-31",
    symbol: "AMZN",
    reportedCurrency: "USD",
    cik: "0001018724",
    fillingDate: "2024-02-01",
    acceptedDate: "2024-02-01",
    calendarYear: "2023",
    period: "FY",
    cashAndCashEquivalents: 45000000000,
    shortTermInvestments: 25000000000,
    cashAndShortTermInvestments: 70000000000,
    netReceivables: 35000000000,
    inventory: 22000000000,
    totalCurrentAssets: 130000000000,
    propertyPlantEquipmentNet: 180000000000,
    goodwill: 14000000000,
    intangibleAssets: 9000000000,
    goodwillAndIntangibleAssets: 23000000000,
    longTermInvestments: 18000000000,
    taxAssets: 4000000000,
    otherNonCurrentAssets: 9000000000,
    totalNonCurrentAssets: 240000000000,
    otherAssets: 4000000000,
    totalAssets: 374000000000,
    accountPayables: 55000000000,
    shortTermDebt: 9000000000,
    taxPayables: 7000000000,
    deferredRevenue: 13000000000,
    otherCurrentLiabilities: 18000000000,
    totalCurrentLiabilities: 102000000000,
    longTermDebt: 75000000000,
    deferredRevenueNonCurrent: 4000000000,
    deferredTaxLiabilitiesNonCurrent: 9000000000,
    otherNonCurrentLiabilities: 14000000000,
    totalNonCurrentLiabilities: 102000000000,
    otherLiabilities: 4000000000,
    capitalLeaseObligations: 18000000000,
    totalLiabilities: 208000000000,
    preferredStock: 0,
    commonStock: 10000000000,
    retainedEarnings: 130000000000,
    accumulatedOtherComprehensiveIncomeLoss: 1500000000,
    othertotalStockholdersEquity: 4000000000,
    totalStockholdersEquity: 146000000000,
    totalEquity: 146000000000,
    totalLiabilitiesAndStockholdersEquity: 354000000000,
    minorityInterest: 0,
    totalLiabilitiesAndTotalEquity: 354000000000,
    totalInvestments: 43000000000,
    totalDebt: 84000000000,
    netDebt: 39000000000
  },
  {
    date: "2022-12-31",
    symbol: "AMZN",
    reportedCurrency: "USD",
    cik: "0001018724",
    fillingDate: "2023-02-02",
    acceptedDate: "2023-02-02",
    calendarYear: "2022",
    period: "FY",
    cashAndCashEquivalents: 40000000000,
    shortTermInvestments: 20000000000,
    cashAndShortTermInvestments: 60000000000,
    netReceivables: 30000000000,
    inventory: 20000000000,
    totalCurrentAssets: 115000000000,
    propertyPlantEquipmentNet: 160000000000,
    goodwill: 13000000000,
    intangibleAssets: 8000000000,
    goodwillAndIntangibleAssets: 21000000000,
    longTermInvestments: 16000000000,
    taxAssets: 3000000000,
    otherNonCurrentAssets: 8000000000,
    totalNonCurrentAssets: 215000000000,
    otherAssets: 3000000000,
    totalAssets: 333000000000,
    accountPayables: 50000000000,
    shortTermDebt: 8000000000,
    taxPayables: 6000000000,
    deferredRevenue: 11000000000,
    otherCurrentLiabilities: 16000000000,
    totalCurrentLiabilities: 91000000000,
    longTermDebt: 70000000000,
    deferredRevenueNonCurrent: 3000000000,
    deferredTaxLiabilitiesNonCurrent: 8000000000,
    otherNonCurrentLiabilities: 13000000000,
    totalNonCurrentLiabilities: 94000000000,
    otherLiabilities: 3000000000,
    capitalLeaseObligations: 16000000000,
    totalLiabilities: 188000000000,
    preferredStock: 0,
    commonStock: 10000000000,
    retainedEarnings: 110000000000,
    accumulatedOtherComprehensiveIncomeLoss: 1000000000,
    othertotalStockholdersEquity: 3000000000,
    totalStockholdersEquity: 125000000000,
    totalEquity: 125000000000,
    totalLiabilitiesAndStockholdersEquity: 313000000000,
    minorityInterest: 0,
    totalLiabilitiesAndTotalEquity: 313000000000,
    totalInvestments: 36000000000,
    totalDebt: 78000000000,
    netDebt: 38000000000
  },
  {
    date: "2021-12-31",
    symbol: "AMZN",
    reportedCurrency: "USD",
    cik: "0001018724",
    fillingDate: "2022-02-03",
    acceptedDate: "2022-02-03",
    calendarYear: "2021",
    period: "FY",
    cashAndCashEquivalents: 35000000000,
    shortTermInvestments: 15000000000,
    cashAndShortTermInvestments: 50000000000,
    netReceivables: 25000000000,
    inventory: 18000000000,
    totalCurrentAssets: 100000000000,
    propertyPlantEquipmentNet: 140000000000,
    goodwill: 12000000000,
    intangibleAssets: 7000000000,
    goodwillAndIntangibleAssets: 19000000000,
    longTermInvestments: 14000000000,
    taxAssets: 2000000000,
    otherNonCurrentAssets: 7000000000,
    totalNonCurrentAssets: 190000000000,
    otherAssets: 2000000000,
    totalAssets: 292000000000,
    accountPayables: 45000000000,
    shortTermDebt: 7000000000,
    taxPayables: 5000000000,
    deferredRevenue: 9000000000,
    otherCurrentLiabilities: 14000000000,
    totalCurrentLiabilities: 80000000000,
    longTermDebt: 65000000000,
    deferredRevenueNonCurrent: 2000000000,
    deferredTaxLiabilitiesNonCurrent: 7000000000,
    otherNonCurrentLiabilities: 12000000000,
    totalNonCurrentLiabilities: 86000000000,
    otherLiabilities: 2000000000,
    capitalLeaseObligations: 14000000000,
    totalLiabilities: 168000000000,
    preferredStock: 0,
    commonStock: 10000000000,
    retainedEarnings: 90000000000,
    accumulatedOtherComprehensiveIncomeLoss: 500000000,
    othertotalStockholdersEquity: 2000000000,
    totalStockholdersEquity: 104000000000,
    totalEquity: 104000000000,
    totalLiabilitiesAndStockholdersEquity: 272000000000,
    minorityInterest: 0,
    totalLiabilitiesAndTotalEquity: 272000000000,
    totalInvestments: 29000000000,
    totalDebt: 72000000000,
    netDebt: 37000000000
  },
  {
    date: "2020-12-31",
    symbol: "AMZN",
    reportedCurrency: "USD",
    cik: "0001018724",
    fillingDate: "2021-02-02",
    acceptedDate: "2021-02-02",
    calendarYear: "2020",
    period: "FY",
    cashAndCashEquivalents: 30000000000,
    shortTermInvestments: 10000000000,
    cashAndShortTermInvestments: 40000000000,
    netReceivables: 20000000000,
    inventory: 16000000000,
    totalCurrentAssets: 85000000000,
    propertyPlantEquipmentNet: 120000000000,
    goodwill: 11000000000,
    intangibleAssets: 6000000000,
    goodwillAndIntangibleAssets: 17000000000,
    longTermInvestments: 12000000000,
    taxAssets: 1000000000,
    otherNonCurrentAssets: 6000000000,
    totalNonCurrentAssets: 165000000000,
    otherAssets: 1000000000,
    totalAssets: 251000000000,
    accountPayables: 40000000000,
    shortTermDebt: 6000000000,
    taxPayables: 4000000000,
    deferredRevenue: 7000000000,
    otherCurrentLiabilities: 12000000000,
    totalCurrentLiabilities: 69000000000,
    longTermDebt: 60000000000,
    deferredRevenueNonCurrent: 1000000000,
    deferredTaxLiabilitiesNonCurrent: 6000000000,
    otherNonCurrentLiabilities: 11000000000,
    totalNonCurrentLiabilities: 78000000000,
    otherLiabilities: 1000000000,
    capitalLeaseObligations: 12000000000,
    totalLiabilities: 148000000000,
    preferredStock: 0,
    commonStock: 10000000000,
    retainedEarnings: 70000000000,
    accumulatedOtherComprehensiveIncomeLoss: 0,
    othertotalStockholdersEquity: 1000000000,
    totalStockholdersEquity: 83000000000,
    totalEquity: 83000000000,
    totalLiabilitiesAndStockholdersEquity: 231000000000,
    minorityInterest: 0,
    totalLiabilitiesAndTotalEquity: 231000000000,
    totalInvestments: 22000000000,
    totalDebt: 66000000000,
    netDebt: 36000000000
  }
];

const mockCashFlows = [
  {
    date: "2024-12-31",
    symbol: "AMZN",
    reportedCurrency: "USD",
    cik: "0001018724",
    fillingDate: "2024-02-01",
    acceptedDate: "2024-02-01",
    calendarYear: "2024",
    period: "FY",
    netIncome: 78228000000,
    depreciationAndAmortization: 45000000000,
    deferredIncomeTax: 5000000000,
    stockBasedCompensation: 20000000000,
    changeInWorkingCapital: -10000000000,
    accountsReceivables: -5000000000,
    inventory: -3000000000,
    accountsPayables: 8000000000,
    otherWorkingCapital: -10000000000,
    otherNonCashItems: 5000000000,
    netCashProvidedByOperatingActivities: 137228000000,
    investmentsInPropertyPlantAndEquipment: -50000000000,
    acquisitionsNet: -2000000000,
    purchasesOfInvestments: -30000000000,
    salesMaturitiesOfInvestments: 25000000000,
    otherInvestingActivites: -3000000000,
    netCashUsedForInvestingActivites: -60000000000,
    debtRepayment: -10000000000,
    commonStockIssued: 0,
    commonStockRepurchased: -40000000000,
    dividendsPaid: 0,
    otherFinancingActivites: -5000000000,
    netCashUsedProvidedByFinancingActivities: -55000000000,
    effectOfForexChangesOnCash: 1000000000,
    netChangeInCash: 23228000000,
    cashAtEndOfPeriod: 50000000000,
    cashAtBeginningOfPeriod: 26772000000,
    operatingCashFlow: 137228000000,
    capitalExpenditure: -50000000000,
    freeCashFlow: 87228000000
  },
  {
    date: "2023-12-31",
    symbol: "AMZN",
    reportedCurrency: "USD",
    cik: "0001018724",
    fillingDate: "2024-02-01",
    acceptedDate: "2024-02-01",
    calendarYear: "2023",
    period: "FY",
    netIncome: 68939200000,
    depreciationAndAmortization: 42000000000,
    deferredIncomeTax: 4000000000,
    stockBasedCompensation: 18000000000,
    changeInWorkingCapital: -8000000000,
    accountsReceivables: -4000000000,
    inventory: -2000000000,
    accountsPayables: 7000000000,
    otherWorkingCapital: -9000000000,
    otherNonCashItems: 4000000000,
    netCashProvidedByOperatingActivities: 125139200000,
    investmentsInPropertyPlantAndEquipment: -45000000000,
    acquisitionsNet: -1500000000,
    purchasesOfInvestments: -25000000000,
    salesMaturitiesOfInvestments: 20000000000,
    otherInvestingActivites: -2000000000,
    netCashUsedForInvestingActivites: -52000000000,
    debtRepayment: -8000000000,
    commonStockIssued: 0,
    commonStockRepurchased: -35000000000,
    dividendsPaid: 0,
    otherFinancingActivites: -4000000000,
    netCashUsedProvidedByFinancingActivities: -47000000000,
    effectOfForexChangesOnCash: 800000000,
    netChangeInCash: 26139200000,
    cashAtEndOfPeriod: 45000000000,
    cashAtBeginningOfPeriod: 18860800000,
    operatingCashFlow: 125139200000,
    capitalExpenditure: -45000000000,
    freeCashFlow: 80139200000
  },
  {
    date: "2022-12-31",
    symbol: "AMZN",
    reportedCurrency: "USD",
    cik: "0001018724",
    fillingDate: "2023-02-02",
    acceptedDate: "2023-02-02",
    calendarYear: "2022",
    period: "FY",
    netIncome: 75419200000,
    depreciationAndAmortization: 40000000000,
    deferredIncomeTax: 3500000000,
    stockBasedCompensation: 16000000000,
    changeInWorkingCapital: -7000000000,
    accountsReceivables: -3000000000,
    inventory: -1500000000,
    accountsPayables: 6000000000,
    otherWorkingCapital: -8000000000,
    otherNonCashItems: 3500000000,
    netCashProvidedByOperatingActivities: 119919200000,
    investmentsInPropertyPlantAndEquipment: -40000000000,
    acquisitionsNet: -1200000000,
    purchasesOfInvestments: -22000000000,
    salesMaturitiesOfInvestments: 18000000000,
    otherInvestingActivites: -1500000000,
    netCashUsedForInvestingActivites: -47120000000,
    debtRepayment: -7000000000,
    commonStockIssued: 0,
    commonStockRepurchased: -30000000000,
    dividendsPaid: 0,
    otherFinancingActivites: -3000000000,
    netCashUsedProvidedByFinancingActivities: -40000000000,
    effectOfForexChangesOnCash: 600000000,
    netChangeInCash: 32719200000,
    cashAtEndOfPeriod: 40000000000,
    cashAtBeginningOfPeriod: 7280800000,
    operatingCashFlow: 119919200000,
    capitalExpenditure: -40000000000,
    freeCashFlow: 79919200000
  },
  {
    date: "2021-12-31",
    symbol: "AMZN",
    reportedCurrency: "USD",
    cik: "0001018724",
    fillingDate: "2022-02-03",
    acceptedDate: "2022-02-03",
    calendarYear: "2021",
    period: "FY",
    netIncome: 61582400000,
    depreciationAndAmortization: 38000000000,
    deferredIncomeTax: 3000000000,
    stockBasedCompensation: 14000000000,
    changeInWorkingCapital: -6000000000,
    accountsReceivables: -2000000000,
    inventory: -1000000000,
    accountsPayables: 5000000000,
    otherWorkingCapital: -7000000000,
    otherNonCashItems: 3000000000,
    netCashProvidedByOperatingActivities: 113582400000,
    investmentsInPropertyPlantAndEquipment: -35000000000,
    acquisitionsNet: -1000000000,
    purchasesOfInvestments: -20000000000,
    salesMaturitiesOfInvestments: 16000000000,
    otherInvestingActivites: -1000000000,
    netCashUsedForInvestingActivites: -40000000000,
    debtRepayment: -6000000000,
    commonStockIssued: 0,
    commonStockRepurchased: -25000000000,
    dividendsPaid: 0,
    otherFinancingActivites: -2000000000,
    netCashUsedProvidedByFinancingActivities: -33000000000,
    effectOfForexChangesOnCash: 400000000,
    netChangeInCash: 40582400000,
    cashAtEndOfPeriod: 35000000000,
    cashAtBeginningOfPeriod: -5582400000,
    operatingCashFlow: 113582400000,
    capitalExpenditure: -35000000000,
    freeCashFlow: 78582400000
  },
  {
    date: "2020-12-31",
    symbol: "AMZN",
    reportedCurrency: "USD",
    cik: "0001018724",
    fillingDate: "2021-02-02",
    acceptedDate: "2021-02-02",
    calendarYear: "2020",
    period: "FY",
    netIncome: 39725600000,
    depreciationAndAmortization: 35000000000,
    deferredIncomeTax: 2000000000,
    stockBasedCompensation: 12000000000,
    changeInWorkingCapital: -4000000000,
    accountsReceivables: -1000000000,
    inventory: -500000000,
    accountsPayables: 3000000000,
    otherWorkingCapital: -5000000000,
    otherNonCashItems: 2000000000,
    netCashProvidedByOperatingActivities: 88725600000,
    investmentsInPropertyPlantAndEquipment: -30000000000,
    acquisitionsNet: -800000000,
    purchasesOfInvestments: -18000000000,
    salesMaturitiesOfInvestments: 14000000000,
    otherInvestingActivites: -500000000,
    netCashUsedForInvestingActivites: -34800000000,
    debtRepayment: -4000000000,
    commonStockIssued: 0,
    commonStockRepurchased: -20000000000,
    dividendsPaid: 0,
    otherFinancingActivites: -1000000000,
    netCashUsedProvidedByFinancingActivities: -25000000000,
    effectOfForexChangesOnCash: 200000000,
    netChangeInCash: 28925600000,
    cashAtEndOfPeriod: 30000000000,
    cashAtBeginningOfPeriod: 1074400000,
    operatingCashFlow: 88725600000,
    capitalExpenditure: -30000000000,
    freeCashFlow: 58725600000
  }
];
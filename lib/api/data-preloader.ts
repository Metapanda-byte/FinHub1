"use client";

import { mutate } from 'swr';

// Priority 1: Overview tab data (load first for seamless initial experience)
const getOverviewEndpoints = (symbol: string) => {
  if (!symbol) return [];
  
  return [
    // Essential data for Company Header and Overview
    `/api/financial/profile?symbol=${symbol}`,
    `/api/financial/quote?symbol=${symbol}`,
    `/api/stock/quote?symbol=${symbol}`,
    `/api/financial/key-metrics?symbol=${symbol}&period=annual&limit=10`,
    `/api/financial/ratios?symbol=${symbol}&period=annual&limit=10`,
    
    // Overview tab specific data
    `/api/financial/income-statement?symbol=${symbol}&period=annual&limit=10`,
    `/api/stock/${symbol}/revenue-segments`,
    `/api/stock/${symbol}/geographic-revenue`,
    `/api/stock/${symbol}/employee-count`,
    `/api/stock/${symbol}/institutional-ownership`,
    `/api/stock/${symbol}/analyst-ratings`,
    `/api/stock/${symbol}/price-target`,
    `/api/stock/${symbol}/esg-score`,
    `/api/financial/balance-sheet?symbol=${symbol}&period=annual&limit=10`,
    
    // Stock price for chart
    `/api/stock/${symbol}/price?range=1D`,
  ];
};

// Priority 2: Other frequently used tab data
const getSecondaryEndpoints = (symbol: string) => {
  if (!symbol) return [];
  
  return [
    // Financials tab data (quarterly)
    `/api/financial/income-statement?symbol=${symbol}&period=quarter&limit=10`,
    `/api/financial/balance-sheet?symbol=${symbol}&period=quarter&limit=10`,
    `/api/financial/cash-flow?symbol=${symbol}&period=annual&limit=10`,
    `/api/financial/cash-flow?symbol=${symbol}&period=quarter&limit=10`,
    
    // Additional metrics
    `/api/financial/ratios?symbol=${symbol}&period=quarter&limit=10`,
    `/api/financial/key-metrics?symbol=${symbol}&period=quarter&limit=10`,
    
    // Peer Comparison (moved from tertiary - this is a prominent tab)
    `/api/stock/peers?symbol=${symbol}`,
    `/api/competitors?symbol=${symbol}`,
    
    // News (Recent News tab)
    `/api/stock-news?symbol=${symbol}`,
    
    // TTM data
    `/api/financial/income-statement-ttm?symbol=${symbol}`,
    `/api/kpi/extract?symbol=${symbol}`,
  ];
};

// Priority 3: Less frequently accessed data
const getTertiaryEndpoints = (symbol: string) => {
  if (!symbol) return [];
  
  return [
    // SEC Filings and Transcripts
    `/api/stock/${symbol}/sec-filings`,
    `/api/stock/${symbol}/earnings-transcript-dates`,
    
    // Analyst estimates
    `/api/analyst-estimates?symbol=${symbol}`,
  ];
};

// Fetcher function with error handling
const preloadFetcher = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to preload ${url}: ${response.status}`);
      return null;
    }
    return response.json();
  } catch (error) {
    console.warn(`Error preloading ${url}:`, error);
    return null;
  }
};

// Load a batch of endpoints with progress updates
async function loadEndpointBatch(
  endpoints: string[], 
  startIndex: number,
  totalEndpoints: number,
  priority: string
) {
  let loadedCount = startIndex;
  
  const promises = endpoints.map(async (endpoint) => {
    try {
      const data = await preloadFetcher(endpoint);
      if (data !== null) {
        // Pre-populate SWR cache
        mutate(endpoint, data, false);
      }
      
      // Update progress
      loadedCount++;
      window.dispatchEvent(new CustomEvent('preloadProgress', { 
        detail: { 
          loaded: loadedCount, 
          total: totalEndpoints,
          priority,
          endpoint 
        } 
      }));
      
      return { endpoint, success: data !== null };
    } catch (error) {
      return { endpoint, success: false };
    }
  });
  
  const results = await Promise.allSettled(promises);
  return {
    successCount: results.filter(r => r.status === 'fulfilled' && r.value.success).length,
    loadedCount
  };
}

// Main preload function with prioritized loading
export async function preloadTickerData(symbol: string) {
  if (!symbol) return;
  
  console.log(`Starting prioritized preload for ${symbol}...`);
  const startTime = performance.now();
  
  // Get all endpoint groups
  const overviewEndpoints = getOverviewEndpoints(symbol);
  const secondaryEndpoints = getSecondaryEndpoints(symbol);
  const tertiaryEndpoints = getTertiaryEndpoints(symbol);
  
  const totalEndpoints = overviewEndpoints.length + secondaryEndpoints.length + tertiaryEndpoints.length;
  
  // Emit start event
  window.dispatchEvent(new CustomEvent('preloadStart', { 
    detail: { 
      symbol, 
      totalEndpoints,
      priorities: {
        overview: overviewEndpoints.length,
        secondary: secondaryEndpoints.length,
        tertiary: tertiaryEndpoints.length
      }
    } 
  }));
  
  let totalLoaded = 0;
  let totalSuccess = 0;
  
  // Priority 1: Load Overview tab data first (for seamless initial load)
  console.log(`Loading Priority 1: Overview tab data (${overviewEndpoints.length} endpoints)...`);
  const overviewResult = await loadEndpointBatch(
    overviewEndpoints, 
    0, 
    totalEndpoints,
    'overview'
  );
  totalLoaded = overviewResult.loadedCount;
  totalSuccess += overviewResult.successCount;
  
  // Priority 2: Load commonly used tabs in background
  console.log(`Loading Priority 2: Secondary tab data (${secondaryEndpoints.length} endpoints)...`);
  const secondaryResult = await loadEndpointBatch(
    secondaryEndpoints,
    totalLoaded,
    totalEndpoints,
    'secondary'
  );
  totalLoaded = secondaryResult.loadedCount;
  totalSuccess += secondaryResult.successCount;
  
  // Priority 3: Load less frequently accessed data
  console.log(`Loading Priority 3: Tertiary data (${tertiaryEndpoints.length} endpoints)...`);
  const tertiaryResult = await loadEndpointBatch(
    tertiaryEndpoints,
    totalLoaded,
    totalEndpoints,
    'tertiary'
  );
  totalSuccess += tertiaryResult.successCount;
  
  const endTime = performance.now();
  const loadTime = Math.round(endTime - startTime);
  
  console.log(
    `Preloaded ${totalSuccess}/${totalEndpoints} endpoints for ${symbol} in ${loadTime}ms\n` +
    `  Overview: ${overviewResult.successCount}/${overviewEndpoints.length}\n` +
    `  Secondary: ${secondaryResult.successCount}/${secondaryEndpoints.length}\n` +
    `  Tertiary: ${tertiaryResult.successCount}/${tertiaryEndpoints.length}`
  );
  
  // Emit complete event
  window.dispatchEvent(new CustomEvent('preloadComplete', { 
    detail: { 
      symbol, 
      totalEndpoints, 
      successfulLoads: totalSuccess, 
      loadTime,
      breakdown: {
        overview: overviewResult.successCount,
        secondary: secondaryResult.successCount,
        tertiary: tertiaryResult.successCount
      }
    } 
  }));
  
  return {
    symbol,
    totalEndpoints,
    successfulLoads: totalSuccess,
    loadTime
  };
}

// Hook to trigger preload when symbol changes
import { useEffect, useRef } from 'react';

export function useTickerPreloader(symbol: string | null) {
  const previousSymbol = useRef<string | null>(null);
  const isPreloading = useRef(false);
  
  useEffect(() => {
    // Only preload if symbol changed and is not empty
    if (symbol && symbol !== previousSymbol.current && !isPreloading.current) {
      previousSymbol.current = symbol;
      isPreloading.current = true;
      
      preloadTickerData(symbol).finally(() => {
        isPreloading.current = false;
      });
    }
  }, [symbol]);
}

// Utility to preload peer data
export async function preloadPeerData(symbols: string[]) {
  if (!symbols || symbols.length === 0) return;
  
  console.log(`Preloading peer data for ${symbols.length} companies...`);
  
  const peerEndpoints = symbols.flatMap(symbol => [
    `/api/financial/profile?symbol=${symbol}`,
    `/api/financial/quote?symbol=${symbol}`,
    `/api/financial/ratios?symbol=${symbol}&period=annual&limit=1`,
    `/api/financial/key-metrics?symbol=${symbol}&period=annual&limit=1`
  ]);
  
  const fetchPromises = peerEndpoints.map(endpoint => 
    preloadFetcher(endpoint).then(data => {
      if (data !== null) {
        mutate(endpoint, data, false);
      }
    })
  );
  
  await Promise.allSettled(fetchPromises);
}

// Utility to preload only critical overview data (for ultra-fast initial load)
export async function preloadCriticalData(symbol: string) {
  if (!symbol) return;
  
  const criticalEndpoints = [
    `/api/financial/profile?symbol=${symbol}`,
    `/api/financial/quote?symbol=${symbol}`,
    `/api/stock/quote?symbol=${symbol}`,
    `/api/financial/key-metrics?symbol=${symbol}&period=annual&limit=10`,
    `/api/financial/ratios?symbol=${symbol}&period=annual&limit=10`,
  ];
  
  const promises = criticalEndpoints.map(endpoint => 
    preloadFetcher(endpoint).then(data => {
      if (data !== null) {
        mutate(endpoint, data, false);
      }
    })
  );
  
  await Promise.allSettled(promises);
} 
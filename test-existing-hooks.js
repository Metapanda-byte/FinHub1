#!/usr/bin/env node

/**
 * Test script to mimic the existing TTM hooks for SHOP
 * This demonstrates how useRevenueSegmentsTTM and useGeographicRevenueTTM work
 */

// Hard-coded API key for testing (from .env file)
const API_KEY = 'aQNTmqOc47AwKEIVgWuK9A6HTe7gArGX';

// Replicated fetchWithCache function (simplified for testing)
async function fetchWithCache(endpoint, ticker, version = 'v3', period = 'annual') {
  if (!ticker || !API_KEY) {
    console.error('Missing ticker or API key');
    return null;
  }

  try {
    const baseUrl = `https://financialmodelingprep.com/api/${version}`;
    let url;
    
    if (version === 'v4') {
      url = `${baseUrl}/${endpoint}?symbol=${ticker}&apikey=${API_KEY}&structure=default&period=${period}`;
    } else {
      url = `${baseUrl}/${endpoint}/${ticker}?apikey=${API_KEY}&period=${period}`;
    }
    
    console.log(`[API Request] ${version}/${endpoint}/${period}/${ticker}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.warn(`Empty response for ${endpoint}/${ticker}`);
      return null;
    }

    if (data.error || data["Error Message"]) {
      console.warn(`API Error: ${data.error || data["Error Message"]}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}/${ticker}:`, error.message);
    return null;
  }
}

// Mimic the aggregateTTMRevenue function from financial.ts
function aggregateTTMRevenue(data, getDateKey, isGeography) {
  if (!Array.isArray(data) || data.length === 0) {
    return { ttmSegments: [], referenceDate: null };
  }

  console.log(`Processing ${data.length} entries for TTM aggregation`);

  // Sort by date descending (most recent first)
  const sorted = [...data].sort((a, b) => {
    const dateA = new Date(getDateKey(a));
    const dateB = new Date(getDateKey(b));
    return dateB.getTime() - dateA.getTime();
  });

  console.log('Available dates:', sorted.map(entry => getDateKey(entry)).slice(0, 8));

  // Take last 4 quarters
  const ttmEntries = sorted.slice(0, 4);
  console.log('TTM quarters:', ttmEntries.map(entry => getDateKey(entry)));

  // Use the most recent quarter's date as the reference
  const referenceDate = getDateKey(ttmEntries[0]) || null;
  console.log('Reference date:', referenceDate);

  // Aggregate all segment/region values
  const aggregate = {};
  ttmEntries.forEach(entry => {
    const dateKey = getDateKey(entry);
    const segmentData = entry[dateKey];
    console.log(`Processing quarter ${dateKey}:`, Object.keys(segmentData || {}));
    
    function addToAggregate(obj, target) {
      for (const [key, value] of Object.entries(obj || {})) {
        if (typeof value === 'number') {
          target[key] = (target[key] || 0) + value;
        } else if (typeof value === 'object' && value !== null) {
          if (!target[key]) target[key] = {};
          addToAggregate(value, target[key]);
        }
      }
    }
    addToAggregate(segmentData, aggregate);
  });

  console.log('Aggregated data structure:', Object.keys(aggregate));
  
  return { ttmSegments: aggregate, referenceDate };
}

// Test the existing hook functionality
async function testExistingTTMHooks() {
  const symbol = 'SHOP';
  
  console.log(`Testing existing TTM hook functionality for ${symbol}`);
  console.log('='.repeat(70));

  // Test 1: Mimic useRevenueSegmentsTTM
  console.log('\n1. Testing useRevenueSegmentsTTM equivalent...');
  
  // First fetch the product segmentation data (using annual period like the original hook)
  const revenueData = await fetchWithCache('revenue-product-segmentation', symbol, 'v4', 'annual');
  
  if (revenueData) {
    console.log(`Received ${revenueData.length} annual entries for revenue segments`);
    
    // Process TTM aggregation
    const revenueResult = aggregateTTMRevenue(
      revenueData, 
      entry => Object.keys(entry)[0], 
      false
    );
    
    console.log('\nRevenue Segments TTM Result:');
    console.log(`Reference Date: ${revenueResult.referenceDate}`);
    console.log('Aggregated Segments:', revenueResult.ttmSegments);
  }

  // Test 2: Mimic useGeographicRevenueTTM  
  console.log('\n2. Testing useGeographicRevenueTTM equivalent...');
  
  const geographicData = await fetchWithCache('revenue-geographic-segmentation', symbol, 'v4', 'annual');
  
  if (geographicData) {
    console.log(`Received ${geographicData.length} annual entries for geographic revenue`);
    
    // Process TTM aggregation
    const geographicResult = aggregateTTMRevenue(
      geographicData, 
      entry => Object.keys(entry)[0], 
      true
    );
    
    console.log('\nGeographic Revenue TTM Result:');
    console.log(`Reference Date: ${geographicResult.referenceDate}`);
    console.log('Aggregated Regions:', geographicResult.ttmSegments);
  } else {
    console.log('No geographic segmentation data available for SHOP');
  }

  // Test 3: Check quarterly income statement for TTM income data
  console.log('\n3. Testing TTM income data for comparison...');
  
  const incomeData = await fetchWithCache('income-statement', symbol, 'v3', 'quarter');
  
  if (incomeData && Array.isArray(incomeData) && incomeData.length >= 4) {
    // Calculate TTM revenue from income statements
    const ttmRevenue = incomeData.slice(0, 4).reduce((sum, quarter) => {
      return sum + (quarter.revenue || 0);
    }, 0);
    
    const referenceDate = incomeData[0].date;
    
    console.log(`TTM Revenue from Income Statement: $${(ttmRevenue / 1e9).toFixed(2)}B`);
    console.log(`Reference Date: ${referenceDate}`);
    
    // This is what the hooks use to scale segment data
    console.log(`\nThis TTM revenue would be used to scale segment percentages in the hooks`);
  }

  console.log('\n=== CONCLUSION ===');
  console.log('The TTM reference date represents the most recent quarter end date');
  console.log('from the available segment data, which is then used to aggregate');
  console.log('the trailing twelve months of segment/geographic revenue data.');
}

// Run the test
testExistingTTMHooks().catch(console.error);
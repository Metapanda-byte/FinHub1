#!/usr/bin/env node

/**
 * Test script to fetch TTM reference date for SHOP using FMP API
 * Uses the existing fetchWithCache infrastructure from lib/api/financial.ts
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
    console.log(`[API URL] ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`);
      const errorText = await response.text();
      console.error(`Error details: ${errorText}`);
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

// Function to extract and display date information from segment data
function extractDateInfo(data, dataType) {
  console.log(`\n=== ${dataType} DATA ANALYSIS ===`);
  
  if (!Array.isArray(data) || data.length === 0) {
    console.log(`No ${dataType} data available`);
    return null;
  }

  console.log(`Total entries: ${data.length}`);
  
  // Extract all available dates
  const allDates = data.map(entry => Object.keys(entry)[0]).filter(Boolean);
  console.log(`Available dates: ${allDates.join(', ')}`);
  
  if (allDates.length === 0) {
    console.log(`No valid dates found in ${dataType} data`);
    return null;
  }

  // Sort dates to find the most recent
  const sortedDates = allDates.sort((a, b) => new Date(b) - new Date(a));
  const mostRecentDate = sortedDates[0];
  
  console.log(`Most recent quarter date: ${mostRecentDate}`);
  
  // Show the structure of the most recent entry
  const mostRecentEntry = data.find(entry => Object.keys(entry)[0] === mostRecentDate);
  if (mostRecentEntry) {
    const segmentData = mostRecentEntry[mostRecentDate];
    console.log(`Data structure for ${mostRecentDate}:`, Object.keys(segmentData));
    
    // Show first level of segment names
    const segmentNames = Object.keys(segmentData);
    console.log(`Available segments/regions: ${segmentNames.join(', ')}`);
  }
  
  return mostRecentDate;
}

// Main function to test SHOP TTM reference date
async function testSHOPTTMDate() {
  const symbol = 'SHOP';
  
  console.log(`Testing TTM reference date extraction for ${symbol}`);
  console.log('='.repeat(60));
  
  if (!API_KEY) {
    console.error('ERROR: NEXT_PUBLIC_FMP_API_KEY environment variable not set');
    console.error('Please set your FMP API key in .env file');
    return;
  }

  // Test 1: Revenue Product Segmentation (quarterly data)
  console.log('\n1. Testing Revenue Product Segmentation...');
  const revenueSegments = await fetchWithCache('revenue-product-segmentation', symbol, 'v4', 'quarter');
  const revenueDate = extractDateInfo(revenueSegments, 'Revenue Segments');

  // Test 2: Geographic Revenue Segmentation (quarterly data)  
  console.log('\n2. Testing Geographic Revenue Segmentation...');
  const geographicRevenue = await fetchWithCache('revenue-geographic-segmentation', symbol, 'v4', 'quarter');
  const geographicDate = extractDateInfo(geographicRevenue, 'Geographic Revenue');

  // Test 3: Compare with quarterly income statement dates
  console.log('\n3. Testing Quarterly Income Statement for comparison...');
  const incomeStatements = await fetchWithCache('income-statement', symbol, 'v3', 'quarter');
  let incomeDate = null;
  if (Array.isArray(incomeStatements) && incomeStatements.length > 0) {
    const incomeDates = incomeStatements.map(entry => entry.date).filter(Boolean);
    console.log(`Total quarterly income statements available: ${incomeStatements.length}`);
    console.log(`Last 8 quarters available: ${incomeDates.slice(0, 8).join(', ')}`);
    incomeDate = incomeDates[0]; // Most recent
    console.log(`Most recent income statement date: ${incomeDate}`);
    
    // Show TTM calculation details
    console.log('\nTTM (Trailing Twelve Months) would include these 4 quarters:');
    const ttmQuarters = incomeDates.slice(0, 4);
    ttmQuarters.forEach((date, index) => {
      const quarter = incomeStatements.find(stmt => stmt.date === date);
      const revenue = quarter?.revenue ? (quarter.revenue / 1e9).toFixed(2) : 'N/A';
      console.log(`  Q${4-index} ${date}: Revenue $${revenue}B`);
    });
    
    if (ttmQuarters.length === 4) {
      const ttmRevenue = ttmQuarters.reduce((sum, date) => {
        const quarter = incomeStatements.find(stmt => stmt.date === date);
        return sum + (quarter?.revenue || 0);
      }, 0);
      console.log(`  TTM Total Revenue: $${(ttmRevenue / 1e9).toFixed(2)}B`);
    }
  }

  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Symbol: ${symbol}`);
  console.log(`Revenue Segments most recent date: ${revenueDate || 'N/A'}`);
  console.log(`Geographic Revenue most recent date: ${geographicDate || 'N/A'}`);
  console.log(`Income Statement most recent date: ${incomeDate || 'N/A'}`);
  
  // Determine the best reference date for TTM
  const availableDates = [revenueDate, geographicDate, incomeDate].filter(Boolean);
  if (availableDates.length > 0) {
    const latestDate = availableDates.sort((a, b) => new Date(b) - new Date(a))[0];
    console.log(`\nRecommended TTM reference date: ${latestDate}`);
    
    // Convert to a more readable format
    const dateObj = new Date(latestDate);
    const quarter = Math.floor((dateObj.getMonth() / 3)) + 1;
    const year = dateObj.getFullYear();
    console.log(`This represents: Q${quarter} ${year} (Quarter ending ${latestDate})`);
  } else {
    console.log('\nNo valid dates found across all data sources');
  }
}

// Run the test
testSHOPTTMDate().catch(console.error);
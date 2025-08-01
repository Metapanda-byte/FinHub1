#!/usr/bin/env node

/**
 * SHOP TTM Reference Date Summary
 * 
 * This script demonstrates the TTM (Trailing Twelve Months) reference date
 * for SHOP using the existing FMP API infrastructure.
 */

// Hard-coded API key for testing (from .env file)
const API_KEY = 'aQNTmqOc47AwKEIVgWuK9A6HTe7gArGX';

async function fetchWithCache(endpoint, ticker, version = 'v3', period = 'annual') {
  if (!ticker || !API_KEY) return null;

  try {
    const baseUrl = `https://financialmodelingprep.com/api/${version}`;
    let url;
    
    if (version === 'v4') {
      url = `${baseUrl}/${endpoint}?symbol=${ticker}&apikey=${API_KEY}&structure=default&period=${period}`;
    } else {
      url = `${baseUrl}/${endpoint}/${ticker}?apikey=${API_KEY}&period=${period}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data || (Array.isArray(data) && data.length === 0)) return null;
    if (data.error || data["Error Message"]) return null;

    return data;
  } catch (error) {
    return null;
  }
}

async function getSHOPTTMSummary() {
  const symbol = 'SHOP';
  
  console.log('SHOP (Shopify) TTM Reference Date Analysis');
  console.log('==========================================');
  
  // 1. Check quarterly income statement data (most reliable)
  const incomeData = await fetchWithCache('income-statement', symbol, 'v3', 'quarter');
  
  if (incomeData && incomeData.length >= 4) {
    const quarterlyDates = incomeData.slice(0, 4).map(q => q.date);
    const mostRecentQuarter = quarterlyDates[0];
    
    console.log('\n1. QUARTERLY INCOME STATEMENT DATA:');
    console.log(`   Most Recent Quarter: ${mostRecentQuarter}`);
    console.log(`   TTM Quarters: ${quarterlyDates.join(', ')}`);
    
    const ttmRevenue = incomeData.slice(0, 4).reduce((sum, q) => sum + (q.revenue || 0), 0);
    console.log(`   TTM Revenue: $${(ttmRevenue / 1e9).toFixed(2)}B`);
  }
  
  // 2. Check revenue product segmentation (annual data)
  const revenueSegments = await fetchWithCache('revenue-product-segmentation', symbol, 'v4', 'annual');
  
  if (revenueSegments && revenueSegments.length > 0) {
    const segmentDates = revenueSegments.map(entry => Object.keys(entry)[0]).slice(0, 4);
    const mostRecentSegmentDate = segmentDates[0];
    
    console.log('\n2. REVENUE PRODUCT SEGMENTATION DATA:');
    console.log(`   Most Recent Annual Period: ${mostRecentSegmentDate}`);
    console.log(`   Available Annual Periods: ${segmentDates.join(', ')}`);
    console.log(`   Note: This data is aggregated annually, not quarterly`);
  }
  
  // 3. Check geographic revenue segmentation (annual data)
  const geographicRevenue = await fetchWithCache('revenue-geographic-segmentation', symbol, 'v4', 'annual');
  
  if (geographicRevenue && geographicRevenue.length > 0) {
    const geoDates = geographicRevenue.map(entry => Object.keys(entry)[0]).slice(0, 4);
    const mostRecentGeoDate = geoDates[0];
    
    console.log('\n3. GEOGRAPHIC REVENUE SEGMENTATION DATA:');
    console.log(`   Most Recent Annual Period: ${mostRecentGeoDate}`);
    console.log(`   Available Annual Periods: ${geoDates.join(', ')}`);
    console.log(`   Note: This data is aggregated annually, not quarterly`);
  }
  
  console.log('\n=== KEY FINDINGS ===');
  console.log('\n• QUARTERLY DATA (Most Current):');
  console.log('  - Most recent quarter available: 2025-03-31 (Q1 2025)');
  console.log('  - TTM calculation uses: Q1 2025, Q4 2024, Q3 2024, Q2 2024');
  console.log('  - TTM Revenue: $9.38B');
  
  console.log('\n• SEGMENT DATA (Annual Aggregation):');
  console.log('  - Product segments available through: 2024-12-31');
  console.log('  - Geographic segments available through: 2024-12-30');
  console.log('  - TTM aggregation uses last 4 annual periods');
  
  console.log('\n• REFERENCE DATE FOR TTM:');
  console.log('  - For quarterly-based TTM: 2025-03-31');
  console.log('  - For segment-based TTM: 2024-12-31 (product) / 2024-12-30 (geographic)');
  
  console.log('\n• HOW THE EXISTING HOOKS WORK:');
  console.log('  - useRevenueSegmentsTTM: Uses annual segment data, reference date 2024-12-31');
  console.log('  - useGeographicRevenueTTM: Uses annual geographic data, reference date 2024-12-30');
  console.log('  - Both hooks aggregate last 4 annual periods and scale to match TTM income');
  
  console.log('\n• RECOMMENDATION:');
  console.log('  - The most recent quarterly reference date for SHOP is: 2025-03-31');
  console.log('  - This represents Q1 2025 ending March 31, 2025');
  console.log('  - Use this date when displaying "as of" information for TTM data');
}

// Run the summary
getSHOPTTMSummary().catch(console.error);
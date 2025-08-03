"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RevenueChart } from "@/components/dashboard/charts/revenue-chart";
import { EbitdaChart } from "@/components/dashboard/charts/ebitda-chart";
import { PieChart } from "@/components/dashboard/charts/pie-chart";
import { StockChart } from "@/components/dashboard/charts/stock-chart";
import { ShareholdersTable } from "@/components/dashboard/tables/shareholders-table";
import { useState, useMemo } from "react";
import { useSearchStore } from "@/lib/store/search-store";
import { useCompanyProfile, useIncomeStatements, useStockPriceData, useRevenueSegmentsTTM, useGeographicRevenueTTM, useEmployeeCount, useBalanceSheets, useFinancialRatios, usePriceTarget, useAnalystRatings, useInstitutionalOwnership, useESGScore } from "@/lib/api/financial";
import { formatFinancialNumber, formatLargeNumber } from "@/lib/utils/formatters";
import { Star, StarOff } from "lucide-react";
import { useWatchlistStore } from "@/lib/store/watchlist-store";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useStockQuote } from "@/lib/api/stock";
import { format } from "date-fns";
import { useTheme } from 'next-themes';
import { pieChartPalettes } from "@/components/dashboard/charts/pie-chart-palettes";
import clsx from 'clsx';
import useSWR from 'swr';
import { ChartLoadingSkeleton, CardLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { CrunchingNumbersCardWithHeader } from "@/components/ui/crunching-numbers-loader";

// Define a consistent FinHub blue palette (dark to light)
const finhubBluePalette = [
  '#1e3a8a', // Dark blue
  '#2563eb',
  '#3b82f6',
  '#60a5fa',
  '#93c5fd',
  '#bfdbfe',
  '#dbeafe',
  '#e0e7ff', // Lightest blue
];

// Add a helper for market cap in billions
function formatMarketCapBillions(value: number) {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  return `${(value / 1_000_000_000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B`;
}

// Add a hook to fetch TTM revenue from FMP key-metrics-ttm endpoint
function useTTMRevenue(symbol: string) {
  const FMP_API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;
  const url = symbol
    ? `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?period=ttm&apikey=${FMP_API_KEY}`
    : null;
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data, error } = useSWR(url, fetcher, {
    refreshInterval: 5 * 60 * 1000, // 5 minutes for TTM data
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000
  });
  // FMP returns an array with one object, e.g. [{ revenue: 1234567890, ... }]
  const ttmRevenue =
    data && Array.isArray(data) && data.length > 0 && typeof data[0].revenue === 'number'
      ? data[0].revenue
      : null;
  return { ttmRevenue, isLoading: !error && !data, error };
}

// Add a hook to fetch TTM income statement from FMP income-statement endpoint
function useTTMIncomeStatement(symbol: string) {
  const FMP_API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;
  const url = symbol
    ? `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?period=ttm&apikey=${FMP_API_KEY}`
    : null;
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data, error } = useSWR(url, fetcher, {
    refreshInterval: 5 * 60 * 1000, // 5 minutes for TTM data
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000
  });
  // FMP returns an array with one object, e.g. [{ revenue: 1234567890, ebitda: 123456789, ... }]
  const ttm = data && Array.isArray(data) && data.length > 0 ? data[0] : null;
  return { ttm, isLoading: !error && !data, error };
}

// Financial-report-style geographic labeling system
function getGeoLabel(region: string): string {
  if (!region) return '';
  
  console.log(`[DEBUG getGeoLabel] Processing: "${region}"`);
  
  // Clean and normalize input
  let cleaned = region.toLowerCase().trim();
  
  // Remove common business prefixes/suffixes first
  const cleanPatterns = [
    /^(revenue|sales|income|segment|geographic)[\s-]+/i,
    /[\s-]+(revenue|sales|income|segment|geographic)$/i,
    /^(by|from|in)[\s-]+/i,
  ];
  
  for (const pattern of cleanPatterns) {
    cleaned = cleaned.replace(pattern, '').trim();
  }
  
  // Handle dash/underscore separated values (common in APIs)
  if (cleaned.includes('-') || cleaned.includes('_')) {
    const parts = cleaned.split(/[-_]+/).map(p => p.trim()).filter(Boolean);
    // Take the most meaningful part (usually the last geographic identifier)
    cleaned = parts[parts.length - 1] || cleaned;
  }
  
  console.log(`[DEBUG getGeoLabel] Cleaned to: "${cleaned}"`);
  
  // Exact match mappings (most reliable) - ordered by specificity
  const exactMappings: Record<string, string> = {
    // Countries (most specific)
    'united states of america': 'United States',
    'united states': 'United States',
    'usa': 'United States',
    'u.s.a': 'United States',
    'u.s.': 'United States',
    'us': 'United States',
    'united kingdom': 'United Kingdom',
    'great britain': 'United Kingdom',
    'uk': 'United Kingdom',
    'peoples republic of china': 'China',
    'prc': 'China',
    'china': 'China',
    'japan': 'Japan',
    'germany': 'Germany',
    'france': 'France',
    'canada': 'Canada',
    'australia': 'Australia',
    'india': 'India',
    'brazil': 'Brazil',
    'mexico': 'Mexico',
    'south korea': 'South Korea',
    'korea': 'South Korea',
    'netherlands': 'Netherlands',
    'switzerland': 'Switzerland',
    'spain': 'Spain',
    'italy': 'Italy',
    'sweden': 'Sweden',
    'norway': 'Norway',
    'denmark': 'Denmark',
    'singapore': 'Singapore',
    'russia': 'Russia',
    'south africa': 'South Africa',
    
    // Major Business Regions
    'asia pacific': 'Asia Pacific',
    'asia-pacific': 'Asia Pacific',
    'apac': 'Asia Pacific',
    'north america': 'North America',
    'emea': 'EMEA',
    'europe middle east africa': 'EMEA',
    'europe middle east and africa': 'EMEA',
    'latin america': 'Latin America',
    'latam': 'Latin America',
    'south america': 'South America',
    
    // Broader Regions
    'europe': 'Europe',
    'european union': 'Europe',
    'eu': 'Europe',
    'asia': 'Asia',
    'africa': 'Africa',
    'middle east': 'Middle East',
    'americas': 'Americas',
    'oceania': 'Oceania',
    
    // Business Categories
    'domestic': 'Domestic',
    'international': 'International',
    'foreign': 'International',
    'home': 'Domestic',
    'rest of world': 'Rest of World',
    'row': 'Rest of World',
    'other': 'Other',
    'global': 'Global',
    'worldwide': 'Worldwide',
  };
  
  // Try exact match first
  const exactMatch = exactMappings[cleaned];
  if (exactMatch) {
    console.log(`[DEBUG getGeoLabel] Exact match: "${cleaned}" -> "${exactMatch}"`);
    return exactMatch;
  }
  
  // Handle special cases first
  if (cleaned === 'non us' || cleaned === 'non-us') {
    console.log(`[DEBUG getGeoLabel] Special case: "${cleaned}" -> "International"`);
    return 'International';
  }
  
  // Try word-boundary matching for compound terms, but exclude problematic short matches
  for (const [key, value] of Object.entries(exactMappings)) {
    // Skip short keys that could cause false matches in compound terms
    if (key.length <= 2 && cleaned.includes(' ')) {
      continue;
    }
    
    // Only match if it's a complete word (prevents "us" matching in "business" or "non us")
    const wordRegex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    if (wordRegex.test(cleaned)) {
      console.log(`[DEBUG getGeoLabel] Word boundary match: "${key}" -> "${value}"`);
      return value;
    }
  }
  
  // If no match found, format the original nicely
  const formatted = cleaned
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  console.log(`[DEBUG getGeoLabel] No match found, formatted: "${region}" -> "${formatted}"`);
  return formatted || region;
}

export function CompanyOverview() {
  const [timeframe, setTimeframe] = useState<'YTD' | '1Y' | '5Y'>('YTD');
  const { hasStock, addStock, removeStock } = useWatchlistStore();
  const currentSymbol = useSearchStore((state) => state.currentSymbol);
  const { profile, isLoading: profileLoading } = useCompanyProfile(currentSymbol || '');
  const { quote, loading: quoteLoading } = useStockQuote(currentSymbol || '');
  const { statements, isLoading: statementsLoading } = useIncomeStatements(currentSymbol || '');
  const { prices, isLoading: pricesLoading } = useStockPriceData(currentSymbol || '', timeframe);
  const { segments: ttmSegmentData, referenceDate: ttmSegmentRefDate, isLoading: segmentsLoading } = useRevenueSegmentsTTM(currentSymbol || '');
  const { regions: ttmGeographyData, referenceDate: ttmGeoRefDate, isLoading: regionsLoading } = useGeographicRevenueTTM(currentSymbol || '');
  const { employeeCount, isLoading: employeeCountLoading } = useEmployeeCount(currentSymbol || '');
  const { statements: balanceSheets, isLoading: balanceSheetLoading } = useBalanceSheets(currentSymbol || '');
  const { resolvedTheme } = useTheme();
  const pieLabelColor = resolvedTheme === 'dark' ? '#fff' : '#111';
  const [selectedPalette, setSelectedPalette] = useState<keyof typeof pieChartPalettes>('finhubBlues');
  const { ttmRevenue, isLoading: ttmRevenueLoading } = useTTMRevenue(currentSymbol || '');
  const { ttm, isLoading: ttmLoading } = useTTMIncomeStatement(currentSymbol || '');
  
  // New API hooks for additional data
  const { ratios, isLoading: ratiosLoading } = useFinancialRatios(currentSymbol || '');
  const { priceTarget, isLoading: priceTargetLoading } = usePriceTarget(currentSymbol || '');
  const { ratings, isLoading: ratingsLoading } = useAnalystRatings(currentSymbol || '');
  const { ownership, isLoading: ownershipLoading } = useInstitutionalOwnership(currentSymbol || '');
  const { esgScore, isLoading: esgLoading } = useESGScore(currentSymbol || '');

  console.log('Debug:', {
    currentSymbol,
    profileLoading,
    quoteLoading,
    hasProfile: !!profile,
    hasQuote: !!quote,
    profile,
    quote
  });

  // Debug: Log the TTM API response and date
  if (ttm) {
    console.log('[DEBUG] TTM API response:', ttm);
    console.log('[DEBUG] TTM date:', ttm.date);
  }
  
  // Calculate the canonical LTM revenue that all displays should use
  let canonicalLTMRevenue: number | null = null;
  let canonicalLTMDate: string | null = null;
  
  if (ttm && typeof ttm.revenue === 'number') {
    // Prefer TTM endpoint if available
    canonicalLTMRevenue = ttm.revenue / 1e9;
    canonicalLTMDate = ttm.date;
    console.log('[DEBUG] Using TTM endpoint for canonical revenue:', canonicalLTMRevenue);
  } else if (statements && statements.length >= 4) {
    // Fallback to summing 4 quarters
    const latestFour = statements.slice(0, 4);
    const ltmRevenue = latestFour.reduce((sum, s) => sum + (s.revenue || 0), 0);
    canonicalLTMRevenue = ltmRevenue / 1e9;
    canonicalLTMDate = latestFour[0].date;
    console.log('[DEBUG] Using 4-quarter sum for canonical revenue:', canonicalLTMRevenue);
  }
  
  // Log revenue consistency check
  console.log('[DEBUG] Revenue Consistency Check:', {
    canonicalLTMRevenue,
    segmentTotal: ttmSegmentData.reduce((sum, s) => sum + s.value, 0),
    geographyTotal: ttmGeographyData.reduce((sum, s) => sum + s.value, 0)
  });

  const TOP_N = 6; // Show top 6, rest as 'Other'

  function groupTopNPlusOther(data: any[], nameKey = 'name', valueKey = 'value') {
    if (!Array.isArray(data) || data.length <= TOP_N) return data;
    const sorted = [...data].sort((a, b) => b[valueKey] - a[valueKey]);
    const top = sorted.slice(0, TOP_N);
    const other = sorted.slice(TOP_N);
    const otherValue = other.reduce((sum, item) => sum + item[valueKey], 0);
    const otherPercentage = other.reduce((sum, item) => sum + (item.percentage || 0), 0);
    if (otherValue > 0) {
      top.push({
        [nameKey]: 'Other',
        [valueKey]: otherValue,
        percentage: otherPercentage,
      });
    }
    return top;
  }

  // Find the latest quarterly statement date
  const latestQuarterDate = statements && statements.length > 0 ? statements[0].date : null;

  // Prepare annual revenue bars with FYXX labels
  const annualBars = statements.slice(0, 5).reverse().map(statement => ({
    year: 'FY' + statement.calendarYear.toString().slice(-2),
    value: statement.revenue / 1e9,
    isLTM: false
  }));

  // LTM logic: use TTM endpoint if up-to-date, otherwise sum latest 4 quarters
  let ltmBar = null;
  let ltmEbitdaBar = null;
  let ltmRefDate = null;
  let ltmLabel = 'LTM¹';
  let ltmFootnoteDate = null;

  // Check if TTM endpoint is up-to-date
  if (
    ttm && typeof ttm.revenue === 'number' &&
    ttm.date && latestQuarterDate && ttm.date === latestQuarterDate
  ) {
    // Use TTM endpoint
    ltmBar = {
      year: ltmLabel,
      value: ttm.revenue / 1e9,
      isLTM: true
    };
    ltmEbitdaBar = {
      year: ltmLabel,
      value: ttm.ebitda / 1e9,
      margin: ttm.revenue && ttm.ebitda ? (ttm.ebitda / ttm.revenue) * 100 : null,
      isLTM: true
    };
    ltmRefDate = ttm.date ? new Date(ttm.date) : null;
    ltmFootnoteDate = ttm.date;
  } else if (statements && statements.length >= 4) {
    // Sum latest 4 quarters
    const latestFour = statements.slice(0, 4);
    const ltmRevenue = latestFour.reduce((sum, s) => sum + (s.revenue || 0), 0);
    const ltmEbitda = latestFour.reduce((sum, s) => sum + (s.ebitda || 0), 0);
    ltmBar = {
      year: ltmLabel,
      value: ltmRevenue / 1e9,
      isLTM: true
    };
    ltmEbitdaBar = {
      year: ltmLabel,
      value: ltmEbitda / 1e9,
      margin: ltmRevenue > 0 ? (ltmEbitda / ltmRevenue) * 100 : null,
      isLTM: true
    };
    ltmRefDate = latestFour[0].date ? new Date(latestFour[0].date) : null;
    ltmFootnoteDate = latestFour[0].date;
  }

  const revenueData = ltmBar ? [...annualBars, ltmBar] : annualBars;

  // Prepare annual EBITDA bars with FYXX labels
  const annualEbitdaBars = statements.slice(0, 5).reverse().map(statement => ({
    year: 'FY' + statement.calendarYear.toString().slice(-2),
    value: statement.ebitda / 1e9,
    margin: statement.ebitdaratio ? (statement.ebitdaratio * 100) : 0
  }));
  
  const ebitdaData = ltmEbitdaBar ? [...annualEbitdaBars, {
    year: ltmEbitdaBar.year,
    value: ltmEbitdaBar.value,
    margin: ltmEbitdaBar.margin || 0
  }] : annualEbitdaBars;

  // FYE note extraction (move out of useMemo)
  const mostRecentFYE = statements && statements.length > 0 ? statements[0].date : null;
  const fyeNote = mostRecentFYE ? `FYE = ${format(new Date(mostRecentFYE), 'dd-MMM')}` : '';

  const isWatchlisted = hasStock(currentSymbol || '');

  const handleWatchlistToggle = () => {
    console.log('Watchlist toggle clicked:', {
      currentSymbol,
      hasStock: hasStock(currentSymbol || ''),
      profile,
      quote
    });
    
    if (!currentSymbol || !profile || !quote) {
      console.log('Cannot toggle watchlist:', {
        missingSymbol: !currentSymbol,
        missingProfile: !profile,
        missingQuote: !quote
      });
      return;
    }
    
    if (hasStock(currentSymbol)) {
      removeStock(currentSymbol);
    } else {
      addStock({
        symbol: currentSymbol,
        name: profile?.companyName,
        lastPrice: quote.price,
        change: quote.change,
        changePercent: quote.changesPercentage,
        marketCap: quote.marketCap,
        peRatio: quote.pe
      });
    }
  };

  // Palette selector UI
  const paletteOptions = Object.entries(pieChartPalettes).map(([key, value]) => ({
    key,
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    colors: value,
  }));

  const mostRecentBalanceSheet = balanceSheets && balanceSheets.length > 0 ? balanceSheets[0] : null;
  const mostRecentIncome = statements && statements.length > 0 ? statements[0] : null;
  const totalDebt = mostRecentBalanceSheet ? (mostRecentBalanceSheet.shortTermDebt || 0) + (mostRecentBalanceSheet.longTermDebt || 0) : null;
  const cash = mostRecentBalanceSheet ? (mostRecentBalanceSheet.cashAndShortTermInvestments || mostRecentBalanceSheet.cashAndCashEquivalents || 0) : null;
  const ebitda = mostRecentIncome ? mostRecentIncome.ebitda : null;
  const marketCap = profile && profile?.mktCap ? profile?.mktCap : null;
  const minorityInterest = mostRecentBalanceSheet && mostRecentBalanceSheet.minorityInterest ? mostRecentBalanceSheet.minorityInterest : 0;
  const enterpriseValue = (marketCap !== null && totalDebt !== null && cash !== null)
    ? marketCap + totalDebt - cash + minorityInterest
    : null;
  const evToEbitda = (enterpriseValue !== null && ebitda) ? enterpriseValue / ebitda : null;
  // Get highlight color from palette based on theme
  const highlightColor = resolvedTheme === 'dark'
    ? pieChartPalettes[selectedPalette][0] || '#1e293b' // darkest for dark mode
    : pieChartPalettes[selectedPalette][pieChartPalettes[selectedPalette].length - 1] || '#f9fafb'; // lightest for light mode
  // Determine border color class for theme
  const borderColorClass = resolvedTheme === 'dark' ? 'border-white' : 'border-black';
  const highlightTextColor = resolvedTheme === 'dark' ? '#fff' : '#111';

  // Helper to format numbers with aligned 'B' using '#,##0_)' approach
  function formatWithParens(value: number | null) {
    if (value === null || isNaN(value)) return 'N/A';
    const absStr = (Math.abs(value) / 1_000_000_000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    if (value < 0) {
      return <span><span>(</span>{absStr}<span style={{ display: 'inline-block', minWidth: '1.2ch', textAlign: 'left' }}>B)</span></span>;
    }
    // Add a space after B to align with parenthesis in negative numbers
    return <span>{absStr}<span style={{ display: 'inline-block', minWidth: '1.2ch', textAlign: 'left' }}>B&nbsp;</span></span>;
  }
  // Helper to format ratios with 'x' and align using '#,##0_)' approach
  function formatRatio(value: number | null) {
    if (value === null || isNaN(value)) return 'N/A';
    const absStr = value.toFixed(1);
    if (value < 0) {
      return <span><span>(</span>{absStr}<span style={{ display: 'inline-block', minWidth: '1.2ch', textAlign: 'left' }}>x)</span></span>;
    }
    // Add a space after x to align with parenthesis in negative numbers
    return <span>{absStr}<span style={{ display: 'inline-block', minWidth: '1.2ch', textAlign: 'left' }}>x&nbsp;</span></span>;
  }

  if (!currentSymbol || profileLoading || statementsLoading || pricesLoading || segmentsLoading || regionsLoading) {
    return (
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <CrunchingNumbersCardWithHeader 
          className="col-span-full"
          title="Company Overview"
          message="Crunching the numbers"
        />
      </div>
    );
  }

  if (!revenueData || !ebitdaData || !ltmRefDate) {
    return (
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <CrunchingNumbersCardWithHeader 
          className="col-span-full"
          title="No Data Available"
          message="Unable to fetch company data"
        />
      </div>
    );
  }

  // Debug: Log the raw geographyData before any processing
  console.log('[DEBUG] Raw geographyData:', ttmGeographyData);
  console.log('[DEBUG] Raw segmentData:', ttmSegmentData);
  console.log('[DEBUG] Segments loading:', segmentsLoading);
  console.log('[DEBUG] Regions loading:', regionsLoading);
  
  // SPECIAL DEBUG FOR MSFT - let's see the exact structure
  if (currentSymbol === 'MSFT') {
    console.log('[MSFT DEBUG] ttmGeographyData length:', ttmGeographyData.length);
    ttmGeographyData.forEach((item, idx) => {
      console.log(`[MSFT DEBUG] Item ${idx}:`, JSON.stringify(item, null, 2));
    });
  }

  // Scale segment data to match canonical LTM revenue if needed
  let scaledSegmentData = [...ttmSegmentData];
  if (canonicalLTMRevenue && ttmSegmentData.length > 0) {
    const segmentTotal = ttmSegmentData.reduce((sum, s) => sum + s.value, 0);
    if (segmentTotal > 0 && Math.abs(segmentTotal - canonicalLTMRevenue) > 0.1) {
      const scaleFactor = canonicalLTMRevenue / segmentTotal;
      console.log(`[DEBUG] Scaling segments by ${scaleFactor} to match canonical revenue`);
      scaledSegmentData = ttmSegmentData.map(seg => ({
        ...seg,
        value: seg.value * scaleFactor,
        percentage: (seg.value * scaleFactor / canonicalLTMRevenue) * 100
      }));
    }
  }
  
  // Scale geography data to match canonical LTM revenue if needed
  let scaledGeographyData = [...ttmGeographyData];
  if (canonicalLTMRevenue && ttmGeographyData.length > 0) {
    const geoTotal = ttmGeographyData.reduce((sum, s) => sum + s.value, 0);
    if (geoTotal > 0 && Math.abs(geoTotal - canonicalLTMRevenue) > 0.1) {
      const scaleFactor = canonicalLTMRevenue / geoTotal;
      console.log(`[DEBUG] Scaling geography by ${scaleFactor} to match canonical revenue`);
      scaledGeographyData = ttmGeographyData.map(geo => ({
        ...geo,
        value: geo.value * scaleFactor,
        percentage: (geo.value * scaleFactor / canonicalLTMRevenue) * 100
      }));
    }
  }

  // Process geography labels using the improved geographic labeling function
  // Use fullName when available (contains original unprocessed name), fallback to name
  const processedGeographyData = scaledGeographyData.map((item, index) => {
    const originalName = item.fullName || item.name;
    const processedName = getGeoLabel(originalName);
    console.log(`[DEBUG] Geographic label processing [${index}]: "${originalName}" -> "${processedName}"`);
    console.log(`[DEBUG] Item data:`, item);
    return {
      ...item,
      name: processedName,
    };
  });

  // Consolidate duplicate geographic regions
  const consolidatedGeographyData = processedGeographyData.reduce((acc: typeof processedGeographyData, current) => {
    const existingIndex = acc.findIndex(item => item.name === current.name);
    if (existingIndex >= 0) {
      // Combine values and recalculate percentage
      acc[existingIndex].value += current.value;
      acc[existingIndex].percentage += current.percentage;
      console.log(`[DEBUG] Consolidated "${current.name}": ${acc[existingIndex].value}B (${acc[existingIndex].percentage.toFixed(1)}%)`);
    } else {
      acc.push({ ...current });
    }
    return acc;
  }, []);

  // Sort by value descending
  consolidatedGeographyData.sort((a, b) => b.value - a.value);

  // Debug the final processed data
  console.log('[DEBUG] Final consolidated geography data:', consolidatedGeographyData);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Company Overview</CardTitle>
          <CardDescription>
            Key information about {profile?.companyName || 'the company'}
          </CardDescription>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleWatchlistToggle}
                className={cn(
                  "transition-colors hover:bg-yellow-100 dark:hover:bg-yellow-900",
                  hasStock(currentSymbol) && "text-yellow-500"
                )}
                disabled={!currentSymbol || profileLoading || quoteLoading}
              >
                {hasStock(currentSymbol) ? (
                  <Star className="h-5 w-5 fill-current" />
                ) : (
                  <StarOff className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {hasStock(currentSymbol) ? "Remove from watchlist" : "Add to watchlist"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <label htmlFor="palette-select" className="text-sm font-medium">Chart Palette:</label>
          <select
            id="palette-select"
            className="border rounded px-2 py-1 text-sm"
            value={selectedPalette}
            onChange={e => setSelectedPalette(e.target.value as keyof typeof pieChartPalettes)}
          >
            {paletteOptions.map(opt => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
          {/* Show color swatches for preview */}
          <div className="flex gap-1 ml-2">
            {pieChartPalettes[selectedPalette].slice(0, 8).map((color, idx) => (
              <span key={color} style={{ background: color, width: 16, height: 16, borderRadius: 4, border: '1px solid #ccc', display: 'inline-block' }} />
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          <div className="flex items-start space-x-4 rounded-md border p-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile?.image} alt={profile?.companyName} />
              <AvatarFallback>{profile?.symbol}</AvatarFallback>
            </Avatar>
            <div className="space-y-2 flex-1">
              <div className="space-y-0.5">
                <h3 className="text-base font-semibold leading-none tracking-tight">
                  {profile?.companyName} ({profile?.symbol})
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {profile?.sector}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {profile?.industry}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {profile?.exchangeShortName}
                  </Badge>
                </div>
              </div>
              <p className="text-sm">{profile?.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <div>
                  <p className="text-xs text-muted-foreground">Market Cap</p>
                  <p className="text-sm font-medium tabular-nums">{formatMarketCapBillions(marketCap || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Employees</p>
                  <p className="text-sm font-medium tabular-nums">
                    {employeeCountLoading
                      ? <span className="animate-pulse text-muted-foreground">Loading...</span>
                      : (employeeCount !== null && employeeCount !== undefined)
                        ? employeeCount.toLocaleString()
                        : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CEO</p>
                  <p className="text-sm font-medium">{profile?.ceo || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">
                    {profile?.city && profile?.state ? `${profile?.city}, ${profile?.state}` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-3">
            {/* Share Price Performance and Capital Structure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {pricesLoading ? (
                <ChartLoadingSkeleton />
              ) : (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold" style={{ color: 'var(--finhub-title)' }}>Share Price Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StockChart symbol={currentSymbol} timeframe={timeframe} />
                  </CardContent>
                </Card>
              )}
              {balanceSheetLoading ? (
                <CardLoadingSkeleton />
              ) : (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold" style={{ color: 'var(--finhub-title)' }}>Capital Structure</CardTitle>
                  </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-0">
                    <div className="flex justify-between items-center py-1.5 px-6 text-sm">
                      <span>Market Cap</span>
                      <span className="text-right tabular-nums">{formatWithParens(marketCap)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 px-6 text-sm">
                      <span>(+) Total Debt</span>
                      <span className="text-right tabular-nums">{formatWithParens(totalDebt)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 px-6 text-sm">
                      <span>(+) Minority Interest</span>
                      <span className="text-right tabular-nums">{formatWithParens(minorityInterest)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 px-6 text-sm">
                      <span>(-) Cash & Equivalents</span>
                      <span className="text-right tabular-nums">{formatWithParens(cash !== null ? -Math.abs(cash) : null)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 px-6 text-sm font-semibold border-t border-slate-200 dark:border-slate-700">
                      <span>Enterprise Value</span>
                      <span className="text-right tabular-nums">{formatWithParens(enterpriseValue)}</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 mt-6">
                    <div className="py-3 px-6 bg-slate-50 dark:bg-slate-900/50">
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Key Metrics</div>
                    </div>
                    <div className="space-y-0">
                      <div className="flex justify-between items-center py-1.5 px-6 text-sm">
                        <span>P/E Ratio</span>
                        <span className="text-right tabular-nums">{formatRatio(quote && quote.pe ? quote.pe : null)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 px-6 text-sm">
                        <span>EV / EBITDA</span>
                        <span className="text-right tabular-nums">{formatRatio(evToEbitda)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              )}
            </div>
            
            {/* Historical Financial Charts */}
            <div className="grid md:grid-cols-2 gap-3" style={{ position: 'relative' }}>
              {statementsLoading ? (
                <ChartLoadingSkeleton />
              ) : (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-bold" style={{ color: 'var(--finhub-title)' }}>Historical Revenue</CardTitle>
                  </CardHeader>
                  <CardContent style={{ position: 'relative', paddingBottom: 28 }}>
                    <RevenueChart 
                      data={revenueData}
                      palette={revenueData.map((bar, idx) => idx === revenueData.length - 1 ? pieChartPalettes[selectedPalette][0] : pieChartPalettes[selectedPalette][3])}
                      tickFontSize={12}
                    />
                    {ltmRefDate && (
                      <div style={{ position: 'absolute', left: 0, bottom: 4, fontSize: 11, color: 'var(--muted-foreground)', marginTop: '0.5rem', marginLeft: '0.75rem' }}>
                        <span>{'¹ As at: '}{format(ltmRefDate, 'MMM-yy')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              {statementsLoading ? (
                <ChartLoadingSkeleton />
              ) : (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-bold" style={{ color: 'var(--finhub-title)' }}>Historical EBITDA & Margin</CardTitle>
                  </CardHeader>
                  <CardContent style={{ position: 'relative', paddingBottom: 28 }}>
                    <EbitdaChart 
                      data={ebitdaData}
                      palette={ebitdaData.map((bar, idx) => idx === ebitdaData.length - 1 ? pieChartPalettes[selectedPalette][0] : pieChartPalettes[selectedPalette][3])}
                      tickFontSize={12}
                    />
                    {ltmRefDate && (
                      <div style={{ position: 'absolute', left: 0, bottom: 4, fontSize: 11, color: 'var(--muted-foreground)', marginTop: '0.5rem', marginLeft: '0.75rem' }}>
                        <span>{'¹ As at: '}{format(ltmRefDate, 'MMM-yy')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              {/* FYE Note positioned at bottom right of the charts container */}
              {fyeNote && (
                <div style={{ 
                  position: 'absolute', 
                  bottom: '4px', 
                  right: '16px', 
                  fontSize: '11px', 
                  color: 'var(--muted-foreground)',
                  zIndex: 10,
                  backgroundColor: 'var(--background)',
                  padding: '2px 4px',
                  borderRadius: '2px'
                }}>
                  Note: {fyeNote}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {segmentsLoading ? (
                <ChartLoadingSkeleton />
              ) : (
                <Card>
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-bold" style={{ color: 'var(--finhub-title)' }}>
                      LTM Revenue by Segment<sup style={{ fontWeight: 700, fontSize: '0.55em', verticalAlign: 'super', marginLeft: 2 }}>1</sup>
                      {canonicalLTMRevenue && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          (Total: ${canonicalLTMRevenue.toFixed(1)}B)
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent style={{ position: 'relative', paddingBottom: 28 }}>
                    {(() => {
                      console.log('[DEBUG] About to render segment pie chart:', { 
                        scaledSegmentData, 
                        dataLength: scaledSegmentData.length,
                        hasData: scaledSegmentData.length > 0 
                      });
                      return null;
                    })()}
                    {scaledSegmentData.length > 0 ? (
                      <>
                        <PieChart 
                          data={scaledSegmentData} 
                          nameKey="name" 
                          dataKey="value" 
                          colors={pieChartPalettes[selectedPalette]}
                          formatter={(value) => `$${value.toFixed(1)}B`}
                          labelColor={pieLabelColor}
                        />
                        {ltmRefDate && (
                          <div style={{ position: 'absolute', left: 0, bottom: 4, fontSize: 11, color: 'var(--muted-foreground)', marginTop: '0.5rem', marginLeft: '0.75rem' }}>
                            <span>{'¹ As at: '}{format(ltmRefDate, 'MMM-yy')}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No revenue segmentation data available for this company
                      </div>
                  )}
                </CardContent>
              </Card>
              )}
              {regionsLoading ? (
                <ChartLoadingSkeleton />
              ) : (
                <Card>
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-bold" style={{ color: 'var(--finhub-title)' }}>
                      LTM Revenue by Geography<sup style={{ fontWeight: 700, fontSize: '0.55em', verticalAlign: 'super', marginLeft: 2 }}>1</sup>
                      {canonicalLTMRevenue && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          (Total: ${canonicalLTMRevenue.toFixed(1)}B)
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent style={{ position: 'relative', paddingBottom: 28 }}>
                    {(() => {
                      console.log('[DEBUG] About to render geography pie chart:', { 
                        processedGeographyData, 
                        dataLength: processedGeographyData.length,
                        hasData: processedGeographyData.length > 1 
                      });
                      return null;
                    })()}
                    {consolidatedGeographyData.length > 1 ? (
                      <PieChart 
                        data={consolidatedGeographyData} 
                        nameKey="name" 
                        dataKey="value" 
                        colors={pieChartPalettes[selectedPalette]}
                        formatter={(value) => `$${value.toFixed(1)}B`}
                        labelColor={pieLabelColor}
                      />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Not enough data to display geographic split.
                      </div>
                    )}
                    {ltmRefDate && (
                      <div style={{ position: 'absolute', left: 0, bottom: 4, fontSize: 11, color: 'var(--muted-foreground)', marginTop: '0.5rem', marginLeft: '0.75rem' }}>
                        <span>{'¹ As at: '}{format(ltmRefDate, 'MMM-yy')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* New cards section - Key Ratios, Analyst Sentiment, ESG, and Ownership */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
              {/* Key Financial Ratios Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold" style={{ color: 'var(--finhub-title)' }}>Key Ratios</CardTitle>
                </CardHeader>
                <CardContent>
                  {ratiosLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                    </div>
                  ) : ratios ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>P/E Ratio:</span>
                        <span className="font-medium tabular-nums">{ratios.peRatio?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>P/B Ratio:</span>
                        <span className="font-medium tabular-nums">{ratios.priceToBookRatio?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ROE:</span>
                        <span className="font-medium tabular-nums">{ratios.returnOnEquity ? `${(ratios.returnOnEquity * 100).toFixed(1)}%` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Debt/Equity:</span>
                        <span className="font-medium tabular-nums">{ratios.debtEquityRatio?.toFixed(2) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Ratio:</span>
                        <span className="font-medium tabular-nums">{ratios.currentRatio?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gross Margin:</span>
                        <span className="font-medium tabular-nums">{ratios.grossProfitMargin ? `${(ratios.grossProfitMargin * 100).toFixed(1)}%` : 'N/A'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No ratio data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Analyst Sentiment Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold" style={{ color: 'var(--finhub-title)' }}>Analyst Sentiment</CardTitle>
                </CardHeader>
                <CardContent>
                  {ratingsLoading || priceTargetLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                    </div>
                  ) : (ratings || priceTarget) ? (
                    <div className="space-y-2 text-sm">
                      {ratings && (
                        <>
                          <div className="flex justify-between">
                            <span>Rating:</span>
                            <Badge variant="outline" className="text-xs">
                              {ratings.ratingRecommendation || 'N/A'}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Buy: {ratings.ratingDetailsBuy || 0} | 
                            Hold: {ratings.ratingDetailsHold || 0} | 
                            Sell: {ratings.ratingDetailsSell || 0}
                          </div>
                        </>
                      )}
                      {priceTarget && (
                        <>
                          <div className="flex justify-between">
                            <span>Target High:</span>
                            <span className="font-medium tabular-nums">${priceTarget.targetHigh?.toFixed(2) || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Target Low:</span>
                            <span className="font-medium tabular-nums">${priceTarget.targetLow?.toFixed(2) || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Consensus:</span>
                            <span className="font-medium tabular-nums">${priceTarget.targetConsensus?.toFixed(2) || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Analysts:</span>
                            <span className="font-medium tabular-nums">{priceTarget.numberOfAnalysts || 'N/A'}</span>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No analyst data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ESG Scores Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold" style={{ color: 'var(--finhub-title)' }}>ESG Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  {esgLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                    </div>
                  ) : esgScore ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Overall ESG:</span>
                        <span className="font-medium tabular-nums">{esgScore.ESGScore?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Environmental:</span>
                        <span className="font-medium tabular-nums">{esgScore.environmentalScore?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Social:</span>
                        <span className="font-medium tabular-nums">{esgScore.socialScore?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Governance:</span>
                        <span className="font-medium tabular-nums">{esgScore.governanceScore?.toFixed(1) || 'N/A'}</span>
                      </div>
                      {esgScore.date && (
                        <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                          As of: {format(new Date(esgScore.date), 'MMM yyyy')}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No ESG data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ownership Structure Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold" style={{ color: 'var(--finhub-title)' }}>Ownership</CardTitle>
                </CardHeader>
                <CardContent>
                  {ownershipLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                    </div>
                  ) : ownership ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Institutional:</span>
                        <span className="font-medium tabular-nums">{ownership.percentageOfSharesOutstanding?.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Holders:</span>
                        <span className="font-medium tabular-nums">{ownership.investorsHolding?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shares Held:</span>
                        <span className="font-medium tabular-nums">{ownership.sharesHeld ? formatLargeNumber(ownership.sharesHeld) : 'N/A'}</span>
                      </div>
                      {ownership.holders && ownership.holders.length > 0 && (
                        <div className="mt-3 pt-2 border-t">
                          <div className="text-xs font-medium mb-1">Top Holders:</div>
                          {ownership.holders.slice(0, 3).map((holder, idx) => (
                            <div key={idx} className="text-xs text-muted-foreground truncate">
                              {holder.holder}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No ownership data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
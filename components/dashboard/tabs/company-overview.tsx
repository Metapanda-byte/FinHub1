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
import { useState, useMemo, useEffect } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSearchStore } from "@/lib/store/search-store";
import { useCompanyProfile, useIncomeStatements, useStockPriceData, useRevenueSegmentsTTM, useGeographicRevenueTTM, useEmployeeCount, useBalanceSheets, useFinancialRatios, useKeyMetrics, usePriceTarget, useAnalystRatings, useInstitutionalOwnership, useESGScore } from "@/lib/api/financial";
import { formatFinancialNumber, formatLargeNumber } from "@/lib/formatters";
import { Star, StarOff } from "lucide-react";
import { useWatchlistStore } from "@/lib/store/watchlist-store";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useTheme } from 'next-themes';
import clsx from 'clsx';
import useSWR from 'swr';
import { ChartLoadingSkeleton, CardLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { CrunchingNumbersCard } from "@/components/ui/crunching-numbers-loader";
import { MobileCarousel } from "@/components/ui/mobile-carousel";

// Enhanced LTM calculation following the new specification
function calculateAdvancedLTM(
  quarterlyStatements: any[],
  annualStatements: any[],
  field: string
): { value: number | null; date: string | null } {
  if (!quarterlyStatements || quarterlyStatements.length === 0) {
    return { value: null, date: null };
  }

  // Create quarterly map by fiscal year
  const quarterlyByYear: Record<string, any[]> = {};
  quarterlyStatements.forEach(stmt => {
    const year = stmt.calendarYear;
    if (!quarterlyByYear[year]) {
      quarterlyByYear[year] = [];
    }
    quarterlyByYear[year].push(stmt);
  });

  // Find the most recent fiscal year with complete annual data
  let lastCompleteFY: string | null = null;
  let lastCompleteFYValue: number | null = null;

  // Check annual statements first
  if (annualStatements && annualStatements.length > 0) {
    const sortedAnnual = annualStatements
      .filter(stmt => stmt.calendarYear && stmt[field] !== null && stmt[field] !== undefined)
      .sort((a, b) => parseInt(b.calendarYear) - parseInt(a.calendarYear));
    
    if (sortedAnnual.length > 0) {
      const lastAnnual = sortedAnnual[0];
      lastCompleteFY = lastAnnual.calendarYear;
      lastCompleteFYValue = lastAnnual[field];
    }
  }

  // If no annual data, try to construct from quarterly data
  if (lastCompleteFY === null) {
    const fiscalYears = Object.keys(quarterlyByYear).sort((a, b) => parseInt(b) - parseInt(a));
    
    for (const year of fiscalYears) {
      const quartersForYear = quarterlyByYear[year];
      if (quartersForYear.length === 4) {
        // Calculate annual value from quarters
        let annualValue = 0;
        let hasAllQuarters = true;
        
        for (const quarter of quartersForYear) {
          const quarterValue = quarter[field];
          if (quarterValue === null || quarterValue === undefined || isNaN(quarterValue)) {
            hasAllQuarters = false;
            break;
          }
          annualValue += quarterValue;
        }
        
        if (hasAllQuarters) {
          lastCompleteFY = year;
          lastCompleteFYValue = annualValue;
          break;
        }
      }
    }
  }

  if (lastCompleteFY === null || lastCompleteFYValue === null) {
    // Fallback to simple 4-quarter rolling sum
    if (quarterlyStatements.length < 4) return { value: null, date: null };
    
    const recentPeriods = quarterlyStatements.slice(0, 4);
    let values: number[] = [];
    
    for (const stmt of recentPeriods) {
      const value = stmt[field];
      if (value !== null && value !== undefined && !isNaN(value)) {
        values.push(value);
      }
    }
    
    if (values.length !== 4) return { value: null, date: null };
    return { 
      value: values.reduce((sum, val) => sum + val, 0),
      date: recentPeriods[0].date
    };
  }

  // Now we have the last complete FY, check for partial quarters in the next FY
  const nextFY = (parseInt(lastCompleteFY) + 1).toString();
  const priorFY = (parseInt(lastCompleteFY) - 1).toString();

  // Get quarters for next FY (most recent partial year)
  const nextFYQuarters = quarterlyByYear[nextFY] || [];
  const priorFYQuarters = quarterlyByYear[priorFY] || [];

  // Case 1: No quarterly data for next FY - LTM equals last complete FY
  if (nextFYQuarters.length === 0) {
    // Find the date from the last complete FY
    const lastFYStatement = annualStatements?.find(stmt => stmt.calendarYear === lastCompleteFY);
    return { 
      value: lastCompleteFYValue, 
      date: lastFYStatement?.date || quarterlyStatements[0]?.date 
    };
  }

  // Case 2: We have some quarters in next FY - apply the LTM formula
  // LTM = LFY + YTD(t) - YTD(t-1)
  // Where: LFY = Last Fiscal Year, YTD(t) = current year quarters, YTD(t-1) = prior year corresponding quarters
  
  let ytdCurrent = 0;  // YTD(t)
  let ytdPrior = 0;    // YTD(t-1)
  
  // Sort quarters by date to ensure proper matching
  const sortedNextFYQuarters = nextFYQuarters.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const sortedPriorFYQuarters = priorFYQuarters.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate YTD(t) - sum of available quarters in current fiscal year
  for (const quarter of sortedNextFYQuarters) {
    const value = quarter[field];
    if (value !== null && value !== undefined && !isNaN(value)) {
      ytdCurrent += value;
    }
  }

  // Calculate YTD(t-1) - sum of corresponding quarters from prior fiscal year
  const quartersToMatch = Math.min(sortedNextFYQuarters.length, sortedPriorFYQuarters.length);
  
  for (let i = 0; i < quartersToMatch; i++) {
    const value = sortedPriorFYQuarters[i][field];
    if (value !== null && value !== undefined && !isNaN(value)) {
      ytdPrior += value;
    }
  }

  // Apply the LTM formula: LTM = LFY + YTD(t) - YTD(t-1)
  const ltmValue = lastCompleteFYValue + ytdCurrent - ytdPrior;
  
  console.log(`[LTM Calculation] ${field}:`, {
    lfy: lastCompleteFYValue,
    ytdCurrent,
    ytdPrior,
    ltmValue,
    quartersInCurrentFY: sortedNextFYQuarters.length,
    quartersInPriorFY: sortedPriorFYQuarters.length,
    quartersMatched: quartersToMatch
  });
  
  return { 
    value: ltmValue,
    date: sortedNextFYQuarters[0]?.date || quarterlyStatements[0]?.date
  };
}

// Helper to get the LTM reference date for display
function getLTMReferenceDate(quarterlyStatements: any[]): string {
  if (!quarterlyStatements || quarterlyStatements.length === 0) return 'LTM';
  
  // Get the most recent quarter date
  const mostRecentQuarter = quarterlyStatements[0];
  if (mostRecentQuarter?.date) {
    return format(new Date(mostRecentQuarter.date), 'MMM-yy');
  }
  
  return 'LTM';
}

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

// Add a hook to fetch TTM revenue from internal API
function useTTMRevenue(symbol: string) {
  const url = symbol ? `/api/financial/income-statement-ttm?symbol=${symbol}` : null;
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

// Add a hook to fetch TTM income statement from internal API
function useTTMIncomeStatement(symbol: string) {
  const url = symbol ? `/api/financial/income-statement-ttm?symbol=${symbol}` : null;
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

// Function to fix spaced-out country names (e.g., "U N I T E D K I N G D O M" -> "UNITED KINGDOM")
function fixSpacedCountryName(name: string): string {
  if (!name) return name;
  
  // First, handle common patterns with spaces between every letter
  // This will convert "U S A" to "USA", "U K" to "UK", etc.
  let fixed = name;
  
  // More aggressive pattern to catch spaced single letters
  // This handles cases like "U N I T E D  K I N G D O M" with varying spaces
  fixed = fixed.replace(/(?:\b[A-Z]\s+)+[A-Z]\b/g, (match) => {
    // Remove all spaces from the matched sequence
    return match.replace(/\s+/g, '');
  });
  
  // Also handle cases where the entire string is spaced letters
  // Check if string only contains single letters and spaces
  if (/^[A-Z\s]+$/.test(fixed) && /[A-Z]\s+[A-Z]/.test(fixed)) {
    fixed = fixed.replace(/\s+/g, '');
  }
  
  // Clean up any remaining multiple spaces
  fixed = fixed.replace(/\s+/g, ' ').trim();
  
  console.log(`[DEBUG fixSpacedCountryName] Input: "${name}" -> Output: "${fixed}"`);
  
  return fixed;
}

// Financial-report-style geographic labeling system
function getGeoLabel(region: string): string {
  if (!region) return '';
  
  // First, fix any spaced-out country names
  const fixedRegion = fixSpacedCountryName(region);
  
  console.log(`[DEBUG getGeoLabel] Processing: "${region}" -> fixed: "${fixedRegion}"`);
  
  // Clean and normalize input
  let cleaned = fixedRegion.toLowerCase().trim();
  
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
    'united states of america': 'US',
    'united states': 'US',
    'usa': 'US',
    'u.s.a': 'US',
    'u.s.': 'US',
    'us': 'US',
    'unitedstates': 'US', // Handle case where spaces were removed
    'united kingdom': 'UK',
    'great britain': 'UK',
    'uk': 'UK',
    'unitedkingdom': 'UK', // Handle case where spaces were removed
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
    'southkorea': 'South Korea', // Handle case where spaces were removed
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
    'southafrica': 'South Africa', // Handle case where spaces were removed
    
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
    'rest of world': 'RoW',
    'restofworld': 'RoW', // Handle case where spaces were removed
    'row': 'RoW',
    'other': 'Other',
    'others': 'Other',
    'global': 'Global',
    'worldwide': 'Worldwide',
    
    // Add specific mappings for problematic cases
    'non-us': 'Non-US',
    'nonus': 'Non-US',
    'non us': 'Non-US',
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

interface CompanyOverviewProps {
  onOpenChat?: () => void;
}

export function CompanyOverview({ onOpenChat }: CompanyOverviewProps) {
  const [timeframe, setTimeframe] = useState<'YTD' | '1Y' | '5Y'>('YTD');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { hasStock, addStock, removeStock } = useWatchlistStore();
  const currentSymbol = useSearchStore((state) => state.currentSymbol);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Function to get description with expandable functionality
  const getDescription = (description: string | undefined) => {
    if (!description) return '';
    
    if (isMobile && !isDescriptionExpanded) {
      // For mobile, limit to ~150 characters and add ellipsis
      return description.length > 150 
        ? description.substring(0, 150).trim() + '...'
        : description;
    }
    
    return description;
  };
  const { profile, isLoading: profileLoading } = useCompanyProfile(currentSymbol || '');
  const { statements, isLoading: statementsLoading } = useIncomeStatements(currentSymbol || '', 'annual');
  const { statements: quarterlyStatements, isLoading: quarterlyStatementsLoading } = useIncomeStatements(currentSymbol || '', 'quarter');
  const { prices, isLoading: pricesLoading } = useStockPriceData(currentSymbol || '', timeframe);
  const { segments: ttmSegmentData, referenceDate: ttmSegmentRefDate, isLoading: segmentsLoading } = useRevenueSegmentsTTM(currentSymbol || '');
  const { regions: ttmGeographyData, referenceDate: ttmGeoRefDate, isLoading: regionsLoading } = useGeographicRevenueTTM(currentSymbol || '');
  const { employeeCount, isLoading: employeeCountLoading } = useEmployeeCount(currentSymbol || '');
  const { statements: balanceSheets, isLoading: balanceSheetLoading } = useBalanceSheets(currentSymbol || '');
  const { resolvedTheme } = useTheme();
  const pieLabelColor = resolvedTheme === 'dark' ? '#fff' : '#111';
  const { ttmRevenue, isLoading: ttmRevenueLoading } = useTTMRevenue(currentSymbol || '');
  const { ttm, isLoading: ttmLoading } = useTTMIncomeStatement(currentSymbol || '');
  
  // New API hooks for additional data
  const { ratios, isLoading: ratiosLoading } = useFinancialRatios(currentSymbol || '');
  const { metrics: keyMetrics, isLoading: keyMetricsLoading } = useKeyMetrics(currentSymbol || '');
  const { priceTarget, isLoading: priceTargetLoading } = usePriceTarget(currentSymbol || '');
  const { ratings, isLoading: ratingsLoading } = useAnalystRatings(currentSymbol || '');
  const { ownership, isLoading: ownershipLoading } = useInstitutionalOwnership(currentSymbol || '');
  const { esgScore, isLoading: esgLoading } = useESGScore(currentSymbol || '');

  console.log('Debug:', {
    currentSymbol,
    profileLoading,
    hasProfile: !!profile,
    profile
  });

  // Debug: Log the TTM API response and date
  if (ttm) {
    console.log('[DEBUG] TTM API response:', ttm);
    console.log('[DEBUG] TTM date:', ttm.date);
  }
  
  // Get the most recent fiscal year for pie chart labels
  const mostRecentFY = statements && statements.length > 0 ? statements[0].calendarYear : null;
  const fyLabel = mostRecentFY ? `FY${mostRecentFY.slice(-2)}` : 'Annual';

  // Calculate the canonical LTM revenue using enhanced calculation
  const ltmRevenueCalc = calculateAdvancedLTM(quarterlyStatements || [], statements || [], 'revenue');
  const ltmEbitdaCalc = calculateAdvancedLTM(quarterlyStatements || [], statements || [], 'ebitda');
  
  let canonicalLTMRevenue: number | null = null;
  let canonicalLTMDate: string | null = null;
  
  if (ltmRevenueCalc.value !== null) {
    canonicalLTMRevenue = ltmRevenueCalc.value / 1e9;
    canonicalLTMDate = ltmRevenueCalc.date;
    console.log('[DEBUG] Using enhanced LTM calculation for canonical revenue:', canonicalLTMRevenue);
  }
  
  // Get fiscal year revenue for segment/geographic data (since FMP provides FY data, not TTM)
  let fiscalYearRevenue: number | null = null;
  if (statements && statements.length > 0) {
    fiscalYearRevenue = statements[0].revenue / 1e9; // Most recent fiscal year
    console.log('[DEBUG] Fiscal year revenue for segments/geography:', fiscalYearRevenue);
  }
  
  // Log revenue consistency check
  console.log('[DEBUG] Revenue Consistency Check:', {
    canonicalLTMRevenue,
    fiscalYearRevenue,
    segmentTotal: ttmSegmentData.reduce((sum: number, s: any) => sum + s.value, 0),
    geographyTotal: ttmGeographyData.reduce((sum: number, s: any) => sum + s.value, 0)
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
  const annualBars = statements.slice(0, 5).reverse().map((statement: any) => ({
    year: 'FY' + statement.calendarYear.toString().slice(-2),
    value: statement.revenue / 1e9,
    isLTM: false
  }));

  // LTM logic using enhanced calculation
  let ltmBar = null;
  let ltmEbitdaBar = null;
  let ltmRefDate = null;
  let ltmLabel = 'LTM¹';
  let ltmFootnoteDate = null;

  // Use enhanced LTM calculations
  if (ltmRevenueCalc.value !== null && ltmEbitdaCalc.value !== null) {
    ltmBar = {
      year: ltmLabel,
      value: ltmRevenueCalc.value / 1e9,
      isLTM: true
    };
    ltmEbitdaBar = {
      year: ltmLabel,
      value: ltmEbitdaCalc.value / 1e9,
      margin: ltmRevenueCalc.value > 0 ? (ltmEbitdaCalc.value / ltmRevenueCalc.value) * 100 : null,
      isLTM: true
    };
    ltmRefDate = ltmRevenueCalc.date ? new Date(ltmRevenueCalc.date) : null;
    ltmFootnoteDate = ltmRevenueCalc.date;
  }

  const revenueData = ltmBar ? [...annualBars, ltmBar] : annualBars;

  // Prepare annual EBITDA bars with FYXX labels
  const annualEbitdaBars = statements.slice(0, 5).reverse().map((statement: any) => ({
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
      profile
    });
    
    if (!currentSymbol || !profile) {
      console.log('Cannot toggle watchlist:', {
        missingSymbol: !currentSymbol,
        missingProfile: !profile
      });
      return;
    }
    
    if (hasStock(currentSymbol)) {
      removeStock(currentSymbol);
    } else {
      addStock({
        symbol: currentSymbol,
        name: profile?.companyName,
        lastPrice: 0,
        change: 0,
        changePercent: 0,
        marketCap: 0,
        peRatio: 0
      });
    }
  };



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
  // Get highlight color based on theme
  const highlightColor = resolvedTheme === 'dark' ? '#1e293b' : '#f9fafb';
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

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <CrunchingNumbersCard 
          className="col-span-full"
        />
      </div>
    );
  }

  if (!currentSymbol || profileLoading || statementsLoading || pricesLoading || segmentsLoading || regionsLoading) {
    return (
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <CrunchingNumbersCard 
          className="col-span-full"
        />
      </div>
    );
  }

  if (!revenueData || !ebitdaData || !ltmRefDate) {
    return (
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <CrunchingNumbersCard 
          className="col-span-full"
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

  // Use fiscal year data for segments/geography (no scaling needed since FMP provides FY data)
  let scaledSegmentData = [...ttmSegmentData];
  let scaledGeographyData = [...ttmGeographyData];
  
  // Calculate percentages based on fiscal year revenue if available
  if (fiscalYearRevenue && ttmSegmentData.length > 0) {
    const segmentTotal = ttmSegmentData.reduce((sum: number, s: any) => sum + s.value, 0);
    if (segmentTotal > 0) {
      scaledSegmentData = ttmSegmentData.map(seg => ({
        ...seg,
        percentage: (seg.value / segmentTotal) * 100
      }));
    }
  }
  
  if (fiscalYearRevenue && ttmGeographyData.length > 0) {
    const geoTotal = ttmGeographyData.reduce((sum: number, s: any) => sum + s.value, 0);
    if (geoTotal > 0) {
      scaledGeographyData = ttmGeographyData.map(geo => ({
        ...geo,
        percentage: (geo.value / geoTotal) * 100
      }));
    }
  }

  // Process geography labels using the improved geographic labeling function
  // Use fullName when available (contains original unprocessed name), fallback to name
  const processedGeographyData = scaledGeographyData.map((item, index) => {
    // Try multiple sources for the name
    const originalName = item.fullName || item.name || '';
    
    // Also check if the name might be the key itself in some cases
    // This handles when geographic data comes as object keys
    let nameToProcess = originalName;
    
    // If name looks like it has spaced letters, process it
    if (/[A-Z]\s+[A-Z]/.test(nameToProcess)) {
      console.log(`[DEBUG] Detected spaced letters in geographic name: "${nameToProcess}"`);
    }
    
    const processedName = getGeoLabel(nameToProcess);
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

  // Create card components for mobile carousel
  const createCompanyInfoCard = () => (
    <div className="flex items-start space-x-4 rounded-md border p-3">
      <div className="space-y-2 flex-1">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold leading-none tracking-tight">
            {profile?.companyName} ({profile?.symbol})
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[10px]">
              {profile?.sector}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {profile?.industry}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {profile?.exchangeShortName}
            </Badge>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-justify leading-relaxed">{getDescription(profile?.description)}</p>
          {isMobile && profile?.description && profile.description.length > 150 && (
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              {isDescriptionExpanded ? 'Show Less' : 'Read More'}
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <div>
            <p className="text-[10px] text-muted-foreground">Market Cap</p>
            <p className="text-xs font-medium tabular-nums">{formatMarketCapBillions(marketCap || 0)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Employees</p>
            <p className="text-xs font-medium tabular-nums">
              {employeeCountLoading
                ? <span className="animate-pulse text-muted-foreground">•••</span>
                : (employeeCount !== null && employeeCount !== undefined)
                  ? employeeCount.toLocaleString()
                  : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">CEO</p>
            <p className="text-xs font-medium">{profile?.ceo || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Location</p>
            <p className="text-xs font-medium">
              {profile?.city && profile?.state ? `${profile?.city}, ${profile?.state}` : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const createSharePriceCard = () => {
    if (pricesLoading) return null;
    return (
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-xs font-medium">Share Price Performance</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-3">
          <StockChart symbol={currentSymbol} timeframe={timeframe} />
        </CardContent>
      </Card>
    );
  };

  const createCapitalStructureCard = () => {
    if (balanceSheetLoading) return null;
    return (
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-xs font-medium">Capital Structure</CardTitle>
        </CardHeader>
        <CardContent className="p-0 px-3">
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
                <span className="text-right tabular-nums">{formatRatio(null)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 px-6 text-sm">
                <span>EV / EBITDA</span>
                <span className="text-right tabular-nums">{formatRatio(evToEbitda)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const createRevenueChartCard = () => {
    if (statementsLoading) return null;
    return (
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-xs font-medium">Historical Revenue</CardTitle>
        </CardHeader>
        <CardContent style={{ position: 'relative', paddingBottom: 16, paddingTop: 0 }}>
          <RevenueChart 
            data={revenueData}
            palette={revenueData.map((bar, idx) => idx === revenueData.length - 1 ? '#1e3a8a' : '#60a5fa')}
            tickFontSize={12}
          />
          {ltmRefDate && (
            <div style={{ position: 'absolute', left: 0, bottom: 1, fontSize: 9, color: 'var(--muted-foreground)', marginLeft: '0.75rem' }}>
              <span>{'¹ As at: '}{format(ltmRefDate, 'MMM-yy')}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const createEbitdaChartCard = () => {
    if (statementsLoading) return null;
    return (
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-xs font-medium">Historical EBITDA & Margin</CardTitle>
        </CardHeader>
        <CardContent style={{ position: 'relative', paddingBottom: 16, paddingTop: 0 }}>
          <EbitdaChart 
            data={ebitdaData}
            palette={ebitdaData.map((bar, idx) => idx === ebitdaData.length - 1 ? '#1e3a8a' : '#60a5fa')}
            tickFontSize={12}
          />
          {ltmRefDate && (
            <div style={{ position: 'absolute', left: 0, bottom: 1, fontSize: 9, color: 'var(--muted-foreground)', marginLeft: '0.75rem' }}>
              <span>{'¹ As at: '}{format(ltmRefDate, 'MMM-yy')}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const createSegmentChartCard = () => {
    if (segmentsLoading) return null;
    return (
      <Card>
        <CardHeader className="pb-0 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-medium">
            FY{statements && statements.length > 0 ? statements[0].calendarYear.toString().slice(-2) : ''} Revenue by Segment
            {fiscalYearRevenue && (
              <span className="text-xs text-muted-foreground ml-1">
                (${fiscalYearRevenue.toFixed(1)}B)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent style={{ position: 'relative', paddingBottom: 16, paddingTop: 0 }}>
          {scaledSegmentData.length > 0 ? (
            <PieChart 
              data={scaledSegmentData} 
              nameKey="name" 
              dataKey="value" 
              colors={['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#e0e7ff']}
              formatter={(value) => `$${value.toFixed(1)}B`}
              labelColor={pieLabelColor}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No revenue segmentation data available for this company
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const createGeographyChartCard = () => {
    if (regionsLoading) return null;
    return (
      <Card>
        <CardHeader className="pb-0 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-medium">
            FY{statements && statements.length > 0 ? statements[0].calendarYear.toString().slice(-2) : ''} Revenue by Geography
            {fiscalYearRevenue && (
              <span className="text-xs text-muted-foreground ml-1">
                (${fiscalYearRevenue.toFixed(1)}B)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent style={{ position: 'relative', paddingBottom: 16, paddingTop: 0 }}>
          {consolidatedGeographyData.length > 1 ? (
            <PieChart 
              data={consolidatedGeographyData} 
              nameKey="name" 
              dataKey="value" 
              colors={['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#e0e7ff']}
              formatter={(value) => `$${value.toFixed(1)}B`}
              labelColor={pieLabelColor}
          />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Not enough data to display geographic split.
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Create carousel cards array (excluding company info card)
  const carouselCards = [
    createSharePriceCard(),
    createCapitalStructureCard(),
    createRevenueChartCard(),
    createEbitdaChartCard(),
    createSegmentChartCard(),
    createGeographyChartCard(),
  ].filter(Boolean);

  // Use actual chart cards
  const finalCarouselCards = carouselCards;

  // Only render carousel if we have valid cards and not all are loading
  const hasValidCards = finalCarouselCards.length > 0;
  const isLoading = pricesLoading || balanceSheetLoading || statementsLoading || segmentsLoading || regionsLoading;







  return (
    <div className="space-y-4 company-overview">
      {isMobile ? (
        // Mobile view with simple grid layout
        <div className="space-y-4">
          {/* Fixed Company Info Card */}
          {createCompanyInfoCard()}
          
          {/* Charts in a simple grid */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Loading charts...</p>
            </div>
          ) : hasValidCards ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  {finalCarouselCards.length} charts available
                </p>
              </div>
              <div className="grid gap-4">
                {finalCarouselCards.map((card, index) => (
                  <div key={`chart-${index}`}>
                    {card}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No chart data available</p>
            </div>
          )}
        </div>
      ) : (
        // Desktop grid view
        <div className="grid gap-3">
          {createCompanyInfoCard()}
          <div className="grid gap-1">
            {/* Share Price Performance and Capital Structure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {pricesLoading ? (
                <ChartLoadingSkeleton />
              ) : (
                createSharePriceCard()
              )}
              {balanceSheetLoading ? (
                <CardLoadingSkeleton />
              ) : (
                createCapitalStructureCard()
              )}
            </div>
            
            {/* Historical Financial Charts */}
            <div className="grid md:grid-cols-2 gap-1" style={{ position: 'relative' }}>
              {statementsLoading ? (
                <ChartLoadingSkeleton />
              ) : (
                createRevenueChartCard()
              )}
              {statementsLoading ? (
                <ChartLoadingSkeleton />
              ) : (
                createEbitdaChartCard()
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {segmentsLoading ? (
                <ChartLoadingSkeleton />
              ) : (
                createSegmentChartCard()
              )}
              {regionsLoading ? (
                <ChartLoadingSkeleton />
              ) : (
                createGeographyChartCard()
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
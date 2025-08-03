"use client";

import useSWR from 'swr';

const API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

// Enhanced interfaces for real screening data
export interface ScreeningCompany {
  ticker: string;
  company: string;
  sector: string;
  exchange: string;
  country: string;
  marketCap: number;
  price: number;
  
  // Valuation Metrics
  peRatio: number;
  priceToBook: number;
  priceToSales: number;
  pegRatio: number;
  evToEbitda: number;
  evToRevenue: number;
  
  // Growth Metrics
  revenueGrowth: number;
  earningsGrowth: number;
  revenueGrowth5Y: number;
  earningsGrowth5Y: number;
  
  // Profitability Metrics
  roe: number;
  roa: number;
  roic: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  
  // Financial Health
  debtToEquity: number;
  currentRatio: number;
  quickRatio: number;
  interestCoverage: number;
  
  // Dividend & Yield
  dividendYield: number;
  payoutRatio: number;
  dividendGrowth: number;
  
  // Technical & Price Data
  beta: number;
  rsi: number;
  priceChange1D: number;
  priceChange1W: number;
  priceChange1M: number;
  priceChange3M: number;
  priceChange6M: number;
  priceChange1Y: number;
  
  // Volume & Liquidity
  volume: number;
  avgVolume: number;
  volumeRatio: number;
  
  // Additional derived fields
  eps: number;
  bookValue: number;
  fcfYield: number;
  sharesOutstanding: number;
}

export interface ScreeningFilters {
  // Basic Filters
  marketCap: string;
  sector: string;
  exchange: string;
  country: string;
  
  // Valuation Metrics
  peRatio: [number, number];
  priceToBook: [number, number];
  priceToSales: [number, number];
  pegRatio: [number, number];
  evEbitda: [number, number];
  evRevenue: [number, number];
  
  // Growth Metrics
  revenueGrowth: [number, number];
  earningsGrowth: [number, number];
  revenueGrowth5Y: [number, number];
  earningsGrowth5Y: [number, number];
  
  // Profitability
  roe: [number, number];
  roa: [number, number];
  roic: [number, number];
  grossMargin: [number, number];
  operatingMargin: [number, number];
  netMargin: [number, number];
  
  // Financial Health
  debtToEquity: [number, number];
  currentRatio: [number, number];
  quickRatio: [number, number];
  interestCoverage: [number, number];
  
  // Dividend & Yield
  dividendYield: [number, number];
  payoutRatio: [number, number];
  dividendGrowth: [number, number];
  
  // Technical & Price
  price: [number, number];
  beta: [number, number];
  rsi: [number, number];
  priceChange1D: [number, number];
  priceChange1W: [number, number];
  priceChange1M: [number, number];
  priceChange3M: [number, number];
  priceChange6M: [number, number];
  priceChange1Y: [number, number];
  
  // Volume & Liquidity
  volume: [number, number];
  avgVolume: [number, number];
  volumeRatio: [number, number];
  
  // Boolean Filters
  positiveEarnings: boolean;
  paysDividend: boolean;
  positiveFCF: boolean;
  profitableLastYear: boolean;
  growingRevenue: boolean;
  improvingMargins: boolean;
  lowDebt: boolean;
}

// Raw API response interfaces
interface FMPCompanyProfile {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  exchangeShortName: string;
  country: string;
  mktCap: number;
  price: number;
  beta: number;
  volAvg: number;
  currency: string;
  fullTimeEmployees: number;
  description: string;
}

interface FMPKeyMetrics {
  symbol: string;
  date: string;
  period: string;
  revenuePerShare: number;
  netIncomePerShare: number;
  operatingCashFlowPerShare: number;
  freeCashFlowPerShare: number;
  cashPerShare: number;
  bookValuePerShare: number;
  tangibleBookValuePerShare: number;
  shareholdersEquityPerShare: number;
  interestDebtPerShare: number;
  marketCap: number;
  enterpriseValue: number;
  peRatio: number;
  priceToSalesRatio: number;
  pocfratio: number;
  pfcfRatio: number;
  pbRatio: number;
  ptbRatio: number;
  evToSales: number;
  enterpriseValueOverEBITDA: number;
  evToOperatingCashFlow: number;
  evToFreeCashFlow: number;
  earningsYield: number;
  freeCashFlowYield: number;
  debtToEquity: number;
  debtToAssets: number;
  netDebtToEBITDA: number;
  currentRatio: number;
  interestCoverage: number;
  incomeQuality: number;
  dividendYield: number;
  payoutRatio: number;
  salesGeneralAndAdministrativeToRevenue: number;
  researchAndDevelopmentToRevenue: number;
  intangiblesToTotalAssets: number;
  capexToOperatingCashFlow: number;
  capexToRevenue: number;
  capexToDepreciation: number;
  stockBasedCompensationToRevenue: number;
  grahamNumber: number;
  roic: number;
  returnOnTangibleAssets: number;
  grahamNetNet: number;
  workingCapital: number;
  tangibleAssetValue: number;
  netCurrentAssetValue: number;
  investedCapital: number;
  averageReceivables: number;
  averagePayables: number;
  averageInventory: number;
  daysSalesOutstanding: number;
  daysPayablesOutstanding: number;
  daysOfInventoryOnHand: number;
  receivablesTurnover: number;
  payablesTurnover: number;
  inventoryTurnover: number;
  roe: number;
  capexPerShare: number;
}

interface FMPFinancialRatios {
  symbol: string;
  date: string;
  period: string;
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  daysOfSalesOutstanding: number;
  daysOfInventoryOutstanding: number;
  operatingCycle: number;
  daysOfPayablesOutstanding: number;
  cashConversionCycle: number;
  grossProfitMargin: number;
  operatingProfitMargin: number;
  pretaxProfitMargin: number;
  netProfitMargin: number;
  effectiveTaxRate: number;
  returnOnAssets: number;
  returnOnEquity: number;
  returnOnCapitalEmployed: number;
  netIncomePerEBT: number;
  ebtPerEbit: number;
  ebitPerRevenue: number;
  debtRatio: number;
  debtEquityRatio: number;
  longTermDebtToCapitalization: number;
  totalDebtToCapitalization: number;
  interestCoverage: number;
  cashFlowToDebtRatio: number;
  companyEquityMultiplier: number;
  receivablesTurnover: number;
  payablesTurnover: number;
  inventoryTurnover: number;
  fixedAssetTurnover: number;
  assetTurnover: number;
  operatingCashFlowPerShare: number;
  freeCashFlowPerShare: number;
  cashPerShare: number;
  payoutRatio: number;
  operatingCashFlowSalesRatio: number;
  freeCashFlowOperatingCashFlowRatio: number;
  cashFlowCoverageRatios: number;
  shortTermCoverageRatios: number;
  capitalExpenditureCoverageRatio: number;
  dividendPaidAndCapexCoverageRatio: number;
  dividendPayoutRatio: number;
  priceBookValueRatio: number;
  priceToBookRatio: number;
  priceToSalesRatio: number;
  priceEarningsRatio: number;
  priceToFreeCashFlowsRatio: number;
  priceToOperatingCashFlowsRatio: number;
  priceCashFlowRatio: number;
  priceEarningsToGrowthRatio: number;
  priceSalesRatio: number;
  dividendYield: number;
  enterpriseValueMultiple: number;
  priceFairValue: number;
}

interface FMPStockScreenerResponse {
  symbol: string;
  companyName: string;
  marketCap: number;
  sector: string;
  industry: string;
  beta: number;
  price: number;
  lastAnnualDividend: number;
  volume: number;
  exchange: string;
  exchangeShortName: string;
  country: string;
  isEtf: boolean;
  isActivelyTrading: boolean;
}

// Cache duration for screening data (5 minutes)
const SCREENING_CACHE_DURATION = 5 * 60 * 1000;

// Fetcher function for API calls
async function fetcher(url: string): Promise<any> {
  if (!API_KEY) {
    throw new Error('FMP API key not configured');
  }

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Get list of all tradeable stocks
export function useStockList() {
  const url = API_KEY 
    ? `${BASE_URL}/stock-screener?marketCapMoreThan=1000000&betaMoreThan=0&volumeMoreThan=10000&isEtf=false&isActivelyTrading=true&limit=5000&apikey=${API_KEY}`
    : null;

  return useSWR(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: SCREENING_CACHE_DURATION,
    errorRetryCount: 2,
  });
}

// Get company profiles for a list of symbols
export function useCompanyProfiles(symbols: string[]) {
  const symbolString = symbols.join(',');
  const url = API_KEY && symbols.length > 0
    ? `${BASE_URL}/profile/${symbolString}?apikey=${API_KEY}`
    : null;

  return useSWR(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: SCREENING_CACHE_DURATION,
    errorRetryCount: 2,
  });
}

// Get key metrics for a list of symbols
export function useKeyMetricsBatch(symbols: string[]) {
  const symbolString = symbols.join(',');
  const url = API_KEY && symbols.length > 0
    ? `${BASE_URL}/key-metrics/${symbolString}?limit=1&apikey=${API_KEY}`
    : null;

  return useSWR(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: SCREENING_CACHE_DURATION,
    errorRetryCount: 2,
  });
}

// Get financial ratios for a list of symbols
export function useFinancialRatiosBatch(symbols: string[]) {
  const symbolString = symbols.join(',');
  const url = API_KEY && symbols.length > 0
    ? `${BASE_URL}/ratios/${symbolString}?limit=1&apikey=${API_KEY}`
    : null;

  return useSWR(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: SCREENING_CACHE_DURATION,
    errorRetryCount: 2,
  });
}

// Get stock quote data for price changes
export function useStockQuotesBatch(symbols: string[]) {
  const symbolString = symbols.join(',');
  const url = API_KEY && symbols.length > 0
    ? `${BASE_URL}/quote/${symbolString}?apikey=${API_KEY}`
    : null;

  return useSWR(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute for price data
    errorRetryCount: 2,
  });
}

// Utility function to transform FMP data to our screening format
export function transformToScreeningData(
  profiles: FMPCompanyProfile[],
  keyMetrics: FMPKeyMetrics[],
  ratios: FMPFinancialRatios[],
  quotes: any[]
): ScreeningCompany[] {
  const profileMap = new Map(profiles.map(p => [p.symbol, p]));
  const metricsMap = new Map(keyMetrics.map(m => [m.symbol, m]));
  const ratiosMap = new Map(ratios.map(r => [r.symbol, r]));
  const quotesMap = new Map(quotes.map(q => [q.symbol, q]));

  return profiles.map(profile => {
    const metrics = metricsMap.get(profile.symbol);
    const ratio = ratiosMap.get(profile.symbol);
    const quote = quotesMap.get(profile.symbol);

    return {
      ticker: profile.symbol,
      company: profile.companyName,
      sector: profile.sector || 'Unknown',
      exchange: profile.exchangeShortName || 'Unknown',
      country: profile.country || 'Unknown',
      marketCap: profile.mktCap / 1000000, // Convert to millions
      price: profile.price || 0,
      
      // Valuation Metrics
      peRatio: metrics?.peRatio || 0,
      priceToBook: metrics?.pbRatio || 0,
      priceToSales: metrics?.priceToSalesRatio || 0,
      pegRatio: 0, // PEG ratio calculation would need earnings growth data
      evToEbitda: metrics?.enterpriseValueOverEBITDA || 0,
      evToRevenue: metrics?.evToSales || 0,
      
      // Growth Metrics (placeholder - would need historical data)
      revenueGrowth: 0,
      earningsGrowth: 0,
      revenueGrowth5Y: 0,
      earningsGrowth5Y: 0,
      
      // Profitability Metrics
      roe: metrics?.roe || 0,
      roa: ratio?.returnOnAssets || 0,
      roic: metrics?.roic || 0,
      grossMargin: (ratio?.grossProfitMargin || 0) * 100,
      operatingMargin: (ratio?.operatingProfitMargin || 0) * 100,
      netMargin: (ratio?.netProfitMargin || 0) * 100,
      
      // Financial Health
      debtToEquity: metrics?.debtToEquity || 0,
      currentRatio: metrics?.currentRatio || 0,
      quickRatio: ratio?.quickRatio || 0,
      interestCoverage: metrics?.interestCoverage || 0,
      
      // Dividend & Yield
      dividendYield: metrics?.dividendYield || 0,
      payoutRatio: metrics?.payoutRatio || 0,
      dividendGrowth: 0, // Would need historical data
      
      // Technical & Price Data
      beta: profile.beta || 1.0,
      rsi: 50, // Would need technical analysis API
      priceChange1D: quote?.changesPercentage || 0,
      priceChange1W: 0, // Would need historical data
      priceChange1M: 0, // Would need historical data
      priceChange3M: 0, // Would need historical data
      priceChange6M: 0, // Would need historical data
      priceChange1Y: quote?.yearHigh && quote?.yearLow 
        ? ((profile.price - quote.yearLow) / quote.yearLow) * 100 
        : 0,
      
      // Volume & Liquidity
      volume: quote?.volume || 0,
      avgVolume: profile.volAvg || 0,
      volumeRatio: quote?.volume && profile.volAvg 
        ? quote.volume / profile.volAvg 
        : 1,
      
      // Additional derived fields
      eps: metrics?.netIncomePerShare || 0,
      bookValue: metrics?.bookValuePerShare || 0,
      fcfYield: metrics?.freeCashFlowYield || 0,
      sharesOutstanding: profile.mktCap && profile.price 
        ? profile.mktCap / profile.price 
        : 0,
    };
  });
}

// Main hook to get comprehensive screening data
export function useScreeningData() {
  const { data: stockList, error: stockListError, isLoading: stockListLoading } = useStockList();
  
  // Get first 100 stocks for initial load (can be paginated)
  const symbols = stockList?.slice(0, 100).map((stock: FMPStockScreenerResponse) => stock.symbol) || [];
  
  const { data: profiles, error: profilesError, isLoading: profilesLoading } = useCompanyProfiles(symbols);
  const { data: keyMetrics, error: metricsError, isLoading: metricsLoading } = useKeyMetricsBatch(symbols);
  const { data: ratios, error: ratiosError, isLoading: ratiosLoading } = useFinancialRatiosBatch(symbols);
  const { data: quotes, error: quotesError, isLoading: quotesLoading } = useStockQuotesBatch(symbols);

  const isLoading = stockListLoading || profilesLoading || metricsLoading || ratiosLoading || quotesLoading;
  const error = stockListError || profilesError || metricsError || ratiosError || quotesError;

  const screeningData = profiles && keyMetrics && ratios && quotes
    ? transformToScreeningData(profiles, keyMetrics, ratios, quotes)
    : [];

  return {
    data: screeningData,
    isLoading,
    error,
    symbols
  };
}
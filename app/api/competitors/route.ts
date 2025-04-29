import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

interface CompanyProfile {
  symbol: string;
  companyName: string;
  industry: string;
  sector: string;
  marketCap: number;
  price: number;
  beta: number;
  volume: number;
  lastDiv: number;
  range: string;
  changes: number;
  changesPercentage: string;
  exchange: string;
}

interface ValuationData {
  ticker: string;
  company: string;
  marketCap: number;
  evToEbitda: number;
  peRatio: number;
  priceToSales: number;
  priceToBook: number;
  dividendYield: number;
}

interface PerformanceData {
  ticker: string;
  company: string;
  revenueGrowth: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  roic: number;
  roe: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const additionalTickers = searchParams.get("additionalTickers")?.split(",").filter(Boolean) || [];

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_FMP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    // 1. Fetch peer data from our database
    const { data: peerData, error: peerError } = await supabase
      .from('stock_peers')
      .select('peers, name')
      .eq('symbol', symbol)
      .single();

    if (peerError) {
      console.error("Error fetching peer data:", peerError);
      return NextResponse.json({ error: "Failed to fetch peer data" }, { status: 500 });
    }

    if (!peerData) {
      return NextResponse.json({ error: "No peer data found for symbol" }, { status: 404 });
    }

    // 2. Get company profiles for the symbol and its peers
    const peerSymbols = peerData.peers || [];
    const allSymbols = Array.from(new Set([symbol, ...peerSymbols, ...additionalTickers]));

    const companyProfiles = await Promise.all(
      allSymbols.map(async (sym) => {
        try {
          const response = await fetch(`https://financialmodelingprep.com/api/v3/profile/${sym}?apikey=${apiKey}`);
          if (!response.ok) return null;
          const data = await response.json();
          return data[0];
        } catch {
          return null;
        }
      })
    );

    // 3. Format competitors data
    const competitors = companyProfiles
      .filter(Boolean)
      .filter((profile) => profile.symbol !== symbol)
      .map((profile) => ({
        id: profile.symbol,
        name: profile.companyName,
        symbol: profile.symbol,
      }));

    // 4. Fetch key metrics for all companies (includes valuation metrics)
    const keyMetricsPromises = allSymbols.map(async (sym) => {
      try {
        const response = await fetch(`https://financialmodelingprep.com/api/v3/key-metrics-ttm/${sym}?apikey=${apiKey}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data[0];
      } catch {
        return null;
      }
    });

    const keyMetricsResults = await Promise.all(keyMetricsPromises);

    // 5. Fetch financial ratios for additional metrics
    const ratiosPromises = allSymbols.map(async (sym) => {
      try {
        const response = await fetch(`https://financialmodelingprep.com/api/v3/ratios-ttm/${sym}?apikey=${apiKey}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data[0];
      } catch {
        return null;
      }
    });

    const ratiosResults = await Promise.all(ratiosPromises);

    // Combine metrics and create valuation data
    const valuationData = allSymbols.map((sym, index) => {
      const metrics = keyMetricsResults[index];
      const ratios = ratiosResults[index];
      const profile = companyProfiles.find((p) => p?.symbol === sym);
      const company = profile?.companyName || sym;

      return {
        ticker: sym,
        company,
        marketCap: metrics?.marketCapTTM || 0,
        evToEbitda: ratios?.enterpriseValueMultipleTTM || 0,
        peRatio: ratios?.priceEarningsRatioTTM || 0,
        priceToSales: ratios?.priceToSalesRatioTTM || 0,
        priceToBook: ratios?.priceToBookRatioTTM || 0,
        dividendYield: ratios?.dividendYieldPercentageTTM || 0,
      };
    }).filter((data) => data.marketCap > 0); // Filter out companies with no data

    // 6. Fetch income statements for performance metrics
    const incomePromises = allSymbols.map(async (sym) => {
      try {
        const response = await fetch(`https://financialmodelingprep.com/api/v3/income-statement/${sym}?limit=2&apikey=${apiKey}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data;
      } catch {
        return null;
      }
    });

    const incomeResults = await Promise.all(incomePromises);

    // Calculate performance metrics
    const performanceData = allSymbols.map((sym, index) => {
      const statements = incomeResults[index];
      const profile = companyProfiles.find((p) => p?.symbol === sym);
      const company = profile?.companyName || sym;

      if (!statements || statements.length < 2) {
        return {
          ticker: sym,
          company,
          revenueGrowth: 0,
          grossMargin: 0,
          operatingMargin: 0,
          netMargin: 0,
          roic: 0,
          roe: 0,
        };
      }

      const current = statements[0];
      const previous = statements[1];
      const revenueGrowth = ((current.revenue - previous.revenue) / previous.revenue) * 100;

      return {
        ticker: sym,
        company,
        revenueGrowth,
        grossMargin: (current.grossProfitRatio || 0) * 100,
        operatingMargin: (current.operatingIncomeRatio || 0) * 100,
        netMargin: (current.netIncomeRatio || 0) * 100,
        roic: ratiosResults[index]?.returnOnInvestedCapitalTTM || 0,
        roe: ratiosResults[index]?.returnOnEquityTTM || 0,
      };
    }).filter((data) => data.grossMargin !== 0); // Filter out companies with no data

    return NextResponse.json({
      peerCompanies: competitors,
      peerValuationData: valuationData,
      peerPerformanceData: performanceData,
    });
  } catch (error) {
    console.error("Error analyzing competitors:", error);
    return NextResponse.json(
      { error: "Failed to analyze competitors", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 
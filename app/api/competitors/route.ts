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
    // 1. Try to fetch peer data from our database, but handle gracefully if it fails
    let peerSymbols: string[] = [];
    
    try {
      const { data: peerData, error: peerError } = await supabase
        .from('stock_peers')
        .select('peers, name')
        .eq('symbol', symbol)
        .single();

      if (!peerError && peerData?.peers) {
        peerSymbols = peerData.peers;
      }
    } catch (dbError) {
      console.log("Database peer lookup failed, using fallback method");
    }

    // 2. If no peers found in database, use API-based peer discovery
    if (peerSymbols.length === 0) {
      try {
        // First, get the company's profile to understand its sector/industry
        const companyProfileResponse = await fetch(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`);
        if (companyProfileResponse.ok) {
          const profileData = await companyProfileResponse.json();
          const companyProfile = profileData[0];
          
          if (companyProfile) {
            const { sector, industry, marketCap } = companyProfile;
            console.log(`Finding peers for ${symbol}: Sector=${sector}, Industry=${industry}, MarketCap=${marketCap}`);
            
            // Strategy 1: Find companies in the same industry
            if (industry) {
              try {
                const industryResponse = await fetch(
                  `https://financialmodelingprep.com/api/v3/stock-screener?industry=${encodeURIComponent(industry)}&marketCapMoreThan=1000000000&limit=20&apikey=${apiKey}`
                );
                if (industryResponse.ok) {
                  const industryData = await industryResponse.json();
                  const industryPeers = industryData
                    .filter((company: any) => company.symbol !== symbol)
                    .filter((company: any) => company.marketCap > 0)
                    .sort((a: any, b: any) => Math.abs(a.marketCap - marketCap) - Math.abs(b.marketCap - marketCap)) // Sort by market cap similarity
                    .slice(0, 8)
                    .map((company: any) => company.symbol);
                  
                  peerSymbols.push(...industryPeers);
                  console.log(`Found ${industryPeers.length} industry peers:`, industryPeers);
                }
              } catch (error) {
                console.log('Industry-based peer search failed:', error);
              }
            }
            
            // Strategy 2: If we need more peers, find companies in the same sector
            if (peerSymbols.length < 5 && sector) {
              try {
                const sectorResponse = await fetch(
                  `https://financialmodelingprep.com/api/v3/stock-screener?sector=${encodeURIComponent(sector)}&marketCapMoreThan=1000000000&limit=15&apikey=${apiKey}`
                );
                if (sectorResponse.ok) {
                  const sectorData = await sectorResponse.json();
                  const sectorPeers = sectorData
                    .filter((company: any) => company.symbol !== symbol)
                    .filter((company: any) => !peerSymbols.includes(company.symbol))
                    .filter((company: any) => company.marketCap > 0)
                    .sort((a: any, b: any) => Math.abs(a.marketCap - marketCap) - Math.abs(b.marketCap - marketCap))
                    .slice(0, 5 - peerSymbols.length)
                    .map((company: any) => company.symbol);
                  
                  peerSymbols.push(...sectorPeers);
                  console.log(`Found ${sectorPeers.length} additional sector peers:`, sectorPeers);
                }
              } catch (error) {
                console.log('Sector-based peer search failed:', error);
              }
            }
            
            // Strategy 3: Market cap similarity as last resort
            if (peerSymbols.length < 3 && marketCap) {
              try {
                const marketCapMin = marketCap * 0.2; // 20% to 500% of company's market cap
                const marketCapMax = marketCap * 5;
                
                const marketCapResponse = await fetch(
                  `https://financialmodelingprep.com/api/v3/stock-screener?marketCapMoreThan=${marketCapMin}&marketCapLowerThan=${marketCapMax}&limit=10&apikey=${apiKey}`
                );
                if (marketCapResponse.ok) {
                  const marketCapData = await marketCapResponse.json();
                  const marketCapPeers = marketCapData
                    .filter((company: any) => company.symbol !== symbol)
                    .filter((company: any) => !peerSymbols.includes(company.symbol))
                    .slice(0, 5 - peerSymbols.length)
                    .map((company: any) => company.symbol);
                  
                  peerSymbols.push(...marketCapPeers);
                  console.log(`Found ${marketCapPeers.length} market cap-based peers:`, marketCapPeers);
                }
              } catch (error) {
                console.log('Market cap-based peer search failed:', error);
              }
            }
          }
        }
      } catch (error) {
        console.log('API-based peer discovery failed:', error);
      }
      
      // Fallback to hardcoded peers only if API completely fails
      if (peerSymbols.length === 0) {
        const fallbackPeers: Record<string, string[]> = {
          'AAPL': ['MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META'],
          'ZGN': ['LVMH', 'KORS', 'COH', 'TPR', 'CPRI'],
          'MSFT': ['AAPL', 'GOOGL', 'AMZN', 'META', 'NFLX'],
          'GOOGL': ['AAPL', 'MSFT', 'META', 'AMZN', 'NFLX'],
          'TSLA': ['GM', 'F', 'NIO', 'RIVN', 'LUCID'],
          'META': ['GOOGL', 'SNAP', 'PINS', 'SPOT', 'NFLX'],
        };
        peerSymbols = fallbackPeers[symbol.toUpperCase()] || [];
        console.log(`Using fallback peers for ${symbol}:`, peerSymbols);
      }
    }

    // 3. Get company profiles for the symbol and its peers
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

    // 4. Format competitors data
    const competitors = companyProfiles
      .filter(Boolean)
      .filter((profile) => profile.symbol !== symbol)
      .map((profile) => ({
        id: profile.symbol,
        name: profile.companyName,
        symbol: profile.symbol,
      }));

    // 5. Fetch key metrics for all companies (includes valuation metrics)
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

    // 6. Fetch financial ratios for additional metrics
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

    // 7. Fetch income statements for performance metrics
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
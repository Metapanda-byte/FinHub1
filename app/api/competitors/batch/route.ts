import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(request: Request) {
  const { symbols, batchSize = 50 } = await request.json();
  
  if (!symbols || !Array.isArray(symbols)) {
    return NextResponse.json({ error: "symbols array is required" }, { status: 400 });
  }

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process symbols in batches to avoid rate limiting
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (symbol: string) => {
        try {
          results.processed++;
          
          // Get company profile
          const profileResponse = await fetch(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`);
          if (!profileResponse.ok) {
            throw new Error(`Failed to fetch profile for ${symbol}`);
          }
          
          const profileData = await profileResponse.json();
          const companyProfile = profileData[0];
          
          if (!companyProfile) {
            throw new Error(`No profile data for ${symbol}`);
          }

          const { companyName, sector, industry, marketCap } = companyProfile;
          const peerSymbols: string[] = [];

          // Find industry peers
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
                  .sort((a: any, b: any) => Math.abs(a.marketCap - marketCap) - Math.abs(b.marketCap - marketCap))
                  .slice(0, 8)
                  .map((company: any) => company.symbol);
                
                peerSymbols.push(...industryPeers);
              }
            } catch (error) {
              console.log(`Industry search failed for ${symbol}:`, error);
            }
          }

          // Find sector peers if needed
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
              }
            } catch (error) {
              console.log(`Sector search failed for ${symbol}:`, error);
            }
          }

          // Store in database
          const { error: dbError } = await supabase
            .from('stock_peers')
            .upsert({
              symbol: symbol,
              name: companyName || symbol,
              peers: peerSymbols,
              sector: sector || null,
              industry: industry || null,
              updated_at: new Date().toISOString()
            });

          if (dbError) {
            throw new Error(`Database error for ${symbol}: ${dbError.message}`);
          }

          results.successful++;
          console.log(`Processed ${symbol}: found ${peerSymbols.length} peers`);

        } catch (error) {
          results.failed++;
          const errorMsg = `${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          results.errors.push(errorMsg);
          console.error(`Failed to process ${symbol}:`, error);
        }
      }));

      // Add delay between batches to respect rate limits
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      message: "Batch processing completed",
      results
    });

  } catch (error) {
    console.error("Batch processing error:", error);
    return NextResponse.json(
      { error: "Batch processing failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch top companies for batch processing
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "1000");
  const offset = parseInt(searchParams.get("offset") || "0");

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    // Fetch top companies by market cap
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/stock-screener?marketCapMoreThan=1000000000&limit=${limit}&offset=${offset}&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch company list");
    }

    const companies = await response.json();
    const symbols = companies.map((company: any) => company.symbol);

    return NextResponse.json({
      symbols,
      count: symbols.length,
      limit,
      offset
    });

  } catch (error) {
    console.error("Error fetching company list:", error);
    return NextResponse.json(
      { error: "Failed to fetch company list", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 
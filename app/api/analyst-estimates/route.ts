import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const period = searchParams.get("period") || "both"; // 'annual', 'quarter', or 'both'

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  const apiKey = process.env.FMP_API_KEY || process.env.NEXT_PUBLIC_FMP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const estimates: any[] = [];
    
    // Fetch both annual and quarterly estimates based on period parameter
    if (period === 'annual' || period === 'both') {
      const annualUrl = `https://financialmodelingprep.com/api/v3/analyst-estimates/${symbol}?limit=10&apikey=${apiKey}`;
      const annualResponse = await fetch(annualUrl);
      
      if (annualResponse.ok) {
        const annualData = await annualResponse.json();
        if (Array.isArray(annualData)) {
          estimates.push(...annualData.map((item: any) => ({ ...item, period: 'annual' })));
        }
      }
    }
    
    if (period === 'quarter' || period === 'both') {
      // Note: FMP might use different endpoint for quarterly estimates
      const quarterlyUrl = `https://financialmodelingprep.com/api/v3/analyst-estimates/${symbol}?period=quarter&limit=12&apikey=${apiKey}`;
      const quarterlyResponse = await fetch(quarterlyUrl);
      
      if (quarterlyResponse.ok) {
        const quarterlyData = await quarterlyResponse.json();
        if (Array.isArray(quarterlyData)) {
          estimates.push(...quarterlyData.map((item: any) => ({ ...item, period: 'quarter' })));
        }
      }
    }

    // Sort by date (newest first)
    estimates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ 
      symbol,
      estimates,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Error fetching analyst estimates:", error);
    return NextResponse.json(
      { error: "Failed to fetch analyst estimates", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const period = searchParams.get('period') || 'annual';
  const limit = searchParams.get('limit') || '10';

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const url = `https://financialmodelingprep.com/api/v3/key-metrics/${symbol}?period=${period}&limit=${limit}&apikey=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch key metrics: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching key metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch key metrics", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
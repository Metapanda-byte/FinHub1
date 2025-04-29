import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_FMP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const searchUrl = `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(query)}&limit=5&exchange=NYSE,NASDAQ&apikey=${apiKey}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to search stocks: ${response.status}`);
    }

    const data = await response.json();
    
    // Format the response to include only necessary information
    const results = data.map((item: any) => ({
      symbol: item.symbol,
      name: item.name,
      exchange: item.exchangeShortName,
      type: item.type,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching stocks:", error);
    return NextResponse.json(
      { error: "Failed to search stocks", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 
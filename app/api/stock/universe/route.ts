import { NextResponse } from "next/server";

interface StockListItem {
  symbol: string;
  name: string;
  price: number | null;
  exchange: string;
  exchangeShortName: string;
  type: string;
}

interface CachedData {
  data: StockListItem[];
  timestamp: number;
}

// Cache duration: 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;
let cache: CachedData | null = null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get("refresh") === "true";
  
  const apiKey = process.env.NEXT_PUBLIC_FMP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  // Check cache first
  if (!forceRefresh && cache && (Date.now() - cache.timestamp) < CACHE_DURATION) {
    console.log("[Stock Universe] Returning cached data");
    return NextResponse.json({
      stocks: cache.data,
      totalCount: cache.data.length,
      cached: true,
      timestamp: cache.timestamp
    });
  }

  try {
    console.log("[Stock Universe] Fetching fresh data from FMP");
    
    // Fetch complete stock list from FMP
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/stock/list?apikey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stock universe: ${response.status}`);
    }

    const data: StockListItem[] = await response.json();
    
    // Filter to only include stocks (exclude ETFs, funds, etc.)
    const stocks = data.filter(item => {
      // Only include items that are stocks (not ETFs, funds, etc.)
      // FMP sometimes doesn't provide type, so we check multiple conditions
      const isStock = !item.type || 
                      item.type.toLowerCase() === 'stock' || 
                      item.type.toLowerCase() === 'common stock';
      
      // Exclude items that are explicitly ETFs or funds
      const isNotETF = item.name && 
                       !item.name.toLowerCase().includes(' etf') &&
                       !item.name.toLowerCase().includes(' fund') &&
                       !item.name.toLowerCase().includes(' trust') &&
                       !item.name.toLowerCase().includes(' etn');
      
      return isStock && isNotETF && item.symbol && item.name;
    });

    // Sort by exchange and name for better organization
    stocks.sort((a, b) => {
      if (a.exchangeShortName !== b.exchangeShortName) {
        return a.exchangeShortName.localeCompare(b.exchangeShortName);
      }
      return a.name.localeCompare(b.name);
    });

    // Update cache
    cache = {
      data: stocks,
      timestamp: Date.now()
    };

    // Group by exchange for statistics
    const exchangeStats = stocks.reduce((acc, stock) => {
      const exchange = stock.exchangeShortName || 'Unknown';
      acc[exchange] = (acc[exchange] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`[Stock Universe] Fetched ${stocks.length} stocks across ${Object.keys(exchangeStats).length} exchanges`);

    return NextResponse.json({
      stocks: stocks,
      totalCount: stocks.length,
      exchangeStats: exchangeStats,
      cached: false,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("Error fetching stock universe:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock universe", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
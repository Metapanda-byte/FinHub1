const API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;
const BASE_URL = "https://financialmodelingprep.com/api/v3";

export interface StockQuote {
  price: number;
  sharesOutstanding: number;
  marketCap: number;
  volume: number;
  avgVolume: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
  eps: number;
  pe: number;
  change: number;
  changesPercentage: number;
}

export async function fetchStockQuote(symbol: string): Promise<StockQuote> {
  if (!API_KEY) {
    throw new Error("NEXT_PUBLIC_FMP_API_KEY is not configured");
  }

  const response = await fetch(
    `${BASE_URL}/quote/${symbol}?apikey=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch stock quote");
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("No data found");
  }

  const quote = data[0];
  return {
    price: quote.price,
    sharesOutstanding: quote.sharesOutstanding,
    marketCap: quote.marketCap,
    volume: quote.volume,
    avgVolume: quote.avgVolume,
    dayHigh: quote.dayHigh,
    dayLow: quote.dayLow,
    yearHigh: quote.yearHigh,
    yearLow: quote.yearLow,
    eps: quote.eps,
    pe: quote.pe,
    change: quote.change,
    changesPercentage: quote.changesPercentage,
  };
} 
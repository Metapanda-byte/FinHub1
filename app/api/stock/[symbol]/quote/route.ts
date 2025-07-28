import { NextRequest } from "next/server";
import { fetchStockQuote } from "@/lib/financial-modeling-prep";
import { ApiError, handleApiError, createApiResponse } from "@/lib/api/error-handler";
import { rateLimit } from "@/lib/api/rate-limit";

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  exchange: string;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  earningsAnnouncement: string;
  sharesOutstanding: number;
}

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
});

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    // Apply rate limiting
    await limiter(request);

    const { symbol } = params;

    if (!symbol) {
      throw new ApiError("Symbol is required", 400, "MISSING_SYMBOL");
    }

    const quote = await fetchStockQuote(symbol);
    return createApiResponse(quote);
  } catch (error) {
    return handleApiError(error);
  }
} 
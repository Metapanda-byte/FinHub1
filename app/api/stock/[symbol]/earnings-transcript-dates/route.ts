import { NextRequest, NextResponse } from 'next/server';
import { FMP_API_KEY } from '@/lib/config';

export interface EarningsTranscriptDate {
  symbol: string;
  quarter: number;
  year: number;
  date: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol.toUpperCase();

    if (!FMP_API_KEY) {
      return NextResponse.json(
        { error: 'FMP API key not configured' },
        { status: 500 }
      );
    }

    const url = `https://financialmodelingprep.com/api/v4/earning_call_transcript?symbol=${symbol}&apikey=${FMP_API_KEY}&limit=10`;
    
    console.log(`[API Request] earning_call_transcript dates/${symbol}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Earnings transcript dates API request failed: ${response.status}`);
      return NextResponse.json([], { status: 200 });
    }

    const result = await response.json();
    if (!result || (Array.isArray(result) && result.length === 0)) {
      console.warn(`No earnings transcript dates for ${symbol}`);
      return NextResponse.json([], { status: 200 });
    }

    if (result.error || result["Error Message"]) {
      console.warn(`API Error: ${result.error || result["Error Message"]}`);
      return NextResponse.json([], { status: 200 });
    }

    // Transform the API response format [quarter, year, date] to our interface
    const transformed = Array.isArray(result) ? result.map((item: any) => {
      if (Array.isArray(item) && item.length >= 3) {
        return {
          quarter: item[0],
          year: item[1], 
          date: item[2],
          symbol
        };
      }
      return null;
    }).filter(Boolean) : [];

    return NextResponse.json(transformed);
  } catch (error) {
    console.error(`Error fetching earnings transcript dates for ${params.symbol}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings transcript dates' },
      { status: 500 }
    );
  }
} 
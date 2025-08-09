import { NextRequest, NextResponse } from 'next/server';
import { FMP_API_KEY } from '@/lib/config';

export interface EarningsTranscript {
  symbol: string;
  quarter: number;
  year: number;
  date: string;
  content: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string; quarter: string; year: string }> }
) {
  const { symbol: rawSymbol, quarter: rawQuarter, year: rawYear } = await params;
  const symbol = rawSymbol.toUpperCase();
  const quarter = parseInt(rawQuarter);
  const year = parseInt(rawYear);
  
  try {

    if (!FMP_API_KEY) {
      return NextResponse.json(
        { error: 'FMP API key not configured' },
        { status: 500 }
      );
    }

    const url = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${symbol}?quarter=${quarter}&year=${year}&apikey=${FMP_API_KEY}`;
    
    console.log(`[API Request] earnings-transcript/${symbol}/${quarter}/${year}`);
    console.log(`[API URL] ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for transcripts
    
    const response = await fetch(url, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`[API Error] earnings-transcript/${symbol}/${quarter}/${year} - Status: ${response.status}`);
      return NextResponse.json(null, { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[Error] earnings-transcript/${symbol}/${quarter}/${year}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings transcript' },
      { status: 500 }
    );
  }
} 
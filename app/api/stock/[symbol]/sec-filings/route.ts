import { NextRequest, NextResponse } from 'next/server';
import { FMP_API_KEY } from '@/lib/config';

export interface SECFiling {
  symbol: string;
  fillingDate: string;
  acceptedDate: string;
  cik: string;
  type: string; // 10-K, 10-Q, 8-K, etc.
  link: string;
  finalLink: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  try {
    const upperSymbol = symbol.toUpperCase();

    if (!FMP_API_KEY) {
      return NextResponse.json(
        { error: 'FMP API key not configured' },
        { status: 500 }
      );
    }

    // Get 3 years of data (approximately 100-150 filings should cover 3 years)
    const url = `https://financialmodelingprep.com/api/v3/sec_filings/${upperSymbol}?apikey=${FMP_API_KEY}&limit=150`;
    
    console.log(`[API Request] sec_filings/${upperSymbol}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`SEC filings API request failed: ${response.status}`);
      return NextResponse.json([], { status: 200 });
    }

    const result = await response.json();
    if (!result || (Array.isArray(result) && result.length === 0)) {
      console.warn(`No SEC filings data for ${upperSymbol}`);
      return NextResponse.json([], { status: 200 });
    }

    if (result.error || result["Error Message"]) {
      console.warn(`API Error: ${result.error || result["Error Message"]}`);
      return NextResponse.json([], { status: 200 });
    }

    const filings = Array.isArray(result) ? result : [];
    
    // Filter to last 3 years
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    
    const filteredFilings = filings.filter((filing: SECFiling) => {
      const filingDate = new Date(filing.fillingDate);
      return filingDate >= threeYearsAgo;
    });

    const sortedFilings = filteredFilings.sort((a: SECFiling, b: SECFiling) => 
      new Date(b.fillingDate).getTime() - new Date(a.fillingDate).getTime()
    );

    return NextResponse.json(sortedFilings);
  } catch (error) {
    console.error(`Error fetching SEC filings for ${symbol}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch SEC filings' },
      { status: 500 }
    );
  }
} 
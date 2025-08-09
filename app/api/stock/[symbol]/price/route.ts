import { NextRequest, NextResponse } from 'next/server';
import { FMP_API_KEY } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '1Y';
    const upperSymbol = symbol.toUpperCase();

    if (!FMP_API_KEY) {
      return NextResponse.json(
        { error: 'FMP API key not configured' },
        { status: 500 }
      );
    }

    // Map timeframe to timeseries parameter (matching old implementation)
    const timeseriesMap = {
      'YTD': 365,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      '5Y': 1825,
    };
    const timeseries = timeseriesMap[timeframe as keyof typeof timeseriesMap] || 365;

    const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${upperSymbol}?serietype=line&timeseries=${timeseries}&apikey=${FMP_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process the data to match expected format (matching old implementation)
    let processedData: any[] = [];
    if (data.historical && Array.isArray(data.historical)) {
      processedData = data.historical
        .map((item: any) => ({
          date: item.date,
          price: item.close, // Map close to price (matching old implementation)
          volume: item.volume,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          change: item.change,
          changePercent: item.changePercent
        }));
    }

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Stock price API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock price data' },
      { status: 500 }
    );
  }
} 
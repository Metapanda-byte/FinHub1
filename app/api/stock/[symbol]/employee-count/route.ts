import { NextRequest, NextResponse } from 'next/server';
import { FMP_API_KEY } from '@/lib/config';

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

    const url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract employee count from profile data
    const employeeCount = data?.fullTimeEmployees ? parseInt(data.fullTimeEmployees.replace(/[^0-9]/g, '')) : null;
    
    return NextResponse.json({ employeeCount });
  } catch (error) {
    console.error('Employee count API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee count data' },
      { status: 500 }
    );
  }
} 
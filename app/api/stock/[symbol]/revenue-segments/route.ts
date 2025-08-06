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

    // Try v4 endpoint first (more recent data)
    let url = `https://financialmodelingprep.com/api/v4/revenue-product-segmentation?symbol=${symbol}&apikey=${FMP_API_KEY}`;
    let response = await fetch(url);
    
    if (!response.ok) {
      // Fallback to v3 endpoint
      url = `https://financialmodelingprep.com/api/v3/revenue-product-segmentation/${symbol}?apikey=${FMP_API_KEY}`;
      response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`FMP API error: ${response.status}`);
      }
    }
    
    const data = await response.json();
    
    // Process the nested data structure to extract segments
    let processedData: any[] = [];
    if (Array.isArray(data) && data.length > 0) {
      const mostRecentData = data[0];
      const dateKey = Object.keys(mostRecentData)[0];
      const revenueData = mostRecentData[dateKey];
      
      if (revenueData && typeof revenueData === 'object') {
        // Navigate through the nested structure to find segments
        for (const revenueCategory of Object.values(revenueData)) {
          if (revenueCategory && typeof revenueCategory === 'object' && 'Segments' in revenueCategory) {
            const segments = revenueCategory.Segments;
            if (segments && typeof segments === 'object') {
              const totalRevenue = Object.values(segments).reduce((sum: number, value: any) => sum + (Number(value) || 0), 0);
              processedData = Object.entries(segments).map(([segment, revenue]) => ({
                name: segment,
                value: Number(revenue) || 0,
                percentage: totalRevenue > 0 ? ((Number(revenue) || 0) / totalRevenue) * 100 : 0
              }));
              break; // Use the first revenue category with segments
            }
          }
        }
      }
    }

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Revenue segments API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue segments data' },
      { status: 500 }
    );
  }
} 
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

    // Try v4 endpoint first (request flat structure if supported)
    let url = `https://financialmodelingprep.com/api/v4/revenue-product-segmentation?symbol=${symbol}&structure=flat&apikey=${FMP_API_KEY}`;
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
      
      const buildFromEntries = (entries: Record<string, any>) => {
        const numericPairs = Object.entries(entries).filter(([k, v]) => typeof v === 'number' && isFinite(v));
        if (numericPairs.length === 0) return [] as any[];
        const total = numericPairs.reduce((sum, [, v]) => sum + (Number(v) || 0), 0);
        if (total <= 0) return [] as any[];
        return numericPairs
          .sort((a, b) => Number(b[1]) - Number(a[1]))
          .map(([name, value]) => ({
            name,
            value: Number(value) || 0,
            percentage: total > 0 ? ((Number(value) || 0) / total) * 100 : 0,
          }));
      };
      
      if (revenueData && typeof revenueData === 'object') {
        // 1) Direct flat object with numeric values
        const direct = buildFromEntries(revenueData as Record<string, any>);
        if (direct.length > 0) {
          processedData = direct;
        } else {
          // 2) Walk nested categories to find either 'Segments'/'Product' or any numeric object
          for (const revenueCategory of Object.values(revenueData)) {
            if (revenueCategory && typeof revenueCategory === 'object') {
              // Named fields commonly used by FMP
              const candidate = (revenueCategory as any).Segments || (revenueCategory as any).Product || (revenueCategory as any).Products || (revenueCategory as any).segments || (revenueCategory as any).product;
              if (candidate && typeof candidate === 'object') {
                const fromKnown = buildFromEntries(candidate as Record<string, any>);
                if (fromKnown.length > 0) { processedData = fromKnown; break; }
              }
              // Otherwise, try to treat the object itself as the map of segments
              const fromAnonymous = buildFromEntries(revenueCategory as Record<string, any>);
              if (fromAnonymous.length > 0) { processedData = fromAnonymous; break; }
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
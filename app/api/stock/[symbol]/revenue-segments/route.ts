import { NextRequest, NextResponse } from 'next/server';
import { FMP_API_KEY } from '@/lib/config';

function collectNumericMap(obj: any, into: Record<string, number>) {
  if (!obj || typeof obj !== 'object') return;
  for (const [k, v] of Object.entries(obj)) {
    if (k.toLowerCase() === 'date' || /period/i.test(k)) continue;
    const num = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(num)) continue;
    const label = String(k).replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
    into[label] = (into[label] || 0) + num;
  }
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

    // Try v4 endpoint first (request flat structure if supported)
    let url = `https://financialmodelingprep.com/api/v4/revenue-product-segmentation?symbol=${upperSymbol}&structure=flat&apikey=${FMP_API_KEY}`;
    let response = await fetch(url);
    
    if (!response.ok) {
      // Fallback to v3 endpoint
      url = `https://financialmodelingprep.com/api/v3/revenue-product-segmentation/${upperSymbol}?apikey=${FMP_API_KEY}`;
      response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`FMP API error: ${response.status}`);
      }
    }
    
    const data = await response.json();
    
    // Robust parse: recursively scan payload for numeric segment maps
    const segmentsMap: Record<string, number> = {};

    const scan = (node: any) => {
      if (!node) return;
      if (Array.isArray(node)) { node.forEach(scan); return; }
      if (typeof node !== 'object') return;

      // Known containers
      const candidate = (node as any).Segments || (node as any).Product || (node as any).Products || (node as any).segments || (node as any).product;
      if (candidate && typeof candidate === 'object') {
        collectNumericMap(candidate, segmentsMap);
      }

      // Date-keyed entry: { '2024-09-28': { ... } }
      const keys = Object.keys(node);
      if (keys.length === 1 && /\d{4}-\d{2}-\d{2}/.test(keys[0]) && typeof (node as any)[keys[0]] === 'object') {
        collectNumericMap((node as any)[keys[0]], segmentsMap);
      }

      // Treat the object itself as a potential numeric map
      collectNumericMap(node, segmentsMap);

      // Recurse
      for (const value of Object.values(node)) {
        if (value && typeof value === 'object') scan(value);
      }
    };

    scan(data);

    const entries = Object.entries(segmentsMap);
    const positives = entries.filter(([, v]) => v > 0);
    const chosen = positives.length > 0 ? positives : entries;

    const total = chosen.reduce((s, [, v]) => s + (Number(v) || 0), 0);

    const processedData = total > 0
      ? chosen
          .sort((a, b) => Number(b[1]) - Number(a[1]))
          .map(([name, value]) => ({
            name,
            value: Number(value) || 0,
            percentage: total > 0 ? ((Number(value) || 0) / total) * 100 : 0,
          }))
      : [];

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Revenue segments API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue segments data' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { FMP_API_KEY } from '@/lib/config';

// Normalize region labels to consistent, user-friendly names
function normalizeRegionName(rawKey: string): string {
  if (!rawKey) return 'Other';
  const cleaned = rawKey
    .replace(/_/g, ' ')
    .replace(/\bGeographical\b|\bGeographic\b|\bGeography\b|\bRegion(s)?\b|\bArea(s)?\b/gi, '')
    .replace(/\bSegment\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const upper = cleaned.toUpperCase();
  const lower = cleaned.toLowerCase();

  // Explicit mappings first
  const explicit: Record<string, string> = {
    'UNITED STATES': 'US',
    'UNITED STATES OF AMERICA': 'US',
    'US': 'US',
    'U.S.': 'US',
    'UNITED KINGDOM': 'UK',
    'U.K.': 'UK',
    'JAPA': 'Japan',
    'JAPAN': 'Japan',
    'GREATER CHINA': 'Greater China',
    'REST OF ASIA PACIFIC': 'Rest of Asia Pacific',
    'ASIA PACIFIC': 'Asia Pacific',
    'APAC': 'APAC',
    'EMEA': 'EMEA',
    'EUROPE': 'Europe',
    'AMERICAS': 'Americas',
    'NORTH AMERICA': 'North America',
    'SOUTH AMERICA': 'South America',
    'INTERNATIONAL MARKETS': 'International',
    'INTERNATIONAL': 'International',
    'NON-US': 'Non-US',
    'OUTSIDE US & UK': 'Outside US & UK',
    'COUNTRIES OTHER THAN US AND UNITED KINGDOM': 'Outside US & UK',
  };

  if (explicit[upper]) return explicit[upper];

  // If label ends with common words like "Segment" removed, check remaining common forms
  // Title-case default but keep true acronym allowlist in ALL CAPS
  const acronymAllowlist = new Set(['US', 'UK', 'EMEA', 'APAC', 'UAE']);

  // Title-case words, preserving hyphenated parts
  const titleCased = cleaned
    .split(' ')
    .map((part) => {
      const normalized = part.replace(/[^A-Za-z\-\&]/g, '');
      const uc = normalized.toUpperCase();
      if (acronymAllowlist.has(uc)) return uc;
      // Keep Non-US style with hyphen intact
      if (/^non-us$/i.test(normalized)) return 'Non-US';
      if (!normalized) return part; // passthrough symbols like &
      return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
    })
    .join(' ')
    .replace(/\s+&\s+/g, ' & ')
    .trim();

  return titleCased || 'Other';
}

// Collect numeric region entries from any object
function collectNumericMap(obj: any, into: Record<string, number>) {
  if (!obj || typeof obj !== 'object') return;
  for (const [k, v] of Object.entries(obj)) {
    const num = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(num)) continue;
    const label = normalizeRegionName(String(k));
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

    // Try v4 endpoint first (request flat structure if supported), then fallback to v3
    const urls = [
      `https://financialmodelingprep.com/api/v4/revenue-geographic-segmentation?symbol=${upperSymbol}&structure=flat&apikey=${FMP_API_KEY}`,
      `https://financialmodelingprep.com/api/v4/revenue-geographic-segmentation?symbol=${upperSymbol}&apikey=${FMP_API_KEY}`,
      `https://financialmodelingprep.com/api/v3/revenue-geographic-segmentation/${upperSymbol}?apikey=${FMP_API_KEY}`,
    ];

    let data: any = null;
    let lastError: any = null;

    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          lastError = new Error(`FMP error ${res.status}`);
          continue;
        }
        data = await res.json();
        if (data) break;
      } catch (e) {
        lastError = e;
      }
    }

    if (!data) {
      throw lastError || new Error('No data from FMP');
    }

    // Parse flexible shapes
    // We will flatten any numeric maps we encounter under likely keys
    const regions: Record<string, number> = {};

    const scan = (node: any) => {
      if (!node) return;
      if (Array.isArray(node)) {
        for (const item of node) scan(item);
        return;
      }
      if (typeof node !== 'object') return;

      // Common shapes
      if (node.Geographical && typeof node.Geographical === 'object') {
        collectNumericMap(node.Geographical, regions);
      }
      if (node.geographic && typeof node.geographic === 'object') {
        collectNumericMap(node.geographic, regions);
      }

      // Date-keyed entry: { '2024-09-28': { Europe: 123, ... } }
      const keys = Object.keys(node);
      if (keys.length === 1 && /\d{4}-\d{2}-\d{2}/.test(keys[0]) && typeof node[keys[0]] === 'object') {
        collectNumericMap(node[keys[0]], regions);
      }

      // Direct numeric map at this level
      collectNumericMap(node, regions);

      // Recurse properties (in case of nested containers)
      for (const value of Object.values(node)) {
        if (value && typeof value === 'object') scan(value);
      }
    };

    scan(data);

    // Post-process: drop zero/negative values unless all are non-positive
    const entries = Object.entries(regions);
    const positives = entries.filter(([, v]) => v > 0);
    const chosen = positives.length > 0 ? positives : entries;

    const total = chosen.reduce((s, [, v]) => s + (Number(v) || 0), 0);
    const processed = chosen
      .map(([name, value]) => ({
        name,
        value: Number(value) || 0,
        percentage: total > 0 ? (Number(value) / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);

    return NextResponse.json(processed);
  } catch (error) {
    console.error('Geographic revenue API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch geographic revenue data' },
      { status: 500 }
    );
  }
} 
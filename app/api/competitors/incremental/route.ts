import { NextRequest, NextResponse } from 'next/server';
import { FMP_API_KEY } from '@/lib/config';

// Lightweight helpers (subset of competitors route)
function collectNumericMap(obj: any, into: Record<string, number>) {
  if (!obj || typeof obj !== 'object') return;
  for (const [k, v] of Object.entries(obj)) {
    const key = String(k);
    if (key.toLowerCase() === 'date' || /period/i.test(key)) continue;
    let num: number | null = null;
    if (typeof v === 'number') num = v;
    else if (typeof v === 'string') {
      const parsed = Number(v.replace(/%/g, '').replace(',', '.'));
      if (Number.isFinite(parsed)) num = parsed;
    } else if (v && typeof v === 'object') {
      for (const cand of ['percentage', 'percent', 'share', 'value']) {
        const maybe = (v as any)[cand];
        if (typeof maybe === 'number') { num = maybe; break; }
        if (typeof maybe === 'string') {
          const parsed = Number(maybe.replace(/%/g, '').replace(',', '.'));
          if (Number.isFinite(parsed)) { num = parsed; break; }
        }
      }
    }
    if (num != null && Number.isFinite(num) && Number(num) > 0) {
      const label = key.replace(/_/g, ' ');
      into[label] = (into[label] || 0) + Number(num);
    }
  }
}

function formatMixFromAny(data: any): string {
  const map: Record<string, number> = {};
  const scan = (node: any) => {
    if (!node) return;
    if (Array.isArray(node)) { node.forEach(scan); return; }
    if (typeof node !== 'object') return;
    collectNumericMap(node, map);
    for (const v of Object.values(node)) if (v && typeof v === 'object') scan(v);
  };
  scan(data);
  const entries = Object.entries(map).filter(([, v]) => Number(v) > 0);
  if (entries.length === 0) return 'N/A';
  entries.sort((a, b) => Number(b[1]) - Number(a[1]));
  const total = entries.reduce((s, [, v]) => s + Number(v), 0);
  const top = entries.slice(0, 3).map(([name, v]) => `${name} ${Math.round((Number(v) / total) * 100)}%`);
  if (entries.length > 3) {
    const other = entries.slice(3).reduce((s, [, v]) => s + Number(v), 0);
    const pct = Math.round((other / total) * 100);
    if (pct > 0) top.push(`Other ${pct}%`);
  }
  return top.join(', ');
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const peer = (searchParams.get('peer') || '').toUpperCase();
    if (!peer) {
      return NextResponse.json({ error: 'peer is required' }, { status: 400 });
    }
    const apiKey = FMP_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'FMP API key not configured' }, { status: 500 });

    // Profile
    const profileResp = await fetch(`https://financialmodelingprep.com/api/v3/profile/${peer}?apikey=${apiKey}`);
    const profileArr = profileResp.ok ? await profileResp.json() : [];
    const profile = profileArr[0] || {};

    // Ratios & metrics
    const [ratiosResp, metricsResp] = await Promise.all([
      fetch(`https://financialmodelingprep.com/api/v3/ratios-ttm/${peer}?apikey=${apiKey}`),
      fetch(`https://financialmodelingprep.com/api/v3/key-metrics-ttm/${peer}?apikey=${apiKey}`)
    ]);
    const ratios = ratiosResp.ok ? (await ratiosResp.json())[0] : null;
    const metrics = metricsResp.ok ? (await metricsResp.json())[0] : null;

    // Income statements (for performance deltas)
    const incResp = await fetch(`https://financialmodelingprep.com/api/v3/income-statement/${peer}?period=quarter&limit=4&apikey=${apiKey}`);
    const incomeStatements = incResp.ok ? await incResp.json() : [];

    // Segments
    const [segProdResp, segGeoResp] = await Promise.all([
      fetch(`https://financialmodelingprep.com/api/v4/revenue-product-segmentation?symbol=${peer}&structure=flat&period=annual&apikey=${apiKey}`),
      fetch(`https://financialmodelingprep.com/api/v4/revenue-geographic-segmentation?symbol=${peer}&structure=flat&period=annual&apikey=${apiKey}`)
    ]);
    const segProd = segProdResp.ok ? await segProdResp.json() : null;
    const segGeo = segGeoResp.ok ? await segGeoResp.json() : null;

    // Build outputs
    const companyName = profile.companyName || peer;

    // Valuation snapshot (aligns with table keys; fallback zeros)
    const toPercent = (v: any) => {
      const num = Number(v);
      if (!isFinite(num)) return 0;
      return Math.abs(num) <= 1 ? num * 100 : num;
    };

    const valuation = {
      ticker: peer,
      company: companyName,
      sector: profile.sector || 'N/A',
      marketCap: Number(profile.mktCap) || 0,
      netDebt: 0,
      enterpriseValue: Number(profile.enterpriseValue) || 0,
      ltmEvToEbitda: ratios?.enterpriseValueOverEBITDATTM || 0,
      ltmPeRatio: ratios?.priceEarningsRatioTTM || 0,
      ltmPriceToSales: ratios?.priceToSalesRatioTTM || 0,
      fwdEvToEbitda: metrics?.enterpriseValueOverEBITDA || 0,
      fwdPeRatio: metrics?.peRatio || 0,
      fwdPriceToSales: metrics?.priceToSalesRatio || 0,
      priceToBook: ratios?.priceToBookRatioTTM || 0,
      dividendYield: toPercent(ratios?.dividendYieldPercentageTTM ?? metrics?.dividendYieldTTM ?? metrics?.dividendYieldPercentageTTM ?? 0),
      evToEbitda: ratios?.enterpriseValueOverEBITDATTM || 0,
      peRatio: ratios?.priceEarningsRatioTTM || 0,
      priceToSales: ratios?.priceToSalesRatioTTM || 0,
    };

    // Performance snapshot
    let performance;
    if (Array.isArray(incomeStatements) && incomeStatements.length >= 2) {
      const current = incomeStatements[0];
      const previous = incomeStatements[1];
      performance = {
        ticker: peer,
        company: companyName,
        sector: profile.sector || 'N/A',
        revenueGrowth: ((current.revenue - previous.revenue) / previous.revenue) * 100,
        grossMargin: (current.grossProfitRatio || 0) * 100,
        operatingMargin: (current.operatingIncomeRatio || 0) * 100,
        netMargin: (current.netIncomeRatio || 0) * 100,
        roic: toPercent(ratios?.returnOnInvestedCapitalTTM),
        roe: toPercent(ratios?.returnOnEquityTTM),
        ebitdaMargin: (current.ebitdaratio || 0) * 100,
      };
    } else {
      performance = {
        ticker: peer,
        company: companyName,
        sector: profile.sector || 'N/A',
        revenueGrowth: 0,
        grossMargin: 0,
        operatingMargin: 0,
        netMargin: 0,
        roic: toPercent(ratios?.returnOnInvestedCapitalTTM),
        roe: toPercent(ratios?.returnOnEquityTTM),
        ebitdaMargin: 0,
      };
    }

    // Qualitative
    const qualitative = {
      ticker: peer,
      company: companyName,
      description: profile.description || 'N/A',
      country: profile.country || 'N/A',
      geographicMix: formatMixFromAny(segGeo),
      segmentMix: formatMixFromAny(segProd),
      exchange: profile.exchangeShortName || profile.exchange || 'N/A',
      website: profile.website || '',
      ceo: profile.ceo || '',
      employees: Number(profile.fullTimeEmployees) || 0,
    };

    return NextResponse.json({
      peerCompany: { id: peer, name: companyName, symbol: peer },
      peerValuationData: valuation,
      peerPerformanceData: performance,
      peerQualitativeData: qualitative,
    });
  } catch (error) {
    console.error('Incremental competitor error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch peer data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
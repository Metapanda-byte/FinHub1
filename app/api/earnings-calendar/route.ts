import { NextRequest, NextResponse } from 'next/server';
import { FMP_API_KEY } from '@/lib/config';

function formatDate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    // Default to current week (Mon-Sun)
    const now = new Date();
    const day = now.getDay(); // 0=Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const from = fromParam || formatDate(monday);
    const to = toParam || formatDate(sunday);

    if (!FMP_API_KEY) {
      return NextResponse.json({ error: 'FMP API key not configured' }, { status: 500 });
    }

    const url = `https://financialmodelingprep.com/api/v3/earning_calendar?from=${from}&to=${to}&apikey=${FMP_API_KEY}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`FMP error ${resp.status}`);
    }
    const json = await resp.json();

    // Normalize minimal shape
    const list: any[] = Array.isArray(json) ? json as any[] : [];
    
    // Get unique symbols to fetch company profiles
    const symbols = Array.from(new Set(list.map((r: any) => r.symbol).filter(Boolean)));
    
    // Fetch company profiles in batches to get market cap, sector, etc.
    const companyData = new Map();
    if (symbols.length > 0) {
      try {
        // Batch symbols into chunks of 100 (API limit)
        const chunks = [];
        for (let i = 0; i < symbols.length; i += 100) {
          chunks.push(symbols.slice(i, i + 100));
        }
        
        for (const chunk of chunks) {
          const profileUrl = `https://financialmodelingprep.com/api/v3/profile/${chunk.join(',')}?apikey=${FMP_API_KEY}`;
          const profileResp = await fetch(profileUrl);
          if (profileResp.ok) {
            const profiles = await profileResp.json();
            const profileList = Array.isArray(profiles) ? profiles : [profiles];
            profileList.forEach((profile: any) => {
              if (profile && profile.symbol) {
                companyData.set(profile.symbol, {
                  marketCap: profile.mktCap || null,
                  sector: profile.sector || null,
                  industry: profile.industry || null,
                  exchange: profile.exchangeShortName || null,
                  companyName: profile.companyName || null,
                });
              }
            });
          }
        }
      } catch (profileError) {
        console.warn('Failed to fetch company profiles:', profileError);
      }
    }

    const rows = list.map((r: any) => {
      const companyInfo = companyData.get(r.symbol) || {};
      return {
        date: r.date,
        symbol: r.symbol,
        name: companyInfo.companyName || r.company || r.name || 'Unknown Company',
        time: r.time || r.hour || null,
        eps: typeof r.eps === 'number' ? r.eps : (r.eps ? Number(r.eps) : null),
        epsEstimated: typeof r.epsEstimated === 'number' ? r.epsEstimated : (r.epsEstimated ? Number(r.epsEstimated) : null),
        revenue: typeof r.revenue === 'number' ? r.revenue : (r.revenue ? Number(r.revenue) : null),
        revenueEstimated: typeof r.revenueEstimated === 'number' ? r.revenueEstimated : (r.revenueEstimated ? Number(r.revenueEstimated) : null),
        quarter: r.quarter ?? null,
        year: r.year ?? null,
        marketCap: companyInfo.marketCap || null,
        sector: companyInfo.sector || null,
        industry: companyInfo.industry || null,
        exchange: companyInfo.exchange || null,
      };
    });

    return NextResponse.json({ from, to, count: rows.length, rows });
  } catch (e: any) {
    console.error('earnings-calendar error', e);
    return NextResponse.json({ error: 'Failed to fetch earnings calendar' }, { status: 500 });
  }
} 
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// Ensure percentage-like values are consistently in percent units (e.g., 12.3 for 12.3%)
const normalizePercentage = (value: number | undefined | null): number => {
  const num = Number(value);
  if (!isFinite(num)) return 0;
  // If API returns a fraction (e.g., 0.123), convert to percent; otherwise pass through
  return Math.abs(num) <= 1 ? num * 100 : num;
};

interface CompanyProfile {
  symbol: string;
  companyName: string;
  industry: string;
  sector: string;
  marketCap: number;
  price: number;
  beta: number;
  volume: number;
  lastDiv: number;
  range: string;
  changes: number;
  changesPercentage: string;
  exchange: string;
}

interface ValuationData {
  ticker: string;
  company: string;
  sector: string;
  marketCap: number;
  netDebt: number;
  enterpriseValue: number;
  // LTM metrics
  ltmEvToEbitda: number;
  ltmPeRatio: number;
  ltmPriceToSales: number;
  // Forward metrics
  fwdEvToEbitda: number;
  fwdPeRatio: number;
  fwdPriceToSales: number;
  // Other metrics
  priceToBook: number;
  dividendYield: number;
  // Legacy fields for backward compatibility
  evToEbitda: number;
  peRatio: number;
  priceToSales: number;
}

interface PerformanceData {
  ticker: string;
  company: string;
  sector: string;
  revenueGrowth: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  roic: number;
  roe: number;
}

interface QualitativeData {
  ticker: string;
  company: string;
  description: string;
  country: string;
  geographicMix: string;
  segmentMix: string;
  exchange: string;
  website: string;
  ceo: string;
  employees: number;
}

// Add after interfaces:
// Simple in-memory cache for Perplexity descriptions
const descriptionCache = new Map<string, { description: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Add response cache
const responseCache = new Map<string, { data: any; timestamp: number }>();
const RESPONSE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Add after response cache:
// Country code to full name mapping
const getFullCountryName = (countryCode: string): string => {
  const countryMap: Record<string, string> = {
    'US': 'United States',
    'USA': 'United States',
    'CN': 'China',
    'JP': 'Japan',
    'DE': 'Germany',
    'GB': 'United Kingdom',
    'UK': 'United Kingdom',
    'FR': 'France',
    'IN': 'India',
    'IT': 'Italy',
    'BR': 'Brazil',
    'CA': 'Canada',
    'KR': 'South Korea',
    'ES': 'Spain',
    'AU': 'Australia',
    'RU': 'Russia',
    'NL': 'Netherlands',
    'CH': 'Switzerland',
    'SE': 'Sweden',
    'SG': 'Singapore',
    'HK': 'Hong Kong',
    'TW': 'Taiwan',
    'BE': 'Belgium',
    'DK': 'Denmark',
    'FI': 'Finland',
    'NO': 'Norway',
    'IE': 'Ireland',
    'IL': 'Israel',
    'AE': 'UAE',
    'SA': 'Saudi Arabia',
    'MX': 'Mexico',
    'ID': 'Indonesia',
    'TH': 'Thailand',
    'MY': 'Malaysia',
    'PH': 'Philippines',
    'VN': 'Vietnam',
    'EG': 'Egypt',
    'ZA': 'South Africa',
    'AR': 'Argentina',
    'CL': 'Chile',
    'CO': 'Colombia',
    'PE': 'Peru',
    'NZ': 'New Zealand',
    'AT': 'Austria',
    'PL': 'Poland',
    'PT': 'Portugal',
    'CZ': 'Czech Republic',
    'HU': 'Hungary',
    'RO': 'Romania',
    'GR': 'Greece',
    'TR': 'Turkey',
    'LU': 'Luxembourg',
    'BM': 'Bermuda',
    'KY': 'Cayman Islands',
    'VG': 'British Virgin Islands',
    'JE': 'Jersey',
    'GG': 'Guernsey',
    'IM': 'Isle of Man',
    'MC': 'Monaco',
    'LI': 'Liechtenstein',
    'MT': 'Malta',
    'CY': 'Cyprus',
    'BS': 'Bahamas',
    'BB': 'Barbados'
  };
  
  if (!countryCode || countryCode === 'N/A') return 'N/A';
  return countryMap[countryCode.toUpperCase()] || countryCode;
};

// Extract key business information helper
const extractKeyInfo = (text: string): string => {
  // Clean up the text first
  text = text
    .replace(/^(The company |The Company |It |They |We |Our company )/gi, '')
    .replace(/, Inc\.?| Inc\.?| Corporation| Corp\.?| Limited| Ltd\.?| LLC| L\.L\.C\.| plc| PLC| N\.V\./gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // For simple extraction, just take the first 120 characters
  if (text.length > 120) {
    const cutPoint = text.lastIndexOf(' ', 117);
    return text.substring(0, cutPoint > 80 ? cutPoint : 117) + '...';
  }
  
  return text || 'Business description not available';
};

// ---- Robust mix extraction helpers (reuse logic from stock/[symbol] routes) ----
function normalizeRegionName(rawKey: string): string {
  if (!rawKey) return 'Other';
  const cleaned = rawKey
    .replace(/_/g, ' ')
    .replace(/\bGeographical\b|\bGeographic\b|\bGeography\b|\bRegion(s)?\b|\bArea(s)?\b/gi, '')
    .replace(/\bSegment\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  const upper = cleaned.toUpperCase();
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
  const acronymAllowlist = new Set(['US', 'UK', 'EMEA', 'APAC', 'UAE']);
  const titleCased = cleaned
    .split(' ')
    .map((part) => {
      const normalized = part.replace(/[^A-Za-z\-\&]/g, '');
      const uc = normalized.toUpperCase();
      if (acronymAllowlist.has(uc)) return uc;
      if (/^non-us$/i.test(normalized)) return 'Non-US';
      if (!normalized) return part;
      return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
    })
    .join(' ')
    .replace(/\s+&\s+/g, ' & ')
    .trim();
  return titleCased || 'Other';
}

function collectNumericMap(obj: any, into: Record<string, number>, normalizer?: (k: string) => string) {
  if (!obj || typeof obj !== 'object') return;
  for (const [k, v] of Object.entries(obj)) {
    const key = String(k);
    if (key.toLowerCase() === 'date' || /period/i.test(key)) continue;

    const labelRaw = normalizer ? normalizer(key) : key.replace(/_/g, ' ');

    let num: number | null = null;
    if (typeof v === 'number') {
      num = v;
    } else if (typeof v === 'string') {
      // Accept "33.2%" or "33,2%" or numeric strings
      const cleaned = v.replace(/%/g, '').replace(',', '.');
      const parsed = Number(cleaned);
      if (Number.isFinite(parsed)) num = parsed;
    } else if (v && typeof v === 'object') {
      // Look for common numeric fields
      const candidates = ['percentage', 'percent', 'share', 'value'];
      for (const field of candidates) {
        const maybe = (v as any)[field];
        if (typeof maybe === 'number') { num = maybe; break; }
        if (typeof maybe === 'string') {
          const cleaned = maybe.replace(/%/g, '').replace(',', '.');
          const parsed = Number(cleaned);
          if (Number.isFinite(parsed)) { num = parsed; break; }
        }
      }
    }

    if (num == null || !Number.isFinite(num) || Number(num) <= 0) continue;
    into[labelRaw] = (into[labelRaw] || 0) + Number(num);
  }
}

function deriveGeographicMixFromAny(data: any): string {
  if (!data) return 'N/A';
  const regions: Record<string, number> = {};
  const scan = (node: any) => {
    if (!node) return;
    if (Array.isArray(node)) { node.forEach(scan); return; }
    if (typeof node !== 'object') return;
    if ((node as any).Geographical && typeof (node as any).Geographical === 'object') {
      collectNumericMap((node as any).Geographical, regions, normalizeRegionName);
    }
    if ((node as any).geographic && typeof (node as any).geographic === 'object') {
      collectNumericMap((node as any).geographic, regions, normalizeRegionName);
    }
    const keys = Object.keys(node);
    if (keys.length === 1 && /\d{4}-\d{2}-\d{2}/.test(keys[0]) && typeof (node as any)[keys[0]] === 'object') {
      collectNumericMap((node as any)[keys[0]], regions, normalizeRegionName);
    }
    collectNumericMap(node, regions, normalizeRegionName);
    for (const value of Object.values(node)) if (value && typeof value === 'object') scan(value);
  };
  scan(data);
  const entries = Object.entries(regions).filter(([, v]) => Number(v) > 0);
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

function deriveSegmentMixFromAny(data: any): string {
  if (!data) return 'N/A';
  const segments: Record<string, number> = {};
  const scan = (node: any) => {
    if (!node) return;
    if (Array.isArray(node)) { node.forEach(scan); return; }
    if (typeof node !== 'object') return;
    const candidate = (node as any).Segments || (node as any).Product || (node as any).Products || (node as any).segments || (node as any).product;
    if (candidate && typeof candidate === 'object') collectNumericMap(candidate, segments);
    const keys = Object.keys(node);
    if (keys.length === 1 && /\d{4}-\d{2}-\d{2}/.test(keys[0]) && typeof (node as any)[keys[0]] === 'object') {
      collectNumericMap((node as any)[keys[0]], segments);
    }
    collectNumericMap(node, segments);
    for (const value of Object.values(node)) if (value && typeof value === 'object') scan(value);
  };
  scan(data);
  const entries = Object.entries(segments).filter(([k, v]) => Number(v) > 0 && k.toLowerCase() !== 'date' && !/period/i.test(k));
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
// ---- End helpers ----

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let symbol = searchParams.get('symbol');
  const additionalTickers = searchParams.get('additionalTickers')?.split(',').filter(Boolean) || [];
  const preferredPeers = searchParams.get('preferredPeers')?.split(',').filter(Boolean) || [];
  const excludePeers = searchParams.get('excludePeers')?.split(',').filter(Boolean) || [];
  
  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  // Handle foreign exchange symbols - map to primary US listing
  const foreignSymbolMap: Record<string, string> = {
    'NVD.F': 'NVDA',
    'MSF.F': 'MSFT',
    'APC.F': 'AAPL',
    'AMZ.F': 'AMZN',
    'AMD.F': 'AMD',
    'TL0.F': 'TSLA',
    'GOO.F': 'GOOGL',
    'FB2A.F': 'META',
    // Add more mappings as needed
  };

  // Check if it's a foreign symbol and map it
  const originalSymbol = symbol;
  if (foreignSymbolMap[symbol.toUpperCase()]) {
    symbol = foreignSymbolMap[symbol.toUpperCase()];
    console.log(`Mapped foreign symbol ${originalSymbol} to ${symbol}`);
  }

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'FMP API key not configured' }, { status: 500 });
  }

  const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
  // Use Perplexity if API key is present (default to true if key exists)
  const usePerplexity = !!perplexityApiKey;
  
  console.log('[Perplexity] API Key present:', !!perplexityApiKey);
  console.log('[Perplexity] Use Perplexity:', usePerplexity);

  // Check cache first
  const cacheKey = `${symbol}:${additionalTickers.join(',')}:${searchParams.get('validatePeers') || 'false'}`;
  const cached = responseCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < RESPONSE_CACHE_DURATION) {
    console.log(`[Cache] Returning cached data for ${symbol}`);
    return NextResponse.json(cached.data);
  }

  try {
    let peerSymbols: string[] = [];
    
    // 1. Start with user-preferred peers if provided
    if (preferredPeers.length > 0) {
      peerSymbols = [...preferredPeers];
      console.log(`Using ${preferredPeers.length} user-preferred peers:`, preferredPeers);
    }

    // 2. Then check if we have any peers stored in our database
    if (peerSymbols.length === 0) {
      try {
        const { data: peerData, error: peerError } = await supabase
          .from('stock_peers')
          .select('peers, name')
          .eq('symbol', symbol)
          .single();

        if (!peerError && peerData?.peers) {
          peerSymbols = peerData.peers;
        }
      } catch (dbError) {
        console.log("Database peer lookup failed, using fallback method");
      }
    }

    // 3. Try FMP's dedicated stock peers endpoint first
    if (peerSymbols.length === 0) {
      try {
        // First try the dedicated stock peers endpoint
        const stockPeersResponse = await fetch(
          `https://financialmodelingprep.com/api/v4/stock_peers?symbol=${symbol}&apikey=${apiKey}`
        );
        
        if (stockPeersResponse.ok) {
          const stockPeersData = await stockPeersResponse.json();
          if (stockPeersData && stockPeersData.length > 0) {
            // The API returns an array with the first element containing peersList
            const peers = stockPeersData[0]?.peersList || [];
            // Filter out the symbol itself and any variations (e.g., TRMD vs TRMD-A.CO)
            const baseSymbol = symbol.split('.')[0].split('-')[0];
            peerSymbols = peers.filter((peer: string) => {
              const peerBase = peer.split('.')[0].split('-')[0];
              return peerBase !== baseSymbol;
            }).slice(0, 10);
            console.log(`Found ${peerSymbols.length} peers from stock_peers endpoint:`, peerSymbols);
          }
        }
      } catch (error) {
        console.log('Stock peers endpoint failed:', error);
      }
    }
    
    // 4. If still no peers, use enhanced industry/sector matching
    if (peerSymbols.length === 0) {
      try {
        // First, get the company's profile to understand its sector/industry
        const companyProfileResponse = await fetch(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`);
        if (companyProfileResponse.ok) {
          const profileData = await companyProfileResponse.json();
          const companyProfile = profileData[0];
          
          if (companyProfile) {
            const { sector, industry, marketCap } = companyProfile;
            console.log(`Finding peers for ${symbol}: Sector=${sector}, Industry=${industry}, MarketCap=${marketCap}`);
            
            // Enhanced Strategy 1: Find companies in the same industry with better filtering
            if (industry) {
              try {
                // Get more companies to filter from
                const industryResponse = await fetch(
                  `https://financialmodelingprep.com/api/v3/stock-screener?industry=${encodeURIComponent(industry)}&marketCapMoreThan=100000000&limit=50&apikey=${apiKey}`
                );
                if (industryResponse.ok) {
                  const industryData = await industryResponse.json();
                  
                  // Calculate market cap range (0.1x to 10x of target company)
                  const minMarketCap = marketCap * 0.1;
                  const maxMarketCap = marketCap * 10;
                  
                  const industryPeers = industryData
                    .filter((company: any) => company.symbol !== symbol)
                    .filter((company: any) => company.marketCap > minMarketCap && company.marketCap < maxMarketCap)
                    .filter((company: any) => company.volume > 100000) // Ensure liquidity
                    .map((company: any) => ({
                      ...company,
                      marketCapDiff: Math.abs(Math.log(company.marketCap / marketCap)) // Use log scale for better size comparison
                    }))
                    .sort((a: any, b: any) => a.marketCapDiff - b.marketCapDiff)
                    .slice(0, 10)
                    .map((company: any) => company.symbol);
                  
                  peerSymbols.push(...industryPeers);
                  console.log(`Found ${industryPeers.length} industry peers:`, industryPeers);
                }
              } catch (error) {
                console.log('Industry-based peer search failed:', error);
              }
            }
            
            // Enhanced Strategy 2: Sector-based peers with sub-industry consideration
            if (peerSymbols.length < 8 && sector) {
              try {
                const sectorResponse = await fetch(
                  `https://financialmodelingprep.com/api/v3/stock-screener?sector=${encodeURIComponent(sector)}&marketCapMoreThan=100000000&limit=30&apikey=${apiKey}`
                );
                if (sectorResponse.ok) {
                  const sectorData = await sectorResponse.json();
                  
                  // Calculate market cap range
                  const minMarketCap = marketCap * 0.2;
                  const maxMarketCap = marketCap * 5;
                  
                  const sectorPeers = sectorData
                    .filter((company: any) => company.symbol !== symbol)
                    .filter((company: any) => !peerSymbols.includes(company.symbol))
                    .filter((company: any) => company.marketCap > minMarketCap && company.marketCap < maxMarketCap)
                    .filter((company: any) => company.volume > 50000) // Ensure some liquidity
                    .map((company: any) => ({
                      ...company,
                      marketCapDiff: Math.abs(Math.log(company.marketCap / marketCap))
                    }))
                    .sort((a: any, b: any) => a.marketCapDiff - b.marketCapDiff)
                    .slice(0, Math.max(0, 8 - peerSymbols.length))
                    .map((company: any) => company.symbol);
                  
                  peerSymbols.push(...sectorPeers);
                  console.log(`Found ${sectorPeers.length} additional sector peers:`, sectorPeers);
                }
              } catch (error) {
                console.log('Sector-based peer search failed:', error);
              }
            }
          }
        }
      } catch (error) {
        console.log('API-based peer discovery failed:', error);
      }
      
      // Log if no peers found
      if (peerSymbols.length === 0) {
        console.log(`No peers found for ${symbol} through traditional methods`);
        
        // Hardcoded quality peers for major companies when other methods fail
        const fallbackPeers: Record<string, string[]> = {
          'NVDA': ['AMD', 'INTC', 'AVGO', 'QCOM', 'MRVL', 'MU', 'TSM', 'ASML'],
          'AAPL': ['MSFT', 'GOOGL', 'META', 'AMZN', 'SONY', 'DELL', 'HPQ', 'LOGI'],
          'MSFT': ['GOOGL', 'AAPL', 'AMZN', 'META', 'ORCL', 'CRM', 'ADBE', 'IBM'],
          'TSLA': ['GM', 'F', 'RIVN', 'LCID', 'NIO', 'XPEV', 'LI', 'TM'],
          'AMZN': ['WMT', 'TGT', 'COST', 'EBAY', 'SHOP', 'BABA', 'JD', 'PDD'],
        };
        
        if (fallbackPeers[symbol]) {
          peerSymbols = fallbackPeers[symbol];
          console.log(`Using fallback peers for ${symbol}:`, peerSymbols);
        }
        
        // Try Perplexity for peer discovery as last resort
        if (perplexityApiKey) {
          try {
            const mainProfileResponse = await fetch(
              `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`
            );
            const mainProfile = mainProfileResponse.ok ? (await mainProfileResponse.json())[0] : null;
            
            if (mainProfile) {
              const discoveryPrompt = `List the top 5-8 publicly traded competitors of ${mainProfile.companyName} (${symbol}). Consider companies with similar business models, target markets, and products/services. Only include companies traded on major US exchanges. Return ONLY ticker symbols in JSON format: {"peers": ["SYMBOL1", "SYMBOL2"]}`;
              
              const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${perplexityApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'sonar',
                  messages: [
                    {
                      role: 'system',
                      content: 'You are a financial analyst. Provide only valid stock ticker symbols traded on major exchanges. Respond with JSON only.'
                    },
                    {
                      role: 'user',
                      content: discoveryPrompt
                    }
                  ],
                  max_tokens: 100,
                  temperature: 0.1,
                  stream: false
                })
              });
              
              if (perplexityResponse.ok) {
                const perplexityData = await perplexityResponse.json();
                const aiResponse = perplexityData.choices?.[0]?.message?.content?.trim();
                
                if (aiResponse) {
                  try {
                    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                      const discoveredPeers = JSON.parse(jsonMatch[0]);
                      if (discoveredPeers.peers && Array.isArray(discoveredPeers.peers)) {
                        peerSymbols = discoveredPeers.peers
                          .filter((s: any) => s && typeof s === 'string' && s.length <= 5)
                          .filter((s: string) => s !== symbol)
                          .slice(0, 8);
                        console.log(`[Perplexity] Discovered ${peerSymbols.length} peers:`, peerSymbols);
                      }
                    }
                  } catch (parseError) {
                    console.log('[Perplexity] Could not parse discovery response:', parseError);
                  }
                }
              }
            }
          } catch (error) {
            console.log('[Perplexity] Peer discovery failed:', error);
          }
        }
      }
    }
    
    // 5. Use Perplexity AI to analyze and improve peer selection if we have questionable peers
    if (peerSymbols.length > 0 && symbol !== 'AAPL' && symbol !== 'GOOGL') { // Skip for common tech stocks
      try {
        const profileResponse = await fetch(
          `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`
        );
        
        if (profileResponse.ok) {
          const [profile] = await profileResponse.json();
          
          // Analyze peers using Perplexity for luxury goods and other specific sectors
          const shouldAnalyzePeers = profile && (
            profile.sector?.toLowerCase().includes('consumer') ||
            profile.industry?.toLowerCase().includes('luxury') ||
            profile.industry?.toLowerCase().includes('apparel') ||
            profile.companyName?.toLowerCase().includes('lvmh') ||
            profile.companyName?.toLowerCase().includes('hermès') ||
            profile.companyName?.toLowerCase().includes('kering')
          );

          if (shouldAnalyzePeers) {
            console.log(`Analyzing peer quality for ${symbol} using AI...`);
            
            const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
            if (perplexityApiKey) {
              try {
                const analyzeResponse = await fetch('https://api.perplexity.ai/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${perplexityApiKey}`
                  },
                  body: JSON.stringify({
                    model: 'sonar',
                    messages: [
                      {
                        role: 'system',
                        content: 'You are a financial analyst. Provide peer analysis in JSON format only.'
                      },
                      {
                        role: 'user',
                        content: `For ${profile.companyName} (${symbol}), which operates in the ${profile.industry || profile.sector}, identify 8-10 highly relevant public company peers.

Current peers: ${peerSymbols.join(', ')}

Requirements:
- Similar business segments and models
- Comparable market positioning
- Publicly traded with stock symbols
- For luxury companies, focus on luxury peers (Richemont, Kering, Hermès, etc)

Response format:
{
  "recommendedPeers": [
    {"symbol": "TICKER", "name": "Company Name", "reason": "Brief reason"}
  ],
  "analysis": "Brief rationale"
}`
                      }
                    ],
                    temperature: 0.3,
                    max_tokens: 1000
                  })
                });

                if (analyzeResponse.ok) {
                  const data = await analyzeResponse.json();
                  const content = data.choices[0]?.message?.content || '';
                  
                  try {
                    const analysis = JSON.parse(content);
                    if (analysis.recommendedPeers && analysis.recommendedPeers.length > 0) {
                      // Replace with better peers from AI analysis
                      peerSymbols = analysis.recommendedPeers
                        .map((p: any) => p.symbol)
                        .filter((s: string) => s && s !== symbol)
                        .slice(0, 10);
                      console.log(`AI suggested better peers for ${symbol}:`, peerSymbols);
                    }
                  } catch (parseError) {
                    console.error('Failed to parse AI response:', parseError);
                  }
                }
              } catch (error) {
                console.error('Error calling Perplexity API directly:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error analyzing peers with AI:', error);
      }
    }

    // 6. Filter out excluded peers
    if (excludePeers.length > 0) {
      peerSymbols = peerSymbols.filter(peer => !excludePeers.includes(peer));
      console.log(`Filtered out excluded peers. Remaining peers:`, peerSymbols);
    }

    // 5a. Use Perplexity to validate and improve peer selection if explicitly requested
    const validatePeers = searchParams.get('validatePeers') === 'true';
    
    if (validatePeers && perplexityApiKey && peerSymbols.length > 0) {
      console.log('[Perplexity] Validating peer selection');
      try {
        // Get the main company's profile first for context
        const mainProfileResponse = await fetch(
          `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`
        );
        const mainProfile = mainProfileResponse.ok ? (await mainProfileResponse.json())[0] : null;
        
        if (mainProfile) {
          const perplexityPrompt = `Given ${mainProfile.companyName} (${symbol}) which operates in ${mainProfile.industry || mainProfile.sector}, analyze these potential peer companies and:
1. Rank them by business similarity (1-10 scale)
2. Suggest any missing major competitors
3. Identify any that should be excluded

Current peers: ${peerSymbols.join(', ')}

Provide response in JSON format:
{
  "rankings": {"SYMBOL": score},
  "suggested": ["SYMBOL1", "SYMBOL2"],
  "exclude": ["SYMBOL3"]
}`;

          const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${perplexityApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'sonar',
              messages: [
                {
                  role: 'system',
                  content: 'You are a financial analyst expert. Analyze competitor relationships based on business models, markets, and products. Always respond with valid JSON only.'
                },
                {
                  role: 'user',
                  content: perplexityPrompt
                }
              ],
              max_tokens: 200,
              temperature: 0.1,
              stream: false
            })
          });

          if (perplexityResponse.ok) {
            const perplexityData = await perplexityResponse.json();
            const aiResponse = perplexityData.choices?.[0]?.message?.content?.trim();
            
            if (aiResponse) {
              try {
                // Extract JSON from the response
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const peerAnalysis = JSON.parse(jsonMatch[0]);
                  console.log('[Perplexity] Peer analysis:', peerAnalysis);
                  
                  // Filter peers based on rankings (keep score >= 5)
                  if (peerAnalysis.rankings) {
                    peerSymbols = peerSymbols.filter(peer => 
                      (peerAnalysis.rankings[peer] || 0) >= 5
                    );
                  }
                  
                  // Add suggested peers
                  if (peerAnalysis.suggested && Array.isArray(peerAnalysis.suggested)) {
                    const validSuggestions = peerAnalysis.suggested
                      .filter((s: any) => s && typeof s === 'string' && s.length <= 5)
                      .filter((s: string) => !peerSymbols.includes(s) && s !== symbol);
                    peerSymbols.push(...validSuggestions);
                  }
                  
                  // Remove excluded peers
                  if (peerAnalysis.exclude && Array.isArray(peerAnalysis.exclude)) {
                    peerSymbols = peerSymbols.filter(peer => 
                      !peerAnalysis.exclude.includes(peer)
                    );
                  }
                  
                  console.log('[Perplexity] Refined peers:', peerSymbols);
                }
              } catch (parseError) {
                console.log('[Perplexity] Could not parse AI response:', parseError);
              }
            }
          }
        }
      } catch (error) {
        console.log('[Perplexity] Peer validation failed:', error);
      }
    }

    // 6. Get company profiles for the symbol and its peers
    const allSymbols = Array.from(new Set([symbol, ...peerSymbols, ...additionalTickers]
      .filter(s => !excludePeers.includes(s) || s === symbol))); // Don't exclude the main symbol

    console.log(`Fetching data for ${allSymbols.length} companies: ${allSymbols.join(', ')}`);

    // Fetch all data in parallel instead of sequentially
    const [
      companyProfiles,
      keyMetricsResults,
      ratiosResults,
      incomeResults,
      segmentResults,
      estimatesResults,
      balanceResults // Added balance sheets
    ] = await Promise.all([
      // Company profiles
      Promise.all(allSymbols.map(async (sym) => {
        try {
          const response = await fetch(`https://financialmodelingprep.com/api/v3/profile/${sym}?apikey=${apiKey}`);
          if (!response.ok) return null;
          const data = await response.json();
          return data[0];
        } catch {
          return null;
        }
      })),
      
      // Key metrics
      Promise.all(allSymbols.map(async (sym) => {
        try {
          const response = await fetch(`https://financialmodelingprep.com/api/v3/key-metrics-ttm/${sym}?apikey=${apiKey}`);
          if (!response.ok) return null;
          const data = await response.json();
          return data[0];
        } catch {
          return null;
        }
      })),
      
      // Financial ratios
      Promise.all(allSymbols.map(async (sym) => {
        try {
          const response = await fetch(`https://financialmodelingprep.com/api/v3/ratios-ttm/${sym}?apikey=${apiKey}`);
          if (!response.ok) return null;
          const data = await response.json();
          return data[0];
        } catch {
          return null;
        }
      })),
      
      // Income statements (fetch enough periods to infer frequency)
      Promise.all(allSymbols.map(async (sym) => {
        try {
          const response = await fetch(`https://financialmodelingprep.com/api/v3/income-statement/${sym}?period=quarter&limit=12&apikey=${apiKey}`);
          if (!response.ok) return null;
          const data = await response.json();
          return data;
        } catch {
          return null;
        }
      })),
      
      // Balance sheets (for net debt fallback)
      Promise.all(allSymbols.map(async (sym) => {
        try {
          const response = await fetch(`https://financialmodelingprep.com/api/v3/balance-sheet-statement/${sym}?period=quarter&limit=4&apikey=${apiKey}`);
          if (!response.ok) return null;
          const data = await response.json();
          return data;
        } catch {
          return null;
        }
      })),
      
      // Segment data (both geographic and product)
      Promise.all(allSymbols.map(async (sym) => {
        try {
          const [segmentResponse, geoResponse] = await Promise.all([
            fetch(`https://financialmodelingprep.com/api/v4/revenue-product-segmentation?symbol=${sym}&structure=flat&period=annual&apikey=${apiKey}`),
            fetch(`https://financialmodelingprep.com/api/v4/revenue-geographic-segmentation?symbol=${sym}&structure=flat&period=annual&apikey=${apiKey}`)
          ]);
          
          let segmentData = segmentResponse.ok ? await segmentResponse.json() : null;
          let geoData = geoResponse.ok ? await geoResponse.json() : null;

          // Helper to check if payload appears empty/useless
          const isEmptyPayload = (d: any): boolean => {
            if (!d) return true;
            if (Array.isArray(d) && d.length === 0) return true;
            if (Array.isArray(d) && d.length > 0) {
              // if first entry is an object with date key but no numerics
              const first = d[0];
              if (first && typeof first === 'object') {
                const dateKey = Object.keys(first)[0];
                const inner = first[dateKey];
                if (inner && typeof inner === 'object') {
                  const hasNumeric = Object.values(inner).some((v: any) => typeof v === 'number' || (typeof v === 'string' && /%|\d/.test(v)));
                  return !hasNumeric;
                }
              }
            }
            return false;
          };

          // Fallback: retry with base symbol without suffix (e.g., KER.PA -> KER)
          if (isEmptyPayload(segmentData) && isEmptyPayload(geoData)) {
            const base = sym.split('.')[0].split('-')[0];
            if (base && base !== sym) {
              const [seg2, geo2] = await Promise.all([
                fetch(`https://financialmodelingprep.com/api/v4/revenue-product-segmentation?symbol=${base}&structure=flat&period=annual&apikey=${apiKey}`),
                fetch(`https://financialmodelingprep.com/api/v4/revenue-geographic-segmentation?symbol=${base}&structure=flat&period=annual&apikey=${apiKey}`)
              ]);
              if (seg2.ok) segmentData = await seg2.json();
              if (geo2.ok) geoData = await geo2.json();
            }
          }
          
          return {
            product: segmentData,
            geographic: geoData
          };
        } catch (error) {
          console.log(`Failed to fetch segment data for ${sym}:`, error);
          return { geographic: null, product: null };
        }
      })),
      
      // Analyst estimates (annual) for forward metrics
      Promise.all(allSymbols.map(async (sym) => {
        try {
          const response = await fetch(`https://financialmodelingprep.com/api/v3/analyst-estimates/${sym}?period=annual&limit=6&apikey=${apiKey}`);
          if (!response.ok) return null;
          const data = await response.json();
          return Array.isArray(data) ? data : null;
        } catch {
          return null;
        }
      }))
    ]);

    // Process all descriptions with Perplexity in a single batch if available
    let processedDescriptions: { [key: string]: string } = {};
    
    if (usePerplexity && companyProfiles.some(p => p?.description)) {
      console.log('[Perplexity] Processing descriptions in batch');
      try {
        // Create a batch prompt for all companies
        const companiesToProcess = companyProfiles
          .filter(p => p && p.description && p.description !== 'No description available')
          .slice(0, 10); // Limit to 10 to avoid token limits
        
        const batchPrompt = `Process these company descriptions into concise summaries (under 120 chars each). Format as JSON: {"SYMBOL": "description"}

${companiesToProcess.map(p => `${p.symbol}: ${p.description.substring(0, 200)}`).join('\n\n')}`;

        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'sonar',
            messages: [
              {
                role: 'system',
                content: 'You are a financial analyst. Create concise company descriptions under 120 characters each. Focus on core products/services and key markets. Output valid JSON only.'
              },
              {
                role: 'user',
                content: batchPrompt
              }
            ],
            max_tokens: 500,
            temperature: 0.1,
            stream: false
          })
        });

        if (perplexityResponse.ok) {
          const perplexityData = await perplexityResponse.json();
          const aiResponse = perplexityData.choices?.[0]?.message?.content?.trim();
          
          if (aiResponse) {
            try {
              const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const descriptions = JSON.parse(jsonMatch[0]);
                // Remove citation markers
                Object.keys(descriptions).forEach(key => {
                  if (typeof descriptions[key] === 'string') {
                    processedDescriptions[key] = descriptions[key].replace(/\[\d+\]/g, '').trim();
                  }
                });
                console.log('[Perplexity] Successfully processed batch descriptions');
              }
            } catch (parseError) {
              console.log('[Perplexity] Could not parse batch response:', parseError);
            }
          }
        }
      } catch (error) {
        console.log('[Perplexity] Batch processing failed:', error);
      }
    }

    // 4. Format competitors data
    const competitors = companyProfiles
      .filter(Boolean)
      .filter((profile) => profile.symbol !== symbol)
      .map((profile) => ({
        id: profile.symbol,
        name: profile.companyName,
        symbol: profile.symbol,
      }));

    // 5. Fetch key metrics for all companies (includes valuation metrics)
    // FX normalization map (approx; replace with live rates if needed)
    const fxToUSD: Record<string, number> = {
      USD: 1,
      EUR: 1.08,
      GBP: 1.28,
      JPY: 0.0062,
      CNY: 0.14,
      HKD: 0.13,
      CHF: 1.12,
      SEK: 0.095,
      NOK: 0.095,
      DKK: 0.145,
      AUD: 0.67,
      CAD: 0.73,
      NZD: 0.61,
      INR: 0.012,
      KRW: 0.00073,
      TWD: 0.031,
      SGD: 0.74,
      ZAR: 0.055,
      MXN: 0.056,
      BRL: 0.18,
      RUB: 0.011,
      TRY: 0.030,
      PLN: 0.26,
      CZK: 0.044,
      HUF: 0.0027,
      ILS: 0.27,
      SAR: 0.27,
      AED: 0.27,
      THB: 0.027,
      MYR: 0.22,
      PHP: 0.017,
      IDR: 0.000061,
      VND: 0.000039,
      ZWL: 0.003
    };
    // Currency symbol map for consistency in UI wherever needed
    const currencySymbolMap: Record<string, string> = {
      USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', CNH: '¥', HKD: 'HK$',
      AUD: 'A$', CAD: 'C$', NZD: 'NZ$', SGD: 'S$', TWD: 'NT$', KRW: '₩', INR: '₹',
      CHF: 'CHF', SEK: 'kr', NOK: 'kr', DKK: 'kr', ZAR: 'R', BRL: 'R$', MXN: 'MX$',
      RUB: '₽', TRY: '₺', PLN: 'zł', CZK: 'Kč', HUF: 'Ft', ILS: '₪', SAR: '﷼', AED: 'د.إ',
      THB: '฿', MYR: 'RM', PHP: '₱', IDR: 'Rp', VND: '₫'
    };

    const valuationData = allSymbols.map((sym, index) => {
      const metrics = keyMetricsResults[index];
      const ratios = ratiosResults[index];
      const profile = companyProfiles.find((p) => p?.symbol === sym);
      const company = profile?.companyName || sym;
      const sector = profile?.sector || 'N/A';
      const price = Number(profile?.price) || 0;
      const reportedCurrency = String((profile as any)?.currency || 'USD').toUpperCase();
      const toUSD = fxToUSD[reportedCurrency] ?? 1;

      // Current capital structure: prefer profile.mktCap (more reliable) and fall back to metrics
      const marketCapRaw = Number((profile as any)?.mktCap ?? metrics?.marketCapTTM ?? 0);
      let netDebtRaw = Number(metrics?.netDebtTTM || 0);
      // Fallback: compute from latest balance sheet if TTM metric missing
      if (!netDebtRaw || !Number.isFinite(netDebtRaw)) {
        const bs = balanceResults[index];
        const rows = Array.isArray(bs) ? bs : [];
        if (rows.length > 0) {
          const latest = rows[0] as any;
          if (latest && typeof latest === 'object') {
            const totalDebt = Number((latest.totalDebt ?? (Number(latest.shortTermDebt || 0) + Number(latest.longTermDebt || 0))) || 0);
            const cash = Number(((latest.cashAndCashEquivalents ?? latest.cashAndShortTermInvestments) ?? latest.cashAndMarketableSecurities) ?? 0);
            netDebtRaw = totalDebt - cash; // allow negative (net cash)
          }
        }
      }
      const enterpriseValueRaw = Number(metrics?.enterpriseValueTTM || (marketCapRaw + netDebtRaw));
      const marketCap = marketCapRaw * toUSD;
      const netDebt = netDebtRaw * toUSD;
      const enterpriseValue = enterpriseValueRaw * toUSD;

      // LTM construction from income statements
      const stmts = incomeResults[index] as any[] | null;
      let ltmRevenue = 0;
      let ltmEbitda = 0;
      let ltmNetIncome = 0;
      let sharesOutstanding = Number(metrics?.sharesOutstanding || 0);
      if (Array.isArray(stmts) && stmts.length > 0) {
        // Sort by date desc
        const sorted = [...stmts].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        // Determine reporting frequency by average number of statements per fiscal year
        const byYear: Record<string, number> = {};
        sorted.forEach((s: any) => {
          const y = String(new Date(s.date).getFullYear());
          byYear[y] = (byYear[y] || 0) + 1;
        });
        const yearCounts = Object.values(byYear);
        const avgPerYear = yearCounts.length > 0 ? yearCounts.reduce((a, b) => a + b, 0) / yearCounts.length : 0;
        const freq = avgPerYear >= 3.5 ? 'quarterly' : avgPerYear >= 1.5 ? 'semiannual' : 'annual';
        const periodsNeeded = freq === 'quarterly' ? 4 : freq === 'semiannual' ? 2 : 1;

        const take = Math.min(periodsNeeded, sorted.length);
        for (let i = 0; i < take; i++) {
          const s = sorted[i] || {};
          const revenueVal = Number(s.revenue || 0);
          const ebitdaVal = Number(s.ebitda || 0);
          const netIncomeVal = Number(s.netIncome || 0);
          ltmRevenue += revenueVal;
          ltmEbitda += ebitdaVal;
          ltmNetIncome += netIncomeVal;
          if (!sharesOutstanding) {
            sharesOutstanding = Number(s.weightedAverageShsOutDil || s.weightedAverageShsOut || 0) || sharesOutstanding;
          }
        }
      }
      // Normalize LTM denominators to USD using the same FX factor
      ltmRevenue = ltmRevenue * toUSD;
      ltmEbitda = ltmEbitda * toUSD;
      ltmNetIncome = ltmNetIncome * toUSD;
      // Safe guards and fallbacks when quarterly parse failed
      const ltmEbitdaMargin = ltmRevenue > 0 ? ltmEbitda / ltmRevenue : 0;

      // LTM multiples computed from EV/MC
      const ltmEvToEbitda = ltmEbitda > 0 ? enterpriseValue / ltmEbitda : (ratios?.enterpriseValueMultipleTTM || 0);
      const ltmPriceToSales = ltmRevenue > 0 ? marketCap / ltmRevenue : (ratios?.priceToSalesRatioTTM || 0);
      const ltmPeRatio = ltmNetIncome !== 0 ? marketCap / ltmNetIncome : (ratios?.priceEarningsRatioTTM || 0);

      // Forward estimates
      const estimatesArr = estimatesResults[index] as any[] | null;
      let estRevenue = 0;
      let estEps = 0;
      let estEbitda = 0;
      if (Array.isArray(estimatesArr) && estimatesArr.length > 0) {
        // Choose the nearest future annual estimate (first element is usually nearest)
        const future = estimatesArr.find((e) => e?.period?.toLowerCase() === 'annual');
        const chosen = future || estimatesArr[0];
        estRevenue = Number(chosen?.estimatedRevenueAvg || chosen?.revenueEstimatedAvg || 0);
        estEps = Number(chosen?.estimatedEpsAvg || chosen?.epsEstimatedAvg || 0);
        estEbitda = Number(chosen?.estimatedEbitdaAvg || 0);
      }
      if (!estEbitda && estRevenue > 0 && ltmEbitdaMargin > 0) {
        estEbitda = estRevenue * ltmEbitdaMargin;
      }
      // Normalize forward denominators to USD
      estRevenue = estRevenue * toUSD;
      estEbitda = estEbitda * toUSD;

      // Forward multiples from current EV / MC
      const fwdPriceToSales = estRevenue > 0 ? marketCap / estRevenue : 0;
      const fwdEvToEbitda = estEbitda > 0 ? enterpriseValue / estEbitda : 0;
      let fwdPeRatio = 0;
      if (estEps > 0) {
        if (price > 0) {
          fwdPeRatio = price / estEps;
        } else if (sharesOutstanding > 0) {
          // Convert EPS to USD for consistency with USD market cap
          fwdPeRatio = marketCap / (estEps * toUSD * sharesOutstanding);
        }
      }
      // Normalize any pathological values
      const safeFwdPS = isFinite(fwdPriceToSales) && fwdPriceToSales >= 0 ? fwdPriceToSales : 0;
      const safeFwdEVEBITDA = isFinite(fwdEvToEbitda) && fwdEvToEbitda >= 0 ? fwdEvToEbitda : 0;
      const safeFwdPE = isFinite(fwdPeRatio) && fwdPeRatio >= 0 ? fwdPeRatio : 0;

      // Dividend yield fallback chain
      const dyRatios = normalizePercentage((ratios as any)?.dividendYieldPercentageTTM ?? (ratios as any)?.dividendYieldTTM ?? 0);
      const dyMetrics = normalizePercentage((metrics as any)?.dividendYieldTTM ?? (metrics as any)?.dividendYieldPercentageTTM ?? 0);
      const dps = Number((metrics as any)?.dividendPerShareTTM ?? 0);
      const dyFromDps = price > 0 && dps > 0 ? (dps / price) * 100 : 0;
      const dividendYieldResolved = dyRatios || dyMetrics || dyFromDps || 0;

      return {
        ticker: sym,
        company,
        sector,
        marketCap,
        netDebt,
        enterpriseValue,
        // LTM
        ltmEvToEbitda,
        ltmPeRatio,
        ltmPriceToSales,
        // Forward
        fwdEvToEbitda: safeFwdEVEBITDA,
        fwdPeRatio: safeFwdPE,
        fwdPriceToSales: safeFwdPS,
        // Other
        priceToBook: ratios?.priceToBookRatioTTM || 0,
        dividendYield: dividendYieldResolved,
        // Legacy (kept for compatibility)
        evToEbitda: ltmEvToEbitda,
        peRatio: ltmPeRatio,
        priceToSales: ltmPriceToSales,
      };
    }).filter((data) => data.marketCap > 0);

    // 7. Fetch income statements for performance metrics
    const performanceData = allSymbols.map((sym, index) => {
      const statements = incomeResults[index];
      const profile = companyProfiles.find((p) => p?.symbol === sym);
      const company = profile?.companyName || sym;
      const sector = profile?.sector || 'N/A';

      if (!statements || statements.length < 2) {
        return {
          ticker: sym,
          company,
          sector,
          revenueGrowth: 0,
          grossMargin: 0,
          operatingMargin: 0,
          netMargin: 0,
          roic: 0,
          roe: 0,
          ebitdaMargin: 0,
        };
      }

      const current = statements[0];
      const previous = statements[1];
      const revenueGrowth = ((current.revenue - previous.revenue) / previous.revenue) * 100;

      return {
        ticker: sym,
        company,
        sector,
        revenueGrowth,
        grossMargin: (current.grossProfitRatio || 0) * 100,
        operatingMargin: (current.operatingIncomeRatio || 0) * 100,
        netMargin: (current.netIncomeRatio || 0) * 100,
        roic: normalizePercentage(ratiosResults[index]?.returnOnInvestedCapitalTTM),
        roe: normalizePercentage(ratiosResults[index]?.returnOnEquityTTM),
        ebitdaMargin: (current.ebitdaratio || 0) * 100,
      };
    }).filter((data) => data.grossMargin !== 0); // Filter out companies with no data

    // 8. Process qualitative data
    // First, process all companies without making Perplexity calls
    const preliminaryQualitativeData = allSymbols.map((sym, index) => {
      const profile = companyProfiles.find((p) => p?.symbol === sym);
      const segments = segmentResults[index];
      console.log(`[Segments] Raw segment data for ${sym}:`, JSON.stringify(segments).substring(0, 200));
      
      if (!profile) {
        return {
          ticker: sym,
          company: sym,
          description: 'Company information not available',
          country: 'N/A',
          geographicMix: 'N/A',
          segmentMix: 'N/A',
          needsSegmentData: false
        };
      }

      // Process geographic mix from FMP data
      let geographicMix = 'N/A';
      console.log(`[Segments] Processing geographic data for ${sym}:`, typeof segments.geographic, Array.isArray(segments.geographic) ? 'array' : 'not array');
      
      if (segments.geographic) {
        try {
          let latestGeo = null;
          
          // Handle FMP API response format
          if (Array.isArray(segments.geographic) && segments.geographic.length > 0) {
            // FMP returns array of objects with date keys
            const firstItem = segments.geographic[0];
            if (firstItem && typeof firstItem === 'object') {
              // Get the date key from the first item
              const dateKey = Object.keys(firstItem)[0];
              latestGeo = firstItem[dateKey];
            }
          }
          
          console.log(`[Segments] Geographic data for ${sym}:`, JSON.stringify(latestGeo));
          
          if (!latestGeo) {
            console.log(`[Segments] No geographic data found for ${sym}`);
          } else {
          
          // FMP returns data in various formats, let's handle them
          let geoEntries: Array<{region: string, revenue: number}> = [];
          
          // Normalization helper for region keys
          const normalizeRegionName = (rawKey: string): string => {
            // local shadowed impl removed in favor of global helper
            return rawKey;
          };
          
          // Extract all numeric values that look like revenue
          Object.entries(latestGeo).forEach(([key, value]) => {
            if (typeof value === 'number' && value > 0 && key !== 'date' && !key.includes('period')) {
              const mappedRegion = key;
              geoEntries.push({
                region: mappedRegion,
                revenue: value
              });
            }
          });
          
          // Sort by revenue descending
          geoEntries.sort((a, b) => b.revenue - a.revenue);
          
          const totalRevenue = geoEntries.reduce((sum, item) => sum + item.revenue, 0);
          
          if (totalRevenue > 0 && geoEntries.length > 0) {
            // Take top 3 regions and calculate percentages
            const topRegions = geoEntries.slice(0, 3);
            const formattedRegions = topRegions.map(item => {
              const percentage = Math.round((item.revenue / totalRevenue) * 100);
              return `${item.region} ${percentage}%`;
            });
            
            // Add "Other" if there are more regions
            if (geoEntries.length > 3) {
              const otherRevenue = geoEntries.slice(3).reduce((sum, item) => sum + item.revenue, 0);
              const otherPercentage = Math.round((otherRevenue / totalRevenue) * 100);
              if (otherPercentage > 0) {
                formattedRegions.push(`Other ${otherPercentage}%`);
              }
            }
            
            geographicMix = formattedRegions.join(', ');

          }
          }  // Close the else block
        } catch (error) {
          console.log(`Error processing geographic data for ${sym}:`, error);
        }
      }

      // Fallback: robust scan if still N/A
      if (geographicMix === 'N/A') {
        try {
          geographicMix = deriveGeographicMixFromAny(segments.geographic);
        } catch {}
      }

      // Process segment/product mix from FMP data
      let segmentMix = 'N/A';
      if (segments.product) {
        try {
          let latestProduct = null;
          
          // Handle FMP API response format
          if (Array.isArray(segments.product) && segments.product.length > 0) {
            // FMP returns array of objects with date keys
            const firstItem = segments.product[0];
            if (firstItem && typeof firstItem === 'object') {
              // Get the date key from the first item
              const dateKey = Object.keys(firstItem)[0];
              latestProduct = firstItem[dateKey];
            }
          }
          
          console.log(`[Segments] Product data for ${sym}:`, JSON.stringify(latestProduct));
          
          if (!latestProduct) {
            console.log(`[Segments] No product data found for ${sym}`);
          } else {
          
          // FMP returns product data in various formats
          let productEntries: Array<{product: string, revenue: number}> = [];
          
          // Extended mapping for common product/segment names
          const productKeyMappings: { [key: string]: string } = {
            // Tech products
            'dataCenter': 'Data Center',
            'Data Center': 'Data Center',
            'gaming': 'Gaming',
            'Gaming': 'Gaming',
            'professionalVisualization': 'Pro Visualization',
            'automotive': 'Automotive',
            'Automotive': 'Automotive',
            'oem': 'OEM',
            'OEM & IP': 'OEM & IP',
            
            // Cloud/Software
            'cloud': 'Cloud',
            'Cloud': 'Cloud',
            'Google Cloud': 'Cloud',
            'enterprise': 'Enterprise',
            'Enterprise': 'Enterprise',
            'consumer': 'Consumer',
            'Consumer': 'Consumer',
            
            // Devices
            'iphone': 'iPhone',
            'iPhone': 'iPhone',
            'mac': 'Mac',
            'Mac': 'Mac',
            'ipad': 'iPad',
            'iPad': 'iPad',
            'wearables': 'Wearables',
            'Wearables, Home and Accessories': 'Wearables & Other',
            
            // Services/Software
            'services': 'Services',
            'Services': 'Services',
            'productivity': 'Productivity',
            'Productivity and Business Processes': 'Productivity',
            'intelligentCloud': 'Intelligent Cloud',
            'Intelligent Cloud': 'Cloud',
            'personalComputing': 'Personal Computing',
            'More Personal Computing': 'Personal Computing',
            'devices': 'Devices',
            'software': 'Software',
            
            // Google specific
            'Google Search & Other': 'Search & Other',
            'YouTube Ads': 'YouTube',
            'Google Network': 'Network',
            'Google Subscriptions, Platforms, And Devices': 'Subscriptions & Devices',
            'Other Bets': 'Other Bets',
            
            // Meta specific
            'Family of Apps': 'Family of Apps',
            'Reality Labs': 'Reality Labs',
            
            // Generic
            'Reportable Segment': 'Core Business',
            'Communications Segment': 'Communications',
            'Online Marketing Services': 'Marketing Services',
            'Product and Service, Other': 'Other Products'
          };
          
          // Extract all numeric values that look like revenue
          Object.entries(latestProduct).forEach(([key, value]) => {
            if (typeof value === 'number' && value > 0 && key !== 'date' && !key.includes('period')) {
              // Try to find a mapping for the key
              const mappedProduct = productKeyMappings[key] || key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
              productEntries.push({
                product: mappedProduct,
                revenue: value
              });
            }
          });
          
          // Sort by revenue descending
          productEntries.sort((a, b) => b.revenue - a.revenue);
          
          const totalRevenue = productEntries.reduce((sum, item) => sum + item.revenue, 0);
          
          if (totalRevenue > 0 && productEntries.length > 0) {
            // Take top 3 segments and calculate percentages
            const topSegments = productEntries.slice(0, 3);
            const formattedSegments = topSegments.map(item => {
              const percentage = Math.round((item.revenue / totalRevenue) * 100);
              return `${item.product} ${percentage}%`;
            });
            
            // Add "Other" if there are more segments
            if (productEntries.length > 3) {
              const otherRevenue = productEntries.slice(3).reduce((sum, item) => sum + item.revenue, 0);
              const otherPercentage = Math.round((otherRevenue / totalRevenue) * 100);
              if (otherPercentage > 0) {
                formattedSegments.push(`Other ${otherPercentage}%`);
              }
            }
            
            segmentMix = formattedSegments.join(', ');

          }
          }  // Close the else block
        } catch (error) {
          console.log(`Error processing product segment data for ${sym}:`, error);
        }
      }

      // Fallback: robust scan if still N/A
      if (segmentMix === 'N/A') {
        try {
          segmentMix = deriveSegmentMixFromAny(segments.product);
        } catch {}
      }

      let description = profile.description || 'No description available';
      
      // Use batch processed description if available
      if (processedDescriptions[sym]) {
        description = processedDescriptions[sym];
      } else if (description && description !== 'No description available') {
        // Process the description locally
        description = extractKeyInfo(description);
      }

      const result = {
        ticker: sym,
        company: profile.companyName,
        description,
        country: getFullCountryName(profile.country || 'N/A'),
        geographicMix,
        segmentMix,
        needsSegmentData: (geographicMix === 'N/A' || segmentMix === 'N/A') && profile.description
      };
      

      
      return result;
    });

    // Batch process segment data for companies that need it
    const companiesNeedingSegments = preliminaryQualitativeData.filter(d => d && d.needsSegmentData);
    
    if (companiesNeedingSegments.length > 0 && perplexityApiKey) {
      try {
        console.log(`[Perplexity] Fetching segment data for ${companiesNeedingSegments.length} companies`);
        
        const batchSegmentPrompt = `Extract revenue breakdown for these companies. Return JSON format:
{
  "SYMBOL1": {"geographic": ["US 40%", "Europe 30%", "Asia 20%"], "segments": ["Cloud 50%", "Software 30%", "Hardware 20%"]},
  "SYMBOL2": {"geographic": ["Japan 90%", "Other 10%"], "segments": ["Gaming 60%", "Network 40%"]}
}

Companies:
${companiesNeedingSegments.map(c => {
  if (!c) return '';
  const profile = companyProfiles.find(p => p?.symbol === c.ticker);
  return `${c.ticker}: ${profile?.description?.substring(0, 200) || ''}`;
}).filter(Boolean).join('\n\n')}

Keep region/segment names short. Always include percentages. Focus on major regions/segments only (top 3-4). Use empty arrays if not available.`;

        const segmentResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'sonar',
            messages: [
              {
                role: 'system',
                content: 'You are a financial analyst. Extract revenue breakdown from company descriptions. Return valid JSON only.'
              },
              {
                role: 'user',
                content: batchSegmentPrompt
              }
            ],
            max_tokens: 500,
            temperature: 0.1,
            stream: false
          })
        });

        if (segmentResponse.ok) {
          const perplexityData = await segmentResponse.json();
          const aiResponse = perplexityData.choices?.[0]?.message?.content?.trim();
          
          if (aiResponse) {
            try {
              const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const segmentData = JSON.parse(jsonMatch[0]);
                console.log('[Perplexity] Successfully extracted segment data');
                
                // Update preliminary data with Perplexity results
                preliminaryQualitativeData.forEach(data => {
                  if (data && data.needsSegmentData && segmentData[data.ticker]) {
                    const segments = segmentData[data.ticker];
                    
                    if (segments.geographic && Array.isArray(segments.geographic) && segments.geographic.length > 0) {
                      data.geographicMix = segments.geographic.slice(0, 3).join(', ');
                    }
                    
                    if (segments.segments && Array.isArray(segments.segments) && segments.segments.length > 0) {
                      data.segmentMix = segments.segments.slice(0, 3).join(', ');
                    }
                  }
                });
              }
            } catch (parseError) {
              console.log('[Perplexity] Could not parse batch segment response:', parseError);
            }
          }
        }
      } catch (error) {
        console.log('[Perplexity] Batch segment extraction failed:', error);
      }
    }

    // Clean up the needsSegmentData flag and finalize data
    const qualitativeData = preliminaryQualitativeData.map(data => {
      if (!data) return null;
      const { needsSegmentData, ...cleanData } = data;
      return cleanData;
    }).filter((data): data is NonNullable<typeof data> => data !== null);

    // If we mapped a foreign symbol, make sure to update the subject company's ticker
    if (originalSymbol !== symbol) {
      valuationData.forEach(item => {
        if (item.ticker === symbol) {
          item.ticker = originalSymbol;
        }
      });
      performanceData.forEach(item => {
        if (item.ticker === symbol) {
          item.ticker = originalSymbol;
        }
      });
      qualitativeData.forEach(item => {
        if (item.ticker === symbol) {
          item.ticker = originalSymbol;
        }
      });
    }

    const responseData = {
      peerCompanies: competitors,
      peerValuationData: valuationData,
      peerPerformanceData: performanceData,
      peerQualitativeData: qualitativeData
    };

    responseCache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error analyzing competitors:", error);
    return NextResponse.json(
      { error: "Failed to analyze competitors", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 
import { NextResponse } from "next/server";

// Define primary exchange mappings by region
const PRIMARY_EXCHANGES_BY_REGION = {
  // North America
  US: ['NYSE', 'NASDAQ', 'AMEX'],
  CA: ['TSX', 'TSX-V'],
  
  // Asia
  CN: ['SSE', 'SZSE', 'HKEX'], // China/Hong Kong
  HK: ['HKEX'],
  JP: ['TSE', 'JPX'],
  KR: ['KRX', 'KOSDAQ'],
  TW: ['TWSE'],
  IN: ['NSE', 'BSE'],
  SG: ['SGX'],
  
  // Europe
  GB: ['LSE', 'AIM'],
  DE: ['XETRA', 'FRA', 'ETR'],
  FR: ['PAR', 'EPA'],
  CH: ['SIX', 'SWX'],
  NL: ['AMS'],
  IT: ['MIL'],
  ES: ['BME', 'MC'],
  SE: ['STO'],
  NO: ['OSE'],
  
  // Oceania
  AU: ['ASX'],
  NZ: ['NZX'],
};

// Replace with enhanced patterns:
// Known company origin patterns
const COMPANY_ORIGIN_PATTERNS = {
  // Hong Kong/China companies often have "China" in name
  HK: [/\bchina\b/i, /\bhong\s*kong\b/i, /\b(holdings?|group)\s+ltd\.?$/i],
  CN: [/\bchina\b/i, /\bchinese\b/i],
  
  // Japanese companies
  JP: [/\bjapan\b/i, /\b(kabushiki|kaisha|k\.k\.|co\.?\s*ltd\.?)\s*$/i],
  
  // Korean companies
  KR: [/\bkorea\b/i, /\bkorean\b/i, /\bsamsung\b/i, /\bhyundai\b/i, /\blg\b/i],
  
  // Swiss companies
  CH: [/\bswiss\b/i, /\bswitzerland\b/i, /\bnestle\b/i, /\bnovartis\b/i, /\broche\b/i],
  
  // German companies
  DE: [/\b(gmbh|ag|se)\s*$/i, /\bgermany\b/i, /\bgerman\b/i],
  
  // UK companies
  GB: [/\bplc\s*$/i, /\b(uk|britain|british)\b/i],
  
  // French companies
  FR: [/\b(sa|sas)\s*$/i, /\bfrance\b/i, /\bfrench\b/i],
  
  // Dutch companies
  NL: [/\b(nv|bv)\s*$/i, /\bnetherlands\b/i, /\bdutch\b/i],
  
  // US companies
  US: [/\b(inc\.?|corp\.?|corporation|company)\s*$/i, /\bamerican?\b/i, /\bu\.?s\.?\b/i],
};

// Exchange suffix to country mapping
const EXCHANGE_SUFFIX_TO_COUNTRY: Record<string, string> = {
  // Hong Kong
  'HK': 'HK',
  
  // Japan
  'T': 'JP',
  
  // Germany
  'F': 'DE',
  'DE': 'DE',
  'ETR': 'DE',
  
  // UK
  'L': 'GB',
  
  // France
  'PA': 'FR',
  
  // Canada
  'TO': 'CA',
  'V': 'CA',
  
  // Australia
  'AX': 'AU',
  
  // Mexico
  'MX': 'MX',
  
  // Singapore
  'SI': 'SG',
  
  // Korea
  'KS': 'KR',
  'KQ': 'KR',
};

function detectCompanyOrigin(name: string, symbol: string, country?: string): string | null {
  // First check explicit country if provided
  if (country) {
    return country;
  }
  
  // Check symbol suffix
  const suffix = symbol.includes('.') ? symbol.split('.').pop() : null;
  if (suffix && EXCHANGE_SUFFIX_TO_COUNTRY[suffix]) {
    return EXCHANGE_SUFFIX_TO_COUNTRY[suffix];
  }
  
  // Check name patterns
  for (const [countryCode, patterns] of Object.entries(COMPANY_ORIGIN_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(name))) {
      return countryCode;
    }
  }
  
  return null;
}

// Replace with enhanced version:
function isPrimaryExchangeForCompany(exchange: string, companyOrigin: string | null): boolean {
  if (!companyOrigin) return false;
  
  // Normalize exchange names to handle variations
  const normalizedExchange = exchange.toUpperCase();
  
  // Map variations to standard names
  const exchangeVariations: Record<string, string> = {
    'HKSE': 'HKEX',
    'HKG': 'HKEX',
    'FRA': 'XETRA',
    'ETR': 'XETRA',
    'TYO': 'TSE',
    'T': 'TSE',
    'EPA': 'PAR',
    'MCE': 'BME',
    'MC': 'BME',
    'KSC': 'KRX',
    'KS': 'KRX',
    'KQ': 'KOSDAQ',
  };
  
  const standardExchange = exchangeVariations[normalizedExchange] || normalizedExchange;
  
  const primaryExchanges = PRIMARY_EXCHANGES_BY_REGION[companyOrigin as keyof typeof PRIMARY_EXCHANGES_BY_REGION];
  return primaryExchanges ? primaryExchanges.some(ex => ex.toUpperCase() === standardExchange) : false;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_FMP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    // First, get search results
    const searchUrl = `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(query)}&limit=20&apikey=${apiKey}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to search stocks: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter out ETFs and format the response
    let filteredResults = data
      .filter((item: any) => {
        // Exclude ETFs and funds
        const isNotETF = item.name && 
                         !item.name.toLowerCase().includes(' etf') &&
                         !item.name.toLowerCase().includes(' fund') &&
                         !item.name.toLowerCase().includes(' trust') &&
                         !item.name.toLowerCase().includes(' etn');
        
        return isNotETF && item.symbol && item.name;
      })
      .map((item: any) => ({
        symbol: item.symbol,
        name: item.name,
        exchange: item.exchangeShortName || 'Unknown',
        type: item.type || 'stock',
        currency: item.currency || null,
        stockExchange: item.stockExchange || null,
      }));

    // Get symbols for profile lookup to get market caps
    const symbols = filteredResults.slice(0, 15).map((r: any) => r.symbol).join(',');
    
    // Try to get profile data for better sorting
    let profileMap: Record<string, any> = {};
    try {
      const profileUrl = `https://financialmodelingprep.com/api/v3/profile/${symbols}?apikey=${apiKey}`;
      const profileResponse = await fetch(profileUrl);
      if (profileResponse.ok) {
        const profiles = await profileResponse.json();
        profiles.forEach((profile: any) => {
          profileMap[profile.symbol] = {
            marketCap: profile.mktCap || 0,
            country: profile.country || '',
            isActivelyTrading: profile.isActivelyTrading,
            ipoDate: profile.ipoDate,
            defaultImage: profile.defaultImage,
            volume: profile.volAvg || 0,
          };
        });
      }
    } catch (error) {
      console.log('Could not fetch profiles for enhanced sorting');
    }

    // Enhanced sorting logic
    const results = filteredResults
      .map((item: any) => ({
        ...item,
        profile: profileMap[item.symbol] || {},
        companyOrigin: detectCompanyOrigin(item.name, item.symbol, profileMap[item.symbol]?.country)
      }))
      .sort((a: any, b: any) => {
        const queryUpper = query.toUpperCase();
        
        // 1. Exact symbol match gets highest priority
        const aExactMatch = a.symbol.toUpperCase() === queryUpper;
        const bExactMatch = b.symbol.toUpperCase() === queryUpper;
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;

        // 2. Check if it's the same company by comparing base name
        const aBaseName = a.name.replace(/\s*(corp|corporation|inc|ltd|limited|plc|group|holdings|company|co\.|sa|ag|nv|bv|gmbh|ab|asa|as|oyj)\.?\s*$/i, '').trim();
        const bBaseName = b.name.replace(/\s*(corp|corporation|inc|ltd|limited|plc|group|holdings|company|co\.|sa|ag|nv|bv|gmbh|ab|asa|as|oyj)\.?\s*$/i, '').trim();
        
        // Also check if base symbols are the same (e.g., NVDA and NVDA.NE)
        const aBaseSymbol = a.symbol.split('.')[0];
        const bBaseSymbol = b.symbol.split('.')[0];
        const sameBaseSymbol = aBaseSymbol === bBaseSymbol;
        
        // 3. For same company, apply sophisticated primary listing detection
        if (aBaseName.toLowerCase() === bBaseName.toLowerCase() || sameBaseSymbol) {
          // Same company, different listings
          const aMarketCap = a.profile.marketCap || 0;
          const bMarketCap = b.profile.marketCap || 0;
          
          // Detect if exchanges are primary for the company's origin
          const aIsPrimaryForOrigin = isPrimaryExchangeForCompany(a.exchange, a.companyOrigin);
          const bIsPrimaryForOrigin = isPrimaryExchangeForCompany(b.exchange, b.companyOrigin);
          
          // Primary exchange for company's home country gets top priority
          if (aIsPrimaryForOrigin && !bIsPrimaryForOrigin) return -1;
          if (!aIsPrimaryForOrigin && bIsPrimaryForOrigin) return 1;
          
          // If both are primary or both are not, use market cap
          if (aMarketCap || bMarketCap) {
            if (aMarketCap && !bMarketCap) return -1;
            if (!aMarketCap && bMarketCap) return 1;
            if (aMarketCap !== bMarketCap) {
              return bMarketCap - aMarketCap;
            }
          }
          
          // Prefer actively trading
          if (a.profile.isActivelyTrading !== b.profile.isActivelyTrading) {
            return a.profile.isActivelyTrading ? -1 : 1;
          }

          // Prefer higher volume
          const aVolume = a.profile.volume || 0;
          const bVolume = b.profile.volume || 0;
          if (aVolume !== bVolume) {
            return bVolume - aVolume;
          }
          
          // For companies without clear origin, apply some heuristics
          if (!a.companyOrigin && !b.companyOrigin) {
            // Check for common OTC/secondary patterns
            const aIsOTC = ['OTC', 'PINK', 'GREY'].includes(a.exchange);
            const bIsOTC = ['OTC', 'PINK', 'GREY'].includes(b.exchange);
            if (!aIsOTC && bIsOTC) return -1;
            if (aIsOTC && !bIsOTC) return 1;
            
            // Prefer symbols ending with numbers (like 1928.HK) for Asian exchanges
            const aHasNumericPrefix = /^\d+\./.test(a.symbol);
            const bHasNumericPrefix = /^\d+\./.test(b.symbol);
            if (aHasNumericPrefix && !bHasNumericPrefix) return -1;
            if (!aHasNumericPrefix && bHasNumericPrefix) return 1;
          }
          
          // Prefer shorter ticker
          if (a.symbol.length !== b.symbol.length) {
            return a.symbol.length - b.symbol.length;
          }
        }

        // 4. Symbol starts with query
        const aStartsWith = a.symbol.toUpperCase().startsWith(queryUpper);
        const bStartsWith = b.symbol.toUpperCase().startsWith(queryUpper);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        // 5. Major exchanges get priority
        const allMajorExchanges = Object.values(PRIMARY_EXCHANGES_BY_REGION).flat();
        const aIsMajor = allMajorExchanges.includes(a.exchange);
        const bIsMajor = allMajorExchanges.includes(b.exchange);
        
        if (aIsMajor && !bIsMajor) return -1;
        if (!aIsMajor && bIsMajor) return 1;

        // 6. Prefer OTC/Pink sheets last
        const aIsOTC = ['OTC', 'PINK', 'GREY'].includes(a.exchange);
        const bIsOTC = ['OTC', 'PINK', 'GREY'].includes(b.exchange);
        if (!aIsOTC && bIsOTC) return -1;
        if (aIsOTC && !bIsOTC) return 1;

        // 7. Market cap comparison for different companies
        const aMarketCapGeneral = a.profile.marketCap || 0;
        const bMarketCapGeneral = b.profile.marketCap || 0;
        if (aMarketCapGeneral !== bMarketCapGeneral) {
          return bMarketCapGeneral - aMarketCapGeneral;
        }

        // 8. Symbol length
        if (a.symbol.length !== b.symbol.length) {
          return a.symbol.length - b.symbol.length;
        }

        // 9. Alphabetically
        return a.symbol.localeCompare(b.symbol);
      })
      .map(({ profile, companyOrigin, ...item }: { profile: any; companyOrigin: any; [key: string]: any }) => item) // Remove profile data from final output
      .slice(0, 10); // Limit to top 10 after sorting

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching stocks:", error);
    return NextResponse.json(
      { error: "Failed to search stocks", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 
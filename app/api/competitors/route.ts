import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

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
    
    // 5. Filter out excluded peers
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
      segmentResults
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
      
      // Income statements
      Promise.all(allSymbols.map(async (sym) => {
        try {
          const response = await fetch(`https://financialmodelingprep.com/api/v3/income-statement/${sym}?limit=2&apikey=${apiKey}`);
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
          
          const segmentData = segmentResponse.ok ? await segmentResponse.json() : null;
          const geoData = geoResponse.ok ? await geoResponse.json() : null;
          

          
          return {
            product: segmentData,
            geographic: geoData
          };
        } catch (error) {
          console.log(`Failed to fetch segment data for ${sym}:`, error);
          return { geographic: null, product: null };
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
    const valuationData = allSymbols.map((sym, index) => {
      const metrics = keyMetricsResults[index];
      const ratios = ratiosResults[index];
      const profile = companyProfiles.find((p) => p?.symbol === sym);
      const company = profile?.companyName || sym;
      const sector = profile?.sector || 'N/A';

      // Calculate net debt and enterprise value
      const netDebt = (metrics?.netDebtTTM || 0);
      const enterpriseValue = metrics?.enterpriseValueTTM || 0;
      
      return {
        ticker: sym,
        company,
        sector,
        marketCap: metrics?.marketCapTTM || 0,
        netDebt: netDebt,
        enterpriseValue: enterpriseValue,
        // LTM metrics
        ltmEvToEbitda: ratios?.enterpriseValueMultipleTTM || 0,
        ltmPeRatio: ratios?.priceEarningsRatioTTM || 0,
        ltmPriceToSales: ratios?.priceToSalesRatioTTM || 0,
        // Forward metrics (will be populated later)
        fwdEvToEbitda: 0,
        fwdPeRatio: 0,
        fwdPriceToSales: 0,
        // Other metrics
        priceToBook: ratios?.priceToBookRatioTTM || 0,
        dividendYield: ratios?.dividendYieldPercentageTTM || 0,
        // Legacy fields for backward compatibility
        evToEbitda: ratios?.enterpriseValueMultipleTTM || 0,
        peRatio: ratios?.priceEarningsRatioTTM || 0,
        priceToSales: ratios?.priceToSalesRatioTTM || 0,
      };
    }).filter((data) => data.marketCap > 0); // Filter out companies with no data

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
        roic: ratiosResults[index]?.returnOnInvestedCapitalTTM || 0,
        roe: ratiosResults[index]?.returnOnEquityTTM || 0,
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
          
          // Extended list of possible region/country keys from FMP API
          const regionKeyMappings: { [key: string]: string } = {
            'unitedStates': 'US',
            'UNITED STATES': 'US',
            'US & Canada': 'US & Canada',
            'United States': 'US',
            'china': 'China',
            'CHINA': 'China',
            'europe': 'Europe',
            'Europe': 'Europe',
            'EMEA': 'EMEA',
            'emea': 'EMEA',
            'japan': 'Japan',
            'Japan': 'Japan',
            'restOfWorld': 'Rest of World',
            'Rest Of World': 'Rest of World',
            'americas': 'Americas',
            'Americas': 'Americas',
            'Americas Excluding United States': 'Americas ex-US',
            'asia': 'Asia',
            'Asia': 'Asia',
            'Asia Pacific': 'Asia-Pacific',
            'apac': 'APAC',
            'APAC': 'APAC',
            'North America': 'North America',
            'Non-US': 'Non-US',
            'International': 'International',
            'Other': 'Other',
            'SWITZERLAND': 'Switzerland',
            'Switzerland': 'Switzerland',
            'UNITED ARAB EMIRATES': 'UAE',
            'United Arab Emirates': 'UAE'
          };
          
          // Extract all numeric values that look like revenue
          Object.entries(latestGeo).forEach(([key, value]) => {
            if (typeof value === 'number' && value > 0 && key !== 'date' && !key.includes('period')) {
              // Try to find a mapping for the key
              const mappedRegion = regionKeyMappings[key] || key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
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
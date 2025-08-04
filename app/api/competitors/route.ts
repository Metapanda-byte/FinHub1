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
  evToEbitda: number;
  peRatio: number;
  priceToSales: number;
  priceToBook: number;
  dividendYield: number;
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const additionalTickers = searchParams.get("additionalTickers")?.split(",").filter(Boolean) || [];

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_FMP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
  // Use Perplexity if API key is present (default to true if key exists)
  const usePerplexity = !!perplexityApiKey;
  
  console.log('[Perplexity] API Key present:', !!perplexityApiKey);
  console.log('[Perplexity] Use Perplexity:', usePerplexity);

  try {
    // 1. Try to fetch peer data from our database, but handle gracefully if it fails
    let peerSymbols: string[] = [];
    
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

    // 2. If no peers found in database, use API-based peer discovery
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
            
            // Strategy 1: Find companies in the same industry
            if (industry) {
              try {
                const industryResponse = await fetch(
                  `https://financialmodelingprep.com/api/v3/stock-screener?industry=${encodeURIComponent(industry)}&marketCapMoreThan=1000000000&limit=20&apikey=${apiKey}`
                );
                if (industryResponse.ok) {
                  const industryData = await industryResponse.json();
                  const industryPeers = industryData
                    .filter((company: any) => company.symbol !== symbol)
                    .filter((company: any) => company.marketCap > 0)
                    .sort((a: any, b: any) => Math.abs(a.marketCap - marketCap) - Math.abs(b.marketCap - marketCap)) // Sort by market cap similarity
                    .slice(0, 8)
                    .map((company: any) => company.symbol);
                  
                  peerSymbols.push(...industryPeers);
                  console.log(`Found ${industryPeers.length} industry peers:`, industryPeers);
                }
              } catch (error) {
                console.log('Industry-based peer search failed:', error);
              }
            }
            
            // Strategy 2: If we need more peers, find companies in the same sector
            if (peerSymbols.length < 5 && sector) {
              try {
                const sectorResponse = await fetch(
                  `https://financialmodelingprep.com/api/v3/stock-screener?sector=${encodeURIComponent(sector)}&marketCapMoreThan=1000000000&limit=15&apikey=${apiKey}`
                );
                if (sectorResponse.ok) {
                  const sectorData = await sectorResponse.json();
                  const sectorPeers = sectorData
                    .filter((company: any) => company.symbol !== symbol)
                    .filter((company: any) => !peerSymbols.includes(company.symbol))
                    .filter((company: any) => company.marketCap > 0)
                    .sort((a: any, b: any) => Math.abs(a.marketCap - marketCap) - Math.abs(b.marketCap - marketCap))
                    .slice(0, 5 - peerSymbols.length)
                    .map((company: any) => company.symbol);
                  
                  peerSymbols.push(...sectorPeers);
                  console.log(`Found ${sectorPeers.length} additional sector peers:`, sectorPeers);
                }
              } catch (error) {
                console.log('Sector-based peer search failed:', error);
              }
            }
            
            // Strategy 3: Market cap similarity as last resort
            if (peerSymbols.length < 3 && marketCap) {
              try {
                const marketCapMin = marketCap * 0.2; // 20% to 500% of company's market cap
                const marketCapMax = marketCap * 5;
                
                const marketCapResponse = await fetch(
                  `https://financialmodelingprep.com/api/v3/stock-screener?marketCapMoreThan=${marketCapMin}&marketCapLowerThan=${marketCapMax}&limit=10&apikey=${apiKey}`
                );
                if (marketCapResponse.ok) {
                  const marketCapData = await marketCapResponse.json();
                  const marketCapPeers = marketCapData
                    .filter((company: any) => company.symbol !== symbol)
                    .filter((company: any) => !peerSymbols.includes(company.symbol))
                    .slice(0, 5 - peerSymbols.length)
                    .map((company: any) => company.symbol);
                  
                  peerSymbols.push(...marketCapPeers);
                  console.log(`Found ${marketCapPeers.length} market cap-based peers:`, marketCapPeers);
                }
              } catch (error) {
                console.log('Market cap-based peer search failed:', error);
              }
            }
          }
        }
      } catch (error) {
        console.log('API-based peer discovery failed:', error);
      }
      
      // Log if no peers found instead of using hardcoded fallback
      if (peerSymbols.length === 0) {
        console.log(`No peers found for ${symbol} - will proceed with empty peer list`);
      }
    }

    // 3. Get company profiles for the symbol and its peers
    const allSymbols = Array.from(new Set([symbol, ...peerSymbols, ...additionalTickers]));

    const companyProfiles = await Promise.all(
      allSymbols.map(async (sym) => {
        try {
          const response = await fetch(`https://financialmodelingprep.com/api/v3/profile/${sym}?apikey=${apiKey}`);
          if (!response.ok) return null;
          const data = await response.json();
          return data[0];
        } catch {
          return null;
        }
      })
    );

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
    const keyMetricsPromises = allSymbols.map(async (sym) => {
      try {
        const response = await fetch(`https://financialmodelingprep.com/api/v3/key-metrics-ttm/${sym}?apikey=${apiKey}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data[0];
      } catch {
        return null;
      }
    });

    const keyMetricsResults = await Promise.all(keyMetricsPromises);

    // 6. Fetch financial ratios for additional metrics
    const ratiosPromises = allSymbols.map(async (sym) => {
      try {
        const response = await fetch(`https://financialmodelingprep.com/api/v3/ratios-ttm/${sym}?apikey=${apiKey}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data[0];
      } catch {
        return null;
      }
    });

    const ratiosResults = await Promise.all(ratiosPromises);

    // Combine metrics and create valuation data
    const valuationData = allSymbols.map((sym, index) => {
      const metrics = keyMetricsResults[index];
      const ratios = ratiosResults[index];
      const profile = companyProfiles.find((p) => p?.symbol === sym);
      const company = profile?.companyName || sym;
      const sector = profile?.sector || 'N/A';

      return {
        ticker: sym,
        company,
        sector,
        marketCap: metrics?.marketCapTTM || 0,
        evToEbitda: ratios?.enterpriseValueMultipleTTM || 0,
        peRatio: ratios?.priceEarningsRatioTTM || 0,
        priceToSales: ratios?.priceToSalesRatioTTM || 0,
        priceToBook: ratios?.priceToBookRatioTTM || 0,
        dividendYield: ratios?.dividendYieldPercentageTTM || 0,
      };
    }).filter((data) => data.marketCap > 0); // Filter out companies with no data

    // 7. Fetch income statements for performance metrics
    const incomePromises = allSymbols.map(async (sym) => {
      try {
        const response = await fetch(`https://financialmodelingprep.com/api/v3/income-statement/${sym}?limit=2&apikey=${apiKey}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data;
      } catch {
        return null;
      }
    });

    const incomeResults = await Promise.all(incomePromises);

    // Calculate performance metrics
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

    // 8. Fetch qualitative data - company profiles already fetched, add revenue segments
    const segmentDataPromises = allSymbols.map(async (sym) => {
      try {
        // Fetch revenue segments data
        const segmentResponse = await fetch(
          `https://financialmodelingprep.com/api/v4/revenue-product-segmentation?symbol=${sym}&structure=flat&period=annual&apikey=${apiKey}`
        );
        
        if (!segmentResponse.ok) {
          return { geographic: null, product: null };
        }
        
        const segmentData = await segmentResponse.json();
        
        // Also try to fetch geographic revenue segmentation
        const geoResponse = await fetch(
          `https://financialmodelingprep.com/api/v4/revenue-geographic-segmentation?symbol=${sym}&structure=flat&period=annual&apikey=${apiKey}`
        );
        
        let geoData = null;
        if (geoResponse.ok) {
          geoData = await geoResponse.json();
        }
        
        return {
          product: segmentData,
          geographic: geoData
        };
      } catch (error) {
        console.log(`Failed to fetch segment data for ${sym}:`, error);
        return { geographic: null, product: null };
      }
    });

    const segmentResults = await Promise.all(segmentDataPromises);

    // Process qualitative data
    const qualitativeData = await Promise.all(allSymbols.map(async (sym, index) => {
      const profile = companyProfiles.find((p) => p?.symbol === sym);
      const segments = segmentResults[index];
      
      if (!profile) {
        return {
          ticker: sym,
          company: sym,
          description: 'Company information not available',
          country: 'N/A',
          geographicMix: 'N/A',
          segmentMix: 'N/A',
          exchange: 'N/A',
          website: '',
          ceo: 'N/A',
          employees: 0
        };
      }

      // Process geographic mix
      let geographicMix = 'N/A';
      if (segments.geographic && Array.isArray(segments.geographic) && segments.geographic.length > 0) {
        try {
          const latestGeo = segments.geographic[0]; // Most recent year
          const geoEntries = Object.entries(latestGeo)
            .filter(([key, value]) => key !== 'date' && key !== 'symbol' && typeof value === 'number')
            .map(([region, revenue]) => ({
              region,
              revenue: revenue as number
            }))
            .filter(item => item.revenue > 0)
            .sort((a, b) => b.revenue - a.revenue);
          
          const totalRevenue = geoEntries.reduce((sum, item) => sum + item.revenue, 0);
          
          if (totalRevenue > 0) {
            geographicMix = geoEntries
              .slice(0, 3) // Top 3 regions
              .map(item => `${item.region.replace(/_/g, ' ')} ${Math.round((item.revenue / totalRevenue) * 100)}%`)
              .join(', ');
            
            if (geoEntries.length > 3) {
              const otherRevenue = geoEntries.slice(3).reduce((sum, item) => sum + item.revenue, 0);
              const otherPercentage = Math.round((otherRevenue / totalRevenue) * 100);
              if (otherPercentage > 0) {
                geographicMix += `, Other ${otherPercentage}%`;
              }
            }
          }
        } catch (error) {
          console.log(`Error processing geographic data for ${sym}:`, error);
        }
      }

      // Process segment/product mix
      let segmentMix = 'N/A';
      if (segments.product && Array.isArray(segments.product) && segments.product.length > 0) {
        try {
          const latestProduct = segments.product[0]; // Most recent year
          const productEntries = Object.entries(latestProduct)
            .filter(([key, value]) => key !== 'date' && key !== 'symbol' && typeof value === 'number')
            .map(([product, revenue]) => ({
              product,
              revenue: revenue as number
            }))
            .filter(item => item.revenue > 0)
            .sort((a, b) => b.revenue - a.revenue);
          
          const totalRevenue = productEntries.reduce((sum, item) => sum + item.revenue, 0);
          
          if (totalRevenue > 0) {
            segmentMix = productEntries
              .slice(0, 3) // Top 3 products/segments
              .map(item => `${item.product.replace(/_/g, ' ')} ${Math.round((item.revenue / totalRevenue) * 100)}%`)
              .join(', ');
            
            if (productEntries.length > 3) {
              const otherRevenue = productEntries.slice(3).reduce((sum, item) => sum + item.revenue, 0);
              const otherPercentage = Math.round((otherRevenue / totalRevenue) * 100);
              if (otherPercentage > 0) {
                segmentMix += `, Other ${otherPercentage}%`;
              }
            }
          }
        } catch (error) {
          console.log(`Error processing product segment data for ${sym}:`, error);
        }
      }

      // Extract key business information from description
      let description = profile.description || 'No description available';
      
      // Remove common filler phrases and company suffixes to save space
      description = description
        .replace(/^(The company |The Company |It |They )/i, '')
        .replace(/, Inc\.?| Inc\.?| Corporation| Corp\.?| Limited| Ltd\.?| LLC| L\.L\.C\.| plc| PLC| N\.V\./gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Target around 120 characters for good table display
      const targetLength = 120;
      
      if (description.length > targetLength) {
        // Try to cut at a sentence boundary
        const sentences = description.split(/(?<=[.!?])\s+/);
        let result = '';
        
        for (const sentence of sentences) {
          if ((result + sentence).length <= targetLength) {
            result += (result ? ' ' : '') + sentence;
          } else if (result.length === 0) {
            // First sentence is too long, cut at word boundary
            const words = sentence.split(' ');
            result = words.reduce((acc: string, word: string) => {
              if ((acc + ' ' + word).length <= targetLength - 3) {
                return acc + (acc ? ' ' : '') + word;
              }
              return acc;
            }, '');
            result += '...';
            break;
          } else {
            break;
          }
        }
        
        description = result || description.substring(0, targetLength - 3) + '...';
      }

      // Extract key business elements
      const extractKeyInfo = (text: string): string => {
        // Clean up the text first
        text = text
          .replace(/^(The company |The Company |It |They |We |Our company )/gi, '')
          .replace(/, Inc\.?| Inc\.?| Corporation| Corp\.?| Limited| Ltd\.?| LLC| L\.L\.C\.| plc| PLC| N\.V\./gi, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        let keyInfo = [];
        
        // First, try to extract the main business description
        // Look for patterns like "develops X", "provides Y", "manufactures Z"
        const businessPatterns = [
          /(?:develops?|manufactures?|produces?|provides?|offers?|designs?|creates?|builds?|operates?|distributes?|sells?)\s+([^,.;]+(?:,\s*[^,.;]+)*?)(?:\s+(?:for|to|that|which|across|in)\s+|[.;]|$)/gi,
          /(?:specializes?\s+in|engages?\s+in|focused?\s+on)\s+([^,.;]+?)(?:\s+(?:for|to|and|across)\s+|[.;]|$)/gi,
          /(?:provider\s+of|manufacturer\s+of|developer\s+of|operator\s+of)\s+([^,.;]+?)(?:\s+(?:for|to|and)\s+|[.;]|$)/gi
        ];
        
        let foundBusiness = false;
        for (const pattern of businessPatterns) {
          const matches = Array.from(text.matchAll(pattern));
          if (matches.length > 0) {
            // Get the first match and clean it up
            let businessDesc = matches[0][1]
              .replace(/\s+(?:and\s+related|and\s+other|and\s+various|various|related)\s+\w+$/i, '')
              .trim();
            
            // Split by commas but keep meaningful phrases together
            const parts = businessDesc.split(/,\s*/);
            const meaningfulParts = parts
              .filter(p => p.length > 5 && !p.match(/^\s*(?:etc|more|other|various)\s*$/i))
              .slice(0, 3);
            
            if (meaningfulParts.length > 0) {
              keyInfo.push(meaningfulParts.join(', '));
              foundBusiness = true;
              break;
            }
          }
        }
        
        // If no business pattern found, look for key product/service terms
        if (!foundBusiness) {
          const productTerms = text.match(/\b(?:software|hardware|devices?|platforms?|solutions?|services?|products?|systems?|applications?|tools?|equipment|technology|infrastructure|pharmaceuticals?|drugs?|therapeutics?|treatments?|medicines?)\b[^,.;]{0,40}/gi);
          if (productTerms) {
            const cleanTerms = productTerms
              .map(t => t.trim())
              .filter(t => t.split(' ').length > 1) // Prefer multi-word terms
              .slice(0, 2);
            if (cleanTerms.length > 0) {
              keyInfo.push(cleanTerms.join(', '));
            }
          }
        }
        
        // Look for geographic information
        const geoPatterns = [
          /\b(?:worldwide|globally|internationally)\b/i,
          /\bin\s+(?:the\s+)?([A-Z][a-zA-Z\s,&]+?)(?:\s+and\s+[A-Z][a-zA-Z\s,&]+?)*(?:\.|,|;|$)/g,
          /\bacross\s+(?:the\s+)?([A-Z][a-zA-Z\s,&]+?)(?:\.|,|;|$)/g
        ];
        
        let geoInfo = '';
        if (text.match(geoPatterns[0])) {
          geoInfo = 'globally';
        } else {
          for (let i = 1; i < geoPatterns.length; i++) {
            const geoMatch = geoPatterns[i].exec(text);
            if (geoMatch && geoMatch[1]) {
              const locations = geoMatch[1].split(/\s*,\s*|\s+and\s+/)
                .filter(l => l.length > 2 && l.length < 30)
                .slice(0, 2);
              if (locations.length > 0) {
                geoInfo = locations.join(', ');
                break;
              }
            }
          }
        }
        
        if (geoInfo) {
          keyInfo.push(`(${geoInfo})`);
        }
        
        // Look for specific industry/market focus
        const industryTerms = text.match(/\b(?:healthcare|financial|retail|technology|automotive|aerospace|defense|energy|telecommunications?|media|entertainment|pharmaceutical|biotechnology|industrial|consumer|enterprise|government|education)\b/gi);
        
        if (industryTerms && industryTerms.length > 0) {
          const uniqueIndustries = Array.from(new Set(industryTerms.map(i => {
            // Normalize common variations
            return i.toLowerCase()
              .replace(/health\s+care/g, 'healthcare')
              .replace(/\b(?:pharma|pharmaceutical)\b/g, 'pharma')
              .replace(/\b(?:tech|technology)\b/g, 'tech')
              .replace(/\b(?:biotech|biotechnology)\b/g, 'biotech')
              .replace(/\b(?:telecom|telecommunications)\b/g, 'telecom')
              .replace(/\b(?:auto|automotive)\b/g, 'automotive');
          })))
          .slice(0, 2)
          .map(i => i.charAt(0).toUpperCase() + i.slice(1));
          
          if (uniqueIndustries.length > 0 && !keyInfo.some(k => k.includes(uniqueIndustries[0]))) {
            keyInfo.push(`[${uniqueIndustries.join('/')}]`);
          }
        }
        
        // If we still don't have much info, extract the core business from the first sentence
        if (keyInfo.length === 0) {
          const firstSentence = text.split(/[.!?]/)[0].trim();
          // Remove common fluff
          const cleanedSentence = firstSentence
            .replace(/\b(?:is\s+a\s+(?:leading|global|worldwide|major|premier|top)|one\s+of\s+the\s+(?:world's|leading|largest)|engaged?\s+in|focused?\s+on|committed?\s+to|dedicated\s+to)\b/gi, '')
            .replace(/^\s*(?:and|that|which)\s+/i, '')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (cleanedSentence.length > 20) {
            keyInfo.push(cleanedSentence.length > 120 ? cleanedSentence.substring(0, 117) + '...' : cleanedSentence);
          }
        }
        
        // Combine extracted information
        let result = keyInfo.join(' ');
        
        // Final cleanup
        result = result
          .replace(/\s*\(\s*\)/g, '') // Remove empty parentheses
          .replace(/\s*\[\s*\]/g, '') // Remove empty brackets
          .replace(/\s+/g, ' ')
          .trim();
        
        // Ensure reasonable length
        if (result.length > 150) {
          // Try to cut at a natural boundary
          const cutPoint = result.lastIndexOf(' ', 147);
          result = result.substring(0, cutPoint > 100 ? cutPoint : 147) + '...';
        }
        
        return result || 'Business description not available';
      };
      
      // Process description with Perplexity API if available, otherwise use extraction
      if (usePerplexity && description && description !== 'No description available') {
        console.log(`[Perplexity] Processing description for ${sym}`);
        // Check cache first
        const cacheKey = `${sym}:${description.substring(0, 50)}`;
        const cached = descriptionCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          description = cached.description;
        } else {
          try {
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
                  content: 'You are a financial analyst. Create a concise company description under 120 characters. Focus on: 1) Core products/services, 2) Key markets. Be extremely brief and specific. No citations or references.'
                  },
                  {
                    role: 'user',
                    content: `Summarize this company description concisely with substance: "${description}"`
                  }
                ],
                max_tokens: 50,
                temperature: 0.1,
                stream: false
              })
            });

            if (perplexityResponse.ok) {
              const perplexityData = await perplexityResponse.json();
              let processedDescription = perplexityData.choices?.[0]?.message?.content?.trim();
              if (processedDescription) {
                // Remove any citation markers like [1], [2], etc.
                processedDescription = processedDescription.replace(/\[\d+\]/g, '').trim();
                console.log(`[Perplexity] Successfully processed ${sym}: "${processedDescription}"`);
                description = processedDescription;
                // Cache the result
                descriptionCache.set(cacheKey, { 
                  description: processedDescription, 
                  timestamp: Date.now() 
                });
              } else {
                // Fallback to extraction if Perplexity doesn't return a valid response
                description = extractKeyInfo(description);
              }
            } else {
              console.warn(`Perplexity API error for ${sym}:`, perplexityResponse.status);
              // Fallback to extraction
              description = extractKeyInfo(description);
            }
          } catch (error) {
            console.warn(`Error calling Perplexity API for ${sym}:`, error);
            // Fallback to extraction
            description = extractKeyInfo(description);
          }
        }
      } else {
        // Use extraction method if Perplexity is not available
        description = extractKeyInfo(description);
      }

      return {
        ticker: sym,
        company: profile.companyName || sym,
        description,
        country: profile.country || 'N/A',
        geographicMix,
        segmentMix,
        exchange: profile.exchangeShortName || profile.exchange || 'N/A',
        website: profile.website || '',
        ceo: profile.ceo || 'N/A',
        employees: profile.fullTimeEmployees || 0
      };
    }));

    return NextResponse.json({
      peerCompanies: competitors,
      peerValuationData: valuationData,
      peerPerformanceData: performanceData,
      peerQualitativeData: qualitativeData
    });
  } catch (error) {
    console.error("Error analyzing competitors:", error);
    return NextResponse.json(
      { error: "Failed to analyze competitors", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 
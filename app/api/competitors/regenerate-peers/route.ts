import { NextRequest, NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase/client";
import { FMP_API_KEY } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { symbol } = await request.json();

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    const apiKey = FMP_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'FMP API key not configured' },
        { status: 503 }
      );
    }

    // First, fetch the company profile to get name, sector, industry
    const profileResponse = await fetch(
      `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`
    );
    
    if (!profileResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch company profile' },
        { status: 500 }
      );
    }

    const profileData = await profileResponse.json();
    const profile = profileData[0];
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Company profile not found' },
        { status: 404 }
      );
    }

    // Get current peers from database
    const { data: currentPeerData } = await supabase
      .from('stock_peers')
      .select('peers')
      .eq('symbol', symbol)
      .single();

    const currentPeers = currentPeerData?.peers || [];

    // Use AI to analyze and suggest better peers
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    if (!perplexityApiKey) {
      return NextResponse.json(
        { error: 'Perplexity API key not configured' },
        { status: 503 }
      );
    }

    const analyzeResponse = await fetch(
      'https://api.perplexity.ai/chat/completions',
      {
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
              content: 'You are a financial analyst. Provide peer analysis in the specified JSON format only.'
            },
            {
              role: 'user',
              content: `For ${profile.companyName} (${symbol}), which operates in the ${profile.industry || profile.sector || 'industry'}, please identify the most relevant public company peers.

Current suggested peers: ${currentPeers.join(', ') || 'None'}

Please provide 8-10 highly relevant peer companies that:
- Operate in the same or very similar business segments
- Have comparable business models
- Compete for the same customers
- Are publicly traded with stock symbols

For luxury goods companies like LVMH, focus on other luxury conglomerates (e.g., Richemont, Kering, Hermès) rather than unrelated companies.

Format your response as JSON:
{
  "recommendedPeers": [
    {
      "symbol": "TICKER",
      "name": "Company Name",
      "reason": "Brief reason why this is a good peer"
    }
  ],
  "analysis": "Brief explanation of peer selection rationale"
}`
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      }
    );

    if (!analyzeResponse.ok) {
      const error = await analyzeResponse.json();
      return NextResponse.json(
        { error: 'Failed to analyze peers', details: error },
        { status: 500 }
      );
    }

    const analyzeData = await analyzeResponse.json();
    const content = analyzeData.choices[0]?.message?.content || '';
    
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, try to extract structured data
      const peerMatches = content.match(/([A-Z]{2,5}(?:\.[A-Z]{2})?)/g) || [];
      analysis = {
        recommendedPeers: peerMatches.slice(0, 10).map((s: string) => ({
          symbol: s,
          name: s,
          reason: 'Extracted from analysis'
        })),
        analysis: content
      };
    }
    
    if (!analysis.recommendedPeers || analysis.recommendedPeers.length === 0) {
      return NextResponse.json(
        { error: 'No peers recommended by AI analysis' },
        { status: 400 }
      );
    }

    // Extract just the symbols from recommended peers
    const newPeers = analysis.recommendedPeers
      .map((p: any) => p.symbol)
      .filter((s: string) => s && s !== symbol)
      .slice(0, 10);

    // Update the database with new peers
    const { error: updateError } = await supabase
      .from('stock_peers')
      .upsert({
        symbol: symbol,
        name: profile.companyName,
        peers: newPeers,
        sector: profile.sector,
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update peers in database', details: updateError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      symbol,
      oldPeers: currentPeers,
      newPeers,
      analysis: analysis.analysis
    });

  } catch (error) {
    console.error('Error regenerating peers:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate peers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
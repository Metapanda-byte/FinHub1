import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { symbol, companyName, currentPeers, industry, sector } = await request.json();

    if (!symbol || !companyName) {
      return NextResponse.json(
        { error: 'Symbol and company name are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Perplexity API key not configured' },
        { status: 503 }
      );
    }

    const perplexity = new OpenAI({
      apiKey,
      baseURL: 'https://api.perplexity.ai',
    });

    // Build a focused prompt for peer analysis
    const prompt = `You are a financial analyst specializing in peer group selection. 

For ${companyName} (${symbol}), which operates in the ${industry || sector || 'industry'}, please identify the most relevant public company peers.

Current suggested peers: ${currentPeers?.join(', ') || 'None'}

Please provide:
1. A list of 8-10 highly relevant peer companies that:
   - Operate in the same or very similar business segments
   - Have comparable business models
   - Compete for the same customers
   - Are publicly traded with stock symbols

2. Brief explanation of why these are better peers

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
}`;

    const response = await perplexity.chat.completions.create({
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: 'You are a financial analyst. Provide peer analysis in the specified JSON format only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content || '';
    
    // Parse the JSON response
    try {
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch (parseError) {
      // If JSON parsing fails, try to extract structured data
      const peerMatches = content.match(/([A-Z]{2,5}(?:\.[A-Z]{2})?)/g) || [];
      return NextResponse.json({
        recommendedPeers: peerMatches.slice(0, 10).map(symbol => ({
          symbol,
          name: symbol,
          reason: 'Extracted from analysis'
        })),
        analysis: content
      });
    }

  } catch (error) {
    console.error('Error analyzing peers:', error);
    return NextResponse.json(
      { error: 'Failed to analyze peers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
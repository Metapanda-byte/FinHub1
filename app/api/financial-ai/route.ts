import { NextRequest, NextResponse } from 'next/server';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

function generateMockResponse(prompt: string, financialData: any, symbol: string | null): string {
  // Basic analysis of financial data for mock responses
  const incomeStatements = financialData.incomeStatements || [];
  const newsData = financialData.news || [];
  const secFilings = financialData.secFilings || [];
  const earningsTranscripts = financialData.earningsTranscriptDates || [];
  
  if (incomeStatements.length >= 2) {
    const latest = incomeStatements[0];
    const previous = incomeStatements[1];
    
    // Calculate basic metrics
    const revenueChange = latest.revenue && previous.revenue 
      ? ((latest.revenue - previous.revenue) / previous.revenue) * 100 
      : 0;
    
    const marginChange = latest.operatingIncome && latest.revenue && previous.operatingIncome && previous.revenue
      ? ((latest.operatingIncome / latest.revenue) - (previous.operatingIncome / previous.revenue)) * 100
      : 0;
    
    // Generate contextual response based on the prompt that demonstrates proactive multi-source analysis
    if (prompt.toLowerCase().includes('revenue')) {
      let additionalContext = '';
      
      // Proactively include news context
      if (newsData.length > 0) {
        const recentNews = newsData.slice(0, 2);
        additionalContext += `\n\n📰 **Market Context (from recent news):**\n${recentNews.map((article: any) => 
          `• ${article.title} (${article.source})`
        ).join('\n')}`;
      }
      
      // Proactively mention SEC filings
      if (secFilings.length > 0) {
        const recentFilings = secFilings.slice(0, 2);
        additionalContext += `\n\n📋 **Regulatory Context (from SEC filings):**\n${recentFilings.map((filing: any) => 
          `• ${filing.type} filed ${filing.fillingDate} - May contain revenue guidance or explanations`
        ).join('\n')}`;
      }
      
      // Proactively mention earnings calls
      if (earningsTranscripts.length > 0) {
        const recentCall = earningsTranscripts[0];
        additionalContext += `\n\n🎙️ **Management Commentary:**\n• Q${recentCall.quarter} ${recentCall.year} earnings call (${recentCall.date}) - Likely discussed revenue performance and outlook`;
      }
      
      return `**Multi-Source Revenue Analysis for ${symbol || 'this company'}:**

📊 **Financial Performance:**
Revenue ${revenueChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(revenueChange).toFixed(1)}% year-over-year.
• Latest: $${(latest.revenue / 1e9).toFixed(2)}B (${new Date(latest.date).getFullYear()})
• Previous: $${(previous.revenue / 1e9).toFixed(2)}B (${new Date(previous.date).getFullYear()})

🔍 **Cross-Source Analysis:**
This ${Math.abs(revenueChange) > 10 ? 'significant' : 'moderate'} revenue change should be analyzed alongside regulatory filings, management commentary, and market news for complete context.${additionalContext}

💡 **Note:** This is a basic multi-source analysis. For full AI-powered cross-referencing of SEC filings content, earnings transcript highlights, and automated news correlation, configure a Perplexity API key.`;
    }
    
    if (prompt.toLowerCase().includes('margin')) {
      let additionalContext = '';
      
      // Proactively include multi-source context
      if (newsData.length > 0) {
        additionalContext += `\n\n📰 **Market Sentiment:** Recent news may explain margin pressures or improvements`;
      }
      
      if (secFilings.length > 0) {
        additionalContext += `\n\n📋 **Regulatory Insights:** Recent SEC filings likely discuss cost structure changes and operational efficiency initiatives`;
      }
      
      if (earningsTranscripts.length > 0) {
        const recentCall = earningsTranscripts[0];
        additionalContext += `\n\n🎙️ **Management Perspective:** Q${recentCall.quarter} ${recentCall.year} earnings call would have addressed margin performance and cost management strategies`;
      }
      
      return `**Comprehensive Margin Analysis for ${symbol || 'this company'}:**

📊 **Margin Performance:**
• Current operating margin: ${((latest.operatingIncome / latest.revenue) * 100).toFixed(1)}%
• Previous operating margin: ${((previous.operatingIncome / previous.revenue) * 100).toFixed(1)}%
• Change: ${marginChange > 0 ? '+' : ''}${marginChange.toFixed(1)} percentage points

🔍 **Analysis:**
The margin ${marginChange > 0 ? 'expansion' : 'compression'} indicates ${marginChange > 0 ? 'improved operational efficiency' : 'increased cost pressures or competitive challenges'}. This should be cross-referenced with:${additionalContext}

💡 **Note:** For complete analysis that automatically extracts margin explanations from SEC filings, management commentary from earnings calls, and correlates with market news, configure a Perplexity API key.`;
    }
  }
  
  // Default response
  let contextSummary = '';
  if (newsData.length > 0) {
    contextSummary += `\n📰 **Recent News:** ${newsData.length} articles available`;
  }
  if (secFilings.length > 0) {
    contextSummary += `\n📋 **SEC Filings:** ${secFilings.length} recent filings (3-year history)`;
  }
  if (earningsTranscripts.length > 0) {
    contextSummary += `\n🎙️ **Earnings Calls:** ${earningsTranscripts.length} transcript dates available`;
  }
  
  return `I can help analyze ${symbol || 'this company'}'s financial performance. I have access to:
- ${incomeStatements.length} years of financial statements
- Recent SEC filings and regulatory documents
- Earnings call transcript dates and content
- Recent news articles and market updates${contextSummary}

Some areas I can help with:
- Revenue growth trends and drivers
- Margin analysis and operational efficiency
- Cash flow patterns and capital allocation
- Year-over-year comparisons and trends
- SEC filing insights and regulatory updates
- Earnings call highlights and guidance
- News-driven market sentiment analysis

Please ask a specific question about the financials. For full AI-powered analysis of SEC filings and earnings transcripts, configure a Perplexity API key.`;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, financialData, symbol } = await req.json();

    if (!PERPLEXITY_API_KEY) {
      // Provide a mock response when API key is not configured
      const mockResponse = generateMockResponse(prompt, financialData, symbol);
      return NextResponse.json({ response: mockResponse });
    }

    if (!prompt || !financialData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a system prompt for fast, concise analysis
    const systemPrompt = `Financial analyst. Be concise and direct. 

- Lead with key insight
- Use bullets and percentages  
- Reference trends from data
- Skip introductions

Analyze ${symbol || 'this company'} using available data.`;

    // Streamlined financial data context
    const newsContext = financialData.news?.slice(0, 3).map((article: any) => 
      `${article.title} (${article.source})`).join('; ') || '';
    
    const secFilingsContext = financialData.secFilings?.slice(0, 3).map((filing: any) => 
      `${filing.type} ${filing.fillingDate}`).join('; ') || '';
    
    const earningsContext = financialData.earningsTranscriptDates?.slice(0, 2).map((transcript: any) => 
      `Q${transcript.quarter} ${transcript.year}`).join('; ') || '';
    
    const dataContext = `Financial Data for ${symbol}:

${JSON.stringify({
  incomeStatements: financialData.incomeStatements?.slice(0, 3),
  balanceSheets: financialData.balanceSheets?.slice(0, 3)
}, null, 2)}

News: ${newsContext}
Filings: ${secFilingsContext}  
Earnings: ${earningsContext}`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `${dataContext}\n\nUser question: ${prompt}` 
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Perplexity API error:', error);
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'No response generated';

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Financial AI API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
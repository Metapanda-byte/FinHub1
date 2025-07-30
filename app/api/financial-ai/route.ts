import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function generateMockResponse(prompt: string, financialData: any, symbol: string | null): string {
  // Basic analysis of financial data for mock responses
  const incomeStatements = financialData.incomeStatements || [];
  const newsData = financialData.news || [];
  
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
    
    // Generate contextual response based on the prompt
    if (prompt.toLowerCase().includes('revenue')) {
      let newsContext = '';
      if (newsData.length > 0) {
        const recentNews = newsData.slice(0, 3);
        newsContext = `\n\n📰 **Recent News Context:**\n${recentNews.map((article: any) => 
          `• ${article.title} (${article.source})`
        ).join('\n')}`;
      }
      
      return `Based on the financial data for ${symbol || 'this company'}:

Revenue ${revenueChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(revenueChange).toFixed(1)}% year-over-year.

Latest revenue: $${(latest.revenue / 1e9).toFixed(2)}B (${new Date(latest.date).getFullYear()})
Previous revenue: $${(previous.revenue / 1e9).toFixed(2)}B (${new Date(previous.date).getFullYear()})

This ${Math.abs(revenueChange) > 10 ? 'significant' : 'moderate'} change could be attributed to various factors including market conditions, product launches, or strategic initiatives.${newsContext}

To get AI-powered analysis that examines news reports and SEC filings for deeper insights, please configure an OpenAI API key.`;
    }
    
    if (prompt.toLowerCase().includes('margin')) {
      let newsContext = '';
      if (newsData.length > 0) {
        const recentNews = newsData.slice(0, 3);
        newsContext = `\n\n📰 **Recent News Context:**\n${recentNews.map((article: any) => 
          `• ${article.title} (${article.source})`
        ).join('\n')}`;
      }
      
      return `Operating margin analysis for ${symbol || 'this company'}:

Current operating margin: ${((latest.operatingIncome / latest.revenue) * 100).toFixed(1)}%
Previous operating margin: ${((previous.operatingIncome / previous.revenue) * 100).toFixed(1)}%
Change: ${marginChange > 0 ? '+' : ''}${marginChange.toFixed(1)} percentage points

The margin ${marginChange > 0 ? 'expansion' : 'compression'} indicates ${marginChange > 0 ? 'improved operational efficiency' : 'increased cost pressures or competitive challenges'}.${newsContext}

For AI-powered analysis that examines news reports and SEC filings for deeper insights, please configure an OpenAI API key.`;
    }
  }
  
  // Default response
  let newsContext = '';
  if (newsData.length > 0) {
    newsContext = `\n\n📰 **Recent News Available:** ${newsData.length} articles found`;
  }
  
  return `I can help analyze ${symbol || 'this company'}'s financial performance. I can see ${incomeStatements.length} years of financial data available.${newsContext}

Some areas I can help with:
- Revenue growth trends
- Margin analysis
- Cash flow patterns
- Year-over-year comparisons
- News-driven insights

Please ask a specific question about the financials. For AI-powered analysis that examines news reports and SEC filings, configure an OpenAI API key.`;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, financialData, symbol } = await req.json();

    if (!OPENAI_API_KEY) {
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

    // Create a system prompt that understands financial analysis
    const systemPrompt = `You are an expert financial analyst AI assistant. Your role is to help users understand company financials, particularly year-over-year changes and trends, using both financial statements and recent news reports.

When analyzing financial data:
1. Be specific and cite exact numbers from the data
2. Calculate percentage changes when relevant
3. Identify potential causes for significant changes using news context
4. Consider industry context and external factors mentioned in news
5. Connect financial performance to recent news events and developments
6. Analyze sentiment from news articles to provide context
7. Be concise but thorough in explanations

You have access to:
- Historical financial statements (income, cash flow, balance sheet)
- Recent news articles with titles, summaries, sources, and sentiment
- Company-specific context and market developments

The user is analyzing ${symbol || 'a company'}'s financial data.`;

    // Format the financial data for the AI
    const newsContext = financialData.news && financialData.news.length > 0 
      ? `\n\n📰 RECENT NEWS ANALYSIS:\n${financialData.news.map((article: any, index: number) => 
          `${index + 1}. Title: ${article.title}\n   Source: ${article.source} | Date: ${article.date}\n   Summary: ${article.summary}\n   Sentiment: ${article.sentiment > 0 ? 'Positive' : article.sentiment < 0 ? 'Negative' : 'Neutral'}\n   URL: ${article.url}`
        ).join('\n\n')}`
      : '';
    
    const dataContext = `Here is the financial and news data available for analysis:

📊 FINANCIAL STATEMENTS:
${JSON.stringify({
  incomeStatements: financialData.incomeStatements,
  cashFlows: financialData.cashFlows,
  balanceSheets: financialData.balanceSheets
}, null, 2)}${newsContext}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${dataContext}\n\nUser question: ${prompt}` }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
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
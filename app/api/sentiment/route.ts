import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  console.log("Sentiment API called with symbol:", symbol);

  if (!symbol) {
    console.error("No symbol provided");
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    console.error("API key not configured");
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    // Fetch recent news articles
    const newsUrl = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=20&apikey=${apiKey}`;
    console.log("Fetching news from:", newsUrl);
    
    const response = await fetch(newsUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log("News API response status:", response.status);
    console.log("News API response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("News API error response:", errorText);
      throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`);
    }

    const newsData = await response.json();
    console.log("News API response data:", newsData);

    if (!Array.isArray(newsData)) {
      console.error("Invalid news data format:", newsData);
      throw new Error("Invalid news data format");
    }

    if (newsData.length === 0) {
      console.log("No news articles found for symbol:", symbol);
      return NextResponse.json({
        overallScore: 0,
        positiveCount: 0,
        negativeCount: 0,
        neutralCount: 0,
        recentTrend: 0,
        marketComparison: 0,
      });
    }

    // Analyze sentiment for each article
    const sentiments = newsData.map((article: any) => analyzeSentiment(article.text));
    console.log("Analyzed sentiments:", sentiments);
    
    // Calculate overall sentiment metrics
    const positiveCount = sentiments.filter((s: number) => s > 0.3).length;
    const negativeCount = sentiments.filter((s: number) => s < -0.3).length;
    const neutralCount = sentiments.filter((s: number) => s >= -0.3 && s <= 0.3).length;
    
    // Calculate overall score (weighted average)
    const overallScore = sentiments.reduce((sum: number, score: number) => sum + score, 0) / sentiments.length;
    
    // Calculate recent trend (comparing first half to second half)
    const midPoint = Math.floor(sentiments.length / 2);
    const recentSentiments = sentiments.slice(0, midPoint);
    const olderSentiments = sentiments.slice(midPoint);
    const recentTrend = 
      (recentSentiments.reduce((sum: number, score: number) => sum + score, 0) / recentSentiments.length) -
      (olderSentiments.reduce((sum: number, score: number) => sum + score, 0) / olderSentiments.length);

    // Fetch market news for comparison
    const marketUrl = `https://financialmodelingprep.com/api/v3/stock_market_news?limit=20&apikey=${apiKey}`;
    console.log("Fetching market news from:", marketUrl);
    
    const marketResponse = await fetch(marketUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log("Market news API response status:", marketResponse.status);

    if (!marketResponse.ok) {
      const errorText = await marketResponse.text();
      console.error("Market news API error response:", errorText);
      throw new Error(`Failed to fetch market news: ${marketResponse.status} ${marketResponse.statusText}`);
    }

    const marketNews = await marketResponse.json();
    console.log("Market news API response data:", marketNews);

    const marketSentiments = marketNews.map((article: any) => analyzeSentiment(article.text));
    const marketAverage = marketSentiments.reduce((sum: number, score: number) => sum + score, 0) / marketSentiments.length;
    
    // Calculate market comparison
    const marketComparison = overallScore - marketAverage;

    const result = {
      overallScore,
      positiveCount,
      negativeCount,
      neutralCount,
      recentTrend,
      marketComparison,
    };

    console.log("Final sentiment result:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return NextResponse.json({ 
      error: "Failed to analyze sentiment",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// Simple sentiment analysis function
function analyzeSentiment(text: string): number {
  const positiveWords = ["up", "gain", "positive", "growth", "strong", "beat", "increase", "rise"];
  const negativeWords = ["down", "loss", "negative", "decline", "weak", "miss", "decrease", "fall"];

  const words = text.toLowerCase().split(/\s+/);
  let score = 0;

  words.forEach((word) => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });

  // Normalize score between -1 and 1
  return Math.max(-1, Math.min(1, score / 10));
} 
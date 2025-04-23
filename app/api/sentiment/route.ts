import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    // Fetch recent news articles
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=20&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch news");
    }

    const newsData = await response.json();

    // Analyze sentiment for each article
    const sentiments = newsData.map((article: any) => analyzeSentiment(article.text));
    
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
    const marketResponse = await fetch(
      `https://financialmodelingprep.com/api/v3/stock_market_news?limit=20&apikey=${apiKey}`
    );

    if (!marketResponse.ok) {
      throw new Error("Failed to fetch market news");
    }

    const marketNews = await marketResponse.json();
    const marketSentiments = marketNews.map((article: any) => analyzeSentiment(article.text));
    const marketAverage = marketSentiments.reduce((sum: number, score: number) => sum + score, 0) / marketSentiments.length;
    
    // Calculate market comparison
    const marketComparison = overallScore - marketAverage;

    return NextResponse.json({
      overallScore,
      positiveCount,
      negativeCount,
      neutralCount,
      recentTrend,
      marketComparison,
    });
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return NextResponse.json({ error: "Failed to analyze sentiment" }, { status: 500 });
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
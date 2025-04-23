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
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=10&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch news");
    }

    const data = await response.json();

    // Process the news data and add sentiment analysis
    const processedNews = data.map((article: any) => ({
      title: article.title,
      date: article.publishedDate,
      source: article.site,
      url: article.url,
      summary: article.text,
      sentiment: analyzeSentiment(article.text),
    }));

    return NextResponse.json(processedNews);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
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
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  console.log("News API called with symbol:", symbol);

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
    const url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=10&apikey=${apiKey}`;
    console.log("Fetching news from:", url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error("News API response not OK:", response.status, response.statusText);
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Raw news data:", JSON.stringify(data, null, 2));

    if (!Array.isArray(data)) {
      console.error("Invalid news data format:", data);
      throw new Error("Invalid news data format");
    }

    if (data.length === 0) {
      console.log("No news articles found for symbol:", symbol);
      return NextResponse.json([]);
    }

    // Process the news data and add sentiment analysis
    const processedNews = data.map((article: any) => {
      console.log("Processing article:", article);
      
      if (!article.title || !article.publishedDate || !article.site || !article.url || !article.text) {
        console.error("Invalid article data:", article);
        return null;
      }

      return {
        title: article.title,
        date: article.publishedDate,
        source: article.site,
        url: article.url,
        summary: article.text,
        sentiment: analyzeSentiment(article.text),
      };
    }).filter(Boolean);

    console.log("Processed news:", processedNews);

    if (processedNews.length === 0) {
      console.log("No valid news articles found after processing");
      return NextResponse.json([]);
    }

    return NextResponse.json(processedNews);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ 
      error: "Failed to fetch news",
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
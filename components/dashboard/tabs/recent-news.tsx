"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrunchingNumbersCardWithHeader } from "@/components/ui/crunching-numbers-loader";
import { useSearchStore } from "@/lib/store/search-store";
import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NewsArticle {
  title: string;
  date: string;
  source: string;
  url: string;
  summary: string;
  sentiment: number;
}

const fetcher = async (url: string) => {
  console.log("Fetching news from:", url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch news: ${response.status}`);
  }
  return response.json();
};

export function RecentNews() {
  const currentSymbol = useSearchStore((state) => state.currentSymbol);
  console.log("RecentNews component rendered with symbol:", currentSymbol);
  
  const { data: news, error, isLoading } = useSWR<NewsArticle[]>(
    currentSymbol ? `/api/stock-news?symbol=${currentSymbol}` : null,
    fetcher,
    {
      onError: (err) => {
        console.error("Error fetching news:", err);
      },
      onSuccess: (data) => {
        console.log("News data received:", data);
      },
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      shouldRetryOnError: true,
      dedupingInterval: 0,
    }
  );

  console.log("News component state:", { currentSymbol, news, error, isLoading });

  if (isLoading) {
    return (
      <CrunchingNumbersCardWithHeader 
        title="Recent News"
        message="Crunching the numbers"
      />
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Error loading news: {error.message}</p>
        <p className="text-sm text-gray-500 mt-2">Please try again later or check if the symbol is correct.</p>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">No news articles found for {currentSymbol}</p>
        <div className="text-sm text-gray-400 mt-2">
          This could be due to:
          <ul className="list-disc list-inside mt-1">
            <li>No recent news for this company</li>
            <li>News data not available for this symbol</li>
            <li>Temporary API limitations</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Recent News</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {news.map((article, index) => (
              <div key={index} className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{article.title}</h3>
                    <p className="text-sm text-muted-foreground">{article.summary}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{article.source}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(article.date), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={article.sentiment > 0 ? "default" : article.sentiment < 0 ? "destructive" : "secondary"}>
                      {article.sentiment > 0 ? "Positive" : article.sentiment < 0 ? "Negative" : "Neutral"}
                    </Badge>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
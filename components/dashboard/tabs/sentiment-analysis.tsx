"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchStore } from "@/lib/store/search-store";
import useSWR from "swr";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SentimentData {
  overallScore: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  recentTrend: number;
  marketComparison: number;
}

export function SentimentAnalysis() {
  const currentSymbol = useSearchStore((state) => state.currentSymbol);
  const { data: sentiment, error, isLoading } = useSWR<SentimentData>(
    currentSymbol ? `/api/sentiment?symbol=${currentSymbol}` : null
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Loading Sentiment Analysis...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error || !sentiment) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Sentiment Analysis</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getSentimentColor = (score: number) => {
    if (score > 0.6) return "bg-green-500";
    if (score > 0.3) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.6) return "Very Positive";
    if (score > 0.3) return "Moderately Positive";
    if (score > 0) return "Slightly Positive";
    if (score > -0.3) return "Slightly Negative";
    if (score > -0.6) return "Moderately Negative";
    return "Very Negative";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Overall Sentiment</h3>
                <Badge variant={sentiment.overallScore > 0 ? "default" : "destructive"}>
                  {getSentimentLabel(sentiment.overallScore)}
                </Badge>
              </div>
              <Progress value={(sentiment.overallScore + 1) * 50} className={getSentimentColor(sentiment.overallScore)} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">{sentiment.positiveCount}</p>
                    <p className="text-sm text-muted-foreground">Positive Articles</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-500">{sentiment.neutralCount}</p>
                    <p className="text-sm text-muted-foreground">Neutral Articles</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-500">{sentiment.negativeCount}</p>
                    <p className="text-sm text-muted-foreground">Negative Articles</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Recent Trend</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Change in sentiment over the last 7 days</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Badge variant={sentiment.recentTrend > 0 ? "default" : "destructive"}>
                  {sentiment.recentTrend > 0 ? "Improving" : "Declining"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Market Comparison</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Sentiment compared to market average</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Badge variant={sentiment.marketComparison > 0 ? "default" : "destructive"}>
                  {sentiment.marketComparison > 0 ? "Above Market" : "Below Market"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
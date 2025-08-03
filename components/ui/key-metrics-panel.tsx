"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeyMetricsPanelProps {
  symbol: string | null;
  profile?: any;
  quote?: any;
  keyMetrics?: any;
  ratios?: any;
  className?: string;
}

export function KeyMetricsPanel({ 
  symbol, 
  profile, 
  quote, 
  keyMetrics, 
  ratios,
  className 
}: KeyMetricsPanelProps) {
  if (!symbol || !profile) {
    return null;
  }

  // Helper function to format large numbers
  const formatLargeNumber = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toFixed(0)}`;
  };

  const formatPercentage = (value: number) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return `${value.toFixed(1)}%`;
  };

  const formatRatio = (value: number) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return value.toFixed(1);
  };

  // Calculate key metrics
  const marketCap = profile?.mktCap || 0;
  const price = quote?.price || profile?.price || 0;
  const change = quote?.change || 0;
  const changePercent = quote?.changesPercentage || 0;
  const peRatio = keyMetrics?.peRatio || profile?.peRatio || 0;
  const revenue = keyMetrics?.revenuePerShare ? keyMetrics.revenuePerShare * (marketCap / price) : 0;
  const debtToEquity = keyMetrics?.debtToEquity || 0;
  const roe = keyMetrics?.roe || 0;

  const metrics = [
    {
      label: "Share Price",
      value: `$${price.toFixed(2)}`,
      subValue: `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent.toFixed(1)}%)`,
      icon: change >= 0 ? TrendingUp : TrendingDown,
      color: change >= 0 ? "text-green-600" : "text-red-600"
    },
    {
      label: "Market Cap",
      value: formatLargeNumber(marketCap),
      icon: BarChart3,
      color: "text-blue-600"
    }
  ];

  return (
    <div className={cn("flex items-center gap-8", className)}>
      {metrics.map((metric, index) => {
        return (
          <div key={metric.label} className="flex items-center gap-8">
            {index > 0 && (
              <Separator orientation="vertical" className="h-8 bg-border/40" />
            )}
            <div className="flex flex-col items-end min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm whitespace-nowrap">
                  {metric.value}
                </span>
                {metric.subValue && (
                  <span className={cn("text-xs font-medium", metric.color)}>
                    {metric.subValue}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                {metric.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
} 
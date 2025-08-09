"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ClientOnly } from "@/components/ui/client-only";
import ReactECharts from 'echarts-for-react';

interface PeerPricePerformanceProps {
  currentSymbol: string;
  selectedPeers: string[];
  peerCompanies: Array<{ id: string; name: string }>;
}

interface PriceData {
  date: string;
  [symbol: string]: number | string;
}

interface PerformanceData {
  symbol: string;
  name: string;
  performance: number;
  color: string;
}

const COLORS = ["#3b82f6", "#f97316", "#10b981", "#8b5cf6", "#ef4444", "#14b8a6", "#f59e0b", "#ec4899"];

export function PeerPricePerformance({ currentSymbol, selectedPeers, peerCompanies }: PeerPricePerformanceProps) {
  const [timeframe, setTimeframe] = useState<string>("YTD");
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);

  const symbolsToFetch = useMemo(() => {
    const symbols = [currentSymbol, ...selectedPeers].filter(Boolean);
    return Array.from(new Set(symbols));
  }, [currentSymbol, selectedPeers]);

  useEffect(() => {
    const fetchPriceData = async () => {
      setLoading(true);
      const mockData = generateMockPriceData(symbolsToFetch, timeframe);
      setPriceData(mockData.chartData);
      setPerformanceData(mockData.performanceData);
      setLoading(false);
    };
    if (symbolsToFetch.length > 0) fetchPriceData();
  }, [symbolsToFetch, timeframe]);

  const generateMockPriceData = (symbols: string[], period: string) => {
    const periods: Record<string, number> = {
      "12H": 12,
      "1D": 24,
      "1W": 7,
      "1M": 30,
      "3M": 90,
      "YTD": 200,
      "1Y": 365,
      "3Y": 1095,
      "5Y": 1825,
    };
    const numPoints = period === "12H" || period === "1D" ? 24 : Math.min(periods[period] || 30, 260);
    const chartData: PriceData[] = [];
    const baseDate = new Date();
    for (let i = 0; i < numPoints; i++) {
      const date = new Date(baseDate);
      if (period === "12H" || period === "1D") date.setHours(date.getHours() - (numPoints - i));
      else date.setDate(date.getDate() - (numPoints - i));
      const dataPoint: PriceData = {
        date: period === "12H" || period === "1D"
          ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      };
      symbols.forEach((symbol) => {
        const symbolSeed = symbol.charCodeAt(0) + symbol.charCodeAt(1) * 256;
        const timeSeed = i * 1000 + symbolSeed;
        const volatility = 0.02 + ((timeSeed * 9301 + 49297) % 65536) / 65536 * 0.03;
        const trend = (((timeSeed * 1103515245 + 12345) % 65536) / 65536 - 0.5) * 0.001;
        const previousValue = i === 0 ? 0 : (chartData[i - 1]?.[symbol] as number || 0);
        const change = (((timeSeed * 1664525 + 1013904223) % 65536) / 65536 - 0.5) * volatility + trend * i;
        dataPoint[symbol] = previousValue + change;
      });
      chartData.push(dataPoint);
    }
    const performanceData: PerformanceData[] = symbols.map((symbol, idx) => {
      const finalValue = chartData[chartData.length - 1][symbol] as number;
      const company = peerCompanies.find(c => c.id === symbol);
      return {
        symbol,
        name: company?.name || symbol,
        performance: finalValue * 100,
        color: symbol === currentSymbol ? "#f97316" : COLORS[idx % COLORS.length],
      };
    }).sort((a, b) => b.performance - a.performance);
    return { chartData, performanceData };
  };

  const dates = priceData.map(d => d.date as string);

  const buildOption = () => {
    const series = symbolsToFetch.map((symbol, idx) => {
      const data = priceData.map(d => Number(d[symbol] || 0) * 100);
      const isSubject = symbol === currentSymbol;
      const color = isSubject ? "#f97316" : COLORS[idx % COLORS.length];
      const last = data[data.length - 1] || 0;
      return {
        name: symbol,
        type: 'line',
        data,
        smooth: false,
        showSymbol: false,
        lineStyle: { width: isSubject ? 2.5 : 1.5, color },
        itemStyle: { color },
        endLabel: {
          show: true,
          formatter: (p: any) => `${symbol}  ${(last >= 0 ? '+' : '')}${last.toFixed(2)}%`,
          color,
          fontSize: 11,
          padding: [2, 4, 2, 4],
        },
      } as any;
    });

    // Compute y extents for better relative scale
    const allValues = symbolsToFetch.flatMap(s => priceData.map(d => Number(d[s] || 0) * 100));
    const minV = Math.min(0, ...allValues);
    const maxV = Math.max(0, ...allValues);
    const pad = Math.max(5, (maxV - minV) * 0.08);

    return {
      grid: { top: 12, right: 90, bottom: 30, left: 40 },
      tooltip: {
        trigger: 'axis',
        valueFormatter: (v: any) => `${(Number(v) >= 0 ? '+' : '')}${Number(v).toFixed(2)}%`,
      },
      legend: { show: false },
      xAxis: { type: 'category', data: dates, boundaryGap: false, axisLabel: { fontSize: 10 } },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(0)}%`, fontSize: 10 },
        min: Math.floor((minV - pad) / 5) * 5,
        max: Math.ceil((maxV + pad) / 5) * 5,
        splitLine: { lineStyle: { color: 'rgba(148,163,184,0.25)', type: 'dashed' } }
      },
      dataZoom: [ { type: 'inside' } ],
      series,
    } as any;
  };

  return (
    <ClientOnly fallback={
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Share Price Performance</h3>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
        <Card className="p-6">
          <div className="h-[400px] w-full flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart...</div>
          </div>
        </Card>
      </div>
    }>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Share Price Performance</h3>
            <p className="text-sm text-muted-foreground">Relative performance comparison with peer group</p>
          </div>
          <ToggleGroup type="single" value={timeframe} onValueChange={(v) => v && setTimeframe(v)}>
            <ToggleGroupItem value="12H" className="text-xs">12H</ToggleGroupItem>
            <ToggleGroupItem value="1D" className="text-xs">1D</ToggleGroupItem>
            <ToggleGroupItem value="1W" className="text-xs">1W</ToggleGroupItem>
            <ToggleGroupItem value="1M" className="text-xs">1M</ToggleGroupItem>
            <ToggleGroupItem value="3M" className="text-xs">3M</ToggleGroupItem>
            <ToggleGroupItem value="YTD" className="text-xs">YTD</ToggleGroupItem>
            <ToggleGroupItem value="1Y" className="text-xs">1Y</ToggleGroupItem>
            <ToggleGroupItem value="3Y" className="text-xs">3Y</ToggleGroupItem>
            <ToggleGroupItem value="5Y" className="text-xs">5Y</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Card className="p-6">
          <div className="h-[400px] w-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading price data...</div>
              </div>
            ) : (
              <ReactECharts notMerge lazyUpdate style={{ height: '100%', width: '100%' }} option={buildOption()} />
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="text-sm font-semibold mb-4">Performance Summary ({timeframe})</h4>
          <div className="space-y-2">
            {performanceData.map((item) => {
              const isCurrentSymbol = item.symbol === currentSymbol;
              return (
                <div key={item.symbol} className={cn("flex items-center justify-between p-3 rounded-lg transition-colors", isCurrentSymbol ? "bg-orange-50 dark:bg-orange-950/20" : "bg-muted/50")}> 
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn("font-medium text-sm", isCurrentSymbol && "text-orange-600 dark:text-orange-400")}>{item.symbol}</span>
                        {isCurrentSymbol && (<Badge variant="secondary" className="text-xs">Current</Badge>)}
                      </div>
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("font-mono text-sm font-medium", item.performance > 0 ? "text-green-600" : item.performance < 0 ? "text-red-600" : "")}>
                      {item.performance > 0 ? "+" : ""}{item.performance.toFixed(2)}%
                    </span>
                    {item.performance > 0 ? (<TrendingUp className="w-4 h-4 text-green-600" />) : item.performance < 0 ? (<TrendingDown className="w-4 h-4 text-red-600" />) : (<Minus className="w-4 h-4 text-muted-foreground" />)}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </ClientOnly>
  );
} 
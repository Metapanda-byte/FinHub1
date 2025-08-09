"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ClientOnly } from "@/components/ui/client-only";
import ReactECharts from "echarts-for-react";

interface PriceDataPoint {
  date: string;
  [symbol: string]: number | string;
}

const COLORS = ["#3b82f6", "#f97316", "#10b981", "#8b5cf6", "#ef4444", "#14b8a6", "#f59e0b", "#ec4899"];

function useSymbolsFromQuery(): string[] {
  const searchParams = useSearchParams();
  const symbolsParam = searchParams.get("symbols");
  const defaults = ["AAPL", "MSFT", "NVDA", "GOOGL"];
  try {
    if (!symbolsParam) return defaults;
    const raw = symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
    return raw.length > 0 ? raw : defaults;
  } catch {
    return defaults;
  }
}

function generateMockPriceData(symbols: string[], period: string) {
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
  const chartData: PriceDataPoint[] = [];
  const baseDate = new Date();
  for (let i = 0; i < numPoints; i++) {
    const date = new Date(baseDate);
    if (period === "12H" || period === "1D") date.setHours(date.getHours() - (numPoints - i));
    else date.setDate(date.getDate() - (numPoints - i));
    const dataPoint: PriceDataPoint = {
      date: period === "12H" || period === "1D"
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
    };
    symbols.forEach((symbol) => {
      // Deterministic base price per symbol
      const seed = Array.from(symbol).reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const basePrice = 40 + (seed % 300); // $40 - $340
      const prev = i === 0 ? basePrice : (chartData[i - 1]?.[symbol] as number || basePrice);
      const symbolSeed = symbol.charCodeAt(0) + symbol.charCodeAt(1) * 256;
      const timeSeed = i * 1000 + symbolSeed;
      const volatility = 0.004 + (((timeSeed * 9301 + 49297) % 65536) / 65536) * 0.006; // ~0.4% to 1.0% per step
      const trend = ((((timeSeed * 1103515245 + 12345) % 65536) / 65536) - 0.5) * 0.0005; // mild drift
      const shock = ((((timeSeed * 1664525 + 1013904223) % 65536) / 65536) - 0.5);
      const changePct = trend + shock * volatility;
      const price = Math.max(1, prev * (1 + changePct));
      dataPoint[symbol] = price;
    });
    chartData.push(dataPoint);
  }
  return chartData;
}

export default function SharePriceFormatPreviewPage() {
  const symbols = useSymbolsFromQuery();
  const [timeframe, setTimeframe] = useState<string>("YTD");
  const subject = symbols[0];

  const priceData = useMemo(() => generateMockPriceData(symbols, timeframe), [symbols, timeframe]);
  const dates = priceData.map((d) => d.date as string);

  const getSeriesData = (symbol: string) => priceData.map((d) => Number(d[symbol] || 0));
  const getChangePct = (symbol: string) => {
    const data = getSeriesData(symbol);
    const first = data[0] || 0;
    const last = data[data.length - 1] || 0;
    return first > 0 ? ((last / first) - 1) * 100 : 0;
  };

  const buildLineWithEndLabels = () => {
    const series = symbols.map((symbol, idx) => {
      const data = getSeriesData(symbol);
      const isSubject = symbol === subject;
      const color = isSubject ? "#f97316" : COLORS[idx % COLORS.length];
      const last = data[data.length - 1] || 0;
      const pct = getChangePct(symbol);
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
          formatter: () => `${symbol}  $${last.toFixed(2)} (${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%)`,
          color,
          fontSize: 11,
          padding: [2, 4, 2, 4],
        },
      } as any;
    });

    // Compute y extents for better scale
    const allValues = symbols.flatMap((s) => getSeriesData(s));
    const minV = Math.min(...allValues);
    const maxV = Math.max(...allValues);
    const pad = Math.max(1, (maxV - minV) * 0.08);

    return {
      grid: { top: 12, right: 140, bottom: 30, left: 50 },
      tooltip: { trigger: 'axis', valueFormatter: (v: any) => `$${Number(v).toFixed(2)}` },
      legend: { show: false },
      xAxis: { type: 'category', data: dates, boundaryGap: false, axisLabel: { fontSize: 10 } },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: (v: number) => `$${v.toFixed(0)}`, fontSize: 10 },
        min: Math.floor((minV - pad)),
        max: Math.ceil((maxV + pad)),
        splitLine: { lineStyle: { color: 'rgba(148,163,184,0.25)', type: 'dashed' } },
      },
      series,
    } as any;
  };

  const buildEmphasisArea = () => {
    const series = symbols.map((symbol, idx) => {
      const data = getSeriesData(symbol);
      const isSubject = symbol === subject;
      const color = isSubject ? "#f97316" : COLORS[idx % COLORS.length];
      return {
        name: symbol,
        type: 'line',
        data,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: isSubject ? 2.5 : 1, color, opacity: isSubject ? 1 : 0.7 },
        itemStyle: { color },
        areaStyle: isSubject
          ? {
              opacity: 0.12,
              color: {
                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(249, 115, 22, 0.22)' },
                  { offset: 1, color: 'rgba(249, 115, 22, 0.0)' },
                ],
              },
            }
          : undefined,
      } as any;
    });

    return {
      grid: { top: 12, right: 20, bottom: 30, left: 50 },
      tooltip: { trigger: 'axis', valueFormatter: (v: any) => `$${Number(v).toFixed(2)}` },
      legend: { show: false },
      xAxis: { type: 'category', data: dates, boundaryGap: false, axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { formatter: (v: number) => `$${v.toFixed(0)}`, fontSize: 10 } },
      series,
    } as any;
  };

  const buildRankBars = () => {
    const lastValues = symbols.map((s) => {
      const data = getSeriesData(s);
      const first = data[0] || 0;
      const last = data[data.length - 1] || 0;
      const pct = first > 0 ? ((last / first) - 1) * 100 : 0;
      return { symbol: s, pct };
    }).sort((a, b) => a.pct - b.pct);

    return {
      grid: { top: 10, right: 20, bottom: 20, left: 60 },
      tooltip: { trigger: 'item', valueFormatter: (v: any) => `${Number(v) >= 0 ? '+' : ''}${Number(v).toFixed(2)}%` },
      xAxis: { type: 'value', axisLabel: { formatter: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(0)}%` } },
      yAxis: { type: 'category', data: lastValues.map((d) => d.symbol) },
      series: [
        {
          type: 'bar',
          data: lastValues.map((d, idx) => ({ value: d.pct, itemStyle: { color: d.symbol === subject ? '#f97316' : COLORS[idx % COLORS.length] } })),
          label: { show: true, position: 'right', formatter: (p: any) => `${p.data.value >= 0 ? '+' : ''}${p.data.value.toFixed(2)}%` },
        },
      ],
    } as any;
  };

  const renderSparklines = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {symbols.map((s, idx) => {
          const data = getSeriesData(s);
          const color = s === subject ? "#f97316" : COLORS[idx % COLORS.length];
          const first = data[0] || 0;
          const last = data[data.length - 1] || 0;
          const pct = first > 0 ? ((last / first) - 1) * 100 : 0;
          const option = {
            grid: { top: 2, bottom: 2, left: 2, right: 2 },
            xAxis: { type: 'category', data: dates, show: false },
            yAxis: { type: 'value', show: false },
            series: [
              { type: 'line', data, smooth: true, showSymbol: false, lineStyle: { width: 1.5, color }, areaStyle: { opacity: 0.08, color } },
            ],
          } as any;
          return (
            <Card key={s} className="p-3">
              <div className="text-xs font-medium mb-2 flex items-center justify-between">
                <span className={s === subject ? "text-orange-600" : ""}>{s}</span>
                <span className={pct >= 0 ? "text-green-600" : "text-red-600"}>
                  ${last.toFixed(2)} ({pct >= 0 ? '+' : ''}{pct.toFixed(1)}%)
                </span>
              </div>
              <div className="h-16">
                <ReactECharts notMerge lazyUpdate style={{ height: '100%', width: '100%' }} option={option} />
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <ClientOnly>
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-semibold">Share Price Performance – Format Options</h1>
            <p className="text-sm text-muted-foreground">Previewed using the same editor controls as in the peers section. Use symbols= query param to customize.</p>
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

        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3">Option A: Multi-line with end labels (current style)</h2>
          <div className="h-[360px] w-full">
            <ReactECharts notMerge lazyUpdate style={{ height: '100%', width: '100%' }} option={buildLineWithEndLabels()} />
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3">Option B: Emphasis area for subject, subtle peers</h2>
          <div className="h-[360px] w-full">
            <ReactECharts notMerge lazyUpdate style={{ height: '100%', width: '100%' }} option={buildEmphasisArea()} />
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3">Option C: Ranked performance bars</h2>
          <div className="h-[320px] w-full">
            <ReactECharts notMerge lazyUpdate style={{ height: '100%', width: '100%' }} option={buildRankBars()} />
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3">Option D: Mini sparklines per symbol</h2>
          {renderSparklines()}
        </Card>
      </div>
    </ClientOnly>
  );
} 
"use client";

import { useMemo, useState, useEffect } from "react";
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
  const single = searchParams.get("symbol");
  const symbolsParam = searchParams.get("symbols");
  const defaults = ["AAPL"];
  try {
    if (single) return [single.trim().toUpperCase()];
    if (symbolsParam) {
      const raw = symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
      return raw.length > 0 ? [raw[0]] : defaults;
    }
    return defaults;
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
  const [realDates, setRealDates] = useState<string[] | null>(null);
  const [realSeries, setRealSeries] = useState<number[] | null>(null);
  const [realOHLC, setRealOHLC] = useState<Array<[string, number, number, number, number]> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Map UI timeframe to API timeframe (daily series)
  const apiTimeframe = useMemo(() => {
    switch (timeframe) {
      case "12H":
      case "1D":
      case "1W":
        return "1M"; // Collapse intraday/weekly to 1M daily
      case "1M":
      case "3M":
      case "YTD":
      case "1Y":
      case "5Y":
        return timeframe;
      default:
        return "1Y";
    }
  }, [timeframe]);

  useEffect(() => {
    let cancelled = false;
    const fetchReal = async () => {
      if (!subject) return;
      setLoading(true);
      setApiError(null);
      try {
        const res = await fetch(`/api/stock/${encodeURIComponent(subject)}/price?timeframe=${apiTimeframe}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Array<{ date: string; close: number; open: number; high: number; low: number; price?: number } & any> = await res.json();
        // Ensure ascending order
        const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const dates = sorted.map(d => d.date);
        const series = sorted.map(d => Number(d.close ?? d.price));
        const ohlc: Array<[string, number, number, number, number]> = sorted.map(d => [
          d.date,
          Number((d.open ?? d.close).toFixed(2)),
          Number((d.close ?? d.price).toFixed(2)),
          Number((d.low ?? d.close).toFixed(2)),
          Number((d.high ?? d.close).toFixed(2)),
        ]);
        if (!cancelled) {
          setRealDates(dates);
          setRealSeries(series);
          setRealOHLC(ohlc);
        }
      } catch (e: any) {
        if (!cancelled) {
          setApiError(e?.message || "Failed to load");
          setRealDates(null);
          setRealSeries(null);
          setRealOHLC(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchReal();
    return () => { cancelled = true; };
  }, [subject, apiTimeframe]);

  // Fallback mock data if API fails
  const fallbackPriceData = useMemo(() => generateMockPriceData([subject], timeframe), [subject, timeframe]);
  const dates = (realDates ?? fallbackPriceData.map(d => d.date as string));
  const getSeriesData = (symbol: string) => (realSeries ?? fallbackPriceData.map(d => Number(d[symbol] || 0)));
  const getChangePct = (symbol: string) => {
    const data = getSeriesData(symbol);
    const first = data[0] || 0;
    const last = data[data.length - 1] || 0;
    return first > 0 ? ((last / first) - 1) * 100 : 0;
  };

  // Create mock OHLC from price path for candlestick option
  const buildOHLC = () => {
    if (realOHLC) return realOHLC;
    const s = subject;
    const ohlc = [] as Array<[string, number, number, number, number]>; // [date, open, close, low, high]
    const series = getSeriesData(s);
    for (let i = 0; i < series.length; i++) {
      const open = i === 0 ? series[i] : series[i - 1];
      const close = series[i];
      const baseLow = Math.min(open, close);
      const baseHigh = Math.max(open, close);
      const jitter = 0.01 * baseHigh; // ~1%
      const low = Math.max(1, baseLow - jitter * 0.6);
      const high = baseHigh + jitter * 0.6;
      ohlc.push([dates[i], Number(open.toFixed(2)), Number(close.toFixed(2)), Number(low.toFixed(2)), Number(high.toFixed(2))]);
    }
    return ohlc;
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

  const buildCandlesticks = () => {
    const ohlc = buildOHLC();
    return {
      grid: { top: 10, right: 20, bottom: 30, left: 60 },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ohlc.map(o => o[0]) },
      yAxis: { scale: true },
      series: [
        {
          type: 'candlestick',
          name: subject,
          data: ohlc.map(o => [o[1], o[2], o[3], o[4]]), // [open, close, low, high]
          itemStyle: {
            color: '#16a34a',
            color0: '#ef4444',
            borderColor: '#16a34a',
            borderColor0: '#ef4444',
          },
        },
      ],
    } as any;
  };

  const renderSparklines = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[subject].map((s, idx) => {
          const data = getSeriesData(s);
          const color = "#f97316";
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
                <span className="text-orange-600">{s}</span>
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
            <h1 className="text-xl font-semibold">Share Price – Single Stock Format Options</h1>
            <p className="text-sm text-muted-foreground">Use ?symbol=AAPL to choose the ticker. Timeframe controls match the peers editor.</p>
            {apiError && (
              <p className="text-xs text-red-500">Live price fetch failed: {apiError}. Showing fallback data.</p>
            )}
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
          <h2 className="text-sm font-semibold mb-3">Option A: Line with end label (price + period %)</h2>
          <div className="h-[360px] w-full">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">Loading live prices…</div>
            ) : (
              <ReactECharts notMerge lazyUpdate style={{ height: '100%', width: '100%' }} option={buildLineWithEndLabels()} />
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3">Option B: Emphasis area (subject focus)</h2>
          <div className="h-[360px] w-full">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">Loading live prices…</div>
            ) : (
              <ReactECharts notMerge lazyUpdate style={{ height: '100%', width: '100%' }} option={buildEmphasisArea()} />
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3">Option C: Candlestick (derived OHLC)</h2>
          <div className="h-[360px] w-full">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">Loading live prices…</div>
            ) : (
              <ReactECharts notMerge lazyUpdate style={{ height: '100%', width: '100%' }} option={buildCandlesticks()} />
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3">Option D: Compact sparkline</h2>
          {renderSparklines()}
        </Card>
      </div>
    </ClientOnly>
  );
} 
"use client";

import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { ClientOnly } from "@/components/ui/client-only";

export type OverviewTimeframe = 'YTD' | '1Y' | '5Y';

interface Props {
  symbol: string;
  timeframe?: OverviewTimeframe;
  height?: number;
  onTimeframeChange?: (tf: OverviewTimeframe) => void;
}

export function OverviewPriceOptionA({ symbol, timeframe = 'YTD', height = 280, onTimeframeChange }: Props) {
  const [dates, setDates] = useState<string[] | null>(null);
  const [series, setSeries] = useState<number[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [tf, setTf] = useState<OverviewTimeframe>(timeframe);

  useEffect(() => { setTf(timeframe); }, [timeframe]);

  // Map to API timeframe
  const apiTimeframe = useMemo<OverviewTimeframe>(() => tf, [tf]);

  useEffect(() => {
    let cancelled = false;
    const fetchReal = async () => {
      if (!symbol) return;
      setLoading(true);
      setApiError(null);
      try {
        const res = await fetch(`/api/stock/${encodeURIComponent(symbol)}/price?timeframe=${apiTimeframe}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Array<{ date: string; close?: number; price?: number }> = await res.json();
        const sorted = [...data]
          .map(d => ({ date: d.date, value: Number(d.close ?? d.price) }))
          .filter(d => Number.isFinite(d.value))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (!cancelled) {
          setDates(sorted.map(d => d.date));
          setSeries(sorted.map(d => d.value));
        }
      } catch (e: any) {
        if (!cancelled) setApiError(e?.message || 'Failed to fetch');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchReal();
    return () => { cancelled = true; };
  }, [symbol, apiTimeframe]);

  const option = useMemo(() => {
    if (!dates || !series) return {} as any;
    const last = series[series.length - 1] ?? 0;
    const first = series[0] ?? 0;
    const pct = first > 0 ? ((last / first) - 1) * 100 : 0;

    // y extents
    const rawMin = Math.min(...series);
    const rawMax = Math.max(...series);
    const pad = Math.max(1, (rawMax - rawMin) * 0.08);
    const minV = rawMin - pad;
    const maxV = rawMax + pad;

    // Compute nice bounds for evenly distributed ticks
    const computeNice = (min: number, max: number, desiredSplits = 6) => {
      const niceNum = (range: number, round: boolean) => {
        const exp = Math.floor(Math.log10(range));
        const frac = range / Math.pow(10, exp);
        let niceFrac;
        if (round) {
          if (frac < 1.5) niceFrac = 1;
          else if (frac < 3) niceFrac = 2;
          else if (frac < 7) niceFrac = 5;
          else niceFrac = 10;
        } else {
          if (frac <= 1) niceFrac = 1;
          else if (frac <= 2) niceFrac = 2;
          else if (frac <= 5) niceFrac = 5;
          else niceFrac = 10;
        }
        return niceFrac * Math.pow(10, exp);
      };
      const range = niceNum(max - min, false);
      const step = niceNum(range / (desiredSplits - 1), true);
      const niceMin = Math.floor(min / step) * step;
      const niceMax = Math.ceil(max / step) * step;
      const splits = Math.round((niceMax - niceMin) / step);
      return { niceMin, niceMax, splits };
    };
    const { niceMin, niceMax, splits } = computeNice(minV, maxV, 6);

    // Date label format: dd-MMM-yy for <= 1M windows (we only expose YTD/1Y/5Y, so use MMM-yy)
    const formatLabel = (d: string) => {
      const dt = new Date(d);
      const month = dt.toLocaleString(undefined, { month: 'short' });
      const year = String(dt.getFullYear()).slice(-2);
      return `${month}-${year}`;
    };

    return {
      grid: { top: 4, right: 12, bottom: 22, left: 46 },
      tooltip: { trigger: 'axis', valueFormatter: (v: any) => `$${Number(v).toFixed(2)}` },
      legend: { show: false },
      xAxis: { type: 'category', data: dates, boundaryGap: false, axisLabel: { fontSize: 12, formatter: formatLabel } },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: (v: number) => `$${v.toFixed(0)}`, fontSize: 12 },
        min: niceMin,
        max: niceMax,
        splitNumber: Math.max(2, Math.min(10, splits)),
        splitLine: { lineStyle: { color: 'rgba(148,163,184,0.25)', type: 'dashed' } },
      },
      series: [
        {
          name: symbol,
          type: 'line',
          data: series,
          smooth: false,
          showSymbol: false,
          lineStyle: { width: 2, color: '#f97316' },
          itemStyle: { color: '#f97316' },
        },
      ],
    } as any;
  }, [dates, series, symbol, tf]);

  const handleTfChange = (next: OverviewTimeframe) => {
    setTf(next);
    onTimeframeChange?.(next);
  };

  // Precompute header values
  const headerLast = series?.[series.length - 1] ?? null;
  const headerFirst = series?.[0] ?? null;
  const headerPct = headerFirst && headerFirst > 0 && headerLast != null ? ((headerLast / headerFirst) - 1) * 100 : null;

  return (
    <ClientOnly>
      <div className="w-full">
        {apiError && (
          <div className="text-[11px] text-red-500 mb-1">Live price fetch failed: {apiError}</div>
        )}
        {/* Header box with symbol and performance, timeframe on right */}
        <div className="flex items-center justify-between mb-1">
          <div className="text-[13px] font-semibold text-[#f97316]">
            {symbol && headerLast != null && headerPct != null ? (
              <span>{symbol}  ${headerLast.toFixed(2)} ({headerPct >= 0 ? '+' : ''}{headerPct.toFixed(2)}%)</span>
            ) : (
              <span>{symbol}</span>
            )}
          </div>
          {/* Local timeframe selector to match others on page */}
          <div className="flex justify-end gap-1">
            {(['YTD','1Y','5Y'] as OverviewTimeframe[]).map((t) => (
              <button
                key={t}
                onClick={() => handleTfChange(t)}
                className={`h-6 px-2 rounded border text-[11px] ${tf===t ? 'bg-[hsl(var(--finhub-orange))] text-white border-transparent' : 'bg-transparent text-foreground border-border'}`}
              >{t}</button>
            ))}
          </div>
        </div>
        <div style={{ height, width: '100%' }}>
          {loading || !dates || !series ? (
            <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">Loading…</div>
          ) : (
            <ReactECharts notMerge lazyUpdate style={{ height: '100%', width: '100%' }} option={option} />
          )}
        </div>
      </div>
    </ClientOnly>
  );
} 
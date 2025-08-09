"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import { useMediaQuery } from "@/hooks/use-media-query";
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import 'echarts/lib/chart/scatter';
import ecStat from 'echarts-stat';

interface ValuationData {
  ticker: string;
  company: string;
  sector: string;
  marketCap: number;
  evToEbitda: number;
  peRatio: number;
  priceToSales: number;
  priceToBook: number;
  dividendYield: number;
}

interface PerformanceData {
  ticker: string;
  company: string;
  sector: string;
  revenueGrowth: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  roic: number;
  roe: number;
  ebitdaMargin?: number;
}

interface CorrelationChartsTabProps {
  peerValuationData: ValuationData[];
  peerPerformanceData: PerformanceData[];
  currentSymbol: string;
  allValuationData: ValuationData[];
  allPerformanceData: PerformanceData[];
}

const DASHBOARD_CHARTS = [
  { id: 'pe_vs_growth', title: 'P/E Ratio vs Revenue Growth', xKey: 'revenueGrowth', xFormat: 'percentage', xLabel: 'Revenue Growth (%)', yKey: 'peRatio', yFormat: 'number', yLabel: 'P/E (x)' },
  { id: 'pb_vs_roe', title: 'P/B Ratio vs ROE', xKey: 'roe', xFormat: 'percentage', xLabel: 'ROE (%)', yKey: 'priceToBook', yFormat: 'number', yLabel: 'P/B (x)' },
  { id: 'ev_ebitda_vs_ebitda_margin', title: 'EV/EBITDA vs EBITDA Margin', xKey: 'ebitdaMargin', xFormat: 'percentage', xLabel: 'EBITDA Margin (%)', yKey: 'evToEbitda', yFormat: 'number', yLabel: 'EV/EBITDA (x)' },
  { id: 'ps_vs_op_margin', title: 'P/S Ratio vs Operating Margin', xKey: 'operatingMargin', xFormat: 'percentage', xLabel: 'Operating Margin (%)', yKey: 'priceToSales', yFormat: 'number', yLabel: 'P/S (x)' },
  { id: 'div_yield_vs_growth', title: 'Dividend Yield vs Revenue Growth', xKey: 'revenueGrowth', xFormat: 'percentage', xLabel: 'Revenue Growth (%)', yKey: 'dividendYield', yFormat: 'percentage', yLabel: 'Dividend Yield (%)' },
  { id: 'mcap_vs_net_margin', title: 'Market Cap vs Net Margin', xKey: 'netMargin', xFormat: 'percentage', xLabel: 'Net Margin (%)', yKey: 'marketCap', yFormat: 'currency', yLabel: 'Market Cap (USD)' },
] as const;

type DashboardChart = typeof DASHBOARD_CHARTS[number];

const formatTick = (value: number, format: 'currency' | 'percentage' | 'number') => {
  if (value == null || isNaN(value)) return 'N/A';
  if (format === 'currency') return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (format === 'percentage') return `${value.toFixed(1)}%`;
  return `${value.toFixed(1)}`;
};

// @ts-ignore - echarts-stat doesn't ship full TS types
echarts.registerTransform((ecStat as any).transform.regression);

export function CorrelationChartsTab({
  peerValuationData,
  peerPerformanceData,
  currentSymbol,
  allValuationData,
  allPerformanceData
}: CorrelationChartsTabProps) {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const combined = useMemo(() => {
    return allValuationData.map(v => {
      const p = allPerformanceData.find(pp => pp.ticker === v.ticker);
      return { ...v, ...p, isSubject: v.ticker === currentSymbol, isSelected: peerValuationData.some(sel => sel.ticker === v.ticker) };
    }).filter(d => d.ticker && d.company);
  }, [allValuationData, allPerformanceData, currentSymbol, peerValuationData]);

  const buildOption = (cfg: DashboardChart) => {
    const peers = combined.filter(d => !d.isSubject && Number.isFinite((d as any)[cfg.xKey]) && Number.isFinite((d as any)[cfg.yKey]));
    const subject = combined.filter(d => d.isSubject && Number.isFinite((d as any)[cfg.xKey]) && Number.isFinite((d as any)[cfg.yKey]));

    // Store market cap in billions for scaling
    const toPoint = (d: any) => ({
      value: [Number((d as any)[cfg.xKey]), Number((d as any)[cfg.yKey]), (d.marketCap || 0) / 1_000_000_000, d.ticker],
      mcapB: (d.marketCap || 0) / 1_000_000_000,
      ticker: d.ticker,
    });
    const peerDataRaw = peers.map(toPoint);
    const subjectDataRaw = subject.map(toPoint);

    // On mobile, label only subject and top-N by market cap to reduce clutter
    const topN = 5;
    const labeledTickers = new Set<string>();
    subjectDataRaw.forEach(d => labeledTickers.add(d.ticker));
    if (isMobile) {
      peerDataRaw
        .slice()
        .sort((a, b) => b.mcapB - a.mcapB)
        .slice(0, topN)
        .forEach(d => labeledTickers.add(d.ticker));
    }
    const peerData = peerDataRaw.map(d => ({
      ...d,
      label: { show: !isMobile || labeledTickers.has(d.ticker) }
    }));
    const subjectData = subjectDataRaw.map(d => ({ ...d, label: { show: true } }));

    // regression on peers + subject for context
    const regSource = peerData.concat(subjectData).map((p: any) => [p.value[0], p.value[1]]);

    const scaleSize = (billions: number) => {
      if (!isFinite(billions) || billions <= 0) return 6;
      const r = 6 + Math.min(40, Math.log10(billions + 1) * 12);
      return r;
    };

    return {
      grid: { top: 12, right: 8, bottom: isMobile ? 10 : 18, left: 30 },
      tooltip: {
        trigger: 'item',
        formatter: (p: any) => {
          const v = p.data.value || p.data;
          return `${v[3]}\n${cfg.xLabel}: ${formatTick(v[0], cfg.xFormat as any)}\n${cfg.yLabel}: ${formatTick(v[1], cfg.yFormat as any)}`;
        },
        backgroundColor: '#111827', borderColor: '#374151', textStyle: { fontSize: isMobile ? 9 : 10 },
      },
      legend: { show: false },
      xAxis: { name: cfg.xLabel, nameGap: 4, nameTextStyle: { fontSize: isMobile ? 9 : 10, color: '#9ca3af' }, axisLabel: { fontSize: isMobile ? 9 : 10, color: '#9ca3af', formatter: (v: number) => formatTick(v, cfg.xFormat as any) }, splitLine: { lineStyle: { color: 'rgba(148,163,184,0.25)', type: 'dashed' } } },
      yAxis: { name: cfg.yLabel, nameGap: 6, nameTextStyle: { fontSize: isMobile ? 9 : 10, color: '#9ca3af' }, axisLabel: { fontSize: isMobile ? 9 : 10, color: '#9ca3af', formatter: (v: number) => formatTick(v, cfg.yFormat as any) }, splitLine: { lineStyle: { color: 'rgba(148,163,184,0.25)', type: 'dashed' } } },
      dataZoom: isMobile ? [
        { type: 'inside', xAxisIndex: 0 },
        { type: 'inside', yAxisIndex: 0 }
      ] : [],
      series: [
        {
          name: 'Peers', type: 'scatter', data: peerData,
          symbolSize: (val: any) => scaleSize(Number((val.value || val)[2])),
          itemStyle: { color: '#93C5FD', borderColor: '#60A5FA' },
          label: { show: !isMobile, formatter: (p: any) => (p.data.value ? p.data.value[3] : p.data[3]), position: 'right', color: '#6B7280', fontSize: isMobile ? 9 : 10 },
          labelLayout: { moveOverlap: 'shiftX' },
          emphasis: { label: { show: true } },
        },
        {
          name: currentSymbol, type: 'scatter', data: subjectData,
          symbolSize: (val: any) => Math.max(10, scaleSize(Number((val.value || val)[2])) + 2),
          itemStyle: { color: '#FF6B35', borderColor: '#E55A2B' },
          label: { show: true, formatter: (p: any) => (p.data.value ? p.data.value[3] : p.data[3]), position: 'right', color: '#FF6B35', fontSize: isMobile ? 10 : 11, fontWeight: 600 },
          labelLayout: { moveOverlap: 'shiftX' },
        },
        {
          name: 'Trend', type: 'line', datasetIndex: 1, smooth: true, symbol: 'none', lineStyle: { color: 'rgba(148,163,184,0.6)', width: 1.5, type: 'dashed' },
          encode: { x: 0, y: 1 }
        }
      ],
      dataset: [ { source: regSource }, { transform: { type: 'ecStat:regression', config: { method: 'linear' } } } ]
    } as any;
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
        {DASHBOARD_CHARTS.map(cfg => (
          <Card key={cfg.id} className={`${isMobile ? 'h-[300px]' : 'h-[360px]'} border-0 shadow-none bg-transparent`}>
            <CardHeader className="pb-1"><SectionTitle size="sm" muted className="tracking-wide">{cfg.title}</SectionTitle></CardHeader>
            <CardContent className={isMobile ? 'h-[260px]' : 'h-[310px]'}>
              <ReactECharts notMerge lazyUpdate style={{ height: '100%', width: '100%' }} option={buildOption(cfg)} theme={undefined} />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-[11px] text-muted-foreground mt-1">Bubble size represents Market Capitalization (USD).</div>
    </div>
  );
}
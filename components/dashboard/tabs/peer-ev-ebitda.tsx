"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ClientOnly } from "@/components/ui/client-only";
import ReactECharts from 'echarts-for-react';
import { useIncomeStatements, useBalanceSheets, useStockQuote } from "@/lib/api/financial";
import { getFxToUSD, fxToUSD } from "@/lib/financial";

interface PeerEvEbitdaProps {
  currentSymbol: string;
  selectedPeers: string[];
  peerCompanies: Array<{ id: string; name: string }>;
}

interface EvEbitdaData {
  date: string;
  [symbol: string]: number | string;
}

interface EvEbitdaMetrics {
  symbol: string;
  name: string;
  currentRatio: number;
  avgRatio: number;
  color: string;
}

// Match correlation charts palette
const SUBJECT_COLOR = "#FF6B35"; // orange
const PEER_BLUE = "#93C5FD";     // matte blue fill used in bubbles

// Helper to calculate LTM (Last Twelve Months) value from quarterly data
function calculateLTM(
  quarterlyStatements: any[],
  field: string
): number | null {
  if (!quarterlyStatements || quarterlyStatements.length < 4) return null;
  
  // Sort by date descending to get most recent quarters first
  const sorted = quarterlyStatements
    .filter(s => s?.[field] != null && !isNaN(Number(s[field])))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4); // Take last 4 quarters
  
  if (sorted.length < 4) return null;
  
  return sorted.reduce((sum, statement) => sum + Number(statement[field]), 0);
}

// Helper to calculate Enterprise Value
async function calculateEnterpriseValue(
  marketCap: number,
  balanceSheet: any,
  reportedCurrency?: string
): Promise<number> {
  if (!balanceSheet) return marketCap;
  
  const fxRates = await getFxToUSD();
  const fxRate = fxToUSD(fxRates, reportedCurrency);
  
  const totalDebt = (balanceSheet.shortTermDebt || 0) + (balanceSheet.longTermDebt || 0);
  const cash = balanceSheet.cashAndCashEquivalents || 0;
  const netDebt = (totalDebt - cash) * fxRate * 1000000; // Convert to actual value
  
  return marketCap + netDebt;
}

export function PeerEvEbitda({ currentSymbol, selectedPeers, peerCompanies }: PeerEvEbitdaProps) {
  const [timeframe, setTimeframe] = useState<string>("1Y");
  const [evEbitdaData, setEvEbitdaData] = useState<EvEbitdaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [metricsData, setMetricsData] = useState<EvEbitdaMetrics[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const symbolsToFetch = useMemo(() => {
    const symbols = [currentSymbol, ...selectedPeers].filter(Boolean);
    return Array.from(new Set(symbols));
  }, [currentSymbol, selectedPeers]);

  useEffect(() => {
    let cancelled = false;

    const fetchEvEbitdaData = async () => {
      if (symbolsToFetch.length === 0) return;
      setLoading(true);
      setApiError(null);
      
      try {
        // Map timeframe to API parameter
        const mapTimeframeForApi = (tf: string): string => {
          switch (tf) {
            case "1Y": return "1Y";
            case "2Y": return "2Y"; 
            case "3Y": return "3Y";
            case "5Y": return "5Y";
            default: return "1Y";
          }
        };

        const results = await Promise.all(
          symbolsToFetch.map(async (symbol) => {
            try {
              // Fetch daily price data, quarterly income statements, and annual balance sheets
              const [priceRes, incomeRes, balanceRes, quoteRes] = await Promise.all([
                fetch(`/api/stock/${encodeURIComponent(symbol)}/price?timeframe=${mapTimeframeForApi(timeframe)}`),
                fetch(`/api/financial/income-statement?symbol=${encodeURIComponent(symbol)}&period=quarter&limit=20`),
                fetch(`/api/financial/balance-sheet?symbol=${encodeURIComponent(symbol)}&period=annual&limit=5`),
                fetch(`/api/stock/${encodeURIComponent(symbol)}/quote`)
              ]);

              if (!priceRes.ok || !incomeRes.ok || !balanceRes.ok || !quoteRes.ok) {
                throw new Error(`Failed to fetch data for ${symbol}`);
              }

              const priceData = await priceRes.json();
              const incomeData = await incomeRes.json();
              const balanceData = await balanceRes.json();
              const quoteData = await quoteRes.json();

              return { symbol, priceData, incomeData, balanceData, quoteData };
            } catch (error) {
              console.warn(`Error fetching data for ${symbol}:`, error);
              return { symbol, priceData: [], incomeData: [], balanceData: [], quoteData: null };
            }
          })
        );

        // Build unified date axis from all price data
        const dateSet = new Set<string>();
        results.forEach(r => r.priceData.forEach((d: any) => dateSet.add(d.date)));
        const dates = Array.from(dateSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        // Calculate daily EV/EBITDA ratios
        const chartData: EvEbitdaData[] = [];
        const metrics: EvEbitdaMetrics[] = [];

        // Process each date
        for (const date of dates) {
          const dataPoint: EvEbitdaData = { date };

          for (const result of results) {
            const { symbol, priceData, incomeData, balanceData, quoteData } = result;
            
            if (!incomeData.length || !balanceData.length || !quoteData || !priceData.length) {
              dataPoint[symbol] = null as any;
              continue;
            }

            try {
              // Find price data for this date
              const pricePoint = priceData.find((p: any) => p.date === date);
              if (!pricePoint) {
                dataPoint[symbol] = null as any;
                continue;
              }

              // Get quarterly income statements up to this date for LTM calculation
              const relevantQuarters = incomeData
                .filter((stmt: any) => new Date(stmt.date) <= new Date(date))
                .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 4);

              if (relevantQuarters.length < 4) {
                dataPoint[symbol] = null as any;
                continue;
              }

              // Calculate LTM EBITDA
              const ltmEbitda = calculateLTM(relevantQuarters, 'ebitda');
              if (!ltmEbitda || ltmEbitda <= 0) {
                dataPoint[symbol] = null as any;
                continue;
              }

              // Get the most recent balance sheet relative to this date
              const relevantBalance = balanceData
                .filter((bs: any) => new Date(bs.date) <= new Date(date))
                .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

              if (!relevantBalance) {
                dataPoint[symbol] = null as any;
                continue;
              }

              // Calculate daily market cap using price from this date and shares outstanding
              const sharesOutstanding = quoteData.sharesOutstanding;
              const dailyPrice = pricePoint.close || pricePoint.price;
              const dailyMarketCap = dailyPrice * sharesOutstanding;

              if (!dailyMarketCap || !sharesOutstanding) {
                dataPoint[symbol] = null as any;
                continue;
              }

              // Calculate Enterprise Value using daily market cap
              const enterpriseValue = await calculateEnterpriseValue(
                dailyMarketCap,
                relevantBalance,
                relevantBalance.reportedCurrency
              );

              // Calculate EV/EBITDA using daily EV and LTM EBITDA
              const evEbitdaRatio = enterpriseValue / (ltmEbitda * 1000000); // Convert EBITDA to actual value
              dataPoint[symbol] = evEbitdaRatio;
              
            } catch (error) {
              console.warn(`Error calculating EV/EBITDA for ${symbol} on ${date}:`, error);
              dataPoint[symbol] = null as any;
            }
          }

          chartData.push(dataPoint);
        }

        // Calculate metrics summary
        for (const symbol of symbolsToFetch) {
          const company = peerCompanies.find(c => c.id === symbol);
          const symbolData = chartData.map(d => Number(d[symbol])).filter(v => !isNaN(v) && v > 0);
          
          if (symbolData.length > 0) {
            const currentRatio = symbolData[symbolData.length - 1] || 0;
            const avgRatio = symbolData.reduce((sum, val) => sum + val, 0) / symbolData.length;
            
            metrics.push({
              symbol,
              name: company?.name || symbol,
              currentRatio,
              avgRatio,
              color: symbol === currentSymbol ? SUBJECT_COLOR : PEER_BLUE,
            });
          }
        }

        if (cancelled) return;
        setEvEbitdaData(chartData);
        setMetricsData(metrics.sort((a, b) => a.currentRatio - b.currentRatio));

      } catch (error: any) {
        if (!cancelled) {
          setApiError(error?.message || 'Failed to load EV/EBITDA data');
          // Generate fallback mock data
          const mockData = generateMockEvEbitdaData(symbolsToFetch, timeframe);
          setEvEbitdaData(mockData.chartData);
          setMetricsData(mockData.metricsData);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEvEbitdaData();
    return () => { cancelled = true; };
  }, [symbolsToFetch, timeframe, peerCompanies, currentSymbol]); // generateMockEvEbitdaData is defined inside useEffect

  const generateMockEvEbitdaData = (symbols: string[], period: string) => {
    const periods: Record<string, number> = {
      "1Y": 252, // ~252 trading days in a year
      "2Y": 504,
      "3Y": 756,
      "5Y": 1260,
    };
    
    const numPoints = periods[period] || 252;
    const chartData: EvEbitdaData[] = [];
    const baseDate = new Date();
    
    for (let i = 0; i < numPoints; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - (numPoints - i)); // Daily intervals
      
      const dataPoint: EvEbitdaData = {
        date: date.toISOString().slice(0, 10), // YYYY-MM-DD format
      };
      
      symbols.forEach((symbol) => {
        const symbolSeed = symbol.charCodeAt(0) + symbol.charCodeAt(1) * 256;
        const timeSeed = i * 1000 + symbolSeed;
        const baseRatio = 12 + ((timeSeed * 9301 + 49297) % 65536) / 65536 * 8; // 12-20x range
        const volatility = 0.5 + (((timeSeed * 1103515245 + 12345) % 65536) / 65536 - 0.5) * 1.5; // Daily volatility
        dataPoint[symbol] = Math.max(5, baseRatio + volatility);
      });
      
      chartData.push(dataPoint);
    }
    
    const metricsData: EvEbitdaMetrics[] = symbols.map((symbol) => {
      const company = peerCompanies.find(c => c.id === symbol);
      const symbolData = chartData.map(d => Number(d[symbol]));
      const currentRatio = symbolData[symbolData.length - 1] || 0;
      const avgRatio = symbolData.reduce((sum, val) => sum + val, 0) / symbolData.length;
      
      return {
        symbol,
        name: company?.name || symbol,
        currentRatio,
        avgRatio,
        color: symbol === currentSymbol ? SUBJECT_COLOR : PEER_BLUE,
      };
    }).sort((a, b) => a.currentRatio - b.currentRatio);
    
    return { chartData, metricsData };
  };

  const dates = evEbitdaData.map(d => d.date as string);

  const buildOption = () => {
    // Sample data for better performance with large datasets
    const sampleData = (data: EvEbitdaData[], maxPoints: number = 500) => {
      if (data.length <= maxPoints) return data;
      const step = Math.ceil(data.length / maxPoints);
      return data.filter((_, index) => index % step === 0);
    };

    const sampledData = sampleData(evEbitdaData);
    const sampledDates = sampledData.map(d => d.date as string);

    const series = symbolsToFetch.map((symbol) => {
      const data = sampledData.map(d => d[symbol] as number || null);
      const isSubject = symbol === currentSymbol;
      const color = isSubject ? SUBJECT_COLOR : PEER_BLUE;
      const last = data.filter(v => v !== null).slice(-1)[0] || 0;
      
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
          formatter: () => `${symbol}  ${last.toFixed(1)}x`,
          color,
          fontSize: 11,
          fontWeight: isSubject ? 700 : 500,
          padding: [2, 4, 2, 4],
        },
      } as any;
    });

    // Compute y extents
    const allValues = sampledData.flatMap(d => 
      symbolsToFetch.map(s => d[s] as number).filter(v => v !== null && !isNaN(v))
    );
    const minV = Math.min(...allValues);
    const maxV = Math.max(...allValues);
    const pad = Math.max(2, (maxV - minV) * 0.1);

    return {
      grid: { top: 12, right: 120, bottom: 30, left: 50 },
      tooltip: {
        trigger: 'axis',
        valueFormatter: (v: any) => `${Number(v).toFixed(1)}x`,
      },
      legend: { show: false },
      xAxis: { 
        type: 'category', 
        data: sampledDates, 
        boundaryGap: false, 
        axisLabel: { 
          fontSize: 11,
          formatter: (value: string) => {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
        } 
      },
      yAxis: {
        type: 'value',
        axisLabel: { 
          formatter: (v: number) => `${v.toFixed(0)}x`, 
          fontSize: 11 
        },
        min: Math.max(0, Math.floor((minV - pad) / 2) * 2),
        max: Math.ceil((maxV + pad) / 2) * 2,
        splitLine: { lineStyle: { color: 'rgba(148,163,184,0.25)', type: 'dashed' } }
      },
      dataZoom: [{ type: 'inside' }],
      series,
    } as any;
  };

  return (
    <ClientOnly fallback={
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">EV/EBITDA Multiple</h3>
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
            <h3 className="text-lg font-semibold">EV/EBITDA Multiple</h3>
            <p className="text-sm text-muted-foreground">Rolling Enterprise Value to LTM EBITDA comparison with peer group</p>
            {apiError && (
              <p className="text-xs text-red-500">Live data fetch failed: {apiError}. Showing fallback data.</p>
            )}
          </div>
          <ToggleGroup type="single" value={timeframe} onValueChange={(v) => v && setTimeframe(v)}>
            <ToggleGroupItem value="1Y" className="text-xs">1Y</ToggleGroupItem>
            <ToggleGroupItem value="2Y" className="text-xs">2Y</ToggleGroupItem>
            <ToggleGroupItem value="3Y" className="text-xs">3Y</ToggleGroupItem>
            <ToggleGroupItem value="5Y" className="text-xs">5Y</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Card className="p-6">
          <div className="h-[400px] w-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading EV/EBITDA data...</div>
              </div>
            ) : (
              <ReactECharts notMerge lazyUpdate style={{ height: '100%', width: '100%' }} option={buildOption()} />
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="text-sm font-semibold mb-4">Current Multiple vs. Average ({timeframe})</h4>
          <div className="space-y-2">
            {metricsData.map((item) => {
              const isCurrentSymbol = item.symbol === currentSymbol;
              const isUndervalued = item.currentRatio < item.avgRatio;
              
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
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-mono font-medium">{item.currentRatio.toFixed(1)}x</div>
                      <div className="text-xs text-muted-foreground">Avg: {item.avgRatio.toFixed(1)}x</div>
                    </div>
                    {isUndervalued ? (
                      <div title="Trading below average (potentially undervalued)">
                        <TrendingDown className="w-4 h-4 text-green-600" />
                      </div>
                    ) : item.currentRatio > item.avgRatio ? (
                      <div title="Trading above average (potentially overvalued)">
                        <TrendingUp className="w-4 h-4 text-red-600" />
                      </div>
                    ) : (
                      <Minus className="w-4 h-4 text-muted-foreground" />
                    )}
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
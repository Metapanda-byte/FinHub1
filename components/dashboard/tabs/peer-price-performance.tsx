"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { formatPercentage } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ClientOnly } from "@/components/ui/client-only";

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

// Define a color palette for the lines
const COLORS = [
  "#3b82f6", // blue-500
  "#f97316", // orange-500
  "#10b981", // emerald-500
  "#8b5cf6", // violet-500
  "#ef4444", // red-500
  "#14b8a6", // teal-500
  "#f59e0b", // amber-500
  "#ec4899", // pink-500
];

export function PeerPricePerformance({ currentSymbol, selectedPeers, peerCompanies }: PeerPricePerformanceProps) {
  const [timeframe, setTimeframe] = useState<string>("1D");
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);

  // All symbols to fetch (current + selected peers)
  const symbolsToFetch = useMemo(() => {
    const symbols = [currentSymbol, ...selectedPeers].filter(Boolean);
    return Array.from(new Set(symbols)); // Remove duplicates
  }, [currentSymbol, selectedPeers]);

  // Fetch price data (mock for now - replace with actual API call)
  useEffect(() => {
    const fetchPriceData = async () => {
      setLoading(true);
      
      // TODO: Replace with actual API call to fetch historical price data
      // For now, generate mock data
      const mockData = generateMockPriceData(symbolsToFetch, timeframe);
      setPriceData(mockData.chartData);
      setPerformanceData(mockData.performanceData);
      
      setLoading(false);
    };

    if (symbolsToFetch.length > 0) {
      fetchPriceData();
    }
  }, [symbolsToFetch, timeframe]);

  // Generate mock data (replace with actual API integration)
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

    const numPoints = period === "12H" || period === "1D" ? 24 : Math.min(periods[period] || 30, 100);
    const chartData: PriceData[] = [];
    const baseDate = new Date();
    
    // Generate data points
    for (let i = 0; i < numPoints; i++) {
      const date = new Date(baseDate);
      if (period === "12H" || period === "1D") {
        date.setHours(date.getHours() - (numPoints - i));
      } else {
        date.setDate(date.getDate() - (numPoints - i));
      }
      
      const dataPoint: PriceData = {
        date: period === "12H" || period === "1D" 
          ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      };
      
      // Generate performance for each symbol (normalized to 0 at start) - deterministic
      symbols.forEach((symbol, idx) => {
        // Use deterministic "random" values based on symbol and time index
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

    // Calculate final performance for each symbol
    const performanceData: PerformanceData[] = symbols.map((symbol, idx) => {
      const finalValue = chartData[chartData.length - 1][symbol] as number;
      const company = peerCompanies.find(c => c.id === symbol);
      
      return {
        symbol,
        name: company?.name || symbol,
        performance: finalValue * 100, // Convert to percentage
        color: symbol === currentSymbol ? "#f97316" : COLORS[idx % COLORS.length], // Orange for current symbol
      };
    });

    // Sort by performance
    performanceData.sort((a, b) => b.performance - a.performance);

    return { chartData, performanceData };
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            const company = peerCompanies.find(c => c.id === entry.dataKey) || { name: entry.dataKey };
            return (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="font-medium">{entry.dataKey}:</span>
                <span className={cn(
                  "font-mono",
                  entry.value > 0 ? "text-green-600" : entry.value < 0 ? "text-red-600" : ""
                )}>
                  {entry.value > 0 ? "+" : ""}{entry.value.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
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
          
          {/* Timeframe selector */}
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

      {/* Performance Chart */}
      <Card className="p-6">
        <div className="h-[400px] w-full">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading price data...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value > 0 ? '+' : ''}${value.toFixed(0)}%`}
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                
                {/* Current symbol line (highlighted) */}
                <Line
                  type="monotone"
                  dataKey={currentSymbol}
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={false}
                  name={currentSymbol}
                />
                
                {/* Peer lines */}
                {selectedPeers.map((symbol, idx) => (
                  <Line
                    key={symbol}
                    type="monotone"
                    dataKey={symbol}
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={1.5}
                    dot={false}
                    name={symbol}
                    opacity={0.8}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Performance Summary Table */}
      <Card className="p-6">
        <h4 className="text-sm font-semibold mb-4">Performance Summary ({timeframe})</h4>
        <div className="space-y-2">
          {performanceData.map((item) => {
            const isCurrentSymbol = item.symbol === currentSymbol;
            return (
              <div
                key={item.symbol}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg transition-colors",
                  isCurrentSymbol ? "bg-orange-50 dark:bg-orange-950/20" : "bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-medium text-sm",
                        isCurrentSymbol && "text-orange-600 dark:text-orange-400"
                      )}>
                        {item.symbol}
                      </span>
                      {isCurrentSymbol && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-mono text-sm font-medium",
                    item.performance > 0 ? "text-green-600" : item.performance < 0 ? "text-red-600" : ""
                  )}>
                    {item.performance > 0 ? "+" : ""}{item.performance.toFixed(2)}%
                  </span>
                  {item.performance > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : item.performance < 0 ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
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
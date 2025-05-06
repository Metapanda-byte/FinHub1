"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Bar,
  ComposedChart,
} from "recharts";
import { format } from "date-fns";
import { useStockPriceData } from "@/lib/api/financial";

interface StockChartProps {
  symbol: string;
  showMovingAverage?: boolean;
  timeframe?: 'YTD' | '1Y' | '5Y';
}

export function StockChart({ symbol, showMovingAverage = false, timeframe = 'YTD' }: StockChartProps) {
  const { prices: stockPrices, isLoading } = useStockPriceData(symbol, timeframe);

  if (isLoading) {
    return <div className="h-[280px] flex items-center justify-center">Loading...</div>;
  }

  if (!stockPrices || stockPrices.length === 0) {
    return <div className="h-[280px] flex items-center justify-center">No data available</div>;
  }

  // Process and sort data chronologically
  let processedData = stockPrices
    .filter(item => new Date(item.date) <= new Date()) // Filter out future dates
    .map(item => ({
      ...item,
      date: new Date(item.date),
      volume: item.volume
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Filter data to match the selected timeframe
  const now = new Date();
  if (timeframe === '5Y') {
    const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), 1);
    processedData = processedData.filter(item => item.date >= fiveYearsAgo);
  } else if (timeframe === '1Y') {
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    processedData = processedData.filter(item => item.date >= oneYearAgo);
  } else if (timeframe === 'YTD') {
    const janFirst = new Date(now.getFullYear(), 0, 1);
    processedData = processedData.filter(item => item.date >= janFirst);
  }

  processedData = processedData.map((item, index, array) => {
    // Calculate moving average if enabled
    let ma = null;
    if (showMovingAverage) {
      const lookbackPeriod = Math.min(7, index + 1);
      const startIndex = Math.max(0, index - lookbackPeriod + 1);
      const sum = array
        .slice(startIndex, index + 1)
        .reduce((acc, curr) => acc + curr.price, 0);
      ma = sum / lookbackPeriod;
    }
    return {
      ...item,
      date: item.date.toISOString(),
      ma
    };
  });

  // Calculate price range for y-axis
  const priceValues = processedData.map(d => d.price);
  const minPrice = Math.min(0, ...priceValues); // Allow negative prices for some stocks
  const maxPrice = Math.max(...priceValues);
  const priceRange = maxPrice - minPrice;
  const priceMargin = priceRange * 0.1; // Add 10% margin

  // Generate consistent Y-axis ticks (multiples of 5, evenly spaced)
  const yTickCount = 5;
  const roundedMax = Math.ceil((maxPrice + priceMargin) / 5) * 5;
  const yTickStep = Math.ceil(roundedMax / (yTickCount - 1) / 5) * 5;
  const yTicks = Array.from({ length: yTickCount }, (_, i) => i * yTickStep);
  if (yTicks[yTicks.length - 1] < roundedMax) {
    yTicks[yTicks.length - 1] = roundedMax;
  }

  // Determine date format and interval based on timeframe
  const getDateFormatter = (date: string) => {
    const dateObj = new Date(date);
    return format(dateObj, 'MMM-yy');
  };

  // Calculate appropriate number of Y-axis ticks and format
  const getYTickConfig = () => {
    const range = maxPrice - minPrice;
    
    // Determine the appropriate number of decimal places
    let decimalPlaces = 2;
    if (range < 0.1) decimalPlaces = 4;
    else if (range < 1) decimalPlaces = 3;
    else if (range < 10) decimalPlaces = 2;
    else if (range < 100) decimalPlaces = 1;
    else decimalPlaces = 0;

    // Determine the appropriate number of ticks
    let tickCount = 5;
    if (range < 1) tickCount = 6;
    else if (range < 10) tickCount = 5;
    else if (range < 100) tickCount = 5;
    else tickCount = 4;

    // Format function for Y-axis labels
    const formatValue = (value: number) => {
      const absValue = Math.abs(value);
      if (absValue >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
      if (absValue >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
      if (absValue >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
      return `$${value.toFixed(decimalPlaces)}`;
    };

    return { tickCount, formatValue };
  };

  const { tickCount, formatValue } = getYTickConfig();

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart
        data={processedData}
        margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
      >
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={getDateFormatter}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          dy={12}
          angle={0}
          textAnchor="middle"
          height={40}
          interval={0}
          minTickGap={0}
          ticks={(() => {
            if (processedData.length === 0) return [];
            // Helper to get evenly spaced ticks from processedData
            const getEvenlySpacedTicks = (count: number) => {
              const n = processedData.length;
              if (n <= count) return processedData.map(d => d.date);
              const step = Math.floor(n / (count - 1));
              const ticks = [];
              for (let i = 0; i < count - 1; i++) {
                ticks.push(processedData[i * step].date);
              }
              ticks.push(processedData[n - 1].date); // Always include last date
              return ticks;
            };
            if (timeframe === '5Y') {
              // Most recent month and every 12 months prior (6 ticks)
              const ticks = [];
              const lastDate = new Date(processedData[processedData.length - 1].date);
              for (let i = 0; i < 6; i++) {
                const d = new Date(lastDate);
                d.setMonth(d.getMonth() - i * 12, 1); // Set to first of the month
                // Find the closest data point to this month
                const tick = processedData.reduce((prev, curr) => {
                  return Math.abs(new Date(curr.date).getTime() - d.getTime()) < Math.abs(new Date(prev.date).getTime() - d.getTime()) ? curr : prev;
                });
                // Avoid duplicates
                if (!ticks.includes(tick.date)) {
                  ticks.unshift(tick.date);
                }
              }
              return ticks;
            } else if (timeframe === '1Y') {
              return getEvenlySpacedTicks(6);
            } else if (timeframe === 'YTD') {
              // One tick per month, last tick is always the most recent date (if not already present)
              const months = new Set();
              const ticks = [];
              processedData.forEach(d => {
                const m = d.date.slice(0, 7); // 'YYYY-MM'
                if (!months.has(m)) {
                  months.add(m);
                  ticks.push(d.date);
                }
              });
              const lastDate = processedData[processedData.length - 1].date;
              const lastMonth = lastDate.slice(0, 7);
              if (ticks.length === 0 || (!months.has(lastMonth) && ticks[ticks.length - 1] !== lastDate)) {
                ticks.push(lastDate);
              }
              // Remove duplicates if any
              return Array.from(new Set(ticks));
            }
            return getEvenlySpacedTicks(5);
          })()}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          domain={[0, roundedMax]}
          ticks={yTicks}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          width={75}
          tickCount={tickCount}
          tickFormatter={formatValue}
          dx={-10}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => {
            const absValue = Math.abs(value);
            if (absValue >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
            if (absValue >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
            if (absValue >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
            return value.toFixed(0);
          }}
          domain={[0, 'auto']}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          width={75}
          dx={-10}
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === "price") return [formatValue(value), "Price"];
            if (name === "ma") return [formatValue(value), "MA (7-day)"];
            if (name === "volume") {
              const absValue = Math.abs(value);
              if (absValue >= 1e9) return [`${(value / 1e9).toFixed(1)}B`, "Volume"];
              if (absValue >= 1e6) return [`${(value / 1e6).toFixed(1)}M`, "Volume"];
              if (absValue >= 1e3) return [`${(value / 1e3).toFixed(1)}K`, "Volume"];
              return [value.toFixed(0), "Volume"];
            }
            return [value, name];
          }}
          labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy HH:mm')}
          contentStyle={{
            borderRadius: "6px",
            padding: "8px 12px",
            border: "1px solid var(--border)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        />
        <Bar
          yAxisId="right"
          dataKey="volume"
          fill="hsl(var(--chart-4) / 0.3)"
          barSize={20}
          animationDuration={1500}
        />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="price"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorPrice)"
          animationDuration={1500}
          dot={false}
          activeDot={{ r: 4, fill: "hsl(var(--chart-1))" }}
        />
        {showMovingAverage && (
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="ma"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            fill="none"
            animationDuration={1500}
            dot={false}
            activeDot={{ r: 4, fill: "hsl(var(--chart-2))" }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
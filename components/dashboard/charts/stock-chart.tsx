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
  timeframe?: '1D' | '1W' | '1M' | '1Y' | '5Y';
}

export function StockChart({ symbol, showMovingAverage = false, timeframe = '1M' }: StockChartProps) {
  const { prices: stockPrices, isLoading } = useStockPriceData(symbol, timeframe);

  if (isLoading) {
    return <div className="h-[280px] flex items-center justify-center">Loading...</div>;
  }

  if (!stockPrices || stockPrices.length === 0) {
    return <div className="h-[280px] flex items-center justify-center">No data available</div>;
  }

  // Process and sort data chronologically
  const processedData = stockPrices
    .filter(item => new Date(item.date) <= new Date()) // Filter out future dates
    .map(item => ({
      ...item,
      date: new Date(item.date),
      price: item.close,
      volume: item.volume
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime()) // Sort ascending by date
    .map((item, index, array) => {
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
  const yDomain = [minPrice - priceMargin, maxPrice + priceMargin];

  // Determine date format and interval based on timeframe
  const getDateFormatter = (date: string) => {
    const dateObj = new Date(date);
    
    switch(timeframe) {
      case '1D':
        return format(dateObj, 'HH:mm');
      case '1W':
        return format(dateObj, 'EEE, MMM d');
      case '1M':
        return format(dateObj, 'MMM d');
      case '1Y':
      case '5Y':
        return format(dateObj, 'MMM yyyy');
      default:
        return format(dateObj, 'MMM d, yyyy');
    }
  };

  // Calculate appropriate interval for X-axis based on timeframe
  const getXAxisInterval = () => {
    const dataLength = processedData.length;
    
    switch(timeframe) {
      case '5Y':
        return Math.max(1, Math.floor(dataLength / 6)); // Show 6 points
      case '1Y':
        return Math.max(1, Math.floor(dataLength / 6)); // Show 6 points
      case '1M':
        return Math.max(1, Math.floor(dataLength / 8)); // Show 8 points
      case '1W':
        return Math.max(1, Math.floor(dataLength / 7)); // Show daily points
      case '1D':
        return Math.max(1, Math.floor(dataLength / 8)); // Show 8 points
      default:
        return Math.max(1, Math.floor(dataLength / 8));
    }
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
        margin={{ top: 10, right: 0, left: 10, bottom: 40 }}
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
          height={50}
          interval={getXAxisInterval()}
          minTickGap={20}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          domain={yDomain}
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
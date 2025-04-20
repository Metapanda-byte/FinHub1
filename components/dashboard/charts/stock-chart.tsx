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

interface StockData {
  date: string;
  price: number;
  volume: number;
}

interface StockChartProps {
  data: StockData[];
  showMovingAverage?: boolean;
  timeframe?: '1D' | '1W' | '1M' | '1Y' | '5Y';
}

export function StockChart({ data, showMovingAverage = false, timeframe = '1M' }: StockChartProps) {
  // Process and sort data chronologically
  const processedData = data
    .map(item => ({
      ...item,
      date: new Date(item.date),
      price: item.price,
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

  // Determine date format based on timeframe
  const getDateFormatter = (date: string) => {
    const dateObj = new Date(date);
    switch (timeframe) {
      case '1D':
        return format(dateObj, 'HH:mm');
      case '1W':
        return format(dateObj, 'EEE');
      case '1M':
        return format(dateObj, 'MMM d');
      case '1Y':
        return format(dateObj, 'MMM yyyy');
      case '5Y':
        return format(dateObj, 'yyyy');
      default:
        return format(dateObj, 'MMM d');
    }
  };

  // Calculate price range for y-axis
  const prices = processedData.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceMargin = (maxPrice - minPrice) * 0.1;
  const yDomain = [minPrice - priceMargin, maxPrice + priceMargin];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart
        data={processedData}
        margin={{ top: 10, right: 0, left: 0, bottom: 30 }}
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
          dy={10}
          angle={-45}
          textAnchor="end"
          height={60}
          minTickGap={20}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          domain={yDomain}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          width={60}
          tickFormatter={(value) => `$${value.toFixed(2)}`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => {
            if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
            if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
            return value.toString();
          }}
          domain={['auto', 'auto']}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          width={60}
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === "price") return [`$${value.toFixed(2)}`, "Price"];
            if (name === "ma") return [`$${value.toFixed(2)}`, "MA (7-day)"];
            if (name === "volume") {
              if (value >= 1e6) return [`${(value / 1e6).toFixed(1)}M`, "Volume"];
              if (value >= 1e3) return [`${(value / 1e3).toFixed(1)}K`, "Volume"];
              return [value.toString(), "Volume"];
            }
            return [value, name];
          }}
          labelFormatter={(label) => getDateFormatter(label)}
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
"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format } from "date-fns";
import { useStockPriceData } from "@/lib/api/financial";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ClientOnly } from "@/components/ui/client-only";

interface StockChartProps {
  symbol: string;
  showMovingAverage?: boolean;
  timeframe?: 'YTD' | '1Y' | '5Y';
}

type TimeframeOption = 'YTD' | '1Y' | '5Y';

export function StockChart({ symbol, showMovingAverage = false, timeframe = 'YTD' }: StockChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>('YTD');
  const [mounted, setMounted] = useState(false);
  const { prices: stockPrices, isLoading } = useStockPriceData(symbol, selectedTimeframe);

  const timeframeOptions: TimeframeOption[] = ['YTD', '1Y', '5Y'];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading) {
    return <div className="h-[280px] flex items-center justify-center">Loading...</div>;
  }

  if (!stockPrices || stockPrices.length === 0) {
    return <div className="h-[280px] flex items-center justify-center">No data available</div>;
  }

  // Process and sort data chronologically, then filter by timeframe
  let processedData = stockPrices
    .filter((item: any) => new Date(item.date) <= new Date())
    .map((item: any) => ({
      ...item,
      date: new Date(item.date),
      volume: item.volume || 0
    }))
    .sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

  // Use fixed date during SSR to prevent hydration mismatch
  const referenceDate = mounted ? new Date() : new Date('2024-01-01');
  
  if (selectedTimeframe === 'YTD') {
    const janFirst = new Date(referenceDate.getFullYear(), 0, 1);
    processedData = processedData.filter((item: any) => item.date >= janFirst);
  } else if (selectedTimeframe === '1Y') {
    const oneYearAgo = new Date(referenceDate);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    processedData = processedData.filter((item: any) => item.date >= oneYearAgo);
  } else if (selectedTimeframe === '5Y') {
    const fiveYearsAgo = new Date(referenceDate);
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    processedData = processedData.filter((item: any) => item.date >= fiveYearsAgo);
  }

  // Convert dates back to strings for charting
  processedData = processedData.map((item: any) => ({
    ...item,
    date: item.date.toISOString()
  }));

  // Calculate price change and percentage
  const currentPrice = processedData[processedData.length - 1]?.price || 0;
  const previousPrice = processedData[0]?.price || 0;
  const priceChange = currentPrice - previousPrice;
  const percentageChange = previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0;

  // Calculate price range for y-axis
  const priceValues = processedData.map((d: any) => d.price);
  const minPrice = Math.min(...priceValues);
  const maxPrice = Math.max(...priceValues);
  const priceRange = maxPrice - minPrice;
  const priceMargin = priceRange * 0.05;

  // Smart date formatter and tick generator based on timeframe
  const getDateConfig = () => {
    if (processedData.length === 0) return { formatter: () => '', ticks: [] };
    
    const startDate = new Date(processedData[0].date);
    const endDate = new Date(processedData[processedData.length - 1].date);
    
    const formatter = (date: string) => {
      const dateObj = new Date(date);
      
      if (selectedTimeframe === 'YTD') {
        // Show month abbreviations for YTD
        return format(dateObj, 'MMM');
      } else if (selectedTimeframe === '1Y') {
        // Show month-year for 1Y
        return format(dateObj, 'MMM yy');
      } else if (selectedTimeframe === '5Y') {
        // Show year for 5Y
        return format(dateObj, 'yyyy');
      }
      return format(dateObj, 'MMM yy');
    };
    
    // Generate optimal ticks based on timeframe - simplified and more reliable
    const generateTicks = () => {
      const dataLength = processedData.length;
      if (dataLength === 0) return [];
      
      // Always use evenly spaced ticks based on data length
      let tickCount = 5; // Default
      
      if (selectedTimeframe === 'YTD') {
        tickCount = Math.min(8, Math.max(4, Math.floor(dataLength / 30))); // Roughly monthly
      } else if (selectedTimeframe === '1Y') {
        tickCount = 6; // Roughly bi-monthly over a year
      } else if (selectedTimeframe === '5Y') {
        tickCount = 6; // Roughly yearly
      }
      
      // Generate evenly spaced ticks
      const ticks: string[] = [];
      const step = Math.max(1, Math.floor((dataLength - 1) / (tickCount - 1)));
      
      for (let i = 0; i < tickCount; i++) {
        let index;
        if (i === 0) {
          index = 0; // Always include first
        } else if (i === tickCount - 1) {
          index = dataLength - 1; // Always include last
        } else {
          index = i * step;
        }
        
        if (index < dataLength) {
          ticks.push(processedData[index].date);
        }
      }
      
      // Remove duplicates and sort
      return Array.from(new Set(ticks)).sort();
    };
    
    return { formatter, ticks: generateTicks() };
  };

  const { formatter: dateFormatter, ticks: dateTicks } = getDateConfig();

  return (
    <ClientOnly fallback={
      <div className="w-full space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <span className="text-xs sm:text-sm md:text-base font-semibold">{symbol}</span>
            <span className="text-xs sm:text-sm md:text-lg font-bold">Loading...</span>
          </div>
        </div>
        <div className="h-[200px] sm:h-[240px] w-full flex items-center justify-center">
          <div className="text-muted-foreground">Loading chart...</div>
        </div>
      </div>
    }>
      <div className="w-full space-y-2 sm:space-y-3">
        {/* Stock Price Header - Compact */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <span className="text-xs sm:text-sm md:text-base font-semibold">{symbol}</span>
            <span className="text-xs sm:text-sm md:text-lg font-bold">${currentPrice.toFixed(2)}</span>
            <div className={`flex items-center gap-1 text-[10px] sm:text-xs md:text-sm ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span>{priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}</span>
              <span>({percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(2)}%)</span>
            </div>
          </div>
          
          {/* Timeframe Selector - Compact */}
          <div className="flex gap-0.5 sm:gap-1">
            {timeframeOptions.map((option) => (
              <Button
                key={option}
                variant={selectedTimeframe === option ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe(option)}
                className="h-6 sm:h-7 px-2 sm:px-3 text-[10px] sm:text-xs"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-[200px] sm:h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={processedData}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="stockPriceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false}
              />
              
              <XAxis
                dataKey="date"
                tickFormatter={dateFormatter}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                height={30}
                ticks={dateTicks}
                interval={0}
                domain={['dataMin', 'dataMax']}
                type="category"
                angle={0}
                textAnchor="middle"
              />
              
              <YAxis
                domain={[minPrice - priceMargin, maxPrice + priceMargin]}
                tickFormatter={(value) => {
                  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
                  if (value >= 1) return `$${value.toFixed(0)}`;
                  return `$${value.toFixed(2)}`;
                }}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                width={50}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "6px",
                  padding: "8px 12px",
                  border: "1px solid var(--border)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
                labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Price']}
              />

              {/* Price line with gradient fill */}
              <Area
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#stockPriceGradient)"
                dot={false}
                activeDot={{ 
                  r: 4, 
                  fill: "#3b82f6", 
                  stroke: "#ffffff", 
                  strokeWidth: 2 
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ClientOnly>
  );
}
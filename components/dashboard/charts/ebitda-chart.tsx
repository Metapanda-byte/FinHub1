"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  ComposedChart,
  Cell,
  LabelList,
} from "recharts";
import { formatBillions, formatPercentage } from "@/lib/formatters";

interface EbitdaChartProps {
  data: { year: number | string; value: number; margin: number }[];
  palette?: string[];
  tickFontSize?: number;
  ltmBarGradient?: boolean;
  currencySymbol?: string;
}

export function EbitdaChart({ data, palette, tickFontSize = 12, ltmBarGradient = false, currencySymbol = "$" }: EbitdaChartProps) {
  const barColor = palette && palette.length > 0 ? palette[0] : '#2563eb';
  const lineColor = '#1e3a8a';
  
  // Get both min and max values to handle negative data properly
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  
  // Calculate minimal padding (5-10% of range) for better space utilization
  const range = maxValue - minValue;
  // If range is very small (all values similar), use a percentage of the max value
  const padding = range < 1 ? Math.max(Math.abs(maxValue) * 0.1, 1) : Math.max(range * 0.05, 1);
  
  // Calculate step size to create ~4-6 ticks for optimal readability
  const targetTicks = 5;
  const rawStep = (range + 2 * padding) / targetTicks;
  
  // Round step to nice numbers
  let step = 1;
  if (rawStep >= 100) step = Math.ceil(rawStep / 50) * 50;
  else if (rawStep >= 50) step = Math.ceil(rawStep / 25) * 25;
  else if (rawStep >= 20) step = Math.ceil(rawStep / 10) * 10;
  else if (rawStep >= 10) step = Math.ceil(rawStep / 5) * 5;
  else if (rawStep >= 5) step = Math.ceil(rawStep / 2) * 2;
  else if (rawStep >= 2) step = Math.ceil(rawStep);
  else if (rawStep >= 1) step = Math.ceil(rawStep * 2) / 2;
  else step = Math.ceil(rawStep * 10) / 10;
  
  // Calculate tight bounds with minimal padding
  const roundedMax = Math.ceil((maxValue + padding) / step) * step;
  const roundedMin = Math.floor((minValue - padding) / step) * step;
  
  // Generate ticks that include zero if it's in the range
  const yTicks = [];
  for (let i = roundedMin; i <= roundedMax; i += step) {
    yTicks.push(i);
  }
  
  // Ensure zero is included as a tick if data crosses zero line
  if (minValue < 0 && maxValue > 0 && !yTicks.includes(0)) {
    yTicks.push(0);
    yTicks.sort((a, b) => a - b);
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 50, right: 2, left: 2, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: tickFontSize }}
          dy={12}
          height={50}
        />
        <YAxis
          yAxisId="left"
          tickFormatter={(value) => `${currencySymbol}${Number(value).toFixed(1)}B`}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: tickFontSize }}
          width={75}
          dx={-10}
          domain={[roundedMin, roundedMax]}
          ticks={yTicks}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: tickFontSize }}
          width={50}
          dx={10}
          hide={true}
        />
        <Bar
          yAxisId="left"
          dataKey="value"
        >
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={palette && palette[idx] ? palette[idx] : barColor} />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            content={(props: any) => {
              const { x, y, value, width } = props;
              const xNum = typeof x === 'number' ? x : Number(x);
              const yNum = typeof y === 'number' ? y : Number(y);
              const ebitdaValue = typeof value === 'number' ? value : Number(value);
              const barWidth = typeof width === 'number' ? width : Number(width) || 0;
              if (isNaN(xNum) || isNaN(yNum) || isNaN(ebitdaValue)) return null;
              
              // Calculate the center of the bar
              const barCenter = xNum + (barWidth / 2);
              
              return (
                <text
                  x={barCenter}
                  y={yNum - 20}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fill: 'var(--chart-text-color, #ffffff)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {`${currencySymbol}${ebitdaValue.toFixed(1)}B`}
                </text>
              );
            }}
          />
        </Bar>
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="margin"
          stroke={lineColor}
          strokeWidth={2}
          dot={{ 
            r: 5, 
            fill: '#ffffff', 
            stroke: lineColor, 
            strokeWidth: 2 
          }}
          activeDot={{ 
            r: 7, 
            fill: '#ffffff', 
            stroke: lineColor, 
            strokeWidth: 3 
          }}
          animationDuration={1500}
        >
          <LabelList
            dataKey="margin"
            position="top"
            content={({ x, y, value }) => {
              const xNum = typeof x === 'number' ? x : Number(x);
              const yNum = typeof y === 'number' ? y : Number(y);
              const marginValue = typeof value === 'number' ? value : Number(value);
              if (isNaN(xNum) || isNaN(yNum) || isNaN(marginValue)) return null;
              
              // Align all boxes to the top of the plot area for better visibility
              const topMargin = 50; // Match the chart's top margin
              const labelY = topMargin - 25; // Position boxes at the top
              
              return (
                <foreignObject x={xNum - 27} y={labelY} width={54} height={30} style={{ pointerEvents: 'none', overflow: 'visible' }}>
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: 4,
                      padding: '3px 8px',
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#1e3a8a',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      textAlign: 'center',
                      border: '1px solid #d1d5db',
                      minWidth: 32,
                      minHeight: 18,
                      display: 'inline-block',
                    }}
                  >
                    {`${marginValue.toFixed(1)}%`}
                  </div>
                </foreignObject>
              );
            }}
          />
        </Line>
      </ComposedChart>
    </ResponsiveContainer>
  );
}
"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";
import { formatBillions } from "@/lib/formatters";
import { format } from "date-fns";

interface RevenueChartProps {
  data: { year: number | string; value: number }[];
  palette?: string[];
  tickFontSize?: number;
  ltmBarGradient?: boolean;
}

export function RevenueChart({ data, palette, tickFontSize = 12, ltmBarGradient = false }: RevenueChartProps) {
  // Calculate appropriate scaling for better visualization
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  
  // Calculate minimal padding for better space utilization
  const range = maxValue - minValue;
  // If range is very small (all values similar), use a percentage of the max value
  const padding = range < 1 ? Math.max(Math.abs(maxValue) * 0.1, 1) : Math.max(range * 0.05, Math.max(maxValue * 0.02, 1));
  
  // For revenue, typically start from 0 unless there are negative values
  const effectiveMin = minValue < 0 ? minValue - padding : 0;
  const effectiveMax = maxValue + padding;
  const effectiveRange = effectiveMax - effectiveMin;
  
  // Calculate step size to create ~4-6 ticks for optimal readability
  const targetTicks = 5;
  const rawStep = effectiveRange / targetTicks;
  
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
  
  // Calculate tight bounds
  const roundedMax = Math.ceil(effectiveMax / step) * step;
  const roundedMin = Math.floor(effectiveMin / step) * step;
  
  // Generate ticks
  const yTicks = [];
  for (let i = roundedMin; i <= roundedMax; i += step) {
    yTicks.push(i);
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 40, right: 12, left: 12, bottom: 10 }}>
        {ltmBarGradient && (
          <defs>
            <pattern id="ltmBarDots" patternUnits="userSpaceOnUse" width="8" height="8">
              <rect x="0" y="0" width="8" height="8" fill={palette && palette.length > 0 ? palette[palette.length - 1] : '#e0e7ff'} />
              <circle cx="4" cy="4" r="2" fill={palette && palette.length > 0 ? palette[Math.floor(palette.length / 2)] : '#60a5fa'} opacity="0.5" />
            </pattern>
          </defs>
        )}
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="year"
          tickFormatter={(year) => year.toString()}
          tick={{ fontSize: tickFontSize }}
          interval={0}
          angle={0}
          textAnchor="middle"
          height={50}
          dy={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(value) => formatBillions(value)}
          tick={{ fontSize: tickFontSize }}
          width={75}
          tickLine={false}
          axisLine={false}
          dx={-10}
          domain={[roundedMin, roundedMax]}
          ticks={yTicks}
        />
        <Bar
          dataKey="value"
        >
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={palette && palette[idx] ? palette[idx] : '#2563eb'} />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            content={(props: any) => {
              const { x, y, value, width } = props;
              const xNum = typeof x === 'number' ? x : Number(x);
              const yNum = typeof y === 'number' ? y : Number(y);
              const revenueValue = typeof value === 'number' ? value : Number(value);
              const barWidth = typeof width === 'number' ? width : Number(width) || 0;
              if (isNaN(xNum) || isNaN(yNum) || isNaN(revenueValue)) return null;
              
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
                  {`$${revenueValue.toFixed(1)}B`}
                </text>
              );
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
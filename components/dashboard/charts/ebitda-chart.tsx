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
}

export function EbitdaChart({ data, palette, tickFontSize = 12, ltmBarGradient = false }: EbitdaChartProps) {
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
      <ComposedChart data={data} margin={{ top: 40, right: 2, left: 2, bottom: 10 }}>
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
          tickFormatter={(value) => formatBillions(value)}
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
          tickFormatter={(value) => `${value.toFixed(0)}%`}
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
              const { x, y, value } = props;
              const xNum = typeof x === 'number' ? x : Number(x);
              const yNum = typeof y === 'number' ? y : Number(y);
              const ebitdaValue = typeof value === 'number' ? value : Number(value);
              if (isNaN(xNum) || isNaN(yNum) || isNaN(ebitdaValue)) return null;
              
              return (
                <foreignObject x={xNum - 30} y={yNum - 35} width={60} height={25} style={{ pointerEvents: 'none' }}>
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '10px',
                      fontWeight: '600',
                      color: '#1e293b',
                      textAlign: 'center',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                  >
                    {`$${ebitdaValue.toFixed(1)}B`}
                  </div>
                </foreignObject>
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
          dot={{ r: 4, fill: lineColor }}
          activeDot={{ r: 6 }}
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
              // Position label just above the line node (dot) with more clearance
              const labelY = yNum - 28;
              return (
                <foreignObject x={xNum - 27} y={labelY} width={54} height={30} style={{ pointerEvents: 'none', overflow: 'visible' }}>
                  <div
                    style={{
                      background: '#fff',
                      borderRadius: 4,
                      padding: '2px 8px',
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#1e3a8a',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                      textAlign: 'center',
                      border: '1px solid #b0b0b0',
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
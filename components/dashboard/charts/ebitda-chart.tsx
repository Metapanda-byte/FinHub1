"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  ComposedChart,
  Cell,
  LabelList,
} from "recharts";
import { formatBillions, formatPercentage } from "@/lib/formatters";

interface EbitdaChartProps {
  data: { year: number; value: number; margin: number }[];
  palette?: string[];
  tickFontSize?: number;
  ltmBarGradient?: boolean;
}

export function EbitdaChart({ data, palette, tickFontSize = 12, ltmBarGradient = false }: EbitdaChartProps) {
  const barColor = palette && palette.length > 0 ? palette[0] : '#2563eb';
  const lineColor = '#1e3a8a';
  const maxValue = Math.max(...data.map(d => d.value));
  // Round up to the next logical step for the axis
  let step = 50;
  if (maxValue > 200) step = 100;
  else if (maxValue > 100) step = 50;
  else if (maxValue > 50) step = 25;
  else if (maxValue > 20) step = 10;
  else if (maxValue > 10) step = 5;
  const roundedMax = Math.ceil(maxValue / step) * step;
  const yTicks = [];
  for (let i = 0; i <= roundedMax; i += step) {
    yTicks.push(i);
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 10, right: 2, left: 2, bottom: 10 }}>
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
          domain={[0, roundedMax]}
          ticks={yTicks}
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === "value") return [`$${value.toFixed(1)}B`, "EBITDA"];
            if (name === "margin") return [`${value.toFixed(1)}%`, "Margin"];
            return [value, name];
          }}
          labelFormatter={(label) => `Year: ${label}`}
          contentStyle={{
            borderRadius: "6px",
            padding: "8px 12px",
            border: "1px solid var(--border)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        />
        <Bar
          yAxisId="left"
          dataKey="value"
        >
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={palette && palette[idx] ? palette[idx] : barColor} />
          ))}
        </Bar>
        <Line
          yAxisId="left"
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
              // Position label just above the line node (dot)
              const labelY = yNum - 36;
              return (
                <foreignObject x={xNum - 18} y={labelY} width={54} height={24} style={{ pointerEvents: 'none', overflow: 'visible' }}>
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
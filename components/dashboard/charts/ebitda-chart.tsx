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
  const lineColor = palette && palette.length > 1 ? palette[1] : '#3b82f6';
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
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => formatPercentage(value)}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: tickFontSize }}
          width={75}
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
          yAxisId="right"
          type="monotone"
          dataKey="margin"
          stroke={lineColor}
          strokeWidth={2}
          dot={{ r: 4, fill: lineColor }}
          activeDot={{ r: 6 }}
          animationDuration={1500}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
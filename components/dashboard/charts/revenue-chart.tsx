"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
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
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 12, left: 12, bottom: 10 }}>
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
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(1)}B`, "Revenue"]}
          labelFormatter={(year) => typeof year === 'string' && year.startsWith('LTM') ? year : `Year: ${year}`}
          contentStyle={{
            borderRadius: "6px",
            padding: "8px 12px",
            border: "1px solid var(--border)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        />
        <Bar
          dataKey="value"
        >
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={palette && palette[idx] ? palette[idx] : '#2563eb'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
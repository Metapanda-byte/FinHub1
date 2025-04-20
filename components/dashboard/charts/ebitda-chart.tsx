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
} from "recharts";
import { formatBillions, formatPercentage } from "@/lib/formatters";

interface EbitdaChartProps {
  data: { year: number; value: number; margin: number }[];
}

export function EbitdaChart({ data }: EbitdaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 0, right: 25, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          dy={10}
        />
        <YAxis
          yAxisId="left"
          tickFormatter={(value) => formatBillions(value)}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          width={45}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => formatPercentage(value)}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          width={45}
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
          fill="hsl(var(--chart-2))"
          radius={[4, 4, 0, 0]}
          animationDuration={1500}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="margin"
          stroke="hsl(var(--chart-3))"
          strokeWidth={2}
          dot={{ r: 4, fill: "hsl(var(--chart-3))" }}
          activeDot={{ r: 6 }}
          animationDuration={1500}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
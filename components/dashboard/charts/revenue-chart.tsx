"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatBillions } from "@/lib/formatters";

interface RevenueChartProps {
  data: { year: number; value: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 0, right: 15, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          dy={10}
        />
        <YAxis
          tickFormatter={(value) => formatBillions(value)}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          width={45}
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(1)}B`, "Revenue"]}
          labelFormatter={(label) => `Year: ${label}`}
          contentStyle={{
            borderRadius: "6px",
            padding: "8px 12px",
            border: "1px solid var(--border)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        />
        <Bar
          dataKey="value"
          fill="hsl(var(--chart-1))"
          radius={[4, 4, 0, 0]}
          animationDuration={1500}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
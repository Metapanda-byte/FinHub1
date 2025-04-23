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
import { format } from "date-fns";

interface RevenueChartProps {
  data: { year: number; value: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 0, left: 10, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="year"
          tickFormatter={(year) => year.toString()}
          tick={{ fontSize: 12 }}
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
          tick={{ fontSize: 12 }}
          width={75}
          tickLine={false}
          axisLine={false}
          dx={-10}
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(1)}B`, "Revenue"]}
          labelFormatter={(year) => `Year: ${year}`}
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
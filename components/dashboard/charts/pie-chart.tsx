"use client";

import { useState } from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
  Legend,
  Tooltip,
} from "recharts";

interface PieChartProps {
  data: any[];
  nameKey: string;
  dataKey: string;
  colors: string[];
  formatter: (value: number) => string;
}

const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
    formatter,
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 12}
        fill={fill}
      />
      <g>
        <rect
          x={cx - 60}
          y={cy - 25}
          width={120}
          height={80}
          fill="hsl(var(--muted))"
          rx={4}
          ry={4}
          className="stroke-border"
          strokeWidth={1}
        />
        <text
          x={cx}
          y={cy - 10}
          dy={8}
          textAnchor="middle"
          fontSize={12}
          fontWeight="bold"
          className="fill-foreground"
        >
          {payload.name}
        </text>
        <text
          x={cx}
          y={cy + 10}
          dy={8}
          textAnchor="middle"
          fontSize={12}
          className="fill-foreground"
        >
          {formatter ? formatter(value) : value}
        </text>
        <text
          x={cx}
          y={cy + 30}
          dy={8}
          textAnchor="middle"
          fontSize={10}
          className="fill-foreground"
        >
          {`(${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    </g>
  );
};

export function PieChart({
  data,
  nameKey,
  dataKey,
  colors,
  formatter,
}: PieChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <ResponsiveContainer width="100%" height={240}>
      <RechartsPieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={(props) =>
            renderActiveShape({ ...props, formatter })
          }
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          dataKey={dataKey}
          nameKey={nameKey}
          onMouseEnter={onPieEnter}
          animationDuration={1500}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={`hsl(var(--chart-${(index % 3) + 1}))`} 
              stroke="hsl(var(--background))"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [formatter(value), "Value"]}
          contentStyle={{
            borderRadius: "6px",
            padding: "8px 12px",
            border: "1px solid var(--border)",
            backgroundColor: "hsl(var(--muted))",
            color: "hsl(var(--foreground))",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs text-foreground">{value}</span>
          )}
          wrapperStyle={{
            paddingTop: "20px"
          }}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
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

// Calculate text color based on background color brightness
const getTextColor = (backgroundColor: string) => {
  const rgb = backgroundColor.match(/\d+/g);
  const brightness = rgb ? (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000 : 128;
  return brightness > 128 ? "#000000" : "#ffffff";
};

// Fallback colors in case CSS variables are not loaded
const fallbackColors = [
  "#2563eb", // Blue
  "#10b981", // Green
  "#f59e0b", // Yellow
  "#ef4444", // Red
  "#8b5cf6", // Purple
];

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

  const textColor = getTextColor(fill);

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
      <text
        x={cx}
        y={cy - 10}
        dy={8}
        textAnchor="middle"
        fill={textColor}
        fontSize={12}
        fontWeight="bold"
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy + 10}
        dy={8}
        textAnchor="middle"
        fill={textColor}
        fontSize={12}
      >
        {formatter ? formatter(value) : value}
      </text>
      <text
        x={cx}
        y={cy + 30}
        dy={8}
        textAnchor="middle"
        fill={textColor}
        fontSize={10}
      >
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
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

  const getColor = (index: number) => {
    try {
      const color = colors[index % colors.length];
      // Test if the CSS variable is properly loaded
      const style = getComputedStyle(document.documentElement);
      const cssVar = color.match(/var\((.*?)\)/)?.[1];
      if (cssVar && !style.getPropertyValue(cssVar.trim())) {
        return fallbackColors[index % fallbackColors.length];
      }
      return color;
    } catch {
      return fallbackColors[index % fallbackColors.length];
    }
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
            <Cell key={`cell-${index}`} fill={getColor(index)} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [formatter(value), "Value"]}
          contentStyle={{
            borderRadius: "6px",
            padding: "8px 12px",
            border: "1px solid var(--border, #e5e7eb)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            backgroundColor: "var(--background, #ffffff)",
            color: "var(--foreground, #000000)",
          }}
        />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs">{value}</span>
          )}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
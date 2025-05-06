"use client";

import { useState, useEffect } from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
  Legend,
  Tooltip,
  PieLabelRenderProps,
} from "recharts";
import React from "react";

interface PieChartProps {
  data: any[];
  nameKey: string;
  dataKey: string;
  colors: string[];
  formatter: (value: number) => string;
  labelColor?: string;
}

// Minimal custom activeShape for subtle highlight
const MinimalActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
  } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 8}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      stroke="hsl(var(--background))"
      strokeWidth={2}
    />
  );
};

// Pure function for outside label rendering
function renderCustomLabel(labelColor: string) {
  return function (props: PieLabelRenderProps & { percentage?: number; name?: string }) {
    const RADIAN = Math.PI / 180;
    const {
      cx, cy, midAngle, outerRadius, percent, name, index, payload
    } = props;
    // Ensure all are numbers for arithmetic
    const cxNum = Number(cx);
    const cyNum = Number(cy);
    const outerRadiusNum = Number(outerRadius);
    const midAngleNum = Number(midAngle);
    const radius = outerRadiusNum + 16;
    const x = cxNum + radius * Math.cos(-midAngleNum * RADIAN);
    const y = cyNum + radius * Math.sin(-midAngleNum * RADIAN);
    const percentValue = payload && payload.percentage !== undefined ? payload.percentage : percent * 100;
    return (
      <g>
        {/* Leader line */}
        <polyline
          points={
            `${cxNum + outerRadiusNum * Math.cos(-midAngleNum * RADIAN)},${cyNum + outerRadiusNum * Math.sin(-midAngleNum * RADIAN)} ` +
            `${x},${y}`
          }
          stroke="#888"
          strokeWidth={1}
          fill="none"
        />
        {/* Label */}
        <text
          x={x}
          y={y}
          textAnchor={x > cxNum ? 'start' : 'end'}
          dominantBaseline="central"
          fontSize={12}
          fontWeight={500}
          fill={labelColor}
          style={{ pointerEvents: 'none' }}
        >
          {payload && payload.name ? `${payload.name} (${percentValue.toFixed(1)}%)` : ''}
        </text>
      </g>
    );
  };
}

export function PieChart({
  data,
  nameKey,
  dataKey,
  colors,
  formatter,
  labelColor = '#111',
}: PieChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Extended default color palette for uniqueness
  const defaultColors = [
    '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe',
    '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe',
    '#db2777', '#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8',
    '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0',
    '#f59e42', '#fbbf24', '#fde68a', '#fef3c7', '#d97706',
    '#b91c1c', '#ef4444', '#f87171', '#fca5a5', '#fee2e2',
  ];
  const colorPalette = colors && colors.length >= data.length ? colors : defaultColors;

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <ResponsiveContainer width="100%" height={240}>
      <RechartsPieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={MinimalActiveShape}
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          dataKey={dataKey}
          nameKey={nameKey}
          onMouseEnter={onPieEnter}
          animationDuration={1500}
          label={renderCustomLabel(labelColor)}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={colorPalette[index % colorPalette.length]}
              stroke="hsl(var(--background))"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string, props: any) => [
            formatter(value),
            props.payload && props.payload.percentage !== undefined
              ? `${props.payload.name} (${props.payload.percentage.toFixed(1)}%)`
              : name
          ]}
          contentStyle={{
            borderRadius: "6px",
            padding: "8px 12px",
            border: "1px solid var(--border)",
            backgroundColor: "hsl(var(--muted))",
            color: "hsl(var(--foreground))",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            fontSize: "13px"
          }}
          itemStyle={{
            margin: 0,
            padding: 0,
            fontWeight: 500
          }}
          labelStyle={{
            marginBottom: 2,
            fontWeight: 600
          }}
          separator={": "}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
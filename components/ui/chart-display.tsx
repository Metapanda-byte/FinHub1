"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  xAxis: string[];
  yAxis: {
    label: string;
    data: number[];
  }[];
  colors?: string[];
}

interface ChartDisplayProps {
  chartData: ChartData;
}

export function ChartDisplay({ chartData }: ChartDisplayProps) {
  // Transform data for Recharts
  const transformData = () => {
    const data = [];
    for (let i = 0; i < chartData.xAxis.length; i++) {
      const item: any = { name: chartData.xAxis[i] };
      chartData.yAxis.forEach((axis, index) => {
        item[axis.label] = axis.data[i];
      });
      data.push(item);
    }
    return data;
  };

  const data = transformData();
  const colors = chartData.colors || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const renderChart = () => {
    switch (chartData.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}B`, '']} />
              <Legend />
              {chartData.yAxis.map((axis, index) => (
                <Bar
                  key={axis.label}
                  dataKey={axis.label}
                  fill={colors[index % colors.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}B`, '']} />
              <Legend />
              {chartData.yAxis.map((axis, index) => (
                <Line
                  key={axis.label}
                  type="monotone"
                  dataKey={axis.label}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: $${value.toFixed(2)}B`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={chartData.yAxis[0].label}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}B`, '']} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}B`, '']} />
              <Legend />
              {chartData.yAxis.map((axis, index) => (
                <Area
                  key={axis.label}
                  type="monotone"
                  dataKey={axis.label}
                  stackId="1"
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{chartData.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
} 
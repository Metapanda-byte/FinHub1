import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ProcessedSegment } from '@/lib/api/financial';

interface HistoricalRevenueChartProps {
  data: {
    year: number;
    segments: ProcessedSegment[];
  }[];
  type: 'segment' | 'region';
}

export function HistoricalRevenueChart({ data, type }: HistoricalRevenueChartProps) {
  // Transform data for the stacked bar chart
  const chartData = React.useMemo(() => {
    // Get all unique segment/region names across all years
    const allNames = new Set<string>();
    data.forEach(yearData => {
      yearData.segments.forEach(segment => {
        allNames.add(segment.name);
      });
    });

    // Create data points for each year with all segments/regions
    return data.map(yearData => {
      const baseData = {
        year: yearData.year,
      };

      // Add value for each segment/region
      yearData.segments.forEach(segment => {
        baseData[segment.name] = segment.value;
      });

      // Fill in missing segments/regions with 0
      allNames.forEach(name => {
        if (!(name in baseData)) {
          baseData[name] = 0;
        }
      });

      return baseData;
    });
  }, [data]);

  // Get unique segment/region names for bars
  const segments = React.useMemo(() => {
    const allNames = new Set<string>();
    data.forEach(yearData => {
      yearData.segments.forEach(segment => {
        allNames.add(segment.name);
      });
    });
    return Array.from(allNames);
  }, [data]);

  // Generate colors for segments
  const colors = React.useMemo(() => {
    const baseColors = [
      '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe',
      '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe',
      '#db2777', '#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8',
    ];

    return segments.reduce((acc, segment, index) => {
      acc[segment] = baseColors[index % baseColors.length];
      return acc;
    }, {} as Record<string, string>);
  }, [segments]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis 
          label={{ value: 'Revenue (Billions USD)', angle: -90, position: 'insideLeft' }}
          tickFormatter={(value) => `$${value.toFixed(1)}B`}
        />
        <Tooltip 
          formatter={(value: number) => [`$${value.toFixed(2)}B`, '']}
          labelFormatter={(label) => `Year: ${label}`}
        />
        <Legend />
        {segments.map((segment) => (
          <Bar
            key={segment}
            dataKey={segment}
            stackId="revenue"
            fill={colors[segment]}
            name={segment}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
} 
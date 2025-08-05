"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSearchStore } from "@/lib/store/search-store";
import { useAnalystEstimates } from "@/lib/api/financial";
import { formatFinancialNumber, getGrowthIndicator } from "@/lib/utils/formatters";
import { CrunchingNumbersCard } from "@/components/ui/crunching-numbers-loader";
import { cn } from "@/lib/utils";

interface AnalystEstimatesProps {
  symbol?: string;
}

export function AnalystEstimates({ symbol: propSymbol }: AnalystEstimatesProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'annual' | 'quarter'>('annual');
  const currentSymbol = useSearchStore((state) => state.currentSymbol);
  const symbol = propSymbol || currentSymbol || '';
  
  const { estimates, isLoading, error } = useAnalystEstimates(symbol, 'both');

  // Get current year
  const currentYear = new Date().getFullYear();
  const currentDate = new Date();

  // Filter estimates by period and only include future dates
  const filteredEstimates = estimates?.filter((est: any) => {
    const estimateDate = new Date(est.date);
    const isFuture = estimateDate > currentDate;
    const isPeriodMatch = selectedPeriod === 'annual' 
      ? est.period === 'annual' || !est.period 
      : est.period === 'quarter';
    return isFuture && isPeriodMatch;
  }) || [];

  // Sort by date (oldest first for chronological display)
  const sortedEstimates = [...filteredEstimates].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (isLoading) {
    return <CrunchingNumbersCard />;
  }

  if (error || !estimates || estimates.length === 0 || sortedEstimates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Analyst Estimates Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {error ? 'Unable to fetch analyst estimates for this company.' : 'No forward-looking estimates available.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Helper function to calculate YoY growth
  const calculateGrowth = (values: (number | null)[]) => {
    const growth: (number | null)[] = [];
    for (let i = 0; i < values.length; i++) {
      if (i === 0 || !values[i] || !values[i - 1]) {
        growth.push(null);
      } else {
        growth.push(((values[i]! - values[i - 1]!) / values[i - 1]!) * 100);
      }
    }
    return growth;
  };

  // Format metric value - matching historical financials format
  const formatMetric = (value: number | null | undefined, label?: string, isEPS = false) => {
    if (value === null || value === undefined || isNaN(value) || value === 0) {
      return '-';
    }
    
    const isPercentage = label?.includes('Growth') || label?.includes('Margin');
    
    if (isPercentage) {
      const formattedValue = Math.abs(value).toFixed(1);
      return value < 0 ? `(${formattedValue}%)` : `${formattedValue}%`;
    }
    
    return formatFinancialNumber(value, {
      decimals: isEPS ? 2 : 0,
      useParentheses: true,
      showZeroDecimals: isEPS
    });
  };

  // Helper function to get values for a specific metric
  const getMetricValues = (metric: string) => {
    return sortedEstimates.map(est => {
      const value = est[metric];
      return typeof value === 'number' ? value : null;
    });
  };

  // Render a metric row
  const renderMetricRow = (
    label: string, 
    consensusValues: (number | null)[], 
    highValues?: (number | null)[], 
    lowValues?: (number | null)[],
    isSubtotal = false
  ) => {
    const growth = calculateGrowth(consensusValues);
    const isEPS = label.includes('EPS') || label.includes('Earnings Per Share');
    
    return (
      <>
        <tr className={cn(
          "border-b border-gray-100 dark:border-gray-800",
          isSubtotal && "font-semibold bg-gray-50/50 dark:bg-gray-900/20"
        )}>
          <td className="py-2 px-4 text-sm">{label}</td>
          {consensusValues.map((value, idx) => (
            <td key={idx} className="py-2 px-4 text-sm text-right">
              {formatMetric(value, label, isEPS)}
            </td>
          ))}
          <td className="py-2 px-4 text-sm text-right">
            {growth[growth.length - 1] !== null && (
              <span className={cn(
                "inline-flex items-center",
                growth[growth.length - 1]! > 0 ? "text-green-600" : "text-red-600"
              )}>
                {growth[growth.length - 1]! > 0 ? '↑' : '↓'}
                {Math.abs(growth[growth.length - 1]!).toFixed(1)}%
              </span>
            )}
          </td>
        </tr>
        
        {/* High estimate sub-row */}
        {highValues && (
          <tr className="border-b border-gray-50 dark:border-gray-900">
            <td className="py-1 px-4 pl-8 text-xs text-muted-foreground">High</td>
            {highValues.map((value, idx) => (
              <td key={idx} className="py-1 px-4 text-xs text-right text-muted-foreground">
                {formatMetric(value, label, isEPS)}
              </td>
            ))}
            <td></td>
          </tr>
        )}
        
        {/* Low estimate sub-row */}
        {lowValues && (
          <tr className="border-b border-gray-50 dark:border-gray-900">
            <td className="py-1 px-4 pl-8 text-xs text-muted-foreground">Low</td>
            {lowValues.map((value, idx) => (
              <td key={idx} className="py-1 px-4 text-xs text-right text-muted-foreground">
                {formatMetric(value, label, isEPS)}
              </td>
            ))}
            <td></td>
          </tr>
        )}
      </>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Forward Income Statement Estimates</h3>
        <ToggleGroup type="single" value={selectedPeriod} onValueChange={(value: string) => value && setSelectedPeriod(value as 'annual' | 'quarter')}>
          <ToggleGroupItem value="annual" className="data-[state=active]:bg-finhub-orange data-[state=active]:text-white">
            Annual
          </ToggleGroupItem>
          <ToggleGroupItem value="quarter" className="data-[state=active]:bg-finhub-orange data-[state=active]:text-white">
            Quarterly
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-sm text-gray-600 dark:text-gray-400">
                Metric
              </th>
              {sortedEstimates.map((estimate) => {
                const year = new Date(estimate.date).getFullYear();
                const month = new Date(estimate.date).getMonth() + 1;
                const quarter = Math.ceil(month / 3);
                const fiscalYear = year.toString().slice(-2);
                
                return (
                  <th key={estimate.date} className="text-right py-3 px-4 font-medium text-sm text-gray-600 dark:text-gray-400">
                    {selectedPeriod === 'annual' 
                      ? `FY${fiscalYear}E`
                      : `Q${quarter} FY${fiscalYear}E`
                    }
                  </th>
                );
              })}
              <th className="text-right py-3 px-4 font-medium text-sm text-gray-600 dark:text-gray-400">
                YoY Growth
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Revenue */}
            {renderMetricRow(
              "Revenue",
              getMetricValues('estimatedRevenueAvg'),
              getMetricValues('estimatedRevenueHigh'),
              getMetricValues('estimatedRevenueLow'),
              true
            )}
            
            {/* Gross Profit - if available */}
            
            {/* Operating Expenses */}
            {renderMetricRow(
              "SG&A Expense",
              getMetricValues('estimatedSgaExpenseAvg'),
              getMetricValues('estimatedSgaExpenseHigh'),
              getMetricValues('estimatedSgaExpenseLow')
            )}
            
            {/* EBITDA */}
            {renderMetricRow(
              "EBITDA",
              getMetricValues('estimatedEbitdaAvg'),
              getMetricValues('estimatedEbitdaHigh'),
              getMetricValues('estimatedEbitdaLow'),
              true
            )}
            
            {/* EBIT */}
            {renderMetricRow(
              "EBIT",
              getMetricValues('estimatedEbitAvg'),
              getMetricValues('estimatedEbitHigh'),
              getMetricValues('estimatedEbitLow')
            )}
            
            {/* Net Income */}
            {renderMetricRow(
              "Net Income",
              getMetricValues('estimatedNetIncomeAvg'),
              getMetricValues('estimatedNetIncomeHigh'),
              getMetricValues('estimatedNetIncomeLow'),
              true
            )}
            
            {/* EPS */}
            {renderMetricRow(
              "Earnings Per Share (EPS)",
              getMetricValues('estimatedEpsAvg'),
              getMetricValues('estimatedEpsHigh'),
              getMetricValues('estimatedEpsLow'),
              true
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
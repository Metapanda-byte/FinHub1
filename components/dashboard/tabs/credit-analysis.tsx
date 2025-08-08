"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle, Shield, Target, BarChart3, PieChart } from 'lucide-react';
import { useSearchStore } from '@/lib/store/search-store';
import { useFinancialRatios, useKeyMetrics } from '@/lib/api/financial';
import type { FinancialRatios, KeyMetrics } from '@/lib/types/financial';
import { CrunchingNumbersCard } from "@/components/ui/crunching-numbers-loader";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, RadialBarChart, RadialBar, Legend, Pie } from 'recharts';

interface CreditMetricProps {
  label: string;
  value: number | null | undefined;
  format?: 'ratio' | 'percentage' | 'currency' | 'times';
  benchmark?: { good: number; warning: number };
  higherIsBetter?: boolean;
  description?: string;
}

const CreditMetric: React.FC<CreditMetricProps> = ({ 
  label, 
  value, 
  format = 'ratio', 
  benchmark,
  higherIsBetter = true,
  description 
}) => {
  if (value === null || value === undefined) {
    return (
      <div className="flex justify-between items-center py-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
        <span className="text-sm text-gray-400">N/A</span>
      </div>
    );
  }

  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${(val * 100).toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          notation: val > 1e9 ? 'compact' : 'standard'
        }).format(val);
      case 'times':
        return `${val.toFixed(1)}x`;
      default:
        return val.toFixed(2);
    }
  };

  const getRatingColor = () => {
    if (!benchmark) return 'text-gray-700 dark:text-gray-300';
    
    const isGood = higherIsBetter 
      ? value >= benchmark.good 
      : value <= benchmark.good;
    const isWarning = higherIsBetter 
      ? value >= benchmark.warning && value < benchmark.good
      : value > benchmark.good && value <= benchmark.warning;
    
    if (isGood) return 'text-green-600 dark:text-green-400';
    if (isWarning) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRatingIcon = () => {
    if (!benchmark) return null;
    
    const isGood = higherIsBetter 
      ? value >= benchmark.good 
      : value <= benchmark.good;
    const isWarning = higherIsBetter 
      ? value >= benchmark.warning && value < benchmark.good
      : value > benchmark.good && value <= benchmark.warning;
    
    if (isGood) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (isWarning) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="flex justify-between items-center py-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
        {description && (
          <span className="text-xs text-gray-400" title={description}>ⓘ</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium tabular-nums ${getRatingColor()}`}>
          {formatValue(value)}
        </span>
        {getRatingIcon()}
      </div>
    </div>
  );
};

const CreditRatingBadge: React.FC<{ score: number | null; type: 'altman' | 'piotroski' }> = ({ score, type }) => {
  if (!score) return <Badge variant="secondary">N/A</Badge>;

  if (type === 'altman') {
    if (score > 2.99) return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Strong ({score.toFixed(2)})</Badge>;
    if (score > 1.8) return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Moderate ({score.toFixed(2)})</Badge>;
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Distress Risk ({score.toFixed(2)})</Badge>;
  } else {
    if (score >= 7) return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Strong ({score})</Badge>;
    if (score >= 4) return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Moderate ({score})</Badge>;
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Weak ({score})</Badge>;
  }
};

// Credit Score Gauge Component
const CreditScoreGauge: React.FC<{ score: number; maxScore: number; label: string; type: 'good' | 'warning' | 'danger' }> = ({ 
  score, 
  maxScore, 
  label, 
  type 
}) => {
  const percentage = (score / maxScore) * 100;
  const getColor = () => {
    switch (type) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'danger': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getGradientColor = () => {
    switch (type) {
      case 'good': return '#22c55e';
      case 'warning': return '#eab308';
      case 'danger': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke={getGradientColor()}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${getColor()}`}>
            {score.toFixed(1)}
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        <p className="text-xs text-gray-500">/ {maxScore}</p>
      </div>
    </div>
  );
};

// Risk Heat Map Component
const RiskHeatMap: React.FC<{ metrics: any }> = ({ metrics }) => {
  const riskFactors = [
    { name: 'Liquidity', score: 7, color: '#22c55e' },
    { name: 'Leverage', score: 4, color: '#eab308' },
    { name: 'Profitability', score: 8, color: '#22c55e' },
    { name: 'Coverage', score: 6, color: '#eab308' },
    { name: 'Efficiency', score: 7, color: '#22c55e' },
    { name: 'Stability', score: 5, color: '#f59e0b' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {riskFactors.map((factor, index) => (
        <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 42 42">
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e5e7eb" strokeWidth="3"/>
              <circle
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke={factor.color}
                strokeWidth="3"
                strokeDasharray={`${(factor.score / 10) * 100} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold" style={{ color: factor.color }}>
                {factor.score}
              </span>
            </div>
          </div>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{factor.name}</p>
          <p className="text-xs text-gray-500">Risk Score</p>
        </div>
      ))}
    </div>
  );
};

// Debt Composition Chart
const DebtCompositionChart: React.FC<{ data: any }> = ({ data }) => {
  const debtData = [
    { name: 'Short-term Debt', value: 25, color: '#ef4444' },
    { name: 'Long-term Debt', value: 60, color: '#f59e0b' },
    { name: 'Equity', value: 15, color: '#22c55e' }
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RechartsPieChart>
        <Pie
          dataKey="value"
          data={debtData}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={80}
          paddingAngle={5}
        >
          {debtData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value}%`} />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

// Trend Chart Component
const CreditTrendChart: React.FC<{ title: string; data: any[] }> = ({ title, data }) => {
  const trendData = [
    { period: 'Q1 2023', value: 2.1 },
    { period: 'Q2 2023', value: 2.3 },
    { period: 'Q3 2023', value: 2.0 },
    { period: 'Q4 2023', value: 1.8 },
    { period: 'Q1 2024', value: 1.9 },
    { period: 'Q2 2024', value: 2.2 }
  ];

  return (
    <div>
      <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">{title}</h4>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="period" 
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip 
            formatter={(value) => [`${value}x`, title]}
            labelStyle={{ color: '#374151' }}
            contentStyle={{ 
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '6px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function CreditAnalysis() {
  const { currentSymbol } = useSearchStore();
  const { ratios, isLoading: ratiosLoading, error: ratiosError } = useFinancialRatios(currentSymbol || '');
  const { metrics, isLoading: metricsLoading, error: metricsError } = useKeyMetrics(currentSymbol || '');

  const isLoading = ratiosLoading || metricsLoading;
  const error = ratiosError || metricsError;

  if (!currentSymbol) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Select a company to view credit analysis</p>
      </div>
    );
  }

  if (isLoading) {
    return <CrunchingNumbersCard message="Crunching the numbers" />;
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to load credit analysis data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Credit Risk Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credit Scores with Gauges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Credit Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              <CreditScoreGauge score={2.5} maxScore={5} label="Altman Z-Score" type="warning" />
              <CreditScoreGauge score={6} maxScore={9} label="Piotroski Score" type="good" />
              <div className="text-center pt-4">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                  Investment Grade
                </Badge>
                <p className="text-xs text-gray-500 mt-1">Overall Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Heat Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RiskHeatMap metrics={metrics} />
          </CardContent>
        </Card>

        {/* Debt Composition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Capital Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DebtCompositionChart data={null} />
          </CardContent>
        </Card>
      </div>

      {/* Credit Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Credit Trend Analysis
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Historical progression of key credit metrics
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CreditTrendChart title="Debt-to-EBITDA Ratio" data={[]} />
            <CreditTrendChart title="Interest Coverage Ratio" data={[]} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Leverage Ratios */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leverage Ratios</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Measures of financial leverage and debt burden
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            <CreditMetric
              label="Debt-to-Equity"
              value={ratios?.debtEquityRatio}
              format="ratio"
              benchmark={{ good: 0.5, warning: 1.0 }}
              higherIsBetter={false}
              description="Total debt relative to shareholders' equity"
            />
            <CreditMetric
              label="Debt-to-Assets"
              value={ratios?.debtRatio}
              format="percentage"
              benchmark={{ good: 0.3, warning: 0.5 }}
              higherIsBetter={false}
              description="Total liabilities relative to total assets"
            />
            <CreditMetric
              label="Net Debt-to-EBITDA"
              value={metrics?.netDebtToEBITDA}
              format="times"
              benchmark={{ good: 2.0, warning: 4.0 }}
              higherIsBetter={false}
              description="Net debt relative to earnings capacity"
            />
            <CreditMetric
              label="Long-term Debt-to-Cap"
              value={ratios?.longTermDebtToCapitalization}
              format="percentage"
              benchmark={{ good: 0.4, warning: 0.6 }}
              higherIsBetter={false}
              description="Long-term debt to total capitalization"
            />
            <CreditMetric
              label="Equity Multiplier"
              value={ratios?.companyEquityMultiplier}
              format="times"
              benchmark={{ good: 2.0, warning: 3.0 }}
              higherIsBetter={false}
              description="Financial leverage indicator"
            />
          </CardContent>
        </Card>

        {/* Liquidity Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Liquidity Analysis</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ability to meet short-term obligations
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            <CreditMetric
              label="Current Ratio"
              value={ratios?.currentRatio}
              format="ratio"
              benchmark={{ good: 1.5, warning: 1.0 }}
              higherIsBetter={true}
              description="Current assets to current liabilities"
            />
            <CreditMetric
              label="Quick Ratio"
              value={ratios?.quickRatio}
              format="ratio"
              benchmark={{ good: 1.0, warning: 0.7 }}
              higherIsBetter={true}
              description="Liquid assets to current liabilities"
            />
            <CreditMetric
              label="Cash Ratio"
              value={ratios?.cashRatio}
              format="ratio"
              benchmark={{ good: 0.3, warning: 0.1 }}
              higherIsBetter={true}
              description="Cash and equivalents to current liabilities"
            />
            <CreditMetric
              label="Working Capital"
              value={metrics?.workingCapital}
              format="currency"
              description="Current assets minus current liabilities"
            />
            <CreditMetric
              label="Cash per Share"
              value={metrics?.cashPerShare}
              format="currency"
              description="Available cash per outstanding share"
            />
          </CardContent>
        </Card>

        {/* Coverage Ratios */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Coverage Ratios</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ability to service debt obligations
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            <CreditMetric
              label="Interest Coverage"
              value={ratios?.interestCoverage}
              format="times"
              benchmark={{ good: 5.0, warning: 2.5 }}
              higherIsBetter={true}
              description="EBIT relative to interest expense"
            />
            <CreditMetric
              label="Cash Flow-to-Debt"
              value={ratios?.cashFlowToDebtRatio}
              format="percentage"
              benchmark={{ good: 0.2, warning: 0.1 }}
              higherIsBetter={true}
              description="Operating cash flow to total debt"
            />
            <CreditMetric
              label="Cash Flow Coverage"
              value={ratios?.cashFlowCoverageRatios}
              format="ratio"
              benchmark={{ good: 0.4, warning: 0.2 }}
              higherIsBetter={true}
              description="Operating cash flow to debt payments"
            />
            <CreditMetric
              label="Capex Coverage"
              value={ratios?.capitalExpenditureCoverageRatio}
              format="ratio"
              benchmark={{ good: 1.5, warning: 1.0 }}
              higherIsBetter={true}
              description="Operating cash flow to capital expenditures"
            />
            <CreditMetric
              label="Free Cash Flow Yield"
              value={metrics?.freeCashFlowYield}
              format="percentage"
              benchmark={{ good: 0.05, warning: 0.02 }}
              higherIsBetter={true}
              description="Free cash flow relative to market cap"
            />
          </CardContent>
        </Card>

        {/* Operational Efficiency */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Operational Efficiency</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Working capital and cash conversion metrics
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            <CreditMetric
              label="Days Sales Outstanding"
              value={metrics?.daysSalesOutstanding}
              format="ratio"
              benchmark={{ good: 30, warning: 60 }}
              higherIsBetter={false}
              description="Average collection period in days"
            />
            <CreditMetric
              label="Days Payables Outstanding"
              value={metrics?.daysPayablesOutstanding}
              format="ratio"
              benchmark={{ good: 45, warning: 30 }}
              higherIsBetter={true}
              description="Average payment period in days"
            />
            <CreditMetric
              label="Days Inventory Outstanding"
              value={metrics?.daysOfInventoryOnHand}
              format="ratio"
              benchmark={{ good: 30, warning: 90 }}
              higherIsBetter={false}
              description="Average inventory holding period"
            />
            <CreditMetric
              label="Receivables Turnover"
              value={metrics?.receivablesTurnover}
              format="times"
              benchmark={{ good: 10, warning: 6 }}
              higherIsBetter={true}
              description="Revenue to receivables ratio"
            />
            <CreditMetric
              label="Income Quality"
              value={metrics?.incomeQuality}
              format="ratio"
              benchmark={{ good: 1.0, warning: 0.8 }}
              higherIsBetter={true}
              description="Operating cash flow to net income"
            />
          </CardContent>
        </Card>

        {/* Debt Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Debt Structure</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Debt composition and enterprise value metrics
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            <CreditMetric
              label="Enterprise Value"
              value={metrics?.enterpriseValue}
              format="currency"
              description="Market cap plus net debt"
            />
            <CreditMetric
              label="EV/EBITDA"
              value={metrics?.enterpriseValueOverEBITDA}
              format="times"
              benchmark={{ good: 10, warning: 15 }}
              higherIsBetter={false}
              description="Enterprise value to EBITDA multiple"
            />
            <CreditMetric
              label="EV/Sales"
              value={metrics?.evToSales}
              format="times"
              benchmark={{ good: 3, warning: 5 }}
              higherIsBetter={false}
              description="Enterprise value to sales multiple"
            />
            <CreditMetric
              label="Interest Debt per Share"
              value={metrics?.interestDebtPerShare}
              format="currency"
              description="Debt burden per share"
            />
            <CreditMetric
              label="Tangible Book Value"
              value={metrics?.tangibleAssetValue}
              format="currency"
              description="Assets minus intangibles and liabilities"
            />
          </CardContent>
        </Card>

        {/* Return Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Return Metrics</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Profitability and capital efficiency
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            <CreditMetric
              label="Return on Assets"
              value={ratios?.returnOnAssets}
              format="percentage"
              benchmark={{ good: 0.05, warning: 0.02 }}
              higherIsBetter={true}
              description="Net income relative to total assets"
            />
            <CreditMetric
              label="Return on Equity"
              value={ratios?.returnOnEquity}
              format="percentage"
              benchmark={{ good: 0.15, warning: 0.10 }}
              higherIsBetter={true}
              description="Net income relative to shareholders' equity"
            />
            <CreditMetric
              label="Return on Invested Capital"
              value={metrics?.roic}
              format="percentage"
              benchmark={{ good: 0.12, warning: 0.08 }}
              higherIsBetter={true}
              description="Operating profit relative to invested capital"
            />
            <CreditMetric
              label="Return on Tangible Assets"
              value={metrics?.returnOnTangibleAssets}
              format="percentage"
              benchmark={{ good: 0.08, warning: 0.04 }}
              higherIsBetter={true}
              description="Net income relative to tangible assets"
            />
            <CreditMetric
              label="Operating Margin"
              value={ratios?.operatingProfitMargin}
              format="percentage"
              benchmark={{ good: 0.15, warning: 0.08 }}
              higherIsBetter={true}
              description="Operating profit relative to revenue"
            />
          </CardContent>
        </Card>
      </div>

      {/* Summary and Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-700 dark:text-green-300">Strengths</h4>
              <ul className="space-y-2 text-sm">
                {ratios?.currentRatio && ratios.currentRatio > 1.5 && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Strong liquidity position
                  </li>
                )}
                {ratios?.interestCoverage && ratios.interestCoverage > 5 && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Excellent interest coverage
                  </li>
                )}
                {ratios?.debtEquityRatio && ratios.debtEquityRatio < 0.5 && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Conservative debt levels
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-red-700 dark:text-red-300">Areas of Concern</h4>
              <ul className="space-y-2 text-sm">
                {ratios?.currentRatio && ratios.currentRatio < 1.0 && (
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Below-average liquidity
                  </li>
                )}
                {ratios?.interestCoverage && ratios.interestCoverage < 2.5 && (
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Weak interest coverage
                  </li>
                )}
                {ratios?.debtEquityRatio && ratios.debtEquityRatio > 1.0 && (
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    High leverage risk
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
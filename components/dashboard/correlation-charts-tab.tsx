"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Lightbulb, TrendingUp, BarChart3, Scatter as ScatterIcon, Target } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Bubble } from 'recharts';
import { formatCurrency, formatPercentage } from "@/lib/formatters";

interface ValuationData {
  ticker: string;
  company: string;
  sector: string;
  marketCap: number;
  evToEbitda: number;
  peRatio: number;
  priceToSales: number;
  priceToBook: number;
  dividendYield: number;
}

interface PerformanceData {
  ticker: string;
  company: string;
  sector: string;
  revenueGrowth: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  roic: number;
  roe: number;
}

interface CorrelationChartsTabProps {
  peerValuationData: ValuationData[];
  peerPerformanceData: PerformanceData[];
  currentSymbol: string;
  allValuationData: ValuationData[];
  allPerformanceData: PerformanceData[];
}

// Chart configuration for professional predefined charts
const PREDEFINED_CHARTS = [
  {
    id: 'pe-vs-growth',
    title: 'P/E Ratio vs Revenue Growth',
    xAxis: 'revenueGrowth',
    yAxis: 'peRatio',
    xLabel: 'Revenue Growth (%)',
    yLabel: 'P/E Ratio (x)',
    category: 'valuation',
    description: 'High growth companies typically trade at premium valuations',
    insight: 'Companies above the trend line may be overvalued relative to growth'
  },
  {
    id: 'pb-vs-roe',
    title: 'P/B Ratio vs ROE',
    xAxis: 'roe',
    yAxis: 'priceToBook',
    xLabel: 'Return on Equity (%)',
    yLabel: 'P/B Ratio (x)',
    category: 'profitability',
    description: 'Companies with higher ROE typically command higher P/B multiples',
    insight: 'Particularly relevant for asset-heavy and financial businesses'
  },
  {
    id: 'ev-ebitda-vs-roic',
    title: 'EV/EBITDA vs ROIC',
    xAxis: 'roic',
    yAxis: 'evToEbitda',
    xLabel: 'Return on Invested Capital (%)',
    yLabel: 'EV/EBITDA (x)',
    category: 'efficiency',
    description: 'Capital-efficient companies deserve premium enterprise value multiples',
    insight: 'Companies below the trend line may offer value opportunities'
  },
  {
    id: 'ps-vs-margin',
    title: 'P/S Ratio vs Operating Margin',
    xAxis: 'operatingMargin',
    yAxis: 'priceToSales',
    xLabel: 'Operating Margin (%)',
    yLabel: 'P/S Ratio (x)',
    category: 'profitability',
    description: 'Higher margin businesses command premium revenue multiples',
    insight: 'Critical for evaluating software and service companies'
  },
  {
    id: 'size-profitability',
    title: 'Market Cap vs Net Margin',
    xAxis: 'netMargin',
    yAxis: 'marketCap',
    xLabel: 'Net Margin (%)',
    yLabel: 'Market Cap ($B)',
    category: 'size',
    description: 'Scale advantages often translate to higher profitability',
    insight: 'Large companies with low margins may face competitive pressure'
  },
  {
    id: 'dividend-yield-growth',
    title: 'Dividend Yield vs Revenue Growth',
    xAxis: 'revenueGrowth',
    yAxis: 'dividendYield',
    xLabel: 'Revenue Growth (%)',
    yLabel: 'Dividend Yield (%)',
    category: 'income',
    description: 'Growth companies typically reinvest rather than pay dividends',
    insight: 'High yield with high growth may indicate unsustainable payout'
  }
];

// Sector-specific chart recommendations
const SECTOR_RECOMMENDATIONS = {
  'Technology': [
    'P/S Ratio vs Revenue Growth - Tech companies are valued on growth potential',
    'EV/EBITDA vs ROIC - Capital efficiency is crucial for SaaS models',
    'Market Cap vs Operating Margin - Scalability drives margin expansion'
  ],
  'Healthcare': [
    'P/E Ratio vs Revenue Growth - Innovation drives premium valuations',
    'P/B Ratio vs ROE - Asset utilization in pharma and devices',
    'EV/EBITDA vs ROIC - R&D investment efficiency'
  ],
  'Financial Services': [
    'P/B Ratio vs ROE - Core metric for banking profitability',
    'P/E Ratio vs ROE - Earnings quality and sustainability',
    'Market Cap vs Net Margin - Scale advantages in financial services'
  ],
  'Energy': [
    'EV/EBITDA vs ROIC - Capital intensity requires efficient deployment',
    'P/B Ratio vs ROE - Asset-heavy business model evaluation',
    'Dividend Yield vs Revenue Growth - Income vs growth trade-off'
  ],
  'Consumer': [
    'P/S Ratio vs Operating Margin - Brand premium and efficiency',
    'P/E Ratio vs Revenue Growth - Market share expansion value',
    'EV/EBITDA vs ROIC - Working capital management efficiency'
  ],
  'Industrial': [
    'EV/EBITDA vs ROIC - Capital allocation in cyclical businesses',
    'P/B Ratio vs ROE - Asset utilization efficiency',
    'Market Cap vs Operating Margin - Operational leverage benefits'
  ]
};

// Available metrics for custom chart builder
const AVAILABLE_METRICS = {
  valuation: [
    { key: 'marketCap', label: 'Market Cap ($B)', format: 'currency' },
    { key: 'evToEbitda', label: 'EV/EBITDA (x)', format: 'number' },
    { key: 'peRatio', label: 'P/E Ratio (x)', format: 'number' },
    { key: 'priceToSales', label: 'P/S Ratio (x)', format: 'number' },
    { key: 'priceToBook', label: 'P/B Ratio (x)', format: 'number' },
    { key: 'dividendYield', label: 'Dividend Yield (%)', format: 'percentage' }
  ],
  performance: [
    { key: 'revenueGrowth', label: 'Revenue Growth (%)', format: 'percentage' },
    { key: 'grossMargin', label: 'Gross Margin (%)', format: 'percentage' },
    { key: 'operatingMargin', label: 'Operating Margin (%)', format: 'percentage' },
    { key: 'netMargin', label: 'Net Margin (%)', format: 'percentage' },
    { key: 'roic', label: 'ROIC (%)', format: 'percentage' },
    { key: 'roe', label: 'ROE (%)', format: 'percentage' }
  ]
};

const formatValue = (value: number, format: string) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  
  switch (format) {
    case 'currency':
      return `$${(value / 1000000000).toFixed(1)}B`;
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'number':
      return `${value.toFixed(1)}x`;
    default:
      return value.toFixed(1);
  }
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
        <p className="font-semibold text-blue-600">{data.ticker}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{data.company}</p>
        <p className="text-sm text-gray-500">{data.sector}</p>
        <div className="mt-2 space-y-1">
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm">
              <span className="font-medium">{entry.name}:</span> {entry.value}
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function CorrelationChartsTab({
  peerValuationData,
  peerPerformanceData,
  currentSymbol,
  allValuationData,
  allPerformanceData
}: CorrelationChartsTabProps) {
  const [selectedChart, setSelectedChart] = useState(PREDEFINED_CHARTS[0].id);
  const [customXAxis, setCustomXAxis] = useState('revenueGrowth');
  const [customYAxis, setCustomYAxis] = useState('peRatio');
  const [activeTab, setActiveTab] = useState('predefined');

  // Combine valuation and performance data
  const combinedData = useMemo(() => {
    return allValuationData.map(valuation => {
      const performance = allPerformanceData.find(p => p.ticker === valuation.ticker);
      return {
        ...valuation,
        ...performance,
        isSubject: valuation.ticker === currentSymbol,
        isSelected: peerValuationData.some(p => p.ticker === valuation.ticker)
      };
    }).filter(item => item.ticker && item.company); // Filter out any incomplete data
  }, [allValuationData, allPerformanceData, currentSymbol, peerValuationData]);

  // Get sector recommendations
  const subjectCompany = combinedData.find(d => d.ticker === currentSymbol);
  const sectorRecommendations = subjectCompany?.sector ? SECTOR_RECOMMENDATIONS[subjectCompany.sector as keyof typeof SECTOR_RECOMMENDATIONS] || [] : [];

  // Prepare chart data for selected predefined chart
  const selectedChartConfig = PREDEFINED_CHARTS.find(c => c.id === selectedChart);
  const chartData = useMemo(() => {
    if (!selectedChartConfig) return [];
    
    return combinedData.map(item => ({
      ...item,
      x: item[selectedChartConfig.xAxis as keyof typeof item] as number,
      y: item[selectedChartConfig.yAxis as keyof typeof item] as number,
      size: (item.marketCap || 0) / 1000000000 // Size for bubble charts
    })).filter(item => 
      item.x !== null && item.x !== undefined && !isNaN(item.x as number) &&
      item.y !== null && item.y !== undefined && !isNaN(item.y as number)
    );
  }, [combinedData, selectedChartConfig]);

  // Prepare custom chart data
  const customChartData = useMemo(() => {
    return combinedData.map(item => ({
      ...item,
      x: item[customXAxis as keyof typeof item] as number,
      y: item[customYAxis as keyof typeof item] as number,
      size: (item.marketCap || 0) / 1000000000
    })).filter(item => 
      item.x !== null && item.x !== undefined && !isNaN(item.x as number) &&
      item.y !== null && item.y !== undefined && !isNaN(item.y as number)
    );
  }, [combinedData, customXAxis, customYAxis]);

  const renderScatterChart = (data: any[], config: any, isCustom = false) => {
    const xMetric = isCustom ? 
      [...AVAILABLE_METRICS.valuation, ...AVAILABLE_METRICS.performance].find(m => m.key === customXAxis) :
      { key: config.xAxis, label: config.xLabel, format: 'number' };
    const yMetric = isCustom ?
      [...AVAILABLE_METRICS.valuation, ...AVAILABLE_METRICS.performance].find(m => m.key === customYAxis) :
      { key: config.yAxis, label: config.yLabel, format: 'number' };

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name={xMetric?.label || config.xLabel}
            tickFormatter={(value) => formatValue(value, xMetric?.format || 'number')}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name={yMetric?.label || config.yLabel}
            tickFormatter={(value) => formatValue(value, yMetric?.format || 'number')}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Scatter name="Peer Companies" data={data.filter(d => !d.isSubject)} fill="#8884d8">
            {data.filter(d => !d.isSubject).map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isSelected ? "#3b82f6" : "#94a3b8"} 
                stroke={entry.isSelected ? "#1e40af" : "#64748b"}
                strokeWidth={2}
              />
            ))}
          </Scatter>
          <Scatter 
            name={`${currentSymbol} (Subject)`} 
            data={data.filter(d => d.isSubject)} 
            fill="#dc2626"
          >
            {data.filter(d => d.isSubject).map((entry, index) => (
              <Cell key={`subject-${index}`} fill="#dc2626" stroke="#991b1b" strokeWidth={3} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      {/* AI Co-pilot Suggestions */}
      {sectorRecommendations.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                AI Co-pilot: Sector-Specific Analysis
              </CardTitle>
            </div>
            <CardDescription className="text-blue-800 dark:text-blue-200">
              Based on {subjectCompany?.sector} sector analysis, focus on these key correlations:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sectorRecommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200">
                  <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="predefined">Professional Charts</TabsTrigger>
          <TabsTrigger value="custom">Custom Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="predefined" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Professional Correlation Charts
              </CardTitle>
              <CardDescription>
                Institutional-grade correlation analysis with professional insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Chart Selection */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_CHARTS.map(chart => (
                    <Button
                      key={chart.id}
                      variant={selectedChart === chart.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedChart(chart.id)}
                      className="text-xs"
                    >
                      {chart.title}
                    </Button>
                  ))}
                </div>

                {selectedChartConfig && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{selectedChartConfig.title}</h3>
                        <p className="text-sm text-muted-foreground">{selectedChartConfig.description}</p>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {selectedChartConfig.category}
                      </Badge>
                    </div>

                    {/* Chart */}
                    <div className="border rounded-lg p-4">
                      {renderScatterChart(chartData, selectedChartConfig)}
                    </div>

                    {/* Insight */}
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-900 dark:text-yellow-100">Professional Insight</span>
                      </div>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        {selectedChartConfig.insight}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScatterIcon className="h-5 w-5" />
                Custom Correlation Analysis
              </CardTitle>
              <CardDescription>
                Build your own correlation charts with any combination of metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Metric Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">X-Axis Metric</label>
                    <Select value={customXAxis} onValueChange={setCustomXAxis}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Valuation Metrics</div>
                        {AVAILABLE_METRICS.valuation.map(metric => (
                          <SelectItem key={metric.key} value={metric.key}>
                            {metric.label}
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Performance Metrics</div>
                        {AVAILABLE_METRICS.performance.map(metric => (
                          <SelectItem key={metric.key} value={metric.key}>
                            {metric.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Y-Axis Metric</label>
                    <Select value={customYAxis} onValueChange={setCustomYAxis}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Valuation Metrics</div>
                        {AVAILABLE_METRICS.valuation.map(metric => (
                          <SelectItem key={metric.key} value={metric.key}>
                            {metric.label}
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Performance Metrics</div>
                        {AVAILABLE_METRICS.performance.map(metric => (
                          <SelectItem key={metric.key} value={metric.key}>
                            {metric.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Chart */}
                <div className="border rounded-lg p-4">
                  {renderScatterChart(customChartData, {
                    xLabel: AVAILABLE_METRICS.valuation.concat(AVAILABLE_METRICS.performance).find(m => m.key === customXAxis)?.label,
                    yLabel: AVAILABLE_METRICS.valuation.concat(AVAILABLE_METRICS.performance).find(m => m.key === customYAxis)?.label
                  }, true)}
                </div>

                {/* Custom Analysis Helper */}
                <div className="bg-gray-50 dark:bg-gray-900/50 border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Analysis Tips</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Look for clusters of similar companies to identify peer groups</p>
                    <p>• Companies far from the trend line may represent opportunities or risks</p>
                    <p>• The red dot represents your subject company ({currentSymbol})</p>
                    <p>• Blue dots are selected peers, gray dots are additional companies</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Legend and Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Chart Legend & Data Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span>{currentSymbol} (Subject Company)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span>Selected Peer Companies ({peerValuationData.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span>Additional Companies ({allValuationData.length - peerValuationData.length - 1})</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
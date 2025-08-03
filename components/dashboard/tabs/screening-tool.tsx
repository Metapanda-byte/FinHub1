"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, ArrowUpDown, Filter, RotateCcw, TrendingUp, DollarSign, Activity, Shield, BarChart3 } from "lucide-react";
import { screeningResults } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface ScreeningFilters {
  // Basic Filters
  marketCap: string;
  sector: string;
  exchange: string;
  country: string;
  
  // Valuation Metrics
  peRatio: [number, number];
  priceToBook: [number, number];
  priceToSales: [number, number];
  evEbitda: [number, number];
  
  // Growth Metrics
  revenueGrowth: [number, number];
  earningsGrowth: [number, number];
  revenueGrowth5Y: [number, number];
  
  // Profitability & Quality
  roe: [number, number];
  roa: [number, number];
  grossMargin: [number, number];
  operatingMargin: [number, number];
  debtToEquity: [number, number];
  currentRatio: [number, number];
  
  // Dividend & Yield
  dividendYield: [number, number];
  payoutRatio: [number, number];
  
  // Technical & Price
  price: [number, number];
  beta: [number, number];
  priceChange1Y: [number, number];
  
  // Boolean Filters
  positiveEarnings: boolean;
  paysDividend: boolean;
  positiveFCF: boolean;
  profitableLastYear: boolean;
  growingRevenue: boolean;
  lowDebt: boolean;
}

export function ScreeningTool() {
  const [activeFilterTab, setActiveFilterTab] = useState("basic");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  const [filters, setFilters] = useState<ScreeningFilters>({
    // Basic Filters
    marketCap: "all",
    sector: "all",
    exchange: "all",
    country: "all",
    
    // Valuation Metrics
    peRatio: [0, 100],
    priceToBook: [0, 20],
    priceToSales: [0, 50],
    evEbitda: [0, 100],
    
    // Growth Metrics
    revenueGrowth: [-50, 100],
    earningsGrowth: [-100, 200],
    revenueGrowth5Y: [-20, 50],
    
    // Profitability & Quality
    roe: [-50, 100],
    roa: [-20, 50],
    grossMargin: [0, 100],
    operatingMargin: [-50, 100],
    debtToEquity: [0, 10],
    currentRatio: [0, 10],
    
    // Dividend & Yield
    dividendYield: [0, 20],
    payoutRatio: [0, 200],
    
    // Technical & Price
    price: [0, 1000],
    beta: [0, 5],
    priceChange1Y: [-80, 300],
    
    // Boolean Filters
    positiveEarnings: false,
    paysDividend: false,
    positiveFCF: false,
    profitableLastYear: false,
    growingRevenue: false,
    lowDebt: false,
  });

  const filteredResults = screeningResults.filter(item => {
    // Market cap filter
    if (filters.marketCap !== "all") {
      const ranges: Record<string, [number, number]> = {
        "mega-cap": [200, Infinity],
        "large-cap": [10, 200],
        "mid-cap": [2, 10],
        "small-cap": [0.3, 2],
        "micro-cap": [0, 0.3]
      };
      const range = ranges[filters.marketCap];
      if (range && !(item.marketCap >= range[0] && item.marketCap <= range[1])) {
        return false;
      }
    }

    // Sector filter
    if (filters.sector !== "all" && item.sector !== filters.sector) {
      return false;
    }

    // Range filters
    if (item.peRatio < filters.peRatio[0] || item.peRatio > filters.peRatio[1]) {
      return false;
    }
    if (item.dividendYield < filters.dividendYield[0] || item.dividendYield > filters.dividendYield[1]) {
      return false;
    }
    if (item.revenueGrowth < filters.revenueGrowth[0] || item.revenueGrowth > filters.revenueGrowth[1]) {
      return false;
    }

    // Boolean filters
    if (filters.positiveEarnings && item.peRatio <= 0) {
      return false;
    }
    if (filters.paysDividend && item.dividendYield <= 0) {
      return false;
    }

    return true;
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (!sortBy) return 0;
    
    const fieldA = a[sortBy as keyof typeof a];
    const fieldB = b[sortBy as keyof typeof b];
    
    if (typeof fieldA === "number" && typeof fieldB === "number") {
      return sortDirection === "asc" ? fieldA - fieldB : fieldB - fieldA;
    }
    
    const stringA = String(fieldA);
    const stringB = String(fieldB);
    return sortDirection === "asc" 
      ? stringA.localeCompare(stringB) 
      : stringB.localeCompare(stringA);
  });

  const paginatedResults = sortedResults.slice(
    (currentPage - 1) * resultsPerPage, 
    currentPage * resultsPerPage
  );
  
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);

  const applyPreset = (preset: string) => {
    switch(preset) {
      case 'value':
        setFilters(prev => ({
          ...prev,
          peRatio: [0, 20],
          dividendYield: [1, 20],
          positiveEarnings: true,
          paysDividend: true
        }));
        break;
      case 'growth':
        setFilters(prev => ({
          ...prev,
          revenueGrowth: [15, 100],
          positiveEarnings: true,
        }));
        break;
      case 'dividend':
        setFilters(prev => ({
          ...prev,
          dividendYield: [2, 20],
          paysDividend: true,
          positiveEarnings: true
        }));
        break;
    }
  };

  const resetFilters = () => {
    setFilters({
      // Basic Filters
      marketCap: "all",
      sector: "all",
      exchange: "all",
      country: "all",
      
      // Valuation Metrics
      peRatio: [0, 100],
      priceToBook: [0, 20],
      priceToSales: [0, 50],
      evEbitda: [0, 100],
      
      // Growth Metrics
      revenueGrowth: [-50, 100],
      earningsGrowth: [-100, 200],
      revenueGrowth5Y: [-20, 50],
      
      // Profitability & Quality
      roe: [-50, 100],
      roa: [-20, 50],
      grossMargin: [0, 100],
      operatingMargin: [-50, 100],
      debtToEquity: [0, 10],
      currentRatio: [0, 10],
      
      // Dividend & Yield
      dividendYield: [0, 20],
      payoutRatio: [0, 200],
      
      // Technical & Price
      price: [0, 1000],
      beta: [0, 5],
      priceChange1Y: [-80, 300],
      
      // Boolean Filters
      positiveEarnings: false,
      paysDividend: false,
      positiveFCF: false,
      profitableLastYear: false,
      growingRevenue: false,
      lowDebt: false,
    });
  };

  const exportToCsv = () => {
    const headers = ["Ticker", "Company", "Sector", "Market Cap", "P/E Ratio", "Dividend Yield", "Revenue Growth", "1Y Return"];
    const csvData = [headers.join(",")];
    
    sortedResults.forEach(row => {
      csvData.push([
        row.ticker,
        `"${row.company}"`,
        row.sector,
        row.marketCap,
        row.peRatio,
        row.dividendYield,
        row.revenueGrowth,
        row.priceChange1Y
      ].join(","));
    });
    
    const blob = new Blob([csvData.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `screening-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />;
    return sortDirection === "asc" 
      ? <ArrowUpDown className="h-3 w-3 ml-1" /> 
      : <ArrowUpDown className="h-3 w-3 ml-1 rotate-180" />;
  };

  const RangeFilter = ({ 
    label, 
    value, 
    onChange, 
    min = 0, 
    max = 100, 
    step = 1, 
    suffix = "",
    prefix = "" 
  }: {
    label: string;
    value: [number, number];
    onChange: (value: [number, number]) => void;
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
    prefix?: string;
  }) => (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        <span className="text-xs text-muted-foreground">
          {prefix}{value[0]}{suffix} - {prefix}{value[1]}{suffix}
        </span>
      </div>
      <Slider
        value={value}
        onValueChange={(v) => onChange(v as [number, number])}
        min={min}
        max={max}
        step={step}
        className="py-2"
      />
    </div>
  );

  const SelectFilter = ({ 
    label, 
    value, 
    onChange, 
    options 
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
  }) => (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-xs">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Screening Filters
          </CardTitle>
          <CardDescription className="text-xs">
            Professional equity screening with mock data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeFilterTab} onValueChange={setActiveFilterTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-8">
              <TabsTrigger value="basic" className="text-xs p-1">
                <Filter className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="valuation" className="text-xs p-1">
                <DollarSign className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="growth" className="text-xs p-1">
                <TrendingUp className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="quality" className="text-xs p-1">
                <Shield className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="technical" className="text-xs p-1">
                <Activity className="h-3 w-3" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-3 mt-3">
              <div className="grid grid-cols-1 gap-3">
                <SelectFilter
                  label="Market Cap"
                  value={filters.marketCap}
                  onChange={(value: string) => setFilters(prev => ({...prev, marketCap: value}))}
                  options={[
                    { value: "all", label: "All Caps" },
                    { value: "mega-cap", label: "Mega Cap (>$200B)" },
                    { value: "large-cap", label: "Large Cap ($10B-$200B)" },
                    { value: "mid-cap", label: "Mid Cap ($2B-$10B)" },
                    { value: "small-cap", label: "Small Cap ($300M-$2B)" },
                    { value: "micro-cap", label: "Micro Cap (<$300M)" }
                  ]}
                />
                
                <SelectFilter
                  label="Sector"
                  value={filters.sector}
                  onChange={(value: string) => setFilters(prev => ({...prev, sector: value}))}
                  options={[
                    { value: "all", label: "All Sectors" },
                    { value: "Technology", label: "Technology" },
                    { value: "Healthcare", label: "Healthcare" },
                    { value: "Financials", label: "Financials" },
                    { value: "Consumer Discretionary", label: "Consumer Discretionary" },
                    { value: "Communication Services", label: "Communication Services" },
                    { value: "Industrials", label: "Industrials" },
                    { value: "Consumer Staples", label: "Consumer Staples" },
                    { value: "Energy", label: "Energy" },
                    { value: "Utilities", label: "Utilities" },
                    { value: "Real Estate", label: "Real Estate" },
                    { value: "Materials", label: "Materials" }
                  ]}
                />

                <SelectFilter
                  label="Exchange"
                  value={filters.exchange}
                  onChange={(value: string) => setFilters(prev => ({...prev, exchange: value}))}
                  options={[
                    { value: "all", label: "All Exchanges" },
                    { value: "NYSE", label: "NYSE" },
                    { value: "NASDAQ", label: "NASDAQ" },
                    { value: "AMEX", label: "AMEX" }
                  ]}
                />

                <SelectFilter
                  label="Country"
                  value={filters.country}
                  onChange={(value: string) => setFilters(prev => ({...prev, country: value}))}
                  options={[
                    { value: "all", label: "All Countries" },
                    { value: "US", label: "United States" },
                    { value: "CA", label: "Canada" },
                    { value: "GB", label: "United Kingdom" }
                  ]}
                />

                <RangeFilter
                  label="Price ($)"
                  value={filters.price}
                  onChange={(value: [number, number]) => setFilters(prev => ({...prev, price: value}))}
                  min={0}
                  max={1000}
                  step={5}
                  prefix="$"
                />

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Quick Filters</Label>
                  <div className="grid grid-cols-1 gap-1">
                    {[
                      { key: 'positiveEarnings', label: 'Profitable' },
                      { key: 'paysDividend', label: 'Dividend Payer' },
                      { key: 'positiveFCF', label: 'Positive FCF' },
                      { key: 'growingRevenue', label: 'Growing Revenue' },
                      { key: 'lowDebt', label: 'Low Debt' }
                    ].map((filter) => (
                      <div key={filter.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={filter.key}
                          checked={filters[filter.key as keyof ScreeningFilters] as boolean}
                          onCheckedChange={(checked: boolean) => setFilters(prev => ({...prev, [filter.key]: checked}))}
                          className="h-3 w-3"
                        />
                        <label htmlFor={filter.key} className="text-xs font-medium">
                          {filter.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="valuation" className="space-y-3 mt-3">
              <div className="grid grid-cols-1 gap-3">
                <RangeFilter
                  label="P/E Ratio"
                  value={filters.peRatio}
                  onChange={(value: [number, number]) => setFilters(prev => ({...prev, peRatio: value}))}
                  min={0}
                  max={100}
                  suffix="x"
                />
                
                <RangeFilter
                  label="P/B Ratio"
                  value={filters.priceToBook}
                  onChange={(value: [number, number]) => setFilters(prev => ({...prev, priceToBook: value}))}
                  min={0}
                  max={20}
                  step={0.1}
                  suffix="x"
                />
                
                <RangeFilter
                  label="P/S Ratio"
                  value={filters.priceToSales}
                  onChange={(value: [number, number]) => setFilters(prev => ({...prev, priceToSales: value}))}
                  min={0}
                  max={50}
                  step={0.1}
                  suffix="x"
                />
                
                <RangeFilter
                  label="EV/EBITDA"
                  value={filters.evEbitda}
                  onChange={(value: [number, number]) => setFilters(prev => ({...prev, evEbitda: value}))}
                  min={0}
                  max={100}
                  suffix="x"
                />
              </div>
            </TabsContent>

            <TabsContent value="growth" className="space-y-3 mt-3">
              <div className="grid grid-cols-1 gap-3">
                <RangeFilter
                  label="Revenue Growth (TTM)"
                  value={filters.revenueGrowth}
                  onChange={(value: [number, number]) => setFilters(prev => ({...prev, revenueGrowth: value}))}
                  min={-50}
                  max={100}
                  suffix="%"
                />
                
                <RangeFilter
                  label="Earnings Growth (TTM)"
                  value={filters.earningsGrowth}
                  onChange={(value: [number, number]) => setFilters(prev => ({...prev, earningsGrowth: value}))}
                  min={-100}
                  max={200}
                  suffix="%"
                />
                
                <RangeFilter
                  label="Revenue Growth (5Y)"
                  value={filters.revenueGrowth5Y}
                  onChange={(value: [number, number]) => setFilters(prev => ({...prev, revenueGrowth5Y: value}))}
                  min={-20}
                  max={50}
                  suffix="%"
                />
              </div>
            </TabsContent>

            <TabsContent value="quality" className="space-y-3 mt-3">
              <div className="grid grid-cols-1 gap-3">
                <RangeFilter
                  label="ROE (%)"
                  value={filters.roe}
                  onChange={(value: [number, number]) => setFilters(prev => ({...prev, roe: value}))}
                  min={-50}
                  max={100}
                  suffix="%"
                />
                
                <RangeFilter
                  label="ROA (%)"
                  value={filters.roa}
                  onChange={(value: [number, number]) => setFilters(prev => ({...prev, roa: value}))}
                  min={-20}
                  max={50}
                  suffix="%"
                />
                
                <RangeFilter
                  label="Gross Margin (%)"
                  value={filters.grossMargin}
                  onChange={(value: [number, number]) => setFilters(prev => ({...prev, grossMargin: value}))}
                  min={0}
                  max={100}
                  suffix="%"
                />
                
                <RangeFilter
                  label="Operating Margin (%)"
                  value={filters.operatingMargin}
                  onChange={(value: [number, number]) => setFilters(prev => ({...prev, operatingMargin: value}))}
                  min={-50}
                  max={100}
                  suffix="%"
                />
                
                <RangeFilter
                  label="Debt/Equity"
                  value={filters.debtToEquity}
                  onChange={(value: [number, number]) => setFilters(prev => ({...prev, debtToEquity: value}))}
                  min={0}
                  max={10}
                  step={0.1}
                />
                
                <RangeFilter
                  label="Current Ratio"
                  value={filters.currentRatio}
                  onChange={(value: [number, number]) => setFilters(prev => ({...prev, currentRatio: value}))}
                  min={0}
                  max={10}
                  step={0.1}
                />
              </div>
            </TabsContent>

            <TabsContent value="technical" className="space-y-3 mt-3">
              <div className="grid grid-cols-1 gap-3">
                <RangeFilter
                  label="Beta"
                  value={filters.beta}
                  onChange={(value: [number, number]) => setFilters(prev => ({...prev, beta: value}))}
                  min={0}
                  max={5}
                  step={0.1}
                />
                
                <RangeFilter
                  label="1Y Return (%)"
                  value={filters.priceChange1Y}
                  onChange={(value: [number, number]) => setFilters(prev => ({...prev, priceChange1Y: value}))}
                  min={-80}
                  max={300}
                  suffix="%"
                />
                
                <RangeFilter
                  label="Dividend Yield (%)"
                  value={filters.dividendYield}
                  onChange={(value: [number, number]) => setFilters(prev => ({...prev, dividendYield: value}))}
                  min={0}
                  max={20}
                  step={0.1}
                  suffix="%"
                />
                
                <RangeFilter
                  label="Payout Ratio (%)"
                  value={filters.payoutRatio}
                  onChange={(value: [number, number]) => setFilters(prev => ({...prev, payoutRatio: value}))}
                  min={0}
                  max={200}
                  suffix="%"
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="space-y-2 pt-2 border-t">
            <Label className="text-xs font-medium text-muted-foreground">Preset Screens</Label>
            <div className="grid grid-cols-1 gap-1">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs justify-start"
                onClick={() => applyPreset('value')}
              >
                Value Stocks
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs justify-start"
                onClick={() => applyPreset('growth')}
              >
                Growth Stocks
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs justify-start"
                onClick={() => applyPreset('dividend')}
              >
                Dividend Stocks
              </Button>
            </div>
            <Button size="sm" onClick={resetFilters} variant="outline" className="w-full h-8 text-xs">
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset All Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-3">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              Results
            </CardTitle>
            <CardDescription>
              Found {filteredResults.length} of {screeningResults.length} companies
              {filteredResults.length !== screeningResults.length && " (filtered)"}
              <br />
              <span className="text-xs text-muted-foreground">
                Data source: Demo data
              </span>
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportToCsv} disabled={filteredResults.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {paginatedResults.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No companies found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try adjusting your filters to see more results
              </p>
              <Button onClick={resetFilters} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse screening-table">
              <thead>
                <tr className="border-b-2 border-border text-xs">
                  <th 
                    className="text-left py-2 px-2 font-medium cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('ticker')}
                  >
                    <div className="flex items-center">
                      Ticker
                      {renderSortIcon('ticker')}
                    </div>
                  </th>
                  <th 
                    className="text-left py-2 px-2 font-medium cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('company')}
                  >
                    <div className="flex items-center">
                      Company
                      {renderSortIcon('company')}
                    </div>
                  </th>
                  <th 
                    className="text-left py-2 px-2 font-medium cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('sector')}
                  >
                    <div className="flex items-center">
                      Sector
                      {renderSortIcon('sector')}
                    </div>
                  </th>
                  <th 
                    className="text-right py-2 px-2 font-medium cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('marketCap')}
                  >
                    <div className="flex items-center justify-end">
                      Mkt Cap
                      {renderSortIcon('marketCap')}
                    </div>
                  </th>
                  <th 
                    className="text-right py-2 px-2 font-medium cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('peRatio')}
                  >
                    <div className="flex items-center justify-end">
                      P/E
                      {renderSortIcon('peRatio')}
                    </div>
                  </th>
                  <th 
                    className="text-right py-2 px-2 font-medium cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('dividendYield')}
                  >
                    <div className="flex items-center justify-end">
                      Div %
                      {renderSortIcon('dividendYield')}
                    </div>
                  </th>
                  <th 
                    className="text-right py-2 px-2 font-medium cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('revenueGrowth')}
                  >
                    <div className="flex items-center justify-end">
                      Rev Growth
                      {renderSortIcon('revenueGrowth')}
                    </div>
                  </th>
                  <th 
                    className="text-right py-2 px-2 font-medium cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('priceChange1Y')}
                  >
                    <div className="flex items-center justify-end">
                      1Y Return
                      {renderSortIcon('priceChange1Y')}
                    </div>
                  </th>
                  <th 
                    className="text-right py-2 px-2 font-medium cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('beta')}
                  >
                    <div className="flex items-center justify-end">
                      Beta
                      {renderSortIcon('beta')}
                    </div>
                  </th>
                  <th 
                    className="text-right py-2 px-2 font-medium cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('eps')}
                  >
                    <div className="flex items-center justify-end">
                      EPS
                      {renderSortIcon('eps')}
                    </div>
                  </th>
                  <th 
                    className="text-right py-2 px-2 font-medium cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('priceToBook')}
                  >
                    <div className="flex items-center justify-end">
                      P/B
                      {renderSortIcon('priceToBook')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedResults.map((company) => (
                  <tr key={company.ticker} className="hover:bg-muted/50 transition-colors text-xs h-10 border-b border-border/30">
                    <td className="py-2 px-2 font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline align-middle">
                      {company.ticker}
                    </td>
                    <td className="py-2 px-2 max-w-[150px] truncate align-middle" title={company.company}>
                      {company.company}
                    </td>
                    <td className="py-2 px-2 align-middle">{company.sector}</td>
                    <td className="text-right py-2 px-2 tabular-nums align-middle">${company.marketCap.toFixed(0)}B</td>
                    <td className="text-right py-2 px-2 tabular-nums align-middle">{company.peRatio.toFixed(1)}</td>
                    <td className="text-right py-2 px-2 tabular-nums align-middle">{company.dividendYield.toFixed(1)}%</td>
                    <td className={cn(
                      "text-right py-2 px-2 tabular-nums align-middle",
                      company.revenueGrowth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {company.revenueGrowth >= 0 ? '+' : ''}{company.revenueGrowth.toFixed(1)}%
                    </td>
                    <td className={cn(
                      "text-right py-2 px-2 tabular-nums align-middle",
                      company.priceChange1Y >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {company.priceChange1Y >= 0 ? '+' : ''}{company.priceChange1Y.toFixed(1)}%
                    </td>
                    <td className="text-right py-2 px-2 tabular-nums align-middle">
                      {(company as any).beta?.toFixed(2) || "1.00"}
                    </td>
                    <td className="text-right py-2 px-2 tabular-nums align-middle">
                      ${(company as any).eps?.toFixed(2) || "0.00"}
                    </td>
                    <td className="text-right py-2 px-2 tabular-nums align-middle">
                      {(company as any).priceToBook?.toFixed(1) || "0.0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
          
          {totalPages > 1 && paginatedResults.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * resultsPerPage) + 1} to {Math.min(currentPage * resultsPerPage, filteredResults.length)} of {filteredResults.length} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
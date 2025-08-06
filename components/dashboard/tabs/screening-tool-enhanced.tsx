"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, ArrowUpDown, Filter, RotateCcw, TrendingUp, DollarSign, Activity, Shield, BarChart3, Globe, Loader2, Star, Users, TrendingDown, Target, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScreeningData, useStockUniverse, ScreeningCompany, ScreeningFilters } from "@/lib/api/screening";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/use-media-query";

// Exchange mapping for display
const EXCHANGE_DISPLAY: Record<string, string> = {
  'NYSE': 'NYSE',
  'NASDAQ': 'NASDAQ',
  'AMEX': 'AMEX',
  'TSX': 'TSX (Canada)',
  'LSE': 'LSE (London)',
  'EURONEXT': 'Euronext',
  'XETRA': 'XETRA (Germany)',
  'NSE': 'NSE (India)',
  'SEHK': 'SEHK (Hong Kong)',
  'ASX': 'ASX (Australia)',
  'Other': 'Other'
};

// Enhanced interface with additional metrics
interface EnhancedScreeningFilters extends ScreeningFilters {
  // ESG & Sustainability
  esgScore: [number, number];
  carbonIntensity: [number, number];
  
  // Analyst Coverage
  analystRating: [number, number];
  priceTarget: [number, number];
  analystCount: [number, number];
  
  // Insider Trading
  insiderBuying: boolean;
  insiderSelling: boolean;
  institutionalOwnership: [number, number];
  
  // Advanced Technical
  rsi: [number, number];
  macd: [number, number];
  movingAverage50: [number, number];
  movingAverage200: [number, number];
  
  // Quality Metrics
  assetTurnover: [number, number];
  inventoryTurnover: [number, number];
  receivablesTurnover: [number, number];
  
  // Cash Flow Metrics
  operatingCashFlow: [number, number];
  freeCashFlow: [number, number];
  cashFlowYield: [number, number];
  
  // Efficiency Metrics
  returnOnTangibleAssets: [number, number];
  returnOnCapitalEmployed: [number, number];
  economicValueAdded: [number, number];
}

export function ScreeningToolEnhanced() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeFilterTab, setActiveFilterTab] = useState("basic");
  const [sortBy, setSortBy] = useState<keyof ScreeningCompany | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(isMobile ? 10 : 25);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Use real data from API
  const { data: screeningData, isLoading, error } = useScreeningData();
  const { data: universeData } = useStockUniverse();

  const [filters, setFilters] = useState<EnhancedScreeningFilters>({
    // Basic Filters
    marketCap: "all",
    sector: "all",
    exchange: "all",
    country: "all",
    
    // Valuation Metrics
    peRatio: [0, 100],
    priceToBook: [0, 20],
    priceToSales: [0, 50],
    pegRatio: [0, 10],
    evEbitda: [0, 100],
    evRevenue: [0, 20],
    
    // Growth Metrics
    revenueGrowth: [-50, 100],
    earningsGrowth: [-100, 200],
    revenueGrowth5Y: [-20, 50],
    earningsGrowth5Y: [-20, 50],
    
    // Profitability & Quality
    roe: [-50, 100],
    roa: [-20, 50],
    roic: [-20, 50],
    grossMargin: [0, 100],
    operatingMargin: [-50, 100],
    netMargin: [-50, 100],
    
    // Financial Health
    debtToEquity: [0, 10],
    currentRatio: [0, 10],
    quickRatio: [0, 10],
    interestCoverage: [-10, 50],
    
    // Dividend & Yield
    dividendYield: [0, 20],
    payoutRatio: [0, 200],
    dividendGrowth: [-50, 100],
    
    // Technical & Price
    price: [0, 5000],
    beta: [0, 5],
    rsi: [0, 100],
    priceChange1D: [-50, 50],
    priceChange1W: [-50, 50],
    priceChange1M: [-50, 100],
    priceChange3M: [-50, 200],
    priceChange6M: [-50, 300],
    priceChange1Y: [-80, 500],
    
    // Volume & Liquidity
    volume: [0, 1000000000],
    avgVolume: [0, 1000000000],
    volumeRatio: [0, 10],
    
    // ESG & Sustainability
    esgScore: [0, 100],
    carbonIntensity: [0, 1000],
    
    // Analyst Coverage
    analystRating: [1, 5],
    priceTarget: [0, 10000],
    analystCount: [0, 50],
    
    // Insider Trading
    insiderBuying: false,
    insiderSelling: false,
    institutionalOwnership: [0, 100],
    
    // Advanced Technical
    macd: [-10, 10],
    movingAverage50: [0, 10000],
    movingAverage200: [0, 10000],
    
    // Quality Metrics
    assetTurnover: [0, 10],
    inventoryTurnover: [0, 50],
    receivablesTurnover: [0, 50],
    
    // Cash Flow Metrics
    operatingCashFlow: [-1000, 1000],
    freeCashFlow: [-1000, 1000],
    cashFlowYield: [-50, 50],
    
    // Efficiency Metrics
    returnOnTangibleAssets: [-50, 100],
    returnOnCapitalEmployed: [-50, 100],
    economicValueAdded: [-1000, 1000],
    
    // Boolean Filters
    positiveEarnings: false,
    paysDividend: false,
    positiveFCF: false,
    profitableLastYear: false,
    growingRevenue: false,
    improvingMargins: false,
    lowDebt: false,
  });

  // Get unique values for dropdowns
  const exchanges = useMemo(() => {
    if (!screeningData) return [];
    const exchanges = new Set(screeningData.map(item => item.exchange));
    return Array.from(exchanges).sort().map(exchange => ({
      value: exchange,
      label: EXCHANGE_DISPLAY[exchange] || exchange
    }));
  }, [screeningData]);

  const sectors = useMemo(() => {
    if (!screeningData) return [];
    const sectors = new Set(screeningData.map(item => item.sector).filter(Boolean));
    return Array.from(sectors).sort().map(sector => ({
      value: sector,
      label: sector
    }));
  }, [screeningData]);

  const countries = useMemo(() => {
    if (!screeningData) return [];
    const countries = new Set(screeningData.map(item => item.country).filter(Boolean));
    return Array.from(countries).sort().map(country => ({
      value: country,
      label: country
    }));
  }, [screeningData]);

  // Filter and search results
  const filteredResults = useMemo(() => {
    if (!screeningData) return [];
    
    return screeningData.filter(item => {
      // Search filter
      if (searchTerm && !item.company.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !item.ticker.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

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

      // Exchange filter
      if (filters.exchange !== "all" && item.exchange !== filters.exchange) {
        return false;
      }

      // Country filter
      if (filters.country !== "all" && item.country !== filters.country) {
        return false;
      }

      // Range filters for all numeric fields
      const rangeFilters = [
        { field: 'peRatio', filter: filters.peRatio },
        { field: 'priceToBook', filter: filters.priceToBook },
        { field: 'priceToSales', filter: filters.priceToSales },
        { field: 'pegRatio', filter: filters.pegRatio },
        { field: 'evToEbitda', filter: filters.evEbitda },
        { field: 'evToRevenue', filter: filters.evRevenue },
        { field: 'revenueGrowth', filter: filters.revenueGrowth },
        { field: 'earningsGrowth', filter: filters.earningsGrowth },
        { field: 'roe', filter: filters.roe },
        { field: 'roa', filter: filters.roa },
        { field: 'roic', filter: filters.roic },
        { field: 'grossMargin', filter: filters.grossMargin },
        { field: 'operatingMargin', filter: filters.operatingMargin },
        { field: 'netMargin', filter: filters.netMargin },
        { field: 'debtToEquity', filter: filters.debtToEquity },
        { field: 'currentRatio', filter: filters.currentRatio },
        { field: 'quickRatio', filter: filters.quickRatio },
        { field: 'interestCoverage', filter: filters.interestCoverage },
        { field: 'dividendYield', filter: filters.dividendYield },
        { field: 'payoutRatio', filter: filters.payoutRatio },
        { field: 'dividendGrowth', filter: filters.dividendGrowth },
        { field: 'price', filter: filters.price },
        { field: 'beta', filter: filters.beta },
        { field: 'rsi', filter: filters.rsi },
        { field: 'priceChange1Y', filter: filters.priceChange1Y },
        { field: 'volume', filter: filters.volume },
        { field: 'avgVolume', filter: filters.avgVolume },
        { field: 'volumeRatio', filter: filters.volumeRatio },
      ];

      for (const { field, filter } of rangeFilters) {
        const value = item[field as keyof ScreeningCompany];
        if (typeof value === 'number' && (value < filter[0] || value > filter[1])) {
          return false;
        }
      }

      // Boolean filters
      if (filters.positiveEarnings && item.peRatio <= 0) return false;
      if (filters.paysDividend && item.dividendYield <= 0) return false;
      if (filters.positiveFCF && item.fcfYield <= 0) return false;
      if (filters.growingRevenue && item.revenueGrowth <= 0) return false;
      if (filters.improvingMargins && item.operatingMargin <= 0) return false;
      if (filters.lowDebt && item.debtToEquity > 0.5) return false;

      return true;
    });
  }, [screeningData, filters, searchTerm]);

  const handleSort = (field: keyof ScreeningCompany) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  const sortedResults = useMemo(() => {
    if (!sortBy) return filteredResults;
    
    return [...filteredResults].sort((a, b) => {
      const fieldA = a[sortBy];
      const fieldB = b[sortBy];
      
      if (typeof fieldA === "number" && typeof fieldB === "number") {
        return sortDirection === "asc" ? fieldA - fieldB : fieldB - fieldA;
      }
      
      const stringA = String(fieldA);
      const stringB = String(fieldB);
      return sortDirection === "asc" 
        ? stringA.localeCompare(stringB) 
        : stringB.localeCompare(stringA);
    });
  }, [filteredResults, sortBy, sortDirection]);

  const paginatedResults = useMemo(() => {
    return sortedResults.slice(
      (currentPage - 1) * resultsPerPage, 
      currentPage * resultsPerPage
    );
  }, [sortedResults, currentPage, resultsPerPage]);
  
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);

  const applyPreset = (preset: string) => {
    switch(preset) {
      case 'value':
        setFilters(prev => ({
          ...prev,
          peRatio: [0, 20],
          priceToBook: [0, 3],
          dividendYield: [1, 20],
          positiveEarnings: true,
          paysDividend: true,
          lowDebt: true
        }));
        break;
      case 'growth':
        setFilters(prev => ({
          ...prev,
          revenueGrowth: [15, 100],
          earningsGrowth: [10, 200],
          positiveEarnings: true,
          growingRevenue: true
        }));
        break;
      case 'dividend':
        setFilters(prev => ({
          ...prev,
          dividendYield: [2, 20],
          payoutRatio: [0, 80],
          paysDividend: true,
          positiveEarnings: true
        }));
        break;
      case 'quality':
        setFilters(prev => ({
          ...prev,
          roe: [15, 100],
          roa: [5, 50],
          grossMargin: [30, 100],
          operatingMargin: [10, 100],
          lowDebt: true,
          positiveEarnings: true
        }));
        break;
      case 'momentum':
        setFilters(prev => ({
          ...prev,
          priceChange1Y: [20, 500],
          priceChange6M: [10, 200],
          beta: [0.8, 2],
          positiveEarnings: true
        }));
        break;
      case 'esg':
        setFilters(prev => ({
          ...prev,
          esgScore: [70, 100],
          positiveEarnings: true,
          lowDebt: true
        }));
        break;
    }
  };

  const resetFilters = () => {
    setFilters({
      marketCap: "all",
      sector: "all",
      exchange: "all",
      country: "all",
      peRatio: [0, 100],
      priceToBook: [0, 20],
      priceToSales: [0, 50],
      pegRatio: [0, 10],
      evEbitda: [0, 100],
      evRevenue: [0, 20],
      revenueGrowth: [-50, 100],
      earningsGrowth: [-100, 200],
      revenueGrowth5Y: [-20, 50],
      earningsGrowth5Y: [-20, 50],
      roe: [-50, 100],
      roa: [-20, 50],
      roic: [-20, 50],
      grossMargin: [0, 100],
      operatingMargin: [-50, 100],
      netMargin: [-50, 100],
      debtToEquity: [0, 10],
      currentRatio: [0, 10],
      quickRatio: [0, 10],
      interestCoverage: [-10, 50],
      dividendYield: [0, 20],
      payoutRatio: [0, 200],
      dividendGrowth: [-50, 100],
      price: [0, 5000],
      beta: [0, 5],
      rsi: [0, 100],
      priceChange1D: [-50, 50],
      priceChange1W: [-50, 50],
      priceChange1M: [-50, 100],
      priceChange3M: [-50, 200],
      priceChange6M: [-50, 300],
      priceChange1Y: [-80, 500],
      volume: [0, 1000000000],
      avgVolume: [0, 1000000000],
      volumeRatio: [0, 10],
      esgScore: [0, 100],
      carbonIntensity: [0, 1000],
      analystRating: [1, 5],
      priceTarget: [0, 10000],
      analystCount: [0, 50],
      insiderBuying: false,
      insiderSelling: false,
      institutionalOwnership: [0, 100],
      macd: [-10, 10],
      movingAverage50: [0, 10000],
      movingAverage200: [0, 10000],
      assetTurnover: [0, 10],
      inventoryTurnover: [0, 50],
      receivablesTurnover: [0, 50],
      operatingCashFlow: [-1000, 1000],
      freeCashFlow: [-1000, 1000],
      cashFlowYield: [-50, 50],
      returnOnTangibleAssets: [-50, 100],
      returnOnCapitalEmployed: [-50, 100],
      economicValueAdded: [-1000, 1000],
      positiveEarnings: false,
      paysDividend: false,
      positiveFCF: false,
      profitableLastYear: false,
      growingRevenue: false,
      improvingMargins: false,
      lowDebt: false,
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const exportToCsv = () => {
    if (!filteredResults.length) return;
    
    const headers = [
      'Ticker', 'Company', 'Sector', 'Exchange', 'Country', 'Market Cap (B)', 'Price',
      'P/E Ratio', 'P/B Ratio', 'P/S Ratio', 'PEG Ratio', 'EV/EBITDA', 'EV/Revenue',
      'Revenue Growth (%)', 'Earnings Growth (%)', 'ROE (%)', 'ROA (%)', 'ROIC (%)',
      'Gross Margin (%)', 'Operating Margin (%)', 'Net Margin (%)',
      'Debt/Equity', 'Current Ratio', 'Quick Ratio', 'Interest Coverage',
      'Dividend Yield (%)', 'Payout Ratio (%)', 'Beta', '1Y Price Change (%)'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredResults.map(item => [
        item.ticker,
        `"${item.company}"`,
        item.sector,
        item.exchange,
        item.country,
        (item.marketCap / 1000).toFixed(2),
        item.price.toFixed(2),
        item.peRatio.toFixed(2),
        item.priceToBook.toFixed(2),
        item.priceToSales.toFixed(2),
        item.pegRatio.toFixed(2),
        item.evToEbitda.toFixed(2),
        item.evToRevenue.toFixed(2),
        item.revenueGrowth.toFixed(2),
        item.earningsGrowth.toFixed(2),
        item.roe.toFixed(2),
        item.roa.toFixed(2),
        item.roic.toFixed(2),
        item.grossMargin.toFixed(2),
        item.operatingMargin.toFixed(2),
        item.netMargin.toFixed(2),
        item.debtToEquity.toFixed(2),
        item.currentRatio.toFixed(2),
        item.quickRatio.toFixed(2),
        item.interestCoverage.toFixed(2),
        item.dividendYield.toFixed(2),
        item.payoutRatio.toFixed(2),
        item.beta.toFixed(2),
        item.priceChange1Y.toFixed(2)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-screener-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderSortIcon = (field: keyof ScreeningCompany) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    return sortDirection === "asc" 
      ? <ArrowUpDown className="h-4 w-4 text-green-600" />
      : <ArrowUpDown className="h-4 w-4 text-red-600" />;
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
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          value={value[0]}
          onChange={(e) => onChange([Number(e.target.value), value[1]])}
          className="h-8 text-xs"
          placeholder={min.toString()}
        />
        <span className="text-xs text-muted-foreground">to</span>
        <Input
          type="number"
          value={value[1]}
          onChange={(e) => onChange([value[0], Number(e.target.value)])}
          className="h-8 text-xs"
          placeholder={max.toString()}
        />
      </div>
      <Slider
        value={value}
        onValueChange={onChange}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{prefix}{min}{suffix}</span>
        <span>{prefix}{max}{suffix}</span>
      </div>
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
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {label}s</SelectItem>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading screening data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading screening data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Stock Screener</h2>
          <p className="text-muted-foreground">
            {filteredResults.length.toLocaleString()} stocks found
            {universeData && ` from ${universeData.totalCount.toLocaleString()} total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showAdvancedFilters ? 'Basic Filters' : 'Advanced Filters'}
          </Button>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button size="sm" onClick={exportToCsv} disabled={!filteredResults.length}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Input
          placeholder="Search by company name or ticker..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Preset Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => applyPreset('value')}
          className="text-xs"
        >
          <DollarSign className="h-3 w-3 mr-1" />
          Value
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => applyPreset('growth')}
          className="text-xs"
        >
          <TrendingUp className="h-3 w-3 mr-1" />
          Growth
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => applyPreset('dividend')}
          className="text-xs"
        >
          <Star className="h-3 w-3 mr-1" />
          Dividend
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => applyPreset('quality')}
          className="text-xs"
        >
          <Shield className="h-3 w-3 mr-1" />
          Quality
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => applyPreset('momentum')}
          className="text-xs"
        >
          <TrendingDown className="h-3 w-3 mr-1" />
          Momentum
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => applyPreset('esg')}
          className="text-xs"
        >
          <Globe className="h-3 w-3 mr-1" />
          ESG
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeFilterTab} onValueChange={setActiveFilterTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <SelectFilter
                    label="Market Cap"
                    value={filters.marketCap}
                    onChange={(value) => setFilters(prev => ({ ...prev, marketCap: value }))}
                    options={[
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
                    onChange={(value) => setFilters(prev => ({ ...prev, sector: value }))}
                    options={sectors}
                  />
                  
                  <SelectFilter
                    label="Exchange"
                    value={filters.exchange}
                    onChange={(value) => setFilters(prev => ({ ...prev, exchange: value }))}
                    options={exchanges}
                  />
                  
                  <SelectFilter
                    label="Country"
                    value={filters.country}
                    onChange={(value) => setFilters(prev => ({ ...prev, country: value }))}
                    options={countries}
                  />
                  
                  <RangeFilter
                    label="P/E Ratio"
                    value={filters.peRatio}
                    onChange={(value) => setFilters(prev => ({ ...prev, peRatio: value }))}
                    min={0}
                    max={100}
                    step={1}
                  />
                  
                  <RangeFilter
                    label="Dividend Yield (%)"
                    value={filters.dividendYield}
                    onChange={(value) => setFilters(prev => ({ ...prev, dividendYield: value }))}
                    min={0}
                    max={20}
                    step={0.5}
                    suffix="%"
                  />
                  
                  <RangeFilter
                    label="Revenue Growth (%)"
                    value={filters.revenueGrowth}
                    onChange={(value) => setFilters(prev => ({ ...prev, revenueGrowth: value }))}
                    min={-50}
                    max={100}
                    step={5}
                    suffix="%"
                  />
                  
                  <div className="space-y-3">
                    <Label className="text-xs font-medium">Quick Filters</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="positiveEarnings"
                          checked={filters.positiveEarnings}
                          onCheckedChange={(checked) => 
                            setFilters(prev => ({ ...prev, positiveEarnings: checked as boolean }))
                          }
                        />
                        <Label htmlFor="positiveEarnings" className="text-xs">Positive Earnings</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="paysDividend"
                          checked={filters.paysDividend}
                          onCheckedChange={(checked) => 
                            setFilters(prev => ({ ...prev, paysDividend: checked as boolean }))
                          }
                        />
                        <Label htmlFor="paysDividend" className="text-xs">Pays Dividend</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="growingRevenue"
                          checked={filters.growingRevenue}
                          onCheckedChange={(checked) => 
                            setFilters(prev => ({ ...prev, growingRevenue: checked as boolean }))
                          }
                        />
                        <Label htmlFor="growingRevenue" className="text-xs">Growing Revenue</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="lowDebt"
                          checked={filters.lowDebt}
                          onCheckedChange={(checked) => 
                            setFilters(prev => ({ ...prev, lowDebt: checked as boolean }))
                          }
                        />
                        <Label htmlFor="lowDebt" className="text-xs">Low Debt</Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4">
                  <RangeFilter
                    label="P/B Ratio"
                    value={filters.priceToBook}
                    onChange={(value) => setFilters(prev => ({ ...prev, priceToBook: value }))}
                    min={0}
                    max={20}
                    step={0.5}
                  />
                  
                  <RangeFilter
                    label="P/S Ratio"
                    value={filters.priceToSales}
                    onChange={(value) => setFilters(prev => ({ ...prev, priceToSales: value }))}
                    min={0}
                    max={50}
                    step={1}
                  />
                  
                  <RangeFilter
                    label="EV/EBITDA"
                    value={filters.evEbitda}
                    onChange={(value) => setFilters(prev => ({ ...prev, evEbitda: value }))}
                    min={0}
                    max={100}
                    step={2}
                  />
                  
                  <RangeFilter
                    label="ROE (%)"
                    value={filters.roe}
                    onChange={(value) => setFilters(prev => ({ ...prev, roe: value }))}
                    min={-50}
                    max={100}
                    step={5}
                    suffix="%"
                  />
                  
                  <RangeFilter
                    label="ROA (%)"
                    value={filters.roa}
                    onChange={(value) => setFilters(prev => ({ ...prev, roa: value }))}
                    min={-20}
                    max={50}
                    step={2}
                    suffix="%"
                  />
                  
                  <RangeFilter
                    label="Gross Margin (%)"
                    value={filters.grossMargin}
                    onChange={(value) => setFilters(prev => ({ ...prev, grossMargin: value }))}
                    min={0}
                    max={100}
                    step={5}
                    suffix="%"
                  />
                  
                  <RangeFilter
                    label="Debt/Equity"
                    value={filters.debtToEquity}
                    onChange={(value) => setFilters(prev => ({ ...prev, debtToEquity: value }))}
                    min={0}
                    max={10}
                    step={0.2}
                  />
                  
                  <RangeFilter
                    label="Beta"
                    value={filters.beta}
                    onChange={(value) => setFilters(prev => ({ ...prev, beta: value }))}
                    min={0}
                    max={5}
                    step={0.1}
                  />
                  
                  <RangeFilter
                    label="1Y Price Change (%)"
                    value={filters.priceChange1Y}
                    onChange={(value) => setFilters(prev => ({ ...prev, priceChange1Y: value }))}
                    min={-80}
                    max={500}
                    step={10}
                    suffix="%"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Results ({filteredResults.length.toLocaleString()})</CardTitle>
                <div className="flex items-center gap-2">
                  <Select
                    value={resultsPerPage.toString()}
                    onValueChange={(value) => setCurrentPage(1)}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {paginatedResults.map((item, index) => (
                    <div
                      key={item.ticker}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-sm">{item.ticker}</div>
                          <Badge variant="secondary" className="text-xs">
                            {item.exchange}
                          </Badge>
                          {item.dividendYield > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {item.dividendYield.toFixed(2)}% Yield
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {item.company}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.sector} • ${(item.marketCap / 1000).toFixed(1)}B Market Cap
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-right">
                          <div className="font-medium">${item.price.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.priceChange1Y > 0 ? '+' : ''}{item.priceChange1Y.toFixed(1)}%
                          </div>
                        </div>
                        
                        <div className="text-right min-w-[60px]">
                          <div className="font-medium">{item.peRatio.toFixed(1)}</div>
                          <div className="text-xs text-muted-foreground">P/E</div>
                        </div>
                        
                        <div className="text-right min-w-[60px]">
                          <div className="font-medium">{item.roe.toFixed(1)}%</div>
                          <div className="text-xs text-muted-foreground">ROE</div>
                        </div>
                        
                        <div className="text-right min-w-[60px]">
                          <div className="font-medium">{item.revenueGrowth.toFixed(1)}%</div>
                          <div className="text-xs text-muted-foreground">Growth</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * resultsPerPage) + 1} to {Math.min(currentPage * resultsPerPage, filteredResults.length)} of {filteredResults.length} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
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
      </div>
    </div>
  );
}
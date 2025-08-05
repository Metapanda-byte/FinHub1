"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, ArrowUpDown, Filter, RotateCcw, TrendingUp, DollarSign, Activity, Shield, BarChart3, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScreeningData, useStockUniverse, ScreeningCompany, ScreeningFilters } from "@/lib/api/screening";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

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

export function ScreeningToolEnhanced() {
  const [activeFilterTab, setActiveFilterTab] = useState("basic");
  const [sortBy, setSortBy] = useState<keyof ScreeningCompany | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(25);
  
  // Use real data from API
  const { data: screeningData, isLoading, error } = useScreeningData();
  const { data: universeData } = useStockUniverse();

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
    
    // Boolean Filters
    positiveEarnings: false,
    paysDividend: false,
    positiveFCF: false,
    profitableLastYear: false,
    growingRevenue: false,
    improvingMargins: false,
    lowDebt: false,
  });

  // Get unique exchanges from data
  const availableExchanges = useMemo(() => {
    if (!screeningData) return [];
    const exchanges = new Set(screeningData.map(item => item.exchange));
    return Array.from(exchanges).sort();
  }, [screeningData]);

  // Get unique sectors from data
  const availableSectors = useMemo(() => {
    if (!screeningData) return [];
    const sectors = new Set(screeningData.map(item => item.sector).filter(Boolean));
    return Array.from(sectors).sort();
  }, [screeningData]);

  // Get unique countries from data
  const availableCountries = useMemo(() => {
    if (!screeningData) return [];
    const countries = new Set(screeningData.map(item => item.country).filter(Boolean));
    return Array.from(countries).sort();
  }, [screeningData]);

  const filteredResults = useMemo(() => {
    if (!screeningData) return [];
    
    return screeningData.filter(item => {
      // Market cap filter
      if (filters.marketCap !== "all") {
        const ranges: Record<string, [number, number]> = {
          "mega-cap": [200000, Infinity],
          "large-cap": [10000, 200000],
          "mid-cap": [2000, 10000],
          "small-cap": [300, 2000],
          "micro-cap": [0, 300]
        };
        const range = ranges[filters.marketCap];
        if (range && !(item.marketCap >= range[0] && item.marketCap <= range[1])) {
          return false;
        }
      }

      // Basic filters
      if (filters.sector !== "all" && item.sector !== filters.sector) return false;
      if (filters.exchange !== "all" && item.exchange !== filters.exchange) return false;
      if (filters.country !== "all" && item.country !== filters.country) return false;

      // Range filters
      if (item.peRatio < filters.peRatio[0] || item.peRatio > filters.peRatio[1]) return false;
      if (item.priceToBook < filters.priceToBook[0] || item.priceToBook > filters.priceToBook[1]) return false;
      if (item.dividendYield < filters.dividendYield[0] || item.dividendYield > filters.dividendYield[1]) return false;
      if (item.revenueGrowth < filters.revenueGrowth[0] || item.revenueGrowth > filters.revenueGrowth[1]) return false;
      if (item.roe < filters.roe[0] || item.roe > filters.roe[1]) return false;
      if (item.debtToEquity < filters.debtToEquity[0] || item.debtToEquity > filters.debtToEquity[1]) return false;
      if (item.price < filters.price[0] || item.price > filters.price[1]) return false;
      if (item.priceChange1Y < filters.priceChange1Y[0] || item.priceChange1Y > filters.priceChange1Y[1]) return false;

      // Boolean filters
      if (filters.positiveEarnings && item.peRatio <= 0) return false;
      if (filters.paysDividend && item.dividendYield <= 0) return false;
      if (filters.positiveFCF && item.fcfYield <= 0) return false;
      if (filters.profitableLastYear && item.netMargin <= 0) return false;
      if (filters.growingRevenue && item.revenueGrowth <= 0) return false;
      if (filters.lowDebt && item.debtToEquity > 1) return false;

      return true;
    });
  }, [screeningData, filters]);

  const handleSort = useCallback((field: keyof ScreeningCompany) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  }, [sortBy, sortDirection]);

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
          dividendYield: [1, 20],
          positiveEarnings: true,
          paysDividend: true
        }));
        break;
      case 'growth':
        setFilters(prev => ({
          ...prev,
          revenueGrowth: [15, 100],
          earningsGrowth: [15, 200],
          positiveEarnings: true,
          growingRevenue: true
        }));
        break;
      case 'quality':
        setFilters(prev => ({
          ...prev,
          roe: [15, 100],
          roic: [10, 100],
          debtToEquity: [0, 1],
          currentRatio: [1, 10],
          positiveEarnings: true,
          lowDebt: true
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
    }
  };

  const exportToCsv = () => {
    const headers = ["Ticker", "Company", "Exchange", "Country", "Sector", "Market Cap (M)", "Price", "P/E", "P/B", "Div Yield %", "Rev Growth %", "ROE %", "Debt/Equity", "1Y Return %"];
    const csvData = [headers.join(",")];
    
    sortedResults.forEach(row => {
      csvData.push([
        row.ticker,
        `"${row.company}"`,
        row.exchange,
        row.country,
        row.sector,
        row.marketCap.toFixed(2),
        row.price.toFixed(2),
        row.peRatio.toFixed(2),
        row.priceToBook.toFixed(2),
        row.dividendYield.toFixed(2),
        row.revenueGrowth.toFixed(2),
        row.roe.toFixed(2),
        row.debtToEquity.toFixed(2),
        row.priceChange1Y.toFixed(2)
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

  const renderSortIcon = (field: keyof ScreeningCompany) => {
    if (sortBy !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />;
    return sortDirection === "asc" 
      ? <ArrowUpDown className="h-3 w-3 ml-1" /> 
      : <ArrowUpDown className="h-3 w-3 ml-1 rotate-180" />;
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading screening data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stock Screener</h1>
          <p className="text-muted-foreground">
            Screen {universeData?.totalCount?.toLocaleString() || '80,000+'} global stocks across all major exchanges
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCsv} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => applyPreset('value')} variant="outline" size="sm">
            <DollarSign className="h-4 w-4 mr-2" />
            Value Stocks
          </Button>
          <Button onClick={() => applyPreset('growth')} variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Growth Stocks
          </Button>
          <Button onClick={() => applyPreset('quality')} variant="outline" size="sm">
            <Shield className="h-4 w-4 mr-2" />
            Quality Stocks
          </Button>
          <Button onClick={() => applyPreset('dividend')} variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dividend Stocks
          </Button>
          <Button onClick={() => window.location.reload()} variant="ghost" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
        </div>

        {/* Filters */}
        <Tabs value={activeFilterTab} onValueChange={setActiveFilterTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="valuation">Valuation</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Market Cap</Label>
                <Select value={filters.marketCap} onValueChange={(value) => setFilters(prev => ({ ...prev, marketCap: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Caps</SelectItem>
                    <SelectItem value="mega-cap">Mega Cap (&gt;$200B)</SelectItem>
                    <SelectItem value="large-cap">Large Cap ($10B-$200B)</SelectItem>
                    <SelectItem value="mid-cap">Mid Cap ($2B-$10B)</SelectItem>
                    <SelectItem value="small-cap">Small Cap ($300M-$2B)</SelectItem>
                    <SelectItem value="micro-cap">Micro Cap (&lt;$300M)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Exchange</Label>
                <Select value={filters.exchange} onValueChange={(value) => setFilters(prev => ({ ...prev, exchange: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exchanges</SelectItem>
                    {availableExchanges.map(exchange => (
                      <SelectItem key={exchange} value={exchange}>
                        {EXCHANGE_DISPLAY[exchange] || exchange}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Country</Label>
                <Select value={filters.country} onValueChange={(value) => setFilters(prev => ({ ...prev, country: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {availableCountries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Sector</Label>
                <Select value={filters.sector} onValueChange={(value) => setFilters(prev => ({ ...prev, sector: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sectors</SelectItem>
                    {availableSectors.map(sector => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Additional filter tabs would go here */}
        </Tabs>

        {/* Results Summary */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground">
            Found <span className="font-semibold text-foreground">{filteredResults.length.toLocaleString()}</span> stocks
            {universeData && (
              <span> out of {universeData.totalCount.toLocaleString()} total</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {universeData?.exchangeStats && (
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  {Object.keys(universeData.exchangeStats).length} Exchanges
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Results Table */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          <ScrollArea className="h-[400px] rounded-md border">
            <table className="w-full">
              <thead className="border-b bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left p-2 cursor-pointer hover:bg-muted" onClick={() => handleSort('ticker')}>
                    <div className="flex items-center">
                      Ticker {renderSortIcon('ticker')}
                    </div>
                  </th>
                  <th className="text-left p-2 cursor-pointer hover:bg-muted" onClick={() => handleSort('company')}>
                    <div className="flex items-center">
                      Company {renderSortIcon('company')}
                    </div>
                  </th>
                  <th className="text-left p-2 cursor-pointer hover:bg-muted" onClick={() => handleSort('exchange')}>
                    <div className="flex items-center">
                      Exchange {renderSortIcon('exchange')}
                    </div>
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:bg-muted" onClick={() => handleSort('marketCap')}>
                    <div className="flex items-center justify-end">
                      Market Cap {renderSortIcon('marketCap')}
                    </div>
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:bg-muted" onClick={() => handleSort('price')}>
                    <div className="flex items-center justify-end">
                      Price {renderSortIcon('price')}
                    </div>
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:bg-muted" onClick={() => handleSort('peRatio')}>
                    <div className="flex items-center justify-end">
                      P/E {renderSortIcon('peRatio')}
                    </div>
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:bg-muted" onClick={() => handleSort('dividendYield')}>
                    <div className="flex items-center justify-end">
                      Div % {renderSortIcon('dividendYield')}
                    </div>
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:bg-muted" onClick={() => handleSort('priceChange1Y')}>
                    <div className="flex items-center justify-end">
                      1Y % {renderSortIcon('priceChange1Y')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedResults.map((item) => (
                  <tr key={item.ticker} className="border-b hover:bg-muted/50 cursor-pointer">
                    <td className="p-2 font-medium">{item.ticker}</td>
                    <td className="p-2">
                      <div className="max-w-[200px] truncate" title={item.company}>
                        {item.company}
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline" className="text-xs">
                        {item.exchange}
                      </Badge>
                    </td>
                    <td className="p-2 text-right">${(item.marketCap / 1000).toFixed(1)}B</td>
                    <td className="p-2 text-right">${item.price.toFixed(2)}</td>
                    <td className="p-2 text-right">{item.peRatio.toFixed(1)}</td>
                    <td className="p-2 text-right">{item.dividendYield.toFixed(2)}%</td>
                    <td className={cn(
                      "p-2 text-right font-medium",
                      item.priceChange1Y > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {item.priceChange1Y > 0 && "+"}{item.priceChange1Y.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * resultsPerPage) + 1} to {Math.min(currentPage * resultsPerPage, filteredResults.length)} of {filteredResults.length}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : currentPage + i - 2;
                  if (pageNum > totalPages) return null;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
}
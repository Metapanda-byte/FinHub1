"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CrunchingNumbersCardWithHeader } from "@/components/ui/crunching-numbers-loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Info, X, Plus, Search, Loader2 } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSearchStore } from "@/lib/store/search-store";
import useSWR from "swr";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// @ts-ignore
import debounce from "lodash/debounce";
import { useSWRConfig } from "swr";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface PeerCompany {
  id: string;
  name: string;
  symbol: string;
}

interface ValuationData {
  ticker: string;
  company: string;
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
  revenueGrowth: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  roic: number;
  roe: number;
}

interface CompetitorData {
  peerCompanies: PeerCompany[];
  peerValuationData: ValuationData[];
  peerPerformanceData: PerformanceData[];
}

interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

const fetcher = async (url: string) => {
  console.log("Fetching peer data from:", url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Response ${response.status}:`, errorText);
      
      if (response.status === 404) {
        throw new Error(`No peer data available (404)`);
      } else if (response.status >= 500) {
        throw new Error(`Server error (${response.status})`);
      } else {
        throw new Error(`Failed to fetch competitors: ${response.status}`);
      }
    }
    const data = await response.json();
    console.log("Peer comparison API response:", data);
    
    // Validate the response structure
    if (!data || (!data.peerCompanies && !data.peerValuationData)) {
              throw new Error("Invalid response structure from peer comparison API");
    }
    
    return data;
  } catch (fetchError) {
    console.error("Network or parsing error:", fetchError);
    if (fetchError instanceof Error) {
      throw fetchError;
    }
    throw new Error("Network error while fetching peer data");
  }
};

// Cache search results
const searchStocks = async (query: string): Promise<StockSearchResult[]> => {
  if (!query || query.length < 2) return [];
  const cacheKey = `search-${query}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  const response = await fetch(`/api/stock/search?query=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Failed to search stocks');
  const results = await response.json();
  sessionStorage.setItem(cacheKey, JSON.stringify(results));
  return results;
};

// Add these utility functions at the top of the file
const calculateMedian = (numbers: number[]): number => {
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
};

const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
};

// Update the market cap formatter to include commas
const formatMarketCap = (value: number): string => {
  const billions = value / 1_000_000_000;
  return `$${billions.toLocaleString('en-US', { 
    minimumFractionDigits: 1,
    maximumFractionDigits: 1 
  })}B`;
};

export function CompetitorAnalysis() {
  const currentSymbol = useSearchStore((state) => state.currentSymbol);
  const [selectedPeers, setSelectedPeers] = useState<string[]>([]);
  const [manualTicker, setManualTicker] = useState("");
  const [manualTickers, setManualTickers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { mutate } = useSWRConfig();
  const [valuationMode, setValuationMode] = useState<'ttm' | 'forward'>('ttm');
  const [forwardEstimates, setForwardEstimates] = useState<Record<string, any>>({});
  const [loadingForward, setLoadingForward] = useState(false);

  // Cache the API URL
  const apiUrl = useMemo(() => {
    const url = currentSymbol ? 
      `/api/competitors?symbol=${currentSymbol}${manualTickers.length > 0 ? `&additionalTickers=${manualTickers.join(",")}` : ""}` 
      : null;
    console.log("Peer Comparison API URL:", url, "Symbol:", currentSymbol);
    return url;
  }, [currentSymbol, manualTickers]);

  const { data, error: swrError, isLoading, mutate: revalidate } = useSWR<CompetitorData>(
    apiUrl,
    fetcher,
    {
      onSuccess: (data) => {
        console.log("SWR Success - data received:", data);
        if (data?.peerCompanies) {
          // Always select the first 5 peers when data is loaded
          const firstFivePeers = data.peerCompanies.slice(0, 5).map(company => company.id);
          setSelectedPeers(firstFivePeers);
        }
        setError(null); // Clear any previous errors
      },
      onError: (err) => {
        console.error("SWR Error fetching peer data:", err);
        setError(err.message);
      },
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 2, // Reduced retry count
      errorRetryInterval: 1000, // 1 second between retries
      shouldRetryOnError: (err) => {
        // Only retry on network errors, not on 404s
        return !err.message.includes('404') && !err.message.includes('No peer data');
      },
      dedupingInterval: 10000, // Increased deduping interval
      refreshInterval: 0, // Disable automatic refresh
    }
  );

  // Filter out duplicates from search results
  const filteredSearchResults = useMemo(() => {
    const existingTickers = new Set([
      ...(data?.peerCompanies?.map(company => company.id) || []),
      ...manualTickers,
      currentSymbol
    ]);
    return searchResults.filter(result => !existingTickers.has(result.symbol));
  }, [searchResults, data?.peerCompanies, manualTickers, currentSymbol]);

  // Optimize debounce time
  const debouncedSearch = useRef(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        setIsSearching(true);
        const results = await searchStocks(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 150) // Reduced from 300ms to 150ms
  ).current;

  useEffect(() => {
    setSelectedPeers([]);
    setManualTickers([]);
    setManualTicker("");
    setError(null);
  }, [currentSymbol]);

  useEffect(() => {
    debouncedSearch(manualTicker);
    return () => {
      debouncedSearch.cancel();
    };
  }, [manualTicker, debouncedSearch]);

  // Create optimistic data updater
  const updateDataOptimistically = useCallback((newTicker: string) => {
    if (!data) return;

    // Create optimistic data update
    const optimisticData: CompetitorData = {
      ...data,
      peerCompanies: [
        ...data.peerCompanies,
        { id: newTicker, name: newTicker, symbol: newTicker }
      ],
      peerValuationData: [
        ...data.peerValuationData,
        {
          ticker: newTicker,
          company: newTicker,
          marketCap: 0,
          evToEbitda: 0,
          peRatio: 0,
          priceToSales: 0,
          priceToBook: 0,
          dividendYield: 0
        }
      ],
      peerPerformanceData: [
        ...data.peerPerformanceData,
        {
          ticker: newTicker,
          company: newTicker,
          revenueGrowth: 0,
          grossMargin: 0,
          operatingMargin: 0,
          netMargin: 0,
          roic: 0,
          roe: 0
        }
      ]
    };

    return optimisticData;
  }, [data]);

  const handleAddManualTicker = useCallback(async (symbol: string) => {
    if (!symbol) return;
    
    const ticker = symbol.toUpperCase().trim();
    
    // Check if ticker already exists in any list
    const existingTickers = new Set([
      ...(data?.peerCompanies?.map(company => company.id) || []),
      ...manualTickers,
      currentSymbol
    ]);

    if (existingTickers.has(ticker)) {
      setError("This ticker is already in the comparison");
      return;
    }
    
    // Optimistically update the UI
    const newManualTickers = [...manualTickers, ticker];
    setManualTickers(newManualTickers);
    setSelectedPeers(prevSelected => {
      const uniqueSelected = new Set([...prevSelected, ticker]);
      return Array.from(uniqueSelected);
    });
    
    // Optimistically update the cache
    if (apiUrl) {
      await mutate(
        apiUrl,
        updateDataOptimistically(ticker),
        {
          optimisticData: updateDataOptimistically(ticker),
          rollbackOnError: true,
          populateCache: true,
          revalidate: true
        }
      );
    }
    
    setManualTicker("");
    setSearchResults([]);
    setIsSearchOpen(false);
    setError(null);
  }, [data?.peerCompanies, manualTickers, currentSymbol, apiUrl, mutate, updateDataOptimistically]);

  const handleRemoveManualTicker = async (ticker: string) => {
    const newManualTickers = manualTickers.filter(t => t !== ticker);
    setManualTickers(newManualTickers);
    setSelectedPeers(selectedPeers.filter(p => p !== ticker));
    
    // Optimistically update the cache
    if (apiUrl && data) {
      const optimisticData: CompetitorData = {
        ...data,
        peerCompanies: data.peerCompanies.filter(company => company.id !== ticker),
        peerValuationData: data.peerValuationData.filter(company => company.ticker !== ticker),
        peerPerformanceData: data.peerPerformanceData.filter(company => company.ticker !== ticker)
      };
      
      await mutate(
        apiUrl,
        optimisticData,
        {
          optimisticData,
          rollbackOnError: true,
          populateCache: true,
          revalidate: true
        }
      );
    }
  };

  const togglePeer = (peerId: string) => {
    if (selectedPeers.includes(peerId)) {
      // Only remove if we have more than one peer selected
      if (selectedPeers.length > 1) {
        setSelectedPeers(prevSelected => prevSelected.filter(id => id !== peerId));
      }
    } else {
      setSelectedPeers(prevSelected => {
        const uniqueSelected = new Set([...prevSelected, peerId]);
        return Array.from(uniqueSelected);
      });
    }
  };

  const renderMetricTooltip = (title: string, description: string) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 inline-block ml-1 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-medium">{title}</p>
            <p className="text-sm">{description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Memoize filtered data
  const filteredValuationData = useMemo(() => 
    data?.peerValuationData.filter(company => selectedPeers.includes(company.ticker)) || [],
    [data?.peerValuationData, selectedPeers]
  );

  const filteredPerformanceData = useMemo(() => 
    data?.peerPerformanceData.filter(company => selectedPeers.includes(company.ticker)) || [],
    [data?.peerPerformanceData, selectedPeers]
  );

  // Memoize search results component
  const SearchResultsList = useMemo(() => {
    if (isSearching) {
      return (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      );
    }

    if (filteredSearchResults.length === 0) {
      return <CommandEmpty>No stocks found.</CommandEmpty>;
    }

    return (
      <CommandGroup>
        {filteredSearchResults.map((stock) => (
          <CommandItem
            key={stock.symbol}
            value={stock.symbol}
            onSelect={() => handleAddManualTicker(stock.symbol)}
          >
            <span className="font-medium">{stock.symbol}</span>
            <span className="ml-2 text-muted-foreground">
              {stock.name} ({stock.exchange})
            </span>
          </CommandItem>
        ))}
      </CommandGroup>
    );
  }, [filteredSearchResults, isSearching, handleAddManualTicker]);

  // Inside the CompetitorAnalysis component, add these helper functions:
  const calculateMetrics = (data: ValuationData[] | PerformanceData[]) => {
    const metrics: Record<string, number[]> = {};
    
    // Initialize metrics object based on first item's keys
    if (data.length > 0) {
      const firstItem = data[0] as any;
      Object.keys(firstItem).forEach(key => {
        if (typeof firstItem[key] === 'number') {
          metrics[key] = [];
        }
      });
    }

    // Collect all numeric values
    data.forEach(item => {
      Object.entries(item as any).forEach(([key, value]) => {
        if (typeof value === 'number') {
          metrics[key].push(value);
        }
      });
    });

    // Calculate median and average for each metric
    const results = {
      median: {} as Record<string, number>,
      average: {} as Record<string, number>
    };

    Object.entries(metrics).forEach(([key, values]) => {
      results.median[key] = calculateMedian(values);
      results.average[key] = calculateAverage(values);
    });

    return results;
  };

  // Fetch forward estimates for all peers when mode is 'forward'
  useEffect(() => {
    if (valuationMode !== 'forward' || !data) return;
    const fetchEstimates = async () => {
      setLoadingForward(true);
      const results: Record<string, any> = {};
      await Promise.all(
        data.peerValuationData.map(async (peer) => {
          try {
            const res = await fetch(`/api/analyst-estimates?symbol=${peer.ticker}`);
            if (res.ok) {
              const est = await res.json();
              // Find next year's estimate (e.g., for 2025 if now is 2024)
              const nextYear = new Date().getFullYear() + 1;
              const next = est.estimates?.find((e: any) => e.year === nextYear);
              if (next) results[peer.ticker] = next;
            }
          } catch {}
        })
      );
      setForwardEstimates(results);
      setLoadingForward(false);
    };
    fetchEstimates();
  }, [valuationMode, data]);

  // Helper to get the correct value for each metric, with formatting
  const getValuationMetric = (peer: ValuationData, metric: keyof ValuationData) => {
    if (valuationMode === 'ttm') {
      if (metric === 'marketCap') return formatMarketCap(peer.marketCap);
      if (metric === 'dividendYield') return formatPercentage(peer.dividendYield);
      if (typeof peer[metric] === 'number') return peer[metric].toFixed(1) + (['evToEbitda','peRatio','priceToSales','priceToBook'].includes(metric) ? 'x' : '');
      return peer[metric];
    }
    if (valuationMode === 'forward') {
      const est = forwardEstimates[peer.ticker];
      if (!est) return 'N/A';
      if (metric === 'peRatio' && est.eps) {
        return peer.marketCap && est.eps ? (peer.marketCap / (est.eps * 1_000_000_000)).toFixed(1) + 'x' : 'N/A';
      }
      if (metric === 'marketCap') return formatMarketCap(peer.marketCap);
      if (metric === 'dividendYield' && est.dividendYield !== undefined) return formatPercentage(est.dividendYield);
      if (typeof est[metric] === 'number') return est[metric].toFixed(1) + (['evToEbitda','peRatio','priceToSales','priceToBook'].includes(metric) ? 'x' : '');
      return est[metric] !== undefined ? est[metric] : 'N/A';
    }
    return peer[metric];
  };

  // Early return if no symbol is selected
  if (!currentSymbol) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Select a Company</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please search for and select a company symbol to view competitor analysis.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <CrunchingNumbersCardWithHeader 
        title="Peer Comparison"
        message="Crunching the numbers"
      />
    );
  }

  if (swrError) {
    const errorMessage = swrError.message.includes('404') 
      ? "No peer data found for this symbol"
      : swrError.message.includes('Failed to fetch')
      ? "Unable to connect to data source"
      : "An unexpected error occurred";
      
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Unable to Load Peer Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-600 dark:text-amber-400 mb-3">
              {errorMessage}
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• This may be due to limited data availability for this symbol</p>
              <p>• Try selecting a different company symbol</p>
              <p>• Check your internet connection and try again</p>
            </div>
            <Button 
              onClick={() => {
                setError(null);
                revalidate();
              }} 
              variant="outline" 
              size="sm" 
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>No Peer Data Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No peer comparison data is available for {currentSymbol} at this time.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Shared Ticker Selection Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold">Peer Selection & Controls</CardTitle>
              <CardDescription>Select and manage companies for comparison across all tabs</CardDescription>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <div className="flex justify-end w-full">
                <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isSearchOpen}
                      className="w-full md:w-[200px] justify-between"
                    >
                      {manualTicker ? manualTicker : "Search ticker..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full md:w-[200px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search ticker..."
                        value={manualTicker}
                        onValueChange={(value) => {
                          const upperValue = value.toUpperCase();
                          if (upperValue !== manualTicker) {
                            setManualTicker(upperValue);
                            debouncedSearch(upperValue);
                          }
                        }}
                      />
                      {SearchResultsList}
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex flex-wrap gap-2">
                {data.peerCompanies.map((company) => (
                <Badge
                  key={company.id}
                  variant={selectedPeers.includes(company.id) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-3 py-1 transition-all",
                    selectedPeers.includes(company.id) ? "hover:bg-primary/80" : "hover:bg-secondary"
                  )}
                  onClick={() => togglePeer(company.id)}
                >
                  {company.id}
                  {selectedPeers.includes(company.id) && (
                    <X className="ml-1 h-3 w-3 inline-block" />
                  )}
                </Badge>
              ))}
                {manualTickers.map((ticker) => (
                  <Badge
                    key={ticker}
                    variant={selectedPeers.includes(ticker) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer px-3 py-1 transition-all",
                      selectedPeers.includes(ticker) ? "hover:bg-primary/80" : "hover:bg-secondary"
                    )}
                    onClick={() => togglePeer(ticker)}
                  >
                    {ticker}
                    <X 
                      className="ml-1 h-3 w-3 inline-block hover:text-red-500" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveManualTicker(ticker);
                      }}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="valuation" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="valuation" className="text-sm">Valuation Comparables</TabsTrigger>
          <TabsTrigger value="operating" className="text-sm">Operating Benchmarks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="valuation" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Valuation Comparables</CardTitle>
              <CardDescription>Compare key valuation metrics with industry peers</CardDescription>
            </CardHeader>
        <CardContent>
          {valuationMode === 'forward' && loadingForward ? (
            <div className="py-8 text-center text-muted-foreground">Loading forward estimates...</div>
          ) : (
            <div className="overflow-x-auto rounded-lg">
              <div className="flex justify-start mb-2">
                <ToggleGroup type="single" value={valuationMode} onValueChange={v => v && setValuationMode(v as 'ttm' | 'forward')}>
                  <ToggleGroupItem value="ttm">TTM</ToggleGroupItem>
                  <ToggleGroupItem value="forward">Forward</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <table className="w-full financial-table">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/90 backdrop-blur">
                  <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 sticky left-0 z-30 bg-slate-50 dark:bg-slate-900/90">Company</th>
                    <th className="text-right py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[90px]">
                      Market Cap
                      {renderMetricTooltip("Market Capitalization", "The total value of all outstanding shares of a company.")}
                    </th>
                    <th className="text-right py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[80px]">
                      EV/EBITDA
                      {renderMetricTooltip("Enterprise Value to EBITDA", "Measures the value of a company compared to its earnings before interest, taxes, depreciation, and amortization.")}
                    </th>
                    <th className="text-right py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[80px]">
                      P/E Ratio
                      {renderMetricTooltip("Price to Earnings Ratio", "Measures a company's current share price relative to its earnings per share.")}
                    </th>
                    <th className="text-right py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[80px]">
                      P/S Ratio
                      {renderMetricTooltip("Price to Sales Ratio", "Compares a company's stock price to its revenues.")}
                    </th>
                    <th className="text-right py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[80px]">
                      P/B Ratio
                      {renderMetricTooltip("Price to Book Ratio", "Compares a company's market value to its book value.")}
                    </th>
                    <th className="text-right py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[80px]">
                      Div. Yield
                      {renderMetricTooltip("Dividend Yield", "The annual dividend payment divided by the stock price, expressed as a percentage.")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-950">
                  {/* Peer companies */}
                  {filteredValuationData.map((company) => (
                    <tr key={company.ticker} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-2 px-4 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 sticky left-0 z-20 bg-white dark:bg-slate-950">{company.company} ({company.ticker})</td>
                      <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">{getValuationMetric(company, 'marketCap')}</td>
                      <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">{getValuationMetric(company, 'evToEbitda')}</td>
                      <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">{getValuationMetric(company, 'peRatio')}</td>
                      <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">{getValuationMetric(company, 'priceToSales')}</td>
                      <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">{getValuationMetric(company, 'priceToBook')}</td>
                      <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">{getValuationMetric(company, 'dividendYield')}</td>
                    </tr>
                  ))}
                  
                  {/* Separator */}
                  <tr className="h-2"/>
                  
                  {/* Median row */}
                  {filteredValuationData.length > 0 && (
                    <>
                      <tr className="border-b-2 border-slate-300 dark:border-slate-600 bg-blue-25 dark:bg-blue-900/20">
                        <td className="py-3 px-4 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 sticky left-0 z-20 bg-blue-25 dark:bg-blue-900/20">Median</td>
                        <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                          {formatMarketCap(calculateMetrics(filteredValuationData).median.marketCap)}
                        </td>
                        <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                          {calculateMetrics(filteredValuationData).median.evToEbitda.toFixed(1)}x
                        </td>
                        <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                          {calculateMetrics(filteredValuationData).median.peRatio.toFixed(1)}x
                        </td>
                        <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                          {calculateMetrics(filteredValuationData).median.priceToSales.toFixed(1)}x
                        </td>
                        <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                          {calculateMetrics(filteredValuationData).median.priceToBook.toFixed(1)}x
                        </td>
                        <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                          {formatPercentage(calculateMetrics(filteredValuationData).median.dividendYield)}
                        </td>
                      </tr>
                      <tr className="border-b-2 border-slate-300 dark:border-slate-600 bg-yellow-25 dark:bg-yellow-900/20">
                        <td className="py-3 px-4 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 sticky left-0 z-20 bg-yellow-25 dark:bg-yellow-900/20">Average</td>
                        <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                          {formatMarketCap(calculateMetrics(filteredValuationData).average.marketCap)}
                        </td>
                        <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                          {calculateMetrics(filteredValuationData).average.evToEbitda.toFixed(1)}x
                        </td>
                        <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                          {calculateMetrics(filteredValuationData).average.peRatio.toFixed(1)}x
                        </td>
                        <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                          {calculateMetrics(filteredValuationData).average.priceToSales.toFixed(1)}x
                        </td>
                        <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                          {calculateMetrics(filteredValuationData).average.priceToBook.toFixed(1)}x
                        </td>
                        <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                          {formatPercentage(calculateMetrics(filteredValuationData).average.dividendYield)}
                        </td>
                      </tr>
                    </>
                  )}
                  
                  {/* Separator before subject company */}
                  <tr className="h-4"/>
                  
                  {/* Subject company row */}
                  {data?.peerValuationData.find(company => company.ticker === currentSymbol) && (
                    <tr className="border-2 border-blue-600 dark:border-blue-400 bg-green-25 dark:bg-green-900/20">
                      <td className="py-3 px-4 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 sticky left-0 z-20 bg-green-25 dark:bg-green-900/20">
                        {data.peerValuationData.find(company => company.ticker === currentSymbol)?.company} ({currentSymbol})
                      </td>
                      <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                        {formatMarketCap(data.peerValuationData.find(company => company.ticker === currentSymbol)?.marketCap || 0)}
                      </td>
                      <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                        {data.peerValuationData.find(company => company.ticker === currentSymbol)?.evToEbitda.toFixed(1)}x
                      </td>
                      <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                        {data.peerValuationData.find(company => company.ticker === currentSymbol)?.peRatio.toFixed(1)}x
                      </td>
                      <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                        {data.peerValuationData.find(company => company.ticker === currentSymbol)?.priceToSales.toFixed(1)}x
                      </td>
                      <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                        {data.peerValuationData.find(company => company.ticker === currentSymbol)?.priceToBook.toFixed(1)}x
                      </td>
                      <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                        {formatPercentage(data.peerValuationData.find(company => company.ticker === currentSymbol)?.dividendYield || 0)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>
        
        <TabsContent value="operating" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold" style={{ color: 'var(--finhub-title)' }}>Operating Benchmarks</CardTitle>
              <CardDescription>Compare key operating metrics with industry peers</CardDescription>
            </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full financial-table">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/90 backdrop-blur">
                <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 sticky left-0 z-30 bg-slate-50 dark:bg-slate-900/90">Company</th>
                  <th className="text-right py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[80px]">
                    Rev. Growth
                    {renderMetricTooltip("Revenue Growth", "Year-over-year percentage change in revenue.")}
                  </th>
                  <th className="text-right py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[80px]">
                    Gross Margin
                    {renderMetricTooltip("Gross Margin", "Gross profit divided by revenue, expressed as a percentage.")}
                  </th>
                  <th className="text-right py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[80px]">
                    Op. Margin
                    {renderMetricTooltip("Operating Margin", "Operating income divided by revenue, expressed as a percentage.")}
                  </th>
                  <th className="text-right py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[80px]">
                    Net Margin
                    {renderMetricTooltip("Net Margin", "Net income divided by revenue, expressed as a percentage.")}
                  </th>
                  <th className="text-right py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[80px]">
                    ROIC
                    {renderMetricTooltip("Return on Invested Capital", "Measures how efficiently a company uses capital to generate profits.")}
                  </th>
                  <th className="text-right py-3 px-3 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[80px]">
                    ROE
                    {renderMetricTooltip("Return on Equity", "Net income divided by shareholders' equity, expressed as a percentage.")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-950">
                {/* Peer companies */}
                {filteredPerformanceData.map((company) => (
                  <tr key={company.ticker} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2 px-4 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 sticky left-0 z-20 bg-white dark:bg-slate-950">{company.company} ({company.ticker})</td>
                    <td className={cn(
                      "text-right py-2 px-3 text-xs md:text-sm tabular-nums",
                      company.revenueGrowth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>{formatPercentage(company.revenueGrowth)}</td>
                    <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">{formatPercentage(company.grossMargin)}</td>
                    <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">{formatPercentage(company.operatingMargin)}</td>
                    <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">{formatPercentage(company.netMargin)}</td>
                    <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">{formatPercentage(company.roic)}</td>
                    <td className="text-right py-2 px-3 text-xs md:text-sm tabular-nums">{formatPercentage(company.roe)}</td>
                  </tr>
                ))}
                
                {/* Separator */}
                <tr className="h-2"/>
                
                {/* Median row */}
                {filteredPerformanceData.length > 0 && (
                  <>
                    <tr className="border-b-2 border-slate-300 dark:border-slate-600 bg-blue-25 dark:bg-blue-900/20">
                      <td className="py-3 px-4 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 sticky left-0 z-20 bg-blue-25 dark:bg-blue-900/20">Median</td>
                      <td className={cn(
                        "text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold",
                        calculateMetrics(filteredPerformanceData).median.revenueGrowth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {formatPercentage(calculateMetrics(filteredPerformanceData).median.revenueGrowth)}
                      </td>
                      <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                        {formatPercentage(calculateMetrics(filteredPerformanceData).median.grossMargin)}
                      </td>
                      <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                        {formatPercentage(calculateMetrics(filteredPerformanceData).median.operatingMargin)}
                      </td>
                      <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                        {formatPercentage(calculateMetrics(filteredPerformanceData).median.netMargin)}
                      </td>
                      <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                        {formatPercentage(calculateMetrics(filteredPerformanceData).median.roic)}
                      </td>
                      <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                        {formatPercentage(calculateMetrics(filteredPerformanceData).median.roe)}
                      </td>
                    </tr>
                    <tr className="border-b-2 border-slate-300 dark:border-slate-600 bg-yellow-25 dark:bg-yellow-900/20">
                      <td className="py-3 px-4 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 sticky left-0 z-20 bg-yellow-25 dark:bg-yellow-900/20">Average</td>
                      <td className={cn(
                        "text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold",
                        calculateMetrics(filteredPerformanceData).average.revenueGrowth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {formatPercentage(calculateMetrics(filteredPerformanceData).average.revenueGrowth)}
                      </td>
                      <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                        {formatPercentage(calculateMetrics(filteredPerformanceData).average.grossMargin)}
                      </td>
                      <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                        {formatPercentage(calculateMetrics(filteredPerformanceData).average.operatingMargin)}
                      </td>
                      <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                        {formatPercentage(calculateMetrics(filteredPerformanceData).average.netMargin)}
                      </td>
                      <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                        {formatPercentage(calculateMetrics(filteredPerformanceData).average.roic)}
                      </td>
                      <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                        {formatPercentage(calculateMetrics(filteredPerformanceData).average.roe)}
                      </td>
                    </tr>
                  </>
                )}
                
                {/* Separator before subject company */}
                <tr className="h-4"/>
                
                {/* Subject company row */}
                {data?.peerPerformanceData.find(company => company.ticker === currentSymbol) && (
                  <tr className="border-2 border-blue-600 dark:border-blue-400 bg-green-25 dark:bg-green-900/20">
                    <td className="py-3 px-4 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 sticky left-0 z-20 bg-green-25 dark:bg-green-900/20">
                      {data.peerPerformanceData.find(company => company.ticker === currentSymbol)?.company} ({currentSymbol})
                    </td>
                    <td className={cn(
                      "text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold",
                      (data.peerPerformanceData.find(company => company.ticker === currentSymbol)?.revenueGrowth || 0) >= 0 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-red-600 dark:text-red-400"
                    )}>
                      {formatPercentage(data.peerPerformanceData.find(company => company.ticker === currentSymbol)?.revenueGrowth || 0)}
                    </td>
                    <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                      {formatPercentage(data.peerPerformanceData.find(company => company.ticker === currentSymbol)?.grossMargin || 0)}
                    </td>
                    <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                      {formatPercentage(data.peerPerformanceData.find(company => company.ticker === currentSymbol)?.operatingMargin || 0)}
                    </td>
                    <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                      {formatPercentage(data.peerPerformanceData.find(company => company.ticker === currentSymbol)?.netMargin || 0)}
                    </td>
                    <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                      {formatPercentage(data.peerPerformanceData.find(company => company.ticker === currentSymbol)?.roic || 0)}
                    </td>
                    <td className="text-right py-3 px-3 text-xs md:text-sm tabular-nums font-bold">
                      {formatPercentage(data.peerPerformanceData.find(company => company.ticker === currentSymbol)?.roe || 0)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

        </TabsContent>
      </Tabs>
    </div>
  );
}
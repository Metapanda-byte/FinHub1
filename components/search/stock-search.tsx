"use client";

import * as React from "react";
import { Search, Star, X, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSearchStore } from "@/lib/store/search-store";
import { useWatchlistStore } from "@/lib/store/watchlist-store";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useDebounce } from "@/hooks/use-debounce";
import useSWR from "swr";
import { preloadTickerData, preloadCriticalData } from "@/lib/api/data-preloader";

interface StockSearchProps {
  className?: string;
  placeholder?: string;
  showSelectedTicker?: boolean;
  variant?: 'desktop' | 'mobile';
}

interface SearchResult {
  symbol: string;
  name: string;
  currency: string;
  stockExchange: string;
  exchangeShortName: string;
  price?: number;
  change?: number;
  changePercent?: number;
  marketCap?: number;
}

interface SearchHistory {
  symbol: string;
  name: string;
  timestamp: number;
}

interface FavoriteStock {
  symbol: string;
  name: string;
  addedAt: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const popularStocks = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "GOOGL", name: "Alphabet" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "NVDA", name: "NVIDIA" },
];

export function StockSearch({ className, placeholder = "Search companies...", showSelectedTicker = true, variant }: StockSearchProps) {
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const debouncedSearch = useDebounce(search, 150);
  const abortRef = React.useRef<AbortController | null>(null);
  
  // Auto-detect variant if not specified
  const searchVariant = variant || (isMobile ? 'mobile' : 'desktop');
  
  const { 
    currentSymbol, 
    setCurrentSymbol, 
    setCurrentCompany,
    recentSearches, 
    addToRecent,
    favorites,
    toggleFavorite,
    isFavorite
  } = useSearchStore();
  
  const { 
    stocks: watchlistStocks, 
    addStock, 
    removeStock, 
    hasStock 
  } = useWatchlistStore();

  const toggleWatchlist = React.useCallback(
    (symbol: string, name: string) => {
      if (hasStock(symbol)) {
        removeStock(symbol);
      } else {
        // Add minimal stock data - will be updated with real data later
        addStock({ 
          symbol, 
          name, 
          lastPrice: 0, 
          change: 0, 
          changePercent: 0, 
          marketCap: 0, 
          peRatio: 0 
        });
      }
    },
    [hasStock, addStock, removeStock]
  );

  const isInWatchlist = React.useCallback(
    (symbol: string) => hasStock(symbol),
    [hasStock]
  );

  // Only fetch when user is actively searching
  const shouldFetch = search.length >= 2;
  const { data: searchResults, error } = useSWR(
    shouldFetch ? `/api/stock/search?query=${encodeURIComponent(debouncedSearch)}` : null,
    async (url: string) => {
      // cancel any in-flight
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      const res = await fetch(url, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error('search_failed');
      return res.json();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 500,
      keepPreviousData: true,
    }
  );

  // Update input value when current symbol changes (if showing selected ticker)
  React.useEffect(() => {
    if (showSelectedTicker && currentSymbol) {
      setInputValue(currentSymbol);
    } else if (!showSelectedTicker) {
      setInputValue("");
    }
  }, [currentSymbol, showSelectedTicker]);

  // Focus input when mobile dialog opens
  React.useEffect(() => {
    if (searchVariant === 'mobile' && open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, searchVariant]);

  const onSelect = React.useCallback(
    (symbol: string) => {
      // Start loading critical data immediately for instant render
      preloadCriticalData(symbol).then(() => {
        // Then load the rest in background
        preloadTickerData(symbol);
      });
      
      // First try to find from search results
      const selectedResult = searchResults?.find((r: SearchResult) => r.symbol === symbol);
      if (selectedResult) {
        setCurrentSymbol(symbol);
        setCurrentCompany(symbol, selectedResult.name);
        addToRecent(symbol, selectedResult.name);
        setInputValue(showSelectedTicker ? symbol : "");
        setSearch("");
        setOpen(false);
        
        // Dispatch custom event for navigation
        window.dispatchEvent(new CustomEvent('stockSelected', { 
          detail: { symbol } 
        }));
        return;
      }

      // If not found in search results, try recent searches or favorites
      const recentItem = recentSearches.find((r: SearchHistory) => r.symbol === symbol);
      const favoriteItem = favorites.find((f: FavoriteStock) => f.symbol === symbol);
      const item = recentItem || favoriteItem;

      if (item) {
        setCurrentSymbol(symbol);
        setCurrentCompany(symbol, item.name);
        addToRecent(symbol, item.name);
        setInputValue(showSelectedTicker ? symbol : "");
        setSearch("");
        setOpen(false);
        
        // Dispatch custom event for navigation
        window.dispatchEvent(new CustomEvent('stockSelected', { 
          detail: { symbol } 
        }));
      }
    },
    [searchResults, recentSearches, favorites, setCurrentSymbol, setCurrentCompany, addToRecent, showSelectedTicker]
  );

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setSearch(value);
    
    // Open dropdown when user starts typing
    if (value.length >= 1) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  const handleInputFocus = () => {
    setOpen(true);
  };

  const handleClearInput = () => {
    setInputValue("");
    setSearch("");
    setOpen(false);
    if (!showSelectedTicker) {
      setCurrentSymbol(null);
    }
  };

  const showClearButton = inputValue.length > 0;
  const showSuggestions = search.length >= 1 && searchResults && searchResults.length > 0;
  const showRecentsAndFavorites = false; // Disabled - no past searches shown

  // Mobile full-screen search dialog
  if (searchVariant === 'mobile') {
    return (
      <>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal h-10", className)}
          onClick={() => setOpen(true)}
        >
          <Search className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {(showSelectedTicker && currentSymbol) || placeholder}
          </span>
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="p-0 h-full max-h-screen sm:max-h-[85vh] overflow-hidden">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 p-4 border-b">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search by ticker or company name"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-base"
                />
                {showClearButton && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleClearInput}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Searching...
                  </div>
                ) : search && searchResults && searchResults.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No results found
                  </div>
                ) : search && showSuggestions ? (
                  <div className="divide-y">
                    {searchResults.slice(0, 10).map((result: SearchResult) => (
                      <button
                        key={result.symbol}
                        onClick={() => onSelect(result.symbol)}
                        className="w-full p-4 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{result.symbol}</span>
                              <Badge variant="outline" className="text-[10px]">
                                {result.exchangeShortName}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {result.name}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(result.symbol, result.name);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Star
                              className={cn(
                                "h-4 w-4",
                                isInWatchlist(result.symbol) 
                                  ? "fill-yellow-400 text-yellow-400" 
                                  : "text-muted-foreground"
                              )}
                            />
                          </Button>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {watchlistStocks.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                          Watchlist
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          {watchlistStocks.slice(0, 6).map((stock) => (
                            <Button
                              key={stock.symbol}
                              variant="outline"
                              size="sm"
                              onClick={() => onSelect(stock.symbol)}
                              className="justify-start"
                            >
                              {stock.symbol}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {recentSearches.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                          Recent
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          {recentSearches.slice(0, 6).map((item: SearchHistory) => (
                            <Button
                              key={item.symbol}
                              variant="outline"
                              size="sm"
                              onClick={() => onSelect(item.symbol)}
                              className="justify-start"
                            >
                              {item.symbol}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                        Popular
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {popularStocks.map((stock) => (
                          <Button
                            key={stock.symbol}
                            variant="outline"
                            size="sm"
                            onClick={() => onSelect(stock.symbol)}
                            className="justify-start"
                          >
                            <span className="font-medium">{stock.symbol}</span>
                            <span className="text-muted-foreground ml-2 text-xs">
                              {stock.name}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Desktop dropdown search
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={`${placeholder}...`}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className={cn(
          "w-full h-8 px-2 py-1 pr-16 text-sm bg-transparent rounded-md",
          "placeholder:text-orange-500/80 placeholder:italic",
          "focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
        {showClearButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearInput}
            className="h-5 w-5 p-0 hover:bg-muted/50"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      
      {open && (showSuggestions || showRecentsAndFavorites) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          <Command shouldFilter={false}>
            <CommandList>
              {search.length >= 2 && !searchResults && !error && (
                <CommandEmpty>Searching...</CommandEmpty>
              )}
              
              {search.length >= 2 && error && (
                <CommandEmpty>Error searching. Please try again.</CommandEmpty>
              )}
              
              {search.length >= 2 && searchResults && searchResults.length === 0 && (
                <CommandEmpty>No companies found for &quot;{search}&quot;</CommandEmpty>
              )}

              {showSuggestions && (
                <CommandGroup heading={`Results for &quot;${search}&quot;`}>
                  {searchResults.slice(0, 8).map((result: SearchResult) => (
                    <CommandItem
                      key={result.symbol}
                      value={result.symbol}
                      onSelect={() => onSelect(result.symbol)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{result.symbol}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {result.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {result.exchangeShortName}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(result.symbol, result.name);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Star
                            className={cn(
                              "h-3 w-3",
                              isInWatchlist(result.symbol) 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-muted-foreground"
                            )}
                          />
                        </Button>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {showRecentsAndFavorites && recentSearches.length > 0 && (
                <CommandGroup heading="Recent">
                  {recentSearches.slice(0, 5).map((item: SearchHistory) => (
                    <CommandItem
                      key={item.symbol}
                      value={item.symbol}
                      onSelect={() => onSelect(item.symbol)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{item.symbol}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.name}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {showRecentsAndFavorites && favorites.length > 0 && (
                <CommandGroup heading="Favorites">
                  {favorites.slice(0, 5).map((item: FavoriteStock) => (
                    <CommandItem
                      key={item.symbol}
                      value={item.symbol}
                      onSelect={() => onSelect(item.symbol)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{item.symbol}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.symbol, item.name);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </Button>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
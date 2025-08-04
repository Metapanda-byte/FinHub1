"use client";

import * as React from "react";
import { Check, ChevronDown, Search, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSearchStore } from "@/lib/store/search-store";
import { useWatchlistStore } from "@/lib/store/watchlist-store";
import useSWR from "swr";

interface StockSearchProps {
  className?: string;
  placeholder?: string;
  showSelectedTicker?: boolean;
}

interface SearchResult {
  symbol: string;
  name: string;
  currency: string;
  stockExchange: string;
  exchangeShortName: string;
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

export function StockSearch({ className, placeholder = "Search companies...", showSelectedTicker = true }: StockSearchProps) {
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  
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
    shouldFetch ? `/api/stock/search?query=${encodeURIComponent(search)}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000,
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

  const onSelect = React.useCallback(
    (symbol: string) => {
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
    // Only show dropdown if there's content to show
    if (inputValue.length >= 1 || recentSearches.length > 0 || favorites.length > 0) {
      setOpen(true);
    }
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
  const showSuggestions = search.length >= 2 && searchResults && searchResults.length > 0;
  const showRecentsAndFavorites = search.length === 0 && (recentSearches.length > 0 || favorites.length > 0);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={`${placeholder}...`}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={() => setTimeout(() => setOpen(false), 200)} // Delay to allow clicking on dropdown items
        className={cn(
          "w-full h-8 px-2 py-1 pr-16 text-sm bg-transparent rounded-md",
          "placeholder:text-orange-500/60 placeholder:italic",
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
      
      {/* Dropdown Results */}
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

              {/* Search Results - Only show when actively searching */}
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

              {/* Recent Searches - Only show when not actively searching */}
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

              {/* Favorites - Only show when not actively searching */}
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
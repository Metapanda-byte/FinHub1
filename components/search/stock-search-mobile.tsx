"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, TrendingUp, TrendingDown } from "lucide-react";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { searchStocks } from "@/lib/api/stock";
import { useSearchStore } from "@/lib/store/search-store";
import { useWatchlistStore } from "@/lib/store/watchlist-store";
import { cn } from "@/lib/utils";

interface StockSearchResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  exchange: string;
}

export function StockSearchMobile() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const debouncedSearch = useDebounce(search, 300);
  const { setCurrentSymbol, currentSymbol } = useSearchStore();
  const { stocks: watchlist } = useWatchlistStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent searches
  const addRecentSearch = (symbol: string) => {
    const updated = [symbol, ...recentSearches.filter(s => s !== symbol)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 1) {
      setResults([]);
      return;
    }

    setLoading(true);
    searchStocks(debouncedSearch)
      .then(data => {
        setResults(data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  const handleSelect = (symbol: string) => {
    setCurrentSymbol(symbol);
    addRecentSearch(symbol);
    setOpen(false);
    setSearch("");
  };

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Popular stocks for quick access
  const popularStocks = [
    { symbol: "AAPL", name: "Apple" },
    { symbol: "MSFT", name: "Microsoft" },
    { symbol: "GOOGL", name: "Alphabet" },
    { symbol: "AMZN", name: "Amazon" },
    { symbol: "TSLA", name: "Tesla" },
    { symbol: "NVDA", name: "NVIDIA" },
  ];

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        className="w-full justify-start text-left font-normal h-10"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          {currentSymbol || "Search stocks..."}
        </span>
      </Button>

      {/* Full Screen Search Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 h-full max-h-screen sm:max-h-[85vh] overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Search Header */}
            <div className="flex items-center gap-2 p-4 border-b">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search by ticker or company name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-base"
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSearch("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Searching...
                </div>
              ) : search && results.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No results found
                </div>
              ) : search ? (
                <div className="divide-y">
                  {results.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => handleSelect(stock.symbol)}
                      className="w-full p-4 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{stock.symbol}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {stock.exchange}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {stock.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${stock.price.toFixed(2)}</p>
                          <p className={cn(
                            "text-sm flex items-center gap-1",
                            stock.changePercent >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {stock.changePercent >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {Math.abs(stock.changePercent).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {/* Watchlist */}
                  {watchlist.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                        Watchlist
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {watchlist.slice(0, 6).map((stock) => (
                          <Button
                            key={stock.symbol}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelect(stock.symbol)}
                            className="justify-start"
                          >
                            {stock.symbol}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                        Recent
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {recentSearches.map((symbol) => (
                          <Button
                            key={symbol}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelect(symbol)}
                            className="justify-start"
                          >
                            {symbol}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Stocks */}
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
                          onClick={() => handleSelect(stock.symbol)}
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
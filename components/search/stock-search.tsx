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
import { format } from "date-fns";
import useSWR from 'swr';

interface SearchResult {
  symbol: string;
  name: string;
  currency: string;
  stockExchange: string;
  exchangeShortName: string;
}

type Exchange = 'NASDAQ' | 'NYSE' | 'AMEX' | 'TSX' | 'LSE' | 'FRA' | 'XETRA' | 'ASX' | 'NSE' | 'BSE' | 'SSE' | 'SZSE' | 'HKEX' | 'TSE';

const API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

interface StockSearchProps {
  className?: string;
}

export function StockSearch({ className }: StockSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const {
    recentSearches,
    favorites,
    addToRecent,
    toggleFavorite,
    isFavorite,
    setCurrentCompany,
    currentSymbol
  } = useSearchStore();

  const exchanges: Exchange[] = [
    'NASDAQ', 'NYSE', 'AMEX',  // US exchanges
    'TSX', 'LSE', 'FRA', 'XETRA',  // European exchanges
    'ASX',  // Australian exchange
    'NSE', 'BSE',  // Indian exchanges
    'SSE', 'SZSE',  // Chinese exchanges
    'HKEX',  // Hong Kong exchange
    'TSE'  // Tokyo exchange
  ];

  const { data: searchResults, error } = useSWR<SearchResult[]>(
    search.length >= 2 
      ? `${BASE_URL}/search?query=${encodeURIComponent(search)}&limit=10&exchange=${exchanges.join(',')}&apikey=${API_KEY}`
      : null,
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    }
  );

  const onSelect = React.useCallback(
    (symbol: string) => {
      console.log('onSelect triggered with symbol:', symbol);
      
      // Convert the input symbol to uppercase for comparison
      const upperSymbol = symbol.toUpperCase();

      // Find company details from all possible sources using case-insensitive comparison
      const companyFromSearch = searchResults?.find(
        (c) => c.symbol.toUpperCase() === upperSymbol
      );
      const companyFromRecent = recentSearches.find(
        (c) => c.symbol.toUpperCase() === upperSymbol
      );
      const companyFromFavorites = favorites.find(
        (c) => c.symbol.toUpperCase() === upperSymbol
      );
      
      console.log('Search results:', searchResults);
      console.log('Company from search:', companyFromSearch);
      console.log('Company from recent:', companyFromRecent);
      console.log('Company from favorites:', companyFromFavorites);

      const company = companyFromSearch || companyFromRecent || companyFromFavorites;
      
      if (company) {
        console.log('Company found:', company);
        console.log('Updating state with symbol:', company.symbol);
        
        setOpen(false);
        setSearch("");
        addToRecent(company.symbol, company.name);
        setCurrentCompany(company.symbol, company.name);
        
        console.log('State updates completed');
      } else {
        console.warn('No company found for symbol:', symbol);
      }
    },
    [searchResults, recentSearches, favorites, addToRecent, setCurrentCompany]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-[300px] justify-between bg-muted/30 hover:bg-muted transition-all duration-200",
            !currentSymbol && "ring-1 ring-muted-foreground/20 hover:ring-muted-foreground/40",
            className
          )}
        >
          <Search className="mr-2 h-4 w-4" />
          {currentSymbol ? (
            <span className="font-semibold">{currentSymbol}</span>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Select Company</span>
              </div>
              <span className="text-xs text-muted-foreground/60">or ticker symbol</span>
            </div>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="border-b px-3 py-2">
          <div className="text-sm font-medium text-foreground">Select Company</div>
          <div className="text-xs text-muted-foreground">Search by company name or ticker symbol</div>
        </div>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type company name or ticker symbol..."
            value={search}
            onValueChange={setSearch}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>
              {error ? "Error fetching results." : "No results found."}
            </CommandEmpty>
            {searchResults && searchResults.length > 0 && (
              <CommandGroup heading="Search Results">
                {searchResults.map((company) => (
                  <CommandItem
                    key={company.symbol}
                    value={company.symbol}
                    onSelect={onSelect}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <span className="font-medium">{company.symbol}</span>
                      <span className="ml-2 text-muted-foreground">
                        {company.name}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {company.exchangeShortName}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(company.symbol, company.name);
                      }}
                    >
                      <Star
                        className={cn(
                          "h-3 w-3",
                          isFavorite(company.symbol)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        )}
                      />
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {search.length === 0 && (
              <>
                {favorites.length > 0 && (
                  <CommandGroup heading="Favorites">
                    {favorites.map((item) => (
                      <CommandItem
                        key={item.symbol}
                        value={item.symbol}
                        onSelect={onSelect}
                      >
                        <Star className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{item.symbol}</span>
                        <span className="ml-2 text-muted-foreground">
                          {item.name}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {recentSearches.length > 0 && (
                  <CommandGroup heading="Recent Searches">
                    {recentSearches.map((item) => (
                      <CommandItem
                        key={item.symbol}
                        value={item.symbol}
                        onSelect={onSelect}
                      >
                        <span className="font-medium">{item.symbol}</span>
                        <span className="ml-2 text-muted-foreground">
                          {item.name}
                        </span>
                        <span className="ml-auto flex h-4 w-4 items-center justify-center text-xs text-muted-foreground">
                          {format(item.timestamp, "MMM d")}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, TrendingDown, ChevronRight, BarChart3, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSearchStore } from "@/lib/store/search-store";
import { formatLargeNumber, formatPercentage } from "@/lib/utils/formatters";

// Mock data - replace with real API calls
const marketMovers = {
  gainers: [
    { symbol: "NVDA", name: "NVIDIA", price: 823.45, change: 45.23, changePercent: 5.82 },
    { symbol: "TSLA", name: "Tesla", price: 245.30, change: 18.40, changePercent: 8.11 },
    { symbol: "AMD", name: "AMD", price: 142.15, change: 9.85, changePercent: 7.44 },
  ],
  losers: [
    { symbol: "META", name: "Meta", price: 485.20, change: -22.15, changePercent: -4.36 },
    { symbol: "NFLX", name: "Netflix", price: 445.80, change: -15.30, changePercent: -3.32 },
    { symbol: "DIS", name: "Disney", price: 92.45, change: -2.80, changePercent: -2.94 },
  ]
};

const trendingStocks = [
  { symbol: "AAPL", searches: 15420, change: 12.5 },
  { symbol: "MSFT", searches: 12380, change: -5.2 },
  { symbol: "GOOGL", searches: 9854, change: 8.9 },
  { symbol: "AMZN", searches: 8932, change: 22.1 },
];

const watchlists = [
  {
    name: "Magnificent 7",
    description: "Tech giants driving the market",
    stocks: ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA"]
  },
  {
    name: "Dividend Kings",
    description: "50+ years of dividend growth",
    stocks: ["KO", "JNJ", "PG", "MMM", "CL", "PEP", "EMR"]
  },
  {
    name: "AI Revolution",
    description: "Leading the AI transformation",
    stocks: ["NVDA", "MSFT", "GOOGL", "AMD", "PLTR", "C3AI", "UPST"]
  }
];

function StockCard({ symbol, name, price, change, changePercent, onClick }: any) {
  const isPositive = change >= 0;
  
  return (
    <button
      onClick={onClick}
      className="text-left w-full p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors active:scale-[0.98]"
    >
      <div className="flex justify-between items-start mb-1">
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{symbol}</div>
          <div className="text-xs text-muted-foreground truncate">{name}</div>
        </div>
        <div className={cn(
          "flex items-center gap-1 flex-shrink-0 ml-2",
          isPositive ? "text-green-600" : "text-red-600"
        )}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span className="text-sm font-medium">{formatPercentage(changePercent)}</span>
        </div>
      </div>
      <div className="text-lg font-bold">${price.toFixed(2)}</div>
    </button>
  );
}

function SearchBar({ onSearch }: { onSearch: (symbol: string) => void }) {
  const [query, setQuery] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim().toUpperCase());
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search stocks (e.g., AAPL, MSFT)"
        className="pl-10 pr-4 h-12 text-base"
      />
    </form>
  );
}

export function Home() {
  const router = useRouter();
  const setCurrentSymbol = useSearchStore((state) => state.setCurrentSymbol);
  const [marketStatus, setMarketStatus] = useState<"pre-market" | "open" | "after-hours" | "closed">("closed");
  
  useEffect(() => {
    // Determine market status based on current time
    const now = new Date();
    const hours = now.getUTCHours() - 5; // EST
    const day = now.getDay();
    
    if (day === 0 || day === 6) {
      setMarketStatus("closed");
    } else if (hours >= 4 && hours < 9.5) {
      setMarketStatus("pre-market");
    } else if (hours >= 9.5 && hours < 16) {
      setMarketStatus("open");
    } else if (hours >= 16 && hours < 20) {
      setMarketStatus("after-hours");
    } else {
      setMarketStatus("closed");
    }
  }, []);
  
  const handleStockClick = (symbol: string) => {
    setCurrentSymbol(symbol);
    // Stay on the same page but update the symbol
  };
  
  const handleSearch = (symbol: string) => {
    setCurrentSymbol(symbol);
    // Stay on the same page but update the symbol
  };
  
  const marketStatusConfig = {
    "pre-market": { label: "Pre-Market", color: "bg-yellow-500" },
    "open": { label: "Market Open", color: "bg-green-500" },
    "after-hours": { label: "After Hours", color: "bg-orange-500" },
    "closed": { label: "Market Closed", color: "bg-gray-500" }
  };
  
  const status = marketStatusConfig[marketStatus];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background px-4 pt-8 pb-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Market Status */}
          <div className="flex items-center justify-center gap-2">
            <div className={cn("h-2 w-2 rounded-full animate-pulse", status.color)} />
            <span className="text-sm font-medium">{status.label}</span>
          </div>
          
          {/* Logo & Tagline */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">
              <span className="text-foreground">FinHub</span>
              <span className="text-finhub-orange">IQ</span>
            </h1>
            <p className="text-muted-foreground">Professional equity research at your fingertips</p>
          </div>
          
          {/* Search Bar */}
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>
      
      {/* Market Movers */}
      <section className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-finhub-orange" />
            Market Movers
          </h2>
          <Badge variant="outline" className="text-xs">Live</Badge>
        </div>
        
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Top Gainers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {marketMovers.gainers.map((stock) => (
                <StockCard
                  key={stock.symbol}
                  {...stock}
                  onClick={() => handleStockClick(stock.symbol)}
                />
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Top Losers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {marketMovers.losers.map((stock) => (
                <StockCard
                  key={stock.symbol}
                  {...stock}
                  onClick={() => handleStockClick(stock.symbol)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Trending on FinHub */}
      <section className="px-4 py-6 bg-muted/30">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-finhub-orange" />
          Trending on FinHub
        </h2>
        
        <div className="space-y-2">
          {trendingStocks.map((stock, index) => (
            <button
              key={stock.symbol}
              onClick={() => handleStockClick(stock.symbol)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="text-lg font-bold text-muted-foreground">#{index + 1}</div>
                <div className="text-left">
                  <div className="font-semibold">{stock.symbol}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatLargeNumber(stock.searches)} searches
                  </div>
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-1 text-sm",
                stock.change >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {stock.change >= 0 ? "+" : ""}{stock.change}%
                <ChevronRight className="h-4 w-4" />
              </div>
            </button>
          ))}
        </div>
      </section>
      
      {/* Curated Watchlists */}
      <section className="px-4 py-6 mobile-borderless">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-finhub-orange" />
          Popular Watchlists
        </h2>
        
        <div className="space-y-3">
          {watchlists.map((list) => (
            <Card key={list.name} className="p-4">
              <div className="mb-3">
                <h3 className="font-semibold">{list.name}</h3>
                <p className="text-xs text-muted-foreground">{list.description}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {list.stocks.slice(0, 5).map((symbol) => (
                  <Button
                    key={symbol}
                    variant="outline"
                    size="sm"
                    onClick={() => handleStockClick(symbol)}
                    className="text-xs"
                  >
                    {symbol}
                  </Button>
                ))}
                {list.stocks.length > 5 && (
                  <span className="text-xs text-muted-foreground self-center">
                    +{list.stocks.length - 5} more
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>
      
      {/* Quick Actions */}
      <section className="px-4 py-8 pb-safe">
        <div className="bg-primary/5 rounded-lg p-6 text-center space-y-4">
          <h2 className="text-xl font-bold">Quick Actions</h2>
          <p className="text-sm text-muted-foreground">
            Get started with your research
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => router.push("/dashboard?tab=financials")}
            >
              View Financials
            </Button>
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => router.push("/dashboard?tab=valuation")}
            >
              Valuation Analysis
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 
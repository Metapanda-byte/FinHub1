"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, TrendingUp, TrendingDown, Eye, X, Download, Filter } from "lucide-react";
import { useWatchlistStore } from "@/lib/store/watchlist-store";
import { useSearchStore } from "@/lib/store/search-store";
import { cn } from "@/lib/utils";
import { formatFinancialNumber, formatPercentage, formatLargeNumber } from "@/lib/utils/formatters";

interface WatchlistStock {
  symbol: string;
  name: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  marketCap: number;
  peRatio: number;
  sector?: string;
  dividendYield?: number;
  revenueGrowth?: number;
  priceChange1Y?: number;
  beta?: number;
  eps?: number;
  priceToBook?: number;
  roe?: number;
  operatingMargin?: number;
  debtToEquity?: number;
  addedAt: string;
}

export function WatchlistTable() {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  const stocks = useWatchlistStore((state) => state.stocks);
  const removeStock = useWatchlistStore((state) => state.removeStock);
  const setCurrentCompany = useSearchStore((state) => state.setCurrentCompany);

  // Mock data for demonstration - in real app, this would come from API
  const enhancedStocks: WatchlistStock[] = stocks.map(stock => ({
    ...stock,
    sector: getSectorForSymbol(stock.symbol),
    dividendYield: getMockDividendYield(stock.symbol),
    revenueGrowth: getMockRevenueGrowth(stock.symbol),
    priceChange1Y: getMockPriceChange1Y(stock.symbol),
    beta: getMockBeta(stock.symbol),
    eps: getMockEPS(stock.symbol),
    priceToBook: getMockPriceToBook(stock.symbol),
    roe: getMockROE(stock.symbol),
    operatingMargin: getMockOperatingMargin(stock.symbol),
    debtToEquity: getMockDebtToEquity(stock.symbol),
  }));

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <TrendingUp className="h-3 w-3 ml-1" />
    ) : (
      <TrendingDown className="h-3 w-3 ml-1" />
    );
  };

  const sortedStocks = [...enhancedStocks].sort((a, b) => {
    if (!sortBy) return 0;
    
    const aValue = a[sortBy as keyof WatchlistStock];
    const bValue = b[sortBy as keyof WatchlistStock];
    
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const totalPages = Math.ceil(sortedStocks.length / resultsPerPage);
  const paginatedStocks = sortedStocks.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const handleViewAnalysis = (symbol: string, name: string) => {
    setCurrentCompany(symbol, name);
  };

  const exportToCsv = () => {
    const headers = [
      "Symbol", "Company", "Sector", "Price", "Change", "Market Cap", 
      "P/E", "Div Yield", "Rev Growth", "1Y Return", "Beta", "EPS", "P/B", "ROE"
    ];
    
    const csvContent = [
      headers.join(","),
      ...sortedStocks.map(stock => [
        stock.symbol,
        `"${stock.name}"`,
        stock.sector || "",
        stock.lastPrice,
        stock.changePercent,
        stock.marketCap,
        stock.peRatio,
        stock.dividendYield || 0,
        stock.revenueGrowth || 0,
        stock.priceChange1Y || 0,
        stock.beta || 1,
        stock.eps || 0,
        stock.priceToBook || 0,
        stock.roe || 0
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "watchlist.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Mock data functions
  function getSectorForSymbol(symbol: string): string {
    const sectors: Record<string, string> = {
      "AAPL": "Technology",
      "MSFT": "Technology", 
      "GOOGL": "Communication Services",
      "AMZN": "Consumer Discretionary",
      "META": "Communication Services",
      "TSLA": "Consumer Discretionary",
      "NVDA": "Technology",
      "BRK.A": "Financial Services",
      "JNJ": "Healthcare",
      "V": "Financial Services"
    };
    return sectors[symbol] || "Unknown";
  }

  function getMockDividendYield(symbol: string): number {
    const yields: Record<string, number> = {
      "AAPL": 0.5, "MSFT": 0.7, "GOOGL": 0.0, "AMZN": 0.0, "META": 0.4,
      "TSLA": 0.0, "NVDA": 0.1, "BRK.A": 0.0, "JNJ": 3.2, "V": 0.6
    };
    return yields[symbol] || 0;
  }

  function getMockRevenueGrowth(symbol: string): number {
    const growth: Record<string, number> = {
      "AAPL": -2.8, "MSFT": 16.6, "GOOGL": 13.6, "AMZN": 13.7, "META": 16.1,
      "TSLA": 18.8, "NVDA": 125.9, "BRK.A": 8.2, "JNJ": 6.5, "V": 12.3
    };
    return growth[symbol] || 0;
  }

  function getMockPriceChange1Y(symbol: string): number {
    const changes: Record<string, number> = {
      "AAPL": 38.9, "MSFT": 53.3, "GOOGL": 56.4, "AMZN": 77.9, "META": 150.3,
      "TSLA": -12.5, "NVDA": 238.7, "BRK.A": 15.2, "JNJ": -8.4, "V": 22.1
    };
    return changes[symbol] || 0;
  }

  function getMockBeta(symbol: string): number {
    const betas: Record<string, number> = {
      "AAPL": 1.25, "MSFT": 0.90, "GOOGL": 1.05, "AMZN": 1.15, "META": 1.18,
      "TSLA": 2.45, "NVDA": 1.85, "BRK.A": 0.88, "JNJ": 0.65, "V": 0.95
    };
    return betas[symbol] || 1.0;
  }

  function getMockEPS(symbol: string): number {
    const eps: Record<string, number> = {
      "AAPL": 6.13, "MSFT": 9.65, "GOOGL": 5.80, "AMZN": 2.90, "META": 14.25,
      "TSLA": 3.12, "NVDA": 12.96, "BRK.A": 66.84, "JNJ": 5.26, "V": 8.95
    };
    return eps[symbol] || 0;
  }

  function getMockPriceToBook(symbol: string): number {
    const pb: Record<string, number> = {
      "AAPL": 47.5, "MSFT": 13.2, "GOOGL": 6.3, "AMZN": 9.2, "META": 7.8,
      "TSLA": 8.9, "NVDA": 45.2, "BRK.A": 1.4, "JNJ": 5.1, "V": 12.8
    };
    return pb[symbol] || 0;
  }

  function getMockROE(symbol: string): number {
    const roe: Record<string, number> = {
      "AAPL": 160.6, "MSFT": 38.8, "GOOGL": 24.7, "AMZN": 14.8, "META": 25.3,
      "TSLA": 18.9, "NVDA": 89.2, "BRK.A": 9.8, "JNJ": 15.2, "V": 32.1
    };
    return roe[symbol] || 0;
  }

  function getMockOperatingMargin(symbol: string): number {
    const margins: Record<string, number> = {
      "AAPL": 28.8, "MSFT": 43.8, "GOOGL": 29.5, "AMZN": 5.2, "META": 34.2,
      "TSLA": 8.9, "NVDA": 52.8, "BRK.A": 12.4, "JNJ": 25.8, "V": 67.2
    };
    return margins[symbol] || 0;
  }

  function getMockDebtToEquity(symbol: string): number {
    const debt: Record<string, number> = {
      "AAPL": 1.73, "MSFT": 0.47, "GOOGL": 0.11, "AMZN": 0.91, "META": 0.23,
      "TSLA": 0.34, "NVDA": 0.28, "BRK.A": 0.24, "JNJ": 0.45, "V": 0.12
    };
    return debt[symbol] || 0;
  }

  if (stocks.length === 0) {
    return (
      <div className="text-center py-8">
        <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No stocks in watchlist</h3>
        <p className="text-muted-foreground mb-4">
          Add stocks to your watchlist to track them here
        </p>
        <Button variant="outline">
          Browse Stocks
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold">Watchlist</CardTitle>
          <p className="text-sm text-muted-foreground">
            {stocks.length} saved {stocks.length === 1 ? 'stock' : 'stocks'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportToCsv}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-xs">
                <th 
                  className="text-left py-2 px-2 font-medium cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('symbol')}
                >
                  <div className="flex items-center">
                    Ticker
                    {renderSortIcon('symbol')}
                  </div>
                </th>
                <th 
                  className="text-left py-2 px-2 font-medium cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Company
                    {renderSortIcon('name')}
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
                  onClick={() => handleSort('lastPrice')}
                >
                  <div className="flex items-center justify-end">
                    Price
                    {renderSortIcon('lastPrice')}
                  </div>
                </th>
                <th 
                  className="text-right py-2 px-2 font-medium cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('changePercent')}
                >
                  <div className="flex items-center justify-end">
                    Change
                    {renderSortIcon('changePercent')}
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
                  onClick={() => handleSort('roe')}
                >
                  <div className="flex items-center justify-end">
                    ROE %
                    {renderSortIcon('roe')}
                  </div>
                </th>
                <th className="text-center py-2 px-2 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedStocks.map((stock) => (
                <tr key={stock.symbol} className="hover:bg-muted/50 transition-colors text-xs h-10">
                  <td className="py-2 px-2 font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline align-middle">
                    {stock.symbol}
                  </td>
                  <td className="py-2 px-2 max-w-[150px] truncate align-middle" title={stock.name}>
                    {stock.name}
                  </td>
                  <td className="py-2 px-2 align-middle">
                    <Badge variant="secondary" className="text-xs">
                      {stock.sector || "Unknown"}
                    </Badge>
                  </td>
                  <td className="text-right py-2 px-2 tabular-nums align-middle">
                    ${stock.lastPrice.toFixed(2)}
                  </td>
                  <td className={cn(
                    "text-right py-2 px-2 tabular-nums align-middle",
                    stock.changePercent >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </td>
                                     <td className="text-right py-2 px-2 tabular-nums align-middle">
                     {formatLargeNumber(stock.marketCap)}
                   </td>
                  <td className="text-right py-2 px-2 tabular-nums align-middle">
                    {stock.peRatio > 0 ? stock.peRatio.toFixed(1) : '-'}
                  </td>
                  <td className="text-right py-2 px-2 tabular-nums align-middle">
                    {stock.dividendYield ? stock.dividendYield.toFixed(1) : '-'}%
                  </td>
                  <td className={cn(
                    "text-right py-2 px-2 tabular-nums align-middle",
                    (stock.revenueGrowth || 0) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {(stock.revenueGrowth || 0) >= 0 ? '+' : ''}{(stock.revenueGrowth || 0).toFixed(1)}%
                  </td>
                  <td className={cn(
                    "text-right py-2 px-2 tabular-nums align-middle",
                    (stock.priceChange1Y || 0) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {(stock.priceChange1Y || 0) >= 0 ? '+' : ''}{(stock.priceChange1Y || 0).toFixed(1)}%
                  </td>
                  <td className="text-right py-2 px-2 tabular-nums align-middle">
                    {(stock.beta || 1).toFixed(2)}
                  </td>
                  <td className="text-right py-2 px-2 tabular-nums align-middle">
                    {(stock.roe || 0).toFixed(1)}%
                  </td>
                  <td className="text-center py-2 px-2 align-middle">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleViewAnalysis(stock.symbol, stock.name)}
                        title="View Analysis"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        onClick={() => removeStock(stock.symbol)}
                        title="Remove from watchlist"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * resultsPerPage) + 1} to {Math.min(currentPage * resultsPerPage, sortedStocks.length)} of {sortedStocks.length} results
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
  );
} 
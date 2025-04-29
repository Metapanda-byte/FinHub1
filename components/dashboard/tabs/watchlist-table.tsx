"use client";

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, StarOff } from "lucide-react";
import { useWatchlistStore } from "@/lib/store/watchlist-store";
import { formatNumber, formatPercentage } from "@/lib/utils";

interface StockData {
  symbol: string;
  name: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  marketCap: number;
  peRatio: number;
}

export function WatchlistTable() {
  const { stocks, removeStock } = useWatchlistStore();
  const [stocksData, setStocksData] = useState<Record<string, StockData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStocksData = async () => {
      setLoading(true);
      const data: Record<string, StockData> = {};
      
      await Promise.all(
        stocks.map(async (stock) => {
          try {
            const quoteRes = await fetch(`/api/stock/${stock.symbol}/quote`);
            const quote = await quoteRes.json();

            data[stock.symbol] = {
              symbol: stock.symbol,
              name: stock.name,
              lastPrice: quote.price,
              change: quote.change,
              changePercent: quote.changesPercentage,
              marketCap: quote.marketCap,
              peRatio: quote.pe
            };
          } catch (error) {
            console.error(`Error fetching data for ${stock.symbol}:`, error);
            // Use the stored data if API call fails
            data[stock.symbol] = {
              symbol: stock.symbol,
              name: stock.name,
              lastPrice: stock.lastPrice,
              change: stock.change,
              changePercent: stock.changePercent,
              marketCap: stock.marketCap,
              peRatio: stock.peRatio
            };
          }
        })
      );

      setStocksData(data);
      setLoading(false);
    };

    if (stocks.length > 0) {
      fetchStocksData();
    } else {
      setLoading(false);
    }
  }, [stocks]);

  if (!stocks.length) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Your watchlist is empty</h3>
        <p className="text-muted-foreground">
          Add stocks to your watchlist by clicking the star icon when viewing a company
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Last Price</TableHead>
            <TableHead className="text-right">Change</TableHead>
            <TableHead className="text-right">Change %</TableHead>
            <TableHead className="text-right">Market Cap</TableHead>
            <TableHead className="text-right">P/E</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8}>
                <Skeleton className="h-10 w-full" />
              </TableCell>
            </TableRow>
          ) : (
            stocks.map((stock) => {
              const data = stocksData[stock.symbol];
              return (
                <TableRow key={stock.symbol}>
                  <TableCell className="font-medium">{stock.symbol}</TableCell>
                  <TableCell>{stock.name}</TableCell>
                  <TableCell className="text-right">
                    {formatNumber(data?.lastPrice)}
                  </TableCell>
                  <TableCell className={`text-right ${data?.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatNumber(data?.change)}
                  </TableCell>
                  <TableCell className={`text-right ${data?.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercentage(data?.changePercent)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(data?.marketCap)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(data?.peRatio)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStock(stock.symbol)}
                    >
                      <StarOff className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>
  );
} 
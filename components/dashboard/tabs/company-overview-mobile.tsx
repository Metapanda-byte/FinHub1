"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, Star, StarOff, TrendingUp, TrendingDown } from "lucide-react";
import { useSearchStore } from "@/lib/store/search-store";
import { useWatchlistStore } from "@/lib/store/watchlist-store";
import { useCompanyProfile, useIncomeStatements, useStockPriceData } from "@/lib/api/financial";
import { useStockQuote } from "@/lib/api/stock";
import { formatFinancialNumber, formatLargeNumber } from "@/lib/formatters";
import { StockChart } from "@/components/dashboard/charts/stock-chart";
import { OverviewPriceOptionA } from "@/components/dashboard/charts/overview-price-option-a";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  loading?: boolean;
}

function MetricCard({ label, value, change, loading }: MetricCardProps) {
  return (
    <div className="flex flex-col p-3 bg-muted/30 rounded-lg min-w-[120px]">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      {loading ? (
        <span className="text-sm font-semibold animate-pulse">•••</span>
      ) : (
        <>
          <span className="text-sm font-semibold">{value}</span>
          {change !== undefined && (
            <div className={cn("flex items-center gap-0.5 text-[10px]", change >= 0 ? "text-green-600" : "text-red-600")}>
              {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}



export function CompanyOverviewMobile() {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const currentSymbol = useSearchStore((state) => state.currentSymbol);
  const { hasStock, addStock, removeStock } = useWatchlistStore();
  const { profile, isLoading: profileLoading } = useCompanyProfile(currentSymbol || '');
  const { quote, loading: quoteLoading } = useStockQuote(currentSymbol || '');
  const { prices, isLoading: pricesLoading } = useStockPriceData(currentSymbol || '', 'YTD');
  const { statements, isLoading: statementsLoading } = useIncomeStatements(currentSymbol || '', 'annual');

  const isInWatchlist = currentSymbol ? hasStock(currentSymbol) : false;
  const toggleWatchlist = () => {
    if (currentSymbol) {
      if (isInWatchlist) {
        removeStock(currentSymbol);
      } else {
        addStock({
          symbol: currentSymbol,
          name: profile?.companyName || currentSymbol,
          lastPrice: quote?.price || 0,
          change: quote?.change || 0,
          changePercent: quote?.changesPercentage || 0,
          marketCap: quote?.marketCap || 0,
          peRatio: quote?.pe || 0,
        });
      }
    }
  };

  // Calculate key metrics
  const latestStatement = statements?.[0];
  const previousStatement = statements?.[1];
  
  const revenue = latestStatement?.revenue || 0;
  const revenueGrowth = previousStatement?.revenue 
    ? ((revenue - previousStatement.revenue) / previousStatement.revenue) * 100 
    : 0;
    
  const netIncome = latestStatement?.netIncome || 0;
  const netMargin = revenue ? (netIncome / revenue) * 100 : 0;
  
  const marketCap = quote?.marketCap || 0;
  const peRatio = quote?.pe || 0;
  const volume = quote?.volume || 0;

  // Truncate description for mobile
  const description = profile?.description || '';
  const maxDescriptionLength = 150;
  const truncatedDescription = description.length > maxDescriptionLength 
    ? description.substring(0, maxDescriptionLength) + '...' 
    : description;

  // Key metrics for carousel
  const keyMetrics = [
    [
      { label: 'Market Cap', value: formatLargeNumber(marketCap), loading: quoteLoading },
      { label: 'P/E Ratio', value: peRatio ? peRatio.toFixed(1) : 'N/A', loading: quoteLoading },
      { label: 'Volume', value: formatLargeNumber(volume), loading: quoteLoading },
    ],
    [
      { label: 'Revenue (TTM)', value: formatFinancialNumber(revenue), change: revenueGrowth, loading: statementsLoading },
      { label: 'Net Margin', value: netMargin.toFixed(1) + '%', loading: statementsLoading },
      { label: 'EPS', value: quote?.eps ? `$${quote.eps.toFixed(2)}` : 'N/A', loading: quoteLoading },
    ]
  ];

  if (!currentSymbol) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">Select a company to view details</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-0 mobile-borderless overflow-hidden touch-pan-y">
      {/* Compact Header with Logo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Company Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold truncate">{profile?.symbol}</h2>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex-shrink-0">
                {profile?.exchangeShortName}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.companyName || ''}
            </p>
          </div>
          
          {/* Company Logo - Now on the right */}
          <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center flex-shrink-0">
            {profile?.image ? (
              <img 
                src={profile.image} 
                alt={`${profile?.companyName || profile?.symbol} logo`}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-primary font-bold text-sm hidden">
              {profile?.symbol?.charAt(0) || '?'}
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0"
          onClick={toggleWatchlist}
        >
          {isInWatchlist ? 
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /> : 
            <StarOff className="h-4 w-4" />
          }
        </Button>
      </div>

      {/* Stock Price & Chart */}
      <div className="mobile-section">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">${quote?.price?.toFixed(2) || '0.00'}</span>
              <div className={cn(
                "flex items-center gap-1 text-sm",
                (quote?.changesPercentage || 0) >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {(quote?.changesPercentage || 0) >= 0 ? '+' : ''}
                {quote?.change?.toFixed(2)} ({quote?.changesPercentage?.toFixed(2)}%)
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">52W Range</p>
            <p className="text-xs font-medium">
              ${quote?.yearLow?.toFixed(2)} - ${quote?.yearHigh?.toFixed(2)}
            </p>
          </div>
        </div>
        
        {/* Compact Chart - Fixed Height */}
        <div className="h-[140px] overflow-hidden">
          <OverviewPriceOptionA symbol={currentSymbol || ''} timeframe="YTD" height={140} />
        </div>
      </div>

      {/* Company Info */}
      <div className="mobile-section">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {profile?.sector}
            </Badge>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {profile?.industry}
            </Badge>
          </div>
          
          <div className="text-xs text-muted-foreground leading-relaxed">
            {showFullDescription ? description : truncatedDescription}
            {description.length > maxDescriptionLength && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 ml-1 text-xs"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? (
                  <>Show less <ChevronUp className="h-3 w-3 ml-0.5" /></>
                ) : (
                  <>Show more <ChevronDown className="h-3 w-3 ml-0.5" /></>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics - Fixed Layout */}
      <div className="mobile-section">
        <h3 className="text-sm font-semibold mb-3">Key Metrics</h3>
        <div className="grid grid-cols-3 gap-2">
          {keyMetrics[0].map((metric, i) => (
            <MetricCard key={i} {...metric} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {keyMetrics[1].map((metric, i) => (
            <MetricCard key={i} {...metric} />
          ))}
        </div>
      </div>

      {/* Additional Info Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-8">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="financials" className="text-xs">Financials</TabsTrigger>
          <TabsTrigger value="valuation" className="text-xs">Valuation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <p className="text-muted-foreground">CEO</p>
              <p className="font-medium">{profile?.ceo || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Employees</p>
              <p className="font-medium">{profile?.fullTimeEmployees?.toLocaleString() || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Founded</p>
              <p className="font-medium">{profile?.ipoDate ? new Date(profile.ipoDate).getFullYear() : 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Location</p>
              <p className="font-medium">{profile?.city || 'N/A'}, {profile?.state || 'N/A'}</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="financials" className="mt-2">
          <div className="space-y-2">
            <div className="h-[100px]">
              {/* Mini revenue chart would go here */}
              <div className="h-full bg-muted/20 rounded flex items-center justify-center text-xs text-muted-foreground">
                Revenue Trend Chart
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Revenue Growth</p>
                <p className="font-medium">{revenueGrowth.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Gross Margin</p>
                <p className="font-medium">{((latestStatement?.grossProfitRatio || 0) * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="valuation" className="mt-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <p className="text-muted-foreground">P/E Ratio</p>
              <p className="font-medium">{peRatio ? peRatio.toFixed(1) : 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">EV/EBITDA</p>
              <p className="font-medium">N/A</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Dividend Yield</p>
              <p className="font-medium">{profile?.lastDiv ? `${(profile.lastDiv * 100).toFixed(2)}%` : 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Beta</p>
              <p className="font-medium">{profile?.beta?.toFixed(2) || 'N/A'}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
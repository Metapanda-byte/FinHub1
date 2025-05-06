"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RevenueChart } from "@/components/dashboard/charts/revenue-chart";
import { EbitdaChart } from "@/components/dashboard/charts/ebitda-chart";
import { PieChart } from "@/components/dashboard/charts/pie-chart";
import { StockChart } from "@/components/dashboard/charts/stock-chart";
import { ShareholdersTable } from "@/components/dashboard/tables/shareholders-table";
import { useState, useMemo } from "react";
import { useSearchStore } from "@/lib/store/search-store";
import { useCompanyProfile, useIncomeStatements, useStockPriceData, useRevenueSegmentsTTM, useGeographicRevenueTTM } from "@/lib/api/financial";
import { formatFinancialNumber, formatLargeNumber } from "@/lib/utils/formatters";
import { Star, StarOff } from "lucide-react";
import { useWatchlistStore } from "@/lib/store/watchlist-store";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useStockQuote } from "@/lib/api/stock";
import { format } from "date-fns";
import { useTheme } from 'next-themes';

// Define a consistent FinHub blue palette (dark to light)
const finhubBluePalette = [
  '#1e3a8a', // Dark blue
  '#2563eb',
  '#3b82f6',
  '#60a5fa',
  '#93c5fd',
  '#bfdbfe',
  '#dbeafe',
  '#e0e7ff', // Lightest blue
];

export function CompanySnapshot() {
  const [showMovingAverage, setShowMovingAverage] = useState(false);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | '5Y'>('1M');
  const { hasStock, addStock, removeStock } = useWatchlistStore();
  const currentSymbol = useSearchStore((state) => state.currentSymbol);
  const { profile, isLoading: profileLoading } = useCompanyProfile(currentSymbol);
  const { quote, loading: quoteLoading } = useStockQuote(currentSymbol);
  const { statements, isLoading: statementsLoading } = useIncomeStatements(currentSymbol);
  const { prices, isLoading: pricesLoading } = useStockPriceData(currentSymbol, timeframe);
  const { segments: ttmSegmentData, referenceDate: ttmSegmentRefDate, isLoading: segmentsLoading } = useRevenueSegmentsTTM(currentSymbol);
  const { regions: ttmGeographyData, referenceDate: ttmGeoRefDate, isLoading: regionsLoading } = useGeographicRevenueTTM(currentSymbol);
  const { resolvedTheme } = useTheme();
  const pieLabelColor = resolvedTheme === 'dark' ? '#fff' : '#111';

  console.log('Debug:', {
    currentSymbol,
    profileLoading,
    quoteLoading,
    hasProfile: !!profile,
    hasQuote: !!quote,
    profile,
    quote
  });

  const TOP_N = 6; // Show top 6, rest as 'Other'

  function groupTopNPlusOther(data: any[], nameKey = 'name', valueKey = 'value') {
    if (!Array.isArray(data) || data.length <= TOP_N) return data;
    const sorted = [...data].sort((a, b) => b[valueKey] - a[valueKey]);
    const top = sorted.slice(0, TOP_N);
    const other = sorted.slice(TOP_N);
    const otherValue = other.reduce((sum, item) => sum + item[valueKey], 0);
    const otherPercentage = other.reduce((sum, item) => sum + (item.percentage || 0), 0);
    if (otherValue > 0) {
      top.push({
        [nameKey]: 'Other',
        [valueKey]: otherValue,
        percentage: otherPercentage,
      });
    }
    return top;
  }

  const processedData = useMemo(() => {
    if (!profile || !statements || !prices) {
      return null;
    }

    return {
      revenueData: statements.slice(0, 5).reverse().map(statement => ({
        year: parseInt(statement.calendarYear),
        value: statement.revenue / 1e9
      })),
      ebitdaData: statements.slice(0, 5).reverse().map(statement => ({
        year: parseInt(statement.calendarYear),
        value: statement.ebitda / 1e9,
        margin: (statement.ebitdaratio * 100)
      })),
      stockData: prices.map(price => ({
        date: price.date,
        price: price.close,
        volume: price.volume
      })),
      segmentData: groupTopNPlusOther(ttmSegmentData.sort((a, b) => b.value - a.value)),
      geographyData: groupTopNPlusOther(ttmGeographyData.sort((a, b) => b.value - a.value)),
    };
  }, [profile, statements, prices, ttmSegmentData, ttmGeographyData]);

  const isWatchlisted = hasStock(currentSymbol);

  const handleWatchlistToggle = () => {
    console.log('Watchlist toggle clicked:', {
      currentSymbol,
      hasStock: hasStock(currentSymbol),
      profile,
      quote
    });
    
    if (!currentSymbol || !profile || !quote) {
      console.log('Cannot toggle watchlist:', {
        missingSymbol: !currentSymbol,
        missingProfile: !profile,
        missingQuote: !quote
      });
      return;
    }
    
    if (hasStock(currentSymbol)) {
      removeStock(currentSymbol);
    } else {
      addStock({
        symbol: currentSymbol,
        name: profile.companyName,
        lastPrice: quote.price,
        change: quote.change,
        changePercent: quote.changesPercentage,
        marketCap: quote.marketCap,
        peRatio: quote.pe
      });
    }
  };

  if (!currentSymbol || profileLoading || statementsLoading || pricesLoading || segmentsLoading || regionsLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">Loading...</CardTitle>
              <CardDescription>Fetching company data</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <div className="animate-pulse space-y-4">
                <div className="h-4 w-48 bg-muted rounded"></div>
                <div className="h-4 w-36 bg-muted rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!processedData) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">No Data Available</CardTitle>
              <CardDescription>Unable to fetch company data</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please try again later or select a different company.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { revenueData, ebitdaData, stockData, segmentData, geographyData } = processedData;

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold" style={{ color: 'var(--finhub-title)' }}>Company Overview</CardTitle>
            <CardDescription>
              Key information about {profile.companyName}
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleWatchlistToggle}
                  className={cn(
                    "transition-colors hover:bg-yellow-100 dark:hover:bg-yellow-900",
                    hasStock(currentSymbol) && "text-yellow-500"
                  )}
                  disabled={!currentSymbol || profileLoading || quoteLoading}
                >
                  {hasStock(currentSymbol) ? (
                    <Star className="h-5 w-5 fill-current" />
                  ) : (
                    <StarOff className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {hasStock(currentSymbol) ? "Remove from watchlist" : "Add to watchlist"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex items-start space-x-4 rounded-md border p-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile.image} alt={profile.companyName} />
                <AvatarFallback>{profile.symbol}</AvatarFallback>
              </Avatar>
              <div className="space-y-2 flex-1">
                <div className="space-y-0.5">
                  <h3 className="text-base font-semibold leading-none tracking-tight">
                    {profile.companyName} ({profile.symbol})
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {profile.sector}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {profile.industry}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {profile.exchangeShortName}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm">{profile.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Market Cap</p>
                    <p className="text-sm font-medium">{formatLargeNumber(profile.mktCap)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Employees</p>
                    <p className="text-sm font-medium">
                      {profile?.fullTimeEmployees ? profile.fullTimeEmployees.toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">CEO</p>
                    <p className="text-sm font-medium">{profile?.ceo || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium">
                      {profile?.city && profile?.state ? `${profile.city}, ${profile.state}` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold" style={{ color: 'var(--finhub-title)' }}>Revenue (5 Years)</CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={revenueData} palette={finhubBluePalette} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold" style={{ color: 'var(--finhub-title)' }}>EBITDA & Margin</CardTitle>
                </CardHeader>
                <CardContent>
                  <EbitdaChart data={ebitdaData} palette={finhubBluePalette} />
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold" style={{ color: 'var(--finhub-title)' }}>Revenue by Segment (TTM)</CardTitle>
            <span className="text-xs" style={{ color: 'var(--finhub-title)' }}>
              {ttmSegmentRefDate ? `As at: ${format(new Date(ttmSegmentRefDate), 'dd-MMM-yy')}` : ''}
            </span>
          </CardHeader>
          <CardContent>
            {segmentData.length > 0 ? (
              <PieChart 
                data={segmentData} 
                nameKey="name" 
                dataKey="value" 
                colors={finhubBluePalette}
                formatter={(value) => `$${value.toFixed(1)}B`}
                labelColor={pieLabelColor}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No revenue segmentation data available for this company
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold" style={{ color: 'var(--finhub-title)' }}>Revenue by Geography (TTM)</CardTitle>
            <span className="text-xs" style={{ color: 'var(--finhub-title)' }}>
              {ttmGeoRefDate ? `As at: ${format(new Date(ttmGeoRefDate), 'dd-MMM-yy')}` : ''}
            </span>
          </CardHeader>
          <CardContent>
            {geographyData.length > 0 ? (
              <PieChart 
                data={geographyData} 
                nameKey="name" 
                dataKey="value" 
                colors={finhubBluePalette}
                formatter={(value) => `$${value.toFixed(1)}B`}
                labelColor={pieLabelColor}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No geographic revenue data available for this company
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold" style={{ color: 'var(--finhub-title)' }}>Stock Performance</CardTitle>
            <div className="flex items-center space-x-2">
              <Switch
                id="moving-average"
                checked={showMovingAverage}
                onCheckedChange={setShowMovingAverage}
              />
              <Label htmlFor="moving-average">Show Moving Average</Label>
            </div>
          </div>
          <CardDescription>
            Historical stock price and volume data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Tabs defaultValue="1M" onValueChange={(value) => setTimeframe(value as '1D' | '1W' | '1M' | '1Y' | '5Y')}>
              <TabsList>
                <TabsTrigger value="1D">1D</TabsTrigger>
                <TabsTrigger value="1W">1W</TabsTrigger>
                <TabsTrigger value="1M">1M</TabsTrigger>
                <TabsTrigger value="1Y">1Y</TabsTrigger>
                <TabsTrigger value="5Y">5Y</TabsTrigger>
              </TabsList>
              <TabsContent value="1D">
                <StockChart symbol={currentSymbol} timeframe="1D" showMovingAverage={showMovingAverage} />
              </TabsContent>
              <TabsContent value="1W">
                <StockChart symbol={currentSymbol} timeframe="1W" showMovingAverage={showMovingAverage} />
              </TabsContent>
              <TabsContent value="1M">
                <StockChart symbol={currentSymbol} timeframe="1M" showMovingAverage={showMovingAverage} />
              </TabsContent>
              <TabsContent value="1Y">
                <StockChart symbol={currentSymbol} timeframe="1Y" showMovingAverage={showMovingAverage} />
              </TabsContent>
              <TabsContent value="5Y">
                <StockChart symbol={currentSymbol} timeframe="5Y" showMovingAverage={showMovingAverage} />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
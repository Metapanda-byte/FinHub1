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
import { useCompanyProfile, useIncomeStatements, useStockPriceData, useRevenueSegments, useGeographicRevenue } from "@/lib/api/financial";
import { formatFinancialNumber, formatLargeNumber } from "@/lib/utils/formatters";
import { Star, StarOff } from "lucide-react";
import { useWatchlistStore } from "@/lib/store/watchlist-store";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useStockQuote } from "@/lib/api/stock";

export function CompanySnapshot() {
  const [showMovingAverage, setShowMovingAverage] = useState(false);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | '5Y'>('1M');
  const { hasStock, addStock, removeStock } = useWatchlistStore();
  const currentSymbol = useSearchStore((state) => state.currentSymbol);
  const { profile, isLoading: profileLoading } = useCompanyProfile(currentSymbol);
  const { quote, loading: quoteLoading } = useStockQuote(currentSymbol);
  const { statements, isLoading: statementsLoading } = useIncomeStatements(currentSymbol);
  const { prices, isLoading: pricesLoading } = useStockPriceData(currentSymbol, timeframe);
  const { segments, isLoading: segmentsLoading } = useRevenueSegments(currentSymbol);
  const { regions, isLoading: regionsLoading } = useGeographicRevenue(currentSymbol);

  console.log('Debug:', {
    currentSymbol,
    profileLoading,
    quoteLoading,
    hasProfile: !!profile,
    hasQuote: !!quote,
    profile,
    quote
  });

  const processedData = useMemo(() => {
    if (!profile || !statements || !prices || !segments || !regions) {
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
      segmentData: segments.map(segment => ({
        name: segment.name,
        value: segment.value,
        percentage: segment.percentage
      })).sort((a, b) => b.value - a.value),
      geographyData: regions.map(region => ({
        name: region.name,
        value: region.value,
        percentage: region.percentage
      })).sort((a, b) => b.value - a.value)
    };
  }, [profile, statements, prices, segments, regions]);

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
            <CardTitle className="text-xl font-bold">Company Overview</CardTitle>
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
                  <CardTitle className="text-sm font-medium">Revenue (5 Years)</CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={revenueData} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">EBITDA & Margin</CardTitle>
                </CardHeader>
                <CardContent>
                  <EbitdaChart data={ebitdaData} />
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Revenue Distribution</CardTitle>
          <CardDescription>
            {segmentData.length > 0 && geographyData.length > 0 ? (
              "Breakdown by segment and geography"
            ) : (
              "Revenue segmentation data not available"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {segmentData.length > 0 || geographyData.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {segmentData.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 text-center">By Segment</h3>
                  <PieChart 
                    data={segmentData} 
                    nameKey="name" 
                    dataKey="value" 
                    colors={["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"]} 
                    formatter={(value) => `$${value.toFixed(1)}B`}
                  />
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      Largest segment: {segmentData[0].name} ({segmentData[0].percentage.toFixed(1)}% of revenue)
                    </p>
                  </div>
                </div>
              )}
              {geographyData.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 text-center">By Geography</h3>
                  <PieChart 
                    data={geographyData} 
                    nameKey="name" 
                    dataKey="value" 
                    colors={["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"]} 
                    formatter={(value) => `$${value.toFixed(1)}B`}
                  />
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      Largest region: {geographyData[0].name} ({geographyData[0].percentage.toFixed(1)}% of revenue)
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No revenue segmentation data available for this company
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Stock Performance</CardTitle>
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
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
import { useCompanyProfile, useIncomeStatements, useStockPriceData, useRevenueSegmentsTTM, useGeographicRevenueTTM, useEmployeeCount, useBalanceSheets } from "@/lib/api/financial";
import { formatFinancialNumber, formatLargeNumber } from "@/lib/utils/formatters";
import { Star, StarOff } from "lucide-react";
import { useWatchlistStore } from "@/lib/store/watchlist-store";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useStockQuote } from "@/lib/api/stock";
import { format } from "date-fns";
import { useTheme } from 'next-themes';
import { pieChartPalettes } from "@/components/dashboard/charts/pie-chart-palettes";
import clsx from 'clsx';

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

// Add a helper for market cap in billions
function formatMarketCapBillions(value: number) {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  return `${(value / 1_000_000_000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B`;
}

export function CompanySnapshot() {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | '5Y'>('1M');
  const { hasStock, addStock, removeStock } = useWatchlistStore();
  const currentSymbol = useSearchStore((state) => state.currentSymbol);
  const { profile, isLoading: profileLoading } = useCompanyProfile(currentSymbol);
  const { quote, loading: quoteLoading } = useStockQuote(currentSymbol);
  const { statements, isLoading: statementsLoading } = useIncomeStatements(currentSymbol);
  const { prices, isLoading: pricesLoading } = useStockPriceData(currentSymbol, timeframe);
  const { segments: ttmSegmentData, referenceDate: ttmSegmentRefDate, isLoading: segmentsLoading } = useRevenueSegmentsTTM(currentSymbol);
  const { regions: ttmGeographyData, referenceDate: ttmGeoRefDate, isLoading: regionsLoading } = useGeographicRevenueTTM(currentSymbol);
  const { employeeCount, isLoading: employeeCountLoading } = useEmployeeCount(currentSymbol);
  const { statements: balanceSheets, isLoading: balanceSheetLoading } = useBalanceSheets(currentSymbol);
  const { resolvedTheme } = useTheme();
  const pieLabelColor = resolvedTheme === 'dark' ? '#fff' : '#111';
  const [selectedPalette, setSelectedPalette] = useState<keyof typeof pieChartPalettes>('finhubBlues');

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

  // Palette selector UI
  const paletteOptions = Object.entries(pieChartPalettes).map(([key, value]) => ({
    key,
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    colors: value,
  }));

  const mostRecentBalanceSheet = balanceSheets && balanceSheets.length > 0 ? balanceSheets[0] : null;
  const mostRecentIncome = statements && statements.length > 0 ? statements[0] : null;
  const totalDebt = mostRecentBalanceSheet ? (mostRecentBalanceSheet.shortTermDebt || 0) + (mostRecentBalanceSheet.longTermDebt || 0) : null;
  const cash = mostRecentBalanceSheet ? (mostRecentBalanceSheet.cashAndShortTermInvestments || mostRecentBalanceSheet.cashAndCashEquivalents || 0) : null;
  const ebitda = mostRecentIncome ? mostRecentIncome.ebitda : null;
  const marketCap = profile && profile.mktCap ? profile.mktCap : null;
  const minorityInterest = mostRecentBalanceSheet && mostRecentBalanceSheet.minorityInterest ? mostRecentBalanceSheet.minorityInterest : 0;
  const enterpriseValue = (marketCap !== null && totalDebt !== null && cash !== null)
    ? marketCap + totalDebt - cash + minorityInterest
    : null;
  const evToEbitda = (enterpriseValue !== null && ebitda) ? enterpriseValue / ebitda : null;
  // Get highlight color from palette based on theme
  const highlightColor = resolvedTheme === 'dark'
    ? pieChartPalettes[selectedPalette][0] || '#1e293b' // darkest for dark mode
    : pieChartPalettes[selectedPalette][pieChartPalettes[selectedPalette].length - 1] || '#f9fafb'; // lightest for light mode
  // Determine border color class for theme
  const borderColorClass = resolvedTheme === 'dark' ? 'border-white' : 'border-black';
  const highlightTextColor = resolvedTheme === 'dark' ? '#fff' : '#111';

  // Helper to format numbers with aligned 'B' using '#,##0_)' approach
  function formatWithParens(value: number | null) {
    if (value === null || isNaN(value)) return 'N/A';
    const absStr = (Math.abs(value) / 1_000_000_000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    if (value < 0) {
      return <span><span>(</span>{absStr}<span style={{ display: 'inline-block', minWidth: '1.2ch', textAlign: 'left' }}>B)</span></span>;
    }
    // Add a space after B to align with parenthesis in negative numbers
    return <span>{absStr}<span style={{ display: 'inline-block', minWidth: '1.2ch', textAlign: 'left' }}>B&nbsp;</span></span>;
  }
  // Helper to format ratios with 'x' and align using '#,##0_)' approach
  function formatRatio(value: number | null) {
    if (value === null || isNaN(value)) return 'N/A';
    const absStr = value.toFixed(1);
    if (value < 0) {
      return <span><span>(</span>{absStr}<span style={{ display: 'inline-block', minWidth: '1.2ch', textAlign: 'left' }}>x)</span></span>;
    }
    // Add a space after x to align with parenthesis in negative numbers
    return <span>{absStr}<span style={{ display: 'inline-block', minWidth: '1.2ch', textAlign: 'left' }}>x&nbsp;</span></span>;
  }

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
          <div className="flex items-center gap-2 mb-4">
            <label htmlFor="palette-select" className="text-sm font-medium">Chart Palette:</label>
            <select
              id="palette-select"
              className="border rounded px-2 py-1 text-sm"
              value={selectedPalette}
              onChange={e => setSelectedPalette(e.target.value as keyof typeof pieChartPalettes)}
            >
              {paletteOptions.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
            {/* Show color swatches for preview */}
            <div className="flex gap-1 ml-2">
              {pieChartPalettes[selectedPalette].slice(0, 8).map((color, idx) => (
                <span key={color} style={{ background: color, width: 16, height: 16, borderRadius: 4, border: '1px solid #ccc', display: 'inline-block' }} />
              ))}
            </div>
          </div>
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
                    <p className="text-sm font-medium">{formatMarketCapBillions(marketCap)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Employees</p>
                    <p className="text-sm font-medium">
                      {employeeCountLoading
                        ? <span className="animate-pulse text-muted-foreground">Loading...</span>
                        : (employeeCount !== null && employeeCount !== undefined)
                          ? employeeCount.toLocaleString()
                          : 'N/A'}
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
                  <CardTitle className="text-xl font-bold" style={{ color: 'var(--finhub-title)' }}>Historical Revenue (Last 5Y)</CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={revenueData} palette={pieChartPalettes[selectedPalette]} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold" style={{ color: 'var(--finhub-title)' }}>Historical EBITDA (Last 5Y)</CardTitle>
                </CardHeader>
                <CardContent>
                  <EbitdaChart data={ebitdaData} palette={pieChartPalettes[selectedPalette]} />
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold" style={{ color: 'var(--finhub-title)' }}>LTM Revenue by Segment</CardTitle>
          </CardHeader>
          <CardContent>
            {segmentData.length > 0 ? (
              <>
                <PieChart 
                  data={segmentData} 
                  nameKey="name" 
                  dataKey="value" 
                  colors={pieChartPalettes[selectedPalette]}
                  formatter={(value) => `$${value.toFixed(1)}B`}
                  labelColor={pieLabelColor}
                />
                <div className="pt-2 text-xs text-muted-foreground text-left w-full" style={{ position: 'relative' }}>
                  {ttmSegmentRefDate ? `As at: ${format(new Date(ttmSegmentRefDate), 'dd-MMM-yy')}` : ''}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No revenue segmentation data available for this company
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold" style={{ color: 'var(--finhub-title)' }}>LTM Revenue by Geography</CardTitle>
          </CardHeader>
          <CardContent>
            {geographyData.length > 0 ? (
              <>
                <PieChart 
                  data={geographyData} 
                  nameKey="name" 
                  dataKey="value" 
                  colors={pieChartPalettes[selectedPalette]}
                  formatter={(value) => `$${value.toFixed(1)}B`}
                  labelColor={pieLabelColor}
                />
                <div className="pt-2 text-xs text-muted-foreground text-left w-full" style={{ position: 'relative' }}>
                  {ttmGeoRefDate ? `As at: ${format(new Date(ttmGeoRefDate), 'dd-MMM-yy')}` : ''}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No geographic revenue data available for this company
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold" style={{ color: 'var(--finhub-title)' }}>Stock Performance</CardTitle>
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
                  <StockChart symbol={currentSymbol} timeframe="1D" />
                </TabsContent>
                <TabsContent value="1W">
                  <StockChart symbol={currentSymbol} timeframe="1W" />
                </TabsContent>
                <TabsContent value="1M">
                  <StockChart symbol={currentSymbol} timeframe="1M" />
                </TabsContent>
                <TabsContent value="1Y">
                  <StockChart symbol={currentSymbol} timeframe="1Y" />
                </TabsContent>
                <TabsContent value="5Y">
                  <StockChart symbol={currentSymbol} timeframe="5Y" />
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold" style={{ color: 'var(--finhub-title)' }}>Capitalization Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div style={{ padding: '0.25rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="text-sm">
                <span>Market Cap</span>
                <span>{formatWithParens(marketCap)}</span>
              </div>
              <div style={{ padding: '0.25rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="text-sm">
                <span>+ Total Debt</span>
                <span>{formatWithParens(totalDebt)}</span>
              </div>
              <div style={{ padding: '0.25rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="text-sm">
                <span>+ Minority Interest</span>
                <span>{formatWithParens(minorityInterest)}</span>
              </div>
              <div style={{ padding: '0.25rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="text-sm">
                <span>- Cash & Equivalents</span>
                <span>{formatWithParens(cash !== null ? -Math.abs(cash) : null)}</span>
              </div>
              <div style={{ padding: '0.25rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="text-sm font-semibold border-t pt-2 mt-2">
                <span>Enterprise Value</span>
                <span>{formatWithParens(enterpriseValue)}</span>
              </div>
            </div>
            <div className="mt-4 space-y-0">
              <div
                style={{
                  background: highlightColor,
                  color: highlightTextColor,
                  fontWeight: 600,
                  padding: '0.25rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: 'none',
                  borderRadius: '4px 4px 0 0',
                }}
                className={clsx('text-sm font-semibold border', borderColorClass)}
              >
                <span>P/E Ratio</span>
                <span>{formatRatio(quote && quote.pe ? quote.pe : null)}</span>
              </div>
              <div
                style={{
                  background: highlightColor,
                  color: highlightTextColor,
                  fontWeight: 600,
                  padding: '0.25rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: 'none',
                  borderRadius: '0 0 4px 4px',
                }}
                className={clsx('text-sm font-semibold border', borderColorClass)}
              >
                <span>EV / EBITDA</span>
                <span>{formatRatio(evToEbitda)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
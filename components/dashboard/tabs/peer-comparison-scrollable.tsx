"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PeerComparisonTable } from "@/components/ui/scrollable-table";
import { formatLargeNumber, formatPercentage } from "@/lib/formatters";
import { useSearchStore } from "@/lib/store/search-store";
import { useCompanyProfile, useFinancialRatios, useKeyMetrics } from "@/lib/api/financial";
import { useStockQuote } from "@/lib/api/stock";
// import { usePeerComparison } from "@/lib/api/financial"; // TODO: Implement peer comparison hook
import { Loader2 } from "lucide-react";
import { KeyMetricsPanel } from "@/components/ui/key-metrics-panel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

export function PeerComparisonScrollable() {
  const currentSymbol = useSearchStore((state) => state.currentSymbol);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { profile, isLoading: profileLoading } = useCompanyProfile(currentSymbol || '');
  const { quote, loading: quoteLoading } = useStockQuote(currentSymbol || '');
  const { ratios, isLoading: ratiosLoading } = useFinancialRatios(currentSymbol || '');
  const { metrics: keyMetrics, isLoading: keyMetricsLoading } = useKeyMetrics(currentSymbol || '');
  
  // Mock data for demonstration - replace with actual API hook
  const isLoading = false; // Replace with actual loading state
  const peers = []; // Replace with actual peer data
  
  if (!currentSymbol) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Select a company to view peer comparison</p>
      </div>
    );
  }

  // Valuation metrics to compare
  const valuationMetrics = [
    { key: "marketCap", label: "Market Cap", format: formatLargeNumber },
    { key: "pe", label: "P/E Ratio", format: (val: number) => val ? val.toFixed(1) : "N/A" },
    { key: "priceToBook", label: "P/B Ratio", format: (val: number) => val ? val.toFixed(1) : "N/A" },
    { key: "evToEbitda", label: "EV/EBITDA", format: (val: number) => val ? val.toFixed(1) : "N/A" },
    { key: "priceToSales", label: "P/S Ratio", format: (val: number) => val ? val.toFixed(1) : "N/A" },
    { key: "dividendYield", label: "Div Yield", format: (val: number) => val ? `${(val * 100).toFixed(2)}%` : "N/A" },
  ];

  // Performance metrics
  const performanceMetrics = [
    { key: "revenue", label: "Revenue", format: formatLargeNumber },
    { key: "revenueGrowth", label: "Rev Growth", format: (val: number) => val ? `${(val * 100).toFixed(1)}%` : "N/A" },
    { key: "grossMargin", label: "Gross Margin", format: (val: number) => val ? `${(val * 100).toFixed(1)}%` : "N/A" },
    { key: "operatingMargin", label: "Op Margin", format: (val: number) => val ? `${(val * 100).toFixed(1)}%` : "N/A" },
    { key: "netMargin", label: "Net Margin", format: (val: number) => val ? `${(val * 100).toFixed(1)}%` : "N/A" },
    { key: "roe", label: "ROE", format: (val: number) => val ? `${(val * 100).toFixed(1)}%` : "N/A" },
    { key: "roa", label: "ROA", format: (val: number) => val ? `${(val * 100).toFixed(1)}%` : "N/A" },
  ];

  // Mock peer data - replace with actual data
  const mockPeers = [
    {
      symbol: currentSymbol,
      name: "Current Company",
      data: {
        marketCap: 3200000000000,
        pe: 32.5,
        priceToBook: 48.2,
        evToEbitda: 24.8,
        priceToSales: 8.2,
        dividendYield: 0.0044,
        revenue: 394328000000,
        revenueGrowth: 0.085,
        grossMargin: 0.442,
        operatingMargin: 0.302,
        netMargin: 0.253,
        roe: 1.479,
        roa: 0.282,
      }
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      data: {
        marketCap: 2900000000000,
        pe: 35.8,
        priceToBook: 15.9,
        evToEbitda: 25.2,
        priceToSales: 13.8,
        dividendYield: 0.0072,
        revenue: 211915000000,
        revenueGrowth: 0.112,
        grossMargin: 0.689,
        operatingMargin: 0.421,
        netMargin: 0.362,
        roe: 0.472,
        roa: 0.193,
      }
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      data: {
        marketCap: 1700000000000,
        pe: 27.3,
        priceToBook: 6.8,
        evToEbitda: 18.5,
        priceToSales: 5.4,
        dividendYield: 0,
        revenue: 282836000000,
        revenueGrowth: 0.093,
        grossMargin: 0.572,
        operatingMargin: 0.278,
        netMargin: 0.215,
        roe: 0.262,
        roa: 0.162,
      }
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      data: {
        marketCap: 1600000000000,
        pe: 51.2,
        priceToBook: 8.3,
        evToEbitda: 28.7,
        priceToSales: 2.8,
        dividendYield: 0,
        revenue: 574785000000,
        revenueGrowth: 0.118,
        grossMargin: 0.468,
        operatingMargin: 0.095,
        netMargin: 0.064,
        roe: 0.215,
        roa: 0.077,
      }
    },
    {
      symbol: "META",
      name: "Meta Platforms Inc.",
      data: {
        marketCap: 1200000000000,
        pe: 29.8,
        priceToBook: 7.5,
        evToEbitda: 16.2,
        priceToSales: 8.9,
        dividendYield: 0.004,
        revenue: 134902000000,
        revenueGrowth: 0.158,
        grossMargin: 0.812,
        operatingMargin: 0.382,
        netMargin: 0.293,
        roe: 0.267,
        roa: 0.196,
      }
    }
  ];

  return (
    <div className="space-y-6 mobile-borderless">
      {/* Header with Company Info and Key Metrics */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Company Logo */}
          <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center flex-shrink-0">
            {profile?.image ? (
              <img
                src={profile.image}
                alt={`${profile?.companyName || currentSymbol} logo`}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-primary font-bold text-sm hidden">
              {currentSymbol?.charAt(0) || '?'}
            </div>
          </div>
          
          {/* Company Name and Ticker */}
          <div>
            <h1 className="text-2xl font-bold">
              {profile?.companyName || 'Company'} ({currentSymbol})
            </h1>
            <p className="text-muted-foreground">
              Peer Comparison
            </p>
          </div>
        </div>

        {/* Key Metrics Panel */}
        <KeyMetricsPanel
          symbol={currentSymbol}
          profile={profile}
          quote={quote}
          keyMetrics={keyMetrics}
          ratios={ratios}
        />
      </div>

      {isMobile && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Swipe left to compare more metrics. Company names are locked for easy reference.
          </AlertDescription>
        </Alert>
      )}

      {/* Valuation Metrics */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Valuation Metrics</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <PeerComparisonTable
            companies={mockPeers}
            metrics={valuationMetrics}
          />
        )}
      </div>

      {/* Performance Metrics */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Performance Metrics</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <PeerComparisonTable
            companies={mockPeers}
            metrics={performanceMetrics}
          />
        )}
      </div>
    </div>
  );
} 
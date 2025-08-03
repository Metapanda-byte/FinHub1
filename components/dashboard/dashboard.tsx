"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyOverview } from "@/components/dashboard/tabs/company-overview";
import { HistoricalFinancials } from "@/components/dashboard/tabs/historical-financials";
import { CompetitorAnalysis } from "@/components/dashboard/tabs/competitor-analysis";
import { DCFAnalysis } from "@/components/dashboard/tabs/dcf-analysis";
import { RecentNews } from "@/components/dashboard/tabs/recent-news";
import IdeaGeneration from "@/components/dashboard/tabs/idea-generation";
import { WatchlistTable } from "@/components/dashboard/tabs/watchlist-table";
import SECFilingsTranscripts from "@/components/dashboard/tabs/sec-filings-transcripts";
import { LBOAnalysis } from "@/components/dashboard/tabs/lbo-analysis";
import { useSearchStore } from "@/lib/store/search-store";
import { FinancialChat } from "@/components/ui/financial-chat";
import { ChatFAB } from "@/components/ui/chat-fab";
import { HighlightToChat } from "@/components/ui/highlight-to-chat";
import { AnalysisPopup } from "@/components/ui/analysis-popup";
import { useIncomeStatements, useCashFlows, useBalanceSheets, useSECFilings, useEarningsTranscriptDates } from "@/lib/api/financial";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Building2,
  TrendingUp,
  Calculator,
  FileText,
  Newspaper,
  Lightbulb,
  Eye,
  BarChart3,
  Target,
  Search,
  Star,
  X,
} from "lucide-react";
import { StockSearch } from "@/components/search/stock-search";
import { Card } from "@/components/ui/card";
import { useWatchlistStore } from "@/lib/store/watchlist-store";
import { SwipeableView } from "@/components/ui/swipeable-view";
import { FloatingActionButton } from "@/components/ui/floating-action-button";

const tabConfig = [
  { 
    id: "company-snapshot", 
    label: "Overview", 
    icon: Building2,
    description: "Key metrics and company information"
  },
  { 
    id: "historical-financials", 
    label: "Financials", 
    icon: BarChart3,
    description: "Financial statements and trends"
  },
  { 
    id: "competitor-analysis", 
    label: "Peers", 
    icon: TrendingUp,
    description: "Competitive analysis and benchmarking"
  },
  { 
    id: "dcf-analysis", 
    label: "DCF", 
    icon: Calculator,
    description: "Discounted cash flow valuation"
  },
  { 
    id: "lbo-analysis", 
    label: "LBO", 
    icon: Target,
    description: "Leveraged buyout modeling"
  },
  { 
    id: "recent-news", 
    label: "News", 
    icon: Newspaper,
    description: "Latest news and updates"
  },
  { 
    id: "sec-filings", 
    label: "Filings", 
    icon: FileText,
    description: "Regulatory filings and earnings calls"
  },
  { 
    id: "idea-generation", 
    label: "Ideas", 
    icon: Lightbulb,
    description: "AI-powered investment ideas"
  },
  { 
    id: "watchlist", 
    label: "Watchlist", 
    icon: Eye,
    description: "Your saved stocks"
  },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("company-snapshot");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [highlightQuery, setHighlightQuery] = useState('');
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState({ metric: '', context: '' });
  const currentSymbol = useSearchStore((state) => state.currentSymbol);
  const stocks = useWatchlistStore((state) => state.stocks);
  const hasStock = useWatchlistStore((state) => state.hasStock);
  const addStock = useWatchlistStore((state) => state.addStock);
  const removeStock = useWatchlistStore((state) => state.removeStock);
  const isInWatchlist = currentSymbol ? hasStock(currentSymbol) : false;
  const watchlistSymbols = stocks.map(s => s.symbol);

  const toggleWatchlist = () => {
    if (!currentSymbol) return;
    if (isInWatchlist) {
      removeStock(currentSymbol);
    } else {
      // Add with minimal data for now
      addStock({
        symbol: currentSymbol,
        name: currentSymbol,
        lastPrice: 0,
        change: 0,
        changePercent: 0,
        marketCap: 0,
        peRatio: 0,
      });
    }
  };

  // Handle mobile navigation tab changes
  useEffect(() => {
    const handleMobileNavChange = (e: CustomEvent) => {
      setActiveTab(e.detail.tab);
    };

    window.addEventListener('mobile-nav-tab-change', handleMobileNavChange as any);
    return () => {
      window.removeEventListener('mobile-nav-tab-change', handleMobileNavChange as any);
    };
  }, []);

  // Fetch financial data for AI analysis
  const { statements: incomeStatements } = useIncomeStatements(currentSymbol || '');
  const { statements: cashFlows } = useCashFlows(currentSymbol || '');
  const { statements: balanceSheets } = useBalanceSheets(currentSymbol || '');
  
  // Fetch SEC filings and earnings transcripts for AI analysis
  const { data: secFilings } = useSECFilings(currentSymbol || '');
  const { data: earningsTranscriptDates } = useEarningsTranscriptDates(currentSymbol || '');

  // Fetch news data for AI analysis
  const { data: newsData } = useSWR(
    currentSymbol ? `/api/stock-news?symbol=${currentSymbol}` : null,
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch news');
      return response.json();
    },
    { revalidateOnFocus: false }
  );

  // Prepare financial data for AI
  const financialData = {
    incomeStatements: incomeStatements?.slice(0, 5) || [],
    cashFlows: cashFlows?.slice(0, 5) || [],
    balanceSheets: balanceSheets?.slice(0, 5) || [],
    news: newsData?.slice(0, 10) || [],
    secFilings: secFilings?.slice(0, 20) || [],
    earningsTranscriptDates: earningsTranscriptDates?.slice(0, 8) || [],
  };

  // Handle hover-to-analyze
  const handleHighlightAnalyze = (hoveredElement: string, context: string) => {
    setAnalysisData({ metric: hoveredElement, context });
    setIsAnalysisOpen(true);
  };

  const handleOpenChatFromAnalysis = () => {
    setIsAnalysisOpen(false);
    setIsChatOpen(true);
  };

  if (!currentSymbol) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-mobile">
        <div className="mb-8">
          <Search className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Enter a Ticker to Begin</h2>
          <p className="text-muted-foreground mb-6">
            Search for any company symbol to access comprehensive financial analysis
          </p>
        </div>
        
        <div className="w-full max-w-md mb-8">
          <StockSearch />
        </div>
        
        {watchlistSymbols.length > 0 && (
          <div className="w-full max-w-2xl">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Your Watchlist</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {watchlistSymbols.map((symbol) => (
                <Button
                  key={symbol}
                  variant="outline"
                  className="justify-start"
                  onClick={() => useSearchStore.getState().setCurrentSymbol(symbol)}
                >
                  {symbol}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div data-dashboard className="px-mobile space-y-4">
        {/* Ticker Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{currentSymbol}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={toggleWatchlist}
                >
                  <Star className={cn(
                    "h-4 w-4",
                    isInWatchlist && "fill-current"
                  )} />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Financial Analysis Dashboard
              </p>
            </div>
          </div>
          
          {/* Inline Ticker Input */}
          <div className="flex items-center gap-2">
            <div className="w-64 sm:w-80">
              <StockSearch className="border-2 border-[hsl(var(--finhub-orange))] rounded-lg" />
            </div>
          </div>
        </div>

        {/* Main Tabs Content */}
        <div className="w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tab Navigation - Full Width Toolbar */}
              <div className="tabs-scroll-container rounded-xl bg-muted/30 backdrop-blur p-1">
                <TabsList className="flex h-auto gap-1 w-max min-w-full md:grid md:grid-cols-8">
                {tabConfig.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/50 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center gap-1 py-2">
                      <tab.icon className="h-4 w-4" />
                      <span className="text-xs font-medium">{tab.label}</span>
                    </div>
                                      </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Tab Content */}
              <div className="mt-6 animate-fade-in">
                <TabsContent value="company-snapshot" className="mt-0 space-y-4">
                  <CompanyOverview />
                </TabsContent>
                <TabsContent value="historical-financials" className="mt-0 space-y-4">
                  <HistoricalFinancials />
                </TabsContent>
                <TabsContent value="competitor-analysis" className="mt-0 space-y-4">
                  <CompetitorAnalysis />
                </TabsContent>
                <TabsContent value="dcf-analysis" className="mt-0 space-y-4">
                  <DCFAnalysis symbol={currentSymbol} />
                </TabsContent>
                <TabsContent value="lbo-analysis" className="mt-0 space-y-4">
                  <LBOAnalysis symbol={currentSymbol} />
                </TabsContent>
                <TabsContent value="recent-news" className="mt-0 space-y-4">
                  <RecentNews />
                </TabsContent>
                <TabsContent value="sec-filings" className="mt-0 space-y-4">
                  <SECFilingsTranscripts ticker={currentSymbol} />
                </TabsContent>
                <TabsContent value="idea-generation" className="mt-0 space-y-4">
                  <IdeaGeneration />
                </TabsContent>
                <TabsContent value="watchlist" className="mt-0 space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">Watchlist</h2>
                      <p className="text-sm text-muted-foreground">
                        {watchlistSymbols.length} saved {watchlistSymbols.length === 1 ? 'stock' : 'stocks'}
                      </p>
                    </div>
                    
                    {watchlistSymbols.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {watchlistSymbols.map((symbol) => (
                          <Card key={symbol} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{symbol}</h3>
                                <p className="text-sm text-muted-foreground">Saved stock</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeStock(symbol)}
                                className="h-8 w-8"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              variant="outline"
                              className="w-full mt-3"
                              onClick={() => useSearchStore.getState().setCurrentSymbol(symbol)}
                            >
                              View Analysis
                            </Button>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No stocks in watchlist</h3>
                        <p className="text-muted-foreground mb-4">
                          Add stocks to your watchlist to track them here
                        </p>
                        <Button onClick={() => setActiveTab("company-snapshot")}>
                          Browse Stocks
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

        {/* AI Analysis & Chat Components */}
        {currentSymbol && (
          <>
            <HighlightToChat 
              onHighlightAnalyze={handleHighlightAnalyze} 
              activeTab={activeTab}
            />
            <ChatFAB onClick={() => setIsChatOpen(true)} />
            
            <AnalysisPopup
              isOpen={isAnalysisOpen}
              onClose={() => setIsAnalysisOpen(false)}
              selectedMetric={analysisData.metric}
              context={analysisData.context}
              symbol={currentSymbol}
              financialData={financialData}
              onOpenChat={handleOpenChatFromAnalysis}
            />
            
            <FinancialChat
              symbol={currentSymbol}
              financialData={financialData}
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              initialQuery={highlightQuery}
              onQueryProcessed={() => setHighlightQuery('')}
              hideUserQuery={!!highlightQuery}
            />
          </>
        )}
      </div>
    </>
  );
}
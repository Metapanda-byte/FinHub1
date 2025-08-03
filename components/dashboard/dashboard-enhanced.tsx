"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyOverview } from "@/components/dashboard/tabs/company-overview";
import { HistoricalFinancials } from "@/components/dashboard/tabs/historical-financials";
import { CompetitorAnalysis } from "@/components/dashboard/tabs/competitor-analysis";
import { DCFAnalysis } from "@/components/dashboard/tabs/dcf-analysis";
import { RecentNews } from "@/components/dashboard/tabs/recent-news";
import IdeaGeneration from "@/components/dashboard/tabs/idea-generation";
import SECFilingsTranscripts from "@/components/dashboard/tabs/sec-filings-transcripts";
import { LBOAnalysis } from "@/components/dashboard/tabs/lbo-analysis";
import { useSearchStore } from "@/lib/store/search-store";
import { FinancialChat } from "@/components/ui/financial-chat";
import { ChatFAB } from "@/components/ui/chat-fab";
import { HighlightToChat } from "@/components/ui/highlight-to-chat";
import { AnalysisPopup } from "@/components/ui/analysis-popup";
import { SwipeableView } from "@/components/ui/swipeable-view";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
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
  BarChart3,
  Target,
  Search,
  Star,
  Download,
  Share2,
  Filter,
  RefreshCw,
} from "lucide-react";
import { StockSearch } from "@/components/search/stock-search";
import { Card } from "@/components/ui/card";
import { useWatchlistStore } from "@/lib/store/watchlist-store";
import { useMediaQuery } from "@/hooks/use-media-query";

const tabConfig = [
  { 
    id: "company-snapshot", 
    label: "Overview", 
    icon: Building2,
    component: CompanyOverview
  },
  { 
    id: "historical-financials", 
    label: "Financials", 
    icon: BarChart3,
    component: HistoricalFinancials
  },
  { 
    id: "competitor-analysis", 
    label: "Peers", 
    icon: TrendingUp,
    component: CompetitorAnalysis
  },
  { 
    id: "dcf-analysis", 
    label: "DCF", 
    icon: Calculator,
    component: DCFAnalysis
  },
  { 
    id: "lbo-analysis", 
    label: "LBO", 
    icon: Target,
    component: LBOAnalysis
  },
  { 
    id: "recent-news", 
    label: "News", 
    icon: Newspaper,
    component: RecentNews
  },
  { 
    id: "sec-filings", 
    label: "Filings", 
    icon: FileText,
    component: SECFilingsTranscripts
  },
  { 
    id: "idea-generation", 
    label: "Ideas", 
    icon: Lightbulb,
    component: IdeaGeneration
  },
];

export function DashboardEnhanced() {
  const [activeTab, setActiveTab] = useState("company-snapshot");
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showGestureHint, setShowGestureHint] = useState(true);
  const currentSymbol = useSearchStore((state) => state.currentSymbol);
  const stocks = useWatchlistStore((state) => state.stocks);
  const hasStock = useWatchlistStore((state) => state.hasStock);
  const addStock = useWatchlistStore((state) => state.addStock);
  const removeStock = useWatchlistStore((state) => state.removeStock);
  const isInWatchlist = currentSymbol ? hasStock(currentSymbol) : false;
  const watchlistSymbols = stocks.map(s => s.symbol);
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Hide gesture hint after first swipe
  useEffect(() => {
    if (showGestureHint) {
      const timer = setTimeout(() => setShowGestureHint(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showGestureHint]);

  // Sync tab index with active tab
  useEffect(() => {
    const index = tabConfig.findIndex(tab => tab.id === activeTab);
    if (index !== -1) {
      setActiveTabIndex(index);
    }
  }, [activeTab]);

  const handleSwipe = useCallback((index: number) => {
    setActiveTabIndex(index);
    setActiveTab(tabConfig[index].id);
    setShowGestureHint(false);
  }, []);

  const toggleWatchlist = () => {
    if (!currentSymbol) return;
    if (isInWatchlist) {
      removeStock(currentSymbol);
    } else {
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

  // FAB actions
  const fabActions = [
    {
      icon: Download,
      label: 'Export Data',
      onClick: () => {
        // Trigger export in the active tab
        window.dispatchEvent(new CustomEvent('export-data', { 
          detail: { tab: activeTab } 
        }));
      },
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      icon: Share2,
      label: 'Share',
      onClick: () => {
        if (navigator.share) {
          navigator.share({
            title: `${currentSymbol} Analysis`,
            text: `Check out this financial analysis for ${currentSymbol}`,
            url: window.location.href
          });
        }
      },
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      icon: RefreshCw,
      label: 'Refresh',
      onClick: () => {
        window.location.reload();
      },
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

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
                  className="justify-start nav-pill"
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b sticky-nav-shadow">
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
                    "h-4 w-4 transition-all duration-200",
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

        {/* Main Content with Watchlist Sidebar */}
        <div className="flex gap-4">
          {/* Watchlist Sidebar - Desktop Only */}
          {watchlistSymbols.length > 0 && (
            <div className="hidden lg:block w-48 flex-shrink-0">
              <Card className="p-4 sticky top-20">
                <h3 className="text-sm font-medium mb-3">Watchlist</h3>
                <div className="space-y-1">
                  {watchlistSymbols.map((symbol) => (
                    <Button
                      key={symbol}
                      variant={symbol === currentSymbol ? "secondary" : "ghost"}
                      className="w-full justify-start text-sm nav-pill"
                      onClick={() => useSearchStore.getState().setCurrentSymbol(symbol)}
                    >
                      {symbol}
                    </Button>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Main Tabs Content */}
          <div className="flex-1">
            {isMobile ? (
              // Mobile: Swipeable Views
              <div className="space-y-4">
                {/* Mobile Tab Pills */}
                <div className="tabs-scroll-container mobile-tab-container rounded-xl bg-muted/30 backdrop-blur p-1">
                  <div className="flex gap-1 w-max min-w-full">
                    {tabConfig.map((tab, index) => (
                      <Button
                        key={tab.id}
                        variant={activeTabIndex === index ? "default" : "ghost"}
                        className="nav-pill touch-target-enhanced"
                        onClick={() => handleSwipe(index)}
                      >
                        <div className="flex flex-col items-center gap-1 py-1">
                          <tab.icon className="h-4 w-4" />
                          <span className="text-xs font-medium">{tab.label}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Swipeable Content */}
                <SwipeableView
                  activeIndex={activeTabIndex}
                  onSwipe={handleSwipe}
                  className="min-h-[60vh] swipeable-content"
                >
                  {tabConfig.map((tab) => {
                    const Component = tab.component;
                    return (
                      <div key={tab.id} className="tab-content-enter-active">
                        {tab.id === 'dcf-analysis' || tab.id === 'lbo-analysis' ? (
                          <Component symbol={currentSymbol} />
                        ) : tab.id === 'sec-filings' ? (
                          <Component ticker={currentSymbol} />
                        ) : (
                          <Component />
                        )}
                      </div>
                    );
                  })}
                </SwipeableView>

                {/* Gesture Hint */}
                {showGestureHint && (
                  <div className="gesture-hint">
                    Swipe to navigate between tabs
                  </div>
                )}
              </div>
            ) : (
              // Desktop: Traditional Tabs
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
                  {tabConfig.map((tab) => {
                    const Component = tab.component;
                    return (
                      <TabsContent key={tab.id} value={tab.id} className="mt-0 space-y-4">
                        {tab.id === 'dcf-analysis' || tab.id === 'lbo-analysis' ? (
                          <Component symbol={currentSymbol} />
                        ) : tab.id === 'sec-filings' ? (
                          <Component ticker={currentSymbol} />
                        ) : (
                          <Component />
                        )}
                      </TabsContent>
                    );
                  })}
                </div>
              </Tabs>
            )}
          </div>
        </div>

        {/* AI Analysis & Chat Components */}
        {currentSymbol && (
          <>
            <HighlightToChat />
            <AnalysisPopup />
            <ChatFAB onClick={() => setIsChatOpen(true)} />
            <FinancialChat
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              symbol={currentSymbol}
            />
          </>
        )}
      </div>

      {/* Floating Action Button - Mobile Only */}
      {isMobile && currentSymbol && (
        <FloatingActionButton actions={fabActions} />
      )}
    </>
  );
} 
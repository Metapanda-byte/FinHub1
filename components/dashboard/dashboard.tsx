"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home } from "@/components/dashboard/tabs/home";
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
import { AnalystCopilot } from "@/components/ui/analyst-copilot";
import { KeyMetricsPanel } from "@/components/ui/key-metrics-panel";
import { HighlightToChat } from "@/components/ui/highlight-to-chat";
import { AnalysisPopup } from "@/components/ui/analysis-popup";
import { useIncomeStatements, useCashFlows, useBalanceSheets, useSECFilings, useEarningsTranscriptDates, useCompanyProfile, useFinancialRatios, useKeyMetrics } from "@/lib/api/financial";
import { useStockQuote } from "@/lib/api/stock";
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
  Sparkles,
  X,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { useWatchlistStore } from "@/lib/store/watchlist-store";
import { SwipeableView } from "@/components/ui/swipeable-view";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { StockSearch } from "@/components/search/stock-search";
import { CompanyHeader } from "@/components/dashboard/company-header";
import { useMediaQuery } from "@/hooks/use-media-query";

const tabConfig = [
  { 
    id: "home", 
    label: "Home", 
    icon: Building2,
    description: "Market overview and discovery"
  },
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
    label: "Portfolio", 
    icon: Eye,
    description: "Your saved stocks"
  },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [highlightQuery, setHighlightQuery] = useState('');
  const [analysisData, setAnalysisData] = useState({
    metric: '',
    context: '',
    symbol: ''
  });
  const isMobile = useMediaQuery("(max-width: 640px)");

  const searchParams = useSearchParams();
  const currentSymbol = useSearchStore((state) => state.currentSymbol);
  const currentCompanyName = useSearchStore((state) => state.currentCompanyName);
  const resolvedCompanyName = currentCompanyName || currentSymbol;

  // Handle URL parameter for tab switching
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      // Validate that the tab exists in our configuration
      const validTab = tabConfig.find(tab => tab.id === tabParam);
      if (validTab) {
        setActiveTab(tabParam);
      }
    }
  }, [searchParams]);

  // Watchlist integration
  const stocks = useWatchlistStore((state) => state.stocks);
  const hasStock = useWatchlistStore((state) => state.hasStock);
  const addStock = useWatchlistStore((state) => state.addStock);
  const removeStock = useWatchlistStore((state) => state.removeStock);
  const isInWatchlist = currentSymbol ? hasStock(currentSymbol) : false;
  const watchlistSymbols = stocks.map(s => s.symbol);

  // Fetch key financial data for metrics panel
  const { profile } = useCompanyProfile(currentSymbol || '');
  const { quote } = useStockQuote(currentSymbol || '');
  const { ratios } = useFinancialRatios(currentSymbol || '');
  const { metrics: keyMetrics } = useKeyMetrics(currentSymbol || '');

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

  // Handle mobile navigation tab changes and watchlist tab switching
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      setActiveTab(event.detail.tab);
    };

    const handleSwitchTab = (event: CustomEvent) => {
      setActiveTab(event.detail.tab);
    };
    
    const handleMobileOpenCopilot = () => {
      setIsChatOpen(true);
    };

    window.addEventListener('mobileTabChange', handleTabChange as EventListener);
    window.addEventListener('switch-tab', handleSwitchTab as EventListener);
    window.addEventListener('mobile-open-copilot', handleMobileOpenCopilot);

    return () => {
      window.removeEventListener('mobileTabChange', handleTabChange as EventListener);
      window.removeEventListener('switch-tab', handleSwitchTab as EventListener);
      window.removeEventListener('mobile-open-copilot', handleMobileOpenCopilot);
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
    setAnalysisData({ metric: hoveredElement, context, symbol: currentSymbol || '' });
    setIsAnalysisOpen(true);
  };

  const handleOpenChatFromAnalysis = () => {
    setIsAnalysisOpen(false);
    setIsChatOpen(true);
  };

  // Function to get tagline for each tab
  const getTabTagline = (tabId: string) => {
    switch (tabId) {
      case 'company-snapshot':
        return 'Company Overview';
      case 'historical-financials':
        return 'Financial Statements';
      case 'competitor-analysis':
        return 'Competitor Analysis';
      case 'dcf-analysis':
        return 'DCF Valuation';
      case 'lbo-analysis':
        return 'LBO Analysis';
      case 'recent-news':
        return 'Recent News';
      case 'sec-filings':
        return 'SEC Filings & Transcripts';
      default:
        return 'FinHubIQ Workstation';
    }
  };

  // Function to check if tab should show company header
  const shouldShowCompanyHeader = (tabId: string) => {
    return ['company-snapshot', 'historical-financials', 'competitor-analysis', 'dcf-analysis', 'lbo-analysis', 'recent-news', 'sec-filings'].includes(tabId);
  };

  if (!currentSymbol) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-mobile">
        <div className="mb-6">
          <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <h2 className="text-xl font-semibold mb-2">Enter a Ticker to Begin</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Search for any company symbol to access comprehensive financial analysis
          </p>
        </div>
        
        <div className="w-full max-w-md mb-6 text-center">
          <p className="text-sm text-muted-foreground">
            Use the search box in the header to select a company
          </p>
        </div>
        
        {watchlistSymbols.length > 0 && (
          <div className="w-full max-w-2xl">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Your Watchlist</h3>
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
      <div data-dashboard className="flex flex-col h-screen overflow-hidden">
        {/* Dashboard-Specific Sticky Header Only - Hidden on mobile */}
        {!isMobile && (
          <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shrink-0">
            {/* Tab Navigation Section */}
            <div className="px-mobile py-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="w-full">
                  <TabsList className="flex h-auto w-full bg-transparent gap-1 p-0">
                    {tabConfig.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="flex-1 px-2 py-2 data-[state=active]:bg-muted/50 data-[state=active]:text-foreground transition-all duration-300 hover:bg-muted/30 rounded-lg border-0 shadow-none"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <tab.icon className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="text-xs font-medium whitespace-nowrap tracking-wide hidden sm:inline">
                            {tab.label}
                          </span>
                        </div>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </Tabs>
            </div>
          </div>
        )}

        {/* Main Content Area with Vertical Scrolling */}
        <div className="flex-1 overflow-y-auto mobile-scroll">
          <div className={cn("px-mobile pb-20 sm:pb-4", isMobile ? "pt-4" : "pt-8")} style={{ overflowX: 'hidden', touchAction: 'pan-y' }}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tab Content with Vertical Scrolling */}
              <div className="animate-fade-in">
                <TabsContent value="home" className="mt-0 space-y-3">
                  <Home />
                </TabsContent>
                <TabsContent value="company-snapshot" className="mt-0 space-y-3">
                  <div className="space-y-4">
                    <CompanyHeader tagline={getTabTagline('company-snapshot')} onOpenChat={() => setIsChatOpen(true)} />
                    <CompanyOverview onOpenChat={() => setIsChatOpen(true)} />
                  </div>
                </TabsContent>
                <TabsContent value="historical-financials" className="mt-0 space-y-3">
                  <div className="space-y-4">
                    <CompanyHeader tagline={getTabTagline('historical-financials')} onOpenChat={() => setIsChatOpen(true)} />
                    <HistoricalFinancials />
                  </div>
                </TabsContent>
                <TabsContent value="competitor-analysis" className="mt-0 space-y-3">
                  <div className="space-y-4">
                    <CompanyHeader tagline={getTabTagline('competitor-analysis')} onOpenChat={() => setIsChatOpen(true)} />
                    <CompetitorAnalysis />
                  </div>
                </TabsContent>
                <TabsContent value="dcf-analysis" className="mt-0 space-y-3">
                  <div className="space-y-4">
                    <CompanyHeader tagline={getTabTagline('dcf-analysis')} onOpenChat={() => setIsChatOpen(true)} />
                    <DCFAnalysis symbol={currentSymbol} />
                  </div>
                </TabsContent>
                <TabsContent value="lbo-analysis" className="mt-0 space-y-3">
                  <div className="space-y-4">
                    <CompanyHeader tagline={getTabTagline('lbo-analysis')} onOpenChat={() => setIsChatOpen(true)} />
                    <LBOAnalysis symbol={currentSymbol} />
                  </div>
                </TabsContent>
                <TabsContent value="recent-news" className="mt-0 space-y-3">
                  <div className="space-y-4">
                    <CompanyHeader tagline={getTabTagline('recent-news')} onOpenChat={() => setIsChatOpen(true)} />
                    <RecentNews />
                  </div>
                </TabsContent>
                <TabsContent value="sec-filings" className="mt-0 space-y-3">
                  <div className="space-y-4">
                    <CompanyHeader tagline={getTabTagline('sec-filings')} onOpenChat={() => setIsChatOpen(true)} />
                    <SECFilingsTranscripts ticker={currentSymbol} />
                  </div>
                </TabsContent>
                <TabsContent value="idea-generation" className="mt-0 space-y-3">
                  <IdeaGeneration />
                </TabsContent>
                <TabsContent value="watchlist" className="mt-0 space-y-3">
                  <WatchlistTable />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* AI Analysis & Chat Components */}
        {currentSymbol && (
          <>
            <HighlightToChat 
              onHighlightAnalyze={handleHighlightAnalyze} 
              activeTab={activeTab}
            />
            <AnalysisPopup
              isOpen={isAnalysisOpen}
              onClose={() => setIsAnalysisOpen(false)}
              selectedMetric={analysisData.metric}
              context={analysisData.context}
              symbol={currentSymbol}
              financialData={analysisData}
              onOpenChat={handleOpenChatFromAnalysis}
            />
            <AnalystCopilot
              symbol={currentSymbol}
              companyName={resolvedCompanyName}
              financialData={analysisData}
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              initialQuery={highlightQuery}
              onQueryProcessed={() => setHighlightQuery('')}
            />
          </>
        )}
      </div>
    </>
  );
}
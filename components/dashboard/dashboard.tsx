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
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Building2,
  TrendingUp,
  Calculator,
  CreditCard,
  DollarSign,
  FileText,
  Newspaper,
  Lightbulb,
  Eye,
  BarChart3,
  Target,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const tabConfig = [
  { 
    id: "company-snapshot", 
    label: "Company Overview", 
    icon: Building2,
    description: "Key metrics and company information"
  },
  { 
    id: "historical-financials", 
    label: "Historical Financials", 
    icon: BarChart3,
    description: "Financial statements and trends"
  },
  { 
    id: "competitor-analysis", 
    label: "Peer Comparison", 
    icon: TrendingUp,
    description: "Competitive analysis and benchmarking"
  },
  { 
    id: "dcf-analysis", 
    label: "DCF Analysis", 
    icon: Calculator,
    description: "Discounted cash flow valuation"
  },
  { 
    id: "lbo-analysis", 
    label: "LBO Analysis", 
    icon: Target,
    description: "Leveraged buyout modeling"
  },
  { 
    id: "recent-news", 
    label: "Recent News", 
    icon: Newspaper,
    description: "Latest news and updates"
  },
  { 
    id: "sec-filings", 
    label: "SEC Filings & Transcripts", 
    icon: FileText,
    description: "Regulatory filings and earnings calls"
  },
  { 
    id: "idea-generation", 
    label: "Idea Generation", 
    icon: Lightbulb,
    description: "AI-powered investment ideas"
  },
  { 
    id: "watchlist", 
    label: "Watchlist", 
    icon: Eye,
    description: "Your tracked companies"
  },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("company-snapshot");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [highlightQuery, setHighlightQuery] = useState('');
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState({ metric: '', context: '' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentSymbol = useSearchStore((state) => state.currentSymbol);

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

  const activeTabConfig = tabConfig.find(tab => tab.id === activeTab);

  if (!currentSymbol) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-mobile">
        <h2 className="text-mobile-lg font-semibold mb-2">Welcome to FinHubIQ</h2>
        <p className="text-muted-foreground mb-6 text-mobile-sm">
          Search for a company above to view detailed financial analysis
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" asChild className="touch-target">
            <Link href="/financials-layouts">View Financials Layout Concepts</Link>
          </Button>
          <Button variant="outline" asChild className="touch-target">
            <Link href="/dashboard-layouts">View Dashboard Layout Options</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div data-dashboard className="px-mobile space-y-mobile">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile Tab Navigation */}
          <div className="sm:hidden mb-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between touch-target glass-effect orange-accent-hover btn-premium"
                >
                  <div className="flex items-center gap-2">
                    {activeTabConfig && (
                      <>
                        <activeTabConfig.icon className="h-4 w-4" />
                        <span className="font-medium">{activeTabConfig.label}</span>
                      </>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="bottom-sheet safe-bottom">
                <SheetHeader>
                  <SheetTitle>Select Analysis View</SheetTitle>
                  <SheetDescription>
                    Choose a financial analysis section
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto py-2">
                  {tabConfig.map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 touch-target",
                        activeTab === tab.id && "bg-[hsl(var(--finhub-orange))]/10 text-[hsl(var(--finhub-orange))] border-[hsl(var(--finhub-orange))]/20"
                      )}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <tab.icon className={cn(
                        "h-5 w-5",
                        activeTab === tab.id && "text-[hsl(var(--finhub-orange))]"
                      )} />
                      <div className="text-left flex-1">
                        <div className="font-medium">{tab.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {tab.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Tab Navigation */}
          <TabsList className="hidden sm:grid w-full h-auto p-1 bg-muted/30 backdrop-blur rounded-xl grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-1">
            {tabConfig.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-[hsl(var(--finhub-orange))]/10 data-[state=active]:text-[hsl(var(--finhub-orange))] data-[state=active]:border-[hsl(var(--finhub-orange))]/20 border border-transparent transition-all duration-200"
              >
                <div className="flex items-center gap-2 py-1">
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden lg:inline text-sm">{tab.label}</span>
                  <span className="lg:hidden text-xs">{tab.label.split(' ')[0]}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          <div className="animate-scale-in">
            <TabsContent value="company-snapshot" className="mt-4 space-y-mobile">
              <CompanyOverview />
            </TabsContent>
            <TabsContent value="historical-financials" className="mt-4 space-y-mobile">
              <HistoricalFinancials />
            </TabsContent>
            <TabsContent value="competitor-analysis" className="mt-4 space-y-mobile">
              <CompetitorAnalysis />
            </TabsContent>
            <TabsContent value="dcf-analysis" className="mt-4 space-y-mobile">
              <DCFAnalysis symbol={currentSymbol} />
            </TabsContent>
            <TabsContent value="lbo-analysis" className="mt-4 space-y-mobile">
              <LBOAnalysis symbol={currentSymbol} />
            </TabsContent>
            <TabsContent value="recent-news" className="mt-4 space-y-mobile">
              <RecentNews />
            </TabsContent>
            <TabsContent value="sec-filings" className="mt-4 space-y-mobile">
              <SECFilingsTranscripts ticker={currentSymbol} />
            </TabsContent>
            <TabsContent value="idea-generation" className="mt-4 space-y-mobile">
              <IdeaGeneration />
            </TabsContent>
            <TabsContent value="watchlist" className="mt-4 space-y-mobile">
              <WatchlistTable />
            </TabsContent>
          </div>
        </Tabs>

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
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyOverview } from "@/components/dashboard/tabs/company-overview";
import { HistoricalFinancials } from "@/components/dashboard/tabs/historical-financials";
import CreditAnalysis from "@/components/dashboard/tabs/credit-analysis";
import { CompetitorAnalysis } from "@/components/dashboard/tabs/competitor-analysis";
import { DCFAnalysis } from "@/components/dashboard/tabs/dcf-analysis";
import { LBOAnalysis } from "@/components/dashboard/tabs/lbo-analysis";
import { ValuationConsiderations } from "@/components/dashboard/tabs/valuation-considerations";
import { RecentNews } from "@/components/dashboard/tabs/recent-news";
import IdeaGeneration from "@/components/dashboard/tabs/idea-generation";
import { WatchlistTable } from "@/components/dashboard/tabs/watchlist-table";
import SECFilingsTranscripts from "@/components/dashboard/tabs/sec-filings-transcripts";
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
  BarChart3, 
  FileText, 
  TrendingUp, 
  Calculator, 
  Building2, 
  Newspaper, 
  Brain, 
  Eye, 
  BookOpen,
  ChevronDown,
  DollarSign,
  CreditCard,
  Target
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Tab configuration with icons and descriptions
const tabData = [
  { 
    id: "company-snapshot", 
    label: "Company Snapshot", 
    shortLabel: "Overview", 
    icon: Building2,
    description: "Key metrics and company overview"
  },
  { 
    id: "historical-financials", 
    label: "Historical Financials", 
    shortLabel: "Financials", 
    icon: BarChart3,
    description: "Financial statements and trends"
  },
  { 
    id: "competitor-analysis", 
    label: "Competitor Analysis", 
    shortLabel: "Competitors", 
    icon: TrendingUp,
    description: "Peer comparison and market position"
  },
  { 
    id: "dcf-analysis", 
    label: "DCF Analysis", 
    shortLabel: "DCF", 
    icon: Calculator,
    description: "Discounted cash flow valuation"
  },
  { 
    id: "lbo-analysis", 
    label: "LBO Analysis", 
    shortLabel: "LBO", 
    icon: Target,
    description: "Leveraged buyout modeling"
  },
  { 
    id: "credit-analysis", 
    label: "Credit Analysis", 
    shortLabel: "Credit", 
    icon: CreditCard,
    description: "Credit risk and debt analysis"
  },
  { 
    id: "valuation-considerations", 
    label: "Valuation Considerations", 
    shortLabel: "Valuation", 
    icon: DollarSign,
    description: "Valuation metrics and multiples"
  },
  { 
    id: "recent-news", 
    label: "Recent News", 
    shortLabel: "News", 
    icon: Newspaper,
    description: "Latest news and updates"
  },
  { 
    id: "idea-generation", 
    label: "Idea Generation", 
    shortLabel: "Ideas", 
    icon: Brain,
    description: "AI-powered investment insights"
  },
  { 
    id: "my-watchlist", 
    label: "My Watchlist", 
    shortLabel: "Watchlist", 
    icon: Eye,
    description: "Track your favorite stocks"
  },
  { 
    id: "filings-transcripts", 
    label: "Filings & Transcripts", 
    shortLabel: "Filings", 
    icon: BookOpen,
    description: "SEC filings and earnings calls"
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

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  if (!currentSymbol) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4 animate-fade-in">
        <h2 className="text-2xl font-semibold mb-2">Welcome to FinHubIQ</h2>
        <p className="text-muted-foreground mb-6">
          Search for a company above to view detailed financial analysis
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" asChild>
            <Link href="/financials-layouts">View Financials Layout Concepts</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard-layouts">View Dashboard Layout Options</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div data-dashboard className="pb-20 md:pb-0">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Desktop Tab Navigation */}
        <div className="hidden md:block">
          <TabsList className="w-full h-auto p-0 bg-transparent mb-6">
            <div className="w-full overflow-x-auto scrollbar-hide">
              <div className="flex gap-1 p-1.5 min-w-max bg-muted/50 rounded-lg backdrop-blur-sm">
                {tabData.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5",
                      "text-sm font-medium whitespace-nowrap",
                      "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                      "hover:bg-background/50 transition-all duration-200",
                      "data-[state=active]:text-finhub-orange"
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </TabsTrigger>
                ))}
              </div>
            </div>
          </TabsList>
        </div>

        {/* Mobile Tab Navigation - Bottom Sheet */}
        <div className="md:hidden mb-4">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between h-12 px-4 bg-background/50 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2">
                  {tabData.find(tab => tab.id === activeTab)?.icon && (
                    <>{(() => {
                      const Icon = tabData.find(tab => tab.id === activeTab)!.icon;
                      return <Icon className="h-4 w-4 text-finhub-orange" />;
                    })()}</>
                  )}
                  <span className="font-medium">{tabData.find(tab => tab.id === activeTab)?.label}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
              <SheetHeader className="pb-4">
                <SheetTitle>Select Analysis View</SheetTitle>
              </SheetHeader>
              <div className="space-y-1 overflow-y-auto pb-safe">
                {tabData.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "secondary" : "ghost"}
                    className="w-full justify-start h-16 px-4 group"
                    onClick={() => handleTabChange(tab.id)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        activeTab === tab.id ? "bg-finhub-orange/10 text-finhub-orange" : "bg-muted"
                      )}>
                        <tab.icon className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col items-start text-left">
                        <span className="font-medium text-base">{tab.label}</span>
                        <span className="text-xs text-muted-foreground">{tab.description}</span>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Tab Content with mobile optimizations */}
        <div className="px-4 md:px-0 animate-fade-in">
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

          <TabsContent value="credit-analysis" className="mt-0 space-y-4">
            <CreditAnalysis />
          </TabsContent>

          <TabsContent value="valuation-considerations" className="mt-0 space-y-4">
            <ValuationConsiderations />
          </TabsContent>

          <TabsContent value="recent-news" className="mt-0 space-y-4">
            <RecentNews />
          </TabsContent>

          <TabsContent value="idea-generation" className="mt-0 space-y-4">
            <IdeaGeneration />
          </TabsContent>

          <TabsContent value="my-watchlist" className="mt-0 space-y-4">
            <WatchlistTable />
          </TabsContent>

          <TabsContent value="filings-transcripts" className="mt-0 space-y-4">
            <SECFilingsTranscripts ticker={currentSymbol} />
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
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyOverview } from "@/components/dashboard/tabs/company-overview";
import { HistoricalFinancials } from "@/components/dashboard/tabs/historical-financials";
import CreditAnalysis from "@/components/dashboard/tabs/credit-analysis";
import { CompetitorAnalysis } from "@/components/dashboard/tabs/competitor-analysis";
import { DCFAnalysis } from "@/components/dashboard/tabs/dcf-analysis";
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

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("company-snapshot");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [highlightQuery, setHighlightQuery] = useState('');
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState({ metric: '', context: '' });
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
    secFilings: secFilings?.slice(0, 20) || [], // Recent SEC filings
    earningsTranscriptDates: earningsTranscriptDates?.slice(0, 8) || [], // Recent earnings call dates
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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-2xl font-semibold mb-2">Welcome to FinHubIQ</h2>
        <p className="text-muted-foreground mb-6">
          Search for a company above to view detailed financial analysis
        </p>
        <div className="flex gap-4">
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
    <div data-dashboard>
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="w-full justify-start overflow-x-auto py-2 px-0 h-auto bg-transparent scrollbar-hide flex-nowrap">
        <TabsTrigger 
          value="company-snapshot"
          className="data-[state=active]:border-finhub-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 md:px-3 md:px-4 py-2 border-b-2 border-transparent rounded-none transition-all whitespace-nowrap text-sm md:text-base whitespace-nowrap text-sm md:text-base"
        >
          Company Overview
        </TabsTrigger>
                  <TabsTrigger 
            value="historical-financials"
            className="data-[state=active]:border-finhub-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 md:px-4 py-2 border-b-2 border-transparent rounded-none transition-all whitespace-nowrap text-sm md:text-base"
          >
            Historical Financials
          </TabsTrigger>
          <TabsTrigger 
            value="competitor-analysis"
            className="data-[state=active]:border-finhub-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 md:px-4 py-2 border-b-2 border-transparent rounded-none transition-all whitespace-nowrap text-sm md:text-base"
          >
            Competitor Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="dcf-analysis"
            className="data-[state=active]:border-finhub-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 md:px-4 py-2 border-b-2 border-transparent rounded-none transition-all whitespace-nowrap text-sm md:text-base"
          >
            DCF Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="credit-analysis"
            className="data-[state=active]:border-finhub-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 md:px-4 py-2 border-b-2 border-transparent rounded-none transition-all whitespace-nowrap text-sm md:text-base"
          >
            Credit Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="valuation-considerations"
            className="data-[state=active]:border-finhub-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 md:px-4 py-2 border-b-2 border-transparent rounded-none transition-all whitespace-nowrap text-sm md:text-base"
          >
            Valuation Considerations
          </TabsTrigger>
          <TabsTrigger 
            value="recent-news"
            className="data-[state=active]:border-finhub-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 md:px-4 py-2 border-b-2 border-transparent rounded-none transition-all whitespace-nowrap text-sm md:text-base"
          >
            Recent News
          </TabsTrigger>
          <TabsTrigger 
            value="sec-filings"
            className="data-[state=active]:border-finhub-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 md:px-4 py-2 border-b-2 border-transparent rounded-none transition-all whitespace-nowrap text-sm md:text-base"
          >
            SEC Filings & Transcripts
          </TabsTrigger>
          <TabsTrigger 
            value="idea-generation"
            className="data-[state=active]:border-finhub-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 md:px-4 py-2 border-b-2 border-transparent rounded-none transition-all whitespace-nowrap text-sm md:text-base"
          >
            Idea Generation
          </TabsTrigger>
          <TabsTrigger 
            value="watchlist"
            className="data-[state=active]:border-finhub-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 md:px-4 py-2 border-b-2 border-transparent rounded-none transition-all whitespace-nowrap text-sm md:text-base"
          >
          Watchlist
        </TabsTrigger>
      </TabsList>
      <TabsContent value="company-snapshot" className="space-y-4 mt-4">
        <CompanyOverview />
      </TabsContent>
      <TabsContent value="historical-financials" className="space-y-4 mt-4">
        <HistoricalFinancials />
      </TabsContent>
      <TabsContent value="competitor-analysis" className="space-y-4 mt-4">
        <CompetitorAnalysis />
      </TabsContent>
      <TabsContent value="dcf-analysis" className="space-y-4 mt-4">
        <DCFAnalysis symbol={currentSymbol} />
      </TabsContent>
      <TabsContent value="credit-analysis" className="space-y-4 mt-4">
        <CreditAnalysis />
      </TabsContent>
      <TabsContent value="valuation-considerations" className="space-y-4 mt-4">
        <ValuationConsiderations />
      </TabsContent>
      <TabsContent value="recent-news" className="space-y-4 mt-4">
        <RecentNews />
      </TabsContent>
      <TabsContent value="sec-filings" className="space-y-4 mt-4">
        <SECFilingsTranscripts ticker={currentSymbol} />
      </TabsContent>
      <TabsContent value="idea-generation" className="space-y-4 mt-4">
        <IdeaGeneration />
      </TabsContent>
      <TabsContent value="watchlist" className="space-y-4 mt-4">
        <WatchlistTable />
      </TabsContent>
    </Tabs>
    
    {/* AI Analysis & Chat Components */}
    {currentSymbol && (
      <>
        <HighlightToChat onHighlightAnalyze={handleHighlightAnalyze} />
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
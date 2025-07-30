"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanySnapshot } from "@/components/dashboard/tabs/company-snapshot";
import { HistoricalFinancials } from "@/components/dashboard/tabs/historical-financials";
import { CompetitorAnalysis } from "@/components/dashboard/tabs/competitor-analysis";
import { ValuationConsiderations } from "@/components/dashboard/tabs/valuation-considerations";
import { RecentNews } from "@/components/dashboard/tabs/recent-news";
import { ScreeningTool } from "@/components/dashboard/tabs/screening-tool";
import { WatchlistTable } from "@/components/dashboard/tabs/watchlist-table";
import { useSearchStore } from "@/lib/store/search-store";
import { FinancialChat } from "@/components/ui/financial-chat";
import { ChatFAB } from "@/components/ui/chat-fab";
import { useIncomeStatements, useCashFlows, useBalanceSheets } from "@/lib/api/financial";
import useSWR from "swr";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("company-snapshot");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const currentSymbol = useSearchStore((state) => state.currentSymbol);

  // Fetch financial data for AI analysis
  const { statements: incomeStatements } = useIncomeStatements(currentSymbol || '');
  const { statements: cashFlows } = useCashFlows(currentSymbol || '');
  const { statements: balanceSheets } = useBalanceSheets(currentSymbol || '');

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
  };

  if (!currentSymbol) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-2xl font-semibold mb-2">Welcome to FinHubIQ</h2>
        <p className="text-muted-foreground">
          Search for a company above to view detailed financial analysis
        </p>
      </div>
    );
  }

  return (
    <>
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="w-full justify-start overflow-x-auto py-2 px-0 h-auto bg-transparent">
        <TabsTrigger 
          value="company-snapshot"
          className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 border-b-2 border-transparent rounded-none transition-all"
        >
          Company Snapshot
        </TabsTrigger>
        <TabsTrigger 
          value="historical-financials"
          className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 border-b-2 border-transparent rounded-none transition-all"
        >
          Historical Financials
        </TabsTrigger>
        <TabsTrigger 
          value="competitor-analysis"
          className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 border-b-2 border-transparent rounded-none transition-all"
        >
          Competitor Analysis
        </TabsTrigger>
        <TabsTrigger 
          value="valuation-considerations"
          className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 border-b-2 border-transparent rounded-none transition-all"
        >
          Valuation Considerations
        </TabsTrigger>
        <TabsTrigger 
          value="recent-news"
          className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 border-b-2 border-transparent rounded-none transition-all"
        >
          Recent News
        </TabsTrigger>
        <TabsTrigger 
          value="screening-tool"
          className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 border-b-2 border-transparent rounded-none transition-all"
        >
          Screening Tool
        </TabsTrigger>
        <TabsTrigger 
          value="watchlist"
          className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 border-b-2 border-transparent rounded-none transition-all"
        >
          Watchlist
        </TabsTrigger>
      </TabsList>
      <TabsContent value="company-snapshot" className="space-y-4 mt-4">
        <CompanySnapshot />
      </TabsContent>
      <TabsContent value="historical-financials" className="space-y-4 mt-4">
        <HistoricalFinancials />
      </TabsContent>
      <TabsContent value="competitor-analysis" className="space-y-4 mt-4">
        <CompetitorAnalysis />
      </TabsContent>
      <TabsContent value="valuation-considerations" className="space-y-4 mt-4">
        <ValuationConsiderations />
      </TabsContent>
      <TabsContent value="recent-news" className="space-y-4 mt-4">
        <RecentNews />
      </TabsContent>
      <TabsContent value="screening-tool" className="space-y-4 mt-4">
        <ScreeningTool />
      </TabsContent>
      <TabsContent value="watchlist" className="space-y-4 mt-4">
        <WatchlistTable />
      </TabsContent>
    </Tabs>
    
    {/* AI Chat Components */}
    {currentSymbol && (
      <>
        <ChatFAB onClick={() => setIsChatOpen(true)} />
        <FinancialChat
          symbol={currentSymbol}
          financialData={financialData}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </>
    )}
    </>
  );
}
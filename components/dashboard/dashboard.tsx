"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanySnapshot } from "@/components/dashboard/tabs/company-snapshot";
import { HistoricalFinancials } from "@/components/dashboard/tabs/historical-financials";
import { CompetitorAnalysis } from "@/components/dashboard/tabs/competitor-analysis";
import { ValuationConsiderations } from "@/components/dashboard/tabs/valuation-considerations";
import { RecentNews } from "@/components/dashboard/tabs/recent-news";
import { SentimentAnalysis } from "@/components/dashboard/tabs/sentiment-analysis";
import { ScreeningTool } from "@/components/dashboard/tabs/screening-tool";
import { useSearchStore } from "@/lib/store/search-store";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("company-snapshot");
  const currentSymbol = useSearchStore((state) => state.currentSymbol);

  // Reset to company snapshot when switching symbols
  useEffect(() => {
    setActiveTab("company-snapshot");
  }, [currentSymbol]);

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
          value="sentiment-analysis"
          className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 border-b-2 border-transparent rounded-none transition-all"
        >
          Sentiment Analysis
        </TabsTrigger>
        <TabsTrigger 
          value="screening-tool"
          className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 border-b-2 border-transparent rounded-none transition-all"
        >
          Screening Tool
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
      <TabsContent value="sentiment-analysis" className="space-y-4 mt-4">
        <SentimentAnalysis />
      </TabsContent>
      <TabsContent value="screening-tool" className="space-y-4 mt-4">
        <ScreeningTool />
      </TabsContent>
    </Tabs>
  );
}
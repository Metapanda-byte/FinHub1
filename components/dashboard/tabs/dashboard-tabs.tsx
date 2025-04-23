"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "./overview";
import { Financials } from "./financials";
import { ValuationConsiderations } from "./valuation-considerations";
import { RecentNews } from "./recent-news";
import { SentimentAnalysis } from "./sentiment-analysis";
import { ScreeningTool } from "./screening-tool";

export function DashboardTabs() {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="financials">Financials</TabsTrigger>
        <TabsTrigger value="valuation">Valuation</TabsTrigger>
        <TabsTrigger value="recent-news">Recent News</TabsTrigger>
        <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
        <TabsTrigger value="screening">Screening Tool</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Overview />
      </TabsContent>
      <TabsContent value="financials">
        <Financials />
      </TabsContent>
      <TabsContent value="valuation">
        <ValuationConsiderations />
      </TabsContent>
      <TabsContent value="recent-news">
        <RecentNews />
      </TabsContent>
      <TabsContent value="sentiment">
        <SentimentAnalysis />
      </TabsContent>
      <TabsContent value="screening">
        <ScreeningTool />
      </TabsContent>
    </Tabs>
  );
} 
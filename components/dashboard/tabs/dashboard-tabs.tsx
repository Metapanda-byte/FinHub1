"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lazy, Suspense, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardLoadingSkeleton, ChartLoadingSkeleton, TableLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PDFExportButton } from "@/components/ui/pdf-export-button";
import { useSearchStore } from "@/lib/store/search-store";
import { FinancialChat } from "@/components/ui/financial-chat";
import { ChatFAB } from "@/components/ui/chat-fab";
import { useIncomeStatements, useCashFlows, useBalanceSheets } from "@/lib/api/financial";

// Lazy load tab components to improve initial load time
const Overview = lazy(() => import("./overview").then(m => ({ default: m.Overview })));
const Financials = lazy(() => import("./financials").then(m => ({ default: m.Financials })));
const CreditAnalysis = lazy(() => import("./credit-analysis"));
const ValuationConsiderations = lazy(() => import("./valuation-considerations").then(m => ({ default: m.ValuationConsiderations })));
const RecentNews = lazy(() => import("./recent-news").then(m => ({ default: m.RecentNews })));
const IdeaGeneration = lazy(() => import("./idea-generation"));
const CompetitorAnalysis = lazy(() => import("./competitor-analysis").then(m => ({ default: m.CompetitorAnalysis })));

// Tab-specific loading skeletons
function OverviewLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <ChartLoadingSkeleton />
        <ChartLoadingSkeleton />
      </div>
      <CardLoadingSkeleton />
    </div>
  );
}

function FinancialsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <CardLoadingSkeleton />
      <TableLoadingSkeleton rows={8} />
    </div>
  );
}

function ValuationLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <CardLoadingSkeleton />
      <div className="grid gap-4 md:grid-cols-2">
        <CardLoadingSkeleton />
        <CardLoadingSkeleton />
      </div>
    </div>
  );
}

function CompetitorsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <CardLoadingSkeleton />
      <TableLoadingSkeleton rows={6} />
    </div>
  );
}

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const currentSymbol = useSearchStore((state) => state.currentSymbol);

  // Fetch financial data for AI analysis
  const { statements: incomeStatements } = useIncomeStatements(currentSymbol || '');
  const { statements: cashFlows } = useCashFlows(currentSymbol || '');
  const { statements: balanceSheets } = useBalanceSheets(currentSymbol || '');

  // Prepare financial data for AI
  const financialData = {
    incomeStatements: incomeStatements?.slice(0, 5) || [],
    cashFlows: cashFlows?.slice(0, 5) || [],
    balanceSheets: balanceSheets?.slice(0, 5) || [],
  };

  // Map tab values to readable names for PDF filename
  const tabNames: Record<string, string> = {
    overview: "Company Overview",
    financials: "Financial Statements",
    valuation: "Valuation Analysis",
    competitors: "Competitor Analysis",
    "recent-news": "Recent News",
    screening: "Stock Screening"
  };

  // Create filename with symbol and tab name
  const pdfFilename = currentSymbol 
    ? `${currentSymbol}-${tabNames[activeTab] || activeTab}`
    : tabNames[activeTab] || activeTab;

  return (
    <>
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex items-center justify-between gap-4 mb-4">
        <TabsList className="grid grid-cols-7 flex-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="credit-analysis">Credit</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="idea-generation">Idea Generation</TabsTrigger>
          <TabsTrigger value="recent-news">Recent News</TabsTrigger>
        </TabsList>
        <PDFExportButton 
          targetId={`tab-content-${activeTab}`}
          filename={pdfFilename}
          buttonText="Export PDF"
          className="flex-shrink-0"
        />
      </div>
      
      <TabsContent value="overview">
        <div id="tab-content-overview">
          <Suspense fallback={<OverviewLoadingSkeleton />}>
            <Overview />
          </Suspense>
        </div>
      </TabsContent>
      
      <TabsContent value="financials">
        <div id="tab-content-financials">
          <Suspense fallback={<FinancialsLoadingSkeleton />}>
            <Financials />
          </Suspense>
        </div>
      </TabsContent>
      
      <TabsContent value="credit-analysis">
        <div id="tab-content-credit-analysis">
          <Suspense fallback={<FinancialsLoadingSkeleton />}>
            <CreditAnalysis />
          </Suspense>
        </div>
      </TabsContent>
      
      <TabsContent value="valuation">
        <div id="tab-content-valuation">
          <Suspense fallback={<ValuationLoadingSkeleton />}>
            <ValuationConsiderations />
          </Suspense>
        </div>
      </TabsContent>
      
      <TabsContent value="recent-news">
        <div id="tab-content-recent-news">
          <Suspense fallback={<CardLoadingSkeleton />}>
            <RecentNews />
          </Suspense>
        </div>
      </TabsContent>
      
      <TabsContent value="idea-generation">
        <div id="tab-content-idea-generation">
          <Suspense fallback={<CardLoadingSkeleton />}>
            <IdeaGeneration />
          </Suspense>
        </div>
      </TabsContent>
      
      <TabsContent value="competitors">
        <div id="tab-content-competitors">
          <Suspense fallback={<CompetitorsLoadingSkeleton />}>
            <CompetitorAnalysis />
          </Suspense>
        </div>
      </TabsContent>
    </Tabs>
    
    {/* AI Chat Components */}
    <ChatFAB onClick={() => setIsChatOpen(true)} />
    <FinancialChat
      symbol={currentSymbol}
      financialData={financialData}
      isOpen={isChatOpen}
      onClose={() => setIsChatOpen(false)}
    />
    </>
  );
} 
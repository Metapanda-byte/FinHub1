"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lazy, Suspense, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardLoadingSkeleton, ChartLoadingSkeleton, TableLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { CrunchingNumbersCard } from "@/components/ui/crunching-numbers-loader";
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
const ScreeningTool = lazy(() => import("./screening-tool").then(m => ({ default: m.ScreeningTool })));

// Tab-specific loading skeletons
function OverviewLoadingSkeleton() {
  return <CrunchingNumbersCard message="Crunching the numbers" />;
}

function FinancialsLoadingSkeleton() {
  return <CrunchingNumbersCard message="Crunching the numbers" />;
}

function ValuationLoadingSkeleton() {
  return <CrunchingNumbersCard message="Crunching the numbers" />;
}

function PeerComparisonLoadingSkeleton() {
  return <CrunchingNumbersCard message="Crunching the numbers" />;
}

function ScreeningLoadingSkeleton() {
  return <CrunchingNumbersCard message="Loading screening data" />;
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
    <div className="mobile-optimized container">
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex flex-col gap-4 mb-4">
        {/* Mobile-first tab navigation */}
        <div className="flex items-center justify-between w-full">
          <div className="flex-1 overflow-hidden">
            <TabsList className="mobile-tabs w-full bg-transparent border-b border-border px-0 py-0 h-auto justify-start rounded-none">
              <TabsTrigger value="overview" className="mobile-tab touch-friendly rounded-none bg-transparent hover:bg-accent/50 text-responsive font-medium data-[state=active]:border-finhub-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none">Overview</TabsTrigger>
              <TabsTrigger value="financials" className="mobile-tab touch-friendly rounded-none bg-transparent hover:bg-accent/50 text-responsive font-medium data-[state=active]:border-finhub-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none">Financials</TabsTrigger>
              <TabsTrigger value="credit-analysis" className="mobile-tab touch-friendly rounded-none bg-transparent hover:bg-accent/50 text-responsive font-medium data-[state=active]:border-finhub-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none">Credit</TabsTrigger>
              <TabsTrigger value="valuation" className="mobile-tab touch-friendly rounded-none bg-transparent hover:bg-accent/50 text-responsive font-medium data-[state=active]:border-finhub-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none">Valuation</TabsTrigger>
              <TabsTrigger value="competitors" className="mobile-tab touch-friendly rounded-none bg-transparent hover:bg-accent/50 text-responsive font-medium data-[state=active]:border-finhub-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none">Competitors</TabsTrigger>
              <TabsTrigger value="idea-generation" className="mobile-tab touch-friendly rounded-none bg-transparent hover:bg-accent/50 text-responsive font-medium data-[state=active]:border-finhub-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none">Ideas</TabsTrigger>
              <TabsTrigger value="recent-news" className="mobile-tab touch-friendly rounded-none bg-transparent hover:bg-accent/50 text-responsive font-medium data-[state=active]:border-finhub-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none">News</TabsTrigger>
              <TabsTrigger value="screening" className="mobile-tab touch-friendly rounded-none bg-transparent hover:bg-accent/50 text-responsive font-medium data-[state=active]:border-finhub-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none">Screening</TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-shrink-0 ml-4">
            <PDFExportButton 
              targetId={`tab-content-${activeTab}`}
              filename={pdfFilename}
              buttonText="Export PDF"
              className="hidden sm:inline-flex"
            />
            <PDFExportButton 
              targetId={`tab-content-${activeTab}`}
              filename={pdfFilename}
              buttonText="PDF"
              className="sm:hidden"
            />
          </div>
        </div>
      </div>
      
      <TabsContent value="overview" className="space-y-responsive mobile-card">
        <div id="tab-content-overview">
          <Suspense fallback={<OverviewLoadingSkeleton />}>
            <Overview />
          </Suspense>
        </div>
      </TabsContent>
      
      <TabsContent value="financials" className="space-y-responsive mobile-card">
        <div id="tab-content-financials">
          <Suspense fallback={<FinancialsLoadingSkeleton />}>
            <Financials />
          </Suspense>
        </div>
      </TabsContent>
      
      <TabsContent value="credit-analysis" className="space-y-responsive mobile-card">
        <div id="tab-content-credit-analysis">
          <Suspense fallback={<FinancialsLoadingSkeleton />}>
            <CreditAnalysis />
          </Suspense>
        </div>
      </TabsContent>
      
      <TabsContent value="valuation" className="space-y-responsive mobile-card">
        <div id="tab-content-valuation">
          <Suspense fallback={<ValuationLoadingSkeleton />}>
            <ValuationConsiderations />
          </Suspense>
        </div>
      </TabsContent>
      
      <TabsContent value="recent-news" className="space-y-responsive mobile-card">
        <div id="tab-content-recent-news">
          <Suspense fallback={<CardLoadingSkeleton />}>
            <RecentNews />
          </Suspense>
        </div>
      </TabsContent>
      
      <TabsContent value="idea-generation" className="space-y-responsive mobile-card">
        <div id="tab-content-idea-generation">
          <Suspense fallback={<CardLoadingSkeleton />}>
            <IdeaGeneration />
          </Suspense>
        </div>
      </TabsContent>
      
      <TabsContent value="competitors" className="space-y-responsive mobile-card">
        <div id="tab-content-competitors">
          <Suspense fallback={<PeerComparisonLoadingSkeleton />}>
            <CompetitorAnalysis />
          </Suspense>
        </div>
      </TabsContent>

      <TabsContent value="screening" className="space-y-responsive mobile-card">
        <div id="tab-content-screening">
          <Suspense fallback={<ScreeningLoadingSkeleton />}>
            <ScreeningTool />
          </Suspense>
        </div>
      </TabsContent>
    </Tabs>
    </div>
    
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
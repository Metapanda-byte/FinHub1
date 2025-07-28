"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lazy, Suspense, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardLoadingSkeleton, ChartLoadingSkeleton, TableLoadingSkeleton } from "@/components/ui/loading-skeleton";

// Lazy load tab components to improve initial load time
const Overview = lazy(() => import("./overview").then(m => ({ default: m.Overview })));
const Financials = lazy(() => import("./financials").then(m => ({ default: m.Financials })));
const ValuationConsiderations = lazy(() => import("./valuation-considerations").then(m => ({ default: m.ValuationConsiderations })));
const RecentNews = lazy(() => import("./recent-news").then(m => ({ default: m.RecentNews })));
const ScreeningTool = lazy(() => import("./screening-tool").then(m => ({ default: m.ScreeningTool })));
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

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="financials">Financials</TabsTrigger>
        <TabsTrigger value="valuation">Valuation</TabsTrigger>
        <TabsTrigger value="competitors">Competitors</TabsTrigger>
        <TabsTrigger value="recent-news">Recent News</TabsTrigger>
        <TabsTrigger value="screening">Screening Tool</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <Suspense fallback={<OverviewLoadingSkeleton />}>
          <Overview />
        </Suspense>
      </TabsContent>
      
      <TabsContent value="financials">
        <Suspense fallback={<FinancialsLoadingSkeleton />}>
          <Financials />
        </Suspense>
      </TabsContent>
      
      <TabsContent value="valuation">
        <Suspense fallback={<ValuationLoadingSkeleton />}>
          <ValuationConsiderations />
        </Suspense>
      </TabsContent>
      
      <TabsContent value="recent-news">
        <Suspense fallback={<CardLoadingSkeleton />}>
          <RecentNews />
        </Suspense>
      </TabsContent>
      
      <TabsContent value="screening">
        <Suspense fallback={<CardLoadingSkeleton />}>
          <ScreeningTool />
        </Suspense>
      </TabsContent>
      
      <TabsContent value="competitors">
        <Suspense fallback={<CompetitorsLoadingSkeleton />}>
          <CompetitorAnalysis />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
} 
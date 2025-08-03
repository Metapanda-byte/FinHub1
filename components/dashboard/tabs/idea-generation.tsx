"use client";

import React, { useState, lazy, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartLoadingSkeleton, TableLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { CrunchingNumbersCard } from "@/components/ui/crunching-numbers-loader";
import { Lightbulb, Search, Brain, TrendingUp } from "lucide-react";

// Lazy load sub-components
const ScreeningTool = lazy(() => import("./screening-tool").then(m => ({ default: m.ScreeningTool })));
const AIAssistedIdeaGeneration = lazy(() => import("./ai-assisted-idea-generation"));

// Sub-tab loading skeletons
function ScreeningLoadingSkeleton() {
  return <CrunchingNumbersCard message="Crunching the numbers" />;
}

function AIIdeaLoadingSkeleton() {
  return <CrunchingNumbersCard message="Crunching the numbers" />;
}

export default function IdeaGeneration() {
  const [activeSubTab, setActiveSubTab] = useState("screening");

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Investment Idea Generation
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Discover investment opportunities through screening and AI-powered analysis
          </p>
        </CardHeader>
      </Card>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="screening" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Screening Tool
          </TabsTrigger>
          <TabsTrigger value="ai-ideas" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Assisted Ideas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="screening" className="mt-6">
          <Suspense fallback={<ScreeningLoadingSkeleton />}>
            <ScreeningTool />
          </Suspense>
        </TabsContent>

        <TabsContent value="ai-ideas" className="mt-6">
          <Suspense fallback={<AIIdeaLoadingSkeleton />}>
            <AIAssistedIdeaGeneration />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
"use client";

import { Dashboard } from "@/components/dashboard/dashboard";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-4 md:py-6 space-y-6 animate-fade-in">
        {/* Header Section */}
        <div className="px-4 md:px-0 space-y-2">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Financial Dashboard
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
            Comprehensive financial analysis and AI-powered insights for smarter investment decisions
          </p>
        </div>
        
        {/* Dashboard Component with Loading State */}
        <Suspense fallback={<DashboardSkeleton />}>
          <Dashboard />
        </Suspense>
      </div>
    </div>
  );
}

// Skeleton loading state for dashboard
function DashboardSkeleton() {
  return (
    <div className="px-4 md:px-0 space-y-6">
      {/* Tab Navigation Skeleton */}
      <div className="md:hidden">
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="hidden md:block">
        <div className="flex gap-2 p-1.5 bg-muted/50 rounded-lg">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-32" />
          ))}
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="grid gap-4 md:gap-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 md:h-32" />
          ))}
        </div>
        
        {/* Chart */}
        <Skeleton className="h-64 md:h-96" />
        
        {/* Table */}
        <div className="space-y-2">
          <Skeleton className="h-10" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </div>
    </div>
  );
}
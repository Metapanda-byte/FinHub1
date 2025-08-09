"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2 } from "lucide-react";

interface PreloadIndicatorProps {
  className?: string;
}

export function PreloadIndicator({ className }: PreloadIndicatorProps) {
  // Hard-disable UI rendering
  return null;
}
/*
Previous implementation kept for debugging if ever needed again.
export function PreloadIndicator({ className }: PreloadIndicatorProps) {
  const [isPreloading, setIsPreloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadedEndpoints, setLoadedEndpoints] = useState(0);
  const [totalEndpoints, setTotalEndpoints] = useState(0);
  const [currentPriority, setCurrentPriority] = useState<string>("");
  const [priorityBreakdown, setPriorityBreakdown] = useState<{
    overview: number;
    secondary: number;
    tertiary: number;
  } | null>(null);

  // Disable in production unless explicitly enabled
  const isProd = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
  const allowInProd = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SHOW_PRELOAD === '1';

  useEffect(() => {
    if (isProd && !allowInProd) return; // skip listeners entirely in production
    const handlePreloadStart = (event: CustomEvent) => {
      setIsPreloading(true);
      setProgress(0);
      setLoadedEndpoints(0);
      setTotalEndpoints(event.detail.totalEndpoints || 0);
      setPriorityBreakdown(event.detail.priorities || null);
      setCurrentPriority("overview");
    };

    const handlePreloadProgress = (event: CustomEvent) => {
      const { loaded, total, priority } = event.detail;
      setLoadedEndpoints(loaded);
      setTotalEndpoints(total);
      setProgress((loaded / total) * 100);
      setCurrentPriority(priority || "");
    };

    const handlePreloadComplete = () => {
      setProgress(100);
      setCurrentPriority("complete");
      setTimeout(() => {
        setIsPreloading(false);
        setProgress(0);
        setCurrentPriority("");
      }, 1500);
    };

    window.addEventListener('preloadStart' as any, handlePreloadStart);
    window.addEventListener('preloadProgress' as any, handlePreloadProgress);
    window.addEventListener('preloadComplete' as any, handlePreloadComplete);

    return () => {
      window.removeEventListener('preloadStart' as any, handlePreloadStart);
      window.removeEventListener('preloadProgress' as any, handlePreloadProgress);
      window.removeEventListener('preloadComplete' as any, handlePreloadComplete);
    };
  }, [isProd, allowInProd]);

  if ((isProd && !allowInProd) || !isPreloading) return null;

  const getPriorityLabel = () => {
    switch (currentPriority) {
      case 'overview':
        return 'Loading Overview tab...';
      case 'secondary':
        return 'Loading Financial data...';
      case 'tertiary':
        return 'Loading Additional data...';
      case 'complete':
        return 'All data loaded!';
      default:
        return 'Loading data...';
    }
  };

  const getPriorityColor = () => {
    switch (currentPriority) {
      case 'overview':
        return 'text-orange-500';
      case 'secondary':
        return 'text-blue-500';
      case 'tertiary':
        return 'text-purple-500';
      case 'complete':
        return 'text-green-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={cn(
      "fixed bottom-4 right-4 bg-background border rounded-lg shadow-lg p-4 w-80 z-50 animate-in slide-in-from-bottom-2",
      className
    )}>
      <div className="flex items-center gap-3 mb-2">
        {currentPriority === 'complete' ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
        )}
        <div className="flex-1">
          <p className={cn("text-sm font-medium", getPriorityColor())}>
            {getPriorityLabel()}
          </p>
          <p className="text-xs text-muted-foreground">
            {loadedEndpoints} of {totalEndpoints} resources
          </p>
        </div>
      </div>
      <Progress 
        value={progress} 
        className="h-2"
      />
      {priorityBreakdown && currentPriority !== 'complete' && (
        <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
          <span className={cn(
            currentPriority === 'overview' && 'text-orange-500 font-medium'
          )}>
            Overview: {priorityBreakdown.overview}
          </span>
          <span className={cn(
            currentPriority === 'secondary' && 'text-blue-500 font-medium'
          )}>
            Financials: {priorityBreakdown.secondary}
          </span>
          <span className={cn(
            currentPriority === 'tertiary' && 'text-purple-500 font-medium'
          )}>
            Additional: {priorityBreakdown.tertiary}
          </span>
        </div>
      )}
    </div>
  );
}
*/ 
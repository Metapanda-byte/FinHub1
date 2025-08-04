"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FinHubIQLogo } from "@/components/ui/finhubiq-logo";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface CrunchingNumbersLoaderProps {
  className?: string;
  message?: string;
}

// Wall Street-inspired loading messages
const LOADING_MESSAGES = [
  "Scanning for Alpha",
  "Crunching the numbers",
  "Analyzing market data",
  "Processing financial metrics",
  "Calculating valuations",
  "Reading the tape",
  "Parsing SEC filings",
  "Computing risk metrics",
  "Analyzing price action",
  "Evaluating fundamentals",
  "Assessing market sentiment",
  "Generating insights",
  "Mining financial data",
  "Optimizing portfolios",
  "Benchmarking performance",
  "Modeling scenarios",
  "Decoding market signals",
  "Quantifying opportunities",
  "Synthesizing intelligence",
  "Loading Wall Street wisdom"
];

export function CrunchingNumbersLoader({ 
  className, 
  message 
}: CrunchingNumbersLoaderProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayMessage, setDisplayMessage] = useState(
    message || LOADING_MESSAGES[0]
  );
  const { theme } = useTheme();

  useEffect(() => {
    if (message) {
      setDisplayMessage(message);
      return;
    }

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, [message]);

  useEffect(() => {
    if (!message) {
      setDisplayMessage(LOADING_MESSAGES[currentMessageIndex]);
    }
  }, [currentMessageIndex, message]);

  // Determine logo variant based on theme
  const logoVariant = theme === 'light' ? 'black' : 'icon';

  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      {/* Background Blur Animation */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/20 via-muted/10 to-muted/20 animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl animate-float" />
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl animate-float-delayed" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-3">
        {/* Animated Logo Icon Only - Theme Aware */}
        <div className="animate-bounce">
          <FinHubIQLogo 
            variant={logoVariant} 
            size="medium" 
            animated={true} 
            className="drop-shadow-sm" 
            showText={false}
          />
        </div>
        
        {/* Loading Text with Smooth Transitions */}
        <div className="flex flex-col items-center space-y-1">
          <div className="h-6 flex items-center">
            <span 
              key={displayMessage}
              className="text-sm font-medium text-muted-foreground animate-fade-in"
            >
              {displayMessage}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CrunchingNumbersCard({ 
  className,
  message 
}: CrunchingNumbersLoaderProps) {
  return (
    <Card className={cn("relative overflow-hidden border-muted/50 shadow-sm", className)}>
      <CardContent className="p-6">
        <CrunchingNumbersLoader message={message} />
      </CardContent>
    </Card>
  );
}

export function CrunchingNumbersCardWithHeader({ 
  className,
  title = "Loading...",
  message
}: CrunchingNumbersLoaderProps & { title?: string }) {
  const { theme } = useTheme();
  const logoVariant = theme === 'light' ? 'black' : 'icon';

  return (
    <Card className={cn("relative overflow-hidden border-muted/50 shadow-sm", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <FinHubIQLogo variant={logoVariant} size="small" animated={true} showText={false} />
          <span className="text-base font-semibold text-muted-foreground">{title}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CrunchingNumbersLoader message={message} />
      </CardContent>
    </Card>
  );
}

// New component for table data loading simulation
export function SkeletonTable({ 
  rows = 8, 
  columns = 6, 
  className 
}: { 
  rows?: number; 
  columns?: number; 
  className?: string; 
}) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 p-4 border-b bg-muted/30">
            {Array.from({ length: columns }).map((_, i) => (
              <div 
                key={`header-${i}`}
                className="h-4 bg-muted rounded animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          
          {/* Table Rows with Staggered Loading Animation */}
          <div className="space-y-1">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div 
                key={`row-${rowIndex}`}
                className={cn(
                  "grid grid-cols-6 gap-4 p-4 transition-all duration-500",
                  "bg-gradient-to-r from-muted/5 via-muted/20 to-muted/5",
                  "animate-shimmer"
                )}
                style={{ 
                  animationDelay: `${rowIndex * 0.2}s`,
                  filter: `blur(${Math.max(0, 3 - rowIndex * 0.3)}px)`
                }}
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <div 
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={cn(
                      "h-3 rounded animate-pulse",
                      colIndex === 0 ? "bg-foreground/20 w-3/4" : "bg-muted w-full",
                      colIndex === 1 ? "w-1/2" : "",
                      colIndex >= 2 ? "w-2/3" : ""
                    )}
                    style={{ animationDelay: `${(rowIndex * columns + colIndex) * 0.05}s` }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Loading Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/5 to-background/30 pointer-events-none" />
      </CardContent>
    </Card>
  );
} 
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FinHubIQLogo } from "@/components/ui/finhubiq-logo";
import { cn } from "@/lib/utils";

interface CrunchingNumbersLoaderProps {
  className?: string;
  message?: string;
}

export function CrunchingNumbersLoader({ 
  className, 
  message = "Crunching the numbers" 
}: CrunchingNumbersLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <div className="flex flex-col items-center space-y-4">
        {/* Animated FinHub Logo */}
        <div className="animate-pulse">
          <FinHubIQLogo variant="primary" size="large" animated={true} className="animate-bounce" />
        </div>
        
        {/* Loading Text */}
        <div className="flex items-center space-x-2">
          <span className="text-lg font-medium text-muted-foreground">
            {message}
          </span>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse animation-delay-200"></div>
            <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse animation-delay-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CrunchingNumbersCard({ 
  className,
  message = "Crunching the numbers"
}: CrunchingNumbersLoaderProps) {
  return (
    <Card className={className}>
      <CardContent className="p-8">
        <CrunchingNumbersLoader message={message} />
      </CardContent>
    </Card>
  );
}

export function CrunchingNumbersCardWithHeader({ 
  className,
  title = "Loading...",
  message = "Crunching the numbers"
}: CrunchingNumbersLoaderProps & { title?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <FinHubIQLogo variant="primary" size="small" animated={true} className="animate-pulse" />
          <span className="text-lg font-semibold">{title}</span>
        </div>
      </CardHeader>
      <CardContent>
        <CrunchingNumbersLoader message={message} />
      </CardContent>
    </Card>
  );
} 
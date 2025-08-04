import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CrunchingNumbersLoader, CrunchingNumbersCard, SkeletonTable } from "./crunching-numbers-loader";

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export function LoadingSkeleton({ className, lines = 3 }: LoadingSkeletonProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "h-4 bg-muted rounded",
              i === 0 && "w-3/4",
              i === 1 && "w-full", 
              i === 2 && "w-1/2"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function CardLoadingSkeleton() {
  return <CrunchingNumbersCard />;
}

export function ChartLoadingSkeleton() {
  return <CrunchingNumbersCard />;
}

export function TableLoadingSkeleton({ rows = 8 }: { rows?: number }) {
  return <SkeletonTable rows={rows} />;
}
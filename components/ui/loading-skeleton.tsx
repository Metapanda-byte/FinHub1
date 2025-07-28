import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-muted animate-pulse rounded mb-2"></div>
        <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
      </CardHeader>
      <CardContent>
        <LoadingSkeleton lines={4} />
      </CardContent>
    </Card>
  );
}

export function ChartLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-40 bg-muted animate-pulse rounded mb-2"></div>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-muted animate-pulse rounded mb-4"></div>
        <div className="flex justify-center">
          <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TableLoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-40 bg-muted animate-pulse rounded"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex space-x-4 pb-2 border-b">
            <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-28 bg-muted animate-pulse rounded"></div>
          </div>
          {/* Rows */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-28 bg-muted animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
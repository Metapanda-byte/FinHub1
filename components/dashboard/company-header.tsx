"use client";

import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlistStore } from "@/lib/store/watchlist-store";
import { useSearchStore } from "@/lib/store/search-store";
import { useCompanyProfile, useFinancialRatios, useKeyMetrics } from "@/lib/api/financial";
import { useStockQuote } from "@/lib/api/stock";
import { KeyMetricsPanel } from "@/components/ui/key-metrics-panel";
import { useMediaQuery } from "@/hooks/use-media-query";

interface CompanyHeaderProps {
  tagline: string;
  onOpenChat?: () => void;
}

export function CompanyHeader({ tagline, onOpenChat }: CompanyHeaderProps) {
  const { currentSymbol } = useSearchStore();
  const { hasStock, addStock, removeStock } = useWatchlistStore();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const { profile } = useCompanyProfile(currentSymbol || '');
  const { quote } = useStockQuote(currentSymbol || '');
  const { ratios } = useFinancialRatios(currentSymbol || '');
  const { metrics: keyMetrics } = useKeyMetrics(currentSymbol || '');

  const handleWatchlistToggle = () => {
    if (!currentSymbol) return;
    
    if (hasStock(currentSymbol)) {
      removeStock(currentSymbol);
    } else {
      addStock({ 
        symbol: currentSymbol, 
        name: currentSymbol, 
        lastPrice: 0, 
        change: 0, 
        changePercent: 0, 
        marketCap: 0, 
        peRatio: 0 
      });
    }
  };

  return (
    <div className="flex items-start justify-between">
      <div className={cn(
        "flex items-start",
        isMobile ? "gap-2" : "gap-3"
      )}>
        {/* Company Logo */}
        <div className={cn(
          "bg-muted/50 rounded-lg flex items-center justify-center flex-shrink-0",
          isMobile ? "w-8 h-8" : "w-10 h-10"
        )}>
          {profile?.image ? (
            <img
              src={profile.image}
              alt={`${profile?.companyName || currentSymbol} logo`}
              className={cn(
                "object-contain",
                isMobile ? "w-6 h-6" : "w-8 h-8"
              )}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={cn(
            "bg-primary/10 rounded flex items-center justify-center text-primary font-bold hidden",
            isMobile ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm"
          )}>
            {currentSymbol?.charAt(0) || '?'}
          </div>
        </div>
        
        {/* Company Name and Ticker */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className={cn(
              "font-bold",
              isMobile ? "text-sm" : "text-lg"
            )}>
              {profile?.companyName || 'Company'} ({currentSymbol})
            </h1>
            
            {/* Watchlist Star */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hover:bg-muted/60 transition-colors group",
                isMobile ? "h-6 w-6" : "h-8 w-8"
              )}
              onClick={handleWatchlistToggle}
              title={hasStock(currentSymbol || '') ? "Remove from watchlist" : "Add to watchlist"}
            >
              <Star className={cn(
                "transition-all duration-200",
                isMobile ? "h-3 w-3" : "h-4 w-4",
                hasStock(currentSymbol || '') 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-muted-foreground group-hover:text-foreground"
              )} />
            </Button>
          </div>
          
          <p className={cn(
            "text-muted-foreground",
            isMobile ? "text-[10px]" : "text-xs"
          )}>
            {tagline}
          </p>
        </div>
      </div>

      {/* Key Metrics Panel */}
      <KeyMetricsPanel
        symbol={currentSymbol || ''}
        profile={profile}
        quote={quote}
        keyMetrics={keyMetrics}
        ratios={ratios}
        className={isMobile ? "text-xs" : ""}
      />
    </div>
  );
} 
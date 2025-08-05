"use client";

import { Button } from "@/components/ui/button";
import { Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlistStore } from "@/lib/store/watchlist-store";
import { useSearchStore } from "@/lib/store/search-store";
import { useCompanyProfile, useFinancialRatios, useKeyMetrics } from "@/lib/api/financial";
import { useStockQuote } from "@/lib/api/stock";
import { KeyMetricsPanel } from "@/components/ui/key-metrics-panel";

interface CompanyHeaderProps {
  tagline: string;
  onOpenChat?: () => void;
}

export function CompanyHeader({ tagline, onOpenChat }: CompanyHeaderProps) {
  const { currentSymbol } = useSearchStore();
  const { hasStock, addStock, removeStock } = useWatchlistStore();
  
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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Company Logo */}
        <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center flex-shrink-0">
          {profile?.image ? (
            <img
              src={profile.image}
              alt={`${profile?.companyName || currentSymbol} logo`}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-primary font-bold text-sm hidden">
            {currentSymbol?.charAt(0) || '?'}
          </div>
        </div>
        
        {/* Company Name and Ticker */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold">
              {profile?.companyName || 'Company'} ({currentSymbol})
            </h1>
            <p className="text-xs text-muted-foreground">
              {tagline}
            </p>
          </div>
          
          {/* Watchlist Star */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted/60 transition-colors group -mt-1"
            onClick={handleWatchlistToggle}
            title={hasStock(currentSymbol || '') ? "Remove from watchlist" : "Add to watchlist"}
          >
            <Star className={cn(
              "h-4 w-4 transition-all duration-200",
              hasStock(currentSymbol || '') 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-muted-foreground group-hover:text-foreground"
            )} />
          </Button>
          
          {/* Analyst Co-pilot Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs font-medium bg-white hover:bg-gray-50 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 transition-colors"
            onClick={onOpenChat}
            title="Open AI Analyst Co-pilot"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Analyst Co-pilot
          </Button>
        </div>
      </div>

      {/* Key Metrics Panel */}
      <KeyMetricsPanel
        symbol={currentSymbol || ''}
        profile={profile}
        quote={quote}
        keyMetrics={keyMetrics}
        ratios={ratios}
      />
    </div>
  );
} 
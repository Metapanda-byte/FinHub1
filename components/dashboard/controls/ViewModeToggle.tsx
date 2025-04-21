"use client";

import { Button } from "@/components/ui/button";
import { useFinancialPeriodStore } from "@/lib/store/financial-period";

export function ViewModeToggle() {
  const { viewMode, setViewMode } = useFinancialPeriodStore();
  
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={viewMode === 'summary' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode('summary')}
      >
        Summary
      </Button>
      <Button
        variant={viewMode === 'detailed' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode('detailed')}
      >
        Detailed
      </Button>
    </div>
  );
}
"use client";

import { Button } from "@/components/ui/button";
import { useFinancialPeriodStore } from "@/lib/store/financial-period";

export function PeriodToggle() {
  const { period, setPeriod } = useFinancialPeriodStore();
  
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={period === 'annual' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setPeriod('annual')}
      >
        Annual
      </Button>
      <Button
        variant={period === 'quarterly' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setPeriod('quarterly')}
      >
        Quarterly
      </Button>
    </div>
  );
}
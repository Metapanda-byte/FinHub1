"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import { FinancialsScrollable } from "./financials-scrollable";
import { HistoricalFinancials } from "./historical-financials";

export function Financials() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <div className="space-y-6">
      {isMobile ? <FinancialsScrollable /> : <HistoricalFinancials />}
    </div>
  );
} 
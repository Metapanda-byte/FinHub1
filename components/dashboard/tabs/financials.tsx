"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import { FinancialsScrollable } from "./financials-scrollable";
import { HistoricalFinancials } from "./historical-financials";
import { useState, useEffect } from "react";

export function Financials() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div className="space-y-6"><HistoricalFinancials /></div>;
  }
  
  return (
    <div className="space-y-6">
      {isMobile ? <FinancialsScrollable /> : <HistoricalFinancials />}
    </div>
  );
} 
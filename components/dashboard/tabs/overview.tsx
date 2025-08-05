"use client";

import { CompanyOverview } from "./company-overview";
import { CompanyOverviewMobile } from "./company-overview-mobile";
import { useMediaQuery } from "@/hooks/use-media-query";

export function Overview() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <div className="space-y-6">
      {isMobile ? <CompanyOverviewMobile /> : <CompanyOverview />}
    </div>
  );
} 
"use client";

import { CompanyOverview } from "./company-overview";
import { CompanyOverviewMobile } from "./company-overview-mobile";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useState, useEffect } from "react";

export function Overview() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div className="space-y-6"><CompanyOverview /></div>;
  }
  
  return (
    <div className="space-y-6">
      {isMobile ? <CompanyOverviewMobile /> : <CompanyOverview />}
    </div>
  );
} 
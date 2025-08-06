"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { useSearchStore } from "@/lib/store/search-store";
import { useCompanyProfile, useIncomeStatements, useBalanceSheets } from "@/lib/api/financial";
import { formatFinancialNumber, formatPercentage } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { ValuationMetrics } from "@/components/stock/valuation-metrics";
import { ValuationAnalysis } from "@/components/stock/valuation-analysis";

const valuationMetrics = {
  "Market Cap": {
    description: "Total market value of a company's outstanding shares",
    formula: "Share Price × Total Shares Outstanding"
  },
  "Enterprise Value": {
    description: "Total value of a company, including debt and excluding cash",
    formula: "Market Cap + Total Debt - Cash & Equivalents"
  },
  "P/E Ratio": {
    description: "Price to Earnings ratio, comparing share price to earnings per share",
    formula: "Share Price / Earnings Per Share"
  },
  "EV/EBITDA": {
    description: "Enterprise Value to EBITDA, measuring company value relative to earnings",
    formula: "Enterprise Value / EBITDA"
  },
  "P/B Ratio": {
    description: "Price to Book ratio, comparing market value to book value",
    formula: "Share Price / Book Value Per Share"
  },
  "P/S Ratio": {
    description: "Price to Sales ratio, comparing market value to revenue",
    formula: "Share Price / Revenue Per Share"
  }
};

export function ValuationConsiderations() {
  const currentSymbol = useSearchStore((state) => state.currentSymbol);
  const symbol = currentSymbol || '';

  return (
    <div className="space-y-6">
      <ValuationMetrics symbol={symbol} />
      <ValuationAnalysis symbol={symbol} />
    </div>
  );
} 
"use client";

import { HistoricalFinancials } from "@/components/dashboard/tabs/historical-financials";

export default function TestHistoricalPage() {
  return (
    <div className="container py-6">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Historical Financials Test (AAPL)</h1>
        <p className="text-muted-foreground">Testing historical financials component directly</p>
      </div>
      <HistoricalFinancials />
    </div>
  );
} 
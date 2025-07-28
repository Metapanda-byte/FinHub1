"use client";

import { Dashboard } from "@/components/dashboard/dashboard";
import { useSearchStore } from "@/lib/store/search-store";
import { useEffect, useState } from "react";

export default function TestDashboardPage() {
  const { setCurrentSymbol, currentSymbol } = useSearchStore();
  const [isStoreUpdated, setIsStoreUpdated] = useState(false);
  
  // Set a default symbol for testing
  useEffect(() => {
    console.log('[TEST] Setting current symbol to AAPL');
    setCurrentSymbol("AAPL");
    setIsStoreUpdated(true);
  }, [setCurrentSymbol]);

  // Debug logging
  useEffect(() => {
    console.log('[TEST] Current symbol in store:', currentSymbol);
    console.log('[TEST] Is store updated:', isStoreUpdated);
  }, [currentSymbol, isStoreUpdated]);

  return (
    <div className="container py-6">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Test (AAPL)</h1>
        <p className="text-muted-foreground">Testing dashboard with pre-selected company</p>
        <div className="text-sm text-muted-foreground">
          <p><strong>Current Symbol in Store:</strong> {currentSymbol || "None"}</p>
          <p><strong>Store Updated:</strong> {isStoreUpdated ? "Yes" : "No"}</p>
        </div>
      </div>
      <Dashboard />
    </div>
  );
} 
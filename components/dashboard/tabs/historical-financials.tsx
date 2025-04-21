"use client";

import { useSearchStore } from "@/lib/store/search-store";
import { FinancialStatements } from "@/components/dashboard/financials/FinancialStatements";

export function HistoricalFinancials() {
  const currentSymbol = useSearchStore((state) => state.currentSymbol);

  if (!currentSymbol) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-2xl font-semibold mb-2">Select a Company</h2>
        <p className="text-muted-foreground">
          Search for a company above to view historical financial data
        </p>
      </div>
    );
  }

  return <FinancialStatements symbol={currentSymbol} />;
}
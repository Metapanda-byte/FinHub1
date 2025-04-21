"use client";

import { cn } from "@/lib/utils";
import { formatFinancialNumber } from "@/lib/utils/formatters";
import type { FinancialLineItem } from "@/lib/types/financial";

export function IncomeStatementLine({
  label,
  values,
  isExpense = false,
  isSubtotal = false,
  indentLevel = 0,
  showGrowth = true
}: FinancialLineItem) {
  // Calculate year-over-year growth if we have at least 2 values
  const current = values[0];
  const previous = values[1];
  const hasGrowth = showGrowth && values.length >= 2;
  const growthPercentage = hasGrowth && previous !== 0
    ? ((current - previous) / Math.abs(previous)) * 100
    : null;

  return (
    <tr className={cn(
      "border-b hover:bg-muted/50 transition-colors",
      isSubtotal && "font-medium bg-muted/5",
      isExpense && !isSubtotal && "text-muted-foreground"
    )}>
      <td className={cn(
        "py-3 px-4 text-sm whitespace-nowrap",
        indentLevel > 0 && `pl-${(indentLevel * 4) + 16}`
      )}>
        {label}
      </td>
      {values.map((value, index) => (
        <td 
          key={index} 
          className={cn(
            "text-right py-3 px-4 text-sm",
            isExpense && !isSubtotal && "text-red-600 dark:text-red-400"
          )}
        >
          {formatFinancialNumber(value, {
            parenthesesForNegative: isExpense || value < 0,
            unit: 'millions',
            decimals: 1
          })}
        </td>
      ))}
      {hasGrowth && (
        <td className={cn(
          "text-right py-3 px-4 text-sm",
          growthPercentage > 0 ? "text-green-600 dark:text-green-400" :
          growthPercentage < 0 ? "text-red-600 dark:text-red-400" :
          "text-muted-foreground"
        )}>
          {growthPercentage !== null 
            ? `${growthPercentage >= 0 ? '+' : ''}${growthPercentage.toFixed(1)}%` 
            : 'N/A'
          }
        </td>
      )}
    </tr>
  );
}
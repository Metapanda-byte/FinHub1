"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollableTableProps {
  columns: {
    key: string;
    header: string;
    accessor: (row: any) => React.ReactNode;
    align?: "left" | "center" | "right";
    sticky?: boolean;
    width?: string;
    minWidth?: string;
  }[];
  data: any[];
  className?: string;
}

export function ScrollableTableClean({
  columns,
  data,
  className,
}: ScrollableTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        setIsScrolled(scrollRef.current.scrollLeft > 0);
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const stickyColumn = columns.find(col => col.sticky);
  const scrollableColumns = columns.filter(col => !col.sticky);

  if (!stickyColumn) {
    // If no sticky column, render regular scrollable table
    return (
      <div className={cn("w-full overflow-x-auto", className)} ref={scrollRef}>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-sm font-medium",
                    column.align === "right" ? "text-right" : "text-left"
                  )}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-sm",
                      column.align === "right" ? "text-right" : "text-left"
                    )}
                  >
                    {column.accessor(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full mobile-table-container", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {/* Sticky header */}
            <th
              className={cn(
                "sticky left-0 z-20 bg-background px-4 py-3 text-sm font-medium text-left",
                isScrolled && "after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border"
              )}
              style={{ minWidth: stickyColumn.minWidth }}
            >
              {stickyColumn.header}
            </th>
            {/* Scrollable headers */}
            {scrollableColumns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-4 py-3 text-sm font-medium whitespace-nowrap",
                  column.align === "right" ? "text-right" : "text-left"
                )}
                style={{ minWidth: column.minWidth }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
      </table>
      
      <div 
        ref={scrollRef}
        className="overflow-x-auto"
        style={{ 
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "thin"
        }}
      >
        <table className="w-full">
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b">
                {/* Sticky cell */}
                <td
                  className={cn(
                    "sticky left-0 z-20 bg-background px-4 py-3 text-sm",
                    isScrolled && "after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border"
                  )}
                  style={{ minWidth: stickyColumn.minWidth }}
                >
                  {stickyColumn.accessor(row)}
                </td>
                {/* Scrollable cells */}
                {scrollableColumns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-sm whitespace-nowrap",
                      column.align === "right" ? "text-right" : "text-left"
                    )}
                  >
                    {column.accessor(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Financial Statement Table
export function FinancialStatementTableClean({
  data,
  periods,
  metrics,
  className,
}: {
  data: Record<string, Record<string, any>>;
  periods: string[];
  metrics: { key: string; label: string; format?: (val: any) => string }[];
  className?: string;
}) {
  const tableData = metrics.map(metric => {
    const row: any = { metric: metric.label, key: metric.key };
    periods.forEach(period => {
      const value = data[period]?.[metric.key];
      row[period] = metric.format ? metric.format(value) : value;
    });
    return row;
  });

  const columns = [
    {
      key: "metric",
      header: "",
      accessor: (row: any) => row.metric,
      sticky: true,
      minWidth: "180px",
    },
    ...periods.map((period) => ({
      key: period,
      header: period,
      accessor: (row: any) => (
        <span className="tabular-nums font-medium">
          {row[period] || "-"}
        </span>
      ),
      align: "right" as const,
      minWidth: "100px",
    })),
  ];

  return (
    <ScrollableTableClean
      columns={columns}
      data={tableData}
      className={className}
    />
  );
} 
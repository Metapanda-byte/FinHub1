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
  mobileOptimized?: boolean;
}

export function ScrollableTable({
  columns,
  data,
  className,
  mobileOptimized = true,
}: ScrollableTableProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll to show/hide border
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        setIsScrolled(scrollContainerRef.current.scrollLeft > 0);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      handleScroll();
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const stickyColumns = columns.filter(col => col.sticky);
  const scrollableColumns = columns.filter(col => !col.sticky);

  return (
    <div className={cn("relative w-full overflow-hidden mobile-table-container", className)}>
      <div className="flex">
        {/* Sticky columns */}
        {stickyColumns.length > 0 && (
          <div 
            className={cn(
              "flex-shrink-0 bg-background relative z-10",
              isScrolled && "border-r border-border"
            )}
          >
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {stickyColumns.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        "px-4 py-3 font-medium text-left bg-background sticky left-0 z-20",
                        mobileOptimized ? "text-sm" : "text-sm"
                      )}
                      style={{ 
                        width: column.width,
                        minWidth: column.minWidth || (mobileOptimized ? "120px" : "140px")
                      }}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="border-b">
                    {stickyColumns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-4 py-3 bg-background sticky left-0 z-20",
                          mobileOptimized ? "text-sm" : "text-sm"
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
        )}

        {/* Scrollable columns */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto"
          style={{ 
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "thin"
          }}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {scrollableColumns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-4 py-3 font-medium whitespace-nowrap",
                      mobileOptimized ? "text-sm" : "text-sm",
                      column.align === "right" ? "text-right" : 
                      column.align === "center" ? "text-center" : "text-left"
                    )}
                    style={{ 
                      width: column.width,
                      minWidth: column.minWidth || (mobileOptimized ? "100px" : "120px")
                    }}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="border-b">
                  {scrollableColumns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-4 py-3 whitespace-nowrap",
                        mobileOptimized ? "text-sm" : "text-sm",
                        column.align === "right" ? "text-right" : 
                        column.align === "center" ? "text-center" : "text-left"
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
    </div>
  );
}

// Financial Statement Table with sticky metric column
export function FinancialStatementTable({
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
      header: "Metric",
      accessor: (row: any) => row.metric,
      sticky: true,
      minWidth: "160px",
    },
    ...periods.map((period) => ({
      key: period,
      header: period,
      accessor: (row: any) => (
        <span className="tabular-nums">{row[period] || "-"}</span>
      ),
      align: "right" as const,
      minWidth: "120px",
    })),
  ];

  return (
    <ScrollableTable
      columns={columns}
      data={tableData}
      className={className}
      mobileOptimized={true}
    />
  );
}

// Peer Comparison Table with sticky company column
export function PeerComparisonTable({
  companies,
  metrics,
  className,
}: {
  companies: { symbol: string; name: string; data: Record<string, any> }[];
  metrics: { key: string; label: string; format?: (val: any) => string }[];
  className?: string;
}) {
  const tableData = companies.map(company => {
    const row: any = { 
      symbol: company.symbol, 
      name: company.name,
      ...company.data 
    };
    return row;
  });

  const columns = [
    {
      key: "company",
      header: "Company",
      accessor: (row: any) => (
        <div>
          <div className="font-medium">{row.symbol}</div>
          <div className="text-xs text-muted-foreground truncate max-w-[150px]">
            {row.name}
          </div>
        </div>
      ),
      sticky: true,
      minWidth: "140px",
    },
    ...metrics.map((metric) => ({
      key: metric.key,
      header: metric.label,
      accessor: (row: any) => {
        const value = row[metric.key];
        return (
          <span className="tabular-nums">
            {metric.format ? metric.format(value) : value || "-"}
          </span>
        );
      },
      align: "right" as const,
      minWidth: "120px",
    })),
  ];

  return (
    <ScrollableTable
      columns={columns}
      data={tableData}
      className={className}
      mobileOptimized={true}
    />
  );
} 
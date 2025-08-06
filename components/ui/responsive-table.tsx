"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import { MobileTable, MobileCardTable } from "./mobile-table";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface Column {
  key: string;
  header: string;
  accessor: (row: any) => React.ReactNode;
  align?: "left" | "center" | "right";
  priority?: number;
  mobileLabel?: string;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  className?: string;
  // Mobile-specific options
  mobileView?: "table" | "card" | "pivot";
  mobilePrimaryColumn?: string; // For card view
  mobileSecondaryColumn?: string; // For card view
  mobileExpandable?: boolean;
  // Desktop options
  stickyHeader?: boolean;
  maxHeight?: string;
}

export function ResponsiveTable({
  columns,
  data,
  className,
  mobileView = "table",
  mobilePrimaryColumn,
  mobileSecondaryColumn,
  mobileExpandable = true,
  stickyHeader = false,
  maxHeight,
}: ResponsiveTableProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    // Return desktop view during SSR to prevent hydration mismatch
    return (
      <div 
        className={cn(
          "w-full overflow-auto rounded-lg border",
          className
        )}
        style={{ maxHeight }}
      >
        <table className="w-full">
          <thead className={cn(
            "bg-muted/50",
            stickyHeader && "sticky top-0 z-10"
          )}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-sm font-medium",
                    column.align === "right" ? "text-right" : 
                    column.align === "center" ? "text-center" : "text-left"
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-t hover:bg-muted/50 transition-colors">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-sm",
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
    );
  }

  if (isMobile) {
    if (mobileView === "card" && mobilePrimaryColumn) {
      return (
        <MobileCardTable
          columns={columns}
          data={data}
          className={className}
          primaryColumn={mobilePrimaryColumn}
          secondaryColumn={mobileSecondaryColumn}
        />
      );
    }
    
    return (
      <MobileTable
        columns={columns}
        data={data}
        className={className}
        pivotMode={mobileView === "pivot"}
        expandable={mobileExpandable}
      />
    );
  }

  // Desktop view
  return (
    <div 
      className={cn(
        "w-full overflow-auto rounded-lg border",
        className
      )}
      style={{ maxHeight }}
    >
      <table className="w-full">
        <thead className={cn(
          "bg-muted/50",
          stickyHeader && "sticky top-0 z-10"
        )}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-4 py-3 text-sm font-medium",
                  column.align === "right" ? "text-right" : 
                  column.align === "center" ? "text-center" : "text-left"
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t hover:bg-muted/50 transition-colors">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-sm",
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
  );
}

// Specific implementations for common table types

export function FinancialTable({
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
  // Transform data for table format
  const tableData = metrics.map(metric => {
    const row: any = { metric: metric.label, key: metric.key };
    periods.forEach(period => {
      const value = data[period]?.[metric.key];
      row[period] = metric.format ? metric.format(value) : value;
    });
    return row;
  });

  const columns: Column[] = [
    {
      key: "metric",
      header: "Metric",
      accessor: (row) => row.metric,
      priority: 1,
    },
    ...periods.slice(0, 3).map((period, idx) => ({
      key: period,
      header: period,
      accessor: (row: any) => row[period],
      align: "right" as const,
      priority: idx < 2 ? 1 : 2, // Show first 2 periods on mobile
    })),
    ...periods.slice(3).map((period) => ({
      key: period,
      header: period,
      accessor: (row: any) => row[period],
      align: "right" as const,
      priority: 3, // Hide on mobile
    })),
  ];

  return (
    <ResponsiveTable
      columns={columns}
      data={tableData}
      className={className}
      mobileView="pivot"
      mobileExpandable={true}
      stickyHeader={true}
      maxHeight="600px"
    />
  );
}

export function ComparisonTable({
  companies,
  metrics,
  className,
}: {
  companies: { symbol: string; name: string; data: Record<string, any> }[];
  metrics: { key: string; label: string; format?: (val: any) => string }[];
  className?: string;
}) {
  const tableData = metrics.map(metric => {
    const row: any = { metric: metric.label };
    companies.forEach(company => {
      const value = company.data[metric.key];
      row[company.symbol] = metric.format ? metric.format(value) : value;
    });
    return row;
  });

  const columns: Column[] = [
    {
      key: "metric",
      header: "Metric",
      accessor: (row) => row.metric,
      priority: 1,
    },
    ...companies.map((company, idx) => ({
      key: company.symbol,
      header: company.symbol,
      accessor: (row: any) => row[company.symbol],
      align: "right" as const,
      priority: idx < 2 ? 1 : 3,
      mobileLabel: company.symbol.substring(0, 4),
    })),
  ];

  return (
    <ResponsiveTable
      columns={columns}
      data={tableData}
      className={className}
      mobileView="table"
      mobileExpandable={true}
    />
  );
} 
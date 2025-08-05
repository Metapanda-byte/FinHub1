"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileTableProps {
  columns: {
    key: string;
    header: string;
    accessor: (row: any) => React.ReactNode;
    align?: "left" | "center" | "right";
    priority?: number; // 1 = always show, 2 = show on larger mobile, 3 = hide on mobile
    mobileLabel?: string; // Shorter label for mobile
  }[];
  data: any[];
  className?: string;
  // For financial tables with many columns
  pivotMode?: boolean; // Switch between row/column view
  expandable?: boolean; // Allow expanding rows to see more data
}

export function MobileTable({ 
  columns, 
  data, 
  className,
  pivotMode = false,
  expandable = false 
}: MobileTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [isPivoted, setIsPivoted] = useState(pivotMode);
  
  // Sort columns by priority
  const priorityColumns = columns
    .filter(col => !col.priority || col.priority <= 2)
    .slice(0, 3); // Max 3 columns on mobile
    
  const hiddenColumns = columns.filter(
    col => col.priority && col.priority > 2
  );

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  // Pivoted view for financial data (periods as rows)
  if (isPivoted && data.length > 0) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex justify-end mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPivoted(false)}
            className="text-xs"
          >
            Switch to Standard View
          </Button>
        </div>
        
        {/* Pivoted Table - Each period becomes a card */}
        <div className="space-y-3">
          {Object.keys(data[0]).map((period, idx) => {
            if (period === "metric") return null;
            
            return (
              <div key={period} className="border rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-2">{period}</h4>
                <div className="space-y-1">
                  {data.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{row.metric}</span>
                      <span className="font-medium">{row[period]}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {pivotMode && (
        <div className="flex justify-end mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPivoted(true)}
            className="text-xs"
          >
            Switch to Period View
          </Button>
        </div>
      )}
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {priorityColumns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-2 py-2 text-xs font-medium",
                    column.align === "right" ? "text-right" : "text-left"
                  )}
                >
                  {column.mobileLabel || column.header}
                </th>
              ))}
              {expandable && hiddenColumns.length > 0 && (
                <th className="w-8"></th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <>
                <tr key={rowIndex} className="border-t">
                  {priorityColumns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-2 py-2 text-xs",
                        column.align === "right" ? "text-right" : "text-left"
                      )}
                    >
                      {column.accessor(row)}
                    </td>
                  ))}
                  {expandable && hiddenColumns.length > 0 && (
                    <td className="px-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleRow(rowIndex)}
                      >
                        {expandedRows.has(rowIndex) ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </Button>
                    </td>
                  )}
                </tr>
                
                {/* Expanded row content */}
                {expandable && expandedRows.has(rowIndex) && hiddenColumns.length > 0 && (
                  <tr>
                    <td colSpan={priorityColumns.length + 1} className="px-2 py-2 bg-muted/30">
                      <div className="space-y-1">
                        {hiddenColumns.map((column) => (
                          <div key={column.key} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{column.header}:</span>
                            <span className="font-medium">{column.accessor(row)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Card-based view for complex data
export function MobileCardTable({ 
  columns, 
  data, 
  className,
  primaryColumn, // Which column to use as the card title
  secondaryColumn, // Which column to show as subtitle
}: {
  columns: MobileTableProps["columns"];
  data: any[];
  className?: string;
  primaryColumn: string;
  secondaryColumn?: string;
}) {
  const primary = columns.find(c => c.key === primaryColumn);
  const secondary = columns.find(c => c.key === secondaryColumn);
  const otherColumns = columns.filter(
    c => c.key !== primaryColumn && c.key !== secondaryColumn
  );

  return (
    <div className={cn("space-y-2", className)}>
      {data.map((row, idx) => (
        <div key={idx} className="border rounded-lg p-3">
          <div className="mb-2">
            <h4 className="font-semibold text-sm">
              {primary?.accessor(row)}
            </h4>
            {secondary && (
              <p className="text-xs text-muted-foreground">
                {secondary.accessor(row)}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            {otherColumns.slice(0, 4).map((column) => (
              <div key={column.key}>
                <span className="text-muted-foreground">{column.header}</span>
                <p className="font-medium">{column.accessor(row)}</p>
              </div>
            ))}
          </div>
          
          {otherColumns.length > 4 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-xs">
                  More details
                  <MoreVertical className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {otherColumns.slice(4).map((column) => (
                  <DropdownMenuItem key={column.key} className="flex justify-between text-xs">
                    <span>{column.header}:</span>
                    <span className="font-medium">{column.accessor(row)}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ))}
    </div>
  );
} 
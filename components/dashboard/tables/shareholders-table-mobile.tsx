"use client";

import { ResponsiveTable } from "@/components/ui/responsive-table";
import { formatNumber, formatPercentage } from "@/lib/formatters";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ShareholderData {
  name: string;
  shares: number;
  percentage: number;
}

interface ShareholdersTableProps {
  data: ShareholderData[];
}

export function ShareholdersTableMobile({ data }: ShareholdersTableProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const columns = [
    {
      key: "name",
      header: "Shareholder",
      accessor: (row: ShareholderData) => (
        <span className="font-medium">{row.name}</span>
      ),
      priority: 1,
      mobileLabel: "Name",
    },
    {
      key: "percentage",
      header: "Ownership %",
      accessor: (row: ShareholderData) => (
        <span className="font-semibold text-primary">
          {formatPercentage(row.percentage)}
        </span>
      ),
      align: "right" as const,
      priority: 1,
      mobileLabel: "%",
    },
    {
      key: "shares",
      header: "Shares (M)",
      accessor: (row: ShareholderData) => formatNumber(row.shares),
      align: "right" as const,
      priority: isMobile ? 3 : 2, // Hide on mobile, show in expanded view
    },
  ];

  return (
    <ResponsiveTable
      columns={columns}
      data={data}
      mobileView="table"
      mobileExpandable={true}
      className="w-full"
    />
  );
}

// Alternative card-based view for more detailed shareholder info
export function ShareholderCardsView({ data }: ShareholdersTableProps) {
  // Sort by percentage ownership
  const sortedData = [...data].sort((a, b) => b.percentage - a.percentage);
  
  return (
    <div className="space-y-2">
      {sortedData.map((shareholder, idx) => (
        <div 
          key={shareholder.name}
          className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{shareholder.name}</h4>
              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                <span>{formatNumber(shareholder.shares)}M shares</span>
                {idx === 0 && (
                  <span className="text-primary font-medium">Top holder</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">
                {formatPercentage(shareholder.percentage)}
              </p>
              <p className="text-xs text-muted-foreground">ownership</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 
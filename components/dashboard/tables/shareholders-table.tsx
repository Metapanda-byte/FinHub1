import { Card, CardContent } from "@/components/ui/card";
import { formatNumber, formatPercentage } from "@/lib/formatters";

interface ShareholderData {
  name: string;
  shares: number;
  percentage: number;
}

interface ShareholdersTableProps {
  data: ShareholderData[];
}

export function ShareholdersTable({ data }: ShareholdersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium text-sm">Shareholder Name</th>
            <th className="text-right py-3 px-4 font-medium text-sm">Shares (M)</th>
            <th className="text-right py-3 px-4 font-medium text-sm">Ownership %</th>
          </tr>
        </thead>
        <tbody>
          {data.map((shareholder) => (
            <tr key={shareholder.name} className="border-b hover:bg-muted/50 transition-colors">
              <td className="py-3 px-4 text-sm">{shareholder.name}</td>
              <td className="text-right py-3 px-4 text-sm">{formatNumber(shareholder.shares)}</td>
              <td className="text-right py-3 px-4 text-sm">{formatPercentage(shareholder.percentage)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
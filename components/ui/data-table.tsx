import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SkeletonTable } from "@/components/ui/crunching-numbers-loader";

interface DataTableProps {
  data: any[];
  columns: {
    header: string;
    accessorKey: string;
    cell?: (row: any) => React.ReactNode;
  }[];
  isLoading?: boolean;
}

export function DataTable({ data, columns, isLoading }: DataTableProps) {
  if (isLoading) {
    return <SkeletonTable rows={data.length || 8} columns={columns.length} />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.accessorKey}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={column.accessorKey}>
                  {column.cell ? column.cell(row) : row[column.accessorKey]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 
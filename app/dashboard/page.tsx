import { Dashboard } from "@/components/dashboard/dashboard";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  return (
    <div className="container py-6">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
        <div className="flex items-center gap-2">
        </div>
        <p className="text-muted-foreground">
          Comprehensive financial analysis and performance metrics
        </p>
      </div>
      <Dashboard />
    </div>
  );
}
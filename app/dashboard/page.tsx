import { Dashboard } from "@/components/dashboard/dashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 animate-fade-in">
        <Dashboard />
      </div>
    </div>
  );
}
import { Dashboard } from "@/components/dashboard/dashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] premium-gradient">
      <div className="py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 animate-fade-in">
        <div className="px-mobile">
          <h1 className="text-mobile-lg font-bold mb-2 bg-gradient-to-r from-foreground to-[hsl(var(--finhub-orange))] bg-clip-text text-transparent">
            Financial Dashboard
          </h1>
          <p className="text-mobile-sm text-muted-foreground">
            Comprehensive financial analysis and AI-powered insights
          </p>
        </div>
        <Dashboard />
      </div>
    </div>
  );
}
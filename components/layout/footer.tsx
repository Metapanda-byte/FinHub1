"use client";

import { FinHubIQLogo } from "@/components/ui/finhubiq-logo";
import { useTheme } from "next-themes";

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer className="bg-background border-t border-border">
      <div className="px-mobile py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center">
            <FinHubIQLogo variant={theme === 'light' ? 'black' : 'primary'} size="small" />
          </div>
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FinHubIQ. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
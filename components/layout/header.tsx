"use client";

import Link from "next/link";
import { BarChartBig } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { StockSearch } from "@/components/search/stock-search";
import { usePathname } from "next/navigation";
import { AuthButton } from "@/components/auth/auth-button";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <BarChartBig className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">FinHubIQ</span>
          </Link>
          {isDashboard && <StockSearch />}
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/#pricing">Pricing</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/#docs">Documentation</Link>
            </Button>
          </nav>
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
"use client";

import Link from "next/link";
import { BarChartBig, Menu, X } from "lucide-react";
import { FinHubLogo } from "@/components/ui/finhub-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { StockSearch } from "@/components/search/stock-search";
import { usePathname } from "next/navigation";
import { AuthButton } from "@/components/auth/auth-button";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        <div className="flex items-center gap-2 sm:gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <FinHubLogo size="md" />
            <span className="font-bold text-lg sm:text-xl">
              FinHub<span className="text-finhub-orange">IQ</span>
            </span>
          </Link>
          {isDashboard && (
            <div className="hidden sm:block">
              <StockSearch />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/plans">Plans</Link>
            </Button>
          </nav>

          {/* Mobile Search for Dashboard */}
          {isDashboard && (
            <div className="sm:hidden">
              <StockSearch />
            </div>
          )}

          <ThemeToggle />
          <div className="hidden sm:block">
            <AuthButton />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container py-4 space-y-3">
            <Button variant="ghost" asChild className="w-full justify-start">
              <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full justify-start">
              <Link href="/plans" onClick={() => setIsMobileMenuOpen(false)}>
                Plans
              </Link>
            </Button>
            <div className="pt-2 border-t">
              <AuthButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
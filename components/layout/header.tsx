"use client";

import Link from "next/link";
import { BarChartBig, Menu, X, Bell, Search, Grid3X3 } from "lucide-react";
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          "safe-top",
          isScrolled
            ? "glass-effect shadow-lg"
            : "bg-background/95 backdrop-blur-sm"
        )}
      >
        <div className="container flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center space-x-2 group">
              <FinHubLogo size={isDashboard ? "sm" : "md"} className="transition-transform group-hover:scale-105" />
              <span className={cn(
                "font-bold transition-all",
                isDashboard ? "text-lg hidden sm:inline" : "text-xl"
              )}>
                FinHub<span className="text-finhub-orange">IQ</span>
              </span>
            </Link>
          </div>

          {/* Desktop Search Bar - Center */}
          {isDashboard && (
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <StockSearch />
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Icon */}
            {isDashboard && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden h-9 w-9"
                onClick={() => {/* Handle mobile search */}}
              >
                <Search className="h-4 w-4" />
              </Button>
            )}

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/plans">Plans</Link>
              </Button>
            </nav>

            {/* Notification Bell */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-9 w-9"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-finhub-orange rounded-full animate-pulse" />
            </Button>

            {/* Apps Grid - Desktop Only */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden md:flex h-9 w-9"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>

            <ThemeToggle />
            
            <div className="hidden sm:block">
              <AuthButton />
            </div>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden h-9 w-9"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 animate-scale-in" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute top-0 right-0 h-full w-[85vw] max-w-sm bg-background border-l border-border shadow-2xl animate-slide-in-right safe-top">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Menu Content */}
            <div className="p-4 space-y-4">
              {/* Search Bar - Mobile */}
              {isDashboard && (
                <div className="pb-4 border-b border-border">
                  <StockSearch />
                </div>
              )}

              {/* Navigation Links */}
              <nav className="space-y-2">
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start h-12 text-base">
                    <BarChartBig className="h-5 w-5 mr-3" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/plans" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start h-12 text-base">
                    <Grid3X3 className="h-5 w-5 mr-3" />
                    Plans
                  </Button>
                </Link>
              </nav>

              {/* Auth Section */}
              <div className="pt-4 border-t border-border">
                <AuthButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
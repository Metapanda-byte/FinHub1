"use client";

import Link from "next/link";
import { BarChartBig, Menu, X, Sparkles } from "lucide-react";
import { FinHubIQLogo } from "@/components/ui/finhubiq-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { StockSearch } from "@/components/search/stock-search";
import { usePathname } from "next/navigation";


export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "w-full transition-all duration-200 safe-top border-b border-border/30",
        isScrolled
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container-wide px-mobile">
        {/* Main Header Row */}
        <div className="h-9 my-0.5 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-4 flex-1">
            <Link href="/" className="flex items-center flex-shrink-0 group">
              <FinHubIQLogo variant={theme === 'light' ? 'black' : 'primary'} size="small" />
            </Link>
          </div>

          {/* Center: Ticker Search - Desktop Only */}
          <div className="hidden sm:flex flex-1 justify-center max-w-lg mx-8">
            <div className="w-full max-w-md">
              <StockSearch 
                className="border-0 bg-muted/30 hover:bg-muted/40 focus-within:bg-muted/50 transition-colors duration-200 shadow-sm" 
                placeholder="Search Company or Ticker"
                showSelectedTicker={false}
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-end">
            <ThemeToggle />
            
            {/* Log In Button - No outline */}
            <Button 
              variant="ghost" 
              className="hidden sm:flex items-center justify-center h-7 px-2 text-xs hover:bg-muted/50"
            >
              Log In
            </Button>

            {/* Upgrade Button - McLaren Orange */}
            <Button 
              className="hidden sm:flex items-center justify-center h-7 px-2 text-xs bg-[hsl(var(--finhub-orange))] hover:bg-[hsl(var(--finhub-orange))]/90 text-white"
            >
              Upgrade
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden h-7 w-7"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search Row - Compact */}
        {isDashboard && (
          <div className="sm:hidden border-t border-border/20 py-1">
            <StockSearch 
              className="w-full border-0 bg-muted/20 hover:bg-muted/30 focus-within:bg-muted/40 transition-colors duration-200" 
              placeholder="Search Company or Ticker"
              showSelectedTicker={false}
            />
          </div>
        )}
      </div>

      {/* Mobile Slide-out Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed right-0 top-0 h-full w-[280px] bg-background border-l shadow-2xl animate-slide-in-right safe-right">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-4 space-y-2">
              <Button 
                variant="outline" 
                className="w-full touch-target"
              >
                Log In
              </Button>
              
              <Button 
                className="w-full touch-target bg-[hsl(var(--finhub-orange))] hover:bg-[hsl(var(--finhub-orange))]/90 text-white"
              >
                Upgrade
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
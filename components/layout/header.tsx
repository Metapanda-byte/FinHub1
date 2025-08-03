"use client";

import Link from "next/link";
import { BarChartBig, Menu, X, BarChart3 } from "lucide-react";
import { FinHubIQLogo } from "@/components/ui/finhubiq-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { StockSearch } from "@/components/search/stock-search";
import { usePathname } from "next/navigation";
import { AuthButton } from "@/components/auth/auth-button";

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
        "sticky top-0 z-50 w-full transition-all duration-200 safe-top",
        isScrolled
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm border-b border-border/40"
          : "bg-transparent"
      )}
    >
      <div className="container-wide h-14 sm:h-16 flex items-center justify-between px-mobile">
        {/* Logo and Search */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <Link href="/" className="flex items-center flex-shrink-0 group">
            <FinHubIQLogo 
              variant={theme === 'light' ? 'black' : 'primary'} 
              size="small"
              className="sm:hidden transition-transform group-hover:scale-105"
            />
            <FinHubIQLogo 
              variant={theme === 'light' ? 'black' : 'primary'} 
              size="medium"
              className="hidden sm:block transition-transform group-hover:scale-105"
            />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Button 
              variant="ghost" 
              asChild 
              className={cn(
                "touch-target relative",
                pathname === '/dashboard' && "bg-accent"
              )}
            >
              <Link href="/dashboard">
                Dashboard
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              asChild 
              className={cn(
                "touch-target relative",
                pathname === '/plans' && "bg-accent"
              )}
            >
              <Link href="/plans">
                Plans
              </Link>
            </Button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">

          <ThemeToggle />
          
          <div className="hidden sm:block">
            <AuthButton />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden touch-target"
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
                variant={pathname === '/dashboard' ? 'secondary' : 'ghost'} 
                asChild 
                className="w-full justify-start touch-target"
              >
                <Link href="/dashboard">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              
              <Button 
                variant={pathname === '/plans' ? 'secondary' : 'ghost'} 
                asChild 
                className="w-full justify-start touch-target"
              >
                <Link href="/plans">
                  Plans
                </Link>
              </Button>
              
              <div className="pt-4 border-t">
                <div className="space-y-2">
                  <div className="pt-2">
                    <AuthButton />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
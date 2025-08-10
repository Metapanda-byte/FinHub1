"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { FinHubIQLogo } from "@/components/ui/finhubiq-logo";
import { StockSearch } from "@/components/search/stock-search";
import { AuthButton } from "@/components/auth/auth-button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Menu, X, ChevronDown, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useSearchStore } from "@/lib/store/search-store";
import { useWatchlistStore } from "@/lib/store/watchlist-store";


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

            {/* Navigation Menu - Desktop Only */}
            <nav className="hidden lg:flex items-center gap-1" aria-hidden="true"></nav>
          </div>

          {/* Center: Spacer - Search moved to dashboard */}
          <div className="hidden md:flex flex-1 justify-center max-w-lg mx-8">
            <div className="w-full max-w-md">
              {/* Search bar moved to dashboard for better visibility */}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-end">
            <ThemeToggle />
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


      </div>

      {/* Mobile menu disabled for holding page */}
    </header>
  );
}
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  Home,
  Search,
  Sparkles,
  Star,
  Building2,
} from "lucide-react";
import { StockSearch } from "@/components/search/stock-search";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

const navItems = [
  {
    label: "Home",
    href: "/dashboard",
    tab: "home",
    icon: Home,
  },
  {
    label: "Overview",
    href: "/dashboard",
    tab: "company-snapshot",
    icon: Building2,
  },
  {
    label: "Search",
    action: "search",
    icon: Search,
  },
  {
    label: "AI Co-pilot",
    action: "copilot",
    icon: Sparkles,
  },
  {
    label: "Watchlist",
    href: "/dashboard",
    tab: "watchlist",
    icon: Star,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Listen for stock selection to close dialog
  useEffect(() => {
    const handleStockSelected = () => {
      setIsSearchOpen(false);
      // Navigate to company overview
      router.push('/dashboard?tab=company-snapshot');
    };
    
    window.addEventListener('stockSelected', handleStockSelected);
    return () => window.removeEventListener('stockSelected', handleStockSelected);
  }, [router]);
  
  const handleNavClick = (e: React.MouseEvent<HTMLElement>, item: typeof navItems[0]) => {
    if ('action' in item) {
      e.preventDefault();
      if (item.action === 'search') {
        setIsSearchOpen(true);
      } else if (item.action === 'copilot') {
        // Dispatch event to open copilot
        window.dispatchEvent(new CustomEvent('mobile-open-copilot'));
      }
    } else if (item.tab && pathname === '/dashboard') {
      e.preventDefault();
      // Use a custom event to communicate with the dashboard
      window.dispatchEvent(new CustomEvent('mobileTabChange', { 
        detail: { tab: item.tab } 
      }));
    }
  };
  
  return (
    <>
      <nav className="mobile-nav-container sm:hidden">
        <div className="flex h-14 items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive = 
              (item.href === '/dashboard' && pathname === '/dashboard' && 
                item.tab === currentTab);
            
            if ('action' in item) {
              return (
                <button
                  key={item.action}
                  onClick={(e) => handleNavClick(e, item)}
                  className={cn(
                    "mobile-nav-item touch-target group relative",
                    "flex flex-col items-center justify-center"
                  )}
                >
                  <div className="relative flex flex-col items-center gap-1">
                    <item.icon className={cn(
                      "h-5 w-5 transition-all duration-300 text-muted-foreground",
                      "group-hover:text-foreground"
                    )} />
                    <span className={cn(
                      "text-[10px] font-medium transition-colors text-muted-foreground",
                      "group-hover:text-foreground"
                    )}>
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            }
            
            return (
              <Link
                key={item.href + (item.tab || '')}
                href={item.tab ? `${item.href}?tab=${item.tab}` : item.href!}
                onClick={(e) => handleNavClick(e, item)}
                className={cn(
                  "mobile-nav-item touch-target group relative",
                  isActive && "active"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
                
                <div className="relative flex flex-col items-center gap-1">
                  <item.icon className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive ? "text-primary scale-110" : "text-muted-foreground",
                    "group-hover:text-foreground"
                  )} />
                  <span className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground",
                    "group-hover:text-foreground"
                  )}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="w-[90vw] max-w-lg p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Search Stocks</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <StockSearch 
              className="border-0 bg-muted/30 hover:bg-muted/40 focus-within:bg-muted/50 transition-colors duration-200 shadow-sm" 
              placeholder="Search Company or Ticker"
              showSelectedTicker={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 
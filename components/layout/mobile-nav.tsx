"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  BarChart3,
  TrendingUp,
  FileText,
  Newspaper,
} from "lucide-react";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Overview",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    label: "Analysis",
    href: "/dashboard",
    tab: "dcf-analysis",
    icon: TrendingUp,
  },
  {
    label: "Filings",
    href: "/dashboard",
    tab: "sec-filings",
    icon: FileText,
  },
  {
    label: "News",
    href: "/dashboard",
    tab: "recent-news",
    icon: Newspaper,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');
  
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof navItems[0]) => {
    if (item.tab && pathname === '/dashboard') {
      e.preventDefault();
      // Use a custom event to communicate with the dashboard
      window.dispatchEvent(new CustomEvent('mobile-nav-tab-change', { 
        detail: { tab: item.tab } 
      }));
    }
  };
  
  return (
    <nav className="mobile-nav-container sm:hidden glass-effect">
      <div className="flex h-14 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = 
            (item.href === '/' && pathname === '/') ||
            (item.href === '/dashboard' && pathname === '/dashboard' && 
              (!item.tab || item.tab === currentTab || (!currentTab && !item.tab)));
          
          return (
            <Link
              key={item.href + (item.tab || '')}
              href={item.tab ? `${item.href}?tab=${item.tab}` : item.href}
              onClick={(e) => handleNavClick(e, item)}
              className={cn(
                "mobile-nav-item touch-target group relative",
                isActive && "active"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[hsl(var(--finhub-orange))] rounded-full" />
              )}
              
              {/* Glow effect on active */}
              {isActive && (
                <div className="absolute inset-0 bg-[hsl(var(--finhub-orange))]/10 rounded-lg blur-xl" />
              )}
              
              <div className="relative flex flex-col items-center gap-1">
                <item.icon className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isActive ? "text-[hsl(var(--finhub-orange))] scale-110" : "text-muted-foreground",
                  "group-hover:text-foreground"
                )} />
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-[hsl(var(--finhub-orange))]" : "text-muted-foreground",
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
  );
} 
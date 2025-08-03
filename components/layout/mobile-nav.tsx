"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  BarChart3,
  Search,
  TrendingUp,
  User,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    label: "Add",
    href: "#",
    icon: PlusCircle,
    isAction: true,
  },
  {
    label: "Markets",
    href: "/markets",
    icon: TrendingUp,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        // Hide on scroll down, show on scroll up
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);

  return (
    <>
      {/* Spacer to prevent content overlap */}
      <div className="h-16 md:hidden" />
      
      {/* Navigation Bar */}
      <nav 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 md:hidden",
          "transition-transform duration-300 ease-in-out",
          isVisible ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Background with blur */}
        <div className="absolute inset-0 glass-effect border-t border-border" />
        
        {/* Safe area background */}
        <div className="absolute inset-0 bg-background/80 safe-bottom" />
        
        {/* Navigation items */}
        <div className="relative flex items-center justify-around h-16 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href && !item.isAction;
            
            if (item.isAction) {
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    // Handle action button click
                    console.log("Action button clicked");
                  }}
                  className="relative flex flex-col items-center justify-center w-full h-full group"
                >
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg",
                      "transition-all duration-300 ease-out",
                      "active:scale-90"
                    )}
                  >
                    {/* Action button with special styling */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-finhub-orange/20 blur-xl animate-pulse" />
                      <div className="relative bg-finhub-orange text-white p-2 rounded-full shadow-lg">
                        <item.icon className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </button>
              );
            }
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center w-full h-full group"
              >
                <div
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg",
                    "transition-all duration-300 ease-out",
                    "mobile-optimized",
                    isActive && "text-finhub-orange",
                    "active:scale-95"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div
                      className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-finhub-orange rounded-full animate-scale-in"
                    />
                  )}
                  
                  {/* Icon with effects */}
                  <div className="relative">
                    <item.icon 
                      className={cn(
                        "h-5 w-5 transition-all duration-300",
                        isActive ? "text-finhub-orange scale-110" : "text-muted-foreground",
                        "group-hover:text-foreground group-active:scale-90"
                      )} 
                    />
                    
                    {/* Glow effect on active */}
                    {isActive && (
                      <div className="absolute inset-0 blur-md bg-finhub-orange/20 animate-pulse" />
                    )}
                  </div>
                  
                  {/* Label */}
                  <span 
                    className={cn(
                      "text-[10px] font-medium transition-all duration-300",
                      isActive ? "text-finhub-orange" : "text-muted-foreground",
                      "group-hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
} 
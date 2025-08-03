"use client";

import { ReactNode, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface MobileTableWrapperProps {
  children: ReactNode;
  className?: string;
}

export function MobileTableWrapper({ children, className }: MobileTableWrapperProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  
  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollWidth, clientWidth } = scrollRef.current;
        setShowScrollIndicator(scrollWidth > clientWidth);
      }
    };
    
    checkScroll();
    window.addEventListener('resize', checkScroll);
    
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);
  
  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className={cn(
          "mobile-table-container touch-scroll-x",
          "rounded-lg border",
          className
        )}
      >
        <table className="mobile-table financial-table">
          {children}
        </table>
      </div>
      
      {showScrollIndicator && (
        <div className="scroll-indicator">
          <ChevronRight className="h-4 w-4 text-muted-foreground animate-pulse" />
        </div>
      )}
      
      {/* Mobile scroll hint */}
      <div className="sm:hidden mt-2 text-center">
        <p className="text-xs text-muted-foreground">
          Swipe horizontally to see more →
        </p>
      </div>
    </div>
  );
} 
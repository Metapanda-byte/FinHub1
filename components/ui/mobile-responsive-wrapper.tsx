"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface MobileResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileResponsiveWrapper({ children, className }: MobileResponsiveWrapperProps) {
  return (
    <div className={cn(
      // Base mobile optimizations
      "w-full mobile-optimized premium-mobile",
      // Responsive text and spacing
      "text-responsive space-y-responsive", 
      // Mobile-first padding
      "mobile-card",
      // Tables and charts
      "financial-table responsive-chart",
      // Ensure scrollable content doesn't break layout
      "overflow-x-auto",
      className
    )}>
      {children}
    </div>
  );
} 
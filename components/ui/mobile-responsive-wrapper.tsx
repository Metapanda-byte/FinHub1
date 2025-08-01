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
      "w-full",
      // Mobile optimizations
      "text-sm md:text-base",
      "space-y-3 md:space-y-4",
      "p-2 md:p-4",
      // Ensure scrollable content doesn't break layout
      "overflow-x-auto",
      className
    )}>
      <style jsx>{`
        /* Mobile-specific styles */
        @media (max-width: 768px) {
          /* Make tables more compact */
          table {
            font-size: 0.75rem;
          }
          
          /* Ensure buttons are touch-friendly */
          button {
            min-height: 44px;
            min-width: 44px;
          }
          
          /* Make cards more compact */
          .card {
            padding: 0.75rem;
          }
          
          /* Optimize charts for mobile */
          .recharts-responsive-container {
            height: 200px !important;
          }
        }
        
        @media (max-width: 640px) {
          /* Extra compact for very small screens */
          table {
            font-size: 0.7rem;
          }
          
          .recharts-responsive-container {
            height: 180px !important;
          }
        }
      `}</style>
      {children}
    </div>
  );
} 
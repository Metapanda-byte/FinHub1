"use client";

import React, { useEffect, useState } from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';

interface TableScrollHintProps {
  className?: string;
}

export function TableScrollHint({ className = "" }: TableScrollHintProps) {
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    // Hide hint after 5 seconds or when user scrolls
    const timer = setTimeout(() => setShowHint(false), 5000);
    
    const handleScroll = () => setShowHint(false);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!showHint) return null;

  return (
    <div className={`md:hidden fixed bottom-20 right-4 z-40 ${className}`}>
      <div className="bg-black/80 text-white text-xs px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
        <ArrowRight className="h-4 w-4" />
        <span>Swipe to scroll →</span>
        <ChevronRight className="h-3 w-3" />
      </div>
    </div>
  );
} 
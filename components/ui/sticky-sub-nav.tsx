"use client";

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SubNavItem {
  id: string;
  label: string;
  icon?: React.ElementType;
}

interface StickySubNavProps {
  items: SubNavItem[];
  activeItem?: string;
  onItemClick: (id: string) => void;
  className?: string;
}

export function StickySubNav({
  items,
  activeItem,
  onItemClick,
  className
}: StickySubNavProps) {
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftScroll(scrollLeft > 0);
    setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className={cn(
      "sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b",
      className
    )}>
      <div className="relative">
        {/* Left scroll button */}
        {showLeftScroll && (
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center">
            <div className="bg-gradient-to-r from-background via-background/80 to-transparent pl-2 pr-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => scroll('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Right scroll button */}
        {showRightScroll && (
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center">
            <div className="bg-gradient-to-l from-background via-background/80 to-transparent pr-2 pl-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => scroll('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Navigation items */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 p-2 overflow-x-auto scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          {items.map((item) => (
            <Button
              key={item.id}
              variant={activeItem === item.id ? "default" : "ghost"}
              size="sm"
              className={cn(
                "whitespace-nowrap flex items-center gap-2",
                "transition-all duration-200",
                activeItem === item.id && "shadow-sm"
              )}
              onClick={() => onItemClick(item.id)}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
} 
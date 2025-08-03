"use client";

import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SwipeableViewProps {
  children: ReactNode[];
  activeIndex: number;
  onSwipe: (index: number) => void;
  className?: string;
  threshold?: number;
  animationDuration?: number;
}

export function SwipeableView({
  children,
  activeIndex,
  onSwipe,
  className,
  threshold = 50,
  animationDuration = 300
}: SwipeableViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setOffset(-activeIndex * 100);
  }, [activeIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const x = e.touches[0].clientX;
    setCurrentX(x);
    
    const diff = x - startX;
    const containerWidth = containerRef.current?.offsetWidth || 1;
    const percentDiff = (diff / containerWidth) * 100;
    
    // Add resistance at edges
    const resistance = 0.3;
    let newOffset = -activeIndex * 100 + percentDiff;
    
    if (activeIndex === 0 && diff > 0) {
      newOffset = percentDiff * resistance;
    } else if (activeIndex === children.length - 1 && diff < 0) {
      newOffset = -activeIndex * 100 + percentDiff * resistance;
    }
    
    setOffset(newOffset);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const diff = currentX - startX;
    const containerWidth = containerRef.current?.offsetWidth || 1;
    const percentDiff = Math.abs(diff / containerWidth) * 100;
    
    if (percentDiff > threshold / 100 * 100) {
      if (diff > 0 && activeIndex > 0) {
        onSwipe(activeIndex - 1);
      } else if (diff < 0 && activeIndex < children.length - 1) {
        onSwipe(activeIndex + 1);
      } else {
        setOffset(-activeIndex * 100);
      }
    } else {
      setOffset(-activeIndex * 100);
    }
    
    setIsDragging(false);
  };

  // Mouse events for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setCurrentX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const x = e.clientX;
    setCurrentX(x);
    
    const diff = x - startX;
    const containerWidth = containerRef.current?.offsetWidth || 1;
    const percentDiff = (diff / containerWidth) * 100;
    
    setOffset(-activeIndex * 100 + percentDiff);
  };

  const handleMouseUp = () => {
    handleTouchEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setOffset(-activeIndex * 100);
      setIsDragging(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden touch-pan-y",
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="flex h-full"
        style={{
          transform: `translateX(${offset}%)`,
          transition: isDragging ? 'none' : `transform ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="w-full flex-shrink-0"
            style={{ minWidth: '100%' }}
          >
            {child}
          </div>
        ))}
      </div>
      
      {/* Swipe indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
        {children.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              index === activeIndex 
                ? "w-6 bg-primary" 
                : "w-1.5 bg-muted-foreground/30"
            )}
          />
        ))}
      </div>
    </div>
  );
} 
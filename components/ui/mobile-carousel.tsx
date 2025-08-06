"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface MobileCarouselProps {
  children: React.ReactNode[];
  className?: string;
  showDots?: boolean;
  showArrows?: boolean;
}

export function MobileCarousel({
  children,
  className,
  showDots = true,
  showArrows = true
}: MobileCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = children.length;

  // Debug: Log what we received
  console.log('MobileCarousel received children:', children);
  console.log('Total slides:', totalSlides);
  console.log('Children type:', typeof children);
  console.log('Children is array:', Array.isArray(children));
  console.log('Children length:', children?.length);
  console.log('First child:', children?.[0]);
  console.log('Second child:', children?.[1]);

  if (totalSlides === 0) return null;

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Debug info */}
      <div className="absolute top-0 left-0 z-20 bg-red-500 text-white text-xs p-1">
        Debug: {currentIndex + 1}/{totalSlides}
      </div>
      
      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            width: `${totalSlides * 100}%`
          }}
        >
          {children.map((child, index) => (
            <div
              key={`slide-${index}`}
              className="w-full flex-shrink-0"
              style={{ 
                width: `${100 / totalSlides}%`,
                minWidth: `${100 / totalSlides}%`,
                maxWidth: `${100 / totalSlides}%`
              }}
            >
              <div className="w-full h-full">
                <div className="border-2 border-purple-500 p-2 h-full">
                  <div className="text-xs text-purple-500 mb-2">Slide {index + 1}</div>
                  <div className="h-full">
                    {child}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && totalSlides > 1 && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full p-0 bg-background/80 backdrop-blur-sm border-border/50"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full p-0 bg-background/80 backdrop-blur-sm border-border/50"
            onClick={goToNext}
            disabled={currentIndex === totalSlides - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && totalSlides > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentIndex
                  ? "bg-primary scale-125"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      <div className="absolute top-2 right-2 z-10">
        <div className="bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground">
          {currentIndex + 1} / {totalSlides}
        </div>
      </div>
    </div>
  );
} 
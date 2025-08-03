"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  X, 
  Download, 
  Share2, 
  Filter, 
  RefreshCw
} from 'lucide-react';

interface FABAction {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions?: FABAction[];
  className?: string;
}

const defaultActions: FABAction[] = [
  {
    icon: Download,
    label: 'Export',
    onClick: () => console.log('Export'),
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    icon: Share2,
    label: 'Share',
    onClick: () => console.log('Share'),
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    icon: Filter,
    label: 'Filter',
    onClick: () => console.log('Filter'),
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    icon: RefreshCw,
    label: 'Refresh',
    onClick: () => console.log('Refresh'),
    color: 'bg-orange-500 hover:bg-orange-600'
  }
];

export function FloatingActionButton({ 
  actions = defaultActions,
  className 
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn(
      "fixed bottom-20 right-4 z-40 sm:hidden",
      className
    )}>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 -z-10 transition-opacity duration-200",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />
      
      {/* Action buttons */}
      <div className="absolute bottom-16 right-0 space-y-3">
        {actions.map((action, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-3 justify-end transition-all duration-200",
              isOpen 
                ? "opacity-100 scale-100 translate-y-0" 
                : "opacity-0 scale-75 translate-y-4 pointer-events-none"
            )}
            style={{ 
              transitionDelay: isOpen ? `${index * 50}ms` : `${(actions.length - index - 1) * 50}ms` 
            }}
          >
            {/* Label */}
            <span className="bg-background/95 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap">
              {action.label}
            </span>
            
            {/* Button */}
            <Button
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full shadow-lg",
                action.color || "bg-primary hover:bg-primary/90"
              )}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
            >
              <action.icon className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>
      
      {/* Main FAB */}
      <Button
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-xl",
          "bg-primary hover:bg-primary/90",
          "transition-all duration-200",
          isOpen && "bg-destructive hover:bg-destructive/90"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={cn(
          "transition-transform duration-200",
          isOpen && "rotate-45"
        )}>
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
        </div>
      </Button>
    </div>
  );
} 
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HighlightToChatProps {
  onHighlightAnalyze: (hoveredElement: string, context: string) => void;
  activeTab?: string;
}

export function HighlightToChat({ onHighlightAnalyze, activeTab }: HighlightToChatProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [hoveredData, setHoveredData] = useState({ element: '', context: '' });
  const popupRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleMouseOver = (event: MouseEvent) => {
      // Only activate on Historical Financials tab
      if (activeTab !== 'historical-financials') return;
      
      const target = event.target as HTMLElement;
      
      // Check if hovered element contains financial data
      const text = target.textContent || '';
      const isFinancialData = /\d/.test(text) && (
        /\$|%|million|billion|thousand/.test(text) || 
        /revenue|profit|margin|cash|debt|asset|liability|equity|growth/i.test(text) ||
        target.closest('td, th, .financial-metric, [data-financial-item]')
      );
      
      if (!isFinancialData || text.trim().length < 2) return;
      
      // Clear any existing timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      
      // Set a delay before showing the popup
      hoverTimeoutRef.current = setTimeout(() => {
        // Get context from parent elements
        let context = '';
        let parentElement = target.closest('td, th, .card, section, [data-financial-item]');
        
        if (!parentElement) {
          parentElement = target.closest('div');
        }
        
        if (parentElement) {
          // Get table row context if in a table
          const row = target.closest('tr');
          const table = target.closest('table');
          
          if (row && table) {
            const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent).join(' | ');
            const rowData = Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent).join(' | ');
            context = `Table: ${headers}\nRow: ${rowData}`;
          } else {
            context = parentElement.textContent || '';
          }
          
          // Limit context length
          if (context.length > 600) {
            context = context.substring(0, 600) + '...';
          }
        }
        
        setHoveredData({ element: text.trim(), context });
        setPopupPosition({ 
          x: event.clientX, 
          y: event.clientY - 10 
        });
        setShowPopup(true);
      }, 800); // Show after 800ms hover
    };

    const handleMouseOut = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const relatedTarget = event.relatedTarget as HTMLElement;
      
      // Don't hide if moving to the popup
      if (popupRef.current && popupRef.current.contains(relatedTarget)) {
        return;
      }
      
      // Clear timeout if mouse leaves before popup shows
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      
      // Hide popup after a small delay
      setTimeout(() => {
        if (!popupRef.current || !popupRef.current.matches(':hover')) {
          setShowPopup(false);
        }
      }, 100);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mousedown', handleClickOutside);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [activeTab]);

  const handleAnalyze = () => {
    if (hoveredData.element) {
      onHighlightAnalyze(hoveredData.element, hoveredData.context);
      setShowPopup(false);
    }
  };

  if (!showPopup) return null;

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 transform -translate-x-1/2 -translate-y-full"
      style={{
        left: `${popupPosition.x}px`,
        top: `${popupPosition.y}px`,
      }}
      onMouseEnter={() => setShowPopup(true)}
      onMouseLeave={() => setShowPopup(false)}
    >
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleAnalyze}
          className="flex items-center gap-1 h-7 px-3 text-xs"
        >
          <MessageSquare className="h-3 w-3" />
          Ask AI
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowPopup(false)}
          className="h-7 w-7 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
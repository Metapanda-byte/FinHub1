'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HighlightToChatProps {
  onHighlightAnalyze: (hoveredElement: string, context: string) => void;
  onDirectAnalyze?: (question: string) => void;
  activeTab?: string;
}

export function HighlightToChat({ onHighlightAnalyze, onDirectAnalyze, activeTab }: HighlightToChatProps) {
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
        // Get context from financial statement structure
        let context = '';
        let financialItem = '';
        let timePeriod = '';
        
        const row = target.closest('tr');
        const table = target.closest('table');
        
        if (row && table) {
          // Get the row label (first cell, usually the financial item name)
          const firstCell = row.querySelector('td:first-child, th:first-child');
          if (firstCell) {
            financialItem = firstCell.textContent?.trim() || '';
          }
          
          // Get the column header for time period
          const cellIndex = Array.from(row.children).indexOf(target.closest('td') || target.closest('th') as Element);
          if (cellIndex > 0) {
            const headers = table.querySelectorAll('th');
            if (headers[cellIndex]) {
              timePeriod = headers[cellIndex].textContent?.trim() || '';
            }
          }
          
          // Clean up common financial statement labels and map to proper terms
          financialItem = financialItem
            .replace(/^\$?\s*/, '') // Remove leading $ or spaces
            .replace(/\s*\([^)]*\)\s*$/, '') // Remove parenthetical notes at end
            .replace(/\(-\)/g, '') // Remove (-) indicators
            .replace(/^\(-\)\s*/, '') // Remove leading (-) 
            .trim();
          
          // Map common negative items to proper financial terms
          const financialTermMappings: Record<string, string> = {
            'Cost of goods sold': 'Cost of Goods Sold (COGS)',
            'Cost of revenue': 'Cost of Revenue',
            'Selling, general and administrative': 'SG&A Expenses',
            'SG&A': 'SG&A Expenses',
            'Research and development': 'R&D Expenses',
            'R&D': 'R&D Expenses',
            'Operating expenses': 'Operating Expenses',
            'Interest expense': 'Interest Expense',
            'Tax expense': 'Tax Expense',
            'Depreciation and amortization': 'Depreciation & Amortization'
          };
          
          // Apply mapping if available
          const mappedTerm = Object.keys(financialTermMappings).find(key => 
            financialItem.toLowerCase().includes(key.toLowerCase())
          );
          if (mappedTerm) {
            financialItem = financialTermMappings[mappedTerm];
          }
          
          // Clean up time period to extract year
          const yearMatch = timePeriod.match(/FY\s*(\d{4})|(\d{4})/);
          if (yearMatch) {
            timePeriod = `FY${yearMatch[1] || yearMatch[2]}`;
          }
          
          context = financialItem && timePeriod ? `${financialItem} in ${timePeriod}` : text.trim();
        } else {
          context = text.trim();
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

    const handleClick = (event: MouseEvent) => {
      // Only activate on Historical Financials tab
      if (activeTab !== 'historical-financials') return;
      
      const target = event.target as HTMLElement;
      
      // Check if clicked element contains financial data
      const text = target.textContent || '';
      const isFinancialData = /\d/.test(text) && (
        /\$|%|million|billion|thousand/.test(text) || 
        /revenue|profit|margin|cash|debt|asset|liability|equity|growth/i.test(text) ||
        target.closest('td, th, .financial-metric, [data-financial-item]')
      );
      
      if (!isFinancialData || text.trim().length < 2) return;
      
      // Get the same context as hover
      let context = '';
      let financialItem = '';
      let timePeriod = '';
      
      const row = target.closest('tr');
      const table = target.closest('table');
      
      if (row && table) {
        const firstCell = row.querySelector('td:first-child, th:first-child');
        if (firstCell) {
          financialItem = firstCell.textContent?.trim() || '';
        }
        
        const cellIndex = Array.from(row.children).indexOf(target.closest('td') || target.closest('th') as Element);
        if (cellIndex > 0) {
          const headers = table.querySelectorAll('th');
          if (headers[cellIndex]) {
            timePeriod = headers[cellIndex].textContent?.trim() || '';
          }
        }
        
        financialItem = financialItem
          .replace(/^\$?\s*/, '')
          .replace(/\s*\([^)]*\)\s*$/, '')
          .trim();
        
        const yearMatch = timePeriod.match(/FY\s*(\d{4})|(\d{4})/);
        if (yearMatch) {
          timePeriod = `FY${yearMatch[1] || yearMatch[2]}`;
        }
        
        context = financialItem && timePeriod ? `${financialItem} in ${timePeriod}` : text.trim();
      } else {
        context = text.trim();
      }
      
      // Directly trigger the analysis
      if (onDirectAnalyze) {
        const question = `Can you give me some insight behind the ${context}?`;
        console.log('Direct click analysis triggered with:', { context, question });
        onDirectAnalyze(question);
        setShowPopup(false);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handleClick);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [activeTab]);

  const handleAnalyze = () => {
    if (hoveredData.element && onDirectAnalyze) {
      // Format the question for Brian with context
      const question = `Can you give me some insight behind the ${hoveredData.context}?`;
      console.log('Hover button analysis triggered with:', { hoveredData, question });
      onDirectAnalyze(question);
      setShowPopup(false);
    } else if (hoveredData.element) {
      // Fallback to original behavior if onDirectAnalyze not provided
      console.log('Falling back to original analyze behavior');
      onHighlightAnalyze(hoveredData.element, hoveredData.context);
      setShowPopup(false);
    }
  };

  if (!showPopup) return null;

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-full"
      style={{
        left: `${popupPosition.x}px`,
        top: `${popupPosition.y}px`,
      }}
      onMouseEnter={() => setShowPopup(true)}
      onMouseLeave={() => setShowPopup(false)}
    >
      <Button
        size="sm"
        onClick={handleAnalyze}
        className="flex items-center gap-2 h-8 px-4 text-xs font-medium bg-transparent hover:bg-blue-50 border-0 text-blue-600 rounded-full transition-all duration-200"
      >
        <Sparkles className="h-3 w-3" />
        Ask your analyst
      </Button>
    </div>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import { X, MessageSquare, Copy, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KenshiAvatar } from '@/components/ui/kenshi-avatar';
import { Badge } from '@/components/ui/badge';

interface AnalysisPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMetric: string;
  context: string;
  symbol: string;
  financialData: any;
  onOpenChat: () => void;
}

export function AnalysisPopup({ 
  isOpen, 
  onClose, 
  selectedMetric, 
  context, 
  symbol, 
  financialData,
  onOpenChat 
}: AnalysisPopupProps) {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (isOpen && selectedMetric) {
      performAnalysis();
    }
  }, [isOpen, selectedMetric, context]);

  const performAnalysis = async () => {
    setIsLoading(true);
    setError('');
    setAnalysis('');

    try {
      const analysisPrompt = `${selectedMetric} - ${context}

Quick analysis for ${symbol}:

**Summary** - 2 sentences max
**Performance** - Current value, YoY change
**Drivers** - 2-3 key factors
**Outlook** - Investment impact

Be concise. Use bullets and percentages.`;

      const response = await fetch('/api/financial-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: analysisPrompt,
          financialData,
          symbol
        }),
      });

      if (!response.ok) throw new Error('Failed to get analysis');

      const data = await response.json();
      setAnalysis(data.response);
    } catch (error) {
      console.error('Analysis error:', error);
      setError('Unable to analyze this metric. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(analysis);
  };

  const formatAnalysisText = (text: string): string => {
    return text
      // Convert numbered sections (1., 2., etc.) to styled headers
      .replace(/^(\d+\.)\s*([^:.\n]+)[:.]/gm, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3 flex items-center"><span class="bg-blue-100 text-blue-800 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold mr-3">$1</span>$2</h3>')
      
      // Convert sections with headers (Performance, Drivers, etc.)
      .replace(/^\*\*([^*]+)\*\*/gm, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3 border-l-4 border-blue-500 pl-3">$1</h3>')
      
      // Convert bold text
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      
      // Convert bullet points with better styling
      .replace(/^[-•]\s*(.+)$/gm, '<li class="flex items-start mb-2"><span class="text-blue-500 mr-3 text-lg leading-none">•</span><span class="text-gray-700 leading-relaxed">$1</span></li>')
      
      // Wrap consecutive list items in ul tags
      .replace(/(<li[^>]*>.*?<\/li>\s*)+/g, '<ul class="mb-4 space-y-1">$&</ul>')
      
      // Convert percentage and dollar figures to styled spans
      .replace(/(\$[\d,]+(?:\.\d+)?[BMK]?)/g, '<span class="font-semibold text-green-700 bg-green-50 px-1 rounded">$1</span>')
      .replace(/([\d,]+(?:\.\d+)?%)/g, '<span class="font-semibold text-blue-700 bg-blue-50 px-1 rounded">$1</span>')
      
      // Convert regular paragraphs
      .replace(/^(?!<[hl]|<ul)([^<\n].+)$/gm, '<p class="mb-4 text-gray-700 leading-relaxed">$1</p>')
      
      // Add executive summary styling for first paragraph
      .replace(/^<p class="mb-4 text-gray-700 leading-relaxed">([^<]+)<\/p>/, '<div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg"><p class="text-blue-900 font-medium leading-relaxed">$1</p></div>')
      
      // Clean up any double tags
      .replace(/<\/li>\s*<li/g, '</li><li')
      .replace(/\n\s*\n/g, '\n');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup Window */}
      <Card className={`relative bg-white shadow-2xl transition-all duration-300 ${
        isMaximized 
          ? 'w-[95vw] h-[95vh]' 
          : 'w-[800px] h-[600px] max-w-[90vw] max-h-[90vh]'
      }`}>
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center gap-3">
            <KenshiAvatar state={isLoading ? 'thinking' : 'idle'} size="sm" />
            <div>
              <CardTitle className="text-lg">AI Financial Analysis</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {symbol}
                </Badge>
                <span className="text-sm text-gray-600 truncate max-w-[300px]">
                  {selectedMetric}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMaximized(!isMaximized)}
              className="h-8 w-8 p-0"
            >
              {isMaximized ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              disabled={!analysis}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-6 h-full overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <KenshiAvatar state="thinking" size="lg" />
                <div>
                  <p className="text-lg font-medium">Analyzing your selected metric...</p>
                  <p className="text-sm text-gray-600">
                    Cross-referencing financial data, SEC filings, and market trends
                  </p>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-red-500 text-lg">⚠️ Analysis Error</div>
                <p className="text-gray-600">{error}</p>
                <Button onClick={performAnalysis} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          ) : analysis ? (
            <div className="flex-1 overflow-y-auto">
              <div className="prose prose-base max-w-none">
                <div 
                  className="text-gray-800 leading-relaxed font-['Inter'] analysis-content"
                  dangerouslySetInnerHTML={{ __html: formatAnalysisText(analysis) }}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Preparing analysis...</p>
            </div>
          )}

          {/* Footer Actions */}
          {analysis && (
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <div className="text-xs text-gray-500">
                Analysis powered by Perplexity AI
              </div>
              <Button
                onClick={onOpenChat}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Continue in Chat
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
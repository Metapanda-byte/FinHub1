"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  X, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  BarChart3,
  FileText,
  Brain,
  Minimize2,
  Maximize2,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useConversationStore, type Message } from "@/lib/store/conversation-store";
import { ConversationSelector } from "./conversation-selector";
import { ChartDisplay } from "./chart-display";



interface AnalystCopilotProps {
  symbol: string | null;
  companyName: string | null;
  financialData: any;
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onQueryProcessed?: () => void;
}

const SUGGESTED_QUERIES = [
  "Analyze the latest financial performance",
  "What are the key growth drivers?",
  "Compare peer valuation metrics",
  "Explain revenue trends",
  "Assess financial health",
  "Identify potential risks"
];

export function AnalystCopilot({ 
  symbol, 
  companyName, 
  financialData, 
  isOpen, 
  onClose, 
  initialQuery,
  onQueryProcessed 
}: AnalystCopilotProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showConversationSelector, setShowConversationSelector] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Add chart generation suggestions
  const CHART_SUGGESTIONS = [
    "Show me a revenue trend chart",
    "Create a profitability analysis chart",
    "Generate a segment breakdown chart",
    "Display geographic revenue distribution",
    "Show stock price performance",
    "Create a balance sheet trend chart"
  ];

  const {
    conversations,
    currentConversationId,
    createConversation,
    getCurrentConversation,
    addMessage,
    updateConversationTitle
  } = useConversationStore();

  const currentConversation = getCurrentConversation();
  const messages = currentConversation?.messages || [];

  // Initialize conversation and welcome message
  useEffect(() => {
    if (isOpen && !currentConversationId) {
      const conversationId = createConversation(symbol || 'NEW', companyName || 'New Analysis');
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I'm your AI Analyst Co-pilot for ${companyName || symbol}. I can help you analyze financial data, understand trends, and provide insights. What would you like to explore?`,
        timestamp: new Date(),
        suggestions: SUGGESTED_QUERIES
      };
      addMessage(conversationId, welcomeMessage);
    } else if (isOpen && currentConversationId && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I'm your AI Analyst Co-pilot for ${companyName || symbol}. I can help you analyze financial data, understand trends, and provide insights. What would you like to explore?`,
        timestamp: new Date(),
        suggestions: SUGGESTED_QUERIES
      };
      addMessage(currentConversationId, welcomeMessage);
    }
  }, [isOpen, symbol, companyName, currentConversationId, messages.length, createConversation, addMessage]);

  // Handle initial query
  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSend(initialQuery, true);
      onQueryProcessed?.();
    }
  }, [initialQuery, isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (queryText?: string, hideQuery?: boolean) => {
    const messageText = queryText || input;
    if (!messageText.trim() || isLoading) return;

    // Add user message if not hidden
    if (!hideQuery && currentConversationId) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: messageText,
        timestamp: new Date()
      };
      addMessage(currentConversationId, userMessage);
    }

    setInput('');
    setIsLoading(true);

    try {
      // Check if this is a chart request
      const isChartRequest = messageText.toLowerCase().includes('chart') || 
                            messageText.toLowerCase().includes('graph') ||
                            messageText.toLowerCase().includes('show me') ||
                            messageText.toLowerCase().includes('create') ||
                            messageText.toLowerCase().includes('generate') ||
                            messageText.toLowerCase().includes('display');

      let chartData = null;

      if (isChartRequest) {
        // Generate chart
        const chartResponse = await fetch('/api/generate-chart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: messageText,
            financialData,
            symbol
          }),
        });

        const chartResult = await chartResponse.json();
        
        if (!chartResult.error) {
          chartData = chartResult.chartData;
        }
      }

      // Get AI analysis
      const response = await fetch('/api/financial-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: messageText,
          financialData,
          symbol
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        suggestions: Math.random() > 0.5 ? [
          "Tell me more about this",
          "What are the implications?",
          "Compare with industry average"
        ] : undefined,
        chartData: chartData
      };

      if (currentConversationId) {
        addMessage(currentConversationId, assistantMessage);
      }
    } catch (error) {
      console.error('Analyst error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error while analyzing the data. Please try again.',
        timestamp: new Date()
      };
      if (currentConversationId) {
        addMessage(currentConversationId, errorMessage);
      }
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-2xl z-50 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Analyst Co-pilot</h3>
            <p className="text-xs text-muted-foreground">
              {companyName ? `${companyName} (${symbol})` : symbol || 'Financial Analysis'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowConversationSelector(!showConversationSelector)}
            className="h-8 w-8"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className={cn(
                    "flex gap-3",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}>
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[280px] rounded-lg px-3 py-2 text-sm",
                      message.role === 'user' 
                        ? "bg-blue-600 text-white ml-8" 
                        : "bg-muted border"
                    )}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {typeof message.timestamp === 'string' 
                    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                      </p>
                    </div>

                    {/* Chart display */}
                    {message.chartData && (
                      <div className="ml-11 mt-2">
                        <ChartDisplay chartData={message.chartData} />
                      </div>
                    )}
                  </div>

                  {/* Suggestions */}
                  {message.suggestions && (
                    <div className="ml-11 space-y-1">
                      <p className="text-xs text-muted-foreground">Suggested follow-ups:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="h-6 text-xs px-2 rounded-full"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                  </div>
                  <div className="bg-muted border rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="text-muted-foreground">Analyzing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything about the financials..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-1 mt-2 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSuggestionClick("Summarize key metrics")}
                className="h-6 text-xs px-2 rounded-full"
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                Key Metrics
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSuggestionClick("Analyze profitability trends")}
                className="h-6 text-xs px-2 rounded-full"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Trends
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSuggestionClick("Compare to peers")}
                className="h-6 text-xs px-2 rounded-full"
              >
                <DollarSign className="w-3 h-3 mr-1" />
                Peers
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSuggestionClick("Show me a revenue trend chart")}
                className="h-6 text-xs px-2 rounded-full"
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                Charts
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Conversation Selector */}
      <ConversationSelector
        isOpen={showConversationSelector}
        onClose={() => setShowConversationSelector(false)}
        onSelectConversation={(conversationId) => {
          setShowConversationSelector(false);
        }}
      />
    </div>
  );
} 
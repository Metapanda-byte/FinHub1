"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, Bot, User, Loader2, Sparkles, TrendingUp, TrendingDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { KenshiAvatar } from "@/components/ui/kenshi-avatar";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FinancialChatProps {
  symbol: string | null;
  financialData: any;
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onQueryProcessed?: () => void;
  hideUserQuery?: boolean;
}

export function FinancialChat({ symbol, financialData, isOpen, onClose, initialQuery, onQueryProcessed, hideUserQuery }: FinancialChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Greetings! I am Kenshi, your AI financial analyst. I can help you understand ${symbol ? symbol + "'s" : "the company's"} financial performance, analyze trends, and explain year-over-year changes using financial statements, SEC filings, earnings call transcripts, and recent news reports. How may I assist you?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarState, setAvatarState] = useState<'idle' | 'listening' | 'thinking' | 'talking'>('idle');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle initial query from highlight-to-chat
  useEffect(() => {
    if (initialQuery && isOpen && !isLoading) {
      // If hiding user query, show that AI is analyzing immediately
      if (hideUserQuery) {
        setIsLoading(true);
        setAvatarState('thinking');
      }
      
      // Immediately send the query in background
      setTimeout(() => {
        handleSend(initialQuery, hideUserQuery);
        onQueryProcessed?.();
      }, 100);
    }
  }, [initialQuery, isOpen, hideUserQuery]);



  const handleSend = async (queryText?: string, hideQuery?: boolean) => {
    const messageText = queryText || input;
    if (!messageText.trim() || isLoading) return;

    // Only add user message to chat if not hiding it
    if (!hideQuery) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: messageText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
    }

    setInput('');
    setIsLoading(true);
    setAvatarState('thinking');

    try {
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
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Simulate talking animation
      setAvatarState('talking');
      setTimeout(() => setAvatarState('idle'), 2000);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error while analyzing the data. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setAvatarState('idle');
      inputRef.current?.focus();
    }
  };



  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-[400px] h-[600px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] shadow-lg z-50 flex flex-col md:w-[400px] md:h-[600px]">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <KenshiAvatar state={avatarState} size="lg" />
              {avatarState === 'thinking' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">Kenshi AI Assistant</CardTitle>
              <CardDescription className="text-sm">
                {symbol ? `Analyzing ${symbol} with precision!` : 'Ready to serve!'}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' && "justify-end"
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <KenshiAvatar 
                      state={message.id === messages[messages.length - 1]?.id && isLoading ? 'thinking' : 'idle'} 
                      size="md" 
                    />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[80%]",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="p-2 bg-primary rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="p-2 bg-muted rounded-full h-8 w-8 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>



        {/* Input Area */}
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (e.target.value.length > 0 && avatarState === 'idle') {
                  setAvatarState('listening');
                } else if (e.target.value.length === 0) {
                  setAvatarState('idle');
                }
              }}
              placeholder="Ask about financial performance..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
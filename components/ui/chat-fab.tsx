"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatFABProps {
  onClick: () => void;
  hasNewFeature?: boolean;
}

export function ChatFAB({ onClick, hasNewFeature = true }: ChatFABProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 group bg-primary hover:bg-primary/90"
          >
            <div className="relative">
              <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform" />
              {hasNewFeature && (
                <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
              )}
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>AI Financial Analyst</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
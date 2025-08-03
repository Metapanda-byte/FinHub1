"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-row gap-1">
      <Button
        variant={theme === "dark" ? "default" : "outline"}
        size="icon"
        onClick={() => setTheme("dark")}
        className={cn(
          "h-8 w-8 rounded-lg",
          theme === "dark" 
            ? "bg-slate-700 text-white hover:bg-slate-600" 
            : "border-slate-300 text-slate-600 hover:bg-slate-100"
        )}
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </Button>
      
      <Button
        variant={theme === "light" ? "default" : "outline"}
        size="icon"
        onClick={() => setTheme("light")}
        className={cn(
          "h-8 w-8 rounded-lg",
          theme === "light" 
            ? "bg-slate-200 text-slate-900 hover:bg-slate-300" 
            : "border-slate-300 text-slate-600 hover:bg-slate-100"
        )}
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4" />
      </Button>
    </div>
  );
}
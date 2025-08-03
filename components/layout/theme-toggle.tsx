"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-row gap-0.5">
      <Button
        variant={theme === "dark" ? "default" : "outline"}
        size="icon"
        onClick={() => setTheme("dark")}
        className={cn(
          "h-7 w-7 rounded-md",
          theme === "dark" 
            ? "bg-slate-700 text-white hover:bg-slate-600" 
            : "border-slate-300 text-slate-600 hover:bg-slate-100"
        )}
        aria-label="Dark mode"
      >
        <Moon className="h-3.5 w-3.5" />
      </Button>
      
      <Button
        variant={theme === "light" ? "default" : "outline"}
        size="icon"
        onClick={() => setTheme("light")}
        className={cn(
          "h-7 w-7 rounded-md",
          theme === "light" 
            ? "bg-slate-200 text-slate-900 hover:bg-slate-300" 
            : "border-slate-300 text-slate-600 hover:bg-slate-100"
        )}
        aria-label="Light mode"
      >
        <Sun className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
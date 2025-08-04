"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-row gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md bg-transparent text-muted-foreground"
          disabled
        >
          <Moon className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md bg-transparent text-muted-foreground"
          disabled
        >
          <Sun className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  const currentTheme = resolvedTheme || theme;

  return (
    <div className="flex flex-row gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme("dark")}
        className={cn(
          "h-7 w-7 rounded-md transition-all duration-200",
          currentTheme === "dark" 
            ? "bg-muted text-foreground shadow-sm hover:bg-muted/80" 
            : "bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
        aria-label="Dark mode"
      >
        <Moon className="h-3.5 w-3.5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme("light")}
        className={cn(
          "h-7 w-7 rounded-md transition-all duration-200",
          currentTheme === "light" 
            ? "bg-muted text-foreground shadow-sm hover:bg-muted/80" 
            : "bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
        aria-label="Light mode"
      >
        <Sun className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
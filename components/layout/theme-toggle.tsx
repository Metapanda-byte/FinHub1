"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <ToggleGroup 
      type="single" 
      value={theme} 
      onValueChange={(value) => {
        if (value) setTheme(value);
      }}
      className="flex h-9 w-16 bg-muted rounded-full p-0.5"
    >
      <ToggleGroupItem 
        value="light" 
        className="flex-1 h-8 w-8 rounded-full data-[state=on]:bg-background data-[state=on]:shadow-sm border-0 hover:bg-transparent"
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="dark" 
        className="flex-1 h-8 w-8 rounded-full data-[state=on]:bg-background data-[state=on]:shadow-sm border-0 hover:bg-transparent"
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
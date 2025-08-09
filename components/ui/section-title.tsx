"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SectionTitleSize = "xs" | "sm" | "md" | "lg";

interface SectionTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: SectionTitleSize;
  muted?: boolean;
  accentClassName?: string; // override accent color if needed
  textClassName?: string; // extra classes for the text span
}

export function SectionTitle({
  children,
  size = "md",
  muted = false,
  className,
  accentClassName,
  textClassName,
  ...props
}: SectionTitleProps) {
  const sizeClass =
    size === "xs" ? "text-[12px]" :
    size === "sm" ? "text-[13px]" :
    size === "lg" ? "text-[16px]" :
    "text-[14px]"; // md default
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <span className={cn("h-3 w-0.5 bg-[hsl(var(--finhub-orange))]", accentClassName)} />
      <span className={cn(sizeClass, muted ? "font-medium text-muted-foreground" : "font-semibold text-foreground", "tracking-tight", textClassName)}>
        {children}
      </span>
    </div>
  );
} 
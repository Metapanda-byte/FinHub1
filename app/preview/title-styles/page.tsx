"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Style = {
  id: string;
  label: string;
  titleClass: string;
  containerClass?: string;
  prefixBar?: boolean;
};

const styles: Style[] = [
  {
    id: "elegant-sans",
    label: "Elegant sans",
    titleClass: "text-sm font-semibold tracking-tight",
  },
  {
    id: "uppercase-micro",
    label: "Uppercase micro-heading",
    titleClass: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
  },
  {
    id: "serif-accent",
    label: "Serif accent",
    titleClass: "text-sm font-semibold tracking-tight font-serif",
  },
  {
    id: "condensed-compact",
    label: "Condensed compact",
    titleClass: "text-xs font-bold tracking-wide",
  },
  {
    id: "gradient-emphasis",
    label: "Subtle gradient emphasis",
    titleClass: "text-sm font-semibold bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent",
  },
  {
    id: "mono-subdued",
    label: "Monochrome subdued",
    titleClass: "text-xs font-medium text-slate-300/90",
  },
  // Special layouts
  {
    id: "divider-underline",
    label: "With divider underline",
    titleClass: "text-sm font-semibold tracking-tight",
    containerClass: "pb-2 border-b border-border/60",
  },
  {
    id: "accent-bar",
    label: "Prefix accent bar",
    titleClass: "text-sm font-semibold tracking-tight",
    prefixBar: true,
  },
  {
    id: "tight-smallcaps",
    label: "Tight small-caps",
    titleClass: "text-[12px] font-semibold tracking-[0.12em] uppercase",
  },
  {
    id: "lightweight-modern",
    label: "Lightweight modern",
    titleClass: "text-sm font-medium tracking-tight text-slate-200",
  },
];

export default function TitleStylesPreview() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">Card Title Style Preview</h1>
        <p className="text-xs text-muted-foreground">Dark theme preview using app components</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {styles.map((s) => (
          <Card key={s.id} className="h-full">
            <CardHeader className={s.containerClass || undefined}>
              <CardTitle className={s.titleClass}>
                <span className="flex items-center gap-2">
                  {s.prefixBar && (
                    <span className="h-3 w-0.5 bg-[hsl(var(--finhub-orange))]" />
                  )}
                  {s.label}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. This area
                shows spacing beneath the title.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 
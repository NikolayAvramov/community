"use client";

import { Button } from "@/components/ui/button";
import { CONTENT_VIEW_MODES, type ContentViewMode } from "@/lib/content-views";
import { cn } from "@/lib/utils";
import { Grid3x3, LayoutList, List, Newspaper } from "lucide-react";

const ICONS: Record<ContentViewMode, typeof Grid3x3> = {
  grid: Grid3x3,
  list: LayoutList,
  compact: List,
  magazine: Newspaper,
};

type Props = {
  view: ContentViewMode;
  onChange: (view: ContentViewMode) => void;
  className?: string;
};

export function ContentViewToggle({ view, onChange, className }: Props) {
  return (
    <div
      className={cn(
        "inline-flex rounded-xl border border-violet-100 bg-violet-50/60 p-1 shadow-sm dark:border-violet-900/50 dark:bg-violet-950/30",
        className,
      )}
    >
      {(Object.keys(CONTENT_VIEW_MODES) as ContentViewMode[]).map((mode) => {
        const Icon = ICONS[mode];
        const active = view === mode;
        return (
          <Button
            key={mode}
            type="button"
            size="sm"
            variant={active ? "default" : "ghost"}
            className={cn(
              "h-8 gap-1.5 px-2.5",
              !active && "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
            )}
            onClick={() => onChange(mode)}
            title={CONTENT_VIEW_MODES[mode]}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{CONTENT_VIEW_MODES[mode]}</span>
          </Button>
        );
      })}
    </div>
  );
}

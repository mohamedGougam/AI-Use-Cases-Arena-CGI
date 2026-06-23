"use client";

import { type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CollapsibleSectionSummary {
  primary?: string;
  secondary?: string;
}

export function ArchitectCollapsibleSection({
  id,
  title,
  score,
  status,
  summary,
  open,
  highlighted = false,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  score?: string;
  status?: ReactNode;
  summary?: CollapsibleSectionSummary;
  open: boolean;
  highlighted?: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-36 rounded-xl border border-border/20 bg-card/40 transition-colors",
        highlighted && "border-primary/50 bg-primary/5 shadow-[0_0_0_1px_rgba(255,63,107,0.18)]"
      )}
    >
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-start justify-between gap-3 p-4 text-left"
        aria-expanded={open}
        aria-controls={`${id}-content`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{title}</span>
            {score ? (
              <Badge variant="outline" className="border-primary/30 text-primary">
                {score}
              </Badge>
            ) : null}
            {status}
          </div>
          {!open && (summary?.primary || summary?.secondary) ? (
            <div className="mt-2 space-y-1 text-sm text-muted">
              {summary?.primary ? <p>{summary.primary}</p> : null}
              {summary?.secondary ? <p className="text-xs">{summary.secondary}</p> : null}
            </div>
          ) : null}
        </div>
        <ChevronDown
          className={cn("mt-0.5 h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={`${id}-content`}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

export function ArchitectReviewNav({
  items,
  onSelect,
  onExpandAll,
  onCollapseAll,
}: {
  items: { id: string; label: string; active?: boolean }[];
  onSelect: (id: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}) {
  return (
    <div className="sticky top-2 z-20 rounded-xl border border-border/20 bg-background/90 p-3 backdrop-blur">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={onExpandAll}>
          Expand All
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCollapseAll}>
          Collapse All
        </Button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 xl:grid xl:grid-cols-4 xl:overflow-visible">
        {items.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant={item.active ? "default" : "outline"}
            size="sm"
            className="justify-start whitespace-nowrap"
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import type { UseCaseBadge } from "@/types";
import { cn } from "@/lib/utils";

const badgeVariantMap: Record<UseCaseBadge, "trending" | "impact" | "quick" | "strategic" | "crowd" | "default"> = {
  Trending: "trending",
  "High Impact": "impact",
  "Quick Win": "quick",
  "Strategic Bet": "strategic",
  "Crowd Favorite": "crowd",
};

interface BadgeDisplayProps {
  badges: UseCaseBadge[];
  className?: string;
}

export function BadgeDisplay({ badges, className }: BadgeDisplayProps) {
  if (!badges.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {badges.map((b) => (
        <Badge key={b} variant={badgeVariantMap[b]} className="shadow-glow-sm">
          {b}
        </Badge>
      ))}
    </div>
  );
}

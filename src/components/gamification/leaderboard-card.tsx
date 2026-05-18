"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  name: string;
  subtitle: string;
  score: number;
  avatar?: string;
}

interface LeaderboardCardProps {
  title: string;
  entries: LeaderboardEntry[];
  valueLabel?: string;
}

const rankIcons = [Trophy, Medal, Award];

export function LeaderboardCard({
  title,
  entries,
  valueLabel = "XP",
}: LeaderboardCardProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="mb-4 text-lg font-bold">{title}</h3>
      <div className="space-y-3">
        {entries.map((entry, i) => {
          const RankIcon = rankIcons[i] ?? Award;
          return (
            <motion.div
              key={`${entry.name}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "flex items-center gap-3 rounded-lg p-3 transition-colors",
                i === 0 && "bg-primary/10 border border-primary/20 glow-border"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                  i === 0 ? "bg-primary text-primary-foreground" : "bg-white/10"
                )}
              >
                {i < 3 ? <RankIcon className="h-4 w-4" /> : entry.rank}
              </div>
              {entry.avatar && (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                  {entry.avatar}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{entry.name}</p>
                <p className="truncate text-xs text-muted">{entry.subtitle}</p>
              </div>
              <span className="font-bold text-primary">
                {entry.score} {valueLabel}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

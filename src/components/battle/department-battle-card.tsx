"use client";

import { motion } from "framer-motion";
import type { DepartmentStats } from "@/types";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DepartmentBattleCardProps {
  stats: DepartmentStats[];
  maxScore: number;
}

export function DepartmentBattleCard({ stats, maxScore }: DepartmentBattleCardProps) {
  if (!stats.length) {
    return (
      <p className="text-sm text-muted py-4 text-center">
        No department rankings — submit use cases to start the battle.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {stats.map((dept, i) => {
        const percent = maxScore > 0 ? (dept.innovationScore / maxScore) * 100 : 0;
        return (
          <motion.div
            key={dept.department}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={cn(
              "glass-card p-4",
              i === 0 && "border-primary/30 shadow-glow-sm"
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                    i === 0 ? "bg-primary text-primary-foreground" : "bg-white/10"
                  )}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{dept.department}</p>
                  <p className="text-xs text-muted">
                    {dept.useCaseCount} ideas · {dept.totalVotes} votes
                  </p>
                </div>
              </div>
              <span className="text-lg font-bold text-primary">{dept.innovationScore}</span>
            </div>
            <Progress value={percent} className="h-2" />
          </motion.div>
        );
      })}
    </div>
  );
}

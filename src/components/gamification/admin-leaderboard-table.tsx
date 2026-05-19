"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminContributorRow } from "@/lib/admin-leaderboard";
import { formatRelativeDate } from "@/lib/utils";

const rankIcons = [Trophy, Medal, Award];

interface AdminLeaderboardTableProps {
  rows: AdminContributorRow[];
}

export function AdminLeaderboardTable({ rows }: AdminLeaderboardTableProps) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        No users have signed in or contributed yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border/20 text-xs uppercase tracking-wide text-muted">
            <th className="pb-3 pr-3 font-semibold">Rank</th>
            <th className="pb-3 pr-3 font-semibold">User</th>
            <th className="pb-3 pr-3 text-right font-semibold">Use cases</th>
            <th className="pb-3 pr-3 text-right font-semibold">Votes cast</th>
            <th className="pb-3 pr-3 text-right font-semibold hidden sm:table-cell">
              Votes received
            </th>
            <th className="pb-3 pr-3 text-right font-semibold hidden md:table-cell">
              Comments
            </th>
            <th className="pb-3 text-right font-semibold">Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const RankIcon = rankIcons[i] ?? Award;
            return (
              <motion.tr
                key={row.email}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className={cn(
                  "border-b border-border/10 transition-colors",
                  i === 0 && "bg-primary/5"
                )}
              >
                <td className="py-3 pr-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                      i === 0
                        ? "bg-primary text-primary-foreground"
                        : "surface-muted"
                    )}
                  >
                    {i < 3 ? <RankIcon className="h-4 w-4" /> : row.rank}
                  </div>
                </td>
                <td className="py-3 pr-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                      {row.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{row.name}</p>
                      <p className="truncate text-xs text-muted" title={row.email}>
                        {row.email}
                      </p>
                      {row.lastSignedInAt && (
                        <p className="text-[10px] text-muted/80">
                          Last sign-in {formatRelativeDate(row.lastSignedInAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-3 text-right font-medium tabular-nums">
                  {row.submissions}
                </td>
                <td className="py-3 pr-3 text-right font-medium tabular-nums">
                  {row.votesCast}
                </td>
                <td className="py-3 pr-3 text-right font-medium tabular-nums hidden sm:table-cell">
                  {row.votesReceived}
                </td>
                <td className="py-3 pr-3 text-right font-medium tabular-nums hidden md:table-cell">
                  {row.comments}
                </td>
                <td className="py-3 text-right font-bold text-primary tabular-nums">
                  {row.score}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

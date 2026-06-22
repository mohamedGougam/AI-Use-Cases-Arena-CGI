"use client";

import { useEffect, useState } from "react";
import { Database } from "lucide-react";
import { fetchArenaState } from "@/lib/arena-db/client-sync";
import type { ArenaDbStatus } from "@/lib/arena-db/types";
import { EvaluationHistoryPanel } from "@/components/architect/evaluation-history-panel";

export function ArenaDatabaseStatus() {
  const [status, setStatus] = useState<ArenaDbStatus | null>(null);

  useEffect(() => {
    fetchArenaState().then((result) => {
      if (result?.status) setStatus(result.status);
    });
  }, []);

  if (!status) return null;

  return (
    <div className="flex items-start gap-2 rounded-lg border border-border/15 bg-background/40 p-3 text-xs text-muted">
      <Database className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <p className="font-medium text-foreground">Database: {status.backend}</p>
        <p>{status.message}</p>
      </div>
    </div>
  );
}

export function PortfolioHistorySection() {
  return (
    <div className="space-y-4">
      <ArenaDatabaseStatus />
      <EvaluationHistoryPanel />
    </div>
  );
}

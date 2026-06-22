"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ReadinessGaugeProps {
  label: string;
  score: number;
  size?: "sm" | "lg";
  className?: string;
}

function scoreColor(score: number): string {
  if (score >= 75) return "text-emerald-500";
  if (score >= 50) return "text-amber-500";
  return "text-primary";
}

function scoreStroke(score: number): string {
  if (score >= 75) return "stroke-emerald-500";
  if (score >= 50) return "stroke-amber-500";
  return "stroke-primary";
}

export function ReadinessGauge({ label, score, size = "sm", className }: ReadinessGaugeProps) {
  const radius = size === "lg" ? 52 : 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const dim = size === "lg" ? 128 : 88;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={size === "lg" ? 8 : 6}
            className="text-muted/20"
          />
          <motion.circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            strokeWidth={size === "lg" ? 8 : 6}
            strokeLinecap="round"
            className={scoreStroke(score)}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold tabular-nums", size === "lg" ? "text-2xl" : "text-lg", scoreColor(score))}>
            {score}%
          </span>
        </div>
      </div>
      <p className={cn("text-center font-medium", size === "lg" ? "text-sm" : "text-xs text-muted")}>
        {label}
      </p>
    </div>
  );
}

export function OverallReadinessBanner({ score }: { score: number }) {
  return (
    <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 via-background to-background p-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Overall AI Readiness
          </p>
          <p className="mt-1 text-sm text-muted">
            Composite score across business, data, AI, security, and delivery dimensions.
          </p>
        </div>
        <ReadinessGauge label="" score={score} size="lg" />
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "./animated-counter";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  animate?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  animate = true,
  className,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn("glass-card-hover p-5 xl:p-6 2xl:p-7", className)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="type-body text-muted">{label}</p>
          <p className="type-stat mt-2">
            {animate && typeof value === "number" ? (
              <AnimatedCounter value={value} />
            ) : (
              value
            )}
          </p>
          {trend && (
            <p className="type-caption mt-1 line-clamp-2 break-words text-primary">{trend}</p>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-2.5 xl:p-3">
          <Icon className="h-5 w-5 text-primary xl:h-6 xl:w-6" />
        </div>
      </div>
    </motion.div>
  );
}

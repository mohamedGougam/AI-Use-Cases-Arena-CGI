"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon: Icon, action }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        {Icon && (
          <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2 xl:p-3">
            <Icon className="h-6 w-6 text-primary xl:h-7 xl:w-7" />
          </div>
        )}
        <h1 className="type-page-title">{title}</h1>
        {subtitle && <p className="type-body mt-2 max-w-3xl text-muted">{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  );
}

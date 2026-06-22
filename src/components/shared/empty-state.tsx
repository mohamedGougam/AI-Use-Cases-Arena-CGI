import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  action,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      <Icon className="mb-4 h-12 w-12 text-muted xl:h-16 xl:w-16" />
      <p className="text-lg font-medium xl:text-xl 2xl:text-2xl">{title}</p>
      <p className="type-body mt-2 max-w-md text-muted">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

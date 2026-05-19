import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

export function UseCaseDateBadge({
  createdAt,
  className,
}: {
  createdAt: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border/20 bg-foreground/5 px-2 py-0.5 text-xs font-medium text-muted",
        className
      )}
      title={formatDate(createdAt)}
    >
      <Calendar className="h-3 w-3 shrink-0" aria-hidden />
      {formatDate(createdAt)}
    </span>
  );
}

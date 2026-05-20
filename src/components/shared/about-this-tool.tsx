import { cn } from "@/lib/utils";

const CREDIT = "Developed for CGI - Mohamed Gougam";
const RELEASE = "May 2026";

export function AboutThisTool({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <div
        className={cn(
          "rounded-lg border border-border/15 bg-background/40 px-3 py-3",
          className
        )}
      >
        <p className="text-xs font-semibold text-foreground">About this tool</p>
        <p className="mt-1.5 text-[10px] leading-relaxed text-muted">
          Collaboration arena CGI runs with client teams—submit, vote on, and
          prioritize AI use cases during an engagement.
        </p>
        <p className="mt-2 text-[10px] leading-relaxed text-muted/80">
          {CREDIT}
          <span className="text-muted/60"> · {RELEASE}</span>
        </p>
      </div>
    );
  }

  return (
    <section className={cn("glass-card p-5 md:p-6", className)}>
      <h3 className="text-base font-bold tracking-tight">About this tool</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        The AI Use Cases Arena is a lightweight space CGI uses with client teams on
        engagements. Consultants and clients capture AI opportunities, debate impact
        and effort in the open, and leave each touchpoint with a transparent backlog
        sponsors can trust—without losing nuance in email threads or workshop notes.
      </p>
      <p className="mt-4 text-xs leading-relaxed text-muted/80">
        {CREDIT}
        <span className="text-muted/60"> · {RELEASE}</span>
      </p>
    </section>
  );
}

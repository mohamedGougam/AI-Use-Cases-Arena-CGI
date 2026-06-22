import { cn } from "@/lib/utils";

const CREDIT = "CGI · Mohamed Gougam";
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
        <p className="type-caption font-semibold text-foreground">About this tool</p>
        <p className="type-caption mt-1.5 text-muted">
          CGI&apos;s telecom AI discovery arena—submit, assess, estimate, and prioritize
          use cases with the AI Architect.
        </p>
        <p className="type-caption mt-2 text-muted/80">
          {CREDIT}
          <span className="text-muted/60"> · {RELEASE}</span>
        </p>
      </div>
    );
  }

  return (
    <section className={cn("glass-card p-5 md:p-6", className)}>
      <h3 className="text-base font-bold tracking-tight xl:text-lg 2xl:text-xl">About this tool</h3>
      <p className="type-body mt-3 text-muted">
        The AI Use Cases Arena is CGI&apos;s telecom-grade AI Opportunity Discovery platform:
        consultants and client stakeholders capture ideas, assess readiness with the AI Architect
        persona, estimate delivery effort, and prioritise investment—without leaving the workshop.
      </p>
      <p className="type-caption mt-4 text-muted/80">
        {CREDIT}
        <span className="text-muted/60"> · {RELEASE}</span>
      </p>
    </section>
  );
}

import { SCORE_RULES } from "@/lib/participants";

export function ScoreGuide({
  compact = false,
  variant = "participant",
}: {
  compact?: boolean;
  variant?: "participant" | "admin";
}) {
  return (
    <div className={compact ? "text-sm" : "glass-card p-5"}>
      {!compact && <h3 className="mb-3 font-bold">How scoring works</h3>}
      <ul className="space-y-2 text-muted">
        {SCORE_RULES.map((rule) => (
          <li key={rule.label} className="flex justify-between gap-4">
            <span>{rule.label}</span>
            <span className="font-semibold text-primary shrink-0">
              +{rule.points} pt{rule.points === 1 ? "" : "s"}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">
        {variant === "admin"
          ? "Points apply to CGI participants only. Administrator accounts are not ranked or scored."
          : "Your CGI work email links every submission, vote, and comment to you on the leaderboard."}
      </p>
    </div>
  );
}

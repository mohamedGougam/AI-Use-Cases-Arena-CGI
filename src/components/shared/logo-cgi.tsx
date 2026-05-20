import { cn } from "@/lib/utils";

type LogoCgiProps = {
  className?: string;
  /** Red wordmark (default) or white for dark surfaces. */
  variant?: "default" | "inverse";
};

/** CGI wordmark — brand red [#E31937](https://www.cgi.com/en) per CGI logo guidelines. */
export function LogoCgi({ className, variant = "default" }: LogoCgiProps) {
  return (
    <span
      className={cn(
        "inline-flex select-none items-baseline gap-0.5 font-black tracking-tight",
        variant === "inverse" ? "text-white" : "text-[#E31937]",
        className
      )}
      aria-label="CGI"
    >
      <span className="text-2xl leading-none sm:text-3xl">CGI</span>
      <span className="translate-y-[-0.2em] text-[0.45em] font-bold leading-none opacity-90">
        ®
      </span>
    </span>
  );
}

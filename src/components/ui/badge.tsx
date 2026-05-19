import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-primary/30 bg-primary/10 text-primary",
        secondary: "border-secondary/30 bg-secondary/20 text-secondary-foreground",
        outline: "border-border/20 text-muted",
        trending: "border-orange-500/30 bg-orange-500/10 text-orange-400",
        impact: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        quick: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
        strategic: "border-purple-500/30 bg-purple-500/10 text-purple-400",
        crowd: "border-pink-500/30 bg-pink-500/10 text-pink-400",
        status: "border-border/20 surface-muted text-muted",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

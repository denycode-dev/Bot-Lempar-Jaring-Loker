import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs dark:shadow-none",
        brand:
          "border-transparent bg-brand text-brand-foreground shadow-xs dark:shadow-none",
        brandSubtle:
          "border-brand/20 bg-brand-subtle text-brand",
        secondary:
          "border-border bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-xs dark:shadow-none",
        outline: "text-foreground border-border",
        queued:
          "border-border bg-secondary text-[#52525B] dark:text-muted-foreground",
        processing:
          "border-brand/20 bg-brand-subtle text-brand",
        sent:
          "border-brand/20 bg-brand-subtle text-brand font-medium",
        interview:
          "border-success/20 bg-success/10 text-success",
        rejected:
          "border-border bg-secondary text-muted-foreground",
        failed:
          "border-destructive/20 bg-destructive/10 text-destructive",
        success:
          "border-success/20 bg-success/10 text-success",
        successSubtle:
          "border-success/20 bg-success/10 text-success",
        destructiveSubtle:
          "border-destructive/20 bg-destructive/10 text-destructive",
        warning:
          "border-warning/20 bg-warning/10 text-warning",
        info:
          "border-brand/20 bg-brand-subtle text-brand",
        purple:
          "border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400",
        glints:
          "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        linkedin:
          "border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400",
        indeed:
          "border-purple-500/25 bg-purple-500/10 text-purple-600 dark:text-purple-400",
        jobstreet:
          "border-muted bg-muted/60 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

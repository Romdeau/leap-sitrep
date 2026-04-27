import type { HTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-[0.16em]",
  {
    variants: {
      variant: {
        default: "border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--foreground)]",
        accent: "border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--accent-foreground)]",
        outline: "border-[color:var(--border)] text-[color:var(--muted-foreground)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

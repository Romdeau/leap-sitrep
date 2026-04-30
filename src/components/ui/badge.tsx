import type { HTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 border px-2 py-0.5 font-display text-[0.6875rem] font-bold uppercase leading-none tracking-[0.16em]",
  {
    variants: {
      variant: {
        default:
          "border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--foreground)]",
        accent:
          "border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--accent-foreground)]",
        outline:
          "border-[color:var(--border)] bg-transparent text-[color:var(--muted-foreground)]",
        danger:
          "border-[color:var(--danger)] bg-[color:var(--danger)] text-[color:var(--danger-foreground)]",
        ghost:
          "border-transparent bg-transparent text-[color:var(--muted-foreground)]",
      },
      shape: {
        square: "rounded-sm",
        pill: "rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "square",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, shape, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ shape, variant }), className)} {...props} />;
}

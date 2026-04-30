import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * EyebrowLabel — small all-caps display label.
 * Replaces the duplicated `text-xs uppercase tracking-[0.16em]` pattern.
 */
export function EyebrowLabel({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { children?: ReactNode }) {
  return (
    <span className={cn("eyebrow", className)} {...props}>
      {children}
    </span>
  );
}

import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * RegistrationFrame — wraps any block in the four corner registration ticks
 * seen on every BLKOUT card. Pure CSS (defined in index.css).
 */
export function RegistrationFrame({
  accent = false,
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { accent?: boolean; children?: ReactNode }) {
  return (
    <div
      className={cn("reg-frame", accent && "reg-frame--accent", className)}
      {...props}
    >
      <span aria-hidden className="reg-bl" />
      <span aria-hidden className="reg-br" />
      {children}
    </div>
  );
}

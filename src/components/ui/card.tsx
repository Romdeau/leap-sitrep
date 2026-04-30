import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Card is the canonical "panel" surface in the app. After the visual overhaul
 * it renders a near-rectangular bordered surface with a small radius, a soft
 * print-paper shadow, and the new BLKOUT registration-tick frame so any panel
 * reads like a piece of field reference.
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "reg-frame relative rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] shadow-[var(--shadow-card)]",
        className,
      )}
      {...props}
    >
      <span aria-hidden className="reg-bl" />
      <span aria-hidden className="reg-br" />
      {props.children}
    </div>
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2 p-5 sm:p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "font-display text-2xl font-bold uppercase leading-[1.05] tracking-wide text-[color:var(--foreground)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm leading-6 text-[color:var(--muted-foreground)]", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-4 p-5 pt-0 sm:p-6 sm:pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 border-t border-[color:var(--border-faint)] p-5 sm:p-6",
        className,
      )}
      {...props}
    />
  );
}

import type { ButtonHTMLAttributes } from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-sm border font-display font-semibold uppercase tracking-[0.12em] transition-colors transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--accent-foreground)] hover:brightness-110",
        outline:
          "border-[color:var(--border-strong)] bg-transparent text-[color:var(--foreground)] hover:border-[color:var(--accent)] hover:bg-[color:var(--surface-elevated)] hover:text-[color:var(--accent)]",
        ghost:
          "border-transparent bg-transparent text-[color:var(--muted-foreground)] hover:bg-[color:var(--surface-elevated)] hover:text-[color:var(--foreground)]",
        destructive:
          "border-[color:var(--danger)] bg-[color:var(--danger)] text-[color:var(--danger-foreground)] hover:brightness-110",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-[0.8125rem]",
        lg: "h-11 px-5 text-sm",
        icon: "h-9 w-9 px-0 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  asChild = false,
  className,
  size,
  type = "button",
  variant,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ size, variant }), className)}
      type={type}
      {...props}
    />
  );
}

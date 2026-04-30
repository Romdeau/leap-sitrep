import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface WizardStep {
  /** Stable identifier — used for the React key. */
  id: string;
  /** Step label. */
  label: ReactNode;
  /** Optional supplemental text shown below the label. */
  description?: ReactNode;
  /** When true the step is rendered with the active treatment. */
  active?: boolean;
  /** When true the step is rendered with the completed/check treatment. */
  complete?: boolean;
}

interface WizardStepperProps {
  steps: WizardStep[];
  className?: string;
  ariaLabel?: string;
}

/**
 * WizardStepper — horizontal progress indicator for multi-step flows
 * (e.g. the roster builder). Visual only; navigation between steps is
 * the responsibility of the parent.
 */
export function WizardStepper({ ariaLabel = "Wizard progress", className, steps }: WizardStepperProps) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <ol
      aria-label={ariaLabel}
      className={cn(
        "flex flex-wrap gap-2 rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] p-3",
        className,
      )}
    >
      {steps.map((step, index) => {
        const status = step.complete ? "complete" : step.active ? "active" : "pending";

        return (
          <li
            key={step.id}
            aria-current={step.active ? "step" : undefined}
            className={cn(
              "flex flex-1 min-w-[140px] items-center gap-2 rounded-sm border px-3 py-2 text-xs uppercase tracking-[0.16em] transition-colors",
              status === "complete" &&
                "border-[color:var(--accent)]/40 bg-[color:var(--surface-muted)] text-[color:var(--foreground)]",
              status === "active" &&
                "border-[color:var(--foreground)] bg-[color:var(--surface)] text-[color:var(--foreground)]",
              status === "pending" &&
                "border-[color:var(--border)] text-[color:var(--subtle-foreground)]",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[0.625rem] font-semibold",
                status === "complete" &&
                  "border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--accent-foreground)]",
                status === "active" &&
                  "border-[color:var(--foreground)] text-[color:var(--foreground)]",
                status === "pending" &&
                  "border-[color:var(--border)] text-[color:var(--subtle-foreground)]",
              )}
            >
              {status === "complete" ? "✓" : index + 1}
            </span>
            <span className="flex flex-col">
              <span className="font-display text-[0.6875rem] font-semibold leading-tight">{step.label}</span>
              {step.description ? (
                <span className="mt-0.5 text-[0.625rem] normal-case tracking-normal text-[color:var(--muted-foreground)]">
                  {step.description}
                </span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

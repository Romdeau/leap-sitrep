import type { KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

import { EyebrowLabel } from "./eyebrow-label";

interface DamageTrackProps {
  /** Total slots in the damage track. */
  size: number;
  /** Number of filled (damaged) slots. */
  value: number;
  onChange?: (next: number) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * DamageTrack — pip-row damage indicator, mirroring the `Damage Track ● ●`
 * pattern printed on the unit cards. Click a pip to toggle damage to that
 * level. Keyboard `[`/`]` decrement/increment.
 */
export function DamageTrack({
  className,
  disabled = false,
  label = "Damage Track",
  onChange,
  size,
  value,
}: DamageTrackProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (onChange === undefined || disabled) return;

    if (event.key === "]" || event.key === "ArrowRight" || event.key === "+") {
      event.preventDefault();
      onChange(Math.min(size, value + 1));
    } else if (event.key === "[" || event.key === "ArrowLeft" || event.key === "-") {
      event.preventDefault();
      onChange(Math.max(0, value - 1));
    }
  }

  return (
    <div
      aria-label={label}
      aria-valuemax={size}
      aria-valuemin={0}
      aria-valuenow={value}
      className={cn(
        "inline-flex flex-col gap-1.5 rounded-sm border border-[color:var(--border)] bg-[color:var(--surface-sunken)] px-3 py-2",
        disabled && "opacity-50",
        className,
      )}
      onKeyDown={handleKeyDown}
      role="slider"
      tabIndex={disabled ? -1 : 0}
    >
      <EyebrowLabel>{label}</EyebrowLabel>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: size }, (_, index) => {
          const filled = index < value;
          return (
            <button
              key={index}
              aria-label={`${label} ${index + 1}`}
              aria-pressed={filled}
              className={cn(
                "size-4 rounded-md border-2 transition-colors",
                filled
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)]"
                  : "border-[color:var(--border-strong)] bg-transparent hover:border-[color:var(--accent)]",
                disabled && "pointer-events-none",
              )}
              disabled={disabled || onChange === undefined}
              onClick={() => onChange?.(filled && value === index + 1 ? index : index + 1)}
              type="button"
            />
          );
        })}
      </div>
    </div>
  );
}

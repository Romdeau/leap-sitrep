import { cn } from "@/lib/utils";

export interface FilterChip {
  /** Stable identifier used for selection. */
  id: string;
  /** Human-readable label rendered on the chip. */
  label: string;
  /** Optional secondary count or annotation displayed after the label. */
  count?: number;
}

export interface FilterChipsProps {
  /** Optional eyebrow-style label rendered before the chip group (e.g. "Mode"). */
  label?: string;
  options: FilterChip[];
  /** Currently selected chip id, or null when the "All" option is active. */
  value: string | null;
  onChange: (next: string | null) => void;
  /** Label for the implicit "all" chip. Defaults to "All". */
  allLabel?: string;
  /** Total count for the "All" chip. */
  allCount?: number;
  className?: string;
}

/**
 * Simple, non-multiselect filter chip strip used on indices like /scenarios and /forces.
 * Layout-only — no semantic theming.
 */
export function FilterChips({
  label,
  options,
  value,
  onChange,
  allLabel = "All",
  allCount,
  className,
}: FilterChipsProps) {
  const renderChip = (id: string | null, chipLabel: string, count?: number) => {
    const active = id === value;
    return (
      <button
        key={id ?? "__all"}
        type="button"
        aria-pressed={active}
        onClick={() => onChange(id)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition",
          active
            ? "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--background)]"
            : "border-[color:var(--border)] text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]",
        )}
      >
        <span>{chipLabel}</span>
        {typeof count === "number" ? (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
              active
                ? "bg-[color:var(--background)]/20 text-[color:var(--background)]"
                : "bg-[color:var(--surface-muted)] text-[color:var(--muted-foreground)]",
            )}
          >
            {count}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} role="group" aria-label={label ?? "Filters"}>
      {label ? (
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
          {label}
        </span>
      ) : null}
      {renderChip(null, allLabel, allCount)}
      {options.map((option) => renderChip(option.id, option.label, option.count))}
    </div>
  );
}

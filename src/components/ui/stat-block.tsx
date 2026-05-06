import type { ReactNode } from "react";

import { ChevronsUp, Crosshair, Shield, Skull } from "lucide-react";

import { cn } from "@/lib/utils";

import { EyebrowLabel } from "./eyebrow-label";

export type StatKey = "move" | "skill" | "armor" | "damage-track";

interface StatDef {
  label: string;
  Icon: typeof Crosshair;
}

const STAT_DEFS: Record<StatKey, StatDef> = {
  skill: { label: "Skill", Icon: Crosshair },
  move: { label: "Move", Icon: ChevronsUp },
  armor: { label: "Armor", Icon: Shield },
  "damage-track": { label: "Damage Track", Icon: Skull },
};

interface StatBlockProps {
  className?: string;
  stats: Partial<Record<StatKey, string | number | null | undefined>>;
  /** Restricts and orders which stats render; defaults to skill/move/armor. */
  keys?: readonly StatKey[];
}

/**
 * StatBlock — small icon + value row matching the Skill/Move/Armor cluster
 * printed on every unit card. Replaces ad-hoc `KeyValueGrid` for unit stats.
 */
export function StatBlock({ className, keys = ["skill", "move", "armor"], stats }: StatBlockProps) {
  return (
    <dl className={cn("flex flex-wrap items-stretch gap-2", className)}>
      {keys.map((key) => {
        const value = stats[key];
        if (value === undefined || value === null || value === "") {
          return null;
        }

        return <StatCell key={key} statKey={key} value={value} />;
      })}
    </dl>
  );
}

function StatCell({ statKey, value }: { statKey: StatKey; value: string | number }): ReactNode {
  const { Icon, label } = STAT_DEFS[statKey];

  return (
    <div className="flex min-w-[4.25rem] items-center gap-2 rounded-sm border border-[color:var(--border)] bg-[color:var(--surface-sunken)] px-2.5 py-1.5">
      <Icon aria-hidden className="size-4 shrink-0 text-[color:var(--accent)]" strokeWidth={1.75} />
      <div className="flex flex-col gap-0.5">
        <EyebrowLabel className="text-[0.5625rem]">{label}</EyebrowLabel>
        <dd className="font-mono text-sm font-semibold leading-none tracking-tight text-[color:var(--foreground)]">
          {value}
        </dd>
      </div>
    </div>
  );
}

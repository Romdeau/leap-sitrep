import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { DataMatrixMark } from "./data-matrix-mark";
import { EyebrowLabel } from "./eyebrow-label";

interface PageHeroProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  assetCode?: string;
  /** Tail of asset codes (DH-93745 / 064567 style). */
  assetCodeSecondary?: string;
  matrixSource?: string;
  actions?: ReactNode;
}

/**
 * PageHero — the standard page-top "registration card" used by every route.
 * Renders eyebrow, display title, optional asset code stack + data-matrix
 * glyph, an accent notch divider, and a small description. Replaces the
 * inconsistent `SectionIntro`/Card-with-Packet-badges patterns.
 */
export function PageHero({
  actions,
  assetCode,
  assetCodeSecondary,
  className,
  description,
  eyebrow,
  matrixSource,
  title,
  ...props
}: PageHeroProps) {
  const matrixSeed = matrixSource ?? assetCode ?? (typeof title === "string" ? title : "blkout");

  return (
    <section
      className={cn(
        "reg-frame relative rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] p-5 sm:p-7 shadow-[var(--shadow-card)]",
        className,
      )}
      {...props}
    >
      <span aria-hidden className="reg-bl" />
      <span aria-hidden className="reg-br" />

      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            {eyebrow ? <EyebrowLabel>{eyebrow}</EyebrowLabel> : null}
            <h1 className="font-display text-3xl font-bold uppercase leading-[0.95] tracking-wide text-[color:var(--foreground)] sm:text-[2.75rem]">
              {title}
            </h1>
          </div>

          {assetCode || matrixSource ? (
            <div className="flex items-start gap-3">
              {assetCode ? (
                <div className="hidden flex-col items-end gap-0.5 sm:flex">
                  <span className="font-mono text-xs font-semibold tracking-tight text-[color:var(--accent)]">
                    {assetCode}
                  </span>
                  {assetCodeSecondary ? (
                    <span className="font-mono text-[0.625rem] leading-tight text-[color:var(--subtle-foreground)]">
                      {assetCodeSecondary}
                    </span>
                  ) : null}
                </div>
              ) : null}
              <DataMatrixMark className="text-[color:var(--accent)]" size={28} source={matrixSeed} />
            </div>
          ) : null}
        </div>

        <div aria-hidden className="notch-bar w-full" />

        {description ? (
          <p className="max-w-3xl text-sm leading-6 text-[color:var(--muted-foreground)] sm:text-[0.9375rem]">
            {description}
          </p>
        ) : null}

        {actions ? <div className="flex flex-wrap gap-2 pt-1">{actions}</div> : null}
      </div>
    </section>
  );
}

import type { ReactNode } from "react";

import { EyebrowLabel } from "@/components/ui/eyebrow-label";
import { cn } from "@/lib/utils";

export interface SideRailSection {
  /** Stable identifier — used for the React key. */
  id: string;
  /** Eyebrow label rendered above the section body. */
  title: ReactNode;
  /** Section body. */
  children: ReactNode;
}

interface SideRailProps {
  sections: SideRailSection[];
  className?: string;
  /** Sticky on desktop. Defaults to true. */
  sticky?: boolean;
}

/**
 * SideRail — narrow right-hand column used on detail pages to surface
 * secondary information: related entities, in-page TOCs, citations,
 * cross-links. Stacks below primary content on small screens via the
 * parent grid; the rail itself is sticky on desktop.
 */
export function SideRail({ className, sections, sticky = true }: SideRailProps) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <aside
      aria-label="Related references"
      className={cn(
        "space-y-5",
        sticky && "lg:sticky lg:top-6 lg:self-start",
        className,
      )}
    >
      {sections.map((section) => (
        <section
          key={section.id}
          className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[var(--shadow-card)]"
        >
          <EyebrowLabel className="mb-3 block">{section.title}</EyebrowLabel>
          <div className="space-y-3 text-sm leading-6">{section.children}</div>
        </section>
      ))}
    </aside>
  );
}

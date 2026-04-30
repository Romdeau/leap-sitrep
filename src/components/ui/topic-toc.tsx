import { useEffect, useState } from "react";

import { EyebrowLabel } from "@/components/ui/eyebrow-label";
import { cn } from "@/lib/utils";

export interface TopicTOCEntry {
  /** DOM id of the target section. */
  id: string;
  /** Display label. */
  label: string;
}

interface TopicTOCProps {
  entries: TopicTOCEntry[];
  /** Optional eyebrow label rendered above the list. */
  title?: string;
  className?: string;
}

/**
 * TopicTOC — sticky in-page table of contents with scroll-spy. Tracks which
 * target section is closest to the top of the viewport using
 * IntersectionObserver and highlights the matching entry.
 */
export function TopicTOC({ className, entries, title = "On this page" }: TopicTOCProps) {
  const [activeId, setActiveId] = useState<string | null>(entries[0]?.id ?? null);

  useEffect(() => {
    if (entries.length === 0 || typeof window === "undefined") {
      return;
    }

    const elements = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (observed) => {
        const visible = observed
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 1],
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [entries]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <nav aria-label={title} className={cn("space-y-3", className)}>
      <EyebrowLabel className="block">{title}</EyebrowLabel>
      <ul className="space-y-1 text-sm">
        {entries.map((entry) => {
          const isActive = entry.id === activeId;
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                className={cn(
                  "block rounded-sm border-l-2 px-2 py-1 transition-colors",
                  isActive
                    ? "border-[color:var(--foreground)] bg-[color:var(--surface-muted)] text-[color:var(--foreground)]"
                    : "border-transparent text-[color:var(--subtle-foreground)] hover:text-[color:var(--foreground)]",
                )}
              >
                {entry.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

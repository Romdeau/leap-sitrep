import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

export interface SectionTab {
  /** Stable identifier — used for the React key. */
  id: string;
  /** Tab label. */
  label: ReactNode;
  /** Route this tab navigates to. When omitted the tab is rendered as inert text. */
  to?: string;
  /** When true, NavLink end-matching is enabled (use for the index/landing tab). */
  end?: boolean;
}

interface SectionTabsProps {
  tabs: SectionTab[];
  className?: string;
  ariaLabel?: string;
}

/**
 * SectionTabs — a horizontal tab strip used at the top of a route to switch
 * between sibling pages (e.g. Rules: Core / Matched Play / USR). Backed by
 * `NavLink` so the active state mirrors the URL.
 */
export function SectionTabs({ ariaLabel = "Section tabs", className, tabs }: SectionTabsProps) {
  if (tabs.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "flex flex-wrap gap-1 border-b border-[color:var(--border)]",
        className,
      )}
    >
      {tabs.map((tab) => {
        if (!tab.to) {
          return (
            <span
              key={tab.id}
              className="px-3 py-2 text-sm font-medium text-[color:var(--subtle-foreground)]"
            >
              {tab.label}
            </span>
          );
        }

        return (
          <NavLink
            key={tab.id}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-[color:var(--foreground)] text-[color:var(--foreground)]"
                  : "border-transparent text-[color:var(--subtle-foreground)] hover:text-[color:var(--foreground)]",
              )
            }
          >
            {tab.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

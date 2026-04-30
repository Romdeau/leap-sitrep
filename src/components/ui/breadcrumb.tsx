import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: ReactNode;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb — thin orientation row rendered under the header on detail pages.
 * Last item is rendered as the active leaf (no link). Earlier items are links
 * if a `to` is provided, otherwise plain text.
 */
export function Breadcrumb({ className, items }: BreadcrumbProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-[0.6875rem] uppercase tracking-[0.16em] text-[color:var(--subtle-foreground)]",
        className,
      )}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <Fragment key={`${index}-${typeof item.label === "string" ? item.label : "node"}`}>
            {index > 0 ? (
              <span aria-hidden className="text-[color:var(--border-strong)]">
                /
              </span>
            ) : null}
            {isLast || !item.to ? (
              <span
                className={cn(
                  isLast
                    ? "text-[color:var(--muted-foreground)]"
                    : "text-[color:var(--subtle-foreground)]",
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link
                className="text-[color:var(--subtle-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                to={item.to}
              >
                {item.label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}

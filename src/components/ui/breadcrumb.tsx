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
        const isFirst = index === 0;
        // On small screens, collapse middle items (everything that isn't first or last) to keep the bar single-line.
        const collapseOnMobile = !isLast && !isFirst && items.length > 2;

        return (
          <Fragment key={`${index}-${typeof item.label === "string" ? item.label : "node"}`}>
            {index > 0 ? (
              <span
                aria-hidden
                className={cn(
                  "text-[color:var(--border-strong)]",
                  collapseOnMobile ? "hidden sm:inline" : undefined,
                )}
              >
                /
              </span>
            ) : null}
            {isLast || !item.to ? (
              <span
                className={cn(
                  isLast
                    ? "max-w-[14rem] truncate text-[color:var(--muted-foreground)] sm:max-w-none"
                    : "text-[color:var(--subtle-foreground)]",
                  collapseOnMobile ? "hidden sm:inline" : undefined,
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link
                className={cn(
                  "text-[color:var(--subtle-foreground)] transition-colors hover:text-[color:var(--foreground)]",
                  collapseOnMobile ? "hidden sm:inline" : undefined,
                )}
                to={item.to}
              >
                {item.label}
              </Link>
            )}
            {/* When middle items collapse on mobile, surface a single ellipsis after the first item. */}
            {isFirst && items.length > 2 ? (
              <span aria-hidden className="text-[color:var(--border-strong)] sm:hidden">
                /
              </span>
            ) : null}
            {isFirst && items.length > 2 ? (
              <span aria-hidden className="text-[color:var(--subtle-foreground)] sm:hidden">
                …
              </span>
            ) : null}
          </Fragment>
        );
      })}
    </nav>
  );
}

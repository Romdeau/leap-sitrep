import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface RecentListItem {
  /** Stable identifier for React keys. */
  id: string;
  /** Primary line. */
  title: ReactNode;
  /** Optional secondary line. */
  subtitle?: ReactNode;
  /** Optional trailing slot (badge, timestamp, etc). */
  trailing?: ReactNode;
  /** Render the row as a link target. */
  to?: string;
  /** Render the row as a button-like surface with an onClick handler. */
  onSelect?: () => void;
}

interface RecentListProps {
  title: ReactNode;
  description?: ReactNode;
  items: RecentListItem[];
  /** Rendered when items is empty. */
  emptyState?: ReactNode;
  /** Optional header action (e.g. "View all"). */
  headerAction?: ReactNode;
  className?: string;
}

/**
 * RecentList — compact list of recently touched entities (rosters, matches,
 * lookups). Rows render as links by default; provide `onSelect` to render
 * as a button instead.
 */
export function RecentList({ className, description, emptyState, headerAction, items, title }: RecentListProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {headerAction}
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-sm text-[color:var(--muted-foreground)]">{emptyState ?? "Nothing here yet."}</div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <RecentListRow item={item} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function RecentListRow({ item }: { item: RecentListItem }) {
  const baseClasses =
    "flex w-full items-center gap-3 rounded-2xl border border-[color:var(--border)] p-3 text-left transition hover:bg-[color:var(--surface-muted)]";
  const body = (
    <>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{item.title}</div>
        {item.subtitle ? (
          <div className="mt-1 truncate text-xs text-[color:var(--muted-foreground)]">{item.subtitle}</div>
        ) : null}
      </div>
      {item.trailing ? <div className="shrink-0 text-xs text-[color:var(--muted-foreground)]">{item.trailing}</div> : null}
    </>
  );

  if (item.to) {
    return (
      <Link className={baseClasses} to={item.to}>
        {body}
      </Link>
    );
  }

  if (item.onSelect) {
    return (
      <button className={baseClasses} onClick={item.onSelect} type="button">
        {body}
      </button>
    );
  }

  return <div className={baseClasses}>{body}</div>;
}

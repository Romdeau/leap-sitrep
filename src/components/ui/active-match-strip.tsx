import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { EyebrowLabel } from "@/components/ui/eyebrow-label";
import { useReferenceDataState } from "@/features/reference/use-reference-data";
import { loadStoredMatches } from "@/features/matches/match-tracker";
import type { Match } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

function pickActiveMatch(matches: Match[]): Match | null {
  if (matches.length === 0) {
    return null;
  }

  const sorted = [...matches].sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
  return sorted[0] ?? null;
}

/**
 * ActiveMatchStrip — slim sticky banner shown under the header when a match
 * exists in localStorage. Suppresses itself on the live tracker route to
 * avoid duplicating context, and on routes where reference data hasn't
 * loaded yet (so scenario/title lookups are skipped).
 */
export function ActiveMatchStrip({ className }: { className?: string }) {
  const location = useLocation();
  const referenceState = useReferenceDataState();
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    setMatch(pickActiveMatch(loadStoredMatches()));

    function onStorage(event: StorageEvent) {
      if (event.key === null || event.key === "leap-sitrep.matches.v1") {
        setMatch(pickActiveMatch(loadStoredMatches()));
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [location.pathname]);

  if (match === null) {
    return null;
  }

  // Don't double up on /matches/:id — the page itself owns that context.
  if (location.pathname === `/matches/${match.id}`) {
    return null;
  }

  const scoreEntries = Object.entries(match.scores);
  const scoreSummary =
    scoreEntries.length > 0
      ? scoreEntries.map(([key, value]) => `${key} ${value}`).join(" · ")
      : "No score logged";

  let scenarioTitle: string | undefined;
  if (referenceState.status === "ready") {
    scenarioTitle = referenceState.data.scenarios.data.scenarios.find(
      (candidate: { id: string; title: string }) => candidate.id === match.scenarioId,
    )?.title;
  }

  return (
    <div
      className={cn(
        "border-b border-[color:var(--border-faint)] bg-[color:var(--surface-muted)]",
        className,
      )}
      role="status"
      aria-label="Active match"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <EyebrowLabel className="text-[color:var(--accent)]">Active match</EyebrowLabel>
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--foreground)]">
          {scenarioTitle ?? match.scenarioId}
        </span>
        <span className="text-[0.6875rem] uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
          Round {match.round} · {scoreSummary}
        </span>
        <div className="ml-auto">
          <Button asChild size="sm" variant="outline">
            <Link to={`/matches/${match.id}`}>Resume</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

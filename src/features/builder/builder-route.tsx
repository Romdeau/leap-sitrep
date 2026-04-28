import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Roster, UnitCard } from "@/lib/types/domain";
import { useReferenceData } from "@/features/reference/use-reference-data";

import { createCoreRoster, loadStoredRosters, saveStoredRosters, validateCoreRoster } from "./roster-builder";

function unitLabel(unit: UnitCard) {
  return `${unit.name} (${unit.cardId})`;
}

export function BuilderRoute() {
  const { forces } = useReferenceData();
  const force = forces.data.forces.find((candidate) => candidate.id === "harlow-1st-reaction-force") ?? forces.data.forces[0];
  const units = useMemo(() => forces.data.units.filter((unit) => unit.forceId === force?.id), [force?.id, forces.data.units]);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>(() => units.slice(0, 3).map((unit) => unit.id));
  const [notes, setNotes] = useState("");
  const [savedRosters, setSavedRosters] = useState<Roster[]>([]);

  useEffect(() => {
    setSavedRosters(loadStoredRosters());
  }, []);

  useEffect(() => {
    setSelectedUnitIds(units.slice(0, 3).map((unit) => unit.id));
  }, [units]);

  const draftRoster = {
    mode: "core" as const,
    forceId: force?.id ?? "",
    unitIds: selectedUnitIds,
  };
  const validation = validateCoreRoster(draftRoster, force, units);
  const selectedUnits = selectedUnitIds.map((unitId) => units.find((unit) => unit.id === unitId)).filter((unit): unit is UnitCard => unit !== undefined);

  function updateUnitSlot(slotIndex: number, unitId: string) {
    setSelectedUnitIds((current) => current.map((value, index) => (index === slotIndex ? unitId : value)));
  }

  function saveRoster() {
    if (!validation.isLegal || force === undefined) {
      return;
    }

    const roster = createCoreRoster({ forceId: force.id, notes, unitIds: selectedUnitIds });
    const nextRosters = [roster, ...savedRosters];

    saveStoredRosters(nextRosters);
    setSavedRosters(nextRosters);
    setNotes("");
  }

  function deleteRoster(rosterId: string) {
    const nextRosters = savedRosters.filter((roster) => roster.id !== rosterId);

    saveStoredRosters(nextRosters);
    setSavedRosters(nextRosters);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">Packet 5</Badge>
            <Badge variant="outline">Core Builder</Badge>
          </div>
          <CardTitle>Harlow core roster builder</CardTitle>
          <CardDescription>
            Build the first legal core-play group from the verified Harlow force slice: 1 force card and 3 unit cards from that force.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Roster draft</CardTitle>
            <CardDescription>No points or handlers are invented here; this slice only validates the core group structure currently supported by verified data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-[color:var(--border)] p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">Force card</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="font-medium">{force?.name ?? "No verified force available"}</span>
                {force ? <Badge variant="outline">{force.cardId}</Badge> : null}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map((slotIndex) => (
                <label key={slotIndex} className="space-y-2 rounded-2xl border border-[color:var(--border)] p-4">
                  <span className="block text-xs uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">Unit slot {slotIndex + 1}</span>
                  <select
                    className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--foreground)]"
                    onChange={(event) => updateUnitSlot(slotIndex, event.target.value)}
                    value={selectedUnitIds[slotIndex] ?? ""}
                  >
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unitLabel(unit)}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <label className="block space-y-2">
              <span className="block text-xs uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">Roster notes</span>
              <textarea
                className="min-h-24 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-sm text-[color:var(--foreground)]"
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional table notes, deployment reminders, or source-check notes."
                value={notes}
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <Button disabled={!validation.isLegal} onClick={saveRoster}>
                Save roster
              </Button>
              {force ? (
                <Button asChild variant="outline">
                  <Link to={`/forces/${force.id}`}>Review force source</Link>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Legality and summary</CardTitle>
            <CardDescription>Validation stays intentionally narrow until matched play and broader card data are verified.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-[color:var(--border)] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={validation.isLegal ? "accent" : "outline"}>{validation.isLegal ? "Legal" : "Needs attention"}</Badge>
                <span className="text-sm font-medium">Core group validation</span>
              </div>
              <div className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                {validation.messages.map((message) => (
                  <p key={message}>{message}</p>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {selectedUnits.map((unit) => (
                <Link key={unit.id} className="block rounded-2xl border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]" to={`/units/${unit.id}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{unit.name}</span>
                    <Badge variant="outline">{unit.cardId}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    <Badge variant="outline">Move {unit.stats.move ?? "-"}</Badge>
                    <Badge variant="outline">Shoot {unit.stats.shoot ?? "-"}</Badge>
                    <Badge variant="outline">Armor {unit.stats.armor ?? "-"}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved rosters</CardTitle>
          <CardDescription>Rosters are stored locally in this browser and can be reloaded without a backend.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {savedRosters.length === 0 ? <p className="text-sm text-[color:var(--muted-foreground)]">No saved rosters yet.</p> : null}
          {savedRosters.map((roster) => {
            const rosterForce = forces.data.forces.find((candidate) => candidate.id === roster.forceId);
            const rosterUnits = roster.unitIds.map((unitId) => forces.data.units.find((unit) => unit.id === unitId)).filter((unit): unit is UnitCard => unit !== undefined);

            return (
              <div key={roster.id} className="rounded-2xl border border-[color:var(--border)] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{rosterForce?.name ?? roster.forceId}</span>
                      <Badge variant="outline">{roster.mode}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{rosterUnits.map((unit) => unit.name).join(" / ")}</p>
                    {roster.notes ? <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">{roster.notes}</p> : null}
                  </div>
                  <Button variant="outline" onClick={() => deleteRoster(roster.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

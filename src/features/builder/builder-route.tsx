import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EyebrowLabel } from "@/components/ui/eyebrow-label";
import { PageHero } from "@/components/ui/page-hero";
import { StatBlock } from "@/components/ui/stat-block";
import { WizardStepper } from "@/components/ui/wizard-stepper";
import type { Force, Roster, UnitCard } from "@/lib/types/domain";
import { useReferenceData } from "@/features/reference/use-reference-data";

import { createCoreRoster, duplicateRoster, formatCoreRosterExport, loadStoredRosters, saveStoredRosters, validateCoreRoster } from "./roster-builder";

const FIELD_INPUT_CLASS =
  "w-full rounded-sm border border-[color:var(--border)] bg-[color:var(--surface-sunken)] px-3 py-2 font-mono text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--ring)]/40 aria-invalid:border-[color:var(--danger)]";

function unitLabel(unit: UnitCard) {
  return `${unit.name} (${unit.cardId})`;
}

function defaultUnitIdsForForce(force: Force | undefined, units: UnitCard[]) {
  if (force === undefined) {
    return [];
  }

  return units.filter((unit) => unit.forceId === force.id).slice(0, 3).map((unit) => unit.id);
}

function UnitSlotField({
  isDuplicate,
  onChange,
  slotIndex,
  unitId,
  units,
}: {
  isDuplicate: boolean;
  onChange: (slotIndex: number, unitId: string) => void;
  slotIndex: number;
  unitId: string;
  units: UnitCard[];
}) {
  return (
    <label className="reg-frame relative space-y-2 rounded-sm border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
      <span aria-hidden className="reg-bl" />
      <span aria-hidden className="reg-br" />
      <EyebrowLabel>Unit slot {slotIndex + 1}</EyebrowLabel>
      <select
        aria-invalid={isDuplicate}
        className={FIELD_INPUT_CLASS}
        onChange={(event) => onChange(slotIndex, event.target.value)}
        value={unitId}
      >
        {units.map((unit) => (
          <option key={unit.id} value={unit.id}>
            {unitLabel(unit)}
          </option>
        ))}
      </select>
      {isDuplicate ? <p className="text-sm text-[color:var(--danger)]">Choose a different verified unit card for this slot.</p> : null}
    </label>
  );
}

export function BuilderRoute() {
  const { forces } = useReferenceData();
  const [selectedForceId, setSelectedForceId] = useState(() => forces.data.forces.find((candidate) => candidate.id === "harlow-1st-reaction-force")?.id ?? forces.data.forces[0]?.id ?? "");
  const force = forces.data.forces.find((candidate) => candidate.id === selectedForceId) ?? forces.data.forces[0];
  const units = useMemo(() => forces.data.units.filter((unit) => unit.forceId === force?.id), [force?.id, forces.data.units]);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>(() => defaultUnitIdsForForce(force, forces.data.units));
  const [notes, setNotes] = useState("");
  const [savedRosters, setSavedRosters] = useState<Roster[]>([]);
  const [copiedRosterId, setCopiedRosterId] = useState<string | null>(null);

  useEffect(() => {
    setSavedRosters(loadStoredRosters());
  }, []);

  useEffect(() => {
    setSelectedUnitIds(defaultUnitIdsForForce(force, forces.data.units));
  }, [force, forces.data.units]);

  const draftRoster = {
    mode: "core" as const,
    forceId: force?.id ?? "",
    unitIds: selectedUnitIds,
  };
  const validation = validateCoreRoster(draftRoster, force, units);
  const selectedUnits = selectedUnitIds.map((unitId) => units.find((unit) => unit.id === unitId)).filter((unit): unit is UnitCard => unit !== undefined);
  const selectedUnitIdCounts = selectedUnitIds.reduce<Record<string, number>>((counts, unitId) => {
    counts[unitId] = (counts[unitId] ?? 0) + 1;

    return counts;
  }, {});

  function updateUnitSlot(slotIndex: number, unitId: string) {
    setSelectedUnitIds((current) => current.map((value, index) => (index === slotIndex ? unitId : value)));
  }

  function updateForce(forceId: string) {
    setSelectedForceId(forceId);
    setNotes("");
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

  function loadRoster(roster: Roster) {
    setSelectedForceId(roster.forceId);
    setSelectedUnitIds(roster.unitIds);
    setNotes(roster.notes ?? "");
  }

  function duplicateSavedRoster(roster: Roster) {
    const nextRosters = [duplicateRoster(roster), ...savedRosters];

    saveStoredRosters(nextRosters);
    setSavedRosters(nextRosters);
  }

  function deleteRoster(rosterId: string) {
    const nextRosters = savedRosters.filter((roster) => roster.id !== rosterId);

    saveStoredRosters(nextRosters);
    setSavedRosters(nextRosters);
  }

  async function copyRosterExport(rosterId: string, rosterExport: string) {
    await navigator.clipboard.writeText(rosterExport);
    setCopiedRosterId(rosterId);
  }

  const hasForce = force !== undefined;
  const hasUniqueUnits = selectedUnitIds.length === 3 && new Set(selectedUnitIds).size === 3;
  const hasNotes = notes.trim().length > 0;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Field Manual / Roster Ops"
        title="Verified core roster builder"
        description="Build a legal core-play group from verified force cards: 1 force card and 3 different unit cards from that force."
        assetCode="FM-ROST-01"
        assetCodeSecondary={force?.cardId}
        matrixSource={force?.id ?? "blkout-roster"}
      />

      <WizardStepper
        steps={[
          {
            id: "force",
            label: "Force",
            description: hasForce ? "Selected" : "Pick a verified card",
            complete: hasForce,
            active: !hasForce,
          },
          {
            id: "units",
            label: "Units",
            description: `${selectedUnitIds.length}/3 slots`,
            complete: hasUniqueUnits,
            active: hasForce && !hasUniqueUnits,
          },
          {
            id: "notes",
            label: "Notes",
            description: hasNotes ? "Notes added" : "Optional",
            complete: hasNotes,
            active: hasUniqueUnits && !hasNotes,
          },
          {
            id: "review",
            label: "Review & Save",
            description: validation.isLegal ? "Roster legal" : "Resolve issues",
            complete: false,
            active: hasUniqueUnits,
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Step 1</Badge>
                <CardTitle>Force</CardTitle>
              </div>
              <CardDescription>Pick the verified force card the rest of the roster will draw from.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="reg-frame relative rounded-sm border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                <span aria-hidden className="reg-bl" />
                <span aria-hidden className="reg-br" />
                <label className="block space-y-2">
                  <EyebrowLabel>Force card</EyebrowLabel>
                  <select
                    className={FIELD_INPUT_CLASS}
                    onChange={(event) => updateForce(event.target.value)}
                    value={force?.id ?? ""}
                  >
                    {forces.data.forces.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.name} ({candidate.cardId})
                      </option>
                    ))}
                  </select>
                </label>
                {force ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="font-display text-base font-semibold uppercase tracking-wide">{force.name}</span>
                    <Badge variant="outline">{force.cardId}</Badge>
                    <Badge variant="outline">{units.length} verified units</Badge>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Step 2</Badge>
                <CardTitle>Units</CardTitle>
              </div>
              <CardDescription>Three distinct unit cards from the chosen force.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {[0, 1, 2].map((slotIndex) => (
                  <UnitSlotField
                    key={slotIndex}
                    isDuplicate={(selectedUnitIdCounts[selectedUnitIds[slotIndex] ?? ""] ?? 0) > 1}
                    slotIndex={slotIndex}
                    unitId={selectedUnitIds[slotIndex] ?? ""}
                    units={units}
                    onChange={updateUnitSlot}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Step 3</Badge>
                <CardTitle>Notes</CardTitle>
              </div>
              <CardDescription>Optional table notes. Free text — no validation.</CardDescription>
            </CardHeader>
            <CardContent>
              <label className="block space-y-2">
                <EyebrowLabel>Roster notes</EyebrowLabel>
                <textarea
                  className="min-h-24 w-full rounded-sm border border-[color:var(--border)] bg-[color:var(--surface-sunken)] p-4 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--ring)]/40"
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Optional table notes, deployment reminders, or source-check notes."
                  value={notes}
                />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Step 4</Badge>
                <CardTitle>Review & Save</CardTitle>
              </div>
              <CardDescription>Confirm the roster reads as legal, then save it locally.</CardDescription>
            </CardHeader>
            <CardContent>
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
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Legality and summary</CardTitle>
              <CardDescription>Validation stays narrow until matched play and broader card data are verified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="reg-frame relative rounded-sm border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                <span aria-hidden className="reg-bl" />
                <span aria-hidden className="reg-br" />
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={validation.isLegal ? "accent" : "danger"}>{validation.isLegal ? "Legal" : "Needs attention"}</Badge>
                  <span className="font-display text-sm font-semibold uppercase tracking-wide">Core group validation</span>
                </div>
                <div className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                  {validation.messages.map((message) => (
                    <p key={message}>{message}</p>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {selectedUnits.map((unit) => (
                  <Link
                    key={unit.id}
                    className="reg-frame relative block rounded-sm border border-[color:var(--border)] bg-[color:var(--surface)] p-4 transition hover:border-[color:var(--accent)] hover:bg-[color:var(--surface-muted)]"
                    to={`/units/${unit.id}`}
                  >
                    <span aria-hidden className="reg-bl" />
                    <span aria-hidden className="reg-br" />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-base font-semibold uppercase tracking-wide">{unit.name}</span>
                      <Badge variant="outline">{unit.cardId}</Badge>
                    </div>
                    <StatBlock
                      className="mt-3"
                      keys={["skill", "move", "armor"]}
                      stats={{ move: unit.stats.move ?? "-", skill: unit.stats.skill ?? "-", armor: unit.stats.armor ?? "-" }}
                    />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Sticky bottom action bar — mobile-only mirror of Save action. */}
      <div className="sticky bottom-0 z-20 -mx-4 border-t border-[color:var(--border)] bg-[color:var(--surface)]/95 px-4 py-3 backdrop-blur xl:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <Badge variant={validation.isLegal ? "accent" : "danger"}>{validation.isLegal ? "Legal" : "Issues"}</Badge>
            <span className="text-[color:var(--muted-foreground)]" aria-hidden>
              {validation.messages.length > 0 ? `${validation.messages.length} note${validation.messages.length === 1 ? "" : "s"}` : ""}
            </span>
          </div>
          <Button disabled={!validation.isLegal} onClick={saveRoster} size="sm">
            Save
          </Button>
        </div>
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
            const rosterValidation = validateCoreRoster(roster, rosterForce, forces.data.units.filter((unit) => unit.forceId === roster.forceId));
            const rosterExport = formatCoreRosterExport({ force: rosterForce, roster, units: forces.data.units, validation: rosterValidation });

            return (
              <div key={roster.id} className="reg-frame relative rounded-sm border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                <span aria-hidden className="reg-bl" />
                <span aria-hidden className="reg-br" />
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-base font-semibold uppercase tracking-wide">{rosterForce?.name ?? roster.forceId}</span>
                      <Badge variant="outline">{roster.mode}</Badge>
                      <Badge variant={rosterValidation.isLegal ? "accent" : "danger"}>{rosterValidation.isLegal ? "Legal" : "Needs attention"}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{rosterUnits.map((unit) => unit.name).join(" / ")}</p>
                    {roster.notes ? <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">{roster.notes}</p> : null}
                    {!rosterValidation.isLegal ? (
                      <div className="mt-2 space-y-1 text-sm leading-6 text-[color:var(--muted-foreground)]">
                        {rosterValidation.messages.map((message) => (
                          <p key={message}>{message}</p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => loadRoster(roster)}>
                      Load
                    </Button>
                    <Button variant="outline" onClick={() => duplicateSavedRoster(roster)}>
                      Duplicate
                    </Button>
                    <Button variant="destructive" onClick={() => deleteRoster(roster.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
                <details className="mt-4 rounded-sm border border-[color:var(--border)] bg-[color:var(--surface-sunken)] p-4">
                  <summary className="cursor-pointer font-display text-sm font-semibold uppercase tracking-wide">Table export preview</summary>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Button variant="outline" onClick={() => void copyRosterExport(roster.id, rosterExport)}>
                      Copy export
                    </Button>
                    {copiedRosterId === roster.id ? <span className="text-sm text-[color:var(--muted-foreground)]">Copied export to clipboard.</span> : null}
                  </div>
                  <pre className="mt-3 whitespace-pre-wrap font-mono text-xs leading-5 text-[color:var(--muted-foreground)]">{rosterExport}</pre>
                </details>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

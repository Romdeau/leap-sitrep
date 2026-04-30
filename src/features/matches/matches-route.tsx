import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EyebrowLabel } from "@/components/ui/eyebrow-label";
import { PageHero } from "@/components/ui/page-hero";
import { loadStoredRosters } from "@/features/builder/roster-builder";
import { useReferenceData } from "@/features/reference/use-reference-data";
import type { Match, Roster, UnitState } from "@/lib/types/domain";

import {
  addInitiativeEntry,
  advanceRound,
  createCoreMatch,
  formatMatchExport,
  loadStoredMatches,
  saveStoredMatches,
  setControlPoints,
  setScore,
  setUnitActivation,
  setUnitDamage,
  toggleToken,
  toggleUnitDestroyed,
  toggleUnitPinned,
} from "./match-tracker";

const SEED_SCENARIO_ID = "dockyard-assault";

const FIELD_INPUT_CLASS =
  "w-full rounded-sm border border-[color:var(--border)] bg-[color:var(--surface-sunken)] px-3 py-2 font-mono text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--ring)]/40";

function rosterLabel(roster: Roster) {
  return roster.notes ?? `${roster.mode} roster ${roster.id.slice(0, 8)}`;
}

function saveMatchList(nextMatches: Match[], setMatches: (matches: Match[]) => void) {
  saveStoredMatches(nextMatches);
  setMatches(nextMatches);
}

export function MatchesRoute() {
  const navigate = useNavigate();
  const { forces, scenarios } = useReferenceData();
  const scenario = scenarios.data.scenarios.find((candidate) => candidate.id === SEED_SCENARIO_ID);
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedRosterId, setSelectedRosterId] = useState("");

  useEffect(() => {
    const storedRosters = loadStoredRosters();

    setRosters(storedRosters);
    setSelectedRosterId(storedRosters[0]?.id ?? "");
    setMatches(loadStoredMatches());
  }, []);

  function createMatch() {
    const roster = rosters.find((candidate) => candidate.id === selectedRosterId);

    if (roster === undefined || scenario === undefined) {
      return;
    }

    const match = createCoreMatch({ roster, scenarioId: scenario.id });
    const nextMatches = [match, ...matches];

    saveStoredMatches(nextMatches);
    setMatches(nextMatches);
    void navigate(`/matches/${match.id}`);
  }

  function deleteMatch(matchId: string) {
    const nextMatches = matches.filter((match) => match.id !== matchId);

    saveMatchList(nextMatches, setMatches);
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Field Manual / Match Ops"
        title="Match setup"
        description="Start a local table tracker from a saved verified core roster and the sourced Dockyard Assault scenario. This is a tracker, not a spatial simulation."
        assetCode="FM-MTCH-01"
        assetCodeSecondary={SEED_SCENARIO_ID.toUpperCase()}
        matrixSource="blkout-matches"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>New Dockyard Assault match</CardTitle>
            <CardDescription>Uses the local roster store and the generated scenario dataset.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rosters.length === 0 ? (
              <div className="rounded-sm border border-[color:var(--border)] bg-[color:var(--surface-sunken)] p-4 text-sm leading-6 text-[color:var(--muted-foreground)]">
                Save a legal verified core roster in the builder before starting a match.
              </div>
            ) : (
              <label className="block space-y-2">
                <EyebrowLabel>Saved roster</EyebrowLabel>
                <select
                  className={FIELD_INPUT_CLASS}
                  onChange={(event) => setSelectedRosterId(event.target.value)}
                  value={selectedRosterId}
                >
                  {rosters.map((roster) => {
                    const force = forces.data.forces.find((candidate) => candidate.id === roster.forceId);

                    return (
                      <option key={roster.id} value={roster.id}>
                        {rosterLabel(roster)} - {force?.name ?? roster.forceId}
                      </option>
                    );
                  })}
                </select>
              </label>
            )}

            <div className="reg-frame relative rounded-sm border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
              <span aria-hidden className="reg-bl" />
              <span aria-hidden className="reg-br" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-base font-semibold uppercase tracking-wide">{scenario?.title ?? "Dockyard Assault"}</span>
                <Badge variant="outline">Core scenario</Badge>
              </div>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Tracks round flow, activations, hardpoints, points of interest, smoke, destroyed state, and Overrun score notes.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button disabled={selectedRosterId.length === 0 || scenario === undefined} onClick={createMatch}>
                Start match
              </Button>
              <Button asChild variant="outline">
                <Link to="/builder">Open builder</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={`/scenarios/${SEED_SCENARIO_ID}`}>Review scenario source</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved matches</CardTitle>
            <CardDescription>Matches are stored locally in this browser.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {matches.length === 0 ? <p className="text-sm text-[color:var(--muted-foreground)]">No saved matches yet.</p> : null}
            {matches.map((match) => {
              const roster = rosters.find((candidate) => match.playerRosterIds.includes(candidate.id));

              return (
                <div key={match.id} className="reg-frame relative rounded-sm border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                  <span aria-hidden className="reg-bl" />
                  <span aria-hidden className="reg-br" />
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <Link className="block transition hover:text-[color:var(--accent)]" to={`/matches/${match.id}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-base font-semibold uppercase tracking-wide">{scenario?.title ?? match.scenarioId}</span>
                        <Badge variant="outline">Round {match.round}</Badge>
                        {roster === undefined ? <Badge variant="danger">Missing roster</Badge> : null}
                      </div>
                      <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Saved {new Date(match.savedAt).toLocaleString()}</p>
                    </Link>
                    <Button variant="destructive" onClick={() => deleteMatch(match.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function MatchDetailRoute() {
  const { matchId } = useParams();
  const { forces, scenarios } = useReferenceData();
  const scenario = scenarios.data.scenarios.find((candidate) => candidate.id === SEED_SCENARIO_ID);
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [initiativeEntry, setInitiativeEntry] = useState("");
  const [copiedMatchExport, setCopiedMatchExport] = useState(false);
  const match = matches.find((candidate) => candidate.id === matchId);
  const roster = rosters.find((candidate) => match?.playerRosterIds.includes(candidate.id));
  const units = roster?.unitIds.map((unitId) => forces.data.units.find((unit) => unit.id === unitId)).filter((unit) => unit !== undefined) ?? [];
  const force = roster === undefined ? undefined : forces.data.forces.find((candidate) => candidate.id === roster.forceId);

  useEffect(() => {
    setRosters(loadStoredRosters());
    setMatches(loadStoredMatches());
  }, []);

  function updateMatch(updater: (current: Match) => Match) {
    if (match === undefined) {
      return;
    }

    const updatedMatch = updater(match);
    const nextMatches = matches.map((candidate) => (candidate.id === updatedMatch.id ? updatedMatch : candidate));

    saveMatchList(nextMatches, setMatches);
  }

  function recordInitiative() {
    updateMatch((current) => addInitiativeEntry(current, initiativeEntry));
    setInitiativeEntry("");
  }

  async function copyMatchExport(matchExport: string) {
    await navigator.clipboard.writeText(matchExport);
    setCopiedMatchExport(true);
  }

  if (match === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Match not found</CardTitle>
          <CardDescription>This local match is not in browser storage.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link to="/matches">Back to matches</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (roster === undefined) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="danger">Missing roster</Badge>
            <Badge variant="outline">{scenario?.title ?? match.scenarioId}</Badge>
          </div>
          <CardTitle>Roster unavailable</CardTitle>
          <CardDescription>
            This match still exists locally, but its saved roster is missing. Recreate or restore the roster before using unit-level tracking.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to="/matches">Back to matches</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/builder">Open builder</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const matchExport = formatMatchExport({ force, match, roster, scenario, units });

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <span>Field Manual / Live Track</span>
            <Badge variant="accent">Round {match.round}</Badge>
            <Badge variant="outline">{scenario?.title ?? match.scenarioId}</Badge>
          </span>
        }
        title="Live match tracker"
        description="Track the sourced seed scenario without automating terrain, line of sight, or tabletop judgment."
        assetCode={`MTCH-${match.id.slice(0, 6).toUpperCase()}`}
        assetCodeSecondary={`R${match.round}`}
        matrixSource={match.id}
        actions={
          <>
            <Button onClick={() => updateMatch(advanceRound)}>Advance round</Button>
            <Button asChild variant="outline">
              <Link to={`/scenarios/${SEED_SCENARIO_ID}`}>Scenario source</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/rules/core">Rules reference</Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Table export</CardTitle>
          <CardDescription>Copy the current manual match state for notes, reports, or handoff.</CardDescription>
        </CardHeader>
        <CardContent>
          <details className="rounded-sm border border-[color:var(--border)] bg-[color:var(--surface-sunken)] p-4">
            <summary className="cursor-pointer font-display text-sm font-semibold uppercase tracking-wide">Match export preview</summary>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={() => void copyMatchExport(matchExport)}>
                Copy match export
              </Button>
              {copiedMatchExport ? <span className="text-sm text-[color:var(--muted-foreground)]">Copied match export to clipboard.</span> : null}
            </div>
            <pre className="mt-3 whitespace-pre-wrap font-mono text-xs leading-5 text-[color:var(--muted-foreground)]">{matchExport}</pre>
          </details>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Table snapshot</CardTitle>
          <CardDescription>Compact match state for quick mobile checks between activations.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SnapshotMetric label="Round" value={String(match.round)} />
          <SnapshotMetric label="Units ready" value={`${match.unitStates.filter((unitState) => unitState.activationStatus === "ready").length}/${match.unitStates.length}`} />
          <SnapshotMetric label="Score" value={`${match.scores.player ?? 0}-${match.scores.opponent ?? 0}`} />
          <SnapshotMetric label="Control points" value={`${match.controlPoints.player ?? 0}-${match.controlPoints.opponent ?? 0}`} />
          <SnapshotMetric label="Pinned" value={String(match.unitStates.filter((unitState) => unitState.isPinned).length)} />
          <SnapshotMetric label="Destroyed" value={String(match.unitStates.filter((unitState) => unitState.isDestroyed).length)} />
          <SnapshotMetric label="Active tokens" value={String(match.tokenStates.filter((tokenState) => tokenState.isActive).length)} />
          <SnapshotMetric label="Last initiative" value={match.initiativeHistory[0] ?? "None"} />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Units</CardTitle>
            <CardDescription>Activation, damage, pinned, and destroyed state for the saved roster.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {match.unitStates.map((unitState) => {
              const unit = units.find((candidate) => candidate.id === unitState.unitId);

              return (
                <div key={unitState.unitId} className="reg-frame relative rounded-sm border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                  <span aria-hidden className="reg-bl" />
                  <span aria-hidden className="reg-br" />
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-base font-semibold uppercase tracking-wide">{unit?.name ?? unitState.unitId}</span>
                        <Badge variant="outline">{unitState.activationStatus}</Badge>
                        {unitState.isPinned ? <Badge variant="danger">Pinned</Badge> : null}
                        {unitState.isDestroyed ? <Badge variant="danger">Destroyed</Badge> : null}
                        {unitState.damageMarks > 0 ? <Badge variant="accent">Damage {unitState.damageMarks}</Badge> : null}
                      </div>
                      {unit ? (
                        <Link className="mt-2 inline-block text-sm text-[color:var(--muted-foreground)] underline hover:text-[color:var(--accent)]" to={`/units/${unit.id}`}>
                          Review unit source
                        </Link>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <DamageField value={unitState.damageMarks} onChange={(damageMarks) => updateMatch((current) => setUnitDamage(current, unitState.unitId, damageMarks))} />
                      <ActivationButton status="ready" unitState={unitState} onClick={() => updateMatch((current) => setUnitActivation(current, unitState.unitId, "ready"))} />
                      <ActivationButton status="activated" unitState={unitState} onClick={() => updateMatch((current) => setUnitActivation(current, unitState.unitId, "activated"))} />
                      <ActivationButton status="engaged" unitState={unitState} onClick={() => updateMatch((current) => setUnitActivation(current, unitState.unitId, "engaged"))} />
                      <Button variant="outline" onClick={() => updateMatch((current) => toggleUnitPinned(current, unitState.unitId))}>
                        {unitState.isPinned ? "Clear pinned" : "Pin"}
                      </Button>
                      <Button variant="destructive" onClick={() => updateMatch((current) => toggleUnitDestroyed(current, unitState.unitId))}>
                        {unitState.isDestroyed ? "Restore" : "Destroy"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overrun score</CardTitle>
              <CardDescription>Manual scoring helper for Dockyard Assault.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <ScoreField label="Player" value={match.scores.player ?? 0} onChange={(score) => updateMatch((current) => setScore(current, "player", score))} />
              <ScoreField label="Opponent" value={match.scores.opponent ?? 0} onChange={(score) => updateMatch((current) => setScore(current, "opponent", score))} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Control points</CardTitle>
              <CardDescription>Manual control-point spending tracker. No battle drill automation is inferred.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <ScoreField label="Player CP" value={match.controlPoints.player ?? 0} onChange={(controlPoints) => updateMatch((current) => setControlPoints(current, "player", controlPoints))} />
              <ScoreField label="Opponent CP" value={match.controlPoints.opponent ?? 0} onChange={(controlPoints) => updateMatch((current) => setControlPoints(current, "opponent", controlPoints))} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scenario tokens</CardTitle>
              <CardDescription>Hardpoints, points of interest, and smoke markers are manual toggles.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {match.tokenStates.map((token) => (
                <Button key={token.id} variant={token.isActive ? "default" : "outline"} onClick={() => updateMatch((current) => toggleToken(current, token.id))}>
                  {token.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Initiative log</CardTitle>
              <CardDescription>Record initiative and control-point notes without interpreting ambiguous table state.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <input
                  className={`min-w-0 flex-1 ${FIELD_INPUT_CLASS}`}
                  onChange={(event) => setInitiativeEntry(event.target.value)}
                  placeholder="Round 1: player won initiative"
                  value={initiativeEntry}
                />
                <Button onClick={recordInitiative}>Add</Button>
              </div>
              {match.initiativeHistory.length === 0 ? <p className="text-sm text-[color:var(--muted-foreground)]">No initiative notes yet.</p> : null}
              {match.initiativeHistory.map((entry, index) => (
                <p key={`${entry}-${index}`} className="rounded-sm border border-[color:var(--border)] bg-[color:var(--surface-sunken)] p-3 font-mono text-sm text-[color:var(--muted-foreground)]">
                  {entry}
                </p>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ActivationButton({ onClick, status, unitState }: { onClick: () => void; status: UnitState["activationStatus"]; unitState: UnitState }) {
  return (
    <Button variant={unitState.activationStatus === status ? "default" : "outline"} onClick={onClick}>
      {status}
    </Button>
  );
}

function SnapshotMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="reg-frame relative rounded-sm border border-[color:var(--border)] bg-[color:var(--surface-sunken)] p-4">
      <span aria-hidden className="reg-bl" />
      <span aria-hidden className="reg-br" />
      <EyebrowLabel>{label}</EyebrowLabel>
      <div className="mt-2 break-words font-mono text-lg font-semibold text-[color:var(--foreground)]">{value}</div>
    </div>
  );
}

function DamageField({ onChange, value }: { onChange: (damageMarks: number) => void; value: number }) {
  return (
    <label className="flex items-center gap-2 rounded-sm border border-[color:var(--border)] bg-[color:var(--surface-sunken)] px-3 py-2 text-sm">
      <EyebrowLabel>Damage</EyebrowLabel>
      <input
        className="w-16 bg-transparent font-mono text-sm font-semibold text-[color:var(--foreground)] outline-none"
        min={0}
        onChange={(event) => onChange(Number(event.target.value))}
        type="number"
        value={value}
      />
    </label>
  );
}

function ScoreField({ label, onChange, value }: { label: string; onChange: (score: number) => void; value: number }) {
  return (
    <label className="space-y-2">
      <EyebrowLabel>{label}</EyebrowLabel>
      <input
        className={FIELD_INPUT_CLASS}
        min={0}
        onChange={(event) => onChange(Number(event.target.value))}
        type="number"
        value={value}
      />
    </label>
  );
}

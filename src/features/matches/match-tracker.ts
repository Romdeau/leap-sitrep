import type { Force, Match, Roster, Scenario, TokenState, UnitCard, UnitState } from "@/lib/types/domain";

export const MATCH_STORAGE_KEY = "leap-sitrep.matches.v1";

export function createMatchId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `match-${Date.now()}`;
}

export function createCoreMatch({ roster, scenarioId }: { roster: Roster; scenarioId: string }): Match {
  const savedAt = new Date().toISOString();

  return {
    id: createMatchId(),
    playerRosterIds: [roster.id],
    scenarioId,
    round: 1,
    initiativeHistory: [],
    scores: {
      player: 0,
      opponent: 0,
    },
    controlPoints: {
      player: 3,
      opponent: 3,
    },
    unitStates: roster.unitIds.map(createInitialUnitState),
    tokenStates: createDockyardTokenStates(),
    savedAt,
  };
}

export function advanceRound(match: Match): Match {
  return saveMatchState({
    ...match,
    round: match.round + 1,
    unitStates: match.unitStates.map((unitState) => ({
      ...unitState,
      activationStatus: "ready",
    })),
  });
}

export function setUnitActivation(match: Match, unitId: string, activationStatus: UnitState["activationStatus"]): Match {
  return saveMatchState({
    ...match,
    unitStates: match.unitStates.map((unitState) => (unitState.unitId === unitId ? { ...unitState, activationStatus } : unitState)),
  });
}

export function toggleUnitPinned(match: Match, unitId: string): Match {
  return saveMatchState({
    ...match,
    unitStates: match.unitStates.map((unitState) => (unitState.unitId === unitId ? { ...unitState, isPinned: !unitState.isPinned } : unitState)),
  });
}

export function toggleUnitDestroyed(match: Match, unitId: string): Match {
  return saveMatchState({
    ...match,
    unitStates: match.unitStates.map((unitState) => (unitState.unitId === unitId ? { ...unitState, isDestroyed: !unitState.isDestroyed } : unitState)),
  });
}

export function setUnitDamage(match: Match, unitId: string, damageMarks: number): Match {
  return saveMatchState({
    ...match,
    unitStates: match.unitStates.map((unitState) => (unitState.unitId === unitId ? { ...unitState, damageMarks: Math.max(0, damageMarks) } : unitState)),
  });
}

export function setScore(match: Match, playerKey: string, score: number): Match {
  return saveMatchState({
    ...match,
    scores: {
      ...match.scores,
      [playerKey]: Math.max(0, score),
    },
  });
}

export function setControlPoints(match: Match, playerKey: string, controlPoints: number): Match {
  return saveMatchState({
    ...match,
    controlPoints: {
      ...match.controlPoints,
      [playerKey]: Math.max(0, controlPoints),
    },
  });
}

export function addInitiativeEntry(match: Match, entry: string): Match {
  const trimmedEntry = entry.trim();

  if (trimmedEntry.length === 0) {
    return match;
  }

  return saveMatchState({
    ...match,
    initiativeHistory: [trimmedEntry, ...match.initiativeHistory],
  });
}

export function toggleToken(match: Match, tokenId: string): Match {
  return saveMatchState({
    ...match,
    tokenStates: match.tokenStates.map((tokenState) => (tokenState.id === tokenId ? { ...tokenState, isActive: !tokenState.isActive } : tokenState)),
  });
}

export function formatMatchExport({ force, match, roster, scenario, units }: { force: Force | undefined; match: Match; roster: Roster; scenario: Scenario | undefined; units: UnitCard[] }) {
  const forceLabel = force === undefined ? roster.forceId : `${force.name} (${force.cardId})`;
  const scenarioLabel = scenario === undefined ? match.scenarioId : scenario.title;
  const activeTokens = match.tokenStates.filter((tokenState) => tokenState.isActive).map((tokenState) => tokenState.label);
  const lines = [
    "# LEAP Sitrep Match State",
    "",
    `Scenario: ${scenarioLabel}`,
    `Force: ${forceLabel}`,
    `Round: ${match.round}`,
    `Score: Player ${match.scores.player ?? 0} / Opponent ${match.scores.opponent ?? 0}`,
    `Control Points: Player ${match.controlPoints.player ?? 0} / Opponent ${match.controlPoints.opponent ?? 0}`,
    `Active Tokens: ${activeTokens.length === 0 ? "None" : activeTokens.join(", ")}`,
    "",
    "Units:",
    ...match.unitStates.map((unitState, index) => {
      const unit = units.find((candidate) => candidate.id === unitState.unitId);
      const unitLabel = unit === undefined ? unitState.unitId : `${unit.name} (${unit.cardId})`;
      const flags = [unitState.activationStatus, unitState.isPinned ? "pinned" : null, unitState.isDestroyed ? "destroyed" : null, unitState.damageMarks > 0 ? `damage ${unitState.damageMarks}` : null]
        .filter((flag): flag is string => flag !== null)
        .join(", ");

      return `${index + 1}. ${unitLabel} - ${flags}`;
    }),
    "",
  ];

  if (match.initiativeHistory.length > 0) {
    lines.push("Initiative Log:", ...match.initiativeHistory.map((entry) => `- ${entry}`), "");
  }

  lines.push("Source gate: manual table-state export only; terrain, line of sight, hidden information, and rules adjudication are not automated.");

  return lines.join("\n");
}

export function loadStoredMatches(storage: Pick<Storage, "getItem"> = window.localStorage): Match[] {
  const raw = storage.getItem(MATCH_STORAGE_KEY);

  if (raw === null) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isStoredMatch);
  } catch {
    return [];
  }
}

export function saveStoredMatches(matches: Match[], storage: Pick<Storage, "setItem"> = window.localStorage) {
  storage.setItem(MATCH_STORAGE_KEY, JSON.stringify(matches));
}

function createInitialUnitState(unitId: string): UnitState {
  return {
    unitId,
    isDestroyed: false,
    damageMarks: 0,
    activationStatus: "ready",
    isPinned: false,
    smokeTokenIds: [],
  };
}

function createDockyardTokenStates(): TokenState[] {
  return [
    { id: "hardpoint-1", type: "hardpoint", label: "Hardpoint 1", isActive: false },
    { id: "hardpoint-2", type: "hardpoint", label: "Hardpoint 2", isActive: false },
    { id: "point-of-interest-1", type: "point-of-interest", label: "Point of Interest 1", isActive: false },
    { id: "point-of-interest-2", type: "point-of-interest", label: "Point of Interest 2", isActive: false },
    { id: "smoke-1", type: "smoke", label: "Smoke marker", isActive: false },
  ];
}

function saveMatchState(match: Match): Match {
  return {
    ...match,
    savedAt: new Date().toISOString(),
  };
}

function isStoredMatch(value: unknown): value is Match {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<Match>;

  return (
    typeof candidate.id === "string" &&
    Array.isArray(candidate.playerRosterIds) &&
    candidate.playerRosterIds.every((rosterId) => typeof rosterId === "string") &&
    typeof candidate.scenarioId === "string" &&
    typeof candidate.round === "number" &&
    Array.isArray(candidate.initiativeHistory) &&
    typeof candidate.scores === "object" &&
    candidate.scores !== null &&
    typeof candidate.controlPoints === "object" &&
    candidate.controlPoints !== null &&
    Array.isArray(candidate.unitStates) &&
    Array.isArray(candidate.tokenStates) &&
    typeof candidate.savedAt === "string"
  );
}

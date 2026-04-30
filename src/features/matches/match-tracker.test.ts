import { describe, expect, it, vi } from "vitest";

import type { Match, Roster } from "@/lib/types/domain";

import {
  addInitiativeEntry,
  advanceRound,
  createCoreMatch,
  formatMatchExport,
  loadStoredMatches,
  MATCH_STORAGE_KEY,
  saveStoredMatches,
  setScore,
  setControlPoints,
  setUnitActivation,
  setUnitDamage,
  toggleToken,
  toggleUnitDestroyed,
  toggleUnitPinned,
} from "./match-tracker";

const roster: Roster = {
  id: "roster-1",
  mode: "core",
  forceId: "harlow-1st-reaction-force",
  unitIds: ["harlow-control-team", "harlow-assault-team", "harlow-springbok-ai"],
  createdAt: "2026-04-29T00:00:00.000Z",
  updatedAt: "2026-04-29T00:00:00.000Z",
};

const unRoster: Roster = {
  id: "roster-2",
  mode: "core",
  forceId: "un-raid-force-alpha",
  unitIds: ["un-utg-assaulters", "un-utg-specialists", "golem-unit"],
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
};

describe("match tracker", () => {
  it("creates a Dockyard Assault match from a saved core roster", () => {
    const match = createCoreMatch({ roster, scenarioId: "dockyard-assault" });

    expect(match.playerRosterIds).toEqual([roster.id]);
    expect(match.scenarioId).toBe("dockyard-assault");
    expect(match.round).toBe(1);
    expect(match.controlPoints).toEqual({ player: 3, opponent: 3 });
    expect(match.unitStates.map((unitState) => unitState.unitId)).toEqual(roster.unitIds);
    expect(match.unitStates.every((unitState) => unitState.activationStatus === "ready")).toBe(true);
    expect(match.tokenStates.map((tokenState) => tokenState.type)).toEqual(["hardpoint", "hardpoint", "point-of-interest", "point-of-interest", "smoke"]);
  });

  it("creates match unit state from any verified core roster", () => {
    const match = createCoreMatch({ roster: unRoster, scenarioId: "dockyard-assault" });

    expect(match.playerRosterIds).toEqual([unRoster.id]);
    expect(match.unitStates.map((unitState) => unitState.unitId)).toEqual(["un-utg-assaulters", "un-utg-specialists", "golem-unit"]);
    expect(match.controlPoints).toEqual({ player: 3, opponent: 3 });
  });

  it("updates round, activation, pinned, destroyed, score, initiative, and token state", () => {
    const match = createCoreMatch({ roster, scenarioId: "dockyard-assault" });
    const activated = setUnitActivation(match, "harlow-control-team", "activated");
    const pinned = toggleUnitPinned(activated, "harlow-control-team");
    const destroyed = toggleUnitDestroyed(pinned, "harlow-control-team");
    const damaged = setUnitDamage(destroyed, "harlow-control-team", 2);
    const scored = setScore(damaged, "player", 2);
    const controlPoints = setControlPoints(scored, "player", 1);
    const initiative = addInitiativeEntry(controlPoints, "Round 1: player won initiative");
    const tokened = toggleToken(initiative, "hardpoint-1");
    const nextRound = advanceRound(tokened);

    expect(tokened.unitStates[0]).toMatchObject({ activationStatus: "activated", damageMarks: 2, isPinned: true, isDestroyed: true });
    expect(tokened.scores.player).toBe(2);
    expect(tokened.controlPoints.player).toBe(1);
    expect(tokened.initiativeHistory).toEqual(["Round 1: player won initiative"]);
    expect(tokened.tokenStates[0].isActive).toBe(true);
    expect(nextRound.round).toBe(2);
    expect(nextRound.unitStates.every((unitState) => unitState.activationStatus === "ready")).toBe(true);
  });

  it("round-trips saved matches from local storage", () => {
    const storage = new Map<string, string>();
    const mockStorage = {
      getItem: vi.fn((key: string) => storage.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
    };
    const match = createCoreMatch({ roster, scenarioId: "dockyard-assault" });

    saveStoredMatches([match], mockStorage);

    expect(mockStorage.setItem).toHaveBeenCalledWith(MATCH_STORAGE_KEY, JSON.stringify([match]));
    expect(loadStoredMatches(mockStorage)).toEqual<Match[]>([match]);
  });

  it("formats a source-gated match state export", () => {
    const match = addInitiativeEntry(setControlPoints(setScore(setUnitDamage(toggleUnitPinned(setUnitActivation(createCoreMatch({ roster: unRoster, scenarioId: "dockyard-assault" }), "un-utg-assaulters", "activated"), "un-utg-assaulters"), "un-utg-assaulters", 1), "player", 2), "player", 1), "Round 1: UN won initiative");

    expect(
      formatMatchExport({
        force: {
          id: "un-raid-force-alpha",
          cardId: "RFA-4390",
          name: "UN Raid Force Alpha",
          parentLoreFactionId: "un-raid-force-alpha",
          battleDrills: [],
          forceRules: [],
          armory: [],
          citations: [],
          confidence: "verified",
        },
        match,
        roster: unRoster,
        scenario: {
          id: "dockyard-assault",
          title: "Dockyard Assault",
          mode: "core",
          setup: [],
          scoringRules: [],
          specialRules: [],
          tableSize: "2'x2'",
          hardpoints: [],
          pointsOfInterest: [],
          citations: [],
        },
        units: [
          {
            id: "un-utg-assaulters",
            cardId: "RFA-4391",
            forceId: "un-raid-force-alpha",
            name: "UN UTG Assaulters",
            modelCount: 1,
            stats: { move: null, shoot: null, armor: null, hack: null, wounds: null },
            specialists: [],
            weapons: [],
            abilities: [],
            citations: [],
            confidence: "verified",
          },
        ],
      }),
    ).toContain("1. UN UTG Assaulters (RFA-4391) - activated, pinned, damage 1");
  });
});

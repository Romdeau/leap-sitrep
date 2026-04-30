import { describe, expect, it, vi } from "vitest";

import type { Force, Roster, UnitCard } from "@/lib/types/domain";

import { createCoreRoster, duplicateRoster, formatCoreRosterExport, loadStoredRosters, ROSTER_STORAGE_KEY, saveStoredRosters, validateCoreRoster } from "./roster-builder";

const force: Force = {
  id: "harlow-1st-reaction-force",
  cardId: "HFR-6770",
  name: "Harlow 1st Reaction Force",
  parentLoreFactionId: "the-authority",
  battleDrills: [],
  forceRules: [],
  armory: [],
  citations: [],
  confidence: "verified",
};

const unForce: Force = {
  id: "un-raid-force-alpha",
  cardId: "RFA-4390",
  name: "UN Raid Force Alpha",
  parentLoreFactionId: "un-raid-force-alpha",
  battleDrills: [],
  forceRules: [],
  armory: [],
  citations: [],
  confidence: "verified",
};

const units = ["harlow-control-team", "harlow-assault-team", "harlow-springbok-ai"].map(
  (id): UnitCard => ({
    id,
    cardId: id,
    forceId: force.id,
    name: id,
    modelCount: 1,
    stats: { move: null, shoot: null, armor: null, hack: null, wounds: null },
    specialists: [],
    weapons: [],
    abilities: [],
    citations: [],
    confidence: "verified",
  }),
);

describe("core roster builder", () => {
  it("validates one force and three units as a legal core roster", () => {
    const result = validateCoreRoster(
      {
        mode: "core",
        forceId: force.id,
        unitIds: units.map((unit) => unit.id),
      },
      force,
      units,
    );

    expect(result.isLegal).toBe(true);
    expect(result.messages).toEqual(["Legal core roster: 1 verified force card and 3 unit cards from that force."]);
  });

  it("rejects incomplete or cross-force core rosters", () => {
    const crossForceUnit: UnitCard = {
      id: "un-utg-assaulters",
      cardId: "RFA-4391",
      forceId: unForce.id,
      name: "UN UTG Assaulters",
      modelCount: 1,
      stats: { move: null, shoot: null, armor: null, hack: null, wounds: null },
      specialists: [],
      weapons: [],
      abilities: [],
      citations: [],
      confidence: "verified",
    };
    const result = validateCoreRoster(
      {
        mode: "core",
        forceId: force.id,
        unitIds: [units[0].id, units[1].id, crossForceUnit.id],
      },
      force,
      [...units, crossForceUnit],
    );

    expect(result.isLegal).toBe(false);
    expect(result.messages).toContain("All selected units must belong to the selected force.");
  });

  it("rejects incomplete core rosters", () => {
    const result = validateCoreRoster(
      {
        mode: "core",
        forceId: force.id,
        unitIds: [units[0].id, "not-a-harlow-unit"],
      },
      force,
      units,
    );

    expect(result.isLegal).toBe(false);
    expect(result.messages).toContain("Core play requires exactly 3 unit cards from the selected force.");
    expect(result.messages).toContain("Every selected unit must exist in the verified force dataset.");
  });

  it("creates and round-trips saved rosters from storage", () => {
    const storage = new Map<string, string>();
    const mockStorage = {
      getItem: vi.fn((key: string) => storage.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
    };
    const roster = createCoreRoster({ forceId: force.id, notes: " Seed roster ", unitIds: units.map((unit) => unit.id) });

    saveStoredRosters([roster], mockStorage);

    expect(mockStorage.setItem).toHaveBeenCalledWith(ROSTER_STORAGE_KEY, JSON.stringify([roster]));
    expect(loadStoredRosters(mockStorage)).toEqual<Roster[]>([{ ...roster, notes: "Seed roster" }]);
  });

  it("duplicates a saved roster without mutating the source roster", () => {
    const roster = createCoreRoster({ forceId: force.id, notes: "Seed roster", unitIds: units.map((unit) => unit.id) });

    const copy = duplicateRoster(roster);

    expect(copy.id).not.toBe(roster.id);
    expect(copy.forceId).toBe(roster.forceId);
    expect(copy.unitIds).toEqual(roster.unitIds);
    expect(copy.notes).toBe("Seed roster Copy");
    expect(copy.createdAt).toBe(copy.updatedAt);
    expect(roster.notes).toBe("Seed roster");
  });

  it("formats a source-gated core roster export", () => {
    const roster = createCoreRoster({ forceId: force.id, notes: "Table note", unitIds: units.map((unit) => unit.id) });
    const validation = validateCoreRoster(roster, force, units);

    expect(formatCoreRosterExport({ force, roster, units, validation })).toBe(`# LEAP Sitrep Core Roster

Mode: core
Force: Harlow 1st Reaction Force (HFR-6770)
Legality: Legal

Units:
1. harlow-control-team (harlow-control-team) - Move -, Shoot -, Armor -
2. harlow-assault-team (harlow-assault-team) - Move -, Shoot -, Armor -
3. harlow-springbok-ai (harlow-springbok-ai) - Move -, Shoot -, Armor -

Notes:
Table note

Source gate: verified force/unit data only; matched-play handlers, BLKLIST, points, dusters, and inferred validation are not included.`);
  });

  it("includes validation problems in illegal roster exports", () => {
    const roster = {
      mode: "core" as const,
      forceId: force.id,
      unitIds: [units[0].id, units[0].id],
    };
    const validation = validateCoreRoster(roster, force, units);
    const exportedRoster = formatCoreRosterExport({ force, roster, units, validation });

    expect(exportedRoster).toContain("Legality: Needs attention");
    expect(exportedRoster).toContain("- Core play requires exactly 3 unit cards from the selected force.");
    expect(exportedRoster).toContain("- Each selected unit slot must reference a distinct unit card.");
  });
});

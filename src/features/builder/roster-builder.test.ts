import { describe, expect, it, vi } from "vitest";

import type { Force, Roster, UnitCard } from "@/lib/types/domain";

import { createCoreRoster, loadStoredRosters, ROSTER_STORAGE_KEY, saveStoredRosters, validateCoreRoster } from "./roster-builder";

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
});

import type { Force, Roster, UnitCard } from "@/lib/types/domain";

export const ROSTER_STORAGE_KEY = "leap-sitrep.rosters.v1";

export interface RosterValidationResult {
  isLegal: boolean;
  messages: string[];
}

export function createRosterId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `roster-${Date.now()}`;
}

export function createCoreRoster({ forceId, notes, unitIds }: { forceId: string; notes?: string; unitIds: string[] }): Roster {
  const now = new Date().toISOString();

  return {
    id: createRosterId(),
    mode: "core",
    forceId,
    unitIds,
    notes: notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };
}

export function validateCoreRoster(roster: Pick<Roster, "forceId" | "mode" | "unitIds">, force: Force | undefined, units: UnitCard[]): RosterValidationResult {
  const messages: string[] = [];

  if (roster.mode !== "core") {
    messages.push("This builder slice only validates core-play rosters.");
  }

  if (force === undefined) {
    messages.push("Select one verified force card.");
  }

  if (roster.unitIds.length !== 3) {
    messages.push("Core play requires exactly 3 unit cards from the selected force.");
  }

  const uniqueUnitIds = new Set(roster.unitIds);
  if (uniqueUnitIds.size !== roster.unitIds.length) {
    messages.push("Each selected unit slot must reference a distinct unit card.");
  }

  const selectedUnits = roster.unitIds.map((unitId) => units.find((unit) => unit.id === unitId));
  if (selectedUnits.some((unit) => unit === undefined)) {
    messages.push("Every selected unit must exist in the verified force dataset.");
  }

  if (force !== undefined && selectedUnits.some((unit) => unit !== undefined && unit.forceId !== force.id)) {
    messages.push("All selected units must belong to the selected force.");
  }

  if (messages.length === 0) {
    messages.push("Legal core roster: 1 verified force card and 3 unit cards from that force.");
  }

  return {
    isLegal: messages.length === 1 && messages[0].startsWith("Legal core roster"),
    messages,
  };
}

export function loadStoredRosters(storage: Pick<Storage, "getItem"> = window.localStorage): Roster[] {
  const raw = storage.getItem(ROSTER_STORAGE_KEY);

  if (raw === null) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isStoredRoster);
  } catch {
    return [];
  }
}

export function saveStoredRosters(rosters: Roster[], storage: Pick<Storage, "setItem"> = window.localStorage) {
  storage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(rosters));
}

function isStoredRoster(value: unknown): value is Roster {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<Roster>;

  return (
    typeof candidate.id === "string" &&
    candidate.mode === "core" &&
    typeof candidate.forceId === "string" &&
    Array.isArray(candidate.unitIds) &&
    candidate.unitIds.every((unitId) => typeof unitId === "string") &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string"
  );
}

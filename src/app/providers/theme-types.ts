export type AppearanceMode = "light" | "dark" | "system";
export type Faction =
  | "blkout"
  | "black-pact"
  | "dusters"
  | "harlow"
  | "boone"
  | "authority";

export const FACTION_VALUES: readonly Faction[] = [
  "blkout",
  "black-pact",
  "dusters",
  "harlow",
  "boone",
  "authority",
] as const;

export const FACTION_LABELS: Record<Faction, string> = {
  blkout: "BLKOUT",
  "black-pact": "Black Pact",
  dusters: "Dusters",
  harlow: "Harlow",
  boone: "Boone",
  authority: "Authority",
};

export const FACTION_SWATCH: Record<Faction, string> = {
  blkout: "#f5c518",
  "black-pact": "#d62830",
  dusters: "#e8662b",
  harlow: "#d2a516",
  boone: "#7aa968",
  authority: "#2f6fb3",
};

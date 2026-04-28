export type PacketNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type DocumentType =
  | "lore"
  | "rules"
  | "supplemental"
  | "special-rules"
  | "unit-cards"
  | "unit-card-screenshots"
  | "quick-reference"
  | "planning";

export type ConfidenceLevel = "sample" | "raw" | "curated" | "verified" | "uncertain";

export type RuleMode = "core" | "matched-play" | "effective";

export interface SourceCitation {
  documentId: string;
  label: string;
  sectionId?: string;
  page?: number;
  lineStart?: number;
  lineEnd?: number;
  excerpt?: string;
}

export interface SourceDocument {
  id: string;
  title: string;
  fileName: string;
  documentType: DocumentType;
  version: string;
  isCanonical: boolean;
  precedenceRank?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface LoreEvent {
  id: string;
  year: string;
  title: string;
  summary: string;
  involvedFactionIds: string[];
  citations: SourceCitation[];
}

export interface LoreFaction {
  id: string;
  name: string;
  summary: string;
  ideology: string;
  regions: string[];
  relatedForceIds: string[];
  citations: SourceCitation[];
}

export interface LoreLocation {
  id: string;
  name: string;
  region: string;
  description: string;
  relatedEventIds: string[];
  citations: SourceCitation[];
}

export interface LoreSpecies {
  id: string;
  name: string;
  classification: "flora" | "fauna";
  habitat: string;
  description: string;
  citations: SourceCitation[];
}

export interface GlossaryTerm {
  id: string;
  term: string;
  meaning: string;
  aliases: string[];
  relatedRuleIds: string[];
  relatedFactionIds: string[];
  citations: SourceCitation[];
}

export interface RuleSubsection {
  id: string;
  number: string;
  title: string;
  order: number;
  body: string;
  citations: SourceCitation[];
}

export interface RuleSection {
  id: string;
  title: string;
  category: string;
  mode: RuleMode;
  overview: string | null;
  subsections: RuleSubsection[];
  body: string;
  citations: SourceCitation[];
}

export interface EffectiveRuleRecord {
  id: string;
  title: string;
  originalRuleId: string;
  originalText: string;
  effectiveText: string;
  precedenceReason: string;
  citations: SourceCitation[];
}

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  topic: string;
  citations: SourceCitation[];
}

export interface ErrataEntry {
  id: string;
  target: string;
  oldTextSummary: string;
  newTextSummary: string;
  citations: SourceCitation[];
}

export interface UniversalSpecialRule {
  id: string;
  name: string;
  currentText: string;
  aliases: string[];
  relatedRuleIds: string[];
  notes: CitationBackedText[];
  citations: SourceCitation[];
}

export interface WeaponProfile {
  id: string;
  name: string;
  range: string | null;
  damage: string | null;
  keywords: string[];
  carrier?: string;
  firingModeNotes?: string;
  citations: SourceCitation[];
}

export interface CitationBackedText {
  id: string;
  label: string;
  text: string;
  citations: SourceCitation[];
}

export interface ArmoryItem {
  id: string;
  name: string;
  text: string;
  profile?: WeaponProfile;
  citations: SourceCitation[];
}

export interface UnitSpecialist {
  id: string;
  slot: number;
  name: string;
  description?: string;
  weaponId?: string;
  citations: SourceCitation[];
}

export interface UnitStats {
  move: string | null;
  shoot: string | null;
  armor: string | null;
  hack: string | null;
  wounds: string | null;
}

export interface UnitCard {
  id: string;
  cardId: string;
  forceId: string;
  name: string;
  modelCount: number;
  stats: UnitStats;
  specialists: UnitSpecialist[];
  weapons: WeaponProfile[];
  abilities: CitationBackedText[];
  citations: SourceCitation[];
  confidence: ConfidenceLevel;
}

export interface Force {
  id: string;
  cardId: string;
  name: string;
  parentLoreFactionId: string;
  battleDrills: CitationBackedText[];
  forceRules: CitationBackedText[];
  armory: ArmoryItem[];
  citations: SourceCitation[];
  confidence: ConfidenceLevel;
}

export interface Scenario {
  id: string;
  title: string;
  mode: RuleMode;
  setup: string[];
  scoringRules: string[];
  specialRules: string[];
  tableSize: string;
  hardpoints: string[];
  pointsOfInterest: string[];
  citations: SourceCitation[];
}

export interface Roster {
  id: string;
  mode: "core" | "matched-play";
  forceId: string;
  unitIds: string[];
  handlerId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnitState {
  unitId: string;
  isDestroyed: boolean;
  damageMarks: number;
  activationStatus: "ready" | "activated" | "engaged";
  isPinned: boolean;
  smokeTokenIds: string[];
  notes?: string;
}

export interface TokenState {
  id: string;
  type:
    | "smoke"
    | "blast"
    | "hardpoint"
    | "point-of-interest"
    | "burn-card"
    | "custom";
  label: string;
  linkedUnitId?: string;
  isActive: boolean;
}

export interface Match {
  id: string;
  playerRosterIds: string[];
  scenarioId: string;
  round: number;
  initiativeHistory: string[];
  scores: Record<string, number>;
  unitStates: UnitState[];
  tokenStates: TokenState[];
  savedAt: string;
}

export interface RouteManifestEntry {
  id: string;
  path: string;
  label: string;
  shortLabel: string;
  section: "Hub" | "Reference" | "Play";
  summary: string;
  activationPacket: PacketNumber;
  dataContracts: string[];
  nav: boolean;
}

import type {
  EffectiveRuleRecord,
  ErrataEntry,
  FaqEntry,
  Force,
  GlossaryTerm,
  LoreEvent,
  LoreFaction,
  LoreLocation,
  LoreSpecies,
  RouteManifestEntry,
  RuleSection,
  Scenario,
  SourceCitation,
  SourceDocument,
  UniversalSpecialRule,
  UnitCard,
} from "./domain";

export type GeneratedDatasetKind =
  | "source-registry"
  | "app-bootstrap"
  | "lore"
  | "rules"
  | "forces"
  | "force-audit"
  | "scenarios"
  | "search-index";

export interface GeneratedDatasetMeta<TKind extends GeneratedDatasetKind> {
  kind: TKind;
  version: string;
  generatedAt: string;
  sourceDocumentIds: string[];
  confidence: "sample" | "raw" | "extracted" | "curated" | "verified";
}

export interface GeneratedDatasetEnvelope<TKind extends GeneratedDatasetKind, TData> {
  meta: GeneratedDatasetMeta<TKind>;
  data: TData;
}

export interface ContractStatusRecord {
  name: string;
  status: "stable" | "placeholder" | "planned";
  notes: string;
}

export interface SeedSliceDescriptor {
  lorePages: Array<{
    id: string;
    title: string;
    route: string;
  }>;
  ruleTopics: string[];
  force: {
    id: string;
    name: string;
    route: string;
  };
  units: Array<{
    id: string;
    name: string;
    route: string;
  }>;
  scenario: {
    id: string;
    title: string;
    route: string;
  };
}

export type SourceRegistryFile = GeneratedDatasetEnvelope<
  "source-registry",
  {
    documents: SourceDocument[];
  }
>;

export type AppBootstrapFixtureFile = GeneratedDatasetEnvelope<
  "app-bootstrap",
  {
    seedSlice: SeedSliceDescriptor;
    contracts: ContractStatusRecord[];
    validationTargets: string[];
  }
>;

export type LoreDatasetFile = GeneratedDatasetEnvelope<
  "lore",
  {
    factions: LoreFaction[];
    events: LoreEvent[];
    locations: LoreLocation[];
    species: LoreSpecies[];
    glossary: GlossaryTerm[];
  }
>;

export type RulesDatasetFile = GeneratedDatasetEnvelope<
  "rules",
  {
    rules: RuleSection[];
    effectiveRules: EffectiveRuleRecord[];
    faq: FaqEntry[];
    errata: ErrataEntry[];
    universalSpecialRules: UniversalSpecialRule[];
  }
>;

export type ForceDatasetFile = GeneratedDatasetEnvelope<
  "forces",
  {
    forces: Force[];
    units: UnitCard[];
  }
>;

export interface RawCardAuditRecord {
  id: string;
  cardId: string;
  name: string;
  recordType: "force" | "unit";
  rawLines: string[];
  verificationDocumentIds: string[];
  notes: string;
  citations: SourceCitation[];
}

export type ForceAuditDatasetFile = GeneratedDatasetEnvelope<
  "force-audit",
  {
    rawCards: RawCardAuditRecord[];
  }
>;

export type ScenarioDatasetFile = GeneratedDatasetEnvelope<
  "scenarios",
  {
    scenarios: Scenario[];
  }
>;

export interface RouteSkeletonSummary {
  routes: RouteManifestEntry[];
}

export interface SearchAliasMap {
  [alias: string]: string[];
}

export interface SearchIndexRecord {
  id: string;
  entityType:
    | "rule"
    | "rule-subsection"
    | "effective-rule"
    | "faq"
    | "errata"
    | "usr"
    | "lore-faction"
    | "lore-event"
    | "lore-location"
    | "lore-species"
    | "glossary"
    | "scenario"
    | "force"
    | "unit";
  title: string;
  summary: string;
  keywords: string[];
  aliases: string[];
  route: string;
  sourceDocumentIds: string[];
  relatedIds: string[];
}

export type SearchIndexFile = GeneratedDatasetEnvelope<
  "search-index",
  {
    aliasMap: SearchAliasMap;
    records: SearchIndexRecord[];
  }
>;

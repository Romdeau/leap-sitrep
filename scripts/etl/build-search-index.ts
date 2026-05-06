import type {
  ForceDatasetFile,
  LoreDatasetFile,
  RulesDatasetFile,
  ScenarioDatasetFile,
  SearchAliasMap,
  SearchIndexFile,
  SearchIndexRecord,
  SourceRegistryFile,
} from "../../src/lib/types/generated";

const SEARCH_ALIAS_MAP: SearchAliasMap = {
  cqc: ["close quarters combat", "combat"],
  ai: ["artificial intelligence", "powered", "data knife", "data spike"],
  emp: ["electromagnetic pulse"],
  ap: ["armor piercing"],
  utg: ["urban tactical groups", "twin moons program"],
  "return fire": ["reactions", "combat"],
  "close quarters combat": ["cqc", "melee"],
};

export function buildSearchIndex(options: {
  sourceRegistry: SourceRegistryFile;
  lore: LoreDatasetFile;
  rules: RulesDatasetFile;
  supplemental: RulesDatasetFile;
  scenarios: ScenarioDatasetFile;
  forces?: ForceDatasetFile;
  generatedAt: string;
}): SearchIndexFile {
  const records: SearchIndexRecord[] = [
    ...buildRuleRecords(options.rules),
    ...buildFaqRecords(options.rules),
    ...buildErrataRecords(options.rules),
    ...buildUsrRecords(options.rules),
    ...buildLoreRecords(options.lore),
    ...buildScenarioRecords(options.scenarios),
    ...(options.forces ? buildForceRecords(options.forces) : []),
  ];

  return {
    meta: {
      kind: "search-index",
      version: "packet-2",
      generatedAt: options.generatedAt,
      sourceDocumentIds: options.sourceRegistry.data.documents.map((document) => document.id),
      confidence: "curated",
    },
    data: {
      aliasMap: SEARCH_ALIAS_MAP,
      records,
    },
  };
}

function buildRuleRecords(dataset: RulesDatasetFile): SearchIndexRecord[] {
  return [
    ...dataset.data.rules.map((rule) => ({
      id: `rule-${rule.id}`,
      entityType: "rule" as const,
      title: rule.title,
      summary: rule.overview ?? rule.body,
      keywords: [rule.id, rule.category, rule.mode],
      aliases: inferAliases(rule.title),
      route: rule.mode === "matched-play" ? "/rules/matched-play" : "/rules/core",
      sourceDocumentIds: Array.from(new Set(rule.citations.map((citation) => citation.documentId))),
      relatedIds: dataset.data.effectiveRules
        .filter((effectiveRule) => effectiveRule.originalRuleId === rule.id)
        .map((effectiveRule) => effectiveRule.id),
    })),
    ...dataset.data.rules.flatMap((rule) =>
      rule.subsections.map((subsection) => ({
        id: `rule-subsection-${subsection.id}`,
        entityType: "rule-subsection" as const,
        title: `${subsection.number} ${subsection.title}`,
        summary: subsection.body,
        keywords: [rule.id, rule.category, subsection.number, rule.mode],
        aliases: inferAliases(subsection.title),
        route:
          rule.mode === "matched-play"
            ? "/rules/matched-play"
            : `/rules/core#${encodeURIComponent(`rule-subsection-${subsection.id}`)}`,
        sourceDocumentIds: Array.from(new Set(subsection.citations.map((citation) => citation.documentId))),
        relatedIds: [rule.id],
      })),
    ),
    ...dataset.data.effectiveRules.map((rule) => ({
      id: rule.id,
      entityType: "effective-rule" as const,
      title: `${rule.title} (effective)`,
      summary: rule.effectiveText,
      keywords: [rule.originalRuleId, "effective", "override"],
      aliases: inferAliases(rule.title),
      route: `/rules/core`,
      sourceDocumentIds: Array.from(new Set(rule.citations.map((citation) => citation.documentId))),
      relatedIds: [rule.originalRuleId],
    })),
  ];
}

function buildFaqRecords(dataset: RulesDatasetFile): SearchIndexRecord[] {
  return dataset.data.faq.map((faq) => ({
    id: faq.id,
    entityType: "faq",
    title: faq.question,
    summary: faq.answer,
    keywords: [faq.topic],
    aliases: inferAliases(faq.question),
    route: "/rules/matched-play",
    sourceDocumentIds: Array.from(new Set(faq.citations.map((citation) => citation.documentId))),
    relatedIds: faq.citations.flatMap((citation) => (citation.sectionId ? [citation.sectionId] : [])),
  }));
}

function buildErrataRecords(dataset: RulesDatasetFile): SearchIndexRecord[] {
  return dataset.data.errata.map((errata) => ({
    id: errata.id,
    entityType: "errata",
    title: errata.target,
    summary: errata.newTextSummary,
    keywords: ["errata", "clarification"],
    aliases: inferAliases(errata.target),
    route: "/rules/matched-play",
    sourceDocumentIds: Array.from(new Set(errata.citations.map((citation) => citation.documentId))),
    relatedIds: errata.citations.flatMap((citation) => (citation.sectionId ? [citation.sectionId] : [])),
  }));
}

function buildUsrRecords(dataset: RulesDatasetFile): SearchIndexRecord[] {
  return dataset.data.universalSpecialRules.map((rule) => ({
    id: rule.id,
    entityType: "usr",
    title: rule.name,
    summary: rule.currentText,
    keywords: rule.relatedRuleIds,
    aliases: [...rule.aliases, ...inferAliases(rule.name)],
    route: `/rules/usr/${rule.id}`,
    sourceDocumentIds: Array.from(new Set(rule.citations.map((citation) => citation.documentId))),
    relatedIds: rule.relatedRuleIds,
  }));
}

function buildLoreRecords(dataset: LoreDatasetFile): SearchIndexRecord[] {
  return [
    ...dataset.data.factions.map((entry) => ({
      id: entry.id,
      entityType: "lore-faction" as const,
      title: entry.name,
      summary: entry.summary,
      keywords: [...entry.regions, ...entry.relatedForceIds],
      aliases: inferAliases(entry.name),
      route: `/lore/factions/${entry.id}`,
      sourceDocumentIds: Array.from(new Set(entry.citations.map((citation) => citation.documentId))),
      relatedIds: entry.relatedForceIds,
    })),
    ...dataset.data.events.map((entry) => ({
      id: entry.id,
      entityType: "lore-event" as const,
      title: entry.title,
      summary: entry.summary,
      keywords: [entry.year, ...entry.involvedFactionIds],
      aliases: inferAliases(entry.title),
      route: "/lore/timeline",
      sourceDocumentIds: Array.from(new Set(entry.citations.map((citation) => citation.documentId))),
      relatedIds: entry.involvedFactionIds,
    })),
    ...dataset.data.locations.map((entry) => ({
      id: entry.id,
      entityType: "lore-location" as const,
      title: entry.name,
      summary: entry.description,
      keywords: [entry.region],
      aliases: inferAliases(entry.name),
      route: "/lore",
      sourceDocumentIds: Array.from(new Set(entry.citations.map((citation) => citation.documentId))),
      relatedIds: entry.relatedEventIds,
    })),
    ...dataset.data.species.map((entry) => ({
      id: entry.id,
      entityType: "lore-species" as const,
      title: entry.name,
      summary: entry.description,
      keywords: [entry.classification, entry.habitat],
      aliases: inferAliases(entry.name),
      route: "/lore",
      sourceDocumentIds: Array.from(new Set(entry.citations.map((citation) => citation.documentId))),
      relatedIds: [],
    })),
    ...dataset.data.glossary.map((entry) => ({
      id: entry.id,
      entityType: "glossary" as const,
      title: entry.term,
      summary: entry.meaning,
      keywords: [...entry.relatedRuleIds, ...entry.relatedFactionIds],
      aliases: [...entry.aliases, ...inferAliases(entry.term)],
      route: "/glossary",
      sourceDocumentIds: Array.from(new Set(entry.citations.map((citation) => citation.documentId))),
      relatedIds: [...entry.relatedRuleIds, ...entry.relatedFactionIds],
    })),
  ];
}

function buildScenarioRecords(dataset: ScenarioDatasetFile): SearchIndexRecord[] {
  return dataset.data.scenarios.map((scenario) => ({
    id: scenario.id,
    entityType: "scenario",
    title: scenario.title,
    summary: [...scenario.setup, ...scenario.scoringRules, ...scenario.specialRules].join(" "),
    keywords: [scenario.mode, ...scenario.hardpoints, ...scenario.pointsOfInterest],
    aliases: inferAliases(scenario.title),
    route: `/scenarios/${scenario.id}`,
    sourceDocumentIds: Array.from(new Set(scenario.citations.map((citation) => citation.documentId))),
    relatedIds: [],
  }));
}

function buildForceRecords(dataset: ForceDatasetFile): SearchIndexRecord[] {
  return [
    ...dataset.data.forces.map((force) => ({
        id: force.id,
        entityType: "force" as const,
        title: force.name,
        summary: [
          ...force.battleDrills.map((entry) => `${entry.name}: ${entry.text}`),
          ...force.rules.map((entry) => `${entry.name}: ${entry.text}`),
        ].join(" "),
      keywords: [force.cardId, force.faction, ...force.armory.map((item) => item.name.toLowerCase())],
      aliases: [...inferAliases(force.name), force.cardId.toLowerCase()],
      route: `/forces/${force.id}`,
      sourceDocumentIds: Array.from(new Set(force.citations.map((citation) => citation.documentId))),
      relatedIds: dataset.data.units.filter((unit) => unit.forceId === force.id).map((unit) => unit.id),
    })),
    ...dataset.data.units.map((unit) => ({
        id: unit.id,
        entityType: "unit" as const,
        title: unit.name,
        summary: [
          ...unit.abilities.map((entry) => `${entry.name}: ${entry.text}`),
          ...unit.specialists.map((specialist) => `Specialist ${specialist.slot}: ${specialist.name}`),
        ].join(" "),
      keywords: [unit.cardId, ...unit.weapons.map((weapon) => weapon.name.toLowerCase())],
      aliases: [...inferAliases(unit.name), unit.cardId.toLowerCase()],
      route: `/units/${unit.id}`,
      sourceDocumentIds: Array.from(new Set(unit.citations.map((citation) => citation.documentId))),
      relatedIds: [unit.forceId],
    })),
  ];
}

function inferAliases(value: string) {
  const lowered = value.toLowerCase();
  const aliases = new Set<string>();

  for (const [alias, expansions] of Object.entries(SEARCH_ALIAS_MAP)) {
    if (lowered.includes(alias) || expansions.some((expansion) => lowered.includes(expansion))) {
      aliases.add(alias);

      for (const expansion of expansions) {
        aliases.add(expansion);
      }
    }
  }

  return Array.from(aliases);
}

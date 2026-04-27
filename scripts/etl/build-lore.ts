import type {
  GlossaryTerm,
  LoreEvent,
  LoreFaction,
  LoreLocation,
  LoreSpecies,
  SourceCitation,
} from "../../src/lib/types/domain";
import type { LoreDatasetFile } from "../../src/lib/types/generated";

import { collectTextBlocks, isYearLine, normalizeWhitespace, readSourceLines, slugify } from "../lib/markdown";

const LORE_DOCUMENT_ID = "blkout-lore-primer";

interface TimedBlock {
  year: string;
  text: string;
  lineStart: number;
  lineEnd: number;
}

interface NamedEntry {
  title: string;
  body: string;
  lineStart: number;
  lineEnd: number;
}

export async function buildLoreDataset(options: {
  filePath: string;
  generatedAt: string;
}): Promise<LoreDatasetFile> {
  const lines = await readSourceLines(options.filePath);

  const events = extractTimelineEvents(lines);
  const species = extractSpecies(lines);
  const factions = extractFactions(lines);
  const locations = extractLocations(lines);
  const glossary = extractGlossary(events, factions, locations, species);

  return {
    meta: {
      kind: "lore",
      version: "packet-1",
      generatedAt: options.generatedAt,
      sourceDocumentIds: [LORE_DOCUMENT_ID],
      confidence: "extracted",
    },
    data: {
      factions,
      events,
      locations,
      species,
      glossary,
    },
  };
}

function extractTimelineEvents(lines: Awaited<ReturnType<typeof readSourceLines>>): LoreEvent[] {
  const blocks = collectTextBlocks(lines);
  const yearBlocks: TimedBlock[] = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const current = blocks[index];

    if (!isYearLine(current.text)) {
      continue;
    }

    const next = blocks[index + 1];

    if (next === undefined || isYearLine(next.text)) {
      continue;
    }

    yearBlocks.push({
      year: current.text,
      text: next.text,
      lineStart: current.lineStart,
      lineEnd: next.lineEnd,
    });
  }

  return yearBlocks.map((block, index) => ({
    id: `timeline-${block.year}-${index + 1}`,
    year: block.year,
    title: summarizeTimelineTitle(block.text, block.year),
    summary: block.text,
    involvedFactionIds: inferFactionIds(block.text),
    citations: [
      createCitation({
        label: `Lore timeline ${block.year}`,
        lineStart: block.lineStart,
        lineEnd: block.lineEnd,
      }),
    ],
  }));
}

function summarizeTimelineTitle(text: string, year: string) {
  const sentence = text.split(/(?<=[.!?])\s+/)[0] ?? text;
  return `${year}: ${sentence.slice(0, 72).replace(/[.]+$/, "")}`;
}

function extractSpecies(lines: Awaited<ReturnType<typeof readSourceLines>>): LoreSpecies[] {
  const floraEntries = extractNamedEntries(lines, "CRIMSON FERNS", "DUNE GRASS");
  const faunaEntries = extractNamedEntries(lines, "ASH DRAKES", "IDERES RAMS");

  return [
    ...floraEntries.map((entry) => createSpecies(entry, "flora")),
    ...faunaEntries.map((entry) => createSpecies(entry, "fauna")),
  ];
}

function createSpecies(entry: NamedEntry, classification: "flora" | "fauna"): LoreSpecies {
  return {
    id: slugify(entry.title),
    name: toTitleCase(entry.title),
    classification,
    habitat: inferHabitat(entry.body),
    description: entry.body,
    citations: [
      createCitation({
        label: `${classification} entry: ${toTitleCase(entry.title)}`,
        lineStart: entry.lineStart,
        lineEnd: entry.lineEnd,
      }),
    ],
  };
}

function extractFactions(lines: Awaited<ReturnType<typeof readSourceLines>>): LoreFaction[] {
  const entries = [
    ...extractNamedEntries(lines, "THE AUTHORITY", "THE TWIN MOONS PROGRAM"),
    ...extractNamedEntries(lines, "THE TWIN MOONS PROGRAM", "UN RAID FORCE ALPHA"),
    ...extractNamedEntries(lines, "UN RAID FORCE ALPHA", "HARLOW 1ST ASSAULT BATTALION"),
    ...extractNamedEntries(lines, "HARLOW 1ST ASSAULT BATTALION", "ORK"),
    ...extractNamedEntries(lines, "ORK", "CHIMERA"),
    ...extractNamedEntries(lines, "CHIMERA", "MANTICOR BORZ"),
    ...extractNamedEntries(lines, "MANTICOR BORZ", "BANAK"),
    ...extractNamedEntries(lines, "BANAK", "THE HEADLESS"),
    ...extractNamedEntries(lines, "THE HEADLESS", "WAR ON ABOL"),
  ];

  const uniqueEntries = dedupeNamedEntries(entries);

  return uniqueEntries.map((entry) => ({
    id: slugify(entry.title),
    name: toTitleCase(entry.title),
    summary: entry.body,
    ideology: inferIdeology(entry.body),
    regions: inferRegions(entry.body),
    relatedForceIds: inferRelatedForceIds(entry.title),
    citations: [
      createCitation({
        label: `Faction section: ${toTitleCase(entry.title)}`,
        lineStart: entry.lineStart,
        lineEnd: entry.lineEnd,
      }),
    ],
  }));
}

function extractLocations(lines: Awaited<ReturnType<typeof readSourceLines>>): LoreLocation[] {
  const section = extractSectionParagraphs(lines, "LIFE ON ABOL", "FLORA & FAUNA OF ABOL");
  const citySection = extractSectionParagraphs(lines, "CITIES", "HOMESTEADS AND FRONTIER TOWNS");
  const frontierSection = extractSectionParagraphs(lines, "HOMESTEADS AND FRONTIER TOWNS", "LIVESTOCK AND FARMING");

  return [
    {
      id: "cenriv-crater-complex",
      name: "Cenriv Crater Complex",
      region: "Southern Hemisphere",
      description: section.text,
      relatedEventIds: findTimelineEventIdsByKeyword(),
      citations: [createCitation({ label: "Life on ABOL", lineStart: section.lineStart, lineEnd: section.lineEnd })],
    },
    {
      id: "ethron",
      name: "Ethron",
      region: "Cenriv Crater Complex",
      description: citySection.text,
      relatedEventIds: findTimelineEventIdsByKeyword(),
      citations: [createCitation({ label: "Cities", lineStart: citySection.lineStart, lineEnd: citySection.lineEnd })],
    },
    {
      id: "frontier-desert",
      name: "Frontier Desert",
      region: "Northern frontier",
      description: frontierSection.text,
      relatedEventIds: findTimelineEventIdsByKeyword(),
      citations: [
        createCitation({
          label: "Homesteads and frontier towns",
          lineStart: frontierSection.lineStart,
          lineEnd: frontierSection.lineEnd,
        }),
      ],
    },
  ];
}

function extractGlossary(
  events: LoreEvent[],
  factions: LoreFaction[],
  locations: LoreLocation[],
  species: LoreSpecies[],
): GlossaryTerm[] {
  const terms = [
    { term: "ABOL", meaning: "Humanity’s colony planet and the setting of BLKOUT." },
    { term: "LEAP", meaning: "Leaving Earth Program, the colonization program used to reach ABOL." },
    { term: "SSSA", meaning: "Service, Settlement, and Security Act, a core Authority control law." },
    { term: "UTG", meaning: "Urban Tactical Group, the paired elite soldiers of the Twin Moons Program." },
    { term: "Killwager", meaning: "Underground betting culture built around mercenary operations on ABOL." },
    { term: "Abolite", meaning: "A rare energy-dense mineral mined in dangerous regions of ABOL." },
  ];

  return terms.map((entry) => ({
    id: slugify(entry.term),
    term: entry.term,
    meaning: entry.meaning,
    aliases: [],
    relatedRuleIds: [],
    relatedFactionIds: factions
      .filter((faction) => faction.summary.toLowerCase().includes(entry.term.toLowerCase()))
      .map((faction) => faction.id),
    citations: collectGlossaryCitations(entry.term, events, factions, locations, species),
  }));
}

function collectGlossaryCitations(
  term: string,
  events: LoreEvent[],
  factions: LoreFaction[],
  locations: LoreLocation[],
  species: LoreSpecies[],
) {
  const normalizedTerm = term.toLowerCase();
  const citations: SourceCitation[] = [];

  for (const entity of [...events, ...factions, ...locations, ...species]) {
    const searchable = JSON.stringify(entity).toLowerCase();

    if (!searchable.includes(normalizedTerm)) {
      continue;
    }

    citations.push(...entity.citations.slice(0, 1));
  }

  return citations.length > 0 ? citations : [createCitation({ label: `Glossary term: ${term}`, lineStart: 1, lineEnd: 1 })];
}

function extractNamedEntries(
  lines: Awaited<ReturnType<typeof readSourceLines>>,
  startTitle: string,
  endTitle: string,
): NamedEntry[] {
  const blocks = collectTextBlocks(lines);
  const startIndex = blocks.findIndex((block) => normalizeWhitespace(block.text) === startTitle);
  const endIndex = blocks.findIndex((block, index) => index > startIndex && normalizeWhitespace(block.text) === endTitle);

  if (startIndex === -1 || endIndex === -1) {
    return [];
  }

  const slice = blocks.slice(startIndex, endIndex);

  if (slice.length < 2) {
    return [];
  }

  const title = slice[0].text;
  const bodyBlocks = slice.slice(1);

  return [
    {
      title,
      body: normalizeWhitespace(bodyBlocks.map((block) => block.text).join(" ")),
      lineStart: slice[0].lineStart,
      lineEnd: bodyBlocks[bodyBlocks.length - 1].lineEnd,
    },
  ];
}

function dedupeNamedEntries(entries: NamedEntry[]) {
  return Array.from(new Map(entries.map((entry) => [entry.title, entry])).values());
}

function extractSectionParagraphs(
  lines: Awaited<ReturnType<typeof readSourceLines>>,
  startTitle: string,
  endTitle: string,
) {
  const normalizedStart = normalizeWhitespace(startTitle);
  const normalizedEnd = normalizeWhitespace(endTitle);
  const blocks = collectTextBlocks(lines);
  const startIndex = blocks.findIndex((block) => normalizeWhitespace(block.text) === normalizedStart);
  const endIndex = blocks.findIndex((block, index) => index > startIndex && normalizeWhitespace(block.text) === normalizedEnd);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error(`Section '${startTitle}' -> '${endTitle}' was not found in lore source.`);
  }

  const sectionBlocks = blocks.slice(startIndex + 1, endIndex);

  return {
    text: normalizeWhitespace(sectionBlocks.map((block) => block.text).join(" ")),
    lineStart: sectionBlocks[0]?.lineStart ?? blocks[startIndex].lineStart,
    lineEnd: sectionBlocks[sectionBlocks.length - 1]?.lineEnd ?? blocks[endIndex - 1].lineEnd,
  };
}

function inferFactionIds(text: string) {
  const lowered = text.toLowerCase();
  const factionPairs = [
    ["authority", "the authority"],
    ["headless", "the headless"],
    ["chimera", "chimera"],
    ["banak", "banak"],
    ["ork", "ork"],
    ["manticor-borz", "manticor"],
  ] as const;

  return factionPairs.filter(([, keyword]) => lowered.includes(keyword)).map(([id]) => id);
}

function inferHabitat(text: string) {
  const sentence = text.split(/(?<=[.!?])\s+/)[0] ?? text;
  return sentence;
}

function inferIdeology(text: string) {
  const sentence = text.split(/(?<=[.!?])\s+/)[0] ?? text;
  return sentence;
}

function inferRegions(text: string) {
  const candidates = ["Ethron", "Cenriv", "Frontier Desert", "San Christo", "Hades Point", "Grass Sea", "Abol"];
  return candidates.filter((candidate) => text.toLowerCase().includes(candidate.toLowerCase()));
}

function inferRelatedForceIds(title: string) {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes("harlow")) {
    return ["harlow-1st-reaction-force"];
  }

  if (normalizedTitle.includes("raid force alpha")) {
    return ["un-raid-force-alpha"];
  }

  return [];
}

function findTimelineEventIdsByKeyword() {
  return [];
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function createCitation({ label, lineStart, lineEnd }: { label: string; lineStart: number; lineEnd: number }): SourceCitation {
  return {
    documentId: LORE_DOCUMENT_ID,
    label,
    lineStart,
    lineEnd,
  };
}

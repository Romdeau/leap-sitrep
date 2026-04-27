import type {
  EffectiveRuleRecord,
  ErrataEntry,
  FaqEntry,
  RuleSection,
  UniversalSpecialRule,
} from "../../src/lib/types/domain";
import type { RulesDatasetFile } from "../../src/lib/types/generated";

const FAQ_LINK_RULE_IDS: Record<string, string> = {
  movement: "movement",
  combat: "combat",
  cqc: "combat",
  "explosives and blast": "combat",
  reactions: "reactions",
  reaction: "reactions",
  smoke: "smoke",
  "data attacks": "data-attacks",
};

const ERRATA_LINK_RULE_IDS: Array<{
  match: RegExp;
  ruleId: string;
}> = [
  { match: /overwatch/i, ruleId: "reactions" },
  { match: /data attacks?/i, ruleId: "data-attacks" },
  { match: /smoke/i, ruleId: "smoke" },
  { match: /control point/i, ruleId: "control-points" },
  { match: /terrain|structure/i, ruleId: "matched-play-rules" },
];

type Overlay = {
  reason: string;
  text: string;
  citations: EffectiveRuleRecord["citations"];
};

type OverlayBuilder = (supplemental: RulesDatasetFile["data"]) => Overlay | null;

const OVERLAY_BUILDERS: Partial<Record<RuleSection["id"], OverlayBuilder>> = {
  smoke(supplemental) {
    return buildMatchedPlayChunkOverlay({
      supplemental,
      sectionId: "matched-play-rules",
      startMarker: "SMOKE",
      endMarkers: ["MATCHED PLAY GROUP BUILDING"],
      reason: "Matched play supplemental replaces core smoke cover behavior when using matched play rules.",
    });
  },
  "control-points"(supplemental) {
    return buildMatchedPlayChunkOverlay({
      supplemental,
      sectionId: "matched-play-rules",
      startMarker: "CONTROL POINTS",
      endMarkers: ["COUNTER EWAR", "DUSTERS"],
      reason: "Matched play supplemental replaces the core control point economy.",
    });
  },
  reactions(supplemental) {
    return buildLinkedEntriesOverlay({
      entries: supplemental.faq,
      ruleId: "reactions",
      reason: "Supplemental FAQ clarifies timing and eligibility for reaction cases.",
      toText: (entry) => `Q: ${entry.question} A: ${entry.answer}`,
      toCitations: (entry) => entry.citations,
    });
  },
  "data-attacks"(supplemental) {
    return buildLinkedEntriesOverlay({
      entries: [
        ...supplemental.errata.map((entry) => ({
          entry,
          text: `${entry.target} ${entry.newTextSummary}`,
        })),
        ...supplemental.faq.map((entry) => ({
          entry,
          text: `Q: ${entry.question} A: ${entry.answer}`,
        })),
      ],
      ruleId: "data-attacks",
      reason: "Supplemental clarifications define data attack range, line-of-sight, and weapon-specific outcomes.",
      toText: (item) => item.text,
      toCitations: (item) => item.entry.citations,
    });
  },
};

interface EffectiveRulesResult {
  effectiveRules: EffectiveRuleRecord[];
  linkedFaq: FaqEntry[];
  linkedErrata: ErrataEntry[];
}

export function buildEffectiveRules(options: {
  coreRules: RulesDatasetFile;
  supplementalRules: RulesDatasetFile;
}): EffectiveRulesResult {
  const coreRulesById = new Map(options.coreRules.data.rules.map((rule) => [rule.id, rule]));
  const linkedFaq = options.supplementalRules.data.faq.map((entry) => {
    const normalizedEntry = {
      ...entry,
      topic: normalizeFaqTopic(entry.topic),
    };
    const linkedRuleId = inferFaqRuleId(normalizedEntry, coreRulesById);

    if (linkedRuleId === null) {
      return normalizedEntry;
    }

    return {
      ...normalizedEntry,
      citations: normalizedEntry.citations.map((citation) => ({
        ...citation,
        sectionId: linkedRuleId,
      })),
    };
  });
  const linkedErrata = options.supplementalRules.data.errata.map((entry) => {
    const normalizedEntry = {
      ...entry,
      target: normalizeErrataTarget(entry.target),
    };
    const linkedRuleId = inferErrataRuleId(normalizedEntry, coreRulesById);

    if (linkedRuleId === null) {
      return normalizedEntry;
    }

    return {
      ...normalizedEntry,
      citations: normalizedEntry.citations.map((citation) => ({
        ...citation,
        sectionId: linkedRuleId,
      })),
    };
  });
  const linkedSupplemental = {
    ...options.supplementalRules.data,
    faq: linkedFaq,
    errata: linkedErrata,
  };

  const effectiveRules: EffectiveRuleRecord[] = [];

  for (const rule of options.coreRules.data.rules) {
    const overlays = gatherOverlays(rule, linkedSupplemental);

    if (overlays.length === 0) {
      continue;
    }

    effectiveRules.push({
      id: `effective-${rule.id}`,
      title: rule.title,
      originalRuleId: rule.id,
      originalText: rule.body,
      effectiveText: buildEffectiveText(rule, overlays),
      precedenceReason: overlays.map((overlay) => overlay.reason).join(" "),
      citations: [
        ...rule.citations,
        ...overlays.flatMap((overlay) => overlay.citations),
      ],
    });
  }

  return {
    effectiveRules,
    linkedFaq,
    linkedErrata,
  };
}

function gatherOverlays(
  rule: RuleSection,
  supplemental: RulesDatasetFile["data"],
): Overlay[] {
  const overlay = OVERLAY_BUILDERS[rule.id]?.(supplemental);

  if (overlay === undefined || overlay === null || overlay.text.trim().length === 0) {
    return [];
  }

  return [overlay];
}

function buildEffectiveText(
  rule: RuleSection,
  overlays: Array<{ reason: string; text: string }>,
) {
  return [
    `Core: ${rule.body}`,
    ...overlays.map((overlay, index) => `Override ${index + 1}: ${overlay.text}`),
  ].join(" ");
}

function extractSupplementalChunk(body: string, startMarker: string, endMarkers: string[]) {
  const startIndex = body.indexOf(startMarker);

  if (startIndex === -1) {
    return body;
  }

  const afterStart = body.slice(startIndex + startMarker.length).trim();
  let endIndex = afterStart.length;

  for (const marker of endMarkers) {
    const candidateIndex = afterStart.indexOf(marker);

    if (candidateIndex !== -1 && candidateIndex < endIndex) {
      endIndex = candidateIndex;
    }
  }

  return afterStart.slice(0, endIndex).trim();
}

function buildMatchedPlayChunkOverlay(options: {
  supplemental: RulesDatasetFile["data"];
  sectionId: string;
  startMarker: string;
  endMarkers: string[];
  reason: string;
}): Overlay | null {
  const rule = options.supplemental.rules.find((entry) => entry.id === options.sectionId);

  if (rule === undefined || !rule.body.includes(options.startMarker)) {
    return null;
  }

  return {
    reason: options.reason,
    text: extractSupplementalChunk(rule.body, options.startMarker, options.endMarkers),
    citations: rule.citations,
  };
}

function buildLinkedEntriesOverlay<T>(options: {
  entries: T[];
  ruleId: string;
  reason: string;
  toText: (entry: T) => string;
  toCitations?: (entry: T) => EffectiveRuleRecord["citations"];
}): Overlay | null {
  const matchingEntries = options.entries.filter((entry) => {
    const citations = options.toCitations?.(entry);
    return linksToRule(citations ?? [], options.ruleId);
  });

  if (matchingEntries.length === 0) {
    return null;
  }

  return {
    reason: options.reason,
    text: matchingEntries.map(options.toText).join(" "),
    citations: matchingEntries.flatMap((entry) => options.toCitations?.(entry) ?? []),
  };
}

function normalizeFaqTopic(topic: string) {
  return topic === "cqc" ? "combat" : topic;
}

function normalizeErrataTarget(target: string) {
  return target.replace(/^RULEBOOK - /, "").trim();
}

function inferFaqRuleId(faq: FaqEntry, coreRulesById: Map<string, RuleSection>) {
  const searchTarget = `${faq.question} ${faq.answer}`.toLowerCase();
  const direct = FAQ_LINK_RULE_IDS[faq.topic];

  if (direct !== undefined && coreRulesById.has(direct)) {
    return direct;
  }

  if (/return fire|overwatch|juke|reaction shooting|reactions?/.test(searchTarget) && coreRulesById.has("reactions")) {
    return "reactions";
  }

  if (/data attacks?|data spike|data knife/.test(searchTarget) && coreRulesById.has("data-attacks")) {
    return "data-attacks";
  }

  if (/\bsmoke\b/.test(searchTarget) && coreRulesById.has("smoke")) {
    return "smoke";
  }

  return null;
}

function inferErrataRuleId(errata: ErrataEntry, coreRulesById: Map<string, RuleSection>) {
  const byHeading = mapErrataHeadingToRuleId(errata.oldTextSummary);

  if (byHeading !== null && coreRulesById.has(byHeading)) {
    return byHeading;
  }

  const searchTarget = `${errata.target} ${errata.newTextSummary}`;

  if (/return fire|overwatch|juke|reaction/i.test(searchTarget) && coreRulesById.has("reactions")) {
    return "reactions";
  }

  for (const candidate of ERRATA_LINK_RULE_IDS) {
    if (candidate.match.test(searchTarget) && coreRulesById.has(candidate.ruleId)) {
      return candidate.ruleId;
    }
  }

  return null;
}

function mapErrataHeadingToRuleId(heading: string) {
  const normalized = heading.trim().toLowerCase();

  if (normalized === "explosives and blast") {
    return "combat";
  }

  if (normalized === "smoke") {
    return "smoke";
  }

  if (normalized === "data attacks") {
    return "data-attacks";
  }

  return null;
}

function linksToRule(citations: Array<{ sectionId?: string }>, ruleId: string) {
  return citations.some((citation) => citation.sectionId === ruleId);
}

export function mergeRulesDataset(options: {
  base: RulesDatasetFile;
  effectiveRules: EffectiveRuleRecord[];
  faq: FaqEntry[];
  errata: ErrataEntry[];
  universalSpecialRules: UniversalSpecialRule[];
  generatedAt: string;
}): RulesDatasetFile {
  return {
    meta: {
      ...options.base.meta,
      version: "packet-2",
      generatedAt: options.generatedAt,
      sourceDocumentIds: Array.from(
        new Set([
          ...options.base.meta.sourceDocumentIds,
          ...options.faq.flatMap((entry) => entry.citations.map((citation) => citation.documentId)),
          ...options.errata.flatMap((entry) => entry.citations.map((citation) => citation.documentId)),
        ]),
      ),
      confidence: "curated",
    },
    data: {
      ...options.base.data,
      effectiveRules: options.effectiveRules,
      faq: options.faq,
      errata: options.errata,
      universalSpecialRules: options.universalSpecialRules,
    },
  };
}

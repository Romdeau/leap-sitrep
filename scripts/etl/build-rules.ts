import type { RuleSection, RuleSubsection, Scenario, SourceCitation } from "../../src/lib/types/domain";
import type { RulesDatasetFile, ScenarioDatasetFile } from "../../src/lib/types/generated";

import {
  collectTextBlocks,
  isBracketHeading,
  normalizeWhitespace,
  readSourceLines,
  slugify,
  type SourceLine,
} from "../lib/markdown";

const RULEBOOK_DOCUMENT_ID = "blkout-core-rulebook";

const RULE_SECTION_RANGES = [
  { heading: "[2.0] MOVEMENT", endMarker: "[3.4] EXPLOSIVES" },
  { heading: "[3.0] COMBAT", endMarker: "[4.0] GAME SETUP" },
  { heading: "[5.0] GAME ROUNDS", endMarker: "[7.0] REACTIONS" },
  { heading: "[7.0] REACTIONS", endMarker: "[8.0] ADDITIONAL RULES" },
  { heading: "[8.1] DATA ATTACKS", endMarker: "[8.2] VEHICLES" },
  { heading: "[8.6] CONTROL POINTS", endMarker: "[8.7] BURN CARDS" },
  { heading: "[8.8] SMOKE", endMarker: "[8.9] SKIRMISH MODE" },
] as const;

const SCENARIO_TITLES = ["DOCKYARD ASSAULT", "SERVER DEFENSE", "HVT EVAC", "ZERO DAY"] as const;

const RULE_SUBSECTION_PATTERN = /^\[(\d+\.\d+(?:\.\d+)?)\]\s*(.*)$/;

export async function buildRulesDataset(options: {
  filePath: string;
  generatedAt: string;
}): Promise<{ rulesDataset: RulesDatasetFile; scenarioDataset: ScenarioDatasetFile }> {
  const lines = await readSourceLines(options.filePath);
  const rules = RULE_SECTION_RANGES.map((range) => extractRuleSection(lines, range.heading, range.endMarker)).filter(
    (section): section is RuleSection => section !== null,
  );
  const scenarios = SCENARIO_TITLES.map((title) => extractScenario(lines, title)).filter((scenario): scenario is Scenario => scenario !== null);

  return {
    rulesDataset: {
      meta: {
        kind: "rules",
        version: "packet-1",
        generatedAt: options.generatedAt,
        sourceDocumentIds: [RULEBOOK_DOCUMENT_ID],
        confidence: "extracted",
      },
      data: {
        rules,
        effectiveRules: [],
        faq: [],
        errata: [],
        universalSpecialRules: [],
      },
    },
    scenarioDataset: {
      meta: {
        kind: "scenarios",
        version: "packet-1",
        generatedAt: options.generatedAt,
        sourceDocumentIds: [RULEBOOK_DOCUMENT_ID],
        confidence: "extracted",
      },
      data: {
        scenarios,
      },
    },
  };
}

function extractRuleSection(
  lines: Awaited<ReturnType<typeof readSourceLines>>,
  heading: string,
  endMarker: string,
): RuleSection | null {
  const startIndex = lines.findIndex((line) => normalizeWhitespace(line.text) === heading);

  if (startIndex === -1) {
    return null;
  }

  const endIndex = lines.findIndex((line, index) => index > startIndex && normalizeWhitespace(line.text) === endMarker);

  if (endIndex === -1) {
    return null;
  }

  const titleLine = lines[startIndex];
  const contentLines = lines.slice(startIndex + 1, endIndex);
  const contentBlocks = selectRuleContentBlocks(collectTextBlocks(contentLines));
  const subsectionPrefix = extractSubsectionPrefix(heading);
  const overviewBlocks = selectRuleContentBlocks(collectTextBlocks(extractOverviewLines(contentLines, subsectionPrefix)));
  const subsections = extractRuleSubsections(contentLines, subsectionPrefix);

  if (titleLine === undefined) {
    return null;
  }

  const overview = cleanExtractedText(overviewBlocks.map((block) => block.text).join(" ")) || null;
  const body = cleanExtractedText(
    [
      overview,
      ...subsections.map((subsection) => `[${subsection.number}] ${subsection.title} ${subsection.body}`),
    ]
      .filter(Boolean)
      .join(" "),
  );

  return {
    id: slugify(heading.replace(/^\[[^\]]+\]\s*/, "")),
    title: heading.replace(/^\[[^\]]+\]\s*/, ""),
    category: inferRuleCategory(heading),
    mode: "core",
    overview,
    subsections,
    body,
    citations: [
      createRulebookCitation(
        heading,
        titleLine.lineNumber,
        contentBlocks.at(-1)?.lineEnd ?? subsections.at(-1)?.citations[0]?.lineEnd ?? titleLine.lineNumber,
      ),
    ],
  };
}

function extractOverviewLines(lines: SourceLine[], subsectionPrefix: string | null) {
  if (subsectionPrefix === null) {
    return lines;
  }

  const firstSubsectionIndex = lines.findIndex((line) => isRuleSubsectionHeading(line.text, subsectionPrefix));

  if (firstSubsectionIndex === -1) {
    return lines;
  }

  return lines.slice(0, firstSubsectionIndex);
}

function extractRuleSubsections(lines: SourceLine[], subsectionPrefix: string | null): RuleSubsection[] {
  if (subsectionPrefix === null) {
    return [];
  }

  const subsectionIndices = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => isRuleSubsectionHeading(line.text, subsectionPrefix));

  return subsectionIndices.map(({ line, index }, order) => {
    const headingMatch = line.text.match(RULE_SUBSECTION_PATTERN);

    if (headingMatch === null) {
      throw new Error(`Expected subsection heading at line ${line.lineNumber}`);
    }

    const [, number, title] = headingMatch;
    const nextIndex = subsectionIndices[order + 1]?.index ?? lines.length;
    const subsectionLines = lines.slice(index + 1, nextIndex);
    const subsectionBlocks = selectRuleContentBlocks(collectTextBlocks(subsectionLines));

    return {
      id: slugify(`${number}-${title}`),
      number,
      title,
      order: order + 1,
      body: cleanExtractedText(subsectionBlocks.map((block) => block.text).join(" ")),
      citations: [
        createRulebookCitation(
          `[${number}] ${title}`,
          line.lineNumber,
          subsectionBlocks.at(-1)?.lineEnd ?? line.lineNumber,
        ),
      ],
    };
  });
}

function isRuleSubsectionHeading(value: string, subsectionPrefix: string) {
  const match = normalizeWhitespace(value).match(RULE_SUBSECTION_PATTERN);

  return match !== null && match[1].startsWith(`${subsectionPrefix}.`);
}

function extractSubsectionPrefix(value: string) {
  const match = value.match(/^\[(\d+\.0)\]/);

  return match?.[1].replace(/\.0$/, "") ?? null;
}

function extractScenario(lines: Awaited<ReturnType<typeof readSourceLines>>, title: string): Scenario | null {
  const titleIndex = lines.findIndex((line) => normalizeWhitespace(stripHeadingPrefix(line.text)) === title);

  if (titleIndex === -1) {
    return null;
  }

  const endIndex = lines.findIndex((line, index) => index > titleIndex && isNextScenarioHeading(line.text));
  const sectionLines = lines.slice(titleIndex, endIndex === -1 ? lines.length : endIndex);
  const blocks = collectTextBlocks(sectionLines);

  const tableSize = extractInlineValue(blocks, "Table Size:");
  const hardpoints = extractInlineValue(blocks, "Hardpoints:");
  const pointsOfInterest = extractInlineValue(blocks, "Points of Interest:");
  const determiningDeployment = extractSectionContent(blocks, "DETERMINING DEPLOYMENT EDGES", ["SETTING UP THE SCENARIO", "HOW TO WIN"]);
  const setup = extractSectionContent(blocks, "SETTING UP THE SCENARIO", ["HOW TO WIN", "SPECIAL RULES"]);
  const win = extractSectionContent(blocks, "HOW TO WIN", ["SETTING UP THE SCENARIO", "SPECIAL RULES"]);
  const specialRulesBlock = extractSectionContent(blocks, "SPECIAL RULES", ["KEY TERRAIN", "ALERTED", "COME WITH ME!", "DRONE SWARMS", "JACKED IN", "DROP IN"]);
  const namedSpecialRules = extractNamedScenarioRules(blocks);
  const setupFromSpecialRules = setup === null && specialRulesBlock !== null && specialRulesBlock.startsWith("Place ")
    ? specialRulesBlock
    : null;

  const specialRules = [
    specialRulesBlock !== setupFromSpecialRules ? specialRulesBlock : null,
    ...namedSpecialRules,
  ].filter(Boolean) as string[];

  return {
    id: slugify(title),
    title: toTitleCase(title),
    mode: "core",
    setup: [
      ...(determiningDeployment ? [determiningDeployment] : []),
      ...(setup ? [setup] : []),
      ...(setupFromSpecialRules ? [setupFromSpecialRules] : []),
      ...(hardpoints ? [`Hardpoints: ${hardpoints}`] : []),
      ...(pointsOfInterest ? [`Points of Interest: ${pointsOfInterest}`] : []),
    ],
    scoringRules: win ? [win] : [],
    specialRules,
    tableSize: tableSize ?? "Unknown",
    hardpoints: hardpoints ? [hardpoints] : [],
    pointsOfInterest: pointsOfInterest ? [pointsOfInterest] : [],
    citations: [createRulebookCitation(title, lines[titleIndex].lineNumber, sectionLines.at(-1)?.lineNumber ?? lines[titleIndex].lineNumber)],
  };
}

function stripHeadingPrefix(value: string) {
  return value.replace(/^\[[^\]]+\]\s*/, "");
}

function isNextScenarioHeading(value: string) {
  const normalized = normalizeWhitespace(value);

  return (isBracketHeading(normalized) && /^\[9\.[0-9]+\]/.test(normalized)) || /^\[10\]/.test(normalized);
}

function extractInlineValue(blocks: ReturnType<typeof collectTextBlocks>, prefix: string) {
  return blocks.find((block) => block.text.startsWith(prefix))?.text.replace(prefix, "").trim() ?? null;
}

function extractSectionContent(
  blocks: ReturnType<typeof collectTextBlocks>,
  marker: string,
  stopMarkers: string[],
) {
  const index = blocks.findIndex((block) => block.text === marker);

  if (index === -1) {
    return null;
  }

  const collected: string[] = [];

  for (let cursor = index + 1; cursor < blocks.length; cursor += 1) {
    const block = blocks[cursor];

    if (stopMarkers.includes(block.text) || isScenarioTerminalBlock(block.text)) {
      break;
    }

    if (block.text === marker) {
      continue;
    }

    collected.push(block.text);
  }

  if (collected.length === 0) {
    return null;
  }

  return cleanExtractedText(collected.join(" "));
}

function extractNamedScenarioRules(blocks: ReturnType<typeof collectTextBlocks>) {
  const markers = ["KEY TERRAIN", "INSIDE JOB", "ALERTED", "COME WITH ME!", "DRONE SWARMS", "JACKED IN", "DROP IN"];

  return markers
    .map((marker) => {
      const content = extractSectionContent(blocks, marker, markers.filter((value) => value !== marker));

      if (content === null) {
        return null;
      }

      return `${marker}: ${content}`;
    })
    .filter((entry): entry is string => entry !== null);
}

function selectRuleContentBlocks(blocks: ReturnType<typeof collectTextBlocks>) {
  const nonArtifactBlocks = blocks.filter((block) => !isRuleArtifactBlock(block.text));

  return nonArtifactBlocks;
}

function isRuleArtifactBlock(text: string) {
  return /^\d+$/.test(text) || /^[A-Z]$/.test(text);
}

function isScenarioTerminalBlock(text: string) {
  return /^\d+$/.test(text);
}

function cleanExtractedText(text: string) {
  return normalizeWhitespace(text).replace(/\s+\d+$/, "");
}

function inferRuleCategory(heading: string) {
  if (heading.includes("MOVEMENT")) {
    return "movement";
  }

  if (heading.includes("COMBAT")) {
    return "combat";
  }

  if (heading.includes("REACTIONS")) {
    return "reactions";
  }

  if (heading.includes("DATA ATTACKS")) {
    return "data-attacks";
  }

  if (heading.includes("CONTROL POINTS")) {
    return "control-points";
  }

  if (heading.includes("SMOKE")) {
    return "smoke";
  }

  return "core";
}

function createRulebookCitation(label: string, lineStart: number, lineEnd: number): SourceCitation {
  return {
    documentId: RULEBOOK_DOCUMENT_ID,
    label,
    lineStart,
    lineEnd,
  };
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

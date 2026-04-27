import type { ErrataEntry, FaqEntry, RuleSection, SourceCitation, UniversalSpecialRule } from "../../src/lib/types/domain";
import type { RulesDatasetFile } from "../../src/lib/types/generated";

import { collectTextBlocks, normalizeWhitespace, readSourceLines, slugify } from "../lib/markdown";

const SUPPLEMENTAL_DOCUMENT_ID = "blkout-supplemental";

export async function buildSupplementalDataset(options: {
  filePath: string;
  generatedAt: string;
}): Promise<RulesDatasetFile> {
  const lines = await readSourceLines(options.filePath);

  const matchedPlayRules = extractMatchedPlayRules(lines);
  const faq = extractFaqEntries(lines);
  const errata = extractErrataEntries(lines);
  const universalSpecialRules = extractUniversalSpecialRules(lines);

  return {
    meta: {
      kind: "rules",
      version: "packet-1",
      generatedAt: options.generatedAt,
      sourceDocumentIds: [SUPPLEMENTAL_DOCUMENT_ID],
      confidence: "extracted",
    },
    data: {
      rules: matchedPlayRules,
      effectiveRules: [],
      faq,
      errata,
      universalSpecialRules,
    },
  };
}

function extractMatchedPlayRules(lines: Awaited<ReturnType<typeof readSourceLines>>): RuleSection[] {
  const section = extractSection(lines, "[2.1] MATCHED PLAY RULES", "[2.2] MATCHED PLAY GROUP BUILDING");
  const blocks = collectTextBlocks(section.lines);
  const contentBlocks = blocks.slice(1);

  return [
    {
      id: "matched-play-rules",
      title: "Matched Play Rules",
      category: "matched-play",
      mode: "matched-play",
      overview: normalizeWhitespace(contentBlocks.map((block) => block.text).join(" ")),
      subsections: [],
      body: normalizeWhitespace(contentBlocks.map((block) => block.text).join(" ")),
      citations: [createCitation("Matched play rules", section.lineStart, section.lineEnd)],
    },
  ];
}

function extractFaqEntries(lines: Awaited<ReturnType<typeof readSourceLines>>): FaqEntry[] {
  const faqSection = extractSection(lines, "[4.0] FAQ", "[5.0] ERRATA AND CLARIFICATIONS");
  const errataSection = extractSection(lines, "[5.0] ERRATA AND CLARIFICATIONS", "[6.0] UNIVERSAL SPECIAL RULES");
  const parsedEntries = [
    ...parseFaqEntries(faqSection.lines),
    ...extractEmbeddedFaqSections(errataSection.lines).flatMap((section) => parseFaqEntries(section)),
  ];

  return parsedEntries.map((entry, index) => ({
    ...entry,
    id: `faq-${entry.topic}-${index + 1}`,
  }));
}

function parseFaqEntries(sectionLines: Awaited<ReturnType<typeof readSourceLines>>): Array<Omit<FaqEntry, "id">> {
  const entries: Array<Omit<FaqEntry, "id">> = [];
  let topic = "general";
  let index = 0;

  while (index < sectionLines.length) {
    const line = sectionLines[index];
    const text = normalizeWhitespace(line.text);

    if (text === "") {
      index += 1;
      continue;
    }

    if (isFaqHeading(text)) {
      topic = text.replace(/^\[[^\]]+\]\s*/, "").toLowerCase();
      index += 1;
      continue;
    }

    if (text.startsWith("RULEBOOK - ") || looksLikeErrataTarget(text)) {
      index = skipEmbeddedErrataLines(sectionLines, index);
      continue;
    }

    const questionLines: typeof sectionLines = [];

    while (index < sectionLines.length) {
      const questionLine = sectionLines[index];
      const questionText = normalizeWhitespace(questionLine.text);

      if (questionText === "") {
        index += 1;
        continue;
      }

      if (isFaqHeading(questionText) || isSupplementalSectionHeading(questionText) || looksLikeErrataTarget(questionText)) {
        break;
      }

      questionLines.push(questionLine);
      index += 1;

      if (questionText.endsWith("?")) {
        break;
      }
    }

    const question = normalizeWhitespace(questionLines.map((entry) => entry.text).join(" "));

    if (!question.endsWith("?")) {
      continue;
    }

    const answerLines: typeof sectionLines = [];

    while (index < sectionLines.length) {
      const answerLine = sectionLines[index];
      const answerText = normalizeWhitespace(answerLine.text);

      if (answerText === "") {
        if (answerLines.length > 0) {
          break;
        }

        index += 1;
        continue;
      }

      if (isSupplementalSectionHeading(answerText) || answerText.startsWith("RULEBOOK - ") || looksLikeErrataTarget(answerText)) {
        break;
      }

      answerLines.push(answerLine);
      index += 1;
    }

    if (answerLines.length === 0) {
      continue;
    }

    entries.push({
      question,
      answer: normalizeWhitespace(answerLines.map((entry) => entry.text).join(" ")),
      topic,
      citations: [
        createCitation(
          `FAQ ${topic}`,
          questionLines[0]?.lineNumber ?? line.lineNumber,
          answerLines[answerLines.length - 1]?.lineNumber ?? line.lineNumber,
        ),
      ],
    });
  }

  return entries;
}

function extractErrataEntries(lines: Awaited<ReturnType<typeof readSourceLines>>): ErrataEntry[] {
  const errataSection = extractSection(lines, "[5.0] ERRATA AND CLARIFICATIONS", "[6.0] UNIVERSAL SPECIAL RULES");
  const blocks = collectTextBlocks(errataSection.lines);
  const entries: ErrataEntry[] = [];
  let currentHeading = "general";
  let embeddedHeading: string | null = null;
  let inRulebookSection = false;

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];

    if (/^\[5\.[0-9]+/.test(block.text)) {
      currentHeading = extractSupplementalHeadingText(block.text);
      embeddedHeading = null;
      inRulebookSection = currentHeading !== "UNIT CARDS";
      continue;
    }

    if (isFaqHeading(block.text)) {
      embeddedHeading = extractSupplementalHeadingText(block.text);
      continue;
    }

    if (block.text.startsWith("RULEBOOK - ")) {
      const detailBlocks = collectErrataDetailBlocks(blocks, index + 1);
      const newTextSummary = summarizeBlocks(detailBlocks) || currentHeading;

      entries.push({
        id: `errata-${entries.length + 1}`,
        target: block.text.replace("RULEBOOK - ", ""),
        oldTextSummary: `See core rulebook section referenced by ${block.text.replace("RULEBOOK - ", "")}.`,
        newTextSummary,
        citations: [
          createCitation(
            block.text,
            block.lineStart,
            detailBlocks[detailBlocks.length - 1]?.lineEnd ?? block.lineEnd,
          ),
        ],
      });

      continue;
    }

    if (inRulebookSection && block.text.includes(" - ") && !block.text.endsWith("?")) {
      const detailBlocks = collectErrataDetailBlocks(blocks, index + 1);
      const newTextSummary = summarizeBlocks(detailBlocks) || currentHeading;
      const oldTextSummary = resolveErrataHeading({
        currentHeading,
        embeddedHeading,
        target: block.text,
        newTextSummary,
      });

      entries.push({
        id: `errata-${entries.length + 1}`,
        target: block.text,
        oldTextSummary,
        newTextSummary,
        citations: [
          createCitation(
            block.text,
            block.lineStart,
            detailBlocks[detailBlocks.length - 1]?.lineEnd ?? block.lineEnd,
          ),
        ],
      });
    }
  }

  return entries;
}

function extractUniversalSpecialRules(lines: Awaited<ReturnType<typeof readSourceLines>>): UniversalSpecialRule[] {
  const usrSection = extractSection(lines, "[6.0] UNIVERSAL SPECIAL RULES", "[7.0] UPDATE CHANGE LOG");
  const blocks = collectTextBlocks(usrSection.lines).slice(1);
  const rules: UniversalSpecialRule[] = [];
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index];
    const [namePart, firstText] = splitUsrBlock(block.text);

    if (namePart === null || firstText === null) {
      index += 1;
      continue;
    }

    const descriptionBlocks = [firstText];
    let lineEnd = block.lineEnd;
    let cursor = index + 1;

    while (cursor < blocks.length && !looksLikeUsrStart(blocks[cursor].text)) {
      descriptionBlocks.push(blocks[cursor].text);
      lineEnd = blocks[cursor].lineEnd;
      cursor += 1;
    }

    rules.push({
      id: slugify(namePart),
      name: namePart,
      currentText: normalizeWhitespace(descriptionBlocks.join(" ")),
      aliases: buildUsrAliases(namePart),
      relatedRuleIds: inferRelatedRuleIds(namePart),
      citations: [createCitation(`USR ${namePart}`, block.lineStart, lineEnd)],
    });

    index = cursor;
  }

  return rules;
}

function extractEmbeddedFaqSections(lines: Awaited<ReturnType<typeof readSourceLines>>) {
  const sections: Array<Awaited<ReturnType<typeof readSourceLines>>> = [];
  let index = 0;

  while (index < lines.length) {
    const text = normalizeWhitespace(lines[index].text);

    if (!isFaqHeading(text)) {
      index += 1;
      continue;
    }

    const startIndex = index;
    index += 1;

    while (index < lines.length && !isSupplementalSectionHeading(normalizeWhitespace(lines[index].text))) {
      index += 1;
    }

    sections.push(lines.slice(startIndex, index));
  }

  return sections;
}

function extractSection(
  lines: Awaited<ReturnType<typeof readSourceLines>>,
  startMarker: string,
  endMarker: string,
) {
  const startIndex = lines.findIndex((line) => normalizeWhitespace(line.text) === startMarker);
  const endIndex = lines.findIndex((line, index) => index > startIndex && normalizeWhitespace(line.text) === endMarker);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error(`Supplemental section '${startMarker}' -> '${endMarker}' not found.`);
  }

  return {
    lines: lines.slice(startIndex, endIndex),
    lineStart: lines[startIndex].lineNumber,
    lineEnd: lines[endIndex - 1].lineNumber,
  };
}

function isFaqHeading(text: string) {
  return /^\[4\.[0-9]+\]/.test(text);
}

function extractSupplementalHeadingText(text: string) {
  const withoutMarker = text.replace(/^\[[^\]]+\]\s*/, "");
  const headingMatch = withoutMarker.match(/^([A-Z0-9][A-Z0-9 &()/.-]*?)(?=\s+[A-Z][a-z]|$)/);

  return normalizeWhitespace(headingMatch?.[1] ?? withoutMarker);
}

function isSupplementalSectionHeading(text: string) {
  return /^\[(4|5|6)\./.test(text);
}

function looksLikeErrataTarget(text: string) {
  return text.includes(" - ") && !text.endsWith("?");
}

function skipEmbeddedErrataLines(lines: Awaited<ReturnType<typeof readSourceLines>>, startIndex: number) {
  let index = startIndex + 1;

  while (index < lines.length) {
    const text = normalizeWhitespace(lines[index].text);

    if (
      text !== "" &&
      (isSupplementalSectionHeading(text) || text.startsWith("RULEBOOK - ") || looksLikeErrataTarget(text) || text.endsWith("?"))
    ) {
      break;
    }

    index += 1;
  }

  return index;
}

function collectErrataDetailBlocks(blocks: ReturnType<typeof collectTextBlocks>, startIndex: number) {
  const detailBlocks: ReturnType<typeof collectTextBlocks> = [];
  let index = startIndex;

  while (index < blocks.length) {
    const text = blocks[index].text;

    if (
      isSupplementalSectionHeading(text) ||
      text.startsWith("RULEBOOK - ") ||
      looksLikeErrataTarget(text) ||
      looksLikeFaqBlock(text)
    ) {
      break;
    }

    detailBlocks.push(blocks[index]);
    index += 1;
  }

  return detailBlocks;
}

function summarizeBlocks(blocks: ReturnType<typeof collectTextBlocks>) {
  return normalizeWhitespace(blocks.map((block) => block.text).join(" "));
}

function looksLikeFaqBlock(text: string) {
  return text.includes("?");
}

function resolveErrataHeading(options: {
  currentHeading: string;
  embeddedHeading: string | null;
  target: string;
  newTextSummary: string;
}) {
  if (options.embeddedHeading === null) {
    return options.currentHeading;
  }

  const searchTarget = `${options.target} ${options.newTextSummary}`.toLowerCase();
  const embeddedHeading = options.embeddedHeading.toLowerCase();

  if (embeddedHeading === "data attacks" && /data attacks?|data weapon|data spike|data knife/.test(searchTarget)) {
    return options.embeddedHeading;
  }

  if (embeddedHeading === "smoke" && /\bsmoke\b/.test(searchTarget)) {
    return options.embeddedHeading;
  }

  if (embeddedHeading === "dusters" && /dusters?|vehicles?/.test(searchTarget)) {
    return options.embeddedHeading;
  }

  return options.currentHeading;
}

function splitUsrBlock(text: string) {
  const match = text.match(/^([^|-]+?)(?:\s*\|\s*[^-]+)?\s-\s(.+)$/);

  if (match === null) {
    return [null, null] as const;
  }

  return [normalizeWhitespace(match[1]), normalizeWhitespace(match[2])] as const;
}

function looksLikeUsrStart(text: string) {
  return /^[A-Z][A-Za-z ()]+(?:\s*\|\s*[^-]+)?\s-\s/.test(text);
}

function buildUsrAliases(name: string) {
  const aliases: string[] = [];

  if (name.includes("CQB")) {
    aliases.push("close quarters battle");
  }

  if (name === "AI") {
    aliases.push("artificial intelligence");
  }

  if (name.startsWith("AP")) {
    aliases.push("armor piercing");
  }

  if (name === "EMP") {
    aliases.push("electromagnetic pulse");
  }

  return aliases;
}

function inferRelatedRuleIds(name: string) {
  const lowered = name.toLowerCase();
  const related: string[] = [];

  if (lowered.includes("data")) {
    related.push("data-attacks");
  }

  if (lowered.includes("smoke")) {
    related.push("smoke");
  }

  if (lowered.includes("cqb") || lowered.includes("melee")) {
    related.push("combat");
  }

  return related;
}

function createCitation(label: string, lineStart: number, lineEnd: number): SourceCitation {
  return {
    documentId: SUPPLEMENTAL_DOCUMENT_ID,
    label,
    lineStart,
    lineEnd,
  };
}

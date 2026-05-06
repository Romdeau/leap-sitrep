import type { CitationBackedText, UniversalSpecialRule } from "../../src/lib/types/domain";
import { collectTextBlocks, normalizeWhitespace, readSourceLines, slugify } from "../lib/markdown";

const SPECIAL_RULES_DOCUMENT_ID = "blkout-special-rules";

export async function buildSpecialRulesIndex(options: { filePath: string }) {
  const lines = await readSourceLines(options.filePath);
  const rules: UniversalSpecialRule[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const heading = normalizeWhitespace(line.text);

    if (!heading.startsWith("# ")) {
      index += 1;
      continue;
    }

    const name = normalizeWhitespace(heading.replace(/^#\s+/, ""));
    const startIndex = index;
    index += 1;

    while (index < lines.length && !normalizeWhitespace(lines[index].text).startsWith("# ")) {
      index += 1;
    }

    const ruleLines = lines.slice(startIndex + 1, index);
    const { currentText, notes, lineEnd } = parseRuleBody(name, ruleLines, line.lineNumber);

    rules.push({
      id: slugify(name),
      name,
      currentText,
      aliases: buildUsrAliases(name),
      relatedRuleIds: inferRelatedRuleIds(name),
      notes,
      citations: [createCitation(`USR ${name}`, line.lineNumber, lineEnd)],
    });
  }

  return rules;
}

function parseRuleBody(name: string, lines: Awaited<ReturnType<typeof readSourceLines>>, headingLineNumber: number) {
  const blocks = collectTextBlocks(lines);
  const bodyParts: string[] = [];
  const notes: CitationBackedText[] = [];
  let lineEnd = headingLineNumber;
  let noteIndex = 0;

  for (const block of blocks) {
    const text = normalizeWhitespace(block.text);

    if (text.startsWith("## ")) {
      const label = normalizeWhitespace(text.replace(/^##\s+/, ""));
      notes.push({
        id: `${slugify(name)}-note-${noteIndex + 1}`,
        name: label,
        text: label,
        citations: [createCitation(`USR ${name} ${label}`, block.lineStart, block.lineEnd)],
      });
      noteIndex += 1;
      lineEnd = block.lineEnd;
      continue;
    }

    bodyParts.push(text);
    lineEnd = block.lineEnd;
  }

  return {
    currentText: normalizeWhitespace(bodyParts.join(" ")),
    notes,
    lineEnd,
  };
}

function createCitation(label: string, lineStart: number, lineEnd: number) {
  return {
    documentId: SPECIAL_RULES_DOCUMENT_ID,
    label,
    lineStart,
    lineEnd,
  };
}

function buildUsrAliases(name: string) {
  const aliases = new Set<string>([name.toLowerCase()]);
  const acronymMatch = name.match(/^([A-Z]{2,})(?:\s|$)/);

  if (acronymMatch !== null) {
    aliases.add(acronymMatch[1].toLowerCase());
  }

  return Array.from(aliases);
}

function inferRelatedRuleIds(name: string) {
  const normalized = name.toLowerCase();
  const related = new Set<string>();

  if (["data knife", "data spike"].includes(normalized)) {
    related.add("data-attacks");
  }

  if (["smoke grenade | x\"", "smoke grenade | x”"].includes(normalized) || normalized.includes("smoke")) {
    related.add("smoke");
  }

  if (["cqb", "melee"].includes(normalized)) {
    related.add("combat");
  }

  if (["deployed", "heavy", "medium", "seeking"].includes(normalized)) {
    related.add("combat");
  }

  if (["controller", "team leader"].includes(normalized)) {
    related.add("control-points");
  }

  if (["drone", "jump (x)"].includes(normalized)) {
    related.add("movement");
  }

  return Array.from(related);
}

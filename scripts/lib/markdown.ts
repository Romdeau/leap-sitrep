import { readFile } from "node:fs/promises";

export interface SourceLine {
  lineNumber: number;
  raw: string;
  text: string;
}

export interface TextBlock {
  text: string;
  lineStart: number;
  lineEnd: number;
}

export async function readSourceLines(filePath: string) {
  const content = await readFile(filePath, "utf8");

  return normalizeSourceLines(content);
}

export function normalizeSourceLines(content: string): SourceLine[] {
  return content.split(/\r?\n/).map((raw, index) => ({
    lineNumber: index + 1,
    raw,
    text: cleanLine(raw),
  }));
}

export function cleanLine(value: string) {
  return value.replaceAll("\f", "").replaceAll("\u000b", "").trim();
}

export function isYearLine(value: string) {
  return /^\d{4}$/.test(value);
}

export function isBracketHeading(value: string) {
  return /^\[[0-9]+\.[0-9]+(?:\.[0-9]+)?\]/.test(value);
}

export function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function collectTextBlocks(lines: SourceLine[], startIndex = 0) {
  const blocks: TextBlock[] = [];
  let currentLines: SourceLine[] = [];

  for (const line of lines.slice(startIndex)) {
    if (line.text === "") {
      if (currentLines.length > 0) {
        blocks.push(createTextBlock(currentLines));
        currentLines = [];
      }

      continue;
    }

    currentLines.push(line);
  }

  if (currentLines.length > 0) {
    blocks.push(createTextBlock(currentLines));
  }

  return blocks;
}

function createTextBlock(lines: SourceLine[]): TextBlock {
  return {
    text: normalizeWhitespace(lines.map((line) => line.text).join(" ")),
    lineStart: lines[0].lineNumber,
    lineEnd: lines[lines.length - 1].lineNumber,
  };
}

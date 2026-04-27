import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export async function writeJsonFile(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });

  const nextContent = serializeJson(value);
  const existingContent = await readExistingFile(filePath);

  if (existingContent === nextContent) {
    return;
  }

  const existingValue = parseJson(existingContent);
  const existingGeneratedAt = getGeneratedAt(existingValue);

  if (existingGeneratedAt !== null) {
    const normalizedNextContent = serializeJson(withGeneratedAt(value, existingGeneratedAt));

    if (existingContent === normalizedNextContent) {
      return;
    }
  }

  await writeFile(filePath, nextContent, "utf8");
}

async function readExistingFile(filePath: string) {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

function parseJson(content: string | null) {
  if (content === null) {
    return null;
  }

  try {
    return JSON.parse(content) as unknown;
  } catch {
    return null;
  }
}

function serializeJson(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function getGeneratedAt(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  const meta = value.meta;

  if (!isRecord(meta) || typeof meta.generatedAt !== "string") {
    return null;
  }

  return meta.generatedAt;
}

function withGeneratedAt<T>(value: T, generatedAt: string): T {
  if (!isRecord(value) || !isRecord(value.meta) || typeof value.meta.generatedAt !== "string") {
    return value;
  }

  return {
    ...value,
    meta: {
      ...value.meta,
      generatedAt,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildEffectiveRules, mergeRulesDataset } from "./etl/build-effective-rules";
import { buildForceDataset } from "./etl/build-forces";
import { buildLoreDataset } from "./etl/build-lore";
import { buildRulesDataset } from "./etl/build-rules";
import { buildSearchIndex } from "./etl/build-search-index";
import { buildSpecialRulesIndex } from "./etl/build-special-rules";
import { buildSourceRegistry, resolveSourceFile } from "./etl/source-registry";
import { buildSupplementalDataset } from "./etl/build-supplemental";
import { writeJsonFile } from "./lib/output";
import type { UniversalSpecialRule } from "../src/lib/types/domain";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDataDir = path.join(rootDir, "public", "data");
const generatedAt = new Date().toISOString();

async function main() {
  const sourceRegistry = buildSourceRegistry(generatedAt);
  const loreDataset = await buildLoreDataset({
    filePath: resolveSourceFile(rootDir, "markdown/BLKOUT-Year-Two-Lore-Primer.md"),
    generatedAt,
  });
  const { rulesDataset, scenarioDataset } = await buildRulesDataset({
    filePath: resolveSourceFile(rootDir, "markdown/BLKOUT-PRINT-AT-HOME-RULEBOOK.md"),
    generatedAt,
  });
  const supplementalDataset = await buildSupplementalDataset({
    filePath: resolveSourceFile(rootDir, "markdown/BLKOUT_Supplemental_4-26.md"),
    generatedAt,
  });
  const specialRules = await buildSpecialRulesIndex({
    filePath: resolveSourceFile(rootDir, "markdown/special-rules.md"),
  });
  const { forceDataset, auditDataset } = await buildForceDataset({
    filePath: resolveSourceFile(rootDir, "markdown/Unit-Cards-Printable-2026.md"),
    generatedAt,
  });
  const effectiveRules = buildEffectiveRules({
    coreRules: rulesDataset,
    supplementalRules: supplementalDataset,
  });
  const mergedRulesDataset = mergeRulesDataset({
    base: rulesDataset,
    effectiveRules: effectiveRules.effectiveRules,
    faq: effectiveRules.linkedFaq,
    errata: effectiveRules.linkedErrata,
    universalSpecialRules: mergeUniversalSpecialRules({
      supplemental: supplementalDataset.data.universalSpecialRules,
      specialRules,
    }),
    generatedAt,
  });
  const searchIndex = buildSearchIndex({
    sourceRegistry,
    lore: loreDataset,
    rules: mergedRulesDataset,
    supplemental: supplementalDataset,
    scenarios: scenarioDataset,
    forces: forceDataset,
    generatedAt,
  });

  await Promise.all([
    writeJsonFile(path.join(publicDataDir, "source-registry.json"), sourceRegistry),
    writeJsonFile(path.join(publicDataDir, "lore", "index.json"), loreDataset),
    writeJsonFile(path.join(publicDataDir, "rules", "core.json"), mergedRulesDataset),
    writeJsonFile(path.join(publicDataDir, "rules", "supplemental.json"), supplementalDataset),
    writeJsonFile(path.join(publicDataDir, "scenarios", "core.json"), scenarioDataset),
    writeJsonFile(path.join(publicDataDir, "forces", "index.json"), forceDataset),
    writeJsonFile(path.join(publicDataDir, "forces", "audit.json"), auditDataset),
    writeJsonFile(path.join(publicDataDir, "search", "index.json"), searchIndex),
  ]);
}

void main();

function mergeUniversalSpecialRules(options: {
  supplemental: UniversalSpecialRule[];
  specialRules: Awaited<ReturnType<typeof buildSpecialRulesIndex>>;
}) {
  const byId = new Map(options.supplemental.map((rule) => [rule.id, rule]));

  for (const specialRule of options.specialRules) {
    const existing = byId.get(specialRule.id);

    if (existing === undefined) {
      byId.set(specialRule.id, specialRule);
      continue;
    }

    byId.set(specialRule.id, {
      ...existing,
      currentText: specialRule.currentText || existing.currentText,
      aliases: Array.from(new Set([...existing.aliases, ...specialRule.aliases])),
      relatedRuleIds: Array.from(new Set([...existing.relatedRuleIds, ...specialRule.relatedRuleIds])),
      notes: specialRule.notes,
      citations: [...existing.citations, ...specialRule.citations],
    });
  }

  return [...byId.values()].sort((left, right) => left.name.localeCompare(right.name));
}

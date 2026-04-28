import path from "node:path";

import { describe, expect, it } from "vitest";

import { buildEffectiveRules, mergeRulesDataset } from "../../scripts/etl/build-effective-rules";
import { buildLoreDataset } from "../../scripts/etl/build-lore";
import { buildRulesDataset } from "../../scripts/etl/build-rules";
import { buildSearchIndex } from "../../scripts/etl/build-search-index";
import { buildSpecialRulesIndex } from "../../scripts/etl/build-special-rules";
import { buildSourceRegistry } from "../../scripts/etl/source-registry";
import { buildSupplementalDataset } from "../../scripts/etl/build-supplemental";
import type { UniversalSpecialRule } from "../../src/lib/types/domain";

const projectRoot = process.cwd();
const generatedAt = "2026-04-27T00:00:00.000Z";

describe("Packet 2 effective rules and search", () => {
  it("builds effective rules with preserved core and override text", async () => {
    const { rulesDataset } = await buildRulesDataset({
      filePath: path.join(projectRoot, "markdown/BLKOUT-PRINT-AT-HOME-RULEBOOK.md"),
      generatedAt,
    });
    const supplementalDataset = await buildSupplementalDataset({
      filePath: path.join(projectRoot, "markdown/BLKOUT_Supplemental_4-26.md"),
      generatedAt,
    });

    const effective = buildEffectiveRules({
      coreRules: rulesDataset,
      supplementalRules: supplementalDataset,
    });

    const smoke = effective.effectiveRules.find((rule) => rule.originalRuleId === "smoke");
    const controlPoints = effective.effectiveRules.find((rule) => rule.originalRuleId === "control-points");
    const reactions = effective.effectiveRules.find((rule) => rule.originalRuleId === "reactions");
    const dataAttacks = effective.effectiveRules.find((rule) => rule.originalRuleId === "data-attacks");

    expect(smoke?.precedenceReason).toContain("Matched play supplemental replaces core smoke cover behavior");
    expect(smoke?.effectiveText).toContain("Models with only part of their base inside Smoke gain Partial Cover");
    expect(controlPoints?.effectiveText).toContain("Players will begin each game with 3 Control Points");
    expect(reactions?.effectiveText).toContain("Can Blast weapons trigger the Return Fire Reaction?");
    expect(dataAttacks?.effectiveText).toContain("Do Data Attacks have a maximum range or require Line of sight?");
    expect(dataAttacks?.effectiveText).toContain("AP - Targeting Dusters and Vehicles");
  });

  it("links faq and errata citations back to rule ids", async () => {
    const { rulesDataset } = await buildRulesDataset({
      filePath: path.join(projectRoot, "markdown/BLKOUT-PRINT-AT-HOME-RULEBOOK.md"),
      generatedAt,
    });
    const supplementalDataset = await buildSupplementalDataset({
      filePath: path.join(projectRoot, "markdown/BLKOUT_Supplemental_4-26.md"),
      generatedAt,
    });

    const effective = buildEffectiveRules({
      coreRules: rulesDataset,
      supplementalRules: supplementalDataset,
    });

    const reactionFaq = effective.linkedFaq.find((entry) => entry.question === "Can Blast weapons trigger the Return Fire Reaction?");
    const movementFaq = effective.linkedFaq.find((entry) => entry.question.includes("Lean Out Move"));
    const armoryFaq = effective.linkedFaq.find((entry) => entry.question.includes("Armory Item"));
    const explosiveErrata = effective.linkedErrata.find((entry) => entry.target.includes("AP - Targeting Dusters and Vehicles"));
    const dataAttackFaq = effective.linkedFaq.find((entry) =>
      entry.question === "Do Data Attacks have a maximum range or require Line of sight?",
    );

    expect(reactionFaq?.citations.some((citation) => citation.sectionId === "reactions")).toBe(true);
    expect(movementFaq?.citations.some((citation) => citation.sectionId === "movement")).toBe(true);
    expect(armoryFaq?.citations.some((citation) => citation.sectionId !== undefined)).toBe(false);
    expect(explosiveErrata?.citations.some((citation) => citation.sectionId === "data-attacks")).toBe(true);
    expect(dataAttackFaq?.citations.some((citation) => citation.sectionId === "data-attacks")).toBe(true);
  });

  it("builds a search index that resolves acronym and phrase lookups", async () => {
    const sourceRegistry = buildSourceRegistry(generatedAt);
    const loreDataset = await buildLoreDataset({
      filePath: path.join(projectRoot, "markdown/BLKOUT-Year-Two-Lore-Primer.md"),
      generatedAt,
    });
    const { rulesDataset, scenarioDataset } = await buildRulesDataset({
      filePath: path.join(projectRoot, "markdown/BLKOUT-PRINT-AT-HOME-RULEBOOK.md"),
      generatedAt,
    });
    const supplementalDataset = await buildSupplementalDataset({
      filePath: path.join(projectRoot, "markdown/BLKOUT_Supplemental_4-26.md"),
      generatedAt,
    });
    const specialRules = await buildSpecialRulesIndex({
      filePath: path.join(projectRoot, "markdown/special-rules.md"),
    });
    const effective = buildEffectiveRules({
      coreRules: rulesDataset,
      supplementalRules: supplementalDataset,
    });
    const mergedRules = mergeRulesDataset({
      base: rulesDataset,
      effectiveRules: effective.effectiveRules,
      faq: effective.linkedFaq,
      errata: effective.linkedErrata,
      universalSpecialRules: mergeUniversalSpecialRules({
        supplemental: supplementalDataset.data.universalSpecialRules,
        specialRules,
      }),
      generatedAt,
    });

    const searchIndex = buildSearchIndex({
      sourceRegistry,
      lore: loreDataset,
      rules: mergedRules,
      supplemental: supplementalDataset,
      scenarios: scenarioDataset,
      generatedAt,
    });

    expect(searchIndex.data.aliasMap.cqc).toContain("close quarters combat");
    expect(searchIndex.data.aliasMap.utg).toContain("urban tactical groups");
    expect(searchIndex.data.records.some((entry) => entry.title.includes("Twin Moons") && entry.aliases.includes("utg"))).toBe(true);
    expect(searchIndex.data.records.some((entry) => entry.title.includes("Return Fire") && entry.relatedIds.includes("reactions"))).toBe(true);
    expect(searchIndex.data.records.some((entry) => entry.title === "Dockyard Assault" && entry.route === "/scenarios/dockyard-assault")).toBe(true);
    expect(
      searchIndex.data.records.some(
        (entry) =>
          entry.entityType === "rule-subsection" &&
          entry.title === "2.3 LEANING OUT" &&
          entry.route.includes("#rule-subsection-2-3-leaning-out"),
      ),
    ).toBe(true);
    expect(searchIndex.data.records.some((entry) => entry.entityType === "usr" && entry.title === "Smoke Grenade | X\"" )).toBe(true);
    expect(searchIndex.data.records.some((entry) => entry.entityType === "usr" && entry.sourceDocumentIds.includes("blkout-special-rules"))).toBe(true);
    expect(mergedRules.data.universalSpecialRules.find((rule) => rule.name === "Drone")?.notes[0]?.text).toContain("Close Quarters Combat");
    expect(mergedRules.data.universalSpecialRules.find((rule) => rule.name === "Smoke Grenade | X\"")?.citations[0]?.documentId).toBe(
      "blkout-special-rules",
    );
  });
});

function mergeUniversalSpecialRules(options: {
  supplemental: UniversalSpecialRule[];
  specialRules: UniversalSpecialRule[];
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

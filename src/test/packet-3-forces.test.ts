import path from "node:path";

import { describe, expect, it } from "vitest";

import { buildForceDataset } from "../../scripts/etl/build-forces";
import { buildSearchIndex } from "../../scripts/etl/build-search-index";
import { buildLoreDataset } from "../../scripts/etl/build-lore";
import { buildRulesDataset } from "../../scripts/etl/build-rules";
import { buildEffectiveRules, mergeRulesDataset } from "../../scripts/etl/build-effective-rules";
import { buildSourceRegistry } from "../../scripts/etl/source-registry";
import { buildSupplementalDataset } from "../../scripts/etl/build-supplemental";

const projectRoot = process.cwd();
const generatedAt = "2026-04-27T00:00:00.000Z";

describe("Packet 3 curated force slice", () => {
  it("builds verified Harlow force and seed units with printed card ids", async () => {
    const { forceDataset, auditDataset } = await buildForceDataset({
      filePath: path.join(projectRoot, "markdown/Unit-Cards-Printable-2026.md"),
      generatedAt,
    });

    expect(forceDataset.meta.confidence).toBe("verified");
    expect(forceDataset.data.forces).toHaveLength(1);
    expect(forceDataset.data.forces[0]?.cardId).toBe("HFR-6770");
    expect(forceDataset.data.forces[0]?.parentLoreFactionId).toBe("the-authority");
    expect(forceDataset.data.units.map((unit) => unit.cardId)).toEqual(["HFR-6771", "HFR-6772", "HFR-6773"]);
    expect(auditDataset.meta.confidence).toBe("raw");
    expect(auditDataset.data.rawCards).toHaveLength(4);
  });

  it("captures weapon structure and specialist linkage for the verified units", async () => {
    const { forceDataset } = await buildForceDataset({
      filePath: path.join(projectRoot, "markdown/Unit-Cards-Printable-2026.md"),
      generatedAt,
    });

    const controlTeam = forceDataset.data.units.find((unit) => unit.id === "harlow-control-team");
    const assaultTeam = forceDataset.data.units.find((unit) => unit.id === "harlow-assault-team");
    const springbok = forceDataset.data.units.find((unit) => unit.id === "harlow-springbok-ai");
    const force = forceDataset.data.forces[0];

    expect(controlTeam?.weapons.map((weapon) => weapon.name)).toEqual(["FAL-32C", "Grenade Launcher"]);
    expect(controlTeam?.specialists.find((specialist) => specialist.slot === 2)?.weaponId).toBe("hfr-6771-weapon-grenade-launcher");

    expect(assaultTeam?.specialists.find((specialist) => specialist.slot === 1)?.name).toBe("Machine Gunner");
    expect(assaultTeam?.weapons.find((weapon) => weapon.id === "hfr-6772-weapon-p34")?.keywords).toEqual(["Cyclic", "Heavy"]);

    expect(springbok?.abilities.map((entry) => entry.label)).toEqual(["Chaff Discharge", "Traits"]);
    expect(springbok?.weapons[0]?.keywords).toEqual(["CQB", "Sustained (1)"]);

    expect(force?.battleDrills.map((entry) => entry.label)).toEqual(["Assaulters", "Chaff", "Stims"]);
    expect(force?.armory.map((entry) => entry.name)).toEqual(["BOOST JUMP", "FRAG LAUNCHER", "HEAD", "MICRO LAUNCHER"]);
    expect(force?.forceRules[0]?.text).toContain("+2 Movement when Sprinting");
  });

  it("adds verified force and unit records to the search index", async () => {
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
    const effective = buildEffectiveRules({
      coreRules: rulesDataset,
      supplementalRules: supplementalDataset,
    });
    const mergedRules = mergeRulesDataset({
      base: rulesDataset,
      effectiveRules: effective.effectiveRules,
      faq: effective.linkedFaq,
      errata: effective.linkedErrata,
      universalSpecialRules: supplementalDataset.data.universalSpecialRules,
      generatedAt,
    });
    const { forceDataset } = await buildForceDataset({
      filePath: path.join(projectRoot, "markdown/Unit-Cards-Printable-2026.md"),
      generatedAt,
    });

    const searchIndex = buildSearchIndex({
      sourceRegistry,
      lore: loreDataset,
      rules: mergedRules,
      supplemental: supplementalDataset,
      scenarios: scenarioDataset,
      forces: forceDataset,
      generatedAt,
    });

    expect(searchIndex.data.records.some((record) => record.entityType === "force" && record.title === "Harlow 1st Reaction Force")).toBe(true);
    expect(searchIndex.data.records.some((record) => record.entityType === "unit" && record.title === "Harlow Springbok AI" && record.aliases.includes("hfr-6773"))).toBe(true);
    expect(searchIndex.data.records.some((record) => record.entityType === "unit" && record.title === "Harlow Assault Team" && record.keywords.includes("p34"))).toBe(true);
  });
});

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
    expect(forceDataset.data.forces).toHaveLength(2);
    expect(forceDataset.data.forces[0]?.cardId).toBe("HFR-6770");
    expect(forceDataset.data.forces[0]?.faction).toBe("the-authority");
    expect(forceDataset.data.units.map((unit) => unit.cardId)).toEqual(["HFR-6771", "HFR-6772", "HFR-6773", "HFR-6774", "HFR-6775", "HFR-6776", "RFA-4391", "RFA-4392", "RFA-4393"]);
    expect(auditDataset.meta.confidence).toBe("raw");
    expect(auditDataset.data.rawCards).toHaveLength(11);
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
    expect(controlTeam?.specialists.find((specialist) => specialist.slot === 2)?.weapon).toBe("Grenade Launcher");

    expect(assaultTeam?.specialists.find((specialist) => specialist.slot === 1)?.name).toBe("Machine Gunner");
    expect(assaultTeam?.weapons.find((weapon) => weapon.id === "hfr-6772-weapon-p34")?.traits).toEqual(["Cyclic", "Heavy"]);

    expect(springbok?.abilities.map((entry) => entry.name)).toEqual(["Chaff Discharge", "Traits"]);
    expect(springbok?.weapons[0]?.traits).toEqual(["CQB", "Sustained (1)"]);

    expect(force?.battleDrills.map((entry) => entry.name)).toEqual(["Assaulters", "Chaff", "Stims"]);
    expect(force?.armory.map((entry) => entry.name)).toEqual(["BOOST JUMP", "FRAG LAUNCHER", "HEAD", "MICRO LAUNCHER"]);
    expect(force?.rules[0]?.text).toContain("+2 Movement when Sprinting");
  });

  it("adds verified Harlow strike-team units and UN Raid Force Alpha cards", async () => {
    const { forceDataset } = await buildForceDataset({
      filePath: path.join(projectRoot, "markdown/Unit-Cards-Printable-2026.md"),
      generatedAt,
    });

    const harlowUnits = forceDataset.data.units.filter((unit) => unit.forceId === "harlow-1st-reaction-force");
    const raidForce = forceDataset.data.forces.find((force) => force.id === "un-raid-force-alpha");
    const assaulters = forceDataset.data.units.find((unit) => unit.id === "un-utg-assaulters");
    const specialists = forceDataset.data.units.find((unit) => unit.id === "un-utg-specialists");
    const golem = forceDataset.data.units.find((unit) => unit.id === "golem-unit");
    const engineers = forceDataset.data.units.find((unit) => unit.id === "harlow-engineers");
    const veterans = forceDataset.data.units.find((unit) => unit.id === "harlow-veterans");
    const crickets = forceDataset.data.units.find((unit) => unit.id === "harlow-crickets");

    expect(harlowUnits.map((unit) => unit.cardId)).toEqual(["HFR-6771", "HFR-6772", "HFR-6773", "HFR-6774", "HFR-6775", "HFR-6776"]);
    expect(engineers?.specialists[0]?.name).toBe("Engineer");
    expect(engineers?.weapons.find((weapon) => weapon.name === "AT Launcher")?.traits).toEqual(["AP (2)", "Blast (1)"]);
    expect(veterans?.weapons.map((weapon) => weapon.name)).toEqual(["Carbine", "Machetes", "Pulse Grenades"]);
    expect(crickets?.abilities.map((ability) => ability.name)).toEqual(["Traits", "Engineer Grouping", "Self Destruct"]);

    expect(raidForce?.cardId).toBe("RFA-4390");
    expect(raidForce?.faction).toBe("the-authority");
    expect(raidForce?.battleDrills.map((entry) => entry.name)).toEqual(["Close Assault", "Cross Fire", "Switchback"]);
    expect(raidForce?.armory.map((entry) => entry.name)).toEqual(["BOOST JUMP", "LANCE", "MICRO LAUNCHER", "SURGE"]);
    expect(assaulters?.specialists[0]?.name).toBe("Grenadier");
    expect(specialists?.weapons.find((weapon) => weapon.name === "Anti-Material Rifle")?.traits).toEqual(["AP (2)", "Deployed"]);
    expect(golem?.weapons.find((weapon) => weapon.name === "Scorcher")?.traits).toEqual(["Seeking"]);
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
    expect(searchIndex.data.records.some((record) => record.entityType === "force" && record.title === "UN Raid Force Alpha")).toBe(true);
    expect(searchIndex.data.records.some((record) => record.entityType === "unit" && record.title === "Golem Unit" && record.aliases.includes("rfa-4393"))).toBe(true);
  });
});

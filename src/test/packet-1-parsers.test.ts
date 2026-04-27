import path from "node:path";

import { describe, expect, it } from "vitest";

import { buildLoreDataset } from "../../scripts/etl/build-lore";
import { buildRulesDataset } from "../../scripts/etl/build-rules";
import { buildSupplementalDataset } from "../../scripts/etl/build-supplemental";

const projectRoot = process.cwd();

describe("Packet 1 ETL parsers", () => {
  it("extracts lore timeline, factions, species, and glossary citations", async () => {
    const dataset = await buildLoreDataset({
      filePath: path.join(projectRoot, "markdown/BLKOUT-Year-Two-Lore-Primer.md"),
      generatedAt: "2026-04-27T00:00:00.000Z",
    });

    expect(dataset.data.events.length).toBeGreaterThan(10);
    expect(dataset.data.factions.some((faction) => faction.name === "The Authority")).toBe(true);
    expect(dataset.data.species.some((species) => species.name === "Crimson Ferns")).toBe(true);
    expect(dataset.data.glossary.some((term) => term.term === "LEAP")).toBe(true);

    const event = dataset.data.events.find((entry) => entry.year === "2030");
    expect(event?.citations[0]?.lineStart).toBeDefined();
    expect(event?.summary).toContain("ABOL");

    const authority = dataset.data.factions.find((entry) => entry.name === "The Authority");
    expect(authority?.citations[0]?.lineStart).toBeGreaterThan(500);
  });

  it("extracts core rules and scenario records with citations", async () => {
    const { rulesDataset, scenarioDataset } = await buildRulesDataset({
      filePath: path.join(projectRoot, "markdown/BLKOUT-PRINT-AT-HOME-RULEBOOK.md"),
      generatedAt: "2026-04-27T00:00:00.000Z",
    });

    expect(rulesDataset.data.rules.some((rule) => rule.id === "movement")).toBe(true);
    expect(rulesDataset.data.rules.some((rule) => rule.id === "smoke")).toBe(true);

    const movement = rulesDataset.data.rules.find((rule) => rule.id === "movement");
    const controlPoints = rulesDataset.data.rules.find((rule) => rule.id === "control-points");
    const movementSubsectionNumbers = movement?.subsections.map((subsection) => subsection.number);

    expect(movement?.body.length).toBeGreaterThan(50);
    expect(movement?.overview).toContain("measure the intended distance");
    expect(movementSubsectionNumbers).toEqual(["2.1", "2.2", "2.3", "2.4"]);
    expect(movement?.subsections[0]?.title).toBe("OBSTACLES");
    expect(movement?.subsections[2]?.body).toContain("Lean Out Marker");
    expect(controlPoints?.body).toContain("Before each Game");
    expect(controlPoints?.body).toContain("Battle Drill");

    const dockyard = scenarioDataset.data.scenarios.find((scenario) => scenario.id === "dockyard-assault");
    const serverDefense = scenarioDataset.data.scenarios.find((scenario) => scenario.id === "server-defense");
    const hvtEvac = scenarioDataset.data.scenarios.find((scenario) => scenario.id === "hvt-evac");
    const zeroDay = scenarioDataset.data.scenarios.find((scenario) => scenario.id === "zero-day");

    expect(dockyard).toBeDefined();
    expect(dockyard?.tableSize).toContain("2’x2’");
    expect(dockyard?.citations[0]?.lineStart).toBe(648);
    expect(dockyard?.citations[0]?.lineEnd).toBe(713);
    expect(dockyard?.citations[0]?.lineEnd).toBeGreaterThan(dockyard?.citations[0]?.lineStart ?? 0);
    expect(dockyard?.scoringRules[0]).toContain("Overrun Point");
    expect(dockyard?.specialRules.join(" ")).not.toContain("SERVER DEFENSE");

    expect(serverDefense?.citations[0]?.lineStart).toBe(714);
    expect(serverDefense?.citations[0]?.lineEnd).toBe(787);
    expect(serverDefense?.specialRules.join(" ")).not.toContain("HVT EVAC");

    expect(hvtEvac?.citations[0]?.lineStart).toBe(788);
    expect(hvtEvac?.citations[0]?.lineEnd).toBe(852);
    expect(hvtEvac?.specialRules.join(" ")).not.toContain("ZERO DAY");

    expect(zeroDay?.citations[0]?.lineStart).toBe(853);
    expect(zeroDay?.citations[0]?.lineEnd).toBe(912);
    expect(zeroDay?.specialRules.join(" ")).not.toContain("[10] REFERENCE");
  });

  it("extracts FAQ, errata, and universal special rules from the supplemental", async () => {
    const dataset = await buildSupplementalDataset({
      filePath: path.join(projectRoot, "markdown/BLKOUT_Supplemental_4-26.md"),
      generatedAt: "2026-04-27T00:00:00.000Z",
    });

    expect(dataset.data.faq.length).toBeGreaterThan(10);
    expect(dataset.data.errata.length).toBeGreaterThan(5);
    expect(dataset.data.universalSpecialRules.some((rule) => rule.name === "AI")).toBe(true);
    expect(dataset.data.universalSpecialRules.some((rule) => rule.name === "Data Spike")).toBe(true);

    const movementFaq = dataset.data.faq.find((entry) => entry.topic === "movement");
    const dataAttackFaq = dataset.data.faq.find((entry) =>
      entry.question === "Do Data Attacks have a maximum range or require Line of sight?",
    );
    const dataKnifeFaq = dataset.data.faq.find((entry) =>
      entry.question === "Can Data Knives give Units a Pinned Token?",
    );
    const dataAttackErrata = dataset.data.errata.find((entry) =>
      entry.target === "AP - Targeting Dusters and Vehicles (As per normal Shooting rules).",
    );

    expect(movementFaq?.citations[0]?.lineStart).toBeGreaterThan(0);
    expect(dataAttackFaq?.topic).toBe("data attacks");
    expect(dataAttackFaq?.answer).toContain("unlimited Range");
    expect(dataKnifeFaq?.answer).toContain("Data Spikes");
    expect(dataAttackErrata?.oldTextSummary).toBe("DATA ATTACKS");
    expect(dataAttackErrata?.newTextSummary).toContain("Data Attacks don’t require Line of Sight");
  });
});

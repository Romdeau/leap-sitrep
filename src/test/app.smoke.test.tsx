import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "@/App";

const sourceRegistryFixture = {
  meta: {
    kind: "source-registry",
    version: "packet-4-test",
    generatedAt: "2026-04-27T00:00:00.000Z",
    sourceDocumentIds: ["blkout-core-rulebook"],
    confidence: "verified",
  },
  data: {
    documents: [
      {
        id: "blkout-lore-primer",
        title: "BLKOUT Year Two Lore Primer",
        fileName: "markdown/BLKOUT-Year-Two-Lore-Primer.md",
        documentType: "lore",
        version: "year-two",
        isCanonical: true,
      },
      {
        id: "blkout-core-rulebook",
        title: "BLKOUT Print-at-Home Rulebook",
        fileName: "markdown/BLKOUT-PRINT-AT-HOME-RULEBOOK.md",
        documentType: "rules",
        version: "print-at-home",
        isCanonical: true,
        precedenceRank: 4,
      },
      {
        id: "blkout-supplemental",
        title: "BLKOUT Supplemental 4-26",
        fileName: "markdown/BLKOUT_Supplemental_4-26.md",
        documentType: "supplemental",
        version: "april-2026",
        isCanonical: true,
        precedenceRank: 1,
      },
      {
        id: "blkout-unit-cards-screenshots",
        title: "Unit Card Screenshot Verification Set",
        fileName: "screenshots/",
        documentType: "unit-card-screenshots",
        version: "packet-3-manual-verify",
        isCanonical: true,
        precedenceRank: 3,
      },
    ],
  },
};

const loreFixture = {
  meta: {
    kind: "lore",
    version: "packet-4-test",
    generatedAt: "2026-04-27T00:00:00.000Z",
    sourceDocumentIds: ["blkout-lore-primer"],
    confidence: "extracted",
  },
  data: {
    factions: [
      {
        id: "the-authority",
        name: "The Authority",
        summary: "The dominant power on ABOL and the political anchor of the seed slice.",
        ideology: "A socialized oligarchy built on order, control, and expansion.",
        regions: ["Ethron", "Cenriv"],
        relatedForceIds: [],
        citations: [
          {
            documentId: "blkout-lore-primer",
            label: "Faction section: The Authority",
            lineStart: 597,
            lineEnd: 652,
          },
        ],
      },
      {
        id: "harlow-1st-assault-battalion",
        name: "Harlow 1st Assault Battalion",
        summary: "Harlow is the Authority's contracted military enforcement arm.",
        ideology: "Efficiency and brutality in service of Authority control.",
        regions: [],
        relatedForceIds: ["harlow-1st-reaction-force"],
        citations: [
          {
            documentId: "blkout-lore-primer",
            label: "Faction section: Harlow 1st Assault Battalion",
            lineStart: 681,
            lineEnd: 691,
          },
        ],
      },
    ],
    events: [
      {
        id: "timeline-2022-1",
        year: "2022",
        title: "2022: The VLA detects mysterious radio activity from deep space",
        summary: "The opening signal that starts the ABOL chain of events.",
        involvedFactionIds: [],
        citations: [
          {
            documentId: "blkout-lore-primer",
            label: "Lore timeline 2022",
            lineStart: 3,
            lineEnd: 8,
          },
        ],
      },
      {
        id: "timeline-2030-4",
        year: "2030",
        title: "2030: NASA announces the discovery of planet ABOL, potentially habitable",
        summary: "ABOL becomes humanity's destination.",
        involvedFactionIds: [],
        citations: [
          {
            documentId: "blkout-lore-primer",
            label: "Lore timeline 2030",
            lineStart: 23,
            lineEnd: 27,
          },
        ],
      },
    ],
    locations: [],
    species: [],
    glossary: [
      {
        id: "abol",
        term: "ABOL",
        meaning: "Humanity's colony planet and the setting of BLKOUT.",
        aliases: [],
        relatedRuleIds: [],
        relatedFactionIds: ["the-authority"],
        citations: [
          {
            documentId: "blkout-lore-primer",
            label: "Lore timeline 2030",
            lineStart: 23,
            lineEnd: 27,
          },
        ],
      },
      {
        id: "utg",
        term: "UTG",
        meaning: "Urban Tactical Group, the paired elite soldiers of the Twin Moons Program.",
        aliases: [],
        relatedRuleIds: [],
        relatedFactionIds: [],
        citations: [
          {
            documentId: "blkout-lore-primer",
            label: "Faction section: The Twin Moons Program",
            lineStart: 654,
            lineEnd: 668,
          },
        ],
      },
    ],
  },
};

const rulesFixture = {
  meta: {
    kind: "rules",
    version: "packet-4-test",
    generatedAt: "2026-04-27T00:00:00.000Z",
    sourceDocumentIds: ["blkout-core-rulebook", "blkout-supplemental"],
    confidence: "curated",
  },
  data: {
    rules: [
      {
        id: "movement",
        title: "MOVEMENT",
        category: "movement",
        mode: "core",
        overview: "Move a Model by measuring distance from its base.",
        subsections: [
          {
            id: "2-1-obstacles",
            number: "2.1",
            title: "OBSTACLES",
            order: 1,
            body: "Terrain that is 1 inch tall or shorter is called an Obstacle.",
            citations: [
              {
                documentId: "blkout-core-rulebook",
                label: "[2.1] OBSTACLES",
                lineStart: 194,
                lineEnd: 199,
              },
            ],
          },
          {
            id: "2-2-going-up-or-down",
            number: "2.2",
            title: "GOING UP OR DOWN",
            order: 2,
            body: "Infantry Models can Move up or down using things like stairs or ladders.",
            citations: [
              {
                documentId: "blkout-core-rulebook",
                label: "[2.2] GOING UP OR DOWN",
                lineStart: 201,
                lineEnd: 204,
              },
            ],
          },
          {
            id: "2-3-leaning-out",
            number: "2.3",
            title: "LEANING OUT",
            order: 3,
            body: "A Model may use half its Movement to Lean Out after a Move.",
            citations: [
              {
                documentId: "blkout-core-rulebook",
                label: "[2.3] LEANING OUT",
                lineStart: 206,
                lineEnd: 228,
              },
            ],
          },
        ],
        body: "Move a Model by measuring distance from its base. Obstacles cost movement. Jump(X) allows horizontal and vertical relocation.",
        citations: [
          {
            documentId: "blkout-core-rulebook",
            label: "[2.0] MOVEMENT",
            lineStart: 188,
            lineEnd: 268,
          },
        ],
      },
      {
        id: "combat",
        title: "COMBAT",
        category: "combat",
        mode: "core",
        overview: null,
        subsections: [],
        body: "Shooting resolves with skill checks, cover modifiers, armor checks, and CQC follow-up.",
        citations: [
          {
            documentId: "blkout-core-rulebook",
            label: "[3.0] COMBAT",
            lineStart: 238,
            lineEnd: 286,
          },
        ],
      },
      {
        id: "reactions",
        title: "REACTIONS",
        category: "reactions",
        mode: "core",
        overview: null,
        subsections: [
          {
            id: "7-2-return-fire-reaction",
            number: "7.2",
            title: "RETURN FIRE REACTION",
            order: 1,
            body: "A single Model may Return Fire and Shoot an Enemy Model when it makes a Shooting Action.",
            citations: [
              {
                documentId: "blkout-core-rulebook",
                label: "[7.2] RETURN FIRE REACTION",
                lineStart: 409,
                lineEnd: 411,
              },
            ],
          },
        ],
        body: "Return Fire, Overwatch, and Juke are the key reaction windows in the seed slice.",
        citations: [
          {
            documentId: "blkout-core-rulebook",
            label: "[7.0] REACTIONS",
            lineStart: 401,
            lineEnd: 453,
          },
        ],
      },
      {
        id: "data-attacks",
        title: "DATA ATTACKS",
        category: "data-attacks",
        mode: "core",
        overview: null,
        subsections: [],
        body: "Data Spike users can pin an enemy unit or clear a pinned marker.",
        citations: [
          {
            documentId: "blkout-core-rulebook",
            label: "[8.1] DATA ATTACKS",
            lineStart: 457,
            lineEnd: 468,
          },
        ],
      },
      {
        id: "control-points",
        title: "CONTROL POINTS",
        category: "control-points",
        mode: "core",
        overview: null,
        subsections: [],
        body: "Players begin with three Control Points and can spend them on initiative, battle drills, or chained activation.",
        citations: [
          {
            documentId: "blkout-core-rulebook",
            label: "[8.6] CONTROL POINTS",
            lineStart: 592,
            lineEnd: 599,
          },
        ],
      },
      {
        id: "smoke",
        title: "SMOKE",
        category: "smoke",
        mode: "core",
        overview: null,
        subsections: [],
        body: "Smoke blocks line of sight through a 3-inch area and changes cover state.",
        citations: [
          {
            documentId: "blkout-core-rulebook",
            label: "[8.8] SMOKE",
            lineStart: 608,
            lineEnd: 623,
          },
        ],
      },
    ],
    effectiveRules: [
      {
        id: "effective-reactions",
        title: "REACTIONS",
        originalRuleId: "reactions",
        originalText: "Return Fire, Overwatch, and Juke are the key reaction windows in the seed slice.",
        effectiveText: "Core reactions apply, with supplemental FAQ clarifying timing and eligibility cases.",
        precedenceReason: "Supplemental FAQ clarifies timing and eligibility for reaction cases.",
        citations: [
          {
            documentId: "blkout-supplemental",
            label: "FAQ reactions",
            lineStart: 419,
            lineEnd: 421,
            sectionId: "reactions",
          },
        ],
      },
      {
        id: "effective-data-attacks",
        title: "DATA ATTACKS",
        originalRuleId: "data-attacks",
        originalText: "Data Spike users can pin an enemy unit or clear a pinned marker.",
        effectiveText: "Supplemental clarifies range, line of sight, and weapon-specific data attack outcomes.",
        precedenceReason: "Supplemental clarifications define data attack range, line-of-sight, and weapon-specific outcomes.",
        citations: [
          {
            documentId: "blkout-supplemental",
            label: "FAQ data attacks",
            lineStart: 500,
            lineEnd: 502,
            sectionId: "data-attacks",
          },
        ],
      },
      {
        id: "effective-control-points",
        title: "CONTROL POINTS",
        originalRuleId: "control-points",
        originalText: "Players begin with three Control Points and can spend them on initiative, battle drills, or chained activation.",
        effectiveText: "Matched play supplemental replaces the core control-point economy for battle drills and chained activations.",
        precedenceReason: "Matched play supplemental replaces the core control point economy.",
        citations: [
          {
            documentId: "blkout-supplemental",
            label: "Matched play rules",
            lineStart: 25,
            lineEnd: 133,
          },
        ],
      },
      {
        id: "effective-smoke",
        title: "SMOKE",
        originalRuleId: "smoke",
        originalText: "Smoke blocks line of sight through a 3-inch area and changes cover state.",
        effectiveText: "Matched play smoke distinguishes partial and full cover based on base position inside the smoke area.",
        precedenceReason: "Matched play supplemental replaces core smoke cover behavior when using matched play rules.",
        citations: [
          {
            documentId: "blkout-supplemental",
            label: "Matched play rules",
            lineStart: 25,
            lineEnd: 133,
          },
        ],
      },
    ],
    faq: [
      {
        id: "faq-reactions-30",
        question: "Can a Ready model Return Fire after being targeted?",
        answer: "Yes, if it meets the normal reaction conditions.",
        topic: "reactions",
        citations: [
          {
            documentId: "blkout-supplemental",
            label: "FAQ reactions",
            lineStart: 419,
            lineEnd: 421,
            sectionId: "reactions",
          },
        ],
      },
      {
        id: "faq-data-attacks-1",
        question: "Do Data Attacks require line of sight?",
        answer: "Only if the weapon profile says they do.",
        topic: "data-attacks",
        citations: [
          {
            documentId: "blkout-supplemental",
            label: "FAQ data attacks",
            lineStart: 500,
            lineEnd: 502,
            sectionId: "data-attacks",
          },
        ],
      },
    ],
    errata: [],
    universalSpecialRules: [
      {
        id: "smoke-grenade-x",
        name: "Smoke Grenade | X\"",
        currentText: "Before this Unit's Reposition Phase, place a Smoke Token within X inches of one of its Models.",
        aliases: ["smoke grenade"],
        relatedRuleIds: ["smoke"],
        notes: [
          {
            id: "smoke-grenade-x-note-1",
            label: "Note: See Rules [8.8] Smoke for more information about this core ability",
            text: "Note: See Rules [8.8] Smoke for more information about this core ability",
            citations: [
              {
                documentId: "blkout-special-rules",
                label: "USR Smoke Grenade note",
                lineStart: 120,
                lineEnd: 120,
              },
            ],
          },
        ],
        citations: [
          {
            documentId: "blkout-special-rules",
            label: "USR Smoke Grenade | X\"",
            lineStart: 116,
            lineEnd: 120,
          },
        ],
      },
    ],
  },
};

const forcesFixture = {
  meta: {
    kind: "forces",
    version: "packet-4-test",
    generatedAt: "2026-04-27T00:00:00.000Z",
    sourceDocumentIds: ["blkout-unit-cards-screenshots"],
    confidence: "verified",
  },
  data: {
    forces: [
      {
        id: "harlow-1st-reaction-force",
        cardId: "HFR-6770",
        name: "Harlow 1st Reaction Force",
        parentLoreFactionId: "the-authority",
        battleDrills: [
          {
            id: "hfr-6770-battle-drill-chaff",
            label: "Chaff",
            text: "Place a Smoke Token (Chaff) within 6 inches of a model before activating.",
            citations: [
              {
                documentId: "blkout-unit-cards-screenshots",
                label: "Force card battle drills",
                sectionId: "screenshot-2",
              },
            ],
          },
        ],
        forceRules: [
          {
            id: "hfr-6770-force-rule",
            label: "Harlow First Reaction Force",
            text: "Harlow First Reaction Force Units gain +2 Movement when Sprinting.",
            citations: [
              {
                documentId: "blkout-unit-cards-screenshots",
                label: "Force card force rule",
                sectionId: "screenshot-2",
              },
            ],
          },
        ],
        armory: [
          {
            id: "hfr-6770-armory-boost-jump",
            name: "BOOST JUMP",
            text: "Model gains Jump (4).",
            citations: [
              {
                documentId: "blkout-unit-cards-screenshots",
                label: "Force card armory",
                sectionId: "screenshot-2",
              },
            ],
          },
        ],
        citations: [
          {
            documentId: "blkout-unit-cards-screenshots",
            label: "Force card front",
            sectionId: "screenshot-1",
          },
        ],
        confidence: "verified",
      },
    ],
    units: [
      {
        id: "harlow-control-team",
        cardId: "HFR-6771",
        forceId: "harlow-1st-reaction-force",
        name: "Harlow Control Team",
        modelCount: 1,
        stats: {
          move: "4",
          shoot: "6",
          armor: "1/6",
          hack: null,
          wounds: null,
        },
        specialists: [
          {
            id: "hfr-6771-specialist-1",
            slot: 1,
            name: "Data Spike",
            citations: [
              {
                documentId: "blkout-unit-cards-screenshots",
                label: "HFR-6771 back",
                sectionId: "screenshot-4",
              },
            ],
          },
        ],
        weapons: [
          {
            id: "hfr-6771-weapon-fal-32c",
            name: "FAL-32C",
            range: "24 inches/1",
            damage: null,
            keywords: ["CQB"],
            citations: [
              {
                documentId: "blkout-unit-cards-screenshots",
                label: "HFR-6771 front",
                sectionId: "screenshot-3",
              },
            ],
          },
        ],
        abilities: [
          {
            id: "hfr-6771-control-ability",
            label: "Activation Control",
            text: "One Unit may be Activated after this Unit without spending a Control Point.",
            citations: [
              {
                documentId: "blkout-unit-cards-screenshots",
                label: "HFR-6771 back",
                sectionId: "screenshot-4",
              },
            ],
          },
        ],
        citations: [
          {
            documentId: "blkout-unit-cards-screenshots",
            label: "HFR-6771 front",
            sectionId: "screenshot-3",
          },
        ],
        confidence: "verified",
      },
      {
        id: "harlow-assault-team",
        cardId: "HFR-6772",
        forceId: "harlow-1st-reaction-force",
        name: "Harlow Assault Team",
        modelCount: 2,
        stats: {
          move: "4",
          shoot: "6",
          armor: "1/6",
          hack: null,
          wounds: null,
        },
        specialists: [],
        weapons: [],
        abilities: [
          {
            id: "hfr-6772-team-leader",
            label: "Team Leader",
            text: "When this Model gains a Ready Token it may give it to a Model in this Unit that has already made an Action.",
            citations: [
              {
                documentId: "blkout-unit-cards-screenshots",
                label: "HFR-6772 back",
                sectionId: "screenshot-6",
              },
            ],
          },
        ],
        citations: [
          {
            documentId: "blkout-unit-cards-screenshots",
            label: "HFR-6772 front",
            sectionId: "screenshot-5",
          },
        ],
        confidence: "verified",
      },
      {
        id: "harlow-springbok-ai",
        cardId: "HFR-6773",
        forceId: "harlow-1st-reaction-force",
        name: "Harlow Springbok AI",
        modelCount: 2,
        stats: {
          move: "6",
          shoot: "6",
          armor: "2/6",
          hack: null,
          wounds: null,
        },
        specialists: [],
        weapons: [],
        abilities: [
          {
            id: "hfr-6773-traits",
            label: "Traits",
            text: "AI, Jump(4)",
            citations: [
              {
                documentId: "blkout-unit-cards-screenshots",
                label: "HFR-6773 back",
                sectionId: "screenshot-8",
              },
            ],
          },
        ],
        citations: [
          {
            documentId: "blkout-unit-cards-screenshots",
            label: "HFR-6773 front",
            sectionId: "screenshot-7",
          },
        ],
        confidence: "verified",
      },
    ],
  },
};

const scenariosFixture = {
  meta: {
    kind: "scenarios",
    version: "packet-4-test",
    generatedAt: "2026-04-27T00:00:00.000Z",
    sourceDocumentIds: ["blkout-core-rulebook"],
    confidence: "extracted",
  },
  data: {
    scenarios: [
      {
        id: "dockyard-assault",
        title: "Dockyard Assault",
        mode: "core",
        setup: [
          "The attacker chooses a deployment edge and activates first in round one.",
          "Place 2 Points of Interest and 2 Hardpoints.",
        ],
        scoringRules: ["Gain Overrun Points for destroying enemy units and locking down more Points of Interest."],
        specialRules: ["KEY TERRAIN", "INSIDE JOB"],
        tableSize: "2'x2'",
        hardpoints: ["2"],
        pointsOfInterest: ["2"],
        citations: [
          {
            documentId: "blkout-core-rulebook",
            label: "DOCKYARD ASSAULT",
            lineStart: 650,
            lineEnd: 715,
          },
        ],
      },
    ],
  },
};

const searchFixture = {
  meta: {
    kind: "search-index",
    version: "packet-4-test",
    generatedAt: "2026-04-27T00:00:00.000Z",
    sourceDocumentIds: ["blkout-lore-primer", "blkout-core-rulebook", "blkout-unit-cards-screenshots"],
    confidence: "curated",
  },
  data: {
    aliasMap: {
      utg: ["urban tactical groups", "twin moons program"],
      "return fire": ["reactions", "combat"],
    },
    records: [
      {
        id: "the-authority",
        entityType: "lore-faction",
        title: "The Authority",
        summary: "The dominant power on ABOL and the political anchor of the seed slice.",
        keywords: ["authority", "ethron"],
        aliases: [],
        route: "/lore/factions/the-authority",
        sourceDocumentIds: ["blkout-lore-primer"],
        relatedIds: [],
      },
      {
        id: "rule-reactions",
        entityType: "rule",
        title: "REACTIONS",
        summary: "Return Fire, Overwatch, and Juke are the key reaction windows in the seed slice.",
        keywords: ["reactions", "combat"],
        aliases: ["return fire"],
        route: "/rules/core",
        sourceDocumentIds: ["blkout-core-rulebook"],
        relatedIds: ["effective-reactions"],
      },
      {
        id: "rule-subsection-7-2-return-fire-reaction",
        entityType: "rule-subsection",
        title: "7.2 RETURN FIRE REACTION",
        summary: "A single Model may Return Fire and Shoot an Enemy Model when it makes a Shooting Action.",
        keywords: ["reactions", "combat", "7.2"],
        aliases: ["return fire"],
        route: "/rules/core#rule-subsection-7-2-return-fire-reaction",
        sourceDocumentIds: ["blkout-core-rulebook"],
        relatedIds: ["reactions"],
      },
      {
        id: "dockyard-assault",
        entityType: "scenario",
        title: "Dockyard Assault",
        summary: "Core scenario setup with Overrun scoring, hardpoints, and points of interest.",
        keywords: ["core", "dockyard"],
        aliases: [],
        route: "/scenarios/dockyard-assault",
        sourceDocumentIds: ["blkout-core-rulebook"],
        relatedIds: [],
      },
      {
        id: "harlow-1st-reaction-force",
        entityType: "force",
        title: "Harlow 1st Reaction Force",
        summary: "Verified Harlow force card with sprint bonus, battle drills, and armory.",
        keywords: ["harlow", "authority", "hfr-6770"],
        aliases: ["hfr-6770"],
        route: "/forces/harlow-1st-reaction-force",
        sourceDocumentIds: ["blkout-unit-cards-screenshots"],
        relatedIds: ["harlow-control-team", "harlow-assault-team", "harlow-springbok-ai"],
      },
      {
        id: "harlow-control-team",
        entityType: "unit",
        title: "Harlow Control Team",
        summary: "Activation Control and Data Spike specialist.",
        keywords: ["harlow", "control", "data spike"],
        aliases: ["hfr-6771"],
        route: "/units/harlow-control-team",
        sourceDocumentIds: ["blkout-unit-cards-screenshots"],
        relatedIds: ["harlow-1st-reaction-force"],
      },
      {
        id: "smoke-grenade-x",
        entityType: "usr",
        title: "Smoke Grenade | X\"",
        summary: "Before this Unit's Reposition Phase, place a Smoke Token within X inches of one of its Models.",
        keywords: ["smoke"],
        aliases: ["smoke grenade"],
        route: "/rules/usr/smoke-grenade-x",
        sourceDocumentIds: ["blkout-special-rules"],
        relatedIds: ["smoke"],
      },
      {
        id: "utg",
        entityType: "glossary",
        title: "UTG",
        summary: "Urban Tactical Group, the paired elite soldiers of the Twin Moons Program.",
        keywords: ["utg", "urban tactical groups"],
        aliases: ["urban tactical groups", "twin moons program"],
        route: "/glossary",
        sourceDocumentIds: ["blkout-lore-primer"],
        relatedIds: [],
      },
    ],
  },
};

const fixtureMap = new Map<string, object>([
  ["data/source-registry.json", sourceRegistryFixture],
  ["data/lore/index.json", loreFixture],
  ["data/rules/core.json", rulesFixture],
  ["data/forces/index.json", forcesFixture],
  ["data/scenarios/core.json", scenariosFixture],
  ["data/search/index.json", searchFixture],
]);

describe("App smoke test", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");

    vi.stubGlobal(
      "fetch",
      vi.fn((input: string | URL | Request) => {
        const requestUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
        const matchedFixture = [...fixtureMap.entries()].find(([path]) => requestUrl.includes(path));

        if (matchedFixture !== undefined) {
          return Promise.resolve(
            new Response(JSON.stringify(matchedFixture[1]), {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            }),
          );
        }

        return Promise.resolve(new Response("Not found", { status: 404 }));
      }),
    );
  });

  it("renders the Packet 4 reference home from generated datasets", async () => {
    render(<App />);

    expect(await screen.findByText("Reference hub")).toBeInTheDocument();
    expect(screen.getByText("Seed slice reference data is live")).toBeInTheDocument();
    expect(screen.getByText("Authority overview")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Forces" }).length).toBeGreaterThan(0);
  });

  it("opens search and returns seed slice results", async () => {
    const user = userEvent.setup();

    render(<App />);

    await screen.findByText("Reference hub");
    await user.click(screen.getAllByRole("button", { name: "Search" })[0]);
    await user.type(screen.getByPlaceholderText("Search rules, lore, forces, units, scenarios, or glossary terms"), "return fire");

    expect(await screen.findByText("7.2 RETURN FIRE REACTION")).toBeInTheDocument();
    expect(screen.getByText("Rule Section")).toBeInTheDocument();
  });

  it("navigates to a subsection anchor from search results", async () => {
    const user = userEvent.setup();

    render(<App />);

    await screen.findByText("Reference hub");
    await user.click(screen.getAllByRole("button", { name: "Search" })[0]);
    await user.type(screen.getByPlaceholderText("Search rules, lore, forces, units, scenarios, or glossary terms"), "return fire");
    await user.click(await screen.findByRole("button", { name: /7\.2 RETURN FIRE REACTION/i }));

    expect(await screen.findByText("RETURN FIRE REACTION")).toBeInTheDocument();
    expect(window.location.hash).toBe("#rule-subsection-7-2-return-fire-reaction");
  });

  it("marks effective rule changes as baseline versus changed content", async () => {
    window.history.pushState({}, "", "/rules/core");

    render(<App />);

    expect((await screen.findAllByText("Effective ruling")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Core rulebook baseline").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Changed or added").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Baseline").length).toBeGreaterThan(0);
  });

  it("surfaces special rules in the rules module and search", async () => {
    const user = userEvent.setup();

    window.history.pushState({}, "", "/rules");

    render(<App />);

    expect(await screen.findByText("Universal special rules")).toBeInTheDocument();
    expect(screen.getByText("Smoke Grenade | X\"")).toBeInTheDocument();
    expect(screen.getByText("Special rules source")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Search" })[0]);
    await user.type(screen.getByPlaceholderText("Search rules, lore, forces, units, scenarios, or glossary terms"), "smoke grenade");

    expect(await screen.findByText("USR")).toBeInTheDocument();
  });
});

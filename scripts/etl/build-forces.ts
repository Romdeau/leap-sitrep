import { readFile } from "node:fs/promises";

import type {
  ArmoryItem,
  CitationBackedText,
  Force,
  SourceCitation,
  UnitCard,
  UnitSpecialist,
  WeaponProfile,
} from "../../src/lib/types/domain";
import type { ForceAuditDatasetFile, ForceDatasetFile } from "../../src/lib/types/generated";

const UNIT_CARD_DOCUMENT_ID = "blkout-unit-cards-ocr";
const SCREENSHOT_DOCUMENT_ID = "blkout-unit-cards-screenshots";

interface ForceDatasetResult {
  forceDataset: ForceDatasetFile;
  auditDataset: ForceAuditDatasetFile;
}

export async function buildForceDataset(options: {
  filePath: string;
  generatedAt: string;
}): Promise<ForceDatasetResult> {
  const rawMarkdown = await readFile(options.filePath, "utf8");
  const lines = rawMarkdown.split(/\r?\n/);

  const force: Force = {
    id: "harlow-1st-reaction-force",
    cardId: "HFR-6770",
    name: "Harlow 1st Reaction Force",
    parentLoreFactionId: "the-authority",
    battleDrills: [
      createTextRecord(
        "hfr-6770-battle-drill-assaulters",
        "Assaulters",
        "Models in this Unit cannot be Targeted by Overwatch when Repositioning.",
        [
          screenshotCitation("Force card battle drills", 2),
          ocrCitation(lines, "Assaulters: Models in this Unit cannot be Targeted by", "OCR battle drill cross-check"),
        ],
      ),
      createTextRecord(
        "hfr-6770-battle-drill-chaff",
        "Chaff",
        "Place a Smoke Token (Chaff) within 6\u201d of a Model in this Unit before Activating. Chaff Smoke Tokens Dissipate on a 10+.",
        [
          screenshotCitation("Force card battle drills", 2),
          ocrCitation(lines, "Chaff: Place a Smoke Token (Chaff) within 6\u201d", "OCR battle drill cross-check"),
        ],
      ),
      createTextRecord(
        "hfr-6770-battle-drill-stims",
        "Stims",
        "Models in this Unit gain +2 Movement for their Activation.",
        [
          screenshotCitation("Force card battle drills", 2),
          ocrCitation(lines, "Stims: Models in this Unit gain +2 Movement for their Activation.", "OCR battle drill cross-check"),
        ],
      ),
    ],
    forceRules: [
      createTextRecord(
        "hfr-6770-force-rule",
        "Harlow First Reaction Force",
        "Harlow First Reaction Force Units gain +2 Movement when Sprinting.",
        [
          screenshotCitation("Force card force rule", 2),
          ocrCitation(lines, "Harlow First Reaction Force Units gain +2 Movement", "OCR force rule cross-check"),
        ],
      ),
    ],
    armory: [
      createArmoryItem(
        "hfr-6770-armory-boost-jump",
        "BOOST JUMP",
        "Model gains Jump (4)",
        [screenshotCitation("Force card armory", 2), ocrCitation(lines, "BOOST JUMP", "OCR armory cross-check")],
      ),
      createArmoryItem(
        "hfr-6770-armory-frag-launcher",
        "FRAG LAUNCHER",
        "Sustained (2), Medium",
        [screenshotCitation("Force card armory", 2), ocrCitation(lines, "FRAG LAUNCHER | 24”/1", "OCR armory cross-check")],
        createWeapon(
          "hfr-6770-armory-frag-launcher-profile",
          "Frag Launcher",
          "24\u201d/1",
          null,
          ["Sustained (2)", "Medium"],
          [screenshotCitation("Force card armory", 2)],
        ),
      ),
      createArmoryItem(
        "hfr-6770-armory-head",
        "HEAD",
        "Blast (1)",
        [screenshotCitation("Force card armory", 2), ocrCitation(lines, "HEAD | 16”/4", "OCR armory cross-check")],
        createWeapon(
          "hfr-6770-armory-head-profile",
          "HEAD",
          "16\u201d/4",
          null,
          ["Blast (1)"],
          [screenshotCitation("Force card armory", 2)],
        ),
      ),
      createArmoryItem(
        "hfr-6770-armory-micro-launcher",
        "MICRO LAUNCHER",
        "Blast (1), Heavy",
        [screenshotCitation("Force card armory", 2), ocrCitation(lines, "MICRO LAUNCHER | 4-16”/2", "OCR armory cross-check")],
        createWeapon(
          "hfr-6770-armory-micro-launcher-profile",
          "Micro Launcher",
          "4-16\u201d/2",
          null,
          ["Blast (1)", "Heavy"],
          [screenshotCitation("Force card armory", 2)],
        ),
      ),
    ],
    citations: [screenshotCitation("Force card front", 1), screenshotCitation("Force card back", 2)],
    confidence: "verified",
  };
  const unRaidForceAlpha: Force = {
    id: "un-raid-force-alpha",
    cardId: "RFA-4390",
    name: "UN Raid Force Alpha",
    parentLoreFactionId: "un-raid-force-alpha",
    battleDrills: [
      createTextRecord(
        "rfa-4390-battle-drill-close-assault",
        "Close Assault",
        "Models in this Unit may Move 2\u201d after their Activation ends, only if it would bring them into CQC with an Enemy Model.",
        [screenshotCitation("UN Raid Force Alpha force back", 14)],
      ),
      createTextRecord(
        "rfa-4390-battle-drill-cross-fire",
        "Cross Fire",
        "If more than one Model in this Unit Targets the same Enemy Model, their Weapons gain +1 Damage.",
        [screenshotCitation("UN Raid Force Alpha force back", 14)],
      ),
      createTextRecord(
        "rfa-4390-battle-drill-switchback",
        "Switchback",
        "Place a Smoke Token within 4\u201d of a Model in this Unit before Activating. All Models may be Moved up to 2\u201d before Activating.",
        [screenshotCitation("UN Raid Force Alpha force back", 14)],
      ),
    ],
    forceRules: [
      createTextRecord(
        "rfa-4390-force-rule",
        "UN Raid Team Alpha",
        "All UN Raid Team Alpha UTG Assaulter and Specialist Units gain an additional D10 roll in all Skill Checks, including Shooting and Close Quarters Combat (CQC).",
        [screenshotCitation("UN Raid Force Alpha force back", 14)],
      ),
    ],
    armory: [
      createArmoryItem("rfa-4390-armory-boost-jump", "BOOST JUMP", "Model gains Jump (6)", [screenshotCitation("UN Raid Force Alpha force back", 14)]),
      createArmoryItem(
        "rfa-4390-armory-lance",
        "LANCE",
        "AP (3)",
        [screenshotCitation("UN Raid Force Alpha force back", 14)],
        createWeapon("rfa-4390-armory-lance-profile", "Lance", "12\u201d/1", null, ["AP (3)"], [screenshotCitation("UN Raid Force Alpha force back", 14)]),
      ),
      createArmoryItem(
        "rfa-4390-armory-micro-launcher",
        "MICRO LAUNCHER",
        "Blast (1), Heavy",
        [screenshotCitation("UN Raid Force Alpha force back", 14)],
        createWeapon(
          "rfa-4390-armory-micro-launcher-profile",
          "Micro Launcher",
          "4-16\u201d/2",
          null,
          ["Blast (1)", "Heavy"],
          [screenshotCitation("UN Raid Force Alpha force back", 14)],
        ),
      ),
      createArmoryItem(
        "rfa-4390-armory-surge",
        "SURGE",
        "EMP Only",
        [screenshotCitation("UN Raid Force Alpha force back", 14)],
        createWeapon("rfa-4390-armory-surge-profile", "Surge", "16\u201d/2", null, ["EMP Only"], [screenshotCitation("UN Raid Force Alpha force back", 14)]),
      ),
    ],
    citations: [screenshotCitation("UN Raid Force Alpha force front", 13), screenshotCitation("UN Raid Force Alpha force back", 14)],
    confidence: "verified",
  };

  const units: UnitCard[] = [
    {
      id: "harlow-control-team",
      cardId: "HFR-6771",
      forceId: force.id,
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
        createSpecialist("hfr-6771-specialist-1", 1, "Data Spike", undefined, undefined, [screenshotCitation("HFR-6771 back", 4)]),
        createSpecialist(
          "hfr-6771-specialist-2",
          2,
          "Grenade Launcher",
          "Grenade Launcher | 24\u201d/2 Blast (1)",
          "hfr-6771-weapon-grenade-launcher",
          [screenshotCitation("HFR-6771 back", 4)],
        ),
      ],
      weapons: [
        createWeapon("hfr-6771-weapon-fal-32c", "FAL-32C", "24\u201d/1", null, ["CQB"], [screenshotCitation("HFR-6771 front", 3)]),
        createWeapon(
          "hfr-6771-weapon-grenade-launcher",
          "Grenade Launcher",
          "24\u201d/2",
          null,
          ["Blast (1)"],
          [screenshotCitation("HFR-6771 back", 4)],
          "Grenade Launcher",
        ),
      ],
      abilities: [
        createTextRecord(
          "hfr-6771-control-ability",
          "Activation Control",
          "One Unit may be Activated after this Unit without spending a Control Point.",
          [screenshotCitation("HFR-6771 back", 4), ocrCitation(lines, "One Unit may be Activated after this", "OCR unit text cross-check")],
        ),
      ],
      citations: [screenshotCitation("HFR-6771 front", 3), screenshotCitation("HFR-6771 back", 4)],
      confidence: "verified",
    },
    {
      id: "harlow-assault-team",
      cardId: "HFR-6772",
      forceId: force.id,
      name: "Harlow Assault Team",
      modelCount: 2,
      stats: {
        move: "4",
        shoot: "6",
        armor: "1/6",
        hack: null,
        wounds: null,
      },
      specialists: [
        createSpecialist(
          "hfr-6772-specialist-1",
          1,
          "Machine Gunner",
          "P34 | 24\u201d/1 Cyclic, Heavy",
          "hfr-6772-weapon-p34",
          [screenshotCitation("HFR-6772 back", 6)],
        ),
        createSpecialist(
          "hfr-6772-specialist-2",
          2,
          "Team Leader",
          "When this Model gains a Ready Token it may give it to a Model in this Unit that has already made an Action.",
          undefined,
          [screenshotCitation("HFR-6772 back", 6)],
        ),
      ],
      weapons: [
        createWeapon("hfr-6772-weapon-fal-32c", "FAL-32C", "24\u201d/1", null, ["CQB"], [screenshotCitation("HFR-6772 front", 5)]),
        createWeapon(
          "hfr-6772-weapon-p34",
          "P34",
          "24\u201d/1",
          null,
          ["Cyclic", "Heavy"],
          [screenshotCitation("HFR-6772 back", 6)],
          "Machine Gunner",
        ),
      ],
      abilities: [
        createTextRecord(
          "hfr-6772-team-leader",
          "Team Leader",
          "When this Model gains a Ready Token it may give it to a Model in this Unit that has already made an Action.",
          [screenshotCitation("HFR-6772 back", 6), ocrCitation(lines, "When this Model gains a Ready Token", "OCR unit text cross-check")],
        ),
      ],
      citations: [screenshotCitation("HFR-6772 front", 5), screenshotCitation("HFR-6772 back", 6)],
      confidence: "verified",
    },
    {
      id: "harlow-springbok-ai",
      cardId: "HFR-6773",
      forceId: force.id,
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
      weapons: [
        createWeapon(
          "hfr-6773-weapon-fal-32d",
          "FAL-32D",
          "24\u201d/1",
          null,
          ["CQB", "Sustained (1)"],
          [screenshotCitation("HFR-6773 front", 7)],
        ),
      ],
      abilities: [
        createTextRecord(
          "hfr-6773-chaff-discharge",
          "Chaff Discharge",
          "Mark a box to prevent a single Overwatch Reaction from Targeting this Model during its Activation.",
          [screenshotCitation("HFR-6773 back", 8), ocrCitation(lines, "Chaff Discharge", "OCR unit text cross-check")],
        ),
        createTextRecord(
          "hfr-6773-traits",
          "Traits",
          "AI, Jump(4)",
          [screenshotCitation("HFR-6773 back", 8), ocrCitation(lines, "AI, Jump(4)", "OCR unit text cross-check")],
        ),
      ],
      citations: [screenshotCitation("HFR-6773 front", 7), screenshotCitation("HFR-6773 back", 8)],
      confidence: "verified",
    },
    {
      id: "harlow-engineers",
      cardId: "HFR-6774",
      forceId: force.id,
      name: "Harlow Engineers",
      modelCount: 1,
      stats: {
        move: "4",
        shoot: "6",
        armor: "1/6",
        hack: null,
        wounds: null,
      },
      specialists: [
        createSpecialist(
          "hfr-6774-specialist-1",
          1,
          "Engineer",
          "AT Launcher | 8-32\u201d/3 AP (2), Blast (1)",
          "hfr-6774-weapon-at-launcher",
          [screenshotCitation("HFR-6774 back", 10)],
        ),
      ],
      weapons: [
        createWeapon("hfr-6774-weapon-carbine", "Carbine", "18\u201d/1", null, ["CQB"], [screenshotCitation("HFR-6774 front", 9)]),
        createWeapon(
          "hfr-6774-weapon-at-launcher",
          "AT Launcher",
          "8-32\u201d/3",
          null,
          ["AP (2)", "Blast (1)"],
          [screenshotCitation("HFR-6774 back", 10)],
          "Engineer",
        ),
      ],
      abilities: [],
      citations: [screenshotCitation("HFR-6774 front", 9), screenshotCitation("HFR-6774 back", 10)],
      confidence: "verified",
    },
    {
      id: "harlow-veterans",
      cardId: "HFR-6775",
      forceId: force.id,
      name: "Harlow Veterans",
      modelCount: 3,
      stats: {
        move: "6",
        shoot: "5",
        armor: "1/6",
        hack: null,
        wounds: null,
      },
      specialists: [],
      weapons: [
        createWeapon("hfr-6775-weapon-carbine", "Carbine", "18\u201d/1", null, ["CQB"], [screenshotCitation("HFR-6775 front", 11)]),
        createWeapon("hfr-6775-weapon-machetes", "Machetes", "2\u201d/1", null, ["AP (1)", "Melee"], [screenshotCitation("HFR-6775 front", 11)]),
        createWeapon("hfr-6775-weapon-pulse-grenades", "Pulse Grenades", "6\u201d/1", null, ["Blast (1)", "EMP"], [screenshotCitation("HFR-6775 front", 11)]),
      ],
      abilities: [createTextRecord("hfr-6775-traits", "Traits", "Jump (4), Low Tech", [screenshotCitation("HFR-6775 back", 12)])],
      citations: [screenshotCitation("HFR-6775 front", 11), screenshotCitation("HFR-6775 back", 12)],
      confidence: "verified",
    },
    {
      id: "harlow-crickets",
      cardId: "HFR-6776",
      forceId: force.id,
      name: "Harlow Crickets",
      modelCount: 2,
      stats: {
        move: "6",
        shoot: "7",
        armor: "1/8",
        hack: null,
        wounds: null,
      },
      specialists: [],
      weapons: [
        createWeapon("hfr-6776-weapon-self-destruct", "Self Destruct", "4\u201d/1", null, ["AP (4)", "CQB"], [screenshotCitation("HFR-6776 front", 13)]),
      ],
      abilities: [
        createTextRecord("hfr-6776-traits", "Traits", "AI, Drone", [screenshotCitation("HFR-6776 back", 14)]),
        createTextRecord(
          "hfr-6776-engineer-grouping",
          "Engineer Grouping",
          "This unit does not count toward the Unit limit when grouped with Harlow engineers, and it cannot benefit from Force Cards.",
          [screenshotCitation("HFR-6776 back", 14)],
        ),
        createTextRecord("hfr-6776-self-destruct", "Self Destruct", "Remove this model after using this weapon.", [screenshotCitation("HFR-6776 front", 13)]),
      ],
      citations: [screenshotCitation("HFR-6776 front", 13), screenshotCitation("HFR-6776 back", 14)],
      confidence: "verified",
    },
    {
      id: "un-utg-assaulters",
      cardId: "RFA-4391",
      forceId: unRaidForceAlpha.id,
      name: "UN UTG Assaulters",
      modelCount: 1,
      stats: {
        move: "6",
        shoot: "5",
        armor: "1/5",
        hack: null,
        wounds: null,
      },
      specialists: [
        createSpecialist(
          "rfa-4391-specialist-1",
          1,
          "Grenadier",
          "Grenade Launcher | 24\u201d/2 Blast (1)",
          "rfa-4391-weapon-grenade-launcher",
          [screenshotCitation("RFA-4391 back", 16)],
        ),
      ],
      weapons: [
        createWeapon("rfa-4391-weapon-m7-carbine", "M7 Carbine", "18\u201d/1", null, ["CQB"], [screenshotCitation("RFA-4391 front", 15)]),
        createWeapon("rfa-4391-weapon-grenade-launcher", "Grenade Launcher", "24\u201d/2", null, ["Blast (1)"], [screenshotCitation("RFA-4391 back", 16)], "Grenadier"),
      ],
      abilities: [createTextRecord("rfa-4391-traits", "Traits", "Jump(4)", [screenshotCitation("RFA-4391 back", 16)])],
      citations: [screenshotCitation("RFA-4391 front", 15), screenshotCitation("RFA-4391 back", 16)],
      confidence: "verified",
    },
    {
      id: "un-utg-specialists",
      cardId: "RFA-4392",
      forceId: unRaidForceAlpha.id,
      name: "UN UTG Specialists",
      modelCount: 1,
      stats: {
        move: "6",
        shoot: "5",
        armor: "1/5",
        hack: null,
        wounds: null,
      },
      specialists: [
        createSpecialist(
          "rfa-4392-specialist-1",
          1,
          "Marksman",
          "Anti-Material Rifle | 32\u201d/2 AP (2), Deployed",
          "rfa-4392-weapon-anti-material-rifle",
          [screenshotCitation("RFA-4392 back", 18)],
        ),
      ],
      weapons: [
        createWeapon("rfa-4392-weapon-m7-carbine", "M7 Carbine", "18\u201d/1", null, ["CQB"], [screenshotCitation("RFA-4392 front", 17)]),
        createWeapon(
          "rfa-4392-weapon-anti-material-rifle",
          "Anti-Material Rifle",
          "32\u201d/2",
          null,
          ["AP (2)", "Deployed"],
          [screenshotCitation("RFA-4392 back", 18)],
          "Marksman",
        ),
      ],
      abilities: [createTextRecord("rfa-4392-traits", "Traits", "Jump(4)", [screenshotCitation("RFA-4392 back", 18)])],
      citations: [screenshotCitation("RFA-4392 front", 17), screenshotCitation("RFA-4392 back", 18)],
      confidence: "verified",
    },
    {
      id: "golem-unit",
      cardId: "RFA-4393",
      forceId: unRaidForceAlpha.id,
      name: "Golem Unit",
      modelCount: 1,
      stats: {
        move: "4",
        shoot: "5",
        armor: "3/5",
        hack: null,
        wounds: null,
      },
      specialists: [
        createSpecialist(
          "rfa-4393-specialist-1",
          1,
          "Fire Support",
          "Scorcher | 18\u201d/2 Seeking",
          "rfa-4393-weapon-scorcher",
          [screenshotCitation("RFA-4393 back", 20)],
        ),
      ],
      weapons: [
        createWeapon("rfa-4393-weapon-fpr-auto", "FPR Auto", "24\u201d/1", null, ["Sustained (1)"], [screenshotCitation("RFA-4393 front", 19)]),
        createWeapon("rfa-4393-weapon-scorcher", "Scorcher", "18\u201d/2", null, ["Seeking"], [screenshotCitation("RFA-4393 back", 20)], "Fire Support"),
      ],
      abilities: [createTextRecord("rfa-4393-traits", "Traits", "Jump(4)", [screenshotCitation("RFA-4393 back", 20)])],
      citations: [screenshotCitation("RFA-4393 front", 19), screenshotCitation("RFA-4393 back", 20)],
      confidence: "verified",
    },
  ];

  return {
    forceDataset: {
      meta: {
        kind: "forces",
        version: "packet-7",
        generatedAt: options.generatedAt,
        sourceDocumentIds: [UNIT_CARD_DOCUMENT_ID, SCREENSHOT_DOCUMENT_ID],
        confidence: "verified",
      },
      data: {
        forces: [force, unRaidForceAlpha],
        units,
      },
    },
    auditDataset: {
      meta: {
        kind: "force-audit",
        version: "packet-7",
        generatedAt: options.generatedAt,
        sourceDocumentIds: [UNIT_CARD_DOCUMENT_ID, SCREENSHOT_DOCUMENT_ID],
        confidence: "raw",
      },
      data: {
        rawCards: [
          createRawCard(lines, "HFR-6770", "Harlow 1st Reaction Force", "force", 1, 68, "OCR retained for audit only. All curated force fields verified against screenshots side1 and side2."),
          createRawCard(lines, "HFR-6771", "Harlow Control Team", "unit", 49, 68, "OCR retained for audit only. Stats, weapon, specialists, and rules verified against screenshots side1 and side2."),
          createRawCard(lines, "HFR-6772", "Harlow Assault Team", "unit", 49, 68, "OCR retained for audit only. Stats, weapon, specialists, and rules verified against screenshots side1 and side2."),
          createRawCard(lines, "HFR-6773", "Harlow Springbok AI", "unit", 49, 68, "OCR retained for audit only. Stats, weapon, and abilities verified against screenshots side1 and side2."),
          createScreenshotRawCard("HFR-6774", "Harlow Engineers", "unit", "screenshots/harlow-1st-reaction/harlow-team2-side1.png", "screenshots/harlow-1st-reaction/harlow-team2-side2.png"),
          createScreenshotRawCard("HFR-6775", "Harlow Veterans", "unit", "screenshots/harlow-1st-reaction/harlow-team2-side1.png", "screenshots/harlow-1st-reaction/harlow-team2-side2.png"),
          createScreenshotRawCard("HFR-6776", "Harlow Crickets", "unit", "screenshots/harlow-1st-reaction/harlow-team2-side1.png", "screenshots/harlow-1st-reaction/harlow-team2-side2.png"),
          createScreenshotRawCard("RFA-4390", "UN Raid Force Alpha", "force", "screenshots/un-raidforce-alpha/un-raidforce-alpha-side1.jpg", "screenshots/un-raidforce-alpha/un-raidforce-alpha-side2.png"),
          createScreenshotRawCard("RFA-4391", "UN UTG Assaulters", "unit", "screenshots/un-raidforce-alpha/un-raidforce-alpha-side1.jpg", "screenshots/un-raidforce-alpha/un-raidforce-alpha-side2.png"),
          createScreenshotRawCard("RFA-4392", "UN UTG Specialists", "unit", "screenshots/un-raidforce-alpha/un-raidforce-alpha-side1.jpg", "screenshots/un-raidforce-alpha/un-raidforce-alpha-side2.png"),
          createScreenshotRawCard("RFA-4393", "Golem Unit", "unit", "screenshots/un-raidforce-alpha/un-raidforce-alpha-side1.jpg", "screenshots/un-raidforce-alpha/un-raidforce-alpha-side2.png"),
        ],
      },
    },
  };
}

function createTextRecord(id: string, label: string, text: string, citations: SourceCitation[]): CitationBackedText {
  return { id, label, text, citations };
}

function createArmoryItem(
  id: string,
  name: string,
  text: string,
  citations: SourceCitation[],
  profile?: WeaponProfile,
): ArmoryItem {
  return { id, name, text, profile, citations };
}

function createWeapon(
  id: string,
  name: string,
  range: string,
  damage: string | null,
  keywords: string[],
  citations: SourceCitation[],
  carrier?: string,
): WeaponProfile {
  return { id, name, range, damage, keywords, citations, carrier };
}

function createSpecialist(
  id: string,
  slot: number,
  name: string,
  description: string | undefined,
  weaponId: string | undefined,
  citations: SourceCitation[],
): UnitSpecialist {
  return { id, slot, name, description, weaponId, citations };
}

function screenshotCitation(label: string, screenshotNumber: number): SourceCitation {
  return {
    documentId: SCREENSHOT_DOCUMENT_ID,
    label,
    sectionId: `screenshot-${screenshotNumber}`,
    excerpt: `Verified against Packet 3 screenshot ${screenshotNumber}`,
  };
}

function ocrCitation(lines: string[], exactLine: string, label: string): SourceCitation {
  const lineIndex = lines.findIndex((line) => line.includes(exactLine));

  return {
    documentId: UNIT_CARD_DOCUMENT_ID,
    label,
    lineStart: lineIndex >= 0 ? lineIndex + 1 : undefined,
    lineEnd: lineIndex >= 0 ? lineIndex + 1 : undefined,
    excerpt: lineIndex >= 0 ? lines[lineIndex] : exactLine,
  };
}

function createRawCard(
  lines: string[],
  cardId: string,
  name: string,
  recordType: "force" | "unit",
  startLine: number,
  endLine: number,
  notes: string,
) {
  return {
    id: `${cardId.toLowerCase()}-raw`,
    cardId,
    name,
    recordType,
    rawLines: lines.slice(startLine - 1, endLine),
    verificationDocumentIds: [SCREENSHOT_DOCUMENT_ID],
    notes,
    citations: [
      {
        documentId: UNIT_CARD_DOCUMENT_ID,
        label: `${cardId} OCR excerpt`,
        lineStart: startLine,
        lineEnd: endLine,
      },
    ],
  };
}

function createScreenshotRawCard(cardId: string, name: string, recordType: "force" | "unit", frontFile: string, backFile: string) {
  return {
    id: `${cardId.toLowerCase()}-raw`,
    cardId,
    name,
    recordType,
    rawLines: [`Front screenshot: ${frontFile}`, `Back screenshot: ${backFile}`],
    verificationDocumentIds: [SCREENSHOT_DOCUMENT_ID],
    notes: "Curated directly from screenshots; no OCR markdown source is available for this card yet.",
    citations: [
      {
        documentId: SCREENSHOT_DOCUMENT_ID,
        label: `${cardId} screenshot pair`,
        excerpt: `${frontFile} / ${backFile}`,
      },
    ],
  };
}

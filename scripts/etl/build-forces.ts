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
  ];

  return {
    forceDataset: {
      meta: {
        kind: "forces",
        version: "packet-3",
        generatedAt: options.generatedAt,
        sourceDocumentIds: [UNIT_CARD_DOCUMENT_ID, SCREENSHOT_DOCUMENT_ID],
        confidence: "verified",
      },
      data: {
        forces: [force],
        units,
      },
    },
    auditDataset: {
      meta: {
        kind: "force-audit",
        version: "packet-3",
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

# Data Pipeline Realignment Tasks

Realign the full force-data pipeline so the canonical transcription structure in `docs/` and the extraction workflow in `screenshots/` produce `public/data/forces/index.json`, and then update the application code to consume that new structure.

## Goal

Make these layers agree with each other in this order:

1. Source artifacts in `docs/`
2. Source/extraction prompts and progress tracking in `screenshots/`
3. Built force dataset in `public/data/forces/index.json`
4. Runtime types, ETL, UI, and tests that consume that dataset

The direction of truth should be:

- `docs/` and `screenshots/` define the extraction structure
- that structure is written into `public/data/forces/index.json`
- code changes follow from the `index.json` schema change

## Canonical Structure To Apply End-To-End

- Use `skill`, not `shoot`.
- Use `damage-track`, not `wounds`.
- Use `grunts`, not `modelCount`.
- Do not treat `hack` as a standard front-card stat.
- Preserve `traits` in transcription artifacts.
- Only use `carrier` when a weapon is explicitly tied to a named specialist or model.
- Use canonical faction ids such as `chimera`.

## Target `index.json` Structure

The target structure for `public/data/forces/index.json` should follow the canonical transcription format directly rather than the older runtime-oriented schema.

### Top-Level Shape

```json
{
  "meta": {
    "kind": "forces",
    "version": "<version>",
    "generatedAt": "<timestamp>",
    "sourceDocumentIds": ["..."],
    "confidence": "verified"
  },
  "data": {
    "forces": ["ForceRecord"],
    "units": ["UnitRecord"]
  }
}
```

### Force Record Shape

```json
{
  "id": "harlow-1st-reaction-force",
  "cardId": "HFR-6770",
  "name": "Harlow 1st Reaction Force",
  "faction": "the-authority",
  "rules": [
    {
      "id": "hfr-6770-rule-force",
      "name": "Harlow First Reaction Force",
      "text": "Harlow First Reaction Force Units gain +2 Movement when Sprinting.",
      "citations": []
    }
  ],
  "battleDrills": [
    {
      "id": "hfr-6770-battle-drill-assaulters",
      "name": "Assaulters",
      "text": "Models in this Unit cannot be Targeted by Overwatch when Repositioning.",
      "citations": []
    }
  ],
  "armory": [
    {
      "id": "hfr-6770-armory-frag-launcher",
      "name": "FRAG LAUNCHER",
      "type": "weapon",
      "cost": "UNKNOWN",
      "restrictions": "UNKNOWN",
      "text": "Sustained (2), Medium",
      "weapon": {
        "name": "Frag Launcher",
        "range": "24\"/1",
        "damage": "N/A",
        "traits": ["Sustained (2)", "Medium"]
      },
      "citations": []
    }
  ],
  "notes": [],
  "citations": [],
  "confidence": "verified"
}
```

### Unit Record Shape

```json
{
  "id": "harlow-control-team",
  "cardId": "HFR-6771",
  "forceId": "harlow-1st-reaction-force",
  "name": "Harlow Control Team",
  "faction": "the-authority",
  "unitType": "UNKNOWN",
  "role": "UNKNOWN",
  "cost": "UNKNOWN",
  "grunts": 1,
  "stats": {
    "move": "4",
    "skill": "6",
    "armor": "1/6",
    "damage-track": 1
  },
  "weapons": [
    {
      "id": "hfr-6771-weapon-fal-32c",
      "name": "FAL-32C",
      "range": "24\"/1",
      "damage": "N/A",
      "traits": ["CQB"],
      "carrier": "N/A",
      "citations": []
    }
  ],
  "specialists": [
    {
      "id": "hfr-6771-specialist-1",
      "slot": 1,
      "name": "Data Spike",
      "description": "N/A",
      "weapon": "N/A",
      "citations": []
    }
  ],
  "abilities": [
    {
      "id": "hfr-6771-ability-activation-control",
      "name": "Activation Control",
      "text": "One Unit may be Activated after this Unit without spending a Control Point.",
      "citations": []
    }
  ],
  "notes": [],
  "citations": [],
  "confidence": "verified"
}
```

## Legacy To Canonical Field Mapping

Apply these mappings when rewriting `public/data/forces/index.json`.

### Force-Level Mapping

| Legacy field | Target field | Notes |
|---|---|---|
| `parentLoreFactionId` | `faction` | Use the canonical faction id/name used by transcription artifacts. |
| `forceRules` | `rules` | Rename `label` to `name`. |
| `battleDrills[].label` | `battleDrills[].name` | Keep `text` and `citations`. |
| `forceRules[].label` | `rules[].name` | Keep `text` and `citations`. |
| `armory[].profile` | `armory[].weapon` | Rename nested `keywords` to `traits`. |
| `armory[].text` | `armory[].text` | Keep as-is. |
| missing `type` | add `type` | Default to `weapon` or `gear` from transcription artifacts. |
| missing `cost` | add `cost` | Use `UNKNOWN` unless source shows a value. |
| missing `restrictions` | add `restrictions` | Use `UNKNOWN` unless source shows a value. |
| missing `notes` | add `notes` | Default to `[]`. |

### Unit-Level Mapping

| Legacy field | Target field | Notes |
|---|---|---|
| `id` | `id` | Keep slug-based ids for now; do not switch unit ids to printed card ids. |
| `modelCount` | `grunts` | This is the printed grunt count, not total displayed models. |
| `stats.shoot` | `stats.skill` | Direct rename. |
| `stats.wounds` | `stats.damage-track` | Map explicit damage-track values; default to `1` where appropriate. |
| `stats.hack` | remove | Do not carry forward as a standard front-card stat. |
| missing `faction` | add `faction` | Use the canonical faction id from transcription artifacts. |
| missing `unitType` | add `unitType` | Use `UNKNOWN` unless source shows a value. |
| missing `role` | add `role` | Use `UNKNOWN` unless source shows a value. |
| missing `cost` | add `cost` | Use `UNKNOWN` unless source shows a value. |
| missing `notes` | add `notes` | Default to `[]`. |

### Weapon Mapping

| Legacy field | Target field | Notes |
|---|---|---|
| `keywords` | `traits` | Rename directly. |
| `carrier` | `carrier` | Keep only when the card explicitly ties the weapon to a named specialist or model. |
| `carrier` with invented role/weapon-name linkage | `carrier: "N/A"` | Reset when the weapon is simply one of several options on the same model. |
| `damage: null` | `damage: "N/A"` or source value | Prefer source-visible transcription values. |

### Specialist Mapping

| Legacy field | Target field | Notes |
|---|---|---|
| `weaponId` | `weapon` | Store the visible weapon name used by transcription artifacts, not an internal runtime id. |
| `description` | `description` | Keep visible reminder text or `N/A`. |

### Citation-Backed Text Mapping

| Legacy field | Target field | Notes |
|---|---|---|
| `label` | `name` | Applies to force rules, battle drills, and abilities. |
| `text` | `text` | Keep as-is. |
| `citations` | `citations` | Keep as-is unless citation schema is separately revised. |

## Dataset Rewrite Checklist

- Define the new JSON types for force records, unit records, weapons, specialists, armory entries, and abilities before editing code.
- Rewrite a small seed slice in `public/data/forces/index.json` first to prove the new shape works.
- Keep `id` values in the dataset slug-based for now.
- Normalize `damage` values consistently as either source strings or `N/A`; do not mix `null` and transcription-style placeholders unpredictably.
- Normalize `traits` arrays everywhere that `keywords` currently appear.
- Add `notes: []` explicitly to force and unit records, even when empty.
- Ensure every migrated unit record includes `faction`, `unitType`, `role`, and `cost` fields.

## Phase 1: Freeze The Source Artifact Format

- Treat `docs/force-card-transcription-format.md` as the canonical schema for force and unit transcription.
- Ensure all transcription docs under `docs/` use that format.
- Ensure `screenshots/force-extraction-prompt.md` instructs extraction into that format rather than the legacy runtime schema.
- Ensure `screenshots/extraction-progress.md` descriptions and notes refer to the new field names and concepts where relevant.

## Phase 2: Migrate The Built Dataset

- Update `public/data/forces/index.json` to match the canonical transcription structure.
- Rename force and unit fields in the dataset to the new schema.
- Replace unit `shoot` values with `skill`.
- Replace unit `wounds` values with `damage-track`.
- Replace unit `modelCount` values with `grunts`.
- Remove `hack` from front-card stat blocks in the dataset unless a separate non-front-card structure is deliberately introduced.
- Audit every unit weapon entry and remove invented `carrier` values where the weapon is simply another weapon on the same model.
- Preserve valid `carrier` values where the card explicitly ties a weapon to a named specialist.
- Normalize faction ids across the dataset, including `chimera`.
- Preserve explicit `Damage Track` entries from cards in the dataset rather than flattening them back into legacy fields.

## Phase 3: Update Code To Consume The New Dataset

- Update domain types in `src/lib/types/domain.ts` to match the new `index.json` structure.
- Update any ETL, import, or transformation code that reads or emits force data.
- Update every UI path that currently reads:
  - `unit.stats.shoot`
  - `unit.stats.wounds`
  - `unit.stats.hack`
  - `unit.modelCount`
- Update builder, unit detail, force detail, exports, and any search/indexing consumers to use the new fields.
- Revisit model-count displays so the app distinguishes `grunts` from total displayed models.
- Ensure damage-track handling uses the new field name and semantics.

## Phase 4: Update Prompt And Artifact Consumers

- Update screenshot extraction prompts so newly extracted cards are ready to drop into the canonical dataset without legacy remapping.
- Update any docs or helper prompts that still describe the old runtime-oriented field names.
- Confirm that manual transcription work in `docs/` and screenshot extraction work in `screenshots/` can both feed the same `public/data/forces/index.json` structure.

## Phase 5: Update Tests And Fixtures

- Update tests that reference legacy field names or old stat semantics.
- Update fixtures that currently rely on `shoot`, `wounds`, `hack`, or `modelCount`.
- Add coverage for:
  - units with explicit `damage-track` values greater than `1`
  - units with specialist-linked weapons
  - units with multiple selectable weapons on a single model and no carrier
  - units where total displayed models differ from `grunts`

## Concrete Deliverables

1. `docs/` uses the canonical transcription format.
2. `screenshots/` prompts and trackers target that same format.
3. `public/data/forces/index.json` is rewritten to that format.
4. App code compiles and runs against the new dataset shape.
5. Tests and fixtures are updated to the new schema.

## Order Of Work

1. Finalize the canonical transcription format.
2. Ensure `docs/` and `screenshots/` both target that format.
3. Rewrite `public/data/forces/index.json` to match it.
4. Update types, ETL, and UI code to consume the new dataset.
5. Update tests and fixtures.
6. Verify the full pipeline from transcription artifact to runtime usage.

# Force Card Transcription Format

Canonical transcription format for BLKOUT force and unit cards. This is the source-of-truth documentation format for manual and screenshot-based card transcription work.

## Core Principles

- Capture source-visible card information in a stable human-editable format.
- Prefer game-correct terminology over legacy app field names.
- Use `skill`, not `shoot`.
- Use `damage-track`, not `wounds`.
- Use `grunts`, not `modelCount`.
- Do not add `hack` as a front-card stat field.
- Use literal specialist names and slot numbers; do not repeat `Specialist 1` or `Specialist 2` inside the name.
- Record `carrier` only when a weapon is tied to a specific named specialist or model and is not simply one of several weapons available to the same model.

## Document Shape

Each transcription document should contain:

1. One force section.
2. One or more unit sections.
3. Metadata tables for force and unit cards.
4. YAML blocks for rules, battle drills, armory, stats, weapons, specialists, abilities, and notes.

## Force Metadata

Use a metadata table with these fields:

| Field | Value |
|---|---|
| Force Name | Printed force name |
| Force ID / Card ID | Printed card id |
| Faction / Allegiance | Canonical faction id, for example `chimera` |
| Card Type | `Force` |
| Source Image / Page | Screenshot path, packet reference, or `manual-input` |
| Confidence | `verified`, `partial`, or `uncertain` |

## Force YAML Blocks

### Force Rules / Abilities

```yaml
rules:
  - name: Force Rule Name
    text: "Exact visible rule text"
    citation:
      source: source-id
      location: card-side-and-position
      confidence: verified
```

### Battle Drills

```yaml
battle_drills:
  - name: Drill Name
    text: "Exact visible drill text"
    citation:
      source: source-id
      location: card-side-and-position
      confidence: verified
```

### Armory / Options

```yaml
armory:
  - name: WEAPON OR OPTION NAME
    type: weapon
    cost: UNKNOWN
    restrictions: UNKNOWN
    text: "Visible summary text"
    weapon:
      name: Weapon Name
      range: "24\""
      damage: 1
      traits:
        - Example Trait
    citation:
      source: source-id
      location: card-side-and-position
      confidence: verified
```

### Force Notes

```yaml
notes: []
```

## Unit Metadata

Use a metadata table with these fields:

| Field | Value |
|---|---|
| Unit Name | Printed unit name |
| Unit ID / Card ID | Printed card id |
| Parent Force ID | Printed parent force id |
| Faction / Allegiance | Canonical faction id |
| Unit Type | `UNKNOWN` if not shown |
| Role / Class | `UNKNOWN` if not shown |
| Cost / Points | `UNKNOWN` if not shown |
| Grunts | Front-card grunt count |
| Source Image / Page | Screenshot path, packet reference, or `manual-input` |
| Confidence | `verified`, `partial`, or `uncertain` |

## Unit YAML Blocks

### Unit Stats

```yaml
stats:
  move: "4"
  skill: "6"
  armor: "1/4"
  damage-track: 1
```

Rules:

- `damage-track` defaults to `1` for standard models unless the card shows an explicit alternate damage track.
- If a card has an explicit `Damage Track` item, record the visible value.

### Weapons

```yaml
weapons:
  - name: Weapon Name
    range: "24\""
    damage: 1
    traits:
      - Medium
    carrier: N/A
    citation:
      source: source-id
      location: card-side-and-position
      confidence: verified
```

Rules:

- Record `carrier: N/A` for unit weapons that are not locked to a named specialist.
- Do not invent a carrier when a single model has multiple selectable weapons.

### Specialists / Models

```yaml
specialists:
  - slot: 1
    name: Specialist Name
    description: "Visible specialist text"
    weapon: Weapon Name
    citation:
      source: source-id
      location: card-side-and-position
      confidence: verified
```

Rules:

- Use the slot number to preserve card position.
- Use the visible specialist name only.
- If the specialist is not tied to a weapon, record `weapon: N/A`.

### Abilities / Special Rules

```yaml
abilities:
  - name: Ability Name
    text: "Exact visible ability text"
    citation:
      source: source-id
      location: card-side-and-position
      confidence: verified
```

Rules:

- If a keyword-like rule is shown without full reminder text, preserve the visible keyword as written.
- Do not expand shorthand into inferred rules text.

## Citation Rules

- Prefer exact screenshot paths or stable source ids.
- Use specific locations such as card side, sheet position, or packet screenshot number.
- Use `manual-input` only when the transcription was entered directly rather than read from a saved screenshot source.

## Migration Notes

Legacy app-oriented documents may still use:

- `shoot`
- `wounds`
- `modelCount`
- `hack`
- app-specific assumptions about weapon carriers

These should be migrated to this format over time.

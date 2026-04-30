---
transcription_version: 1
game: BLKOUT
source_type: curated_existing_app_data_sample
transcriber: leap-sitrep
date_transcribed: 2026-04-29
confidence: verified
notes: >
  Sample manual transcription file generated from the existing curated Harlow data
  in scripts/etl/build-forces.ts. This is intended as a format reference for
  future manually transcribed card data, not as a fresh image extraction.
---

# Harlow 1st Reaction Force Card Transcription

## Force

### Force Metadata

| Field | Value |
|---|---|
| Force Name | Harlow 1st Reaction Force |
| Force ID / Card ID | HFR-6770 |
| Faction / Allegiance | the-authority |
| Card Type | Force |
| Source Image / Page | Packet 3 screenshots 1-2 |
| Confidence | verified |

### Force Rules / Abilities

```yaml
rules:
  - name: Harlow First Reaction Force
    text: "Harlow First Reaction Force Units gain +2 Movement when Sprinting."
    citation:
      source: blkout-unit-cards-screenshots
      location: Force card force rule, screenshot 2
      confidence: verified
```

### Battle Drills

```yaml
battle_drills:
  - name: Assaulters
    text: "Models in this Unit cannot be Targeted by Overwatch when Repositioning."
    citation:
      source: blkout-unit-cards-screenshots
      location: Force card battle drills, screenshot 2
      confidence: verified
  - name: Chaff
    text: "Place a Smoke Token (Chaff) within 6\" of a Model in this Unit before Activating. Chaff Smoke Tokens Dissipate on a 10+."
    citation:
      source: blkout-unit-cards-screenshots
      location: Force card battle drills, screenshot 2
      confidence: verified
  - name: Stims
    text: "Models in this Unit gain +2 Movement for their Activation."
    citation:
      source: blkout-unit-cards-screenshots
      location: Force card battle drills, screenshot 2
      confidence: verified
```

### Armory / Options

```yaml
armory:
  - name: BOOST JUMP
    type: gear
    cost: UNKNOWN
    restrictions: UNKNOWN
    text: "Model gains Jump (4)"
    citation:
      source: blkout-unit-cards-screenshots
      location: Force card armory, screenshot 2
      confidence: verified
  - name: FRAG LAUNCHER
    type: weapon
    cost: UNKNOWN
    restrictions: UNKNOWN
    text: "Sustained (2), Medium"
    weapon:
      name: Frag Launcher
      range: "24\"/1"
      damage: N/A
      traits:
        - Sustained (2)
        - Medium
    citation:
      source: blkout-unit-cards-screenshots
      location: Force card armory, screenshot 2
      confidence: verified
  - name: HEAD
    type: weapon
    cost: UNKNOWN
    restrictions: UNKNOWN
    text: "Blast (1)"
    weapon:
      name: HEAD
      range: "16\"/4"
      damage: N/A
      traits:
        - Blast (1)
    citation:
      source: blkout-unit-cards-screenshots
      location: Force card armory, screenshot 2
      confidence: verified
  - name: MICRO LAUNCHER
    type: weapon
    cost: UNKNOWN
    restrictions: UNKNOWN
    text: "Blast (1), Heavy"
    weapon:
      name: Micro Launcher
      range: "4-16\"/2"
      damage: N/A
      traits:
        - Blast (1)
        - Heavy
    citation:
      source: blkout-unit-cards-screenshots
      location: Force card armory, screenshot 2
      confidence: verified
```

### Force Notes

```yaml
notes: []
```

---

## Unit Card

### Unit Metadata

| Field | Value |
|---|---|
| Unit Name | Harlow Control Team |
| Unit ID / Card ID | HFR-6771 |
| Parent Force ID | HFR-6770 |
| Faction / Allegiance | the-authority |
| Unit Type | UNKNOWN |
| Role / Class | UNKNOWN |
| Cost / Points | UNKNOWN |
| Model Count | 1 |
| Source Image / Page | Packet 3 screenshots 3-4 |
| Confidence | verified |

### Unit Stats

```yaml
stats:
  move: "4"
  shoot: "6"
  armor: "1/6"
  hack: N/A
  wounds: N/A
  other: {}
```

### Weapons

```yaml
weapons:
  - name: FAL-32C
    range: "24\"/1"
    damage: N/A
    traits:
      - CQB
    carrier: N/A
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6771 front, screenshot 3
      confidence: verified
  - name: Grenade Launcher
    range: "24\"/2"
    damage: N/A
    traits:
      - Blast (1)
    carrier: Grenade Launcher
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6771 back, screenshot 4
      confidence: verified
```

### Specialists / Models

```yaml
specialists:
  - slot: 1
    name: Data Spike
    description: N/A
    weapon: N/A
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6771 back, screenshot 4
      confidence: verified
  - slot: 2
    name: Grenade Launcher
    description: "Grenade Launcher | 24\"/2 Blast (1)"
    weapon: Grenade Launcher
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6771 back, screenshot 4
      confidence: verified
```

### Abilities / Special Rules

```yaml
abilities:
  - name: Activation Control
    text: "One Unit may be Activated after this Unit without spending a Control Point."
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6771 back, screenshot 4
      confidence: verified
```

---

## Unit Card

### Unit Metadata

| Field | Value |
|---|---|
| Unit Name | Harlow Assault Team |
| Unit ID / Card ID | HFR-6772 |
| Parent Force ID | HFR-6770 |
| Faction / Allegiance | the-authority |
| Unit Type | UNKNOWN |
| Role / Class | UNKNOWN |
| Cost / Points | UNKNOWN |
| Model Count | 2 |
| Source Image / Page | Packet 3 screenshots 5-6 |
| Confidence | verified |

### Unit Stats

```yaml
stats:
  move: "4"
  shoot: "6"
  armor: "1/6"
  hack: N/A
  wounds: N/A
  other: {}
```

### Weapons

```yaml
weapons:
  - name: FAL-32C
    range: "24\"/1"
    damage: N/A
    traits:
      - CQB
    carrier: N/A
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6772 front, screenshot 5
      confidence: verified
  - name: P34
    range: "24\"/1"
    damage: N/A
    traits:
      - Cyclic
      - Heavy
    carrier: Machine Gunner
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6772 back, screenshot 6
      confidence: verified
```

### Specialists / Models

```yaml
specialists:
  - slot: 1
    name: Machine Gunner
    description: "P34 | 24\"/1 Cyclic, Heavy"
    weapon: P34
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6772 back, screenshot 6
      confidence: verified
  - slot: 2
    name: Team Leader
    description: "When this Model gains a Ready Token it may give it to a Model in this Unit that has already made an Action."
    weapon: N/A
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6772 back, screenshot 6
      confidence: verified
```

### Abilities / Special Rules

```yaml
abilities:
  - name: Team Leader
    text: "When this Model gains a Ready Token it may give it to a Model in this Unit that has already made an Action."
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6772 back, screenshot 6
      confidence: verified
```

---

## Unit Card

### Unit Metadata

| Field | Value |
|---|---|
| Unit Name | Harlow Springbok AI |
| Unit ID / Card ID | HFR-6773 |
| Parent Force ID | HFR-6770 |
| Faction / Allegiance | the-authority |
| Unit Type | UNKNOWN |
| Role / Class | UNKNOWN |
| Cost / Points | UNKNOWN |
| Model Count | 2 |
| Source Image / Page | Packet 3 screenshots 7-8 |
| Confidence | verified |

### Unit Stats

```yaml
stats:
  move: "6"
  shoot: "6"
  armor: "2/6"
  hack: N/A
  wounds: N/A
  other: {}
```

### Weapons

```yaml
weapons:
  - name: FAL-32D
    range: "24\"/1"
    damage: N/A
    traits:
      - CQB
      - Sustained (1)
    carrier: N/A
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6773 front, screenshot 7
      confidence: verified
```

### Specialists / Models

```yaml
specialists: []
```

### Abilities / Special Rules

```yaml
abilities:
  - name: Chaff Discharge
    text: "Mark a box to prevent a single Overwatch Reaction from Targeting this Model during its Activation."
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6773 back, screenshot 8
      confidence: verified
  - name: Traits
    text: "AI, Jump(4)"
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6773 back, screenshot 8
      confidence: verified
```

---

## Unit Card

### Unit Metadata

| Field | Value |
|---|---|
| Unit Name | Harlow Engineers |
| Unit ID / Card ID | HFR-6774 |
| Parent Force ID | HFR-6770 |
| Faction / Allegiance | the-authority |
| Unit Type | UNKNOWN |
| Role / Class | UNKNOWN |
| Cost / Points | UNKNOWN |
| Model Count | 1 |
| Source Image / Page | screenshots/harlow-1st-reaction/harlow-team2-side1.png and screenshots/harlow-1st-reaction/harlow-team2-side2.png |
| Confidence | verified |

### Unit Stats

```yaml
stats:
  move: "4"
  shoot: "6"
  armor: "1/6"
  hack: N/A
  wounds: N/A
  other: {}
```

### Weapons

```yaml
weapons:
  - name: Carbine
    range: "18\"/1"
    damage: N/A
    traits:
      - CQB
    carrier: N/A
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6774 front, screenshot 9
      confidence: verified
  - name: AT Launcher
    range: "8-32\"/3"
    damage: N/A
    traits:
      - AP (2)
      - Blast (1)
    carrier: Engineer
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6774 back, screenshot 10
      confidence: verified
```

### Specialists / Models

```yaml
specialists:
  - slot: 1
    name: Engineer
    description: "AT Launcher | 8-32\"/3 AP (2), Blast (1)"
    weapon: AT Launcher
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6774 back, screenshot 10
      confidence: verified
```

### Abilities / Special Rules

```yaml
abilities: []
```

---

## Unit Card

### Unit Metadata

| Field | Value |
|---|---|
| Unit Name | Harlow Veterans |
| Unit ID / Card ID | HFR-6775 |
| Parent Force ID | HFR-6770 |
| Faction / Allegiance | the-authority |
| Unit Type | UNKNOWN |
| Role / Class | UNKNOWN |
| Cost / Points | UNKNOWN |
| Model Count | 3 |
| Source Image / Page | screenshots/harlow-1st-reaction/harlow-team2-side1.png and screenshots/harlow-1st-reaction/harlow-team2-side2.png |
| Confidence | verified |

### Unit Stats

```yaml
stats:
  move: "6"
  shoot: "5"
  armor: "1/6"
  hack: N/A
  wounds: N/A
  other: {}
```

### Weapons

```yaml
weapons:
  - name: Carbine
    range: "18\"/1"
    damage: N/A
    traits:
      - CQB
    carrier: N/A
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6775 front, screenshot 11
      confidence: verified
  - name: Machetes
    range: "2\"/1"
    damage: N/A
    traits:
      - AP (1)
      - Melee
    carrier: N/A
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6775 front, screenshot 11
      confidence: verified
  - name: Pulse Grenades
    range: "6\"/1"
    damage: N/A
    traits:
      - Blast (1)
      - EMP
    carrier: N/A
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6775 front, screenshot 11
      confidence: verified
```

### Specialists / Models

```yaml
specialists: []
```

### Abilities / Special Rules

```yaml
abilities:
  - name: Traits
    text: "Jump (4), Low Tech"
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6775 back, screenshot 12
      confidence: verified
```

---

## Unit Card

### Unit Metadata

| Field | Value |
|---|---|
| Unit Name | Harlow Crickets |
| Unit ID / Card ID | HFR-6776 |
| Parent Force ID | HFR-6770 |
| Faction / Allegiance | the-authority |
| Unit Type | UNKNOWN |
| Role / Class | UNKNOWN |
| Cost / Points | UNKNOWN |
| Model Count | 2 |
| Source Image / Page | screenshots/harlow-1st-reaction/harlow-team2-side1.png and screenshots/harlow-1st-reaction/harlow-team2-side2.png |
| Confidence | verified |

### Unit Stats

```yaml
stats:
  move: "6"
  shoot: "7"
  armor: "1/8"
  hack: N/A
  wounds: N/A
  other: {}
```

### Weapons

```yaml
weapons:
  - name: Self Destruct
    range: "4\"/1"
    damage: N/A
    traits:
      - AP (4)
      - CQB
    carrier: N/A
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6776 front, screenshot 13
      confidence: verified
```

### Specialists / Models

```yaml
specialists: []
```

### Abilities / Special Rules

```yaml
abilities:
  - name: Traits
    text: "AI, Drone"
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6776 back, screenshot 14
      confidence: verified
  - name: Engineer Grouping
    text: "This unit does not count toward the Unit limit when grouped with Harlow engineers, and it cannot benefit from Force Cards."
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6776 back, screenshot 14
      confidence: verified
  - name: Self Destruct
    text: "Remove this model after using this weapon."
    citation:
      source: blkout-unit-cards-screenshots
      location: HFR-6776 front, screenshot 13
      confidence: verified
```

---

## Handler / BLKLIST / Matched Play Data

Only fill this section if the card explicitly provides it. Do not infer.

```yaml
validation:
  handler: UNKNOWN
  blklist_entries: []
  list_building_rules: []
  matched_play_verified: false
```

## Transcription Conventions

```yaml
UNKNOWN: field exists but the value is not known yet
UNREADABLE: text exists but the card or image is illegible
N/A: field does not appear to apply to this card or is absent from current app data
INFERRED: value is inferred, not directly printed
```

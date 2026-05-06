---
transcription_version: 1
game: BLKOUT
source_type: curated_existing_app_data
transcriber: leap-sitrep
date_transcribed: 2026-05-01
confidence: verified
notes: >
  Manual transcription reference generated from the existing curated UN Raid
  Force Alpha data in scripts/etl/build-forces.ts. This is a working
  transcription document for later manual additions, not a fresh image
  extraction.
---

# UN Raid Force Alpha Card Transcription

## Force

### Force Metadata

| Field | Value |
|---|---|
| Force Name | UN Raid Force Alpha |
| Force ID / Card ID | RFA-4390 |
| Faction / Allegiance | the-authority |
| Card Type | Force |
| Source Image / Page | screenshots/un-raidforce-alpha/un-raidforce-alpha-side1.jpg and screenshots/un-raidforce-alpha/un-raidforce-alpha-side2.png |
| Confidence | verified |

### Force Rules / Abilities

```yaml
rules:
  - name: UN Raid Team Alpha
    text: "All UN Raid Team Alpha UTG Assaulter and Specialist Units gain an additional D10 roll in all Skill Checks, including Shooting and Close Quarters Combat (CQC)."
    citation:
      source: blkout-unit-cards-screenshots
      location: UN Raid Force Alpha force back, screenshot 14
      confidence: verified
```

### Battle Drills

```yaml
battle_drills:
  - name: Close Assault
    text: "Models in this Unit may Move 2\" after their Activation ends, only if it would bring them into CQC with an Enemy Model."
    citation:
      source: blkout-unit-cards-screenshots
      location: UN Raid Force Alpha force back, screenshot 14
      confidence: verified
  - name: Cross Fire
    text: "If more than one Model in this Unit Targets the same Enemy Model, their Weapons gain +1 Damage."
    citation:
      source: blkout-unit-cards-screenshots
      location: UN Raid Force Alpha force back, screenshot 14
      confidence: verified
  - name: Switchback
    text: "Place a Smoke Token within 4\" of a Model in this Unit before Activating. All Models may be Moved up to 2\" before Activating."
    citation:
      source: blkout-unit-cards-screenshots
      location: UN Raid Force Alpha force back, screenshot 14
      confidence: verified
```

### Armory / Options

```yaml
armory:
  - name: BOOST JUMP
    type: gear
    cost: UNKNOWN
    restrictions: UNKNOWN
    text: "Model gains Jump (6)"
    citation:
      source: blkout-unit-cards-screenshots
      location: UN Raid Force Alpha force back, screenshot 14
      confidence: verified
  - name: LANCE
    type: weapon
    cost: UNKNOWN
    restrictions: UNKNOWN
    text: "AP (3)"
    weapon:
      name: Lance
      range: "12\"/1"
      damage: N/A
      traits:
        - AP (3)
    citation:
      source: blkout-unit-cards-screenshots
      location: UN Raid Force Alpha force back, screenshot 14
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
      location: UN Raid Force Alpha force back, screenshot 14
      confidence: verified
  - name: SURGE
    type: weapon
    cost: UNKNOWN
    restrictions: UNKNOWN
    text: "EMP Only"
    weapon:
      name: Surge
      range: "16\"/2"
      damage: N/A
      traits:
        - EMP Only
    citation:
      source: blkout-unit-cards-screenshots
      location: UN Raid Force Alpha force back, screenshot 14
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
| Unit Name | UN UTG Assaulters |
| Unit ID / Card ID | RFA-4391 |
| Parent Force ID | RFA-4390 |
| Faction / Allegiance | the-authority |
| Unit Type | UNKNOWN |
| Role / Class | UNKNOWN |
| Cost / Points | UNKNOWN |
| Grunts | 1 |
| Source Image / Page | screenshots/un-raidforce-alpha/un-raidforce-alpha-side1.jpg and screenshots/un-raidforce-alpha/un-raidforce-alpha-side2.png |
| Confidence | verified |

### Unit Stats

```yaml
stats:
  move: "6"
  skill: "5"
  armor: "1/5"
  damage-track: 1
```

### Weapons

```yaml
weapons:
  - name: M7 Carbine
    range: "18\"/1"
    damage: N/A
    traits:
      - CQB
    carrier: N/A
    citation:
      source: blkout-unit-cards-screenshots
      location: RFA-4391 front, screenshot 15
      confidence: verified
  - name: Grenade Launcher
    range: "24\"/2"
    damage: N/A
    traits:
      - Blast (1)
    carrier: N/A
    citation:
      source: blkout-unit-cards-screenshots
      location: RFA-4391 back, screenshot 16
      confidence: verified
```

### Specialists / Models

```yaml
specialists:
  - slot: 1
    name: Grenadier
    description: "Grenade Launcher | 24\"/2 Blast (1)"
    weapon: Grenade Launcher
    citation:
      source: blkout-unit-cards-screenshots
      location: RFA-4391 back, screenshot 16
      confidence: verified
```

### Abilities / Special Rules

```yaml
abilities:
  - name: Traits
    text: "Jump(4)"
    citation:
      source: blkout-unit-cards-screenshots
      location: RFA-4391 back, screenshot 16
      confidence: verified
```

---

## Unit Card

### Unit Metadata

| Field | Value |
|---|---|
| Unit Name | UN UTG Specialists |
| Unit ID / Card ID | RFA-4392 |
| Parent Force ID | RFA-4390 |
| Faction / Allegiance | the-authority |
| Unit Type | UNKNOWN |
| Role / Class | UNKNOWN |
| Cost / Points | UNKNOWN |
| Grunts | 1 |
| Source Image / Page | screenshots/un-raidforce-alpha/un-raidforce-alpha-side1.jpg and screenshots/un-raidforce-alpha/un-raidforce-alpha-side2.png |
| Confidence | verified |

### Unit Stats

```yaml
stats:
  move: "6"
  skill: "5"
  armor: "1/5"
  damage-track: 1
```

### Weapons

```yaml
weapons:
  - name: M7 Carbine
    range: "18\"/1"
    damage: N/A
    traits:
      - CQB
    carrier: N/A
    citation:
      source: blkout-unit-cards-screenshots
      location: RFA-4392 front, screenshot 17
      confidence: verified
  - name: Anti-Material Rifle
    range: "32\"/2"
    damage: N/A
    traits:
      - AP (2)
      - Deployed
    carrier: N/A
    citation:
      source: blkout-unit-cards-screenshots
      location: RFA-4392 back, screenshot 18
      confidence: verified
```

### Specialists / Models

```yaml
specialists:
  - slot: 1
    name: Marksman
    description: "Anti-Material Rifle | 32\"/2 AP (2), Deployed"
    weapon: Anti-Material Rifle
    citation:
      source: blkout-unit-cards-screenshots
      location: RFA-4392 back, screenshot 18
      confidence: verified
```

### Abilities / Special Rules

```yaml
abilities:
  - name: Traits
    text: "Jump(4)"
    citation:
      source: blkout-unit-cards-screenshots
      location: RFA-4392 back, screenshot 18
      confidence: verified
```

---

## Unit Card

### Unit Metadata

| Field | Value |
|---|---|
| Unit Name | Golem Unit |
| Unit ID / Card ID | RFA-4393 |
| Parent Force ID | RFA-4390 |
| Faction / Allegiance | the-authority |
| Unit Type | UNKNOWN |
| Role / Class | UNKNOWN |
| Cost / Points | UNKNOWN |
| Grunts | 1 |
| Source Image / Page | screenshots/un-raidforce-alpha/un-raidforce-alpha-side1.jpg and screenshots/un-raidforce-alpha/un-raidforce-alpha-side2.png |
| Confidence | verified |

### Unit Stats

```yaml
stats:
  move: "4"
  skill: "5"
  armor: "3/5"
  damage-track: 1
```

### Weapons

```yaml
weapons:
  - name: FPR Auto
    range: "24\"/1"
    damage: N/A
    traits:
      - Sustained (1)
    carrier: N/A
    citation:
      source: blkout-unit-cards-screenshots
      location: RFA-4393 front, screenshot 19
      confidence: verified
  - name: Scorcher
    range: "18\"/2"
    damage: N/A
    traits:
      - Seeking
    carrier: N/A
    citation:
      source: blkout-unit-cards-screenshots
      location: RFA-4393 back, screenshot 20
      confidence: verified
```

### Specialists / Models

```yaml
specialists:
  - slot: 1
    name: Fire Support
    description: "Scorcher | 18\"/2 Seeking"
    weapon: Scorcher
    citation:
      source: blkout-unit-cards-screenshots
      location: RFA-4393 back, screenshot 20
      confidence: verified
```

### Abilities / Special Rules

```yaml
abilities:
  - name: Traits
    text: "Jump(4)"
    citation:
      source: blkout-unit-cards-screenshots
      location: RFA-4393 back, screenshot 20
      confidence: verified
```

---

## Transcription Conventions

```yaml
UNKNOWN: field exists but the value is not known yet
UNREADABLE: text exists but the card or image is illegible
N/A: field does not appear to apply to this card or is absent from current app data
INFERRED: value is inferred, not directly printed
```

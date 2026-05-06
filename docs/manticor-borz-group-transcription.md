# Manticor Borz Group Force Card Transcription

## Force

### Force Metadata

| Field | Value |
|---|---|
| Force Name | Manticor Borz Group Force |
| Force ID / Card ID | MBG-120 |
| Faction / Allegiance | chimera |
| Card Type | Force |
| Source Image / Page | manual-input |
| Confidence | verified |

### Force Rules / Abilities

```yaml
rules:
  - name: Manticor Borz Group Force
    text: "Manticor Borz Group Models ignore the first point of Damage suffered from a Blast Weapon"
    citation:
      source: manual-input
      location: manual-input
      confidence: verified
```

### Battle Drills

```yaml
battle_drills:
  - name: Linked
    text: "When a Model in this Unit makes the Ready Action, one Model in the Unit that has already made an Action may gain a Ready Token instead of the Model making the Action"
    citation:
      source: manual-input
      location: manual-input
      confidence: verified
  - name: Targeting Smoke
    text: "Place a Smoke Token within 6\" of a Model in this Unit. This Unit will ignore the effects of the Smoke Token during their Activation. Enemy Units will treat the Smoke Token as normal."
    citation:
      source: manual-input
      location: manual-input
      confidence: verified
  - name: Thorax Shields
    text: "Models in this Unit gain +1D10 for Armour Checks during this Activation"
    citation:
      source: manual-input
      location: manual-input
      confidence: verified
```

### Armory / Options

```yaml
armory:
  - name: AIR BURST RIFLE
    type: weapon
    cost: UNKNOWN
    restrictions: UNKNOWN
    text: "Seeking"
    weapon:
      name: Air Burst Rifle
      range: "24\""
      damage: "1"
      traits:
        - Seeking
    citation:
      source: manual-input
      location: manual-input
      confidence: verified
  - name: RPG33
    type: weapon
    cost: UNKNOWN
    restrictions: UNKNOWN
    text: "Blast (1)"
    weapon:
      name: RPG33
      range: "16\""
      damage: 4
      traits:
        - Blast (1)
    citation:
      source: manual-input
      location: manual-input
      confidence: verified
  - name: STRIP GRENADES
    type: weapon
    cost: UNKNOWN
    restrictions: UNKNOWN
    text: "Blast (2)"
    weapon:
      name: Strip Grenades
      range: "6\""
      damage: 2
      traits:
        - Blast (2)
    citation:
      source: manual-input
      location: manual-input
      confidence: verified
  - name: Thermite Launcher
    type: weapon
    cost: UNKNOWN
    restrictions: UNKNOWN
    text: "1 Shot only, Sustained (6)"
    weapon:
      name: Thermite Launcher
      range: "8\""
      damage: 1
      traits:
        - 1 Shot only
        - Sustained (6)
    citation:
      source: manual-input
      location: manual-input
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
| Unit Name | Manticor Bratva Team |
| Unit ID / Card ID | MBG-122 |
| Parent Force ID | MBG-120 |
| Faction / Allegiance | chimera |
| Unit Type | UNKNOWN |
| Role / Class | UNKNOWN |
| Cost / Points | UNKNOWN |
| Grunts | 2 |
| Source Image / Page | Manual Input|
| Confidence | verified |

### Unit Stats

```yaml
stats:
  move: "4"
  skill: "6"
  armor: "1/4"
  damage-track: 1
```

### Weapons

```yaml
weapons:
  - name: AKMZ-2
    range: "24\""
    damage: 1
    traits:
      - Medium
    carrier: N/A
    citation:
      source: manual-input
      location: manual-input
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
      source: manual-input
      location: manual-input
      confidence: verified
  - slot: 2
    name: HMG
    description: "Shield, HMG | 4-24\"/2 Sustained (2), Deployed"
    weapon: HMG
    citation:
      source: manual-input
      location: manual-input
      confidence: verified
```

### Abilities / Special Rules

```yaml
abilities:
  - name: Shield
    text: "Shield"
    citation:
      source: manual-input
      location: manual-input
      confidence: verified
  - name: ""
    text: "If at least two Models from this Unit are on the Table, you may roll an additional D10 for Initiative. Use the highest result rolled."
    citation:
      source: manual-input
      location: manual-input
      confidence: verified
```

---

## Unit Card

### Unit Metadata

| Field | Value |
|---|---|
| Unit Name | Manticor Cyka Team |
| Unit ID / Card ID | MBG-123 |
| Parent Force ID | MBG-120 |
| Faction / Allegiance | chimera |
| Unit Type | UNKNOWN |
| Role / Class | UNKNOWN |
| Cost / Points | UNKNOWN |
| Grunts | 2 |
| Source Image / Page | Manual Input|
| Confidence | verified |

### Unit Stats

```yaml
stats:
  move: "4"
  skill: "6"
  armor: "2/4"
  damage-track: 2
```

### Weapons

```yaml
weapons:
  - name: SYY-1
    range: "24\""
    damage: 1
    traits:
      - Cyclic
      - Heavy
    carrier: N/A
    citation:
      source: manual-input
      location: manual-input
      confidence: verified
  - name: Grenade Launcher
    range: "24\"/2"
    damage: N/A
    traits:
      - Blast (1)
    carrier: N/A
    citation:
      source: manual-input
      location: manual-input
      confidence: verified
```

### Specialists / Models

```yaml
specialists: []
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
| Unit Name | Manticor Insertion Team |
| Unit ID / Card ID | MBG-121 |
| Parent Force ID | MBG-120 |
| Faction / Allegiance | chimera |
| Unit Type | UNKNOWN |
| Role / Class | UNKNOWN |
| Cost / Points | UNKNOWN |
| Grunts | 2 |
| Source Image / Page | Manual Input|
| Confidence | verified |

### Unit Stats

```yaml
stats:
  move: "4"
  skill: "6"
  armor: "1/4"
  damage-track: 1
```

### Weapons

```yaml
weapons:
  - name: AKMZ-2
    range: "24\""
    damage: 1
    traits:
      - Medium
    carrier: N/A
    citation:
      source: manual-input
      location: manual-input
      confidence: verified
```

### Specialists / Models

```yaml
specialists:
  - slot: 1
    name: Machine Gunner
    description: "SYY-1 | 24\"/1 Cyclic, Heavy"
    weapon: SYY-1
    citation:
      source: manual-input
      location: manual-input
      confidence: verified
  - slot: 2
    name: Sidewinder
    description: "Sidewinder (2 uses) | Check one of these boxes to allow this Model to use its Action to make a Skill Check. If it passes, you may give a Unit with a Model within 12\" of this Model a Pinned Marker."
    weapon: N/A
    citation:
      source: manual-input
      location: manual-input
      confidence: verified
```

### Abilities / Special Rules

```yaml
abilities: []
```

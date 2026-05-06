# LEAP Sitrep Implementation Plan

## Product Goal

Build `LEAP Sitrep`, a local-first BLKOUT companion application that serves as the main player hub for:

- lore and faction reference
- rules and scenario reference
- group and roster building
- table-side game state management

The app should prioritize source accuracy, fast lookup, mobile usability, and clear citations back to the official material. It should help players make decisions, not invent rulings.

## What The Source Material Supports

The provided material is enough to plan a strong first version of the app, but each source should be treated differently.

| Source | Primary Use | Notes |
| --- | --- | --- |
| `markdown/BLKOUT-Year-Two-Lore-Primer.md` | lore, timeline, factions, world guide | Best source for narrative content and setting structure |
| `markdown/BLKOUT-PRINT-AT-HOME-RULEBOOK.md` | core rules, core scenarios, quick rules | Best source for structured core rules because it already exists as markdown |
| `markdown/BLKOUT_Supplemental_4-26.md` | matched play, FAQ, errata, clarifications, USRs | Must override conflicting core text when applicable |
| `markdown/Unit-Cards-Printable-2026.md` | force cards, unit cards, specialists, duster cards, burn cards | OCR is noisy and mirrored in places, so this needs manual verification before becoming canonical data |
| `markdown/BLKOUT-Quick-Ref-PAH.md` | none yet | Markdown export is effectively empty |
| `source-pdfs/BLKOUT-Quick-Ref-PAH.pdf` | visual QA source | Use as a verification source, not as the primary parse input |
| `source-pdfs/BLKOUT-DIGITAL-RULE-BOOK.pdf` | validation source | Sample extraction appears to match the print second edition material already present in markdown |

## Source Of Truth And Rule Precedence

The app needs an explicit precedence model so users can trust the displayed rule text.

1. Official supplemental rulings and verified supporting documents.
2. Mode-specific overlays, especially matched play rules.
3. Unit card and force card text for force-specific rules.
4. Core rulebook baseline text.
5. Quick reference summaries only when they have been manually verified as an intentional latest ruling.

If two sources cannot be reconciled automatically, the app should show both citations and flag the rule as needing manual confirmation instead of silently picking one.

## Product Pillars

### 1. Lore And Factions Overview

Players should be able to understand the world of ABOL without digging through long PDFs.

This area should cover:

- timeline from discovery of ABOL through the start of BLKOUT
- political history and colonization
- life on ABOL, settlements, geography, climate, flora, and fauna
- faction pages for groups like the Authority, Headless, Chimera, Manticor, Banak, ORK, and related forces
- clear distinction between lore factions and playable tabletop forces

### 2. Rules Reference

Players should be able to answer practical questions quickly at the table.

This area should cover:

- core rules
- matched play rules
- FAQs and errata
- universal special rules
- scenarios and setup instructions
- force rules, battle drills, armory items, and unit-linked rules
- cross-links between rules, scenarios, units, and glossary terms

### 3. List Builder

BLKOUT is not a traditional points-first army builder based on the provided material. The builder should focus on legal composition and useful output.

This area should cover:

- core group construction
- matched play group construction
- force and unit selection
- handler selection
- optional BLKLIST replacement rules
- optional duster rules and their control point tradeoff
- save, duplicate, export, and print-friendly roster summaries

### 4. Game State Manager

This should be a rules-aware tracker, not a full physics simulator.

This area should cover:

- round flow
- initiative and control points
- activation markers
- ready and engaged tokens
- pinned markers
- smoke, blast, hardpoint, and point-of-interest tracking
- unit damage and destroyed state
- scenario scoring
- quick jump from tracked state into the relevant rules or unit card data

## Core Product Principles

- Local-first by default. The app should work without requiring a backend for core use.
- Mobile-first for table use. Desktop should still be excellent for reading and planning.
- Citation-heavy. Every important rule or data point should have a visible source reference.
- Explicit about uncertainty. If a rule depends on terrain agreement or manual judgment, the UI should say so.
- No invented points, stats, handlers, or missing units.
- Structured data first, UI second.
- Keep the first release practical rather than trying to fully automate tabletop geometry.

## Recommended Tech Decisions

Use the stack defined in `tech-stack.md` directly rather than introducing a second architecture.

### Frontend

- React 19 with TypeScript 6 and Vite 8
- React Router DOM 7 for route-driven information architecture
- shadcn/ui plus Radix foundations for UI primitives
- Tailwind CSS v4 for layout and theme tokens
- Lucide React for iconography
- `cmdk` for global search and quick jump
- `@tanstack/react-table` for unit, rules, and glossary tables
- Recharts only where it adds clear value, such as a lore timeline or faction relationship views

### Persistence

- `localStorage` for saved rosters, recent searches, app preferences, and active game state
- no backend requirement in MVP
- keep auth and sync out of scope until shared lists or multiplayer state are real requirements

### Build-Time Data Pipeline

- Bun scripts in `scripts/` should transform the markdown sources into structured JSON
- generated data should live under `public/data/`
- the app should consume generated JSON, not parse raw markdown or PDFs at runtime

### Theming

- use the documented theme provider model from `tech-stack.md`
- add a BLKOUT-specific visual layer inside that system rather than creating a separate theming mechanism
- target a readable tactical dossier aesthetic rather than a generic dashboard

## Information Architecture

Recommended top-level routes:

| Route | Purpose |
| --- | --- |
| `/` | home hub, recent rosters, active matches, featured lore and rules |
| `/lore` | entry page for timeline, world, factions, settlements, flora, fauna |
| `/lore/timeline` | interactive chronology of ABOL and major wars |
| `/lore/factions/:slug` | lore faction detail pages |
| `/forces` | playable force browser |
| `/forces/:forceId` | force card details, battle drills, armory, units |
| `/units/:unitId` | unit detail page with effective rules and citations |
| `/rules` | rules landing page with mode filters |
| `/rules/core` | core rulebook browser |
| `/rules/matched-play` | matched play rules and overlays |
| `/rules/usr/:slug` | universal special rule detail pages |
| `/scenarios` | scenario list and filters |
| `/scenarios/:scenarioId` | scenario detail, setup, scoring, special rules |
| `/builder` | roster and group builder |
| `/matches` | saved games and start-new-game flow |
| `/matches/:matchId` | live game state manager |
| `/glossary` | acronyms and keyword index |

Global app features should include:

- command palette search across rules, units, factions, scenarios, and saved data
- visible source badges and last-updated metadata
- recent items and favorites
- mobile bottom navigation for table use

## Domain Model

The app should separate narrative entities from tabletop entities.

### Narrative Entities

- `LoreEvent`: year, title, summary, involved factions, source references
- `LoreFaction`: name, summary, relationships, ideology, regions, related forces, source references
- `LoreLocation`: name, region, description, related events, source references
- `LoreSpecies`: flora or fauna entry with habitat and description
- `GlossaryTerm`: acronym or keyword, meaning, related rules, related factions

### Tabletop Entities

- `SourceDocument`: file, version, type, precedence, extracted date
- `RuleSection`: section id, title, body, category, mode, source references
- `FaqEntry`: question, answer, topic, source references
- `ErrataEntry`: target, old text summary, new text summary, source references
- `UniversalSpecialRule`: name, current text, aliases, related rules, source references
- `Force`: force id, force name, faction, battle drills, rules, armory, notes, source references
- `UnitCard`: unit id, force id, name, faction, unit type, role, cost, grunts, stats, specialists, weapons, abilities, notes, source references
- `WeaponProfile`: range, damage, traits, carrier, firing mode notes, source references
- `Scenario`: scenario id, mode, setup, scoring rules, special rules, table size, hardpoints, points of interest, source references

### Player-State Entities

- `Roster`: saved build, mode, selected force, units, handler, notes, created date
- `Match`: players, selected scenario, rosters, round, initiative history, score, active markers, saved timestamp
- `UnitState`: destroyed state, damage marks, activation status, pinned state, smoke relation, notes
- `TokenState`: smoke, blast, hardpoint secured, point-of-interest secured, burn cards used

## Important Domain Distinctions

These distinctions should exist in the data model and UI.

- A lore faction is not always the same thing as a playable force.
- A playable force is not the same thing as a unit card.
- A unit is not the same thing as an individual model within the unit.
- A BLKOUT group is not the same thing as a traditional points-based army list.
- A game-state manager is not the same thing as an automated rules engine.

Examples from the source material:

- The Authority is a lore faction umbrella.
- Harlow 1st Reaction Force, UN Raid Force Alpha, and UN 3rd Battalion are playable forces aligned with that umbrella.
- A `Harlow Control Team` is a unit card within a force.
- A grunt and specialist are models inside that unit card.

## Data Ingestion Strategy

### 1. Parse Clean Markdown Sources First

Use the lore primer, rulebook markdown, and supplemental markdown as the first-class ETL inputs.

These are already structured enough to extract:

- section trees
- scenario blocks
- FAQ entries
- errata entries
- universal special rules
- lore timeline events
- faction and worldbuilding sections

### 2. Treat Unit Cards As Curated Data

Do not trust the OCR output from `Unit-Cards-Printable-2026.md` as canonical without review.

Recommended approach:

- keep the OCR text as a raw source for auditability
- create curated JSON or TS data files for forces and unit cards
- verify every curated card against the PDF before marking it complete
- use printed card codes like `HFR-6771`, `MBG-123`, and `RFA-4390` as canonical ids where available

This is the most important content-quality risk in the project.

### 3. Build An Effective Rules Layer

The app should not only store source text. It should also generate effective rules.

For example:

- a core rule may be clarified by the supplemental FAQ
- a force rule may be replaced by an errata entry
- a matched play rule may override a core terrain or smoke behavior

The generated data model should preserve:

- original source text
- effective displayed text
- why the effective text changed
- every source citation involved in the merge

### 4. Version The Dataset

The app should expose the version of each source set so future updates do not become invisible.

Minimum metadata:

- document title
- source filename
- edition or date if known
- generated timestamp
- confidence level for manually curated content

## Rules Reference Plan

The rules area should be built around practical player questions.

### Browsing Structure

Support filtering by:

- mode: core, matched play, effective latest
- category: movement, combat, reactions, data attacks, vehicles, dusters, terrain, smoke, scenarios, FAQ, errata
- source: rulebook, supplemental, unit card, quick ref
- linked entities: force, unit, keyword, scenario

### Rule Detail Page Requirements

Each rule detail page should show:

- current effective text
- source citations
- linked FAQ and errata
- related universal special rules
- related units, scenarios, or force rules
- any manual-judgment note when the rule depends on table agreement

### Search Requirements

Search should understand:

- acronyms like `CQC`, `UTG`, `AI`, `AP`, `EMP`
- alternate phrasing like `close quarters combat` and `return fire`
- scenario names
- force names and card codes

`cmdk` is a strong fit for this because BLKOUT players will often need one-step lookup during play.

## Lore And World Guide Plan

The lore area should be organized as a world guide rather than a single long article.

Recommended sections:

- timeline
- discovery of ABOL
- colonization and descent into martial law
- life on ABOL
- settlements and frontier life
- flora and fauna
- warfare on ABOL
- faction index

Recommended UX features:

- clickable timeline filtered by faction or era
- faction relationship sidebars
- cross-links from lore factions into playable force pages
- glossary links for terms like ABOL, LEAP, SSSA, UTG, Killwager, Dusters, and Abolite

Use Recharts for a timeline only if it clearly improves navigation over a simple scrollable chronology.

## Builder Plan

The builder should reflect BLKOUT's actual structure instead of forcing a generic wargame army-builder model.

### Core Play Builder

The builder should support game-size selection by number of groups.

- 1 group
- 2 groups
- 3 groups

Each group should be built from:

- 1 force card
- 3 unit cards from that force

### Matched Play Builder

The builder should support the supplemental matched play structure.

Per the provided source, a matched play group consists of:

- 1 handler
- 1 force card
- 3 different units from the chosen force
- optional replacement of 1 force unit with a BLKLIST unit

The builder should validate at least:

- unit uniqueness in matched play
- handler restrictions
- BLKLIST replacement count
- force-specific access to battle drills, armory, and force rules
- duster replacement logic and control point tradeoffs

### Builder Output

Each saved roster should include:

- selected force and units
- battle drills
- force rule
- armory options
- specialist breakdown
- effective rules notes from errata or FAQ
- print and PDF export for table use

Use `html2canvas` and `jspdf` only after the roster layout is stable.

### Known Data Gaps To Handle Explicitly

The supplement references handlers and BLKLIST units that may need confirmation against the full unit card source set.

If complete card data is not yet available, the builder should:

- allow clearly marked placeholder entries only when their existence is confirmed by the source text
- never invent missing stats or weapon profiles
- surface a `data incomplete` warning in the UI

## Game State Manager Plan

The game state manager should be phased.

### V1: Practical Table Tracker

This version should track:

- players and rosters
- scenario selection
- round number
- initiative rolls and control point spending
- activation order
- ready, engaged, and pinned state
- damage and destroyed state
- smoke and blast markers
- hardpoints and points of interest
- scenario scoring and win-condition checks

This version should not attempt full spatial automation.

### V2: Scenario-Aware Workflow

This version should add:

- setup wizard based on scenario data
- scenario-specific score logic
- matched play quadrant scoring support
- helper panels for special rules like Dome Shields, Scrambling, Drone Swarms, and Come With Me
- roster import from the builder

### V3: Optional Spatial Assistance

Only after the tracker is stable should the project consider:

- abstract board zones or quadrants
- optional note-based terrain map
- unit placement helpers

Do not start with full line-of-sight automation. The rule set repeatedly depends on terrain discussion and opponent agreement, which makes complete automation fragile and misleading.

## Scenario Support Plan

Initial scenario data should cover both core and matched play content.

### Core Scenarios Identified In The Rulebook

- Dockyard Assault
- Server Defense
- HVT Evac
- Zero Day

### Matched Play Scenario Structure Identified In The Supplemental

The supplemental introduces a standardized matched play setup built around:

- table size
- hardpoints
- quadrant control
- unit destruction scoring
- optional special rule packages such as Dome Shields, Scrambling, and Drone Swarms

Scenario data should be normalized so each scenario can define:

- setup steps
- deployment logic
- scoring events
- special rules
- tie and win conditions
- scenario flavor text

## Recommended Repo Structure

This structure aligns with the stack notes in `tech-stack.md`.

```text
src/
  app/
  components/
  features/
    lore/
    rules/
    builder/
    match/
    search/
  lib/
    data/
    rules/
    persistence/
    citations/
public/
  data/
    lore/
    rules/
    forces/
    scenarios/
    search/
scripts/
  etl/
    build-lore.ts
    build-rules.ts
    build-supplemental.ts
    build-forces.ts
    build-search-index.ts
```

Keep the raw source markdown files as inputs, not runtime dependencies.

## Recommended Delivery Strategy

Build the app as a sequence of narrow, testable slices.

### Phase 0: Foundation And Contracts

Deliver:

- app shell
- route skeleton
- theme integration
- shared types for sources, rules, forces, units, scenarios, and match state
- sample generated JSON contracts

Done when:

- the app runs with placeholder data
- route structure is stable
- core types compile cleanly

### Phase 1: Canonical Data Pipeline

Deliver:

- lore ETL from the lore primer
- rule ETL from the print-at-home rulebook
- supplemental ETL for matched play, FAQ, errata, and USRs
- manual curation format for unit cards
- generated search index

Done when:

- generated datasets exist in `public/data/`
- citations are preserved
- at least one force and several units are fully verified against source material

### Phase 2: Read-Only Reference Experience

Deliver:

- home hub
- lore pages
- force browser
- unit pages
- rules browser
- scenario pages
- glossary
- command palette search

Done when:

- a user can answer common questions without opening PDFs
- rule pages show effective text plus citations
- mobile browsing is comfortable

### Phase 3: Builder

Deliver:

- core builder flow
- matched play builder flow
- validation engine
- save and load rosters
- exportable roster summary

Done when:

- legal and illegal rosters are clearly differentiated
- saved rosters round-trip correctly
- roster exports are readable on phone and desktop

### Phase 4: Game State Manager

Deliver:

- new-match wizard
- roster import into match
- round and activation tracking
- score tracking
- token and damage state management
- scenario-specific helpers

Done when:

- a full game can be tracked in the app without handwritten notes
- the user can always jump from state to the relevant rule text

### Phase 5: Polish And Expansion

Deliver:

- full card catalog coverage
- duster support polish
- burn card tracker if desired
- accessibility pass
- performance pass
- optional auth and sync planning for later work

Done when:

- the app is complete enough to replace PDF hunting during play
- all major provided content has a stable home in the app

## Best First Vertical Slice

Before trying to encode every card, build one complete end-to-end slice.

Recommended slice:

- lore: Authority overview plus timeline page
- rules: movement, shooting, reactions, smoke, control points, data attacks
- force: Harlow 1st Reaction Force
- units: Harlow Control Team, Harlow Assault Team, Harlow Springbok AI
- scenario: Dockyard Assault
- tracker: round flow, activations, smoke, overrun points

This slice proves the whole architecture with manageable scope.

## Testing And Quality Plan

Use the existing quality stack directly.

### Automated Tests

- Vitest unit tests for ETL parsers and merge logic
- unit tests for builder validation rules
- reducer tests for match-state changes and scenario scoring
- component tests with Testing Library for search, builder flows, and match interactions

### Data Validation Tests

- snapshot or fixture tests for parsed sections
- golden tests for known rules that changed via errata
- verification tests for one or more fully curated unit cards per force

### Manual QA

- compare generated unit data against the unit card PDF
- verify one scenario setup step-by-step against the rulebook
- verify one matched play group against the supplemental example
- verify acronyms and aliases in search results

## Risks And Mitigations

### Risk: Noisy Unit Card OCR

Mitigation:

- treat cards as curated data
- verify against the PDF
- store confidence and source references

### Risk: Conflicting Rules Across Documents

Mitigation:

- implement explicit precedence
- keep original and effective text side by side
- flag unresolved conflicts instead of hiding them

### Risk: Over-Automating Tabletop Judgment

Mitigation:

- keep geometry and line-of-sight decisions manual in MVP
- use helper prompts, not false certainty

### Risk: Scope Creep

Mitigation:

- ship the vertical slice first
- prioritize reference and tracking value before advanced visualization

### Risk: Future Official Updates

Mitigation:

- version generated datasets
- use stable ids from section numbers and card codes
- separate raw source ingestion from UI rendering

## LLM Execution Guidelines

This project is very suitable for LLM-assisted implementation, but only if the work is sliced correctly.

### Rules For The LLM

- Do not generate the whole app in one prompt.
- Do not trust OCR card data without verification.
- Do not hardcode errata inside components.
- Do not build UI directly against raw markdown strings.
- Do build typed structured data first.
- Do preserve citations everywhere.
- Do finish one vertical slice before broad expansion.

### Recommended LLM Work Packet Order

1. Create the app shell, router, and shared domain types.
2. Build ETL scripts for lore, core rules, and supplemental rules.
3. Create the generated JSON format and search index.
4. Hand-curate one force and a few units from the unit cards.
5. Build the read-only lore, rules, force, and scenario pages.
6. Add command palette search and glossary linking.
7. Implement the roster builder and validation engine.
8. Implement match-state reducers and tracker UI.
9. Expand to the rest of the force catalog.
10. Add export, polish, and optional future sync hooks.

Each work packet should end with:

- updated tests
- clean typecheck
- clean lint pass
- a short manual QA note against the source documents

## Recommended MVP Definition

The MVP should be considered successful when it can do all of the following:

- browse BLKOUT lore and factions cleanly
- answer common rules questions with citations
- build at least one legal roster flow without inventing missing data
- track a full match for at least one scenario
- save progress locally and resume later
- work comfortably on a phone at the table

## Final Recommendation

Build `LEAP Sitrep` as a local-first, citation-driven reference and roster app first, then grow it into a deeper game-state tool.

The most important architectural decision is to create a canonical structured dataset with explicit source precedence before building broad UI. If that layer is solid, the lore viewer, rules browser, builder, and tracker can all share the same trusted foundation.

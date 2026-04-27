# LEAP Sitrep Implementation Workflow

## Purpose

This document tells an LLM how to implement `LEAP Sitrep` as described in `blkout-app.md`.

Use this document for:

- build order
- phase boundaries
- validation gates
- user escalation rules
- review checkpoints

Use `blkout-app.md` for product intent and `tech-stack.md` for stack constraints.

## Primary Execution Rule

Build the smallest complete vertical slice first.

The required priority order is:

1. canonical data and source precedence
2. read-only reference experience
3. builder workflow
4. game state tracker
5. catalog expansion
6. polish and optional future systems

Do not expand broad UI before the data contracts are stable.

Do not expand the full force catalog before one end-to-end slice works.

Do not invent rules, stats, handlers, units, or missing weapon data.

## Non-Negotiable Rules For The LLM

- Follow `tech-stack.md`.
- Prefer Bun, TypeScript, React, Vite, React Router, shadcn/ui, Tailwind, and the stated testing stack.
- Treat `markdown/BLKOUT-Year-Two-Lore-Primer.md`, `markdown/BLKOUT-PRINT-AT-HOME-RULEBOOK.md`, and `markdown/BLKOUT_Supplemental_4-26.md` as primary machine-readable inputs.
- Treat `markdown/Unit-Cards-Printable-2026.md` as OCR assistance, not canonical truth.
- Preserve source citations in every data pipeline and every important rule surface.
- Implement explicit rule precedence.
- Keep the app local-first.
- Keep the MVP mobile-friendly.
- Avoid backend, auth, sync, multiplayer, and spatial automation unless the user explicitly approves them.

## Rule Precedence

When source texts conflict, apply this order unless the user directs otherwise:

1. supplemental rulings and verified support documents
2. mode-specific overlays such as matched play
3. force card and unit card text
4. core rulebook text
5. quick reference summaries only after manual verification

If a conflict cannot be resolved with this model, stop and ask the user.

## Session Start Protocol

At the start of any implementation session:

1. Read `blkout-app.md`, this document, and `tech-stack.md`.
2. Inspect the current codebase and determine the highest fully completed packet.
3. Continue the first incomplete packet.
4. Do not jump to a later packet unless the current one is blocked or the user reprioritizes.
5. Preserve any unrelated changes already present in the worktree.

## Standard Work Packet Loop

For every packet:

1. confirm the packet goal and dependencies
2. implement the smallest complete slice inside that packet
3. run automated validation
4. run a short manual QA check against the source documents
5. summarize evidence that the packet or sub-slice is complete
6. either continue, escalate, or advance to the next packet

## Global Validation Standard

Every packet is incomplete until all relevant validation levels pass.

| Validation Type | Required Evidence |
| --- | --- |
| Build | production build succeeds |
| Type safety | `tsc -b` or equivalent repo typecheck succeeds |
| Lint | ESLint passes without newly introduced errors |
| Tests | packet-specific tests exist and pass |
| Manual QA | a short comparison against the source material is recorded |
| UX sanity | mobile and desktop rendering is checked for touched screens |

If the repository has existing unrelated failures, do not hide them. Report them separately and keep validation focused on whether the new work is correct.

## Canonical Review Checkpoints

These are deliberate places to pass decisions or review back to the user even if the implementation is technically unblocked.

| Checkpoint | When To Trigger It | Purpose |
| --- | --- | --- |
| Review A | after Packet 2 | confirm data contracts, citation model, and rule precedence behavior |
| Review B | after Packet 4 | confirm information architecture and visual direction of the reference experience |
| Review C | after Packet 6 | confirm the real table workflow before broad expansion |
| Review D | before Packet 7 begins in earnest | ask which forces, scenarios, or factions should be prioritized next |
| Review E | before any post-MVP system | confirm whether to pursue sync, auth, multiplayer, or spatial assistance |

## When To Ask The User Immediately

Stop and ask the user when any of these happen:

- a rule conflict cannot be resolved by the precedence model
- OCR or PDF verification leaves a unit, weapon, or rule ambiguous
- a missing datum would have to be invented to proceed
- the implementation would need a new architecture not described in `tech-stack.md`
- the work would require a backend, authentication, sync, or online state
- a major UX or IA choice has two materially different valid directions
- the planned route structure conflicts with an existing codebase in a major way
- a large refactor would invalidate prior approved work
- the only way forward is to use placeholders in a user-visible critical flow

## When Not To Ask The User

Proceed without asking when the choice is local, reversible, and aligned with the plan.

Examples:

- choosing a small component split
- naming an internal helper
- choosing table columns for a rules browser
- implementing obvious responsive behavior
- choosing a minimal folder layout aligned with the route and feature model

## Strongly Preferred First Vertical Slice

This slice should be the first end-to-end proof of the architecture.

- lore: Authority overview and timeline page
- rules: movement, shooting, reactions, smoke, control points, and data attacks
- force: Harlow 1st Reaction Force
- units: Harlow Control Team, Harlow Assault Team, Harlow Springbok AI
- scenario: Dockyard Assault
- tracker: round flow, activations, smoke, and overrun point tracking

Do not replace this slice with a broader but shallower implementation.

## Build Order Summary

| Packet | Name | Main Outcome | Must Be True Before Starting |
| --- | --- | --- | --- |
| 0 | Bootstrap And Contracts | app shell and shared types | nothing |
| 1 | Source Ingestion Foundation | machine-readable source datasets | Packet 0 complete |
| 2 | Effective Rules And Search | merged rules plus search index | Packet 1 complete |
| 3 | Curated First Force Slice | verified Harlow force and seed unit data | Packet 2 complete |
| 4 | Reference UI Vertical Slice | usable lore, rules, force, unit, scenario UI | Packet 3 complete |
| 5 | Core Builder Vertical Slice | legal roster creation for the seed slice | Packet 4 complete |
| 6 | Core Match Tracker Vertical Slice | playable table tracker for the seed slice | Packet 5 complete |
| 7 | Catalog And Matched Play Expansion | broader force coverage and matched play systems | Packet 6 complete and user Review D completed |
| 8 | Polish And Optional Expansion | accessibility, performance, exports, optional future planning | Packet 7 complete |

## Packet 0: Bootstrap And Contracts

### Goal

Create a stable app shell and the base contracts that every later phase depends on.

### Build

- scaffold or align the project to the required stack
- establish the route skeleton
- wire in theming using the documented theme provider pattern
- define shared domain types for sources, lore, rules, forces, units, scenarios, rosters, matches, and token state
- define the generated JSON contract shape that later ETL scripts will emit
- add or confirm core scripts for build, lint, test, and typecheck

### Deliverables

- runnable app shell
- placeholder route screens
- shared type definitions
- source contract definitions
- sample generated data fixtures

### Validation

- app boots locally
- route placeholders render without runtime errors
- build passes
- typecheck passes
- lint passes
- at least one smoke test passes

### Exit Gate

Packet 0 is complete only when later packets can safely target stable types and routes instead of inventing their own shapes.

### Pass To User When

- the existing codebase already uses a conflicting structure
- theming decisions need a strong brand direction beyond the plan
- there are two materially different route models and both are reasonable

## Packet 1: Source Ingestion Foundation

### Goal

Turn the clean markdown sources into structured datasets with citations and version metadata.

### Build

- create a source registry with document metadata
- parse the lore primer into timeline, faction, location, flora, fauna, and glossary-relevant data
- parse the print-at-home rulebook into rule sections and scenario records
- parse the supplemental into matched play rules, FAQ, errata, and universal special rules
- emit structured JSON into `public/data/`
- preserve exact source references for every record
- attach document version metadata and generated timestamps

### Deliverables

- ETL scripts under `scripts/`
- generated lore dataset
- generated core rules dataset
- generated supplemental dataset
- source metadata registry

### Validation

- generated data files exist in `public/data/`
- parser tests cover section extraction and source references
- sample records preserve section ids or source line anchors where possible
- fixture or snapshot tests confirm stable extraction
- manual QA confirms one lore section, one scenario, one FAQ entry, and one USR against the source markdown

### Exit Gate

Packet 1 is complete only when the app can consume generated JSON instead of raw markdown at runtime.

### Pass To User When

- the markdown source structure is too inconsistent to parse safely
- a primary source is missing critical sections
- the digital rulebook appears to materially contradict the markdown-derived rulebook content

## Packet 2: Effective Rules And Search

### Goal

Create the effective rules layer and make the data searchable in a way that supports table use.

### Build

- implement the rule precedence model
- merge core rules with supplemental clarifications and errata into effective display records
- preserve original text and effective text separately
- link FAQ and errata to affected rules
- build aliases and term mapping for common search phrases and acronyms
- generate a search index spanning lore, rules, units, forces, scenarios, and glossary terms

### Deliverables

- effective rules dataset
- FAQ and errata linkage
- search index dataset
- search alias map for key terms like CQC, AI, EMP, AP, UTG, return fire, and close quarters combat

### Validation

- known changed rules produce the expected effective text
- tests confirm precedence behavior for at least one core rule override and one force or scenario-related override
- search returns expected results for acronym and phrase lookups
- manual QA confirms at least three example rules against the source documents and their intended precedence

### Exit Gate

Packet 2 is complete only when a later UI can render current effective text without re-implementing merge logic inside components.

### Pass To User When

- two documents conflict and the precedence model still leaves ambiguity
- a quick reference item appears newer but cannot be verified
- the desired search behavior has competing interpretations that would materially change the UX

## Packet 3: Curated First Force Slice

### Goal

Create the first trusted tabletop force dataset by manually verifying it against the card source.

### Build

- create curated data files for Harlow 1st Reaction Force
- create curated unit records for Harlow Control Team, Harlow Assault Team, and Harlow Springbok AI
- encode card ids, stats, weapons, specialists, battle drills, force rule, and armory options
- record confidence and citation metadata
- keep OCR-derived raw text separate from curated records

### Deliverables

- curated force dataset for Harlow 1st Reaction Force
- curated unit datasets for the three seed units
- confidence and verification metadata
- tests for card ids, weapon structure, and specialist fields

### Validation

- every curated field is manually checked against the unit card source
- ids match the printed card identifiers where available
- tests confirm dataset shape and required fields
- manual QA records the source used for each curated card

### Exit Gate

Packet 3 is complete only when the first force slice is trusted enough to build UI and workflows on top of it.

### Pass To User When

- any unit stat, weapon profile, or special rule remains unreadable or ambiguous after verification
- the force card and unit card sources disagree in a way that affects gameplay
- a needed card is missing entirely from the available sources

## Packet 4: Reference UI Vertical Slice

### Goal

Build the first user-facing reference experience around the seed slice.

### Build

- implement the home hub
- implement lore pages for the Authority overview and the timeline
- implement rules pages for movement, shooting, reactions, smoke, control points, and data attacks
- implement the Harlow force page
- implement the three seed unit pages
- implement the Dockyard Assault scenario page
- expose source citations and related links throughout
- add command palette search and glossary linking for the seed slice

### Deliverables

- working reference UI for lore, rules, forces, units, and scenario content
- source-aware rule detail pages
- initial command palette search
- mobile-friendly navigation for the seed slice

### Validation

- a user can answer common questions from the app without opening the PDFs for the seed slice
- rule pages show effective text and citations
- search finds Authority, Harlow, smoke, return fire, and Dockyard Assault
- component tests cover core navigation and search interactions
- manual QA checks mobile rendering for touched screens

### Exit Gate

Packet 4 is complete only when the first slice feels like a usable reference product rather than a data demo.

### Pass To User When

- Review B should occur here
- the reference experience has two materially different navigation or presentation directions
- the visual style needs stronger brand preference input

## Packet 5: Core Builder Vertical Slice

### Goal

Allow the user to build and save a legal core-play roster for the seed slice.

### Build

- implement a core group builder for the first verified force slice
- support force selection, unit selection, and legality checks based on the core group model
- persist saved rosters locally
- allow roster duplication and deletion
- render a readable roster summary
- prepare export support only if the roster layout is already stable

### Deliverables

- functioning core builder flow
- validation messages for legal and illegal states
- local roster persistence
- roster summary screen

### Validation

- valid and invalid group states are clearly differentiated
- saved rosters round-trip from storage without data loss
- builder validation tests cover the core group structure
- manual QA verifies one legal Harlow roster against the plan assumptions

### Exit Gate

Packet 5 is complete only when the app can create, save, reload, and explain one legal roster flow without inventing unsupported data.

### Pass To User When

- a builder feature would require incomplete card data
- export format choices would materially affect later UX
- placeholder data would need to appear in a critical user flow

## Packet 6: Core Match Tracker Vertical Slice

### Goal

Turn the seed slice into a workable table-side tracker.

### Build

- implement a new-match flow using the saved roster and Dockyard Assault scenario
- track round flow and initiative
- track activations, ready tokens, engaged tokens, pinned markers, smoke, and destroyed state
- track overrun points and scenario progress
- provide jumps from tracker state back to the relevant rules or unit records
- keep the tracker rules-aware but not spatially automated

### Deliverables

- working match setup flow
- live match tracker for the seed slice
- persistent match state
- scenario scoring helpers for Dockyard Assault

### Validation

- one full mock game can be tracked without handwritten notes for the supported slice
- state reducer or store tests cover round progression, activation state, token changes, and score changes
- manual QA walks through a full scenario flow from setup to scoring
- mobile rendering is usable during active play

### Exit Gate

Packet 6 is complete only when the seed slice supports a full reference-to-builder-to-match workflow.

### Pass To User When

- Review C should occur here
- the desired level of automation goes beyond a tracker and starts becoming a simulation
- scenario flow exposes missing assumptions that were not in the source material

## Packet 7: Catalog And Matched Play Expansion

### Goal

Expand beyond the seed slice while keeping the same source quality bar.

### Build

- expand lore coverage beyond the seed slice
- expand force and unit coverage one verified force at a time
- add more core scenarios
- add matched play rules, matched play scenario support, and matched play builder validation
- add handler and BLKLIST support only when the underlying data is verified
- add duster support only when the related unit and rule data is verified

### Deliverables

- broader catalog coverage
- matched play builder flow
- matched play scenario helpers
- verified additional force datasets

### Validation

- every added force has explicit verification status
- matched play example builds validate against the supplemental structure
- scenario scoring tests cover matched play logic where implemented
- manual QA confirms one matched play group against the supplemental example

### Exit Gate

Packet 7 is complete only when the app supports broader real usage without lowering the trustworthiness of the data.

### Pass To User When

- Review D should occur before broad expansion begins
- the user needs to prioritize which factions, forces, or scenarios come next
- handlers, BLKLIST units, or dusters remain under-specified and would otherwise be guessed

## Packet 8: Polish And Optional Expansion

### Goal

Improve completeness, usability, and quality without destabilizing the trusted core.

### Build

- finish remaining catalog gaps
- polish duster support if already verified
- add burn card tracking only if it fits the product priorities
- improve accessibility
- improve performance
- improve exports and print layouts
- plan future optional systems without implementing them unless approved

### Deliverables

- accessibility fixes
- performance improvements
- polished exports
- completion pass across content and workflows

### Validation

- accessibility checks pass for key flows
- performance is acceptable on mobile-sized devices
- exports remain readable and stable
- regression tests continue to pass

### Exit Gate

Packet 8 is complete only when the app is good enough to replace PDF hunting during normal use.

### Pass To User When

- Review E should occur before any auth, sync, multiplayer, or spatial-assistance work
- optional features compete with source-completeness work and need prioritization

## Explicit Defer List

The following should not be implemented before the earlier packets are complete and the user approves the expansion where necessary:

- backend APIs
- authentication
- shared cloud sync
- multiplayer match state
- full board geometry
- line-of-sight automation
- terrain simulation
- speculative analytics dashboards

## Data Quality Policy

When data quality is uncertain, use this order of operations:

1. verify against the primary markdown source if possible
2. verify against the PDF or other supporting source
3. mark the record as uncertain if it can be displayed safely without misrepresenting gameplay
4. ask the user if the uncertainty blocks a core implementation step
5. do not invent the missing value

## Definition Of Complete For Any Added Dataset

A dataset is not complete just because it parses.

It is complete when:

- its schema is stable
- its citations are preserved
- its source version metadata exists
- its validation tests pass
- its manual QA note exists
- its user-facing screens can consume it without hidden special cases

## Definition Of Complete For Any User-Facing Feature

A feature is not complete just because it renders.

It is complete when:

- it uses structured data instead of ad hoc parsing
- it handles empty and incomplete states honestly
- it preserves citations where relevant
- it passes automated tests
- it passes a mobile sanity check
- it has no known blocking source ambiguity

## Recommended Validation Commands

Use the repository scripts if they exist.

If they do not exist yet, create an equivalent workflow that supports at least:

- production build
- lint
- test
- typecheck

Expected command shape for this stack is roughly:

- `bun run build`
- `bun run lint`
- `bun test` or `bun run test`
- `bunx tsc -b`

## Required End-Of-Packet Report Format

At the end of each packet or meaningful sub-slice, the LLM should report using this structure:

1. packet completed or in progress
2. files changed
3. features added or updated
4. validation run and results
5. manual QA notes against source material
6. open risks or limitations
7. questions for the user, if any

## Final Instruction

If there is any tension between speed and source trustworthiness, choose trustworthiness.

If there is any tension between breadth and a complete vertical slice, choose the vertical slice.

If there is any tension between automation and clarity, choose clarity.

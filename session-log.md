# Session Log

## Purpose

This file is the chronological log for notable implementation sessions.

Use it to capture:

- what changed
- why it changed
- what validation ran
- what manual QA happened
- what blockers or follow-ups remain

Keep `blkout-progress.md` as the concise current-state handoff.
Keep this file as the historical trail.

## Update Guidelines

- Add a new entry for each meaningful implementation session.
- Keep entries factual and short.
- Record only work that actually landed in the repository or materially changed project understanding.
- If a session changes overall status, also update `blkout-progress.md`.

## Entry Template

```md
## YYYY-MM-DD - Short Title

- Scope:
- Outcome:
- Validation:
- Manual QA:
- Follow-up:
```

## Historical Summary Before 2026-04-27

This section seeds the log with the major project milestones that were already completed before the dedicated progress/session docs were added.

### Packet 0 - Bootstrap And Contracts

- Scope: project scaffold, route shell, theme provider, shared types, generated data contracts, core scripts, smoke coverage.
- Outcome: established the Bun + TypeScript + React 19 + Vite + Tailwind + ESLint + Vitest baseline and set the app base path to `/leap-sitrep/`.
- Validation: build, lint, typecheck, and smoke testing were put in place and passed for the bootstrap slice.
- Manual QA: app shell and placeholder routes rendered without runtime errors.
- Follow-up: use the shared contracts as the base for all later ETL and UI work.

### Packet 1 - Source Ingestion Foundation

- Scope: ETL for source registry, lore, core rules, supplemental content, and scenarios.
- Outcome: machine-readable JSON generation under `public/data/` with citations and source metadata.
- Validation: parser tests added and passing; generated datasets created successfully.
- Manual QA: source checks were recorded for at least one lore section, one scenario, one FAQ entry, and one USR.
- Follow-up: later parser cleanup was needed after the user improved the core rulebook markdown.

### Packet 2 - Effective Rules And Search

- Scope: rule precedence layer, effective rule generation, FAQ/errata linking, alias mapping, and search indexing.
- Outcome: effective rules added for key examples including `reactions`, `control-points`, and `smoke`; search now spans core project content.
- Validation: Packet 2 tests added and passing.
- Manual QA: effective rule examples were checked against source precedence expectations.
- Follow-up: `data-attacks` remained a known weak spot due to supplemental parsing/linkage quality.

### Packet 3 - Curated First Force Slice

- Scope: first trusted force dataset for the Harlow slice, including curated force/unit records and audit output.
- Outcome: added verified data for `HFR-6770` Harlow 1st Reaction Force, `HFR-6771` Harlow Control Team, `HFR-6772` Harlow Assault Team, and `HFR-6773` Harlow Springbok AI.
- Validation: data build, tests, lint, and typecheck passed; Packet 3 tests were added.
- Manual QA: force and unit data were manually verified against the real screenshots in `screenshots/`.
- Follow-up: Packet 4 `Reference UI Vertical Slice` became the next incomplete packet.

## 2026-04-27 - Core Rulebook Cleanup Follow-Up

- Scope: review parser behavior after the user performed a major cleanup pass on `markdown/BLKOUT-PRINT-AT-HOME-RULEBOOK.md`.
- Outcome: simplified `scripts/etl/build-rules.ts` by removing the obsolete section-start workaround and tightening scenario end detection.
- Validation: `bun run build:data`, `bun run test`, `bun run typecheck`, and `bun run lint` passed.
- Manual QA: scenario extraction was rechecked so `Dockyard Assault`, `Server Defense`, `HVT Evac`, and `Zero Day` no longer bled into later sections or `[10] REFERENCE`.
- Follow-up: keep `setupFromSpecialRules` fallback because `HVT EVAC` and `ZERO DAY` still require it.

## 2026-04-27 - Effective Rules Cleanup Pass

- Scope: inspect `scripts/etl/build-effective-rules.ts` for safe simplification after the rulebook cleanup.
- Outcome: replaced the repeated rule-specific overlay branches with a compact declarative mapping and shared overlay helpers, without changing the currently emitted effective rules.
- Validation: `bun test src/test/packet-2-data.test.ts`, `bun run build:data`, `bun run lint`, and `bun run typecheck` passed.
- Manual QA: confirmed the cleanup was structural only and did not change current Packet 2 outputs.
- Follow-up: `data-attacks` still needs a focused supplemental parsing/linkage fix in `build-supplemental.ts` if stronger Packet 2 coverage is required.

## 2026-04-27 - Progress Tracking Docs Added

- Scope: add durable project-tracking docs for future implementation sessions.
- Outcome: created `blkout-progress.md`, `blkout-prompt.md`, and this `session-log.md`.
- Validation: documentation-only change; no code validation required.
- Manual QA: checked that responsibilities are clearly split across product goals, implementation plan, current progress, and historical session log.
- Follow-up: update `blkout-progress.md` whenever packet status changes and append new entries here for meaningful future sessions.

## 2026-04-27 - DATA ATTACKS Supplemental Parser Fix

- Scope: recover the malformed `[4.7] DATA ATTACKS` section embedded inside the supplemental errata span and link it cleanly into Packet 2 effective rules.
- Outcome: updated `scripts/etl/build-supplemental.ts` to recover embedded FAQ sections from the errata region, improve errata boundary detection, and preserve `DATA ATTACKS` as the errata heading where appropriate. Updated `scripts/etl/build-effective-rules.ts` so the `data-attacks` effective overlay includes both the recovered errata target and FAQ clarifications.
- Validation: `bun test src/test/packet-1-parsers.test.ts`, `bun test src/test/packet-2-data.test.ts`, `bun run build:data`, `bun run lint`, and `bun run typecheck` passed.
- Manual QA: checked the supplemental markdown around lines 499-528 and confirmed the recovered output now reflects both the `Do Data Attacks have a maximum range or require Line of sight?` FAQ and the `AP - Targeting Dusters and Vehicles` errata block.
- Follow-up: Packet 4 rules UI can now rely on stronger `data-attacks` effective-rule coverage without needing a special-case parser workaround in the UI.

## 2026-04-27 - Packet 4 Reference UI Seed Slice

- Scope: replace the Packet 0 placeholder/reference scaffold with the first real Packet 4 read-only reference routes for lore, rules, forces, units, scenarios, glossary, and search.
- Outcome: added a shared reference-data provider, activated the seed-slice routes in `src/app/router.tsx`, updated the app shell to handle reference-data loading/error states, built citation-aware pages for Authority lore, the timeline, seed rules topics, Harlow force/unit details, `Dockyard Assault`, and glossary terms, and added a search overlay backed by the generated search index. Builder and match routes remain reserved for later packets.
- Validation: `bun run test -- src/test/app.smoke.test.tsx`, `bun run test`, `bun run typecheck`, `bun run lint`, `bun run build:data`, and `bun run build` passed.
- Manual QA: recorded in `docs/qa/packet-4.md`, including checks that the active routes resolve to generated data, effective rules and citations render, Harlow Packet 3 card data is visible, and `Dockyard Assault` setup/scoring display correctly.
- Follow-up: Packet 4 is still in progress pending a dedicated manual mobile/desktop QA pass and any small follow-up UX fixes. The cross-dataset lore-force id mismatch (`the-authority` vs `authority`) is currently tolerated in the UI and should be normalized in a later cleanup pass.

## 2026-04-27 - Structured Rule Subsections

- Scope: replace the flat core-rule text rendering with subsection-aware rule data and UI so sections like movement expose `2.1`, `2.2`, `2.3`, and `2.4` explicitly.
- Outcome: updated the shared rule contract to include `overview` and numbered `subsections`, changed `scripts/etl/build-rules.ts` to extract those subsections from the rulebook markdown while preserving aggregate `body` text for compatibility, indexed subsection entries in search, and updated the Packet 4 rules UI to render numbered rule sections instead of only splitting a flattened body string.
- Validation: `bun run build:data`, `bun run typecheck`, `bun run lint`, `bun run test`, and `bun run build` passed.
- Manual QA: confirmed the movement rule now renders its numbered subsections in order after the stray duplicate heading was removed from `markdown/BLKOUT-PRINT-AT-HOME-RULEBOOK.md`.
- Follow-up: if we later want richer rule navigation, subsection-specific anchors and citations are now available in the data model without another parser rewrite.

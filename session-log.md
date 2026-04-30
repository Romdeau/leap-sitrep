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

## 2026-04-29 - Packet 4 Authority Id Cleanup

- Scope: normalize the documented cross-dataset id mismatch between the Harlow force parent id and the Authority lore faction id.
- Outcome: updated the curated force generator and sample fixtures to use `the-authority`, regenerated public data, and removed the Packet 4 UI compatibility workaround for `authority`.
- Validation: `bun run build:data`, `bun run test -- src/test/packet-3-forces.test.ts src/test/app.smoke.test.tsx`, `bun run typecheck`, `bun run lint`, and `bun run build` passed. A direct `bun test ...` attempt failed because it bypassed the repo Vitest alias config and could not resolve `@/App`; the same affected tests passed through the repository script.
- Manual QA: checked generated `public/data/forces/index.json` and `public/data/search/index.json` now reference `the-authority`, matching `public/data/lore/index.json`.
- Follow-up: Packet 4 still needs the dedicated browser-based mobile/desktop QA pass before Review B.

## 2026-04-29 - Special Rules Rules-Module Integration

- Scope: ensure the added `markdown/special-rules.md` source is ingested into the overall rules module rather than only existing as generated data.
- Outcome: confirmed special rules are parsed, source-registered, merged into `public/data/rules/core.json` universal special rules, and indexed for search; updated `/rules` to list universal special rules with source badges and included USR records in the search overlay.
- Validation: `bun run build:data`, `bun run test -- src/test/packet-1-parsers.test.ts src/test/packet-2-data.test.ts src/test/app.smoke.test.tsx`, `bun run typecheck`, `bun run lint`, and `bun run build` passed.
- Manual QA: checked `Smoke Grenade | X"` appears in generated rules data with `blkout-special-rules` citations and is covered by the rules-page/search smoke test.
- Follow-up: Packet 4 still needs the dedicated browser-based mobile/desktop QA pass before Review B.

## 2026-04-29 - Packet 4 Mobile Search Access

- Scope: tighten the remaining Packet 4 mobile/table-side reference UX by keeping search available from the fixed bottom navigation.
- Outcome: added a reusable mobile Search action that opens the existing generated-data search overlay from the bottom nav while keeping later builder/match flows deferred.
- Validation: `bun run build:data`, `bun run test -- src/test/app.smoke.test.tsx`, `bun run typecheck`, `bun run lint`, and `bun run build` passed. An initial smoke-test assertion failed because `Harlow 1st Reaction Force` appears both on the home page and in search results; the assertion was corrected to expect multiple matches.
- Manual QA: recorded in `docs/qa/packet-4.md`; automated mobile-navigation coverage opens search from the bottom nav and finds the verified Harlow force result.
- Follow-up: Packet 4 still needs a browser/device visual QA pass at phone and desktop sizes before Review B.

## 2026-04-29 - Packet 4 Completed And Packet 5 Started

- Scope: close Packet 4 after user direction to defer final mobile visual validation until the broader app is complete and move into the builder packet.
- Outcome: marked Packet 4 complete and Packet 5 in progress in `blkout-progress.md`.
- Validation: documentation/status update only; no code validation required.
- Manual QA: user accepted deferring final mobile visual QA.
- Follow-up: implement the smallest Harlow core roster builder slice with local persistence and validation.

## 2026-04-29 - Packet 5 Harlow Core Builder Slice

- Scope: implement the first Packet 5 core builder sub-slice for the verified Harlow seed force.
- Outcome: activated `/builder`, added pure roster validation and local-storage persistence helpers, built a Harlow core roster form with 3 unit slots, legal-state messaging, source links, saved roster summaries, and delete support.
- Validation: `bun run test -- src/features/builder/roster-builder.test.ts src/test/app.smoke.test.tsx`, `bun run typecheck`, `bun run lint`, and `bun run build` passed. Initial lint found two new TypeScript issues in builder files; both were fixed and lint was rerun successfully.
- Manual QA: recorded in `docs/qa/packet-5.md`; confirmed the slice uses only verified Harlow force/unit data and does not invent points, handlers, BLKLIST options, or matched play content.
- Follow-up: Packet 5 still needs duplication, fuller saved-roster reload/round-trip UX, richer illegal-state checks, and final manual roster QA before completion.

## 2026-04-29 - Packet 5 Saved Roster Round Trip

- Scope: continue Packet 5 builder work by polishing saved-roster workflows for the verified Harlow core group slice.
- Outcome: added saved roster loading back into the draft, roster duplication, saved-roster legality status, and updated automated coverage for save/load/duplicate behavior.
- Validation: `bun run test -- src/features/builder/roster-builder.test.ts src/test/app.smoke.test.tsx`, `bun run typecheck`, `bun run lint`, and `bun run build` passed. An initial timestamp assertion in the new duplication test was too strict for same-millisecond roster creation and was corrected.
- Manual QA: recorded in `docs/qa/packet-5.md`; compared the supported core group assumption against `markdown/BLKOUT-PRINT-AT-HOME-RULEBOOK.md` lines 310-330.
- Follow-up: Packet 5 still needs final illegal-state UX, deletion edge-case QA, and an export-readiness decision for the current roster summary before completion.

## 2026-04-29 - Packet 5 Completed

- Scope: close the remaining Packet 5 decisions and illegal-state UX for the Harlow core builder slice.
- Outcome: user chose to defer roster export until the builder and match tracker prove a stable table-use summary shape; duplicate unit selections now show slot-level guidance and keep saving disabled. Packet 5 is marked complete and Packet 6 is the next incomplete packet.
- Validation: `bun run test -- src/features/builder/roster-builder.test.ts src/test/app.smoke.test.tsx`, `bun run typecheck`, `bun run lint`, and `bun run build` passed.
- Manual QA: updated `docs/qa/packet-5.md`; the builder remains limited to the sourced core group structure in `markdown/BLKOUT-PRINT-AT-HOME-RULEBOOK.md` lines 310-330 and does not add unsupported export, points, handlers, BLKLIST, or matched play content.
- Follow-up: start Packet 6 with the smallest Harlow/Dockyard Assault match tracker slice.

## 2026-04-29 - Packet 6 Match Tracker Started

- Scope: implement the first local-first match tracker slice for saved Harlow rosters and Dockyard Assault.
- Outcome: added match-state helpers, local match persistence, `/matches` setup from saved rosters, and `/matches/:matchId` tracker UI for round progression, unit activation/pinned/destroyed state, manual Overrun scores, initiative notes, hardpoints, points of interest, and smoke marker toggles.
- Validation: `bun run test -- src/features/matches/match-tracker.test.ts src/test/app.smoke.test.tsx`, `bun run typecheck`, `bun run lint`, and `bun run build` passed.
- Manual QA: recorded in `docs/qa/packet-6.md`; confirmed the tracker links to sourced scenario/rules/unit pages and does not attempt spatial automation or inferred line-of-sight/terrain adjudication.
- Follow-up: Packet 6 still needs a full mock-game walkthrough, mobile table-use QA, roster import edge cases, and scenario helper polish before completion.

## 2026-04-29 - Packet 6 Tracker State Coverage

- Scope: fill the remaining explicit Packet 6 tracker-state gaps and add a real UI walkthrough test.
- Outcome: added damage mark tracking and manual control-point tracking to match state and UI; added smoke coverage that starts a match from a saved roster, updates activation/damage/pinned/token/control-point/initiative state, advances the round, and verifies local persistence.
- Validation: `bun run test -- src/features/matches/match-tracker.test.ts src/test/app.smoke.test.tsx`, `bun run typecheck`, `bun run lint`, and `bun run build` passed.
- Manual QA: updated `docs/qa/packet-6.md`; tracker still stays within sourced/manual table-state tracking and avoids spatial or line-of-sight automation.
- Follow-up: Packet 6 needs browser/device mobile table-use QA and any small table-flow polish discovered there before completion.

## 2026-04-29 - Packet 6 Saved Match Edge Handling

- Scope: polish local match management and roster import edge cases for Packet 6.
- Outcome: added saved-match deletion from `/matches` and a clear recovery state when a stored match references a missing roster instead of rendering broken unit controls.
- Validation: `bun run test -- src/features/matches/match-tracker.test.ts src/test/app.smoke.test.tsx`, `bun run typecheck`, `bun run lint`, and `bun run build` passed.
- Manual QA: updated `docs/qa/packet-6.md`; edge handling remains local-only and does not invent replacement roster or unit data.
- Follow-up: Packet 6 still needs browser/device mobile table-use QA and any small table-flow polish discovered there before completion.

## 2026-04-29 - Packet 6 Completed

- Scope: close the remaining Packet 6 table-use polish for the Harlow/Dockyard Assault tracker.
- Outcome: added a compact table snapshot for quick mobile/table-side checks covering round, ready units, score, control points, pinned/destroyed counts, active tokens, and last initiative note. Packet 6 is marked complete and Packet 7 is the next incomplete packet.
- Validation: `bun run test -- src/features/matches/match-tracker.test.ts src/test/app.smoke.test.tsx`, `bun run typecheck`, `bun run lint`, and `bun run build` passed. The first test update used ambiguous text assertions after adding snapshot labels; assertions were tightened to account for duplicated table labels.
- Manual QA: updated `docs/qa/packet-6.md`; tracker remains a manual table-state aid and does not automate spatial, terrain, line-of-sight, or unsourced scenario decisions.
- Follow-up: start Packet 7 only with source-backed catalog/matched-play expansion, preserving Review D gating for broader matched play decisions.

## 2026-04-29 - Packet 7 Matched Play Reference Started

- Scope: start Packet 7 without broad catalog prioritization by exposing already source-backed matched-play supplemental rules.
- Outcome: supplemental ETL now extracts `[2.2] MATCHED PLAY GROUP BUILDING` as `matched-play-group-building`; app runtime loads `public/data/rules/supplemental.json`; `/rules/matched-play` now renders matched-play rules, group-building structure, citations, and an explicit gate that builder support waits for verified handler and BLKLIST data.
- Validation: `bun run build:data`, `bun run test -- src/test/packet-1-parsers.test.ts src/test/app.smoke.test.tsx`, `bun run typecheck`, `bun run lint`, and `bun run build` passed. Initial smoke assertions were tightened because the route intentionally repeats group-building clauses in detail and summary sections.
- Manual QA: recorded in `docs/qa/packet-7.md`; compared group-building extraction against `markdown/BLKOUT_Supplemental_4-26.md` lines 134-158.
- Follow-up: Review D is now pending before broad catalog expansion; user needs to prioritize additional forces, scenarios, or factions. Continue only source-backed reference work that does not require guessing handler, BLKLIST, duster, or unit data.

## 2026-04-29 - Packet 7 Screenshot Force Import

- Scope: import user-provided screenshot card sheets into the verified force catalog.
- Outcome: added Harlow Engineers, Harlow Veterans, and Harlow Crickets to Harlow 1st Reaction Force; added UN Raid Force Alpha plus UN UTG Assaulters, UN UTG Specialists, and Golem Unit. Regenerated force/search data now exposes 2 verified forces and 9 verified units.
- Validation: `bun run build:data`, `bun run test -- src/test/packet-3-forces.test.ts src/test/app.smoke.test.tsx`, `bun run typecheck`, `bun run lint`, and `bun run build` passed.
- Manual QA: updated `docs/qa/packet-7.md` and `screenshots/extraction-progress.md`; used the mirrored double-sided print ordering rule for Harlow and UN Raid Force Alpha sheets. New records use screenshot citations and do not rely on OCR-only verification.
- Follow-up: continue Packet 7 by either adding another source-backed screenshot force set or generalizing the core builder to support verified force selection. Matched-play builder support remains gated until handlers and BLKLIST units are verified.

## 2026-05-01 - Packet 7 Verified Force Builder, Tracker, And Export Expansion

- Scope: continue Packet 7 without relying on unfinished card transcriptions by expanding the existing core builder across verified force data.
- Outcome: generalized `/builder` from the original Harlow-only slice into a verified core roster builder with force selection, selected-force unit scoping, per-force default unit slots, saved-roster force restoration, and smoke coverage for saving a UN Raid Force Alpha core roster. Updated match setup copy and tests so Dockyard Assault trackers can start from saved verified-force rosters, including UN Raid Force Alpha. Added copyable plain Markdown saved-roster export previews sourced only from verified force/unit data and copyable live-match table-state exports sourced only from manual tracker state.
- Validation: `bun run test -- src/features/builder/roster-builder.test.ts src/features/matches/match-tracker.test.ts src/test/app.smoke.test.tsx`, `bun run typecheck`, and `bun run lint` passed.
- Manual QA: updated `docs/qa/packet-7.md`; confirmed this still validates only core group structure and does not invent matched-play handlers, BLKLIST entries, points, dusters, or unsupported export data.
- Follow-up: next Packet 7 work can either add another source-backed force set or add source-backed roster/export polish for all verified core forces while preserving matched-play gating.

# BLKOUT Progress

Last updated: 2026-04-29

## Overall Status

- Highest fully completed packet: Packet 6 `Core Match Tracker Vertical Slice`
- First incomplete packet: Packet 7 `Catalog And Matched Play Expansion`
- Current state: core ETL, effective rules/search, dedicated special-rules ingestion, the Packet 4 read-only reference UI, the Packet 5 Harlow core builder, and the Packet 6 Harlow/Dockyard Assault match tracker are complete. Packet 7 has started with source-backed matched-play supplemental reference plus screenshot-verified catalog expansion. The force catalog now includes Harlow 1st Reaction Force with 6 units and UN Raid Force Alpha with 3 units; `/builder` can now build core rosters from any verified force while keeping units scoped to the selected force, saved roster cards include a copyable plain Markdown table export preview, and the match tracker can start Dockyard Assault from those saved verified-force rosters with a copyable manual table-state export. Matched-play builder support remains gated until handler and BLKLIST data are verified.

## Important Project Info

- App base path: `/leap-sitrep/`
- Local dev URL: `http://localhost:5173/leap-sitrep/`
- Primary machine-readable sources:
  - `markdown/BLKOUT-Year-Two-Lore-Primer.md`
  - `markdown/BLKOUT-PRINT-AT-HOME-RULEBOOK.md`
  - `markdown/BLKOUT_Supplemental_4-26.md`
- OCR-assist only source:
  - `markdown/Unit-Cards-Printable-2026.md`
- Packet 3 card verification source:
  - `screenshots/`
- PDFs were moved to `source-pdfs/` and gitignored.
- Do not invent missing rules, stats, handlers, units, or weapon data.
- Preserve citations in generated data and important rule surfaces.

## Rule Precedence

When sources conflict, apply this order:

1. supplemental rulings and verified support documents
2. mode-specific overlays such as matched play
3. force card and unit card text
4. core rulebook text
5. quick reference summaries only after manual verification

## Packet Status

| Packet | Name | Status | Progress Summary |
| --- | --- | --- | --- |
| 0 | Bootstrap And Contracts | Complete | Project scaffolded with Bun, TypeScript, React 19, Vite, Tailwind, ESLint, and Vitest. Route shell, theme provider, shared domain/generated types, sample generated data, and smoke coverage were added. |
| 1 | Source Ingestion Foundation | Complete | ETL added for source registry, lore, core rules, supplemental rules, and scenarios. Generated JSON is emitted under `public/data/`. Parser tests and QA notes exist. Scenario boundary parsing was later tightened after the cleaned rulebook QA pass. |
| 2 | Effective Rules And Search | Complete | Effective rules merge, FAQ/errata linkage, alias mapping, universal special rule search records, and search indexing were added. Effective rules currently cover at least `reactions`, `control-points`, and `smoke`. Dedicated `markdown/special-rules.md` ingestion now improves USR text while preserving citations. |
| 3 | Curated First Force Slice | Complete | Curated Harlow force data was added and manually verified against the real card screenshots. Includes `HFR-6770` Harlow 1st Reaction Force, `HFR-6771` Harlow Control Team, `HFR-6772` Harlow Assault Team, and `HFR-6773` Harlow Springbok AI. Force audit output, type updates, search indexing, tests, and QA notes were added. |
| 4 | Reference UI Vertical Slice | Complete | The seed read-only reference routes are live for Authority lore, the timeline, seed rules topics, universal special rules, the verified Harlow force and units, `Dockyard Assault`, glossary, and search. Harlow force data links to the canonical `the-authority` lore id without a UI workaround, and mobile bottom navigation exposes search for table-side lookup. User deferred final browser/device visual QA until the broader app is complete. |
| 5 | Core Builder Vertical Slice | Complete | The Harlow core builder is live at `/builder`: it validates 1 verified Harlow force plus 3 verified Harlow units, saves rosters to local storage, reloads saved rosters into the draft, duplicates and deletes saved rosters, displays saved roster legality, flags duplicate-unit illegal states, and links back to source-backed force/unit pages. Export is deferred by user decision until the builder and match tracker prove the stable table-use summary shape. |
| 6 | Core Match Tracker Vertical Slice | Complete | Match tracker slice is live at `/matches` and `/matches/:matchId`: create a Dockyard Assault match from a saved Harlow roster, persist and delete matches locally, recover clearly when a match references a missing roster, advance rounds, update unit activation/damage/pinned/destroyed state, record manual Overrun scores, track control points and initiative notes, toggle hardpoint/point-of-interest/smoke markers, and review a compact table snapshot for mobile/table-side play. |
| 7 | Catalog And Matched Play Expansion | In progress | Started with source-backed matched-play reference at `/rules/matched-play`, extracted `[2.2] MATCHED PLAY GROUP BUILDING`, added 3 screenshot-verified Harlow units, added screenshot-verified UN Raid Force Alpha with 3 units, generalized `/builder` to select among verified forces for core rosters, and added copyable source-gated saved-roster and live-match exports. Matched-play builder support remains gated until handler and BLKLIST data are verified. |
| 8 | Polish And Optional Expansion | Not started | Blocked on Packet 7. |

## First Vertical Slice Status

Planned seed slice from `blkout-implementation.md`:

- lore: Authority overview and timeline page
- rules: movement, shooting, reactions, smoke, control points, and data attacks
- force: Harlow 1st Reaction Force
- units: Harlow Control Team, Harlow Assault Team, Harlow Springbok AI
- scenario: Dockyard Assault
- tracker: round flow, activations, smoke, and overrun point tracking

Current completion against that slice:

- Data for the seed slice is ready and the first read-only UI slice is attached to it.
- Force and unit data for the Harlow slice are complete and manually verified.
- Rule/scenario ETL exists for the seed slice.
- The read-only reference UI is now active for the seed slice.
- The builder workflow for the seed slice is now complete; the tracker workflow is still pending.
- The tracker workflow for the seed slice is now complete and can persist a local Dockyard Assault match from a saved Harlow roster.

## Key Outputs In Place

- ETL entrypoint: `scripts/build-data.ts`
- Core rule parser: `scripts/etl/build-rules.ts`
- Supplemental parser: `scripts/etl/build-supplemental.ts`
- Effective rules merge: `scripts/etl/build-effective-rules.ts`
- Force ETL: `scripts/etl/build-forces.ts`
- Search index builder: `scripts/etl/build-search-index.ts`
- Generated data:
  - `public/data/source-registry.json`
  - `public/data/lore/index.json`
  - `public/data/rules/core.json`
  - `public/data/rules/supplemental.json`
  - `public/data/scenarios/core.json`
  - `public/data/search/index.json`
  - `public/data/forces/index.json`
  - `public/data/forces/audit.json`
- QA docs:
  - `docs/qa/packet-0.md`
  - `docs/qa/packet-1.md`
  - `docs/qa/packet-2.md`
  - `docs/qa/packet-3.md`
  - `docs/qa/packet-4.md`
  - `docs/qa/packet-5.md`
  - `docs/qa/packet-6.md`
  - `docs/qa/packet-7.md`

## Validation Snapshot

Full validation passed after the Packet 4 reference UI slice:

- `bun run build:data`
- `bun run test`
- `bun run typecheck`
- `bun run lint`
- `bun run build`

Most recent full validation passed after special-rules rules-module integration:

- `bun run build:data`
- `bun run test -- src/test/packet-1-parsers.test.ts src/test/packet-2-data.test.ts src/test/app.smoke.test.tsx`
- `bun run typecheck`
- `bun run lint`
- `bun run build`

Most recent targeted validation passed for the Packet 4 reference data-contract cleanup:

- `bun run build:data`
- `bun run test -- src/test/packet-3-forces.test.ts src/test/app.smoke.test.tsx`
- `bun run typecheck`
- `bun run lint`
- `bun run build`

Most recent targeted validation passed for the Packet 4 mobile search QA slice:

- `bun run build:data`
- `bun run test -- src/test/app.smoke.test.tsx`
- `bun run typecheck`
- `bun run lint`
- `bun run build`

Most recent targeted validation passed for the first Packet 5 builder sub-slice:

- `bun run test -- src/features/builder/roster-builder.test.ts src/test/app.smoke.test.tsx`
- `bun run typecheck`
- `bun run lint`
- `bun run build`

Most recent targeted validation passed for the Packet 5 saved-roster round-trip/duplication slice:

- `bun run test -- src/features/builder/roster-builder.test.ts src/test/app.smoke.test.tsx`
- `bun run typecheck`
- `bun run lint`
- `bun run build`

Most recent targeted validation passed for Packet 5 completion:

- `bun run test -- src/features/builder/roster-builder.test.ts src/test/app.smoke.test.tsx`
- `bun run typecheck`
- `bun run lint`
- `bun run build`

Most recent targeted validation passed for the first Packet 6 match tracker sub-slice:

- `bun run test -- src/features/matches/match-tracker.test.ts src/test/app.smoke.test.tsx`
- `bun run typecheck`
- `bun run lint`
- `bun run build`

Most recent targeted validation passed for Packet 6 tracker-state completion:

- `bun run test -- src/features/matches/match-tracker.test.ts src/test/app.smoke.test.tsx`
- `bun run typecheck`
- `bun run lint`
- `bun run build`

Most recent targeted validation passed for Packet 6 saved-match edge handling:

- `bun run test -- src/features/matches/match-tracker.test.ts src/test/app.smoke.test.tsx`
- `bun run typecheck`
- `bun run lint`
- `bun run build`

Most recent targeted validation passed for Packet 6 completion:

- `bun run test -- src/features/matches/match-tracker.test.ts src/test/app.smoke.test.tsx`
- `bun run typecheck`
- `bun run lint`
- `bun run build`

Most recent targeted validation passed for the first Packet 7 matched-play reference slice:

- `bun run build:data`
- `bun run test -- src/test/packet-1-parsers.test.ts src/test/app.smoke.test.tsx`
- `bun run typecheck`
- `bun run lint`
- `bun run build`

Most recent targeted validation passed for Packet 7 screenshot force import:

- `bun run build:data`
- `bun run test -- src/test/packet-3-forces.test.ts src/test/app.smoke.test.tsx`
- `bun run typecheck`
- `bun run lint`
- `bun run build`

Most recent targeted validation passed for Packet 7 verified-force builder/tracker/export expansion:

- `bun run test -- src/features/builder/roster-builder.test.ts src/features/matches/match-tracker.test.ts src/test/app.smoke.test.tsx`
- `bun run typecheck`
- `bun run lint`

## Important Findings And Open Issues

- The user performed a major cleanup pass on `markdown/BLKOUT-PRINT-AT-HOME-RULEBOOK.md`, including removing the table of contents, removing acknowledgements, and fixing section ordering. The parsers were then simplified and scenario extraction improved.
- Scenario bleed in Packet 1 was fixed so later scenarios no longer absorb each other or the `[10] REFERENCE` section.
- Packet 3 was verified against real card screenshots in `screenshots/`, not just OCR markdown.
- `UnitStats` still only models `move`, `shoot`, `armor`, `hack`, and `wounds`. No extra card-front stat meanings were invented beyond that contract.
- The out-of-order `[4.7] DATA ATTACKS` material in `markdown/BLKOUT_Supplemental_4-26.md` is now handled by the supplemental parser. Packet 2 now recovers those FAQ/errata records and links them into the `data-attacks` effective rule.
- Packet 4 now reads the generated datasets directly through a shared reference-data provider and exposes citations across lore, rules, force, unit, scenario, and glossary routes.
- Core rule ETL now emits structured rule subsections (`overview` plus numbered `subsections`) instead of relying only on a flat `body` blob, and the Packet 4 rules UI renders those subsections directly.
- The global search overlay is live for the seed slice, is available from both header controls and the mobile bottom navigation, and returns Packet 4 routes for Authority, Harlow, `return fire`, `Dockyard Assault`, and glossary terms.
- The previous cross-dataset id mismatch between lore id `the-authority` and force parent id `authority` has been normalized in `scripts/etl/build-forces.ts`; generated force/search data and sample fixtures now use `the-authority`.
- The added `markdown/special-rules.md` source is registered as `blkout-special-rules`, merged into `public/data/rules/core.json` universal special rules, indexed for search, and surfaced on `/rules` plus `/rules/usr/:slug`.
- The `/builder` route is now complete for the seed Harlow core-play group and persists rosters locally under `leap-sitrep.rosters.v1`. Saved rosters can be loaded back into the draft, duplicated, deleted, and checked for current legality against the verified dataset. Duplicate draft unit selections are flagged before save.
- Roster export is deferred by user decision until the builder and match tracker prove the stable table-use summary shape.
- The `/matches` route is complete for the seed tracker slice: it can start and delete local Dockyard Assault trackers from saved Harlow rosters, and `/matches/:matchId` supports round, activation, damage, pinned, destroyed, Overrun score, control points, initiative, hardpoint, point-of-interest, smoke marker tracking, missing-roster recovery, and a compact table snapshot without spatial automation.
- Packet 7 now exposes the supplemental matched-play rules at `/rules/matched-play`, including the sourced group-building structure from `markdown/BLKOUT_Supplemental_4-26.md` lines 134-158. It does not create matched-play rosters or invent handler/BLKLIST data.
- Packet 7 now imports screenshot-verified cards from `screenshots/harlow-1st-reaction/` and `screenshots/un-raidforce-alpha/`: Harlow Engineers, Harlow Veterans, Harlow Crickets, UN Raid Force Alpha, UN UTG Assaulters, UN UTG Specialists, and Golem Unit. Search and reference pages consume the regenerated dataset.
- Packet 7 now generalizes `/builder` beyond the original Harlow-only slice: the builder can select among verified forces, resets the three-unit draft to that force's verified units, saves legal UN Raid Force Alpha core rosters, and still rejects duplicate or cross-force unit selections. Saved roster cards include a copyable plain Markdown table export preview sourced only from verified force/unit data. `/matches` can start Dockyard Assault from those saved verified-force rosters, including UN Raid Force Alpha, and live trackers include a copyable manual table-state export. Matched-play support remains intentionally gated.

## Review Checkpoints

- Review A: reached, because Packet 2 is complete. This should be treated as the next explicit plan checkpoint if we want a formal user review on data contracts, citations, and precedence behavior.
- Review B: reached because Packet 4 is complete. The user deferred final mobile visual validation until the broader app is complete and explicitly directed work to continue into Packet 5.
- Review C: reached because Packet 6 is complete.
- Review D: partially addressed by user-provided Harlow strike-team and UN Raid Force Alpha screenshots. Further broad expansion still requires prioritizing the next source-backed screenshot set.
- Review E: not reached.

## Recommended Next Work

1. Continue Packet 7 by adding the next source-backed screenshot force set, or by polishing the verified-force roster/match workflow without adding unsupported matched-play validation. Keep matched-play validation gated until handler and BLKLIST data are verified.

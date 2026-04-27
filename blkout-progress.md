# BLKOUT Progress

Last updated: 2026-04-27

## Overall Status

- Highest fully completed packet: Packet 3 `Curated First Force Slice`
- First incomplete packet: Packet 4 `Reference UI Vertical Slice`
- Current state: core ETL, effective rules/search, and the first trusted Harlow force slice are in place; the first Packet 4 read-only reference UI sub-slice is now live and validated, while builder flow and match tracker work remain unstarted.

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
| 2 | Effective Rules And Search | Complete | Effective rules merge, FAQ/errata linkage, alias mapping, and search indexing were added. Effective rules currently cover at least `reactions`, `control-points`, and `smoke`. A small cleanup pass simplified `build-effective-rules.ts` without changing current behavior. |
| 3 | Curated First Force Slice | Complete | Curated Harlow force data was added and manually verified against the real card screenshots. Includes `HFR-6770` Harlow 1st Reaction Force, `HFR-6771` Harlow Control Team, `HFR-6772` Harlow Assault Team, and `HFR-6773` Harlow Springbok AI. Force audit output, type updates, search indexing, tests, and QA notes were added. |
| 4 | Reference UI Vertical Slice | In progress | The seed read-only reference routes are now live for Authority lore, the timeline, seed rules topics, the verified Harlow force and units, `Dockyard Assault`, glossary, and search. Builder and match routes remain intentionally reserved. Packet 4 is not yet fully complete because broader interaction coverage and a dedicated mobile/manual QA pass still need to be recorded. |
| 5 | Core Builder Vertical Slice | Not started | Blocked on Packet 4. |
| 6 | Core Match Tracker Vertical Slice | Not started | Blocked on Packet 5. |
| 7 | Catalog And Matched Play Expansion | Not started | Blocked on Packet 6 and user Review D. |
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
- The builder workflow and tracker workflow for the seed slice are still pending.

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

## Validation Snapshot

Full validation passed after the Packet 4 reference UI slice:

- `bun run build:data`
- `bun run test`
- `bun run typecheck`
- `bun run lint`
- `bun run build`

Most recent targeted validation passed for the Packet 4 reference routes and search overlay:

- `bun run test -- src/test/app.smoke.test.tsx`
- `bun run lint`

## Important Findings And Open Issues

- The user performed a major cleanup pass on `markdown/BLKOUT-PRINT-AT-HOME-RULEBOOK.md`, including removing the table of contents, removing acknowledgements, and fixing section ordering. The parsers were then simplified and scenario extraction improved.
- Scenario bleed in Packet 1 was fixed so later scenarios no longer absorb each other or the `[10] REFERENCE` section.
- Packet 3 was verified against real card screenshots in `screenshots/`, not just OCR markdown.
- `UnitStats` still only models `move`, `shoot`, `armor`, `hack`, and `wounds`. No extra card-front stat meanings were invented beyond that contract.
- The out-of-order `[4.7] DATA ATTACKS` material in `markdown/BLKOUT_Supplemental_4-26.md` is now handled by the supplemental parser. Packet 2 now recovers those FAQ/errata records and links them into the `data-attacks` effective rule.
- Packet 4 now reads the generated datasets directly through a shared reference-data provider and exposes citations across lore, rules, force, unit, scenario, and glossary routes.
- Core rule ETL now emits structured rule subsections (`overview` plus numbered `subsections`) instead of relying only on a flat `body` blob, and the Packet 4 rules UI renders those subsections directly.
- The global search overlay is live for the seed slice and returns Packet 4 routes for Authority, Harlow, `return fire`, `Dockyard Assault`, and glossary terms.
- There is still a cross-dataset id mismatch between the lore id `the-authority` and the force parent id `authority`; the Packet 4 UI currently tolerates this instead of rewriting Packet 3 data in the same pass.

## Review Checkpoints

- Review A: reached, because Packet 2 is complete. This should be treated as the next explicit plan checkpoint if we want a formal user review on data contracts, citations, and precedence behavior.
- Review B: partially approached because Packet 4 is in progress and the first reference UI direction is now visible, but Packet 4 is not yet complete.
- Review C: not reached.
- Review D: not reached.
- Review E: not reached.

## Recommended Next Work

1. Finish Packet 4 `Reference UI Vertical Slice` by doing a manual mobile/desktop QA pass on the active reference routes and tightening any obvious UX gaps found there.
2. Decide whether to normalize the `authority` versus `the-authority` cross-dataset id mismatch as a small data-contract cleanup before moving deeper into Packet 4 or Packet 5.
3. After the remaining Packet 4 QA work is done, use Review B to confirm the reference UI direction before starting the builder slice.

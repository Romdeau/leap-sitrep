# LEAP Sitrep

Deployed app: <https://romdeau.github.io/leap-sitrep/>

`LEAP Sitrep` is a local-first BLKOUT companion app focused on source-accurate reference, fast lookup, visible citations, and mobile-friendly table use.

The project is being built in vertical slices. The current implementation centers on the first usable read-only reference slice: Authority lore, seed rules topics, the verified Harlow force and units, `Dockyard Assault`, glossary support, and global search.

## Current Status

- Packets 0-3 are complete.
- Packet 4 `Reference UI Vertical Slice` is in progress.
- The current app already includes:
  - lore pages for the Authority and the timeline
  - rules pages for movement, shooting, reactions, smoke, control points, and data attacks
  - structured rule subsections such as `2.1`, `2.2`, `2.3`, and `2.4`
  - the verified Harlow force page and three seed unit pages
  - the `Dockyard Assault` scenario page
  - citation-aware detail views
  - command-palette-style search with direct subsection deep links

Planned later packets cover the builder flow, match tracker, broader catalog coverage, and polish.

## Product Goals

The app is intended to become a practical BLKOUT player hub for:

- lore and faction reference
- rules and scenario reference
- group and roster building
- table-side game state tracking

Core principles for the project:

- local-first by default
- mobile-friendly for real table use
- citation-heavy for important rules and data
- explicit about uncertainty instead of inventing rulings
- structured data first, UI second

## Source Material

Primary machine-readable inputs:

- `markdown/BLKOUT-Year-Two-Lore-Primer.md`
- `markdown/BLKOUT-PRINT-AT-HOME-RULEBOOK.md`
- `markdown/BLKOUT_Supplemental_4-26.md`

Additional inputs:

- `markdown/Unit-Cards-Printable-2026.md`
  - used as OCR assistance, not canonical truth
- `screenshots/`
  - used for manual verification of the first trusted force slice

Generated datasets are emitted into:

- `public/data/source-registry.json`
- `public/data/lore/index.json`
- `public/data/rules/core.json`
- `public/data/rules/supplemental.json`
- `public/data/scenarios/core.json`
- `public/data/search/index.json`
- `public/data/forces/index.json`
- `public/data/forces/audit.json`

## Rule Precedence

When sources conflict, the app follows this precedence order:

1. supplemental rulings and verified support documents
2. mode-specific overlays such as matched play
3. force card and unit card text
4. core rulebook text
5. quick reference summaries only after manual verification

If content cannot be reconciled safely, the project should expose the ambiguity rather than silently inventing an answer.

## Current Seed Slice

The first vertical slice is intentionally narrow:

- lore: Authority overview and timeline
- rules: movement, shooting, reactions, smoke, control points, and data attacks
- force: Harlow 1st Reaction Force
- units:
  - Harlow Control Team
  - Harlow Assault Team
  - Harlow Springbok AI
- scenario: Dockyard Assault

This slice is the foundation for later builder and tracker work.

## Notable Implemented Features

### Reference UI

- route-based reference experience with React Router
- home hub and section landing pages
- lore, rules, force, unit, scenario, and glossary views
- visible source citations on important records

### Structured Rules Data

- core rules are extracted at build time by Bun ETL scripts
- rules now include:
  - top-level rule records
  - overview text where present
  - numbered subsections as structured records
- rule subsections can be deep-linked directly, for example:
  - `/rules/core#rule-subsection-2-3-leaning-out`

### Search

- generated search index spanning lore, forces, units, rules, glossary, and scenarios
- aliases for common phrases and acronyms
- direct navigation to subsection anchors from search results

### Verified Force Slice

- Harlow force and unit data is manually verified against screenshot sources rather than accepted from OCR alone

## Tech Stack

- Bun 1.3.5
- Node.js 24.x
- TypeScript
- React 19
- Vite 8
- React Router DOM 7
- Tailwind CSS v4
- shadcn/ui-style component primitives under `src/components/ui/`
- Lucide React
- Vitest + Testing Library + happy-dom
- ESLint

The app is built for the `/leap-sitrep/` base path so it can be deployed to GitHub Pages.

## Repository Layout

Key directories and files:

- `src/`
  - application code and UI
- `scripts/`
  - ETL and data-generation scripts
- `public/data/`
  - generated machine-readable datasets
- `markdown/`
  - source markdown used by the ETL pipeline
- `docs/qa/`
  - packet-by-packet QA notes
- `blkout-app.md`
  - product intent
- `blkout-implementation.md`
  - packet workflow and delivery criteria
- `blkout-progress.md`
  - current project status and handoff notes
- `session-log.md`
  - session history

## Getting Started

### Requirements

- Bun `1.3.5`
- Node.js `24.x`

### Install

```bash
bun install
```

### Run locally

```bash
bun run dev
```

Expected local base path:

- `http://localhost:5173/leap-sitrep/`

### Rebuild generated data

```bash
bun run build:data
```

### Run validation

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

## Deployment

The project includes GitHub Actions workflows for:

- CI build validation on pull requests
- deployment to GitHub Pages on pushes to `main`

Pages-specific notes:

- the Vite base path is `/leap-sitrep/`
- the deploy workflow copies `dist/index.html` to `dist/404.html` so SPA deep links work with `BrowserRouter` on GitHub Pages

Deployed URL:

- <https://romdeau.github.io/leap-sitrep/>

## Testing And QA

The repository includes:

- parser and ETL tests
- data-merging and search-index tests
- app smoke tests for Packet 4 reference behavior
- packet QA notes in `docs/qa/`

Recent full validation includes:

- `bun run build:data`
- `bun run typecheck`
- `bun run lint`
- `bun run test`
- `bun run build`

## Known Limitations

- Packet 4 is not formally closed yet; it still needs a dedicated manual mobile/desktop QA pass and final Review B confirmation.
- Builder and match-tracker workflows are not implemented yet.
- There is still a cross-dataset id mismatch between lore faction id `the-authority` and force parent id `authority`; the current UI tolerates this safely, but the underlying data contract should be normalized later.

## Contributing Notes

Important project rules:

- do not invent missing rules, stats, handlers, units, or weapon data
- preserve citations in generated data and important UI surfaces
- prefer fixing extraction and data contracts in ETL rather than parsing blobs in the UI
- treat OCR-derived card text as untrusted until manually verified

If you are continuing work on the project, start with:

- `blkout-app.md`
- `blkout-implementation.md`
- `blkout-progress.md`
- `session-log.md`

## License

No license file is currently present in the repository.

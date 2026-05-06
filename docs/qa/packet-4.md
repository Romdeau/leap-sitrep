# Packet 4 QA

- Verified the new Packet 4 read-only reference routes against the generated datasets already in `public/data/` rather than against placeholder bootstrap fixtures.
- Confirmed the active seed slice surfaces the intended entities from `blkout-implementation.md`:
  - lore: `/lore`, `/lore/timeline`, and `/lore/factions/the-authority`
  - rules: `/rules` and `/rules/core` covering `movement`, `combat` for shooting, `reactions`, `smoke`, `control-points`, and `data-attacks`
  - force: `/forces/harlow-1st-reaction-force`
  - units: `/units/harlow-control-team`, `/units/harlow-assault-team`, and `/units/harlow-springbok-ai`
  - scenario: `/scenarios/dockyard-assault`
  - glossary: `/glossary`
- Confirmed the rules UI renders effective Packet 2 overlays for `reactions`, `data-attacks`, `control-points`, and `smoke`, and keeps citations visible beside the displayed text.
- Confirmed the `/rules` module now surfaces the merged universal special rules from `markdown/special-rules.md`, including `Smoke Grenade | X"`, and search can return USR records from that source.
- Confirmed the force and unit routes display Packet 3 verified Harlow content from `public/data/forces/index.json`, including card ids and card-backed citations.
- Confirmed the scenario detail route renders `Dockyard Assault` setup, scoring, special rules, and source citation from `public/data/scenarios/core.json`.
- Confirmed the search overlay returns seed-slice results for queries such as `return fire`, with routes resolving to the Packet 4 reference pages instead of placeholders.
- Confirmed table-side mobile lookup remains available from the fixed bottom navigation by adding a dedicated mobile Search action; the smoke test opens it and finds `Harlow 1st Reaction Force` from the generated search index.
- Confirmed `public/data/forces/index.json` now uses canonical `faction` ids such as `the-authority`, matching `public/data/lore/index.json` without a Packet 4 UI compatibility workaround.
- Current limitation: this session tightened automated mobile-navigation coverage and production build validation, but a browser/device visual pass at phone and desktop sizes should still be done before marking Packet 4 complete.

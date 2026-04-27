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
- Confirmed the force and unit routes display Packet 3 verified Harlow content from `public/data/forces/index.json`, including card ids and card-backed citations.
- Confirmed the scenario detail route renders `Dockyard Assault` setup, scoring, special rules, and source citation from `public/data/scenarios/core.json`.
- Confirmed the search overlay returns seed-slice results for queries such as `return fire`, with routes resolving to the Packet 4 reference pages instead of placeholders.
- Known limitation: `public/data/forces/index.json` currently uses `parentLoreFactionId: "authority"` while the lore dataset uses the canonical faction id `the-authority`. Packet 4 works around this mismatch in the UI so the slice remains usable, but the underlying cross-dataset id mismatch should be normalized in a follow-up.
- Known limitation: this session included automated route/search coverage and a production build, but not a browser-based manual phone-size QA pass yet.

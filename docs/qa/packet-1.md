# Packet 1 Manual QA Notes

Date: 2026-04-27

## Source checks

- Verified lore timeline record `2030` in `public/data/lore/index.json` against `markdown/BLKOUT-Year-Two-Lore-Primer.md` lines 23-27. Generated summary and citation point to the ABOL discovery / LEAP entry.
- Verified scenario record `dockyard-assault` in `public/data/scenarios/core.json` against `markdown/BLKOUT-PRINT-AT-HOME-RULEBOOK.md` lines 650-714. Table size, hardpoints, points of interest, setup, scoring, and named special rules are preserved with the correct citation window.
- Verified FAQ record `Does a Unit keep its Armory Item?` in `public/data/rules/supplemental.json` against `markdown/BLKOUT_Supplemental_4-26.md` lines 269-272.
- Verified USR record `Heavy` in `public/data/rules/supplemental.json` against `markdown/BLKOUT_Supplemental_4-26.md` lines 750-752.

## Dataset checks

- Confirmed generated datasets now live under `public/data/` and are produced by `bun run build:data` rather than hand-maintained fixtures.
- Confirmed `public/data/source-registry.json` preserves source metadata, canonical status, and precedence ranking.
- Confirmed lore, rules, supplemental, and scenario datasets include `generatedAt`, `version`, `sourceDocumentIds`, and citations.

## Known limitations

- Core rule extraction is reliable for the seed Packet 1 records but still includes some inline heading text from the source formatting. Packet 2 can normalize presentation further while building the effective-rules layer.
- Supplemental FAQ extraction is strong for single-question entries, but a few multi-line OCR-like question blocks still need refinement if we want cleaner per-question splitting before search work in Packet 2.
- Some scenario special-rule entries still include adjacent flavor text where the source itself places fiction copy directly after the named rule text.

## Follow-up

- Continue simplifying scenario parsing now that the rulebook headings and section ordering have been manually normalized.

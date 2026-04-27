# Packet 2 Manual QA Notes

Date: 2026-04-27

## Effective rules checks

- Verified `effective-control-points` in `public/data/rules/core.json` merges the core rulebook `CONTROL POINTS` text with the matched play supplemental override from `markdown/BLKOUT_Supplemental_4-26.md` lines 84-100.
- Verified `effective-smoke` in `public/data/rules/core.json` preserves the core smoke text and appends the matched play smoke override from `markdown/BLKOUT_Supplemental_4-26.md` lines 126-132.
- Verified `effective-reactions` in `public/data/rules/core.json` attaches reaction-focused FAQ clarifications from `markdown/BLKOUT_Supplemental_4-26.md` lines 418-428.

## Linkage checks

- Confirmed FAQ citations in `public/data/rules/core.json` now carry `sectionId` links for movement, combat, and reactions where rule linkage was confidently inferred.
- Confirmed broad `general` FAQ entries are no longer force-linked to unrelated core rules when the supplemental topic and question text do not provide a reliable rules section match.
- Confirmed reaction-relevant FAQ entries filed under adjacent supplemental topics still resolve to `reactions` when their question text explicitly references Return Fire, Overwatch, or reaction timing.
- Confirmed errata entries under the `EXPLOSIVES AND BLAST` supplemental heading now link directly to `combat` via explicit heading mapping instead of regex-only fallback.
- Confirmed effective rule citations include both the core rulebook citation and the supplemental citation used for the override or clarification.

## Search checks

- Verified `public/data/search/index.json` contains an alias map for `CQC`, `AI`, `EMP`, `AP`, `UTG`, `return fire`, and `close quarters combat`.
- Verified search records exist for `Twin Moons Program`, `Dockyard Assault`, and reaction-related FAQ entries including `Return Fire`.
- Verified effective rule records are indexed separately from base rule records so later UI can surface current text directly.

## Known limitations

- Supplemental parsing still does not produce a clean rules-linked override for `data-attacks`; the relevant clarifications are present in the source but remain mixed with nearby content in section 5.
- FAQ and errata linkage now prefers normalized topic or heading mappings first, with a smaller keyword fallback for ambiguous supplemental wording.
- Scenario search summaries still include flavor text in some records because the source formatting blends mechanics and narrative in the same labeled sections.

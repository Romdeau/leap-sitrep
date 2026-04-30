# Packet 5 QA

- Implemented the first core builder slice at `/builder` using the verified Harlow force dataset from Packet 3.
- Confirmed the builder does not invent points, handlers, BLKLIST options, matched play rules, or unverified card data.
- Confirmed the legal draft state is exactly 1 verified force card plus 3 unit cards from the selected force: Harlow 1st Reaction Force, Harlow Control Team, Harlow Assault Team, and Harlow Springbok AI.
- Confirmed saved rosters persist through `localStorage` under `leap-sitrep.rosters.v1` and render as readable saved summaries.
- Confirmed saved rosters can be loaded back into the draft form and duplicated locally without changing the original saved roster.
- Confirmed saved roster summaries now surface their current legality status, so stale or malformed local data is not silently treated as usable.
- Confirmed duplicate draft unit selections show slot-level guidance and keep `Save roster` disabled until the core group is legal again.
- Confirmed the builder links back to force and unit source routes so users can inspect the verified Packet 3 source-backed records.
- Automated coverage includes pure validation/storage/duplication tests plus app smoke tests that save, reload, and duplicate a legal Harlow roster through local persistence.
- Manual source check: `markdown/BLKOUT-PRINT-AT-HOME-RULEBOOK.md` lines 310-330 defines the supported core group as one Force Card and three Unit Cards from that Force, with the Harlow example using Harlow Control Team, Harlow Assault Team, and Harlow Springbok Unit Card. The builder stays within that sourced assumption and does not add unsupported matched play, handlers, BLKLIST, points, or export behavior.
- Export decision: roster export is intentionally deferred until the builder and match tracker prove the stable table-use summary shape.
- Packet 5 status: complete for the seed Harlow core builder slice. Remaining builder expansion belongs to later packets unless a bug is found in this flow.

# Packet 5 QA

- Implemented the first core builder slice at `/builder` using the verified Harlow force dataset from Packet 3.
- Confirmed the builder does not invent points, handlers, BLKLIST options, matched play rules, or unverified card data.
- Confirmed the legal draft state is exactly 1 verified force card plus 3 unit cards from the selected force: Harlow 1st Reaction Force, Harlow Control Team, Harlow Assault Team, and Harlow Springbok AI.
- Confirmed saved rosters persist through `localStorage` under `leap-sitrep.rosters.v1` and render as readable saved summaries.
- Confirmed the builder links back to force and unit source routes so users can inspect the verified Packet 3 source-backed records.
- Automated coverage includes pure validation/storage tests plus an app smoke test that saves a legal Harlow roster and verifies local persistence.
- Current limitation: this is a first Packet 5 sub-slice, not the full exit gate. Roster duplication, broader delete/round-trip edge cases, richer illegal-state UI, and a final manual roster QA pass still need to be completed before Packet 5 can be marked complete.

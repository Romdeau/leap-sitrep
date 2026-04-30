# Packet 6 QA

- Implemented the first core match tracker slice at `/matches` and `/matches/:matchId` using saved Packet 5 rosters and the generated `Dockyard Assault` scenario record.
- Confirmed the match setup stays local-first and stores matches under `leap-sitrep.matches.v1`.
- Confirmed the tracker handles round progression, unit activation state, damage marks, pinned state, destroyed state, manual Overrun scores, control points, initiative notes, hardpoints, points of interest, and a smoke marker.
- Confirmed saved matches can be deleted from setup, and matches whose source roster is missing show a clear recovery message instead of rendering broken unit controls.
- Confirmed the tracker includes a compact table snapshot for mobile/table-side use, summarizing round, ready units, score, control points, pinned/destroyed count, active tokens, and last initiative note.
- Confirmed the UI links back to sourced scenario, core rules, and unit reference pages instead of embedding unsourced rulings.
- Confirmed the tracker does not attempt spatial automation, terrain adjudication, line-of-sight decisions, or inferred scenario logic beyond manual state toggles.
- Automated coverage includes pure match-state tests for match creation, round progression, unit state changes, damage, scoring, control points, initiative notes, token toggles, and local persistence.
- Automated walkthrough coverage starts a Dockyard Assault match from a saved roster, activates a unit, records damage and pinned state, toggles a hardpoint, spends control points, logs initiative, advances the round, and verifies local persistence.
- Automated edge coverage verifies deleting saved matches and surfacing the missing-roster recovery state.
- Packet 6 status: complete for the seed Harlow/Dockyard Assault match tracker slice. Remaining tracker expansion belongs to later packets unless a bug is found in this flow.

# Packet 3 QA

- Verified `public/data/forces/index.json` against the Packet 3 screenshot set in `screenshots/`.
- Confirmed the force card `HFR-6770` against:
  - `screenshots/harlow-1st-side1.png` for the printed card id, title, and force identity.
  - `screenshots/harlow-1st-side2.png` for battle drills, the force rule, and all four armory options.
- Confirmed unit card `HFR-6771` (`Harlow Control Team`) against:
  - `screenshots/harlow-control-team-side1.png` for front-face stats, model count badge, and base weapon `FAL-32C | 24”/1` with `CQB`.
  - `screenshots/harlow-control-team-side2.png` for the activation control text, `Data Spike`, and the specialist `Grenade Launcher | 24”/2` with `Blast (1)`.
- Confirmed unit card `HFR-6772` (`Harlow Assault Team`) against:
  - `screenshots/harlow-assault-team-side1.png` for front-face stats, model count badge, and base weapon `FAL-32C | 24”/1` with `CQB`.
  - `screenshots/harlow-assault-team-side2.png` for `Machine Gunner`, `P34 | 24”/1`, `Cyclic, Heavy`, and the `Team Leader` ready-token transfer text.
- Confirmed unit card `HFR-6773` (`Harlow Springbok AI`) against:
  - `screenshots/harlow-springbok-ai-side1.png` for front-face stats, model count badge, and `FAL-32D | 24”/1` with `CQB, Sustained (1)`.
  - `screenshots/harlow-springbok-ai-side2.png` for `Chaff Discharge`, the two checkbox markers on-card, and `AI, Jump(4)`.
- Confirmed OCR text remains separate from curated records by emitting `public/data/forces/audit.json` with raw line excerpts from `markdown/Unit-Cards-Printable-2026.md`.
- The generated force dataset now follows the canonical card schema directly, including `skill`, `grunts`, `damage-track`, `traits`, and citation-backed `name` fields for rules and abilities.

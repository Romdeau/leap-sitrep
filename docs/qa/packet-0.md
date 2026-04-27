# Packet 0 Manual QA Notes

Date: 2026-04-27

## Source checks

- Verified the route skeleton matches the information architecture in `blkout-app.md` lines 143-163.
- Verified the theme provider state model matches `tech-stack.md` lines 17-20.
- Verified the seed-slice fixture names match `blkout-implementation.md` lines 138-143.

## UI checks

- Confirmed the home hub is the only non-placeholder route in Packet 0.
- Confirmed placeholder routes identify the packet that is expected to fill them in.
- Confirmed mobile bottom navigation exposes the table-relevant top-level routes.
- Confirmed local development now targets `http://localhost:5173/leap-sitrep/` to match the configured Vite base path.

## Data checks

- Confirmed sample generated datasets live under `public/data/` and are labeled as sample records.
- Confirmed source registry entries distinguish planning docs from canonical game documents.

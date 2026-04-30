# App Flow & Layout Improvement Plan

This plan reviews the current LEAP Sitrep page layout and structure (not theming or visual treatment) against the intent in `blkout-app.md` and `blkout-implementation.md`, and proposes concrete updates.

The goal: make the app behave like a *table-side player hub* — fast lookup, rules-aware, citation-honest, and mobile-first — rather than a development-progress demo.

---

## 1. Snapshot Of The Current Structure

### App shell (`src/app/app-shell.tsx`)
- Header stacks: wordmark + faction swatch row, theme controls, full desktop nav, then a "resolved appearance" hint line.
- Single horizontal primary nav with 8 items (Home, Lore, Forces, Rules, Scenarios, Builder, Matches, Glossary).
- Mobile bottom nav rebuilds the same flat nav (sliced to 4 cells + a search button).
- Loading and error states are rendered as page-level cards inside `<Outlet />`.

### Routes (`src/app/router.tsx`, `src/lib/routes/manifest.ts`)
- Flat route table; manifest mostly used to render the bottom nav and a "Primary navigation" card on the home hub.
- Home hub is dominated by packet-status cards ("Packet 4 In Progress", "Verified Packet 3 Data", etc.).
- Reference pages (`reference-ui.tsx`) all use a `SectionIntro` Card with packet badges as the page header.
- Builder and Matches use a different header (`PageHero`), so the visual contract between sections is inconsistent.

### Per-page layout
- Reference pages are long single-column stacks of `Card` blocks with no anchor nav, no sticky meta, no breadcrumb.
- `RulesCoreRoute` renders *all* core seed topics on one giant scroll page; navigates by URL hash but no in-page TOC.
- `LoreHubRoute` only surfaces 2 hand-picked factions; no real index of lore content.
- `ForcesRoute` shows one card grid; no filter, no faction grouping, no unit preview.
- `ScenariosRoute` is a flat link grid; no filter by mode/table size.
- `BuilderRoute` and `MatchDetailRoute` mix workflow controls and read-only state into the same long scroll.
- No global breadcrumbs, no "back to force" patterns beyond a single button, no "related rules" sidecars.

### Cross-cutting gaps vs `blkout-app.md`
- Command palette exists but is hidden behind a button label "Search"; not exposed as the primary lookup affordance.
- No "Recents / Favorites / Active match" surface anywhere in the shell, even though the spec calls for it on the home hub and as a global feature.
- No mobile-specific layout for tracker/builder beyond bottom nav (the tracker spec says it must work *during play*).
- No persistent "active match" indicator — once you leave `/matches/:id` it disappears.
- Rule pages don't show "related units / scenarios / USRs" sidecars even though the data is there.

---

## 2. Problems To Solve (Layout & Structure Only)

| # | Problem | Impact |
|---|---------|--------|
| P1 | Page headers are inconsistent (`SectionIntro` Card vs `PageHero`). | Every section feels like a different app; hierarchy is muddy. |
| P2 | Home hub is a packet-status dashboard, not a table-side hub. | Players don't see recents, active match, or fast jumps. |
| P3 | Flat top nav hides the Reference vs Play split called out in the manifest (`section: "Reference" \| "Play" \| "Hub"`). | No mental model for what's a lookup vs a tool. |
| P4 | Rule, force, unit, and scenario pages are single tall scrolls with no in-page TOC, breadcrumb, or related-content sidebar. | Hard to navigate at a table on a phone or tablet. |
| P5 | Search is buried as a labelled button. | Spec calls for `cmdk`-grade one-step lookup as a primary affordance. |
| P6 | Mobile bottom nav repeats the desktop nav verbatim (and silently truncates to 4 items). | Item visibility is fragile; no role-specific mobile flow. |
| P7 | Active match has no global presence. | Players lose their tracker as soon as they navigate. |
| P8 | Builder and Tracker are designed as desktop two-column grids; not optimised for vertical phone use during play. | Misaligned with "mobile-first for table use." |
| P9 | No breadcrumb / back-context. | Lore → Faction → Force → Unit chains lose orientation. |
| P10 | Effective-rule overlays, FAQ, errata are shown in the same column as primary text rather than as a clearly separable side panel on desktop. | Hard to scan "what changed" at a glance. |
| P11 | "Reference status card" and "Primary navigation card" leak Packet/dev metadata into the player-facing UI. | Wrong audience. Should move to a dev/admin route. |
| P12 | Loading and error states swallow the whole `<Outlet />` instead of letting the shell stay navigable. | Reload spinners block navigation/search. |

---

## 3. Target Information Architecture

Reorganise around three top-level *modes* that match the manifest's `section` field, and let the shell reflect that.

```
Hub        → /                       (home: recents, active match, quick lookup)
Reference  → /lore   /forces   /rules   /scenarios   /glossary
Play       → /builder   /matches   /matches/:id  (live tracker)
```

Routes themselves stay almost identical to today (the manifest is fine). Changes are in *grouping* and *layout*, not URLs.

### Sub-IA refinements
- `/lore` becomes a real index: timeline link, faction list (all of them, grouped by allegiance), settlements, flora/fauna sections — not just two hand-picked cards.
- `/forces` groups forces by parent lore faction and previews their units inline.
- `/rules` becomes a hub with three lanes: Core, Matched Play, USR/Glossary — with a persistent in-page TOC on `/rules/core`.
- `/scenarios` gains filter chips: mode, table size, hardpoint count.
- `/builder` gains a wizard step structure (Force → Units → Notes → Save) instead of one tall form.
- `/matches/:id` separates "table snapshot" (always visible / sticky) from secondary panels.

---

## 4. App Shell Changes

### 4.1 Header
- **Replace** the current 3-row header (wordmark+swatches / utility / nav / appearance hint) with a 2-row header:
  - Row 1: wordmark, **prominent search affordance** (input-styled, `Cmd/Ctrl-K`), theme toggle cluster (consolidated into one menu), faction swatches collapsed into a small popover.
  - Row 2: section nav (Hub / Reference / Play) with sub-nav revealed on hover/active.
- Drop the "Mode dark · Faction Authority" hint line; surface it inside the theme menu instead.

### 4.2 Primary nav model
- Top-level nav becomes the 3 *sections*. The active section reveals a secondary nav strip directly underneath (Lore | Forces | Rules | Scenarios | Glossary, etc.).
- This matches `manifest.section` and mirrors how players actually think (looking something up vs running a game).

### 4.3 Persistent Active-Match strip
- When a match exists in localStorage and is "in progress," show a slim sticky strip under the header (or above the mobile bottom nav) with: scenario name, round, score, "Resume" button.
- Spec calls this out as "active matches" on the home hub — promote it to a global affordance so it survives navigation.

### 4.4 Breadcrumbs
- Add a thin breadcrumb row under the header on all detail pages (`Lore / Authority / Harlow 1st`, `Forces / Harlow 1st / Control Team`, `Rules / Core / Smoke`).
- Computed from the route + current entity.

### 4.5 Loading / error
- Move the "Loading reference datasets" Card out of the main outlet so the shell (search, nav, theme) stays interactive.
- Render a slim top progress bar + skeletons in each route instead of a full-page card.

### 4.6 Mobile shell
- Bottom nav becomes 4 fixed cells: **Home, Reference, Play, Search**. Reference and Play open a sheet with their sub-routes.
- This stops the silent slice-to-4 logic in `app-shell.tsx` and gives mobile a stable IA.
- Active match strip docks above the bottom nav.

---

## 5. Page-Level Layout Changes

### 5.1 Standardise the page header
- **Adopt `PageHero` everywhere.** Delete `SectionIntro` from `reference-ui.tsx`.
- Move all "Packet N" / "Verified Packet 3 Data" / "Reference Slice" badges out of player-facing pages. They belong in `dev/components` or a new `/dev/status` route.
- Page-hero `actions` slot becomes the canonical home for "Open timeline / Open glossary / Back to force" buttons.

### 5.2 Standardise the page body
Every detail page should follow this grid on desktop, collapsing to a single column on mobile:

```
┌─────────── PageHero ────────────────────────────────────┐
├─ Breadcrumb ────────────────────────────────────────────┤
├──────────────────────┬──────────────────────────────────┤
│ Primary content      │ Side rail                        │
│ (rule body / unit    │ - In-page TOC (sticky)           │
│  stats / scenario    │ - Related entities               │
│  setup)              │ - Citations                      │
│                      │ - "Jump to rule" links           │
└──────────────────────┴──────────────────────────────────┘
```

Concrete per page:

| Page | Primary | Side rail |
|------|---------|-----------|
| `/rules/core` | Sticky topic TOC + each topic as a section anchor; effective-rule diff inline. | Linked FAQ, errata, related USRs, citations. |
| `/rules/usr/:slug` | Current text + notes. | Related rules, related units, citations. |
| `/forces/:id` | Force rule, battle drills, armory, units list. | Lore alignment link, citations, "open builder with this force." |
| `/units/:id` | Stat block, weapons, abilities, specialists. | Parent force, related USRs, citations, "use in builder," "view in active match" if present. |
| `/scenarios/:id` | Setup, scoring, special rules tabs. | Hardpoints/POIs summary, related rules, "start match." |
| `/lore/factions/:slug` | Summary, regions, related forces. | Timeline events featuring this faction, glossary anchors, citations. |

### 5.3 Home hub (`/`)
Replace today's packet status + nav grid with a player-centric layout:

```
PageHero: "LEAP Sitrep — table hub"
─ Active match (if any)             [resume]
─ Recent rosters                    [open / new]
─ Quick lookup (search input)
─ Featured: Authority / Harlow / Dockyard Assault   ← seed-slice tiles
─ Section index: Reference (lore/rules/forces/scenarios) / Play (builder/matches)
```

The "Reference status" + "Primary navigation" cards move to `/dev/components` (or a new `/dev/status` route).

### 5.4 Lore hub (`/lore`)
- Show all factions, not just two; group by lore faction allegiance.
- Add inline links to timeline + glossary (already in the actions slot — keep).
- Add a "Settlements & ABOL" section card when that data lands.

### 5.5 Rules hub (`/rules`) and `/rules/core`
- `/rules` becomes a 3-tab landing: Core | Matched Play | USR.
- `/rules/core` adds a left-rail (or top-strip on mobile) sticky TOC of seed topics, with current scroll-spy.
- Each rule card uses a 2-column body (rule body | FAQ + citations side rail) so "effective overlay" is visually separable.

### 5.6 Forces (`/forces`)
- Group forces by parent lore faction header.
- Each force card shows the 3 unit-name chips inline so a player can mentally map "this force has these units" without clicking.

### 5.7 Scenarios (`/scenarios`)
- Add filter chip row: Mode (core/matched), Table size, Has hardpoints, Has POIs.
- Card subtitle shows hardpoint and POI counts as numeric badges.

### 5.8 Builder (`/builder`)
- Restructure as a vertical **wizard with a sticky validation rail** on desktop and **stacked steps with a sticky bottom action bar** on mobile.

```
Step 1 — Force
Step 2 — Units (3 slots)
Step 3 — Notes
Step 4 — Review & Save
```

- Validation messages move into a sticky rail (desktop) or sticky bottom strip (mobile) so players always see legality without scrolling.
- "Saved rosters" becomes a separate route or collapsed accordion below the wizard, not interleaved.

### 5.9 Matches list (`/matches`)
- Two-column on desktop: New match (left) / Saved matches (right) — already close to this. Add an "active match" indicator badge for the most recent in-progress one.

### 5.10 Live tracker (`/matches/:id`)
This is the most table-critical page; the current single tall scroll is wrong for phones.

Target layout:

```
Sticky top:    [Round | Score | Resume scenario | Advance round]
Tabs / segmented control:
  Units  |  Score & CP  |  Tokens  |  Initiative log  |  Export
Body: only the active tab.
```

- On desktop, render as a 2-pane layout: Units list (left, scrollable) + active panel (right, sticky).
- "Table snapshot" stays at the top as a compact metric strip (already exists; promote to sticky).
- Each unit card collapses by default to one row; expanded when active.

---

## 6. Reusable Components To Add Or Reshape

| Component | Status | Purpose |
|-----------|--------|---------|
| `PageHero` | exists, expand usage | unified page header everywhere |
| `Breadcrumb` | new | shell-level orientation |
| `SectionTabs` | new | 3-tab header for `/rules`, `/matches/:id` |
| `SideRail` | new | sticky right column for related/citations/TOC |
| `TopicTOC` | new | sticky in-page TOC for `/rules/core` |
| `ActiveMatchStrip` | new | global persistent match indicator |
| `RecentList` | new | recents/favorites surface for the home hub |
| `FilterChips` | new | scenarios, forces filtering |
| `WizardStepper` | new | builder step structure |
| `EmptyState` | exists but inline; promote | consistent zero-states |
| `SectionIntro` | **delete** | absorbed into `PageHero` |
| `ReferenceStatusCard` | move to `/dev` | dev-only |

---

## 7. Migration Plan (Layout-Only, Phased)

Each phase keeps the app shippable.

### Phase A — Header & Shell Skeleton
1. Introduce 3-section nav (Hub / Reference / Play) with a secondary strip.
2. Replace the loading card with a non-blocking shell-level loader.
3. Add `Breadcrumb` and `ActiveMatchStrip` containers (empty initially).
4. Move dev metadata (`ReferenceStatusCard`) to `/dev/status`.

### Phase B — Page Header Unification
1. Replace every `SectionIntro` usage in `reference-ui.tsx` with `PageHero`.
2. Remove "Packet N" badges from player-facing routes.
3. Add `actions` slots where today's pages have inline buttons.

### Phase C — Detail Page Grid
1. Adopt the `Primary | SideRail` grid on `/forces/:id`, `/units/:id`, `/scenarios/:id`, `/rules/usr/:slug`, `/lore/factions/:slug`.
2. Move citations into the side rail on those pages.
3. Wire breadcrumbs from route + entity.

### Phase D — Rules Browser Restructure
1. Add `TopicTOC` to `/rules/core` with scroll-spy.
2. Convert `/rules` landing into a tabbed hub.
3. Split each rule card into 2-column body so FAQ/errata sit side-by-side with the rule.

### Phase E — Home Hub Rework
1. Replace today's packet/nav cards with `ActiveMatch + Recents + Quick lookup + Seed slice tiles + Section index`.
2. Persist recents/favorites in localStorage.

### Phase F — Builder Wizard
1. Convert `/builder` to a 4-step wizard with a sticky validation rail.
2. Move "Saved rosters" to its own collapsible region.

### Phase G — Tracker Reflow
1. Add segmented control (`Units / Score & CP / Tokens / Initiative / Export`) to `/matches/:id`.
2. Make "Table snapshot" sticky at the top.
3. Collapse unit rows by default on mobile.

### Phase H — Filters & Indices
1. Add filter chips to `/scenarios` and (when catalog grows) `/forces`.
2. Group `/forces` by parent lore faction.
3. Expand `/lore` to index all factions.

### Phase I — Mobile Polish
1. Stable 4-cell mobile bottom nav with sheet-based sub-nav for Reference and Play.
2. Sticky bottom action bars on Builder and Tracker.
3. Verify breadcrumb truncation on small screens.

---

## 8. Out Of Scope For This Plan

These belong to other plans and are deliberately not addressed here:

- Theming, color, typography, iconography (covered by `visual-overhaul.md`).
- Dataset content gaps (handlers, BLKLIST, dusters) — handled by Packet 7.
- Search ranking / alias-map quality — already covered in Packet 2 work.
- Spatial automation, line-of-sight, terrain — explicitly deferred per `blkout-implementation.md`.

---

## 9. Acceptance Signals

The layout/structure refactor is "done" when:

- Every player-facing page uses `PageHero` and a breadcrumb.
- The home hub leads with active match + recents + quick lookup, not packet status.
- `/rules/core` is navigable on mobile in <3 taps to any seed topic.
- Builder and Tracker have sticky validation/score bars during scrolling.
- Active match persists as a strip across all routes when one exists.
- No "Packet N" badge appears outside `/dev/*`.
- Mobile bottom nav is stable (4 cells, never silently sliced).
- Detail pages have a side rail with related entities + citations on desktop, collapsing cleanly on mobile.

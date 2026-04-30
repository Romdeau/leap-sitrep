# Visual Overhaul Plan — LEAP Sitrep

A staged plan to take the app from "shadcn scaffolding" to a cohesive, on-brand companion for **BLKOUT**, drawing the visual language directly from the unit cards in `screenshots/`.

---

## 1. Design Brief

### 1.1 What the unit cards tell us

Looking across `screenshots/black-pact-side2.png`, `screenshots/dusters/dusters-side2.png`, `screenshots/harlow-1st-reaction/*`, and `screenshots/boone-recon-force/*`, BLKOUT's print identity is consistent and strong:

- **Industrial / military-tactical**, not sci-fi-glossy. Reads like a field-issue dossier or weapons manual.
- **Duotone faction art** — every unit's portrait is rendered as a single-channel silhouette in that faction's hero color over a near-black charcoal field with rubble-textured backdrop.
- **Hard-cut geometry.** Rules panels are framed with sharp, asymmetric notch / "circuit-trace" shapes (the curved horizontal connector with the small circular node). This is the single most identifiable shape language in the brand.
- **Registration corners.** Every card has crop/registration ticks at its four corners (and sometimes mid-edges). These are technical-document signifiers — and a near-free way to make any panel in the app feel like print.
- **Dense, all-caps headers** in a heavy condensed sans (BATTLE DRILLS, FORCE RULE, ARMORY, FACTION NAME). Body type is a clean humanist sans, **never decorative**.
- **Barcode / data-matrix glyphs** on every card (the pixel cluster next to the unit code). These read as "asset tag" and are great as tiny accents inline with stats.
- **Stat icons** are minimal monochrome: a crosshair (Shoot), an up-arrow (Move), a shield (Armor) — line-weight icons on the faction color, never filled.
- **The cutout "tab" with QR code** at the bottom-right of each card is a strong recurring component motif: black trapezoidal panel with a notched corner and a yellow/red highlight strip. This is the visual cousin of a footer/CTA card.

### 1.2 Faction palettes (sampled from the screenshots)

| Faction | Hero color | Surface | Accent | Notes |
|---|---|---|---|---|
| **Black Pact Syndicate** | `#F5C518` (bullion yellow) | `#0E0E0E` near-black | `#C8202C` warning red | The user's preferred palette. Yellow + black + red is the "default" brand. |
| **The Dusters** | `#E8662B` (rust orange) | `#1A0F0A` warm black | `#F3D08C` sand highlight | Warm, oxidized industrial. |
| **Harlow 1st Reaction** | `#D2A516` (mustard gold) | `#15110A` ink | `#E8E1C9` parchment | More executive / corporate-merc feel. |
| **Boone Recon** | `#6B8E5A` (drab olive) | `#0F1410` field green-black | `#C8B98A` khaki | Recon / camo. |
| **Authority (red panel)** | `#B61F25` (signal red) | `#0E0E0E` | `#FFFFFF` | Deep crimson rules panels. |

> **Decision: the user explicitly called out `black-pact-side2.png`. That palette becomes the canonical "BLKOUT" theme** — yellow + crimson + ink-black. Faction tints become **theme variants**, not separate themes.

### 1.3 Anti-goals

- No gradients on chrome (the current radial-gradient body background fights every theme — we'll kill it).
- No purple, no blue accent. The current `signal` and `executive` palettes feel like generic SaaS dashboards and clash with the source material. They will be deleted.
- No glassmorphism / heavy backdrop-blur outside of modal scrims.
- No more giant rounded-3xl cards — print cards are nearly square-cornered; we'll move to a tight, near-rectangular radius scale.

---

## 2. Token & Theme Architecture

### 2.1 Move to Tailwind v4 `@theme`

Today every color is consumed via arbitrary-value classes (`bg-[color:var(--surface)]`). Tailwind v4 supports first-class theme tokens via `@theme` in CSS — adopting it gives us proper utilities (`bg-surface`, `text-muted-foreground`, `border-border`) and lets the palette swap automatically.

**Action:** in `src/index.css`, replace the bare `@import "tailwindcss";` with an `@theme` block declaring every semantic token. Themes become a per-`data-theme` override of those same tokens.

### 2.2 New token vocabulary

Expanded from 10 ad-hoc vars to a complete semantic surface. Names follow shadcn conventions so future shadcn primitives drop in cleanly.

**Core surfaces**

- `--background` — body
- `--foreground` — body text
- `--surface` — card/panel base
- `--surface-elevated` — popover, modal, hovered tile
- `--surface-sunken` — inset wells (rules diff blocks, code, stat readouts)
- `--surface-inverse` — black "data tab" panels (footer card, QR tab, unit code header)

**Borders & dividers**

- `--border` — default
- `--border-strong` — section dividers, table outlines
- `--border-faint` — subtle inset rules

**Text**

- `--foreground` — primary
- `--muted-foreground` — secondary, captions, eyebrows
- `--subtle-foreground` — tertiary, metadata (HFR-6770 / DH93745 style codes)
- `--inverse-foreground` — text on `--surface-inverse`

**Brand / accent**

- `--accent` — faction hero color (yellow by default)
- `--accent-foreground` — text on accent (black)
- `--accent-muted` — 12-15% mix of accent into surface, for tinted cells
- `--accent-edge` — used on the notched-tab cutouts and accent-stripe rules

**Semantic**

- `--danger`, `--danger-foreground` — red signal (Black Pact red)
- `--warning`, `--warning-foreground`
- `--success`, `--success-foreground` — kept muted olive, not bright green
- `--info`, `--info-foreground`

**Effects**

- `--ring` — focus outline (= `--accent` at full)
- `--shadow-card` — soft, low-spread (printed-paper feel, not Material)
- `--shadow-elevated` — modal/popover
- `--scrim` — `color-mix(in srgb, black 60%, transparent)` for modal backdrops

**Radius scale (NEW — collapses the current 5-radius mess)**

- `--radius-sm` — 2px (chips inside dense layouts)
- `--radius-md` — 4px (inputs, buttons)
- `--radius-lg` — 8px (cards)
- `--radius-xl` — 12px (page-level hero cards, modal)
- `--radius-pill` — 9999px (badges, status pills only)

These map to Tailwind's `rounded-sm/md/lg/xl/full` after `@theme` registration.

**Typography tokens**

- `--font-display` — condensed heavy sans (see §3)
- `--font-sans` — Inter Variable (kept)
- `--font-mono` — JetBrains Mono Variable (NEW, for codes / stats / data-matrix areas)
- `--text-eyebrow` — `0.6875rem / 1 / 700 / uppercase / 0.18em tracking`
- `--text-display-xl/lg/md/sm` — for unit-code / page-title hierarchy

### 2.3 Theme structure (the big simplification)

**Delete** the entire `dashboardTheme × clayVariant` matrix. The current 9-output system is the source of most ugliness — too many half-finished palettes (the `signal` theme is missing its dark/light split entirely).

**New theme model:** two orthogonal axes, both tightly designed.

| Axis | Values | Purpose |
|---|---|---|
| `data-mode` | `light` \| `dark` (system-resolved) | Light/dark appearance |
| `data-faction` | `blkout` \| `black-pact` \| `dusters` \| `harlow` \| `boone` \| `authority` | Reskins `--accent` and a small set of paired tokens |

`blkout` is the default neutral theme: ink-black surfaces with bullion-yellow accent, crimson danger — i.e. the Black Pact-side-2 palette, treated as the house brand. The other faction values are *tints* of that same theme: only `--accent`, `--accent-foreground`, `--accent-muted`, `--accent-edge`, and `--ring` change. Every other token stays put. This is what makes the app feel coherent across a force-builder session that spans factions.

**Why this is better than today:**

- One canonical visual language; faction switches are clearly cosmetic.
- No more half-built themes leaking into the UI.
- The faction picker in the force builder can drive the theme, so picking "Black Pact" actually tints the chrome — a big affordance win and very on-brand.

### 2.4 Concrete light/dark palette (BLKOUT default)

**Dark (primary, ships as default)**

```
--background: #0B0B0C        /* near-black, slightly cooler than #000 */
--foreground: #ECEAE1        /* warm off-white, like card body text */
--surface: #131315           /* card */
--surface-elevated: #1B1B1E  /* popover, hovered tile */
--surface-sunken: #08080A    /* inset wells */
--surface-inverse: #050505   /* the "data tab" black */
--border: #2A2A2E
--border-strong: #3D3D42
--border-faint: #1F1F22
--muted-foreground: #A6A29A
--subtle-foreground: #6E6A62
--accent: #F5C518            /* Black Pact yellow */
--accent-foreground: #0B0B0C
--accent-muted: #F5C518 @ 14% over --surface
--accent-edge: #F5C518
--danger: #C8202C            /* Black Pact red */
--danger-foreground: #FFF6F1
--ring: #F5C518
--scrim: rgb(0 0 0 / 0.72)
```

**Light**

```
--background: #F4F1E8        /* parchment / printout cream, NOT pure white */
--foreground: #0E0E10
--surface: #FFFEFA
--surface-elevated: #FFFFFF
--surface-sunken: #ECE7DA
--surface-inverse: #0B0B0C   /* still the black tab in light mode */
--border: #2A2A2E @ 18%
--border-strong: #0E0E10 @ 35%
--muted-foreground: #5A554B
--subtle-foreground: #8A8478
--accent: #C99A00            /* darker yellow for AA on light bg */
--accent-foreground: #0B0B0C
--danger: #B61F25
--ring: #C99A00
```

The cream light mode (vs default off-white) is a deliberate match to the parchment-yellow Harlow card and the broader print-doc feel.

### 2.5 Faction tint overrides (examples)

Each faction selector only redefines accent-family tokens:

```
[data-faction="black-pact"] { --accent: #F5C518; --danger: #C8202C; }
[data-faction="dusters"]    { --accent: #E8662B; }
[data-faction="harlow"]     { --accent: #D2A516; }
[data-faction="boone"]      { --accent: #6B8E5A; }
[data-faction="authority"]  { --accent: #B61F25; --danger: #F5C518; }
```

---

## 3. Typography

### 3.1 New type stack

| Role | Font | Source |
|---|---|---|
| Display (`--font-display`) | **Oswald** or **Barlow Condensed** (heavy weights 700/800) | `@fontsource-variable/oswald` or `@fontsource-variable/barlow-condensed` |
| UI/body (`--font-sans`) | **Inter Variable** (kept) | already installed |
| Mono / data (`--font-mono`) | **JetBrains Mono Variable** | `@fontsource-variable/jetbrains-mono` |

Recommended primary: **Barlow Condensed 800** for display. It's the closest free analog to the chunky condensed all-caps used on the cards (FACTION TITLE, SECURITY TEAM, ARMORY, etc.) and pairs well with Inter.

### 3.2 Type scale (registered as Tailwind v4 utilities via `@theme`)

```
--text-eyebrow:  0.6875rem  / 1.0 / 700 / 0.18em tracking / uppercase
--text-meta:     0.75rem    / 1.3 / 500 / 0.04em tracking          (mono, asset codes)
--text-body-sm:  0.8125rem  / 1.5
--text-body:     0.9375rem  / 1.55
--text-body-lg:  1rem       / 1.6
--text-h4:       1.125rem   / 1.25 / 600
--text-h3:       1.375rem   / 1.2  / 600
--text-h2:       1.75rem    / 1.1  / 700  (display, condensed)
--text-h1:       2.5rem     / 1.0  / 800  (display, condensed)
--text-display:  3.5rem     / 0.95 / 800  (display, condensed) — page heroes only
```

### 3.3 The "asset code" treatment

Unit IDs, faction codes, scenario IDs, match IDs (`HFR-6770 / DH93745 / 064567`) get a dedicated treatment everywhere they appear:

- mono font, `--subtle-foreground`, `text-meta` size
- right-aligned in a tight stack of 1–2 lines, beside the display title
- accompanied by a tiny inline data-matrix glyph (see §6)

This treatment exists in the source cards and is currently completely absent from the app.

---

## 4. Component-level Redesign

This is the per-component target state. All target components live (or move to) `src/components/ui/`.

### 4.1 New / extracted shadcn primitives

Currently only `Badge`, `Button`, `Card` exist. Add:

- `Input`, `Textarea`, `Label`, `Select` (tokenized; replaces ~6 copy-pasted variants)
- `Dialog` + `Sheet` (search modal, mobile menu, confirm-export)
- `Tabs` (rules subsections, force detail panes)
- `Separator`
- `Tooltip` (USR keyword definitions on hover)
- `Command` (Cmd-K search; replaces hand-built modal at `reference-ui.tsx:241–375`)
- `Skeleton` (loading states; replaces the "Reference data is loading…" Card)
- `Table` + `ScrollArea` (force/unit listings)

These should be added via `npx shadcn@latest add ...` then immediately re-tokenized to use the new vars (the shadcn defaults won't ship — we override the generated tokens to match §2).

### 4.2 New BLKOUT-specific primitives

These are not shadcn — they encode the brand shape language so it's reusable.

#### `<Panel>` (replaces top-level `<Card>`)

The base "card" of the app. Single bordered rectangle, `--surface`, `--radius-lg`, `--shadow-card`. **No more `rounded-3xl`.** Slots: `header`, `eyebrow`, `title`, `meta` (asset code stack), `actions`, `body`, `footer`.

#### `<RegistrationFrame>`

Wraps any element with the four corner registration ticks seen on every unit card. Pure CSS (`::before`/`::after` + two pseudo-children, or a single SVG mask). Used on:

- the page-hero panel of every route
- every modal / dialog
- the print-export preview

Variants: `corners-only`, `corners-and-mid-edges`, `accent-color` (ticks in `--accent` instead of `--border-strong`).

#### `<NotchPanel>`

The asymmetric notched header strip — the curved-and-circle motif that separates BATTLE DRILLS from the portrait on each card. Implemented as an SVG background. Used as the section header for `Panel`s on faction/force/unit detail pages. Token-aware: notch fill = `--accent`, notch ink = `--accent-foreground`.

#### `<DataTab>`

The black trapezoidal cutout panel with the QR-corner notch from the bottom-right of the cards. In-app uses:

- the footer of `Panel` when an action/CTA is present (e.g. "Export Roster ↓" instead of a flat button row)
- the "scan to view" panel on shareable match URLs (still useful for cross-device handoff via QR)

#### `<StatBlock>`

The Move/Shoot/Armor/Hack readout. Three-icon row, big mono numbers. Replaces the ad-hoc `KeyValueGrid` for unit stats specifically. Uses `lucide-react` icons restyled in `--accent`:

- Crosshair → Shoot
- ChevronsUp → Move
- Shield → Armor
- Cpu → Hack

#### `<DamageTrack>`

Renders N pip circles per the cards' Damage Track. Used in `MatchDetailRoute` to replace the current numeric input. Click-to-fill, keyboard `[`/`]` decrement/increment, `--accent` filled vs `--border` empty. This is the single biggest UX-and-visual upgrade in the match tracker.

#### `<DataMatrixMark>`

A small (~24×24px) procedurally-generated barcode/data-matrix-style block based on a hash of the entity ID. Decorative-only, but it's *the* card-language signifier and shows up on every card. Trivial to render with a deterministic 5×5 boolean grid → SVG rects. Lives next to asset codes.

#### `<EyebrowLabel>`

Concrete extraction of the duplicated `text-xs uppercase tracking-[0.16em]` pattern (24+ duplicated occurrences today). Just `<EyebrowLabel>BATTLE DRILLS</EyebrowLabel>`.

### 4.3 Re-skin existing components

| Component | Change |
|---|---|
| `Badge` | Remove pill-only assumption. Add `square` variant (sharp `--radius-sm`, used inline in stats). Three semantic variants: `accent`, `danger`, `outline`. Drops the redundant uppercase-tracking from base — handled by `EyebrowLabel`. |
| `Button` | Add `size` (`sm/md/lg`), `variant` (`solid/outline/ghost/destructive`). Move to `--radius-md`. **New `data-tab` variant** that renders as a small `DataTab` for the primary CTA on hero panels. Solid button uses `--accent` fill, `--accent-foreground` text — yellow-on-black "ACTIVATE"-style buttons. |
| `Card` | Replaced by `<Panel>`. Keep `Card` as a thin compatibility shim during migration. |
| `Input` / `Select` / `Textarea` | New. `--radius-md`, `--surface-sunken` background, `--border` 1px, focus ring = `--ring` 2px offset. Mono font on numeric inputs. |
| `EmptyState` | Restyle around a centered `RegistrationFrame` with a stenciled "NO DATA" mark and `--subtle-foreground` body copy. |
| `EffectiveRuleDiff` | Keep the inline diff idea — it's the most clever feature in the app. Restyle: removed text in `--danger` with strikethrough, added text on a `--accent-muted` background with a left border in `--accent-edge`. Both prefixed with a `Δ` glyph in mono. |

---

## 5. Layout & Navigation

### 5.1 App shell

`src/app/app-shell.tsx` is the highest-impact file outside of the reference mega-component. Restructure:

```
┌────────────────────────────────────────────────────────────┐
│  [registration-tick]                       [registration]  │
│                                                            │
│   BLKOUT/SITREP  ─── faction strip ───   ⌘K  ☼/☾  ⚙        │
│   ▔▔▔▔▔▔▔▔▔▔▔▔                                             │
│   field reference · v0.1                                   │
│                                                            │
│   [Lore] [Forces] [Rules] [Scenarios] [Builder] [Match]    │
│  [registration-tick]                       [registration]  │
└────────────────────────────────────────────────────────────┘
```

- **Wordmark**: `BLKOUT/SITREP` in display-condensed, with a small `--accent` slash. The current `<h1>LEAP Sitrep</h1>` is generic.
- **Faction strip**: a 1px row of 6 swatches showing the active faction tint; clicking opens a popover faction picker which sets `data-faction` on `<html>`. **Replaces the inline Theme Provider card.**
- **Theme controls** (light/dark, settings) collapse into icon buttons in the right cluster — *not* a giant card in the header.
- **Registration ticks** on the four corners of the header element itself.
- **Nav**: square-cornered top tabs in display-condensed type, active tab carries an `--accent` underline (4px, no rounding). On mobile, the existing fixed bottom nav stays, but tabs become icon+label, square corners, `--accent` highlight on active.

### 5.2 Page hero pattern

Every route gets a consistent hero `Panel`:

```
┌─ RegistrationFrame ──────────────────────────────────────┐
│  EYEBROW                       ASSET-CODE  [data-matrix] │
│  PAGE TITLE (display-condensed)                          │
│  ──── notch divider in --accent ────                     │
│  Short body description (1–2 lines, --muted-foreground)  │
└──────────────────────────────────────────────────────────┘
```

Replaces the current `SectionIntro` + Packet-badge mess.

### 5.3 Background

Kill the radial+linear gradient at `index.css:123–125`. Replace with:

- Solid `--background`.
- A very subtle (8–10% alpha) noise/grit SVG overlay fixed to the viewport — sells the "field manual" texture without color contamination. One asset, ~3kb gzipped.
- An optional single hairline `--border-faint` horizontal rule at `top: 64px` to anchor the header.

---

## 6. Iconography & Decorative Assets

To bridge the gap from "shadcn default" to the card aesthetic without commissioning art:

1. **Stat icons** — use `lucide-react`'s `Crosshair`, `ChevronsUp`, `Shield`, `Cpu`, `Move`, `Zap`. Keep them outline-only at 1.5px stroke, sized 14–18px, in `--accent`. Forbid filled icons in chrome.
2. **Faction marks** — generate simple SVG glyph marks per faction (the user's BLKOUT logo / Harlow horns / Boone wings show up consistently on cards). For the overhaul: ship one **placeholder geometric mark per faction** as inline SVG in `src/assets/factions/*.svg`; mark them as design TODOs for real art.
3. **Data-matrix glyphs** — generated procedurally as described in §4.2.
4. **Registration ticks** — pure CSS, no asset.
5. **Notch shape** — single shared SVG mask at `src/assets/decor/notch.svg`, recolored via `currentColor`.
6. **Background grit** — single tiling SVG noise at `src/assets/decor/grit.svg`, ~2kb.
7. **Favicon / wordmark** — keep the existing G36 favicon (the only actual brand asset in the repo) but add a 32×32 monogram favicon (`B/S` or the `[B]` mark from the Black Pact card) and an SVG wordmark for the header.

No raster art is required to ship the overhaul.

---

## 7. Copy & Content Cleanup

This is technically not "visual" but it's the single biggest perceived-quality upgrade and it lands during the same pass.

- **Delete every "Packet N" badge and copy reference** across the app (~30 instances enumerated in the audit). They're sprint identifiers leaking into product chrome.
- **Delete dev-tooling copy:** "Reading Packet 0 sample generated data from `public/data/`", "Foundation and contracts are live", "Preferred First Vertical Slice", "Seed slice reference data is live", etc.
- **Rename `dashboardTheme` / `clayVariant` references in code to `mode` / `faction`.**
- **Header:** `LEAP Sitrep` → `BLKOUT/SITREP` (or a short user-chosen wordmark).
- **Remove `HomeRoute`, `PlaceholderRoute`, `ReservedRouteNotice`** — confirmed dead exports.

---

## 8. Implementation Plan (staged)

The work is sequenced so each stage is shippable on its own and doesn't break preceding stages.

### Stage 0 — Tokens & theme rewire (1 day)

- Rewrite `src/index.css` around a Tailwind v4 `@theme` block + `data-mode` × `data-faction` selectors per §2.
- Delete `executive`, `signal`, `clay × 4` themes and all references in `theme-types.ts`, `theme-context.ts`, `theme-provider.tsx`.
- Update `useTheme()` API: `{ mode, faction, setMode, setFaction }`.
- Quick-and-dirty "old card" theme controls remain temporarily so we can A/B before stage 4.
- **Acceptance:** every existing screen renders in the new BLKOUT default theme without functional regressions; faction switch tints accent.

### Stage 1 — Typography (½ day)

- Add `@fontsource-variable/barlow-condensed` and `@fontsource-variable/jetbrains-mono`.
- Wire `--font-display`, `--font-sans`, `--font-mono` and the type scale tokens.
- Apply `font-display` to all `<h1>/<h2>` and `EyebrowLabel`; apply `font-mono` to asset codes / numeric stat outputs.
- **Acceptance:** page headers and stats visibly match the cards' type voice.

### Stage 2 — Primitives (1–2 days)

- Add shadcn `Input`, `Select`, `Textarea`, `Label`, `Dialog`, `Tabs`, `Separator`, `Tooltip`, `Command`, `Skeleton`, `Table`, `ScrollArea`. Re-tokenize on insertion.
- Build BLKOUT primitives: `Panel`, `RegistrationFrame`, `EyebrowLabel`, `DataMatrixMark`, `NotchPanel`, `DataTab`, `StatBlock`, `DamageTrack`.
- **Acceptance:** Storybook-style demo route (`/dev/components`, dev-only) renders all primitives in both modes × all factions.

### Stage 3 — App shell (½ day)

- Restructure `app-shell.tsx` per §5.1: wordmark, faction strip, icon-only theme controls, registration ticks, square-cornered nav.
- Replace radial-gradient body background with grit overlay (§5.3).
- Strip every Packet badge / dev copy callout from the header.
- Replace Cmd-K modal with shadcn `Dialog` + `Command`.

### Stage 4 — Reference UI split & restyle (2–3 days)

- Split `src/features/reference/reference-ui.tsx` (1,592 lines) into per-route files under `src/features/reference/routes/*` and per-component files under `src/features/reference/components/*`. This is the precondition for any sane re-skin.
- Apply the page-hero pattern (§5.2) to every route.
- Replace `Card`/`KeyValueGrid` instances on unit/scenario detail with `Panel` + `StatBlock`.
- Restyle `EffectiveRuleDiff` per §4.3.
- Delete `home-route.tsx`, `placeholder-route.tsx`, `ReservedRouteNotice`.

### Stage 5 — Builder & Matches (1–2 days)

- Builder: faction picker drives `data-faction`. Roster slots become small `Panel`s with `StatBlock` previews. Validation chips become `Badge variant="danger" square`. Export preview wraps in `RegistrationFrame` so it reads like a printable dossier.
- Matches: replace numeric damage `<input>`s with `DamageTrack`. Activation buttons become solid `--accent` "ACTIVATE" buttons in display-condensed type. Initiative log becomes a mono-typed scrolling table (`Table` + `ScrollArea`).

### Stage 6 — Polish (½ day)

- Remove the legacy `Card` shim, dead theme types, and the now-unused `useDashboardTheme` selector code.
- Visual QA pass across all 17 routes in light × dark × six faction tints.
- Accessibility pass: `--accent` on `--surface` must hit AA for all six factions in both modes (the boone olive needs verification; may need a slightly punchier `#7AA968` for light mode).
- Capture before/after screenshots for the README.

**Total: ~6–8 working days.**

---

## 9. Acceptance Criteria

The overhaul is "done" when:

1. The default visual matches the **black-pact-side2.png** palette: ink-black surfaces, bullion-yellow accents, crimson danger.
2. Every page hero is a `Panel` with registration ticks, an eyebrow label, a display-condensed title, and (where applicable) a mono asset code with a data-matrix mark.
3. There is **one** card radius (`--radius-lg`) and **one** input radius (`--radius-md`). No `rounded-3xl` survives.
4. The header contains a wordmark, a 6-swatch faction strip, search and theme **icons** — no Theme Provider card, no Packet badges, no dev copy.
5. Faction selection in the builder live-tints `--accent` across the entire app.
6. Damage tracks render as pip rows; stat blocks render as icon+number rows; both match the cards' visual language.
7. `dashboardTheme`, `clayVariant`, `HomeRoute`, `PlaceholderRoute`, `ReservedRouteNotice`, and the body radial gradient are all removed from the codebase.
8. All AA contrast checks pass in both modes for every faction.
9. A new dev-only `/dev/components` route exists and renders all primitives across the theme matrix as a regression target.

---

## 10. Risks & Open Questions

- **Font licensing.** Barlow Condensed and JetBrains Mono are both OFL — safe. Confirm before adding.
- **Faction art.** This plan ships geometric placeholder marks per faction. Real faction logos (the BLKOUT mark, Harlow horns, Boone wings, the Pact `[B]`) eventually need licensed/commissioned vector art. Flag as a separate follow-up.
- **Print export.** The `RegistrationFrame` + `Panel` system is print-friendly by design and would let us add a "Print Roster" view that genuinely looks like the source cards. Out of scope for this overhaul but worth noting — it's nearly free once these primitives exist.
- **Theme migration for existing localStorage values.** Users with stored `executive`/`signal`/`clay` will hit invalid values; the new `useTheme` hook should silently coerce unknown values back to defaults.
- **The `signal` theme bug** (missing dark variant) is moot once the theme system is replaced, but worth a one-line note in the migration commit.

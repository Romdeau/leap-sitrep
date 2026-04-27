# Technology Stack

## Core Runtime and Framework

- **Package manager and primary script runner:** Bun (`bun@1.3.5`)
- **Supported Node runtime:** Node.js 24.x (`.nvmrc` = `24`, `engines.node` = `>=24 <26`)
- **Language:** TypeScript 6
- **Framework:** React 19
- **Bundler and dev server:** Vite 8
- **Routing:** React Router DOM 7

## UI and Styling

- **Component system:** shadcn/ui (`components.json` uses the `radix-vega` style registry)
- **Primitive foundations:** `radix-ui` plus selected `@radix-ui/*` packages used by generated UI wrappers
- **Styling engine:** Tailwind CSS v4 via `@tailwindcss/vite`
- **Token system:** CSS-first theme tokens defined in `src/index.css`, driving 4 dashboard theme variants and Clay sub-variant palettes
- **Icons:** Lucide React
- **Theme support:** App-level `ThemeProvider` managing appearance mode (`light`/`dark`/`system`), dashboard theme variant (`readable`/`executive`/`signal`/`clay`), and Clay sub-variant palette (`brutalist`/`gunmetal`/`weathered`/`clean`). State is persisted to `localStorage` and synced to `<html>` via class names and data attributes. See [docs/theming.md](../docs/theming.md).
- **Fonts:** `@fontsource-variable/inter` with theme-specific display font fallbacks defined in CSS

## Data Visualization and Dashboard Libraries

- **Charts:** Recharts
- **Tables:** `@tanstack/react-table`
- **Command-style interactions:** `cmdk`
- **PDF / export helpers:** `html2canvas`, `jspdf`

## Authentication and Access Control

- **OIDC client integration:** `react-oidc-context`
- **Underlying OIDC library:** `oidc-client-ts`
- **Identity provider:** Keycloak realm-based auth, with local dev support via `docker compose`
- **Authorization model:** Keycloak realm roles enforced in React route and UI permission guards

## Utility Libraries

- **Class composition:** `clsx`, `tailwind-merge`, `class-variance-authority`
- **Animation helper:** `tw-animate-css`

## Testing and Quality

- **Test runner:** Vitest 4
- **DOM environment:** `happy-dom`
- **Component testing:** `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`
- **Coverage:** `@vitest/coverage-v8`
- **Linting:** ESLint 10 with TypeScript, React Hooks, React Refresh, and Testing Library plugins
- **Type checking:** TypeScript project build via `tsc -b`

## Development Workflow Tooling

- **Git hooks:** Husky
- **Staged file linting:** `lint-staged`
- **Build-time data preparation:** ETL scripts run through Bun
- **AWS data ingestion scripts:** AWS SDK v3 clients used in `scripts/` for Marketplace and account data collection

## Delivery and Local Infrastructure

- **Containerized build:** Multi-stage Docker build using Bun in the build stage and Nginx to serve the SPA
- **Deployment path assumption:** App is built for the `/leap-sitrep/` base path (for local dev this resolves to `http://localhost:5173/leap-sitrep/`)
- **Local auth services:** `docker-compose.yml` provisions Keycloak 26 and Postgres 18 for local authentication testing

## Repository Structure Notes

- Application code lives under `src/`.
- Shared generated UI primitives live under `src/components/ui/` and should be extended carefully to preserve shadcn compatibility.
- ETL and data-generation scripts live under `scripts/`.
- Static and generated dashboard datasets live under `public/data/`.
- Planning and workflow documentation lives under `conductor/`.

## Important Accuracy Notes

- Do not document `@dnd-kit` as part of the active stack unless it is reintroduced; it is not part of the current installed dependencies.
- Do not assume Prettier is part of the repository workflow; formatting is currently governed by the existing code style and ESLint-driven checks.
- Do not list `vaul`, `marked`, `@base-ui/react`, or `react-is` as active dependencies unless they are reintroduced; they are not part of the current installed dependencies.

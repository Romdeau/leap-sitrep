# LEAP Sitrep Theme Provider

`LEAP Sitrep` uses a single app-level `ThemeProvider` that manages:

- appearance mode: `light`, `dark`, or `system`
- dashboard theme variant: `readable`, `executive`, `signal`, or `clay`
- clay sub-variant palette: `brutalist`, `gunmetal`, `weathered`, or `clean`

State is stored in `localStorage` under `leap-sitrep.theme` and synchronized to `<html>` with:

- the `dark` class for resolved dark mode
- `data-appearance`
- `data-dashboard-theme`
- `data-clay-variant`

Theme tokens are declared in `src/index.css`, and route/layout components consume the tokens through utility classes based on CSS custom properties.

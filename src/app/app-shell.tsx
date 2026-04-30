import { Monitor, Moon, RotateCcw, Sun } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EyebrowLabel } from "@/components/ui/eyebrow-label";
import { useTheme } from "@/app/providers/use-theme";
import {
  FACTION_LABELS,
  FACTION_SWATCH,
  FACTION_VALUES,
  type AppearanceMode,
  type Faction,
} from "@/app/providers/theme-types";
import { MobileSearchButton, SearchOverlay } from "@/features/reference/reference-ui";
import { useReferenceDataState } from "@/features/reference/use-reference-data";
import { primaryNavigation } from "@/lib/routes/manifest";
import { cn } from "@/lib/utils";

function navClassName(isActive: boolean) {
  return cn(
    "relative inline-flex items-center justify-center px-3 py-2 font-display text-[0.8125rem] font-semibold uppercase tracking-[0.14em] transition-colors",
    isActive
      ? "text-[color:var(--accent)]"
      : "text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]",
  );
}

function ActiveUnderline({ isActive }: { isActive: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-2 -bottom-[1px] h-[3px] transition-colors",
        isActive ? "bg-[color:var(--accent)]" : "bg-transparent",
      )}
    />
  );
}

function FactionSwatch({
  faction,
  isActive,
  onClick,
}: {
  faction: Faction;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={`Faction tint: ${FACTION_LABELS[faction]}`}
      aria-pressed={isActive}
      className={cn(
        "h-6 w-6 rounded-sm border-2 transition-transform",
        isActive
          ? "border-[color:var(--foreground)] scale-110"
          : "border-[color:var(--border-strong)] hover:scale-105",
      )}
      onClick={onClick}
      style={{ backgroundColor: FACTION_SWATCH[faction] }}
      type="button"
      title={FACTION_LABELS[faction]}
    />
  );
}

function AppearanceToggleButton({
  active,
  appearance,
  onClick,
}: {
  active: boolean;
  appearance: AppearanceMode;
  onClick: () => void;
}) {
  const Icon = appearance === "system" ? Monitor : appearance === "dark" ? Moon : Sun;

  return (
    <Button
      aria-label={`Appearance: ${appearance}`}
      aria-pressed={active}
      className={cn(active && "border-[color:var(--accent)] text-[color:var(--accent)]")}
      onClick={onClick}
      size="icon"
      variant="outline"
      title={`Appearance: ${appearance}`}
    >
      <Icon className="size-4" strokeWidth={1.75} />
    </Button>
  );
}

export function AppShell() {
  const { resetTheme, resolvedAppearance, setAppearance, setFaction, theme } = useTheme();
  const referenceDataState = useReferenceDataState();

  const content =
    referenceDataState.status === "loading" ? (
      <Card>
        <CardHeader>
          <EyebrowLabel>Sync</EyebrowLabel>
          <CardTitle>Loading reference datasets</CardTitle>
          <CardDescription>
            Reading lore, rules, supplemental, force, scenario, search, and source registry files from `public/data/`.
          </CardDescription>
        </CardHeader>
      </Card>
    ) : referenceDataState.status === "error" ? (
      <Card>
        <CardHeader>
          <EyebrowLabel className="text-[color:var(--danger)]">Reference Load Error</EyebrowLabel>
          <CardTitle>Reference data failed to load</CardTitle>
          <CardDescription>{referenceDataState.message}</CardDescription>
        </CardHeader>
      </Card>
    ) : (
      <Outlet />
    );
  const mobileNavigation = primaryNavigation.slice(0, referenceDataState.status === "ready" ? 7 : 8);

  return (
    <div className="min-h-screen text-[color:var(--foreground)]">
      <header className="border-b border-[color:var(--border-strong)] bg-[color:var(--surface)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          {/* top row: wordmark + faction strip + utility cluster */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-5">
              <NavLink className="group flex items-baseline gap-1" to="/">
                <span className="font-display text-2xl font-bold uppercase leading-none tracking-wide text-[color:var(--foreground)]">
                  BLKOUT
                </span>
                <span className="font-display text-2xl font-bold uppercase leading-none text-[color:var(--accent)]">
                  /
                </span>
                <span className="font-display text-2xl font-bold uppercase leading-none tracking-wide text-[color:var(--foreground)]">
                  Sitrep
                </span>
              </NavLink>

              <div className="hidden h-6 w-px bg-[color:var(--border)] sm:block" aria-hidden />

              <div className="flex items-center gap-3">
                <EyebrowLabel className="hidden sm:inline">Faction</EyebrowLabel>
                <div className="flex items-center gap-1.5">
                  {FACTION_VALUES.map((faction) => (
                    <FactionSwatch
                      key={faction}
                      faction={faction}
                      isActive={theme.faction === faction}
                      onClick={() => setFaction(faction)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {referenceDataState.status === "ready" ? (
                <SearchOverlay buttonClassName="h-9 px-3 text-xs" />
              ) : null}
              <AppearanceToggleButton
                active={theme.appearance === "light"}
                appearance="light"
                onClick={() => setAppearance("light")}
              />
              <AppearanceToggleButton
                active={theme.appearance === "system"}
                appearance="system"
                onClick={() => setAppearance("system")}
              />
              <AppearanceToggleButton
                active={theme.appearance === "dark"}
                appearance="dark"
                onClick={() => setAppearance("dark")}
              />
              <Button
                aria-label="Reset theme"
                onClick={resetTheme}
                size="icon"
                title="Reset theme"
                variant="ghost"
              >
                <RotateCcw className="size-4" strokeWidth={1.75} />
              </Button>
            </div>
          </div>

          {/* desktop nav */}
          <nav aria-label="Primary" className="hidden border-t border-[color:var(--border-faint)] pt-2 md:block">
            <ul className="flex flex-wrap gap-1">
              {primaryNavigation.map((route) => (
                <li key={route.id}>
                  <NavLink
                    className={({ isActive }) => navClassName(isActive)}
                    end={route.path === "/"}
                    to={route.path}
                  >
                    {({ isActive }) => (
                      <>
                        <span>{route.shortLabel}</span>
                        <ActiveUnderline isActive={isActive} />
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* resolved appearance hint (subtle, replaces the ThemeProvider card) */}
          <div className="flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.16em] text-[color:var(--subtle-foreground)]">
            <span>
              Mode <span className="text-[color:var(--muted-foreground)]">{resolvedAppearance}</span>
            </span>
            <span aria-hidden>·</span>
            <span>
              Faction{" "}
              <span className="text-[color:var(--muted-foreground)]">{FACTION_LABELS[theme.faction]}</span>
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8">{content}</main>

      <nav
        aria-label="Mobile"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[color:var(--border-strong)] bg-[color:var(--surface)] px-3 py-2 md:hidden"
      >
        <div className="mx-auto grid max-w-3xl grid-cols-4 gap-1">
          {mobileNavigation.map((route) => (
            <NavLink
              key={route.id}
              className={({ isActive }) => cn(navClassName(isActive), "px-1 text-center text-[0.6875rem]")}
              end={route.path === "/"}
              to={route.path}
            >
              {({ isActive }) => (
                <>
                  <span>{route.shortLabel}</span>
                  <ActiveUnderline isActive={isActive} />
                </>
              )}
            </NavLink>
          ))}
          {referenceDataState.status === "ready" ? <MobileSearchButton /> : null}
        </div>
      </nav>
    </div>
  );
}

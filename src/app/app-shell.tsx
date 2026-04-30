import { Monitor, Moon, RotateCcw, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { ActiveMatchStrip } from "@/components/ui/active-match-strip";
import { Button } from "@/components/ui/button";
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
import { appRouteManifest } from "@/lib/routes/manifest";
import type { RouteManifestEntry } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

type SectionKey = "Hub" | "Reference" | "Play";

const SECTION_ORDER: SectionKey[] = ["Hub", "Reference", "Play"];

const SECTION_DEFAULT_PATH: Record<SectionKey, string> = {
  Hub: "/",
  Reference: "/lore",
  Play: "/builder",
};

const SECTION_LABEL: Record<SectionKey, string> = {
  Hub: "Home",
  Reference: "Reference",
  Play: "Play",
};

const SECTION_SUBNAV: Record<SectionKey, RouteManifestEntry[]> = {
  Hub: appRouteManifest.filter((route) => route.section === "Hub" && route.nav),
  Reference: appRouteManifest.filter((route) => route.section === "Reference" && route.nav),
  Play: appRouteManifest.filter((route) => route.section === "Play" && route.nav),
};

function activeSection(pathname: string): SectionKey {
  // Best-match by deepest matching route in the manifest.
  let best: { entry: RouteManifestEntry; score: number } | null = null;

  for (const entry of appRouteManifest) {
    if (entry.path === "/") {
      if (pathname === "/") {
        best = { entry, score: 1 };
      }
      continue;
    }

    if (pathname === entry.path || pathname.startsWith(`${entry.path}/`)) {
      const score = entry.path.length;
      if (best === null || score > best.score) {
        best = { entry, score };
      }
    }
  }

  return (best?.entry.section ?? "Hub");
}

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

function TopProgressBar() {
  return (
    <div
      aria-label="Loading reference data"
      aria-live="polite"
      className="h-0.5 w-full overflow-hidden bg-[color:var(--surface-muted)]"
      role="progressbar"
    >
      <div className="h-full w-1/3 animate-[loader_1.2s_ease-in-out_infinite] bg-[color:var(--accent)]" />
      <style>{`
        @keyframes loader {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}

function ReferenceErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="border-b border-[color:var(--danger)] bg-[color:color-mix(in_srgb,var(--danger)_8%,var(--surface))]"
      role="alert"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <EyebrowLabel className="text-[color:var(--danger)]">Reference load error</EyebrowLabel>
        <span className="text-xs text-[color:var(--foreground)]">{message}</span>
      </div>
    </div>
  );
}

function MobileSheet({
  items,
  onClose,
  title,
}: {
  items: RouteManifestEntry[];
  onClose: () => void;
  title: string;
}) {
  // Close on Escape so the sheet behaves like a dialog.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      aria-label={title}
      aria-modal="true"
      className="fixed inset-0 z-40 bg-[color:color-mix(in_srgb,var(--foreground)_28%,transparent)] backdrop-blur-sm md:hidden"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-[color:var(--border-strong)] bg-[color:var(--surface)] p-4 pb-24 shadow-[var(--shadow)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <EyebrowLabel>{title}</EyebrowLabel>
          <Button onClick={onClose} size="sm" variant="ghost">
            Close
          </Button>
        </div>
        <ul className="grid grid-cols-2 gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <NavLink
                className="block rounded-md border border-[color:var(--border)] p-3 text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--foreground)] transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                onClick={onClose}
                to={item.path}
              >
                {item.shortLabel}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function AppShell() {
  const { resetTheme, setAppearance, setFaction, theme } = useTheme();
  const referenceDataState = useReferenceDataState();
  const location = useLocation();
  const section = activeSection(location.pathname);
  const subnav = SECTION_SUBNAV[section];
  const [mobileSheet, setMobileSheet] = useState<SectionKey | null>(null);

  return (
    <div className="min-h-screen text-[color:var(--foreground)]">
      <header className="border-b border-[color:var(--border-strong)] bg-[color:var(--surface)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
          {/* Row 1: wordmark + search + theme cluster + faction popover */}
          <div className="flex flex-wrap items-center gap-3">
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

            <div className="ml-auto flex flex-wrap items-center gap-2">
              {referenceDataState.status === "ready" ? (
                <SearchOverlay buttonClassName="h-9 px-3 text-xs" />
              ) : null}
              <div className="hidden h-6 w-px bg-[color:var(--border)] sm:block" aria-hidden />
              <details className="relative">
                <summary
                  aria-label="Faction tint"
                  className="flex h-9 cursor-pointer list-none items-center gap-2 rounded-md border border-[color:var(--border)] px-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                  title={`Faction: ${FACTION_LABELS[theme.faction]}`}
                >
                  <span
                    aria-hidden
                    className="h-3 w-3 rounded-sm border border-[color:var(--border-strong)]"
                    style={{ backgroundColor: FACTION_SWATCH[theme.faction] }}
                  />
                  <span className="hidden sm:inline">{FACTION_LABELS[theme.faction]}</span>
                </summary>
                <div className="absolute right-0 top-full z-30 mt-2 flex flex-wrap items-center gap-2 rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] p-2 shadow-[var(--shadow)]">
                  {FACTION_VALUES.map((faction) => (
                    <FactionSwatch
                      key={faction}
                      faction={faction}
                      isActive={theme.faction === faction}
                      onClick={() => setFaction(faction)}
                    />
                  ))}
                </div>
              </details>
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

          {/* Row 2a: section nav (Hub / Reference / Play) */}
          <nav aria-label="Sections" className="hidden border-t border-[color:var(--border-faint)] pt-2 md:block">
            <ul className="flex flex-wrap gap-1">
              {SECTION_ORDER.map((key) => {
                const isActive = key === section;
                return (
                  <li key={key}>
                    <NavLink
                      className={navClassName(isActive)}
                      end={key === "Hub"}
                      to={SECTION_DEFAULT_PATH[key]}
                    >
                      <span>{SECTION_LABEL[key]}</span>
                      <ActiveUnderline isActive={isActive} />
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Row 2b: sub-nav strip for active section */}
          {subnav.length > 0 ? (
            <nav aria-label={`${SECTION_LABEL[section]} sub-navigation`} className="hidden md:block">
              <ul className="flex flex-wrap gap-1">
                {subnav.map((route) => (
                  <li key={route.id}>
                    <NavLink
                      className={({ isActive }) =>
                        cn(
                          navClassName(isActive),
                          "py-1 text-[0.6875rem] tracking-[0.16em]",
                        )
                      }
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
          ) : null}
        </div>
      </header>

      {referenceDataState.status === "loading" ? <TopProgressBar /> : null}
      {referenceDataState.status === "error" ? (
        <ReferenceErrorBanner message={referenceDataState.message} />
      ) : null}

      <ActiveMatchStrip />

      <main className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8">
        {referenceDataState.status === "ready" ? (
          <Outlet />
        ) : referenceDataState.status === "loading" ? (
          <div
            aria-live="polite"
            className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--muted-foreground)]"
            role="status"
          >
            <EyebrowLabel>Sync</EyebrowLabel>
            <p className="mt-2">Loading reference datasets…</p>
          </div>
        ) : (
          <div
            className="rounded-md border border-[color:var(--danger)] bg-[color:var(--surface)] p-6 text-sm"
            role="alert"
          >
            <EyebrowLabel className="text-[color:var(--danger)]">Reference Load Error</EyebrowLabel>
            <p className="mt-2 text-[color:var(--foreground)]">Reference data failed to load.</p>
            <p className="mt-1 text-[color:var(--muted-foreground)]">{referenceDataState.message}</p>
          </div>
        )}
      </main>

      {/* Mobile bottom nav: stable 4 cells */}
      <nav
        aria-label="Mobile"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[color:var(--border-strong)] bg-[color:var(--surface)] px-3 py-2 md:hidden"
      >
        <div className="mx-auto grid max-w-3xl grid-cols-4 gap-1">
          <NavLink
            className={({ isActive }) => cn(navClassName(isActive), "px-1 text-center text-[0.6875rem]")}
            end
            to="/"
          >
            {({ isActive }) => (
              <>
                <span>Home</span>
                <ActiveUnderline isActive={isActive} />
              </>
            )}
          </NavLink>
          <button
            aria-haspopup="menu"
            aria-expanded={mobileSheet === "Reference"}
            className={cn(
              navClassName(section === "Reference"),
              "px-1 text-center text-[0.6875rem]",
            )}
            onClick={() => setMobileSheet("Reference")}
            type="button"
          >
            <span>Reference</span>
            <ActiveUnderline isActive={section === "Reference"} />
          </button>
          <button
            aria-haspopup="menu"
            aria-expanded={mobileSheet === "Play"}
            className={cn(
              navClassName(section === "Play"),
              "px-1 text-center text-[0.6875rem]",
            )}
            onClick={() => setMobileSheet("Play")}
            type="button"
          >
            <span>Play</span>
            <ActiveUnderline isActive={section === "Play"} />
          </button>
          {referenceDataState.status === "ready" ? (
            <MobileSearchButton />
          ) : (
            <span className={cn(navClassName(false), "px-1 text-center text-[0.6875rem] opacity-50")}>
              Search
            </span>
          )}
        </div>
      </nav>

      {mobileSheet !== null ? (
        <MobileSheet
          items={SECTION_SUBNAV[mobileSheet]}
          onClose={() => setMobileSheet(null)}
          title={SECTION_LABEL[mobileSheet]}
        />
      ) : null}
    </div>
  );
}

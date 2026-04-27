import { RotateCcw } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/app/providers/use-theme";
import type { AppearanceMode, ClayVariant, DashboardTheme } from "@/app/providers/theme-types";
import { SearchOverlay } from "@/features/reference/reference-ui";
import { useReferenceDataState } from "@/features/reference/use-reference-data";
import { primaryNavigation } from "@/lib/routes/manifest";
import { cn } from "@/lib/utils";

const appearanceOptions: AppearanceMode[] = ["system", "light", "dark"];
const dashboardThemeOptions: DashboardTheme[] = ["readable", "executive", "signal", "clay"];
const clayVariantOptions: ClayVariant[] = ["weathered", "gunmetal", "brutalist", "clean"];

function navClassName(isActive: boolean) {
  return cn(
    "rounded-xl px-3 py-2 text-sm transition-colors",
    isActive
      ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]"
      : "text-[color:var(--muted-foreground)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--foreground)]",
  );
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  disabled?: boolean;
}

function SelectField<T extends string>({
  disabled = false,
  label,
  onChange,
  options,
  value,
}: SelectFieldProps<T>) {
  return (
    <label className="flex min-w-[9rem] flex-col gap-2 text-xs uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
      <span>{label}</span>
      <select
        className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm normal-case tracking-normal text-[color:var(--foreground)] disabled:opacity-50"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as T)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AppShell() {
  const { resetTheme, resolvedAppearance, setAppearance, setClayVariant, setDashboardTheme, theme } = useTheme();
  const referenceDataState = useReferenceDataState();

  const content =
    referenceDataState.status === "loading" ? (
      <Card>
        <CardHeader>
          <CardTitle>Loading reference datasets</CardTitle>
          <CardDescription>Reading lore, rules, force, scenario, search, and source registry files from `public/data/`.</CardDescription>
        </CardHeader>
      </Card>
    ) : referenceDataState.status === "error" ? (
      <Card>
        <CardHeader>
          <Badge variant="outline">Reference Load Error</Badge>
          <CardTitle>Reference data failed to load</CardTitle>
          <CardDescription>{referenceDataState.message}</CardDescription>
        </CardHeader>
      </Card>
    ) : (
      <Outlet />
    );

  return (
    <div className="min-h-screen text-[color:var(--foreground)]">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--background)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="accent">Packet 4 Reference Slice</Badge>
                <Badge variant="outline">Packet 0 Theme System</Badge>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">LEAP Sitrep</h1>
                <p className="max-w-3xl text-sm leading-6 text-[color:var(--muted-foreground)] sm:text-base">
                  Local-first BLKOUT reference experience now reading generated lore, rules, force, and scenario datasets,
                  while builder and match flows remain reserved for later packets.
                </p>
              </div>
            </div>

            <Card className="w-full max-w-3xl bg-[color:var(--surface)] lg:w-auto">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Theme Provider</CardTitle>
                <CardDescription>
                  Appearance resolves to <span className="font-medium text-[color:var(--foreground)]">{resolvedAppearance}</span> and syncs to the root document.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <SelectField label="Appearance" onChange={setAppearance} options={appearanceOptions} value={theme.appearance} />
                <SelectField
                  label="Dashboard Theme"
                  onChange={setDashboardTheme}
                  options={dashboardThemeOptions}
                  value={theme.dashboardTheme}
                />
                <SelectField
                  disabled={theme.dashboardTheme !== "clay"}
                  label="Clay Variant"
                  onChange={setClayVariant}
                  options={clayVariantOptions}
                  value={theme.clayVariant}
                />
                {referenceDataState.status === "ready" ? <SearchOverlay /> : null}
                <Button className="gap-2" variant="outline" onClick={resetTheme}>
                  <RotateCcw className="size-4" />
                  Reset
                </Button>
              </CardContent>
            </Card>
          </div>

          <nav className="hidden flex-wrap gap-2 md:flex">
            {primaryNavigation.map((route) => (
              <NavLink
                key={route.id}
                className={({ isActive }) => navClassName(isActive)}
                end={route.path === "/"}
                to={route.path}
              >
                {route.shortLabel}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8">{content}</main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-3 md:hidden">
        <div className="mx-auto grid max-w-3xl grid-cols-4 gap-2">
          {primaryNavigation.slice(0, 8).map((route) => (
            <NavLink
              key={route.id}
              className={({ isActive }) => cn(navClassName(isActive), "text-center text-xs")}
              end={route.path === "/"}
              to={route.path}
            >
              {route.shortLabel}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

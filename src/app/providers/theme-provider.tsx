import {
  useEffect,
  useEffectEvent,
  useState,
  type ReactNode,
} from "react";

import {
  THEME_STORAGE_KEY,
  ThemeContext,
  defaultTheme,
  type ThemeContextValue,
  type ThemeState,
} from "@/app/providers/theme-context";
import { FACTION_VALUES, type Faction } from "@/app/providers/theme-types";

function isFaction(value: unknown): value is Faction {
  return typeof value === "string" && (FACTION_VALUES as readonly string[]).includes(value);
}

function readStoredTheme(): ThemeState {
  if (typeof window === "undefined") {
    return defaultTheme;
  }

  const storedValue = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (storedValue === null) {
    return defaultTheme;
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<ThemeState> & Record<string, unknown>;
    const appearance =
      parsed.appearance === "light" || parsed.appearance === "dark" || parsed.appearance === "system"
        ? parsed.appearance
        : defaultTheme.appearance;
    const faction = isFaction(parsed.faction) ? parsed.faction : defaultTheme.faction;

    return { appearance, faction };
  } catch {
    return defaultTheme;
  }
}

function resolveAppearance(theme: ThemeState): "light" | "dark" {
  if (theme.appearance !== "system") {
    return theme.appearance;
  }

  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeState>(() => readStoredTheme());
  const [resolvedAppearance, setResolvedAppearance] = useState<"light" | "dark">(() =>
    resolveAppearance(readStoredTheme()),
  );

  const applyTheme = useEffectEvent((nextTheme: ThemeState) => {
    const html = document.documentElement;
    const nextResolvedAppearance = resolveAppearance(nextTheme);

    setResolvedAppearance(nextResolvedAppearance);

    html.classList.toggle("dark", nextResolvedAppearance === "dark");
    html.dataset.mode = nextResolvedAppearance;
    html.dataset.appearance = nextTheme.appearance;
    html.dataset.faction = nextTheme.faction;

    // Clean up legacy attributes from older versions
    delete html.dataset.dashboardTheme;
    delete html.dataset.clayVariant;
  });

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  }, [theme]);

  const handleSystemThemeChange = useEffectEvent(() => {
    applyTheme(theme);
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  const value: ThemeContextValue = {
    theme,
    resolvedAppearance,
    setAppearance: (appearance) => {
      setTheme((current) => ({ ...current, appearance }));
    },
    setFaction: (faction) => {
      setTheme((current) => ({ ...current, faction }));
    },
    resetTheme: () => {
      setTheme(defaultTheme);
    },
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

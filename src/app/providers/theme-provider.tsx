import {
  useEffect,
  useEffectEvent,
  useState,
  type ReactNode,
} from "react";

import { THEME_STORAGE_KEY, ThemeContext, defaultTheme, type ThemeContextValue, type ThemeState } from "@/app/providers/theme-context";

function readStoredTheme(): ThemeState {
  if (typeof window === "undefined") {
    return defaultTheme;
  }

  const storedValue = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (storedValue === null) {
    return defaultTheme;
  }

  try {
    return {
      ...defaultTheme,
      ...(JSON.parse(storedValue) as Partial<ThemeState>),
    };
  } catch {
    return defaultTheme;
  }
}

function resolveAppearance(theme: ThemeState): "light" | "dark" {
  if (theme.appearance !== "system") {
    return theme.appearance;
  }

  if (typeof window === "undefined") {
    return "light";
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
    html.dataset.appearance = nextTheme.appearance;
    html.dataset.dashboardTheme = nextTheme.dashboardTheme;
    html.dataset.clayVariant = nextTheme.clayVariant;
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
    setDashboardTheme: (dashboardTheme) => {
      setTheme((current) => ({ ...current, dashboardTheme }));
    },
    setClayVariant: (clayVariant) => {
      setTheme((current) => ({ ...current, clayVariant }));
    },
    resetTheme: () => {
      setTheme(defaultTheme);
    },
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

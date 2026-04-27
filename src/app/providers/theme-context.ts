import { createContext } from "react";

import type { AppearanceMode, ClayVariant, DashboardTheme } from "@/app/providers/theme-types";

export interface ThemeState {
  appearance: AppearanceMode;
  dashboardTheme: DashboardTheme;
  clayVariant: ClayVariant;
}

export interface ThemeContextValue {
  theme: ThemeState;
  resolvedAppearance: "light" | "dark";
  setAppearance: (appearance: AppearanceMode) => void;
  setDashboardTheme: (theme: DashboardTheme) => void;
  setClayVariant: (variant: ClayVariant) => void;
  resetTheme: () => void;
}

export const THEME_STORAGE_KEY = "leap-sitrep.theme";

export const defaultTheme: ThemeState = {
  appearance: "system",
  dashboardTheme: "readable",
  clayVariant: "weathered",
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

import { createContext } from "react";

import type { AppearanceMode, Faction } from "@/app/providers/theme-types";

export interface ThemeState {
  appearance: AppearanceMode;
  faction: Faction;
}

export interface ThemeContextValue {
  theme: ThemeState;
  resolvedAppearance: "light" | "dark";
  setAppearance: (appearance: AppearanceMode) => void;
  setFaction: (faction: Faction) => void;
  resetTheme: () => void;
}

export const THEME_STORAGE_KEY = "leap-sitrep.theme";

export const defaultTheme: ThemeState = {
  appearance: "system",
  faction: "blkout",
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

import { createContext } from "react";

import type {
  ForceDatasetFile,
  LoreDatasetFile,
  RulesDatasetFile,
  ScenarioDatasetFile,
  SearchIndexFile,
  SourceRegistryFile,
} from "@/lib/types/generated";

export interface ReferenceDataBundle {
  sourceRegistry: SourceRegistryFile;
  lore: LoreDatasetFile;
  rules: RulesDatasetFile;
  forces: ForceDatasetFile;
  scenarios: ScenarioDatasetFile;
  searchIndex: SearchIndexFile;
}

export type ReferenceDataState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: ReferenceDataBundle };

export const ReferenceDataContext = createContext<ReferenceDataState | null>(null);

import { useEffect, useState, type ReactNode } from "react";

import { loadPublicJson } from "@/lib/data/json-loader";
import type {
  ForceDatasetFile,
  LoreDatasetFile,
  RulesDatasetFile,
  ScenarioDatasetFile,
  SearchIndexFile,
  SourceRegistryFile,
} from "@/lib/types/generated";
import { ReferenceDataContext, type ReferenceDataState } from "./reference-data-context";

const SOURCE_REGISTRY_PATH = "data/source-registry.json";
const LORE_DATA_PATH = "data/lore/index.json";
const RULES_DATA_PATH = "data/rules/core.json";
const FORCE_DATA_PATH = "data/forces/index.json";
const SCENARIO_DATA_PATH = "data/scenarios/core.json";
const SEARCH_DATA_PATH = "data/search/index.json";

interface ReferenceDataProviderProps {
  children: ReactNode;
}

export function ReferenceDataProvider({ children }: ReferenceDataProviderProps) {
  const [state, setState] = useState<ReferenceDataState>({ status: "loading" });

  useEffect(() => {
    let isMounted = true;

    void Promise.all([
      loadPublicJson<SourceRegistryFile>(SOURCE_REGISTRY_PATH),
      loadPublicJson<LoreDatasetFile>(LORE_DATA_PATH),
      loadPublicJson<RulesDatasetFile>(RULES_DATA_PATH),
      loadPublicJson<ForceDatasetFile>(FORCE_DATA_PATH),
      loadPublicJson<ScenarioDatasetFile>(SCENARIO_DATA_PATH),
      loadPublicJson<SearchIndexFile>(SEARCH_DATA_PATH),
    ])
      .then(([sourceRegistry, lore, rules, forces, scenarios, searchIndex]) => {
        if (!isMounted) {
          return;
        }

        setState({
          status: "ready",
          data: {
            sourceRegistry,
            lore,
            rules,
            forces,
            scenarios,
            searchIndex,
          },
        });
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Unknown reference data load failure.",
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return <ReferenceDataContext.Provider value={state}>{children}</ReferenceDataContext.Provider>;
}

import { useContext } from "react";

import { ReferenceDataContext } from "./reference-data-context";

export function useReferenceDataState() {
  const context = useContext(ReferenceDataContext);

  if (context === null) {
    throw new Error("useReferenceDataState must be used within ReferenceDataProvider.");
  }

  return context;
}

export function useReferenceData() {
  const context = useReferenceDataState();

  if (context.status !== "ready") {
    throw new Error("Reference data is not ready yet.");
  }

  return context.data;
}

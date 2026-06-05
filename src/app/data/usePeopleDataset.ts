import { useEffect, useState } from "react";
import { getImportedPeopleDataset, getResolvedPeopleDataset, getResolvedTenants } from "./peopleDatasetStore";

export function usePeopleDataset() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const refresh = () => setVersion(current => current + 1);
    window.addEventListener("storage", refresh);
    window.addEventListener("rjt-people-dataset-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("rjt-people-dataset-updated", refresh);
    };
  }, []);

  const dataset = getResolvedPeopleDataset();
  return {
    dataset,
    tenants: getResolvedTenants(),
    hasImportedDataset: Boolean(getImportedPeopleDataset())
  };
}

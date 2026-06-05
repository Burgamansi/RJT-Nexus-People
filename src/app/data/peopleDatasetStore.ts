import {
  DEMO_ACTION_PLANS,
  DEMO_ASSETS,
  DEMO_ASSIGNMENTS,
  DEMO_BACKUPS,
  DEMO_CF_ASSESSMENTS,
  DEMO_EMPLOYEES,
  DEMO_EVIDENCES,
  DEMO_FUNCTIONS,
  DEMO_OJTS,
  DEMO_PROGRAMS,
  DEMO_SNAPSHOTS,
  DEMO_SUCCESSORS,
  DEMO_TENANTS,
  DEMO_UNITS
} from "./peopleDemoDataset";
import { PeopleIntelligenceDataset } from "../../features/import-center/rhSpreadsheetEngine";

const STORAGE_KEY = "rjt_nexus_people_imported_dataset_v1";

export function getFallbackPeopleDataset(): PeopleIntelligenceDataset {
  return {
    tenantId: "tenant_ubg",
    tenants: DEMO_TENANTS,
    employees: DEMO_EMPLOYEES,
    units: DEMO_UNITS,
    functions: DEMO_FUNCTIONS,
    assignments: DEMO_ASSIGNMENTS,
    assessments: DEMO_CF_ASSESSMENTS,
    backups: DEMO_BACKUPS,
    successors: DEMO_SUCCESSORS,
    programs: DEMO_PROGRAMS,
    ojts: DEMO_OJTS,
    assets: DEMO_ASSETS,
    evidences: DEMO_EVIDENCES,
    snapshots: DEMO_SNAPSHOTS,
    actionPlans: DEMO_ACTION_PLANS
  };
}

export function saveImportedPeopleDataset(dataset: PeopleIntelligenceDataset): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
  window.dispatchEvent(new CustomEvent("rjt-people-dataset-updated", { detail: dataset.tenantId }));
}

export function clearImportedPeopleDataset(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("rjt-people-dataset-updated"));
}

export function getImportedPeopleDataset(): PeopleIntelligenceDataset | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PeopleIntelligenceDataset;
  } catch {
    return null;
  }
}

export function getResolvedPeopleDataset(): PeopleIntelligenceDataset {
  return getImportedPeopleDataset() || getFallbackPeopleDataset();
}

export function getResolvedTenants(): Array<{ id: string; name: string }> {
  const dataset = getResolvedPeopleDataset();
  const fallback = getFallbackPeopleDataset();
  const byId = new Map([...fallback.tenants, ...dataset.tenants].map(tenant => [tenant.id, tenant]));
  return [...byId.values()];
}

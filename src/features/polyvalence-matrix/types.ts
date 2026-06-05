export interface PolyvalenceMatrixFilters {
  tenantId?: string;
  organizationUnitId?: string;
  functionId?: string;
  employeeId?: string;
  search?: string;
}

export type CapabilityLevel = "none" | "training" | "practical" | "backup" | "operational";

export interface EmployeeCapability {
  functionId: string;
  functionCode: string;
  functionName: string;
  isPrimary: boolean;
  isBackup: boolean;
  isTrained: boolean;
  isPractical: boolean;
  capabilityLevel: CapabilityLevel;
}

export interface PolyvalenceEmployeeRow {
  employeeId: string;
  employeeName: string;
  organizationUnitId: string;
  organizationUnitName: string;
  capabilities: EmployeeCapability[];
  primaryCount: number;
  backupCount: number;
  totalValidatedCount: number;
  tenantId: string;
}

export interface PolyvalenceOrgUnitRow {
  organizationUnitId: string;
  organizationUnitName: string;
  employeeCount: number;
  averagePolyvalenceIndex: number;
  spofCount: number;
  tenantId: string;
}

export interface PolyvalenceSummary {
  totalEmployees: number;
  polyvalentEmployeesCount: number;
  spofFunctionsCount: number;
  functionsWithoutBackupCount: number;
  trainingGapsCount: number;
  ojtGapsCount: number;
  averageCoverageIndex: number;
}

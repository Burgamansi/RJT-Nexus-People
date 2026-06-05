export interface BackupSuccessionFilters {
  tenantId?: string;
  organizationUnitId?: string;
  search?: string;
  isCriticalOnly?: boolean;
}

export interface BackupCoverageRow {
  functionId: string;
  functionCode: string;
  functionName: string;
  organizationUnitId: string;
  organizationUnitName: string;
  primaryEmployeeId: string;
  primaryEmployeeName: string;
  isCritical: boolean;
  requiredBackupQuantity: number;
  activeBackupCount: number;
  inTrainingBackupCount: number;
  proposedBackupCount: number;
  isFullyCovered: boolean;
  coverageGap: number;
  tenantId: string;
}

export interface SuccessionCandidateDetail {
  employeeId: string;
  employeeName: string;
  readinessScore: number;
  readinessLevel: "high" | "medium" | "low";
}

export interface SuccessionReadinessRow {
  functionId: string;
  functionCode: string;
  functionName: string;
  organizationUnitId: string;
  organizationUnitName: string;
  primaryEmployeeId: string;
  primaryEmployeeName: string;
  isCritical: boolean;
  successionCandidateCount: number;
  candidates: SuccessionCandidateDetail[];
  hasReadySuccessor: boolean;
  tenantId: string;
}

export interface BackupOverloadIndicator {
  employeeId: string;
  employeeName: string;
  organizationUnitId: string;
  organizationUnitName: string;
  activeBackupCount: number;
  criticalFunctionIds: string[];
  isOverloaded: boolean;
  tenantId: string;
}

export interface OrgUnitPipelineRow {
  organizationUnitId: string;
  organizationUnitName: string;
  totalCriticalFunctions: number;
  functionsWithSuccessorCount: number;
  totalCandidatesCount: number;
  readyCandidatesCount: number;
  pipelineCoverageRate: number;
  tenantId: string;
}

export interface ContinuityRiskIndicator {
  functionId: string;
  functionCode: string;
  functionName: string;
  organizationUnitId: string;
  organizationUnitName: string;
  isCritical: boolean;
  hasActiveBackup: boolean;
  hasSuccessor: boolean;
  riskLevel: "high" | "medium" | "low";
  tenantId: string;
}

export interface BackupSuccessionSummary {
  totalCriticalFunctions: number;
  fullyCoveredFunctionsCount: number;
  partiallyCoveredFunctionsCount: number;
  uncoveredFunctionsCount: number;
  functionsWithSuccessorCount: number;
  functionsWithoutSuccessorCount: number;
  overloadedEmployeesCount: number;
  highContinuityRiskCount: number;
  tenantId: string;
}

import { Priority } from "../../shared/domain/people/enums";

export interface CriticalFunctionFilters {
  tenantId?: string;
  organizationUnitId?: string;
  isCriticalOnly?: boolean;
  search?: string;
}

export interface CriticalFunctionRow {
  functionId: string;
  code: string;
  name: string;
  description: string;
  organizationUnitId: string;
  organizationUnitName: string;
  isCritical: boolean;
  gutScore: number;
  vulnerabilityScore: number;
  classification: Priority | string;
  primaryEmployeeName: string;
  backupEmployeeCount: number;
  validatedBackupCount: number;
  successionCandidateCount: number;
  hasKnowledgeAsset: boolean;
  hasEvidenceRecord: boolean;
  exposureScore: number;
  isHighExposure: boolean;
  tenantId: string;
}

export interface CriticalityDistribution {
  lowCount: number;
  mediumCount: number;
  highCount: number;
  criticalCount: number;
}

export interface CriticalFunctionsSummary {
  totalFunctions: number;
  criticalFunctionsCount: number;
  functionsWithoutPrimary: number;
  functionsWithoutBackup: number;
  functionsWithoutSuccessor: number;
  functionsWithoutKnowledge: number;
  functionsWithoutEvidence: number;
  highExposureCount: number;
  averageVulnerabilityScore: number;
}

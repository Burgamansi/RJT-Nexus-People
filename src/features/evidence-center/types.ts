import { EvidenceStatus } from "../../shared/domain/people/enums";

export interface EvidenceFilters {
  tenantId?: string;
  organizationUnitId?: string;
  status?: EvidenceStatus;
  employeeId?: string;
  functionId?: string;
  search?: string;
  isCriticalOnly?: boolean;
}

export interface EvidenceRow {
  evidenceId: string;
  employeeId: string;
  employeeName: string;
  organizationUnitId: string;
  organizationUnitName: string;
  functionId?: string;
  functionName?: string;
  knowledgeAssetId?: string;
  knowledgeAssetTitle?: string;
  status: EvidenceStatus;
  evidenceUrl: string;
  uploadedAt?: string;
  expiresAt?: string;
  isOutdated: boolean;
  isExpired: boolean;
  tenantId: string;
}

export interface MissingEvidenceRow {
  functionId?: string;
  functionName?: string;
  isCritical: boolean;
  organizationUnitId: string;
  organizationUnitName: string;
  missingType: "critical_function" | "training_ojt" | "backup_validation";
  employeeId?: string;
  employeeName?: string;
  description: string;
  tenantId: string;
}

export interface EvidenceAuditSummary {
  totalEvidenceRecords: number;
  validatedCount: number;
  pendingCount: number;
  rejectedCount: number;
  expiredCount: number;
  outdatedCount: number;
  criticalMissingCount: number;
  auditReadinessScore: number; // percentage
  tenantId: string;
}

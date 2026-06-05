export interface TrainingOjtFilters {
  tenantId?: string;
  organizationUnitId?: string;
  search?: string;
  isCriticalOnly?: boolean;
}

export interface TrainingRow {
  employeeId: string;
  employeeName: string;
  organizationUnitId: string;
  organizationUnitName: string;
  functionId: string;
  functionName: string;
  skillId: string;
  programId: string;
  programName: string;
  isCertified: boolean;
  status: "completed" | "pending" | "not_started";
  startDate: string;
  isOverdue: boolean;
  tenantId: string;
}

export interface OjtRow {
  ojtPlanId: string;
  employeeId: string;
  employeeName: string;
  organizationUnitId: string;
  organizationUnitName: string;
  functionId: string;
  functionName: string;
  skillId: string;
  status: "planned" | "in_progress" | "completed";
  hasEvidenceRecord: boolean;
  evidenceStatus?: string;
  evidenceUrl?: string;
  isOverdue: boolean;
  tenantId: string;
}

export interface OrgUnitTrainingOjtCoverageRow {
  organizationUnitId: string;
  organizationUnitName: string;
  totalEmployees: number;
  trainedEmployeesCount: number;
  ojtValidatedEmployeesCount: number;
  trainingCoverageRate: number; // percentage
  ojtCoverageRate: number; // percentage
  tenantId: string;
}

export interface TrainingOjtGapIndicator {
  employeeId: string;
  employeeName: string;
  functionId: string;
  functionName: string;
  organizationUnitId: string;
  organizationUnitName: string;
  gapType: "missing_training" | "missing_ojt" | "incomplete_readiness" | "evidence_validation_gap" | "overdue_compliance_risk";
  description: string;
  tenantId: string;
}

export interface TrainingOjtSummary {
  totalEmployees: number;
  totalTrainingPrograms: number;
  completedTrainingsCount: number;
  pendingTrainingsCount: number;
  overdueTrainingsCount: number;
  completedOjtPlansCount: number;
  pendingOjtPlansCount: number;
  overdueOjtPlansCount: number;
  evidenceValidationGapsCount: number;
  operationalComplianceRate: number; // percentage of active primary/backup assignments fully compliant (certified + completed OJT)
  tenantId: string;
}

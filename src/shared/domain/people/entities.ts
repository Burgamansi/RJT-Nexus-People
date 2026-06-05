import { Priority, ActionStatus, EvidenceStatus } from "./enums";

export interface Employee {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  organizationUnitId: string;
  status: "active" | "inactive";
  skills: Array<{
    skillId: string;
    proficiencyLevel: string;
    certified: boolean;
  }>;
}

export interface OrganizationUnit {
  id: string;
  tenantId: string;
  name: string;
  type: "department" | "sector" | "division";
}

export interface Function {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description: string;
  organizationUnitId: string;
  isCritical: boolean;
  requiredBackupQuantity: number;
}

export interface CriticalFunctionAssessment {
  id: string;
  tenantId: string;
  functionId: string;
  gutScore: number;
  vulnerabilityScore: number;
  classification: Priority;
}

export interface BackupAssignment {
  id: string;
  tenantId: string;
  functionId: string;
  employeeId: string;
  status: "active" | "in_training" | "proposed";
}

export interface SuccessionCandidate {
  id: string;
  tenantId: string;
  functionId: string;
  employeeId: string;
  readinessScore: number;
}

export interface TrainingProgram {
  id: string;
  tenantId: string;
  name: string;
  skillId: string;
}

export interface OjtPlan {
  id: string;
  tenantId: string;
  employeeId: string;
  skillId: string;
  status: "planned" | "in_progress" | "completed";
}

export interface KnowledgeAsset {
  id: string;
  tenantId: string;
  code: string;
  title: string;
  functionId: string;
  lastReviewedAt?: string;
}

export interface EvidenceRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  functionId?: string;
  knowledgeAssetId?: string;
  status: EvidenceStatus;
  evidenceUrl: string;
  uploadedAt?: string;
  expiresAt?: string;
}

export interface VulnerabilitySnapshot {
  id: string;
  tenantId: string;
  functionId: string;
  score: number;
  riskLevel: Priority;
}

export interface ActionPlan {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  status: ActionStatus;
  priority: Priority;
  ownerEmployeeId: string | null;
  functionId?: string;
  sourceType: "vulnerability" | "critical_function" | "skill_gap" | "backup_gap" | "succession_gap" | "knowledge_gap" | "evidence_gap";
  sourceRecordId: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeAssignment {
  id: string;
  tenantId: string;
  employeeId: string;
  organizationUnitId: string;
  functionId: string;
  positionTitle: string;
  status: "active" | "inactive" | "ended";
  isPrimary: boolean;
  startDate: string;
  endDate?: string;
  managerEmployeeId?: string;
  createdAt: string;
  updatedAt: string;
}

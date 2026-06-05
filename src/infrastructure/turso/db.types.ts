/**
 * RJT NEXUS PEOPLE - Turso Relational Edge SQLite Row Types
 * Maps exactly to the schemas defined in src/infrastructure/turso/schema.sql
 */

export interface TenantDbRow {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationUnitDbRow {
  id: string;
  tenant_id: string;
  name: string;
  type: "department" | "sector" | "division";
  created_at: string;
  updated_at: string;
}

export interface EmployeeDbRow {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  organization_unit_id: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface EmployeeSkillDbRow {
  id: string;
  tenant_id: string;
  employee_id: string;
  skill_id: string;
  proficiency_level: string;
  certified: number; // 0 for false, 1 for true in SQLite
  created_at: string;
  updated_at: string;
}

export interface FunctionDbRow {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  description: string;
  organization_unit_id: string;
  is_critical: number; // 0 or 1
  required_backup_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface EmployeeAssignmentDbRow {
  id: string;
  tenant_id: string;
  employee_id: string;
  organization_unit_id: string;
  function_id: string;
  position_title: string;
  status: "active" | "inactive" | "ended";
  is_primary: number; // 0 or 1
  start_date: string;
  end_date: string | null;
  manager_employee_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CriticalFunctionAssessmentDbRow {
  id: string;
  tenant_id: string;
  function_id: string;
  gut_score: number;
  vulnerability_score: number;
  classification: "low" | "medium" | "high" | "critical";
  created_at: string;
  updated_at: string;
}

export interface BackupAssignmentDbRow {
  id: string;
  tenant_id: string;
  function_id: string;
  employee_id: string;
  status: "active" | "in_training" | "proposed";
  created_at: string;
  updated_at: string;
}

export interface SuccessionCandidateDbRow {
  id: string;
  tenant_id: string;
  function_id: string;
  employee_id: string;
  readiness_score: number;
  created_at: string;
  updated_at: string;
}

export interface TrainingProgramDbRow {
  id: string;
  tenant_id: string;
  name: string;
  skill_id: string;
  created_at: string;
  updated_at: string;
}

export interface OjtPlanDbRow {
  id: string;
  tenant_id: string;
  employee_id: string;
  skill_id: string;
  status: "planned" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
}

export interface KnowledgeAssetDbRow {
  id: string;
  tenant_id: string;
  code: string;
  title: string;
  function_id: string;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EvidenceRecordDbRow {
  id: string;
  tenant_id: string;
  employee_id: string;
  function_id: string | null;
  knowledge_asset_id: string | null;
  status: "pending" | "under_review" | "validated" | "rejected";
  evidence_url: string;
  uploaded_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionPlanDbRow {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  owner_employee_id: string | null;
  function_id: string | null;
  source_type: "vulnerability" | "critical_function" | "skill_gap" | "backup_gap" | "succession_gap" | "knowledge_gap" | "evidence_gap";
  source_record_id: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImportBatchDbRow {
  id: string;
  tenant_id: string;
  import_type: "employee" | "organization_unit" | "function" | "employee_assignment" | "training_program" | "ojt_plan" | "knowledge_asset" | "evidence_record" | "action_plan";
  processed_count: number;
  success_count: number;
  error_count: number;
  warning_count: number;
  file_path_r2: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImportErrorDbRow {
  id: string;
  tenant_id: string;
  batch_id: string;
  row_number: number;
  column_name: string | null;
  message: string;
  raw_value: string | null;
  created_at: string;
}

export interface ImportWarningDbRow {
  id: string;
  tenant_id: string;
  batch_id: string;
  row_number: number;
  column_name: string | null;
  message: string;
  raw_value: string | null;
  created_at: string;
}

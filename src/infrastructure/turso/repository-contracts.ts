import {
  TenantDbRow,
  OrganizationUnitDbRow,
  EmployeeDbRow,
  EmployeeSkillDbRow,
  FunctionDbRow,
  EmployeeAssignmentDbRow,
  CriticalFunctionAssessmentDbRow,
  BackupAssignmentDbRow,
  SuccessionCandidateDbRow,
  TrainingProgramDbRow,
  OjtPlanDbRow,
  KnowledgeAssetDbRow,
  EvidenceRecordDbRow,
  ActionPlanDbRow,
  ImportBatchDbRow,
  ImportErrorDbRow,
  ImportWarningDbRow
} from "./db.types";

/**
 * Standard Tenant-Isolated Relational Repository Contract
 */
export interface IBaseRepository<T> {
  getById(id: string, tenantId: string): Promise<T | null>;
  getAll(tenantId: string): Promise<T[]>;
  create(row: T): Promise<T>;
  update(row: T): Promise<T>;
  delete(id: string, tenantId: string): Promise<boolean>;
}

export interface ITenantRepository {
  getById(id: string): Promise<TenantDbRow | null>;
  getAll(): Promise<TenantDbRow[]>;
  create(row: TenantDbRow): Promise<TenantDbRow>;
  update(row: TenantDbRow): Promise<TenantDbRow>;
  delete(id: string): Promise<boolean>;
}

export interface IOrganizationUnitRepository extends IBaseRepository<OrganizationUnitDbRow> {
  getByType(type: OrganizationUnitDbRow["type"], tenantId: string): Promise<OrganizationUnitDbRow[]>;
}

export interface IEmployeeRepository extends IBaseRepository<EmployeeDbRow> {
  getByEmail(email: string, tenantId: string): Promise<EmployeeDbRow | null>;
  getSkills(employeeId: string, tenantId: string): Promise<EmployeeSkillDbRow[]>;
  saveSkill(skill: EmployeeSkillDbRow): Promise<EmployeeSkillDbRow>;
  deleteSkill(skillId: string, employeeId: string, tenantId: string): Promise<boolean>;
}

export interface IFunctionRepository extends IBaseRepository<FunctionDbRow> {
  getByCode(code: string, tenantId: string): Promise<FunctionDbRow | null>;
  getAssessment(functionId: string, tenantId: string): Promise<CriticalFunctionAssessmentDbRow | null>;
  saveAssessment(assessment: CriticalFunctionAssessmentDbRow): Promise<CriticalFunctionAssessmentDbRow>;
}

export interface IEmployeeAssignmentRepository extends IBaseRepository<EmployeeAssignmentDbRow> {
  getByEmployee(employeeId: string, tenantId: string): Promise<EmployeeAssignmentDbRow[]>;
  getByFunction(functionId: string, tenantId: string): Promise<EmployeeAssignmentDbRow[]>;
  getPrimaryAssignment(employeeId: string, tenantId: string): Promise<EmployeeAssignmentDbRow | null>;
}

export interface IBackupAssignmentRepository extends IBaseRepository<BackupAssignmentDbRow> {
  getByFunction(functionId: string, tenantId: string): Promise<BackupAssignmentDbRow[]>;
  getByEmployee(employeeId: string, tenantId: string): Promise<BackupAssignmentDbRow[]>;
}

export interface ISuccessionCandidateRepository extends IBaseRepository<SuccessionCandidateDbRow> {
  getByFunction(functionId: string, tenantId: string): Promise<SuccessionCandidateDbRow[]>;
}

export interface ITrainingProgramRepository extends IBaseRepository<TrainingProgramDbRow> {
  getBySkill(skillId: string, tenantId: string): Promise<TrainingProgramDbRow[]>;
}

export interface IOjtPlanRepository extends IBaseRepository<OjtPlanDbRow> {
  getByEmployee(employeeId: string, tenantId: string): Promise<OjtPlanDbRow[]>;
  getBySkill(skillId: string, tenantId: string): Promise<OjtPlanDbRow[]>;
}

export interface IKnowledgeAssetRepository extends IBaseRepository<KnowledgeAssetDbRow> {
  getByCode(code: string, tenantId: string): Promise<KnowledgeAssetDbRow | null>;
  getByFunction(functionId: string, tenantId: string): Promise<KnowledgeAssetDbRow[]>;
}

export interface IEvidenceRecordRepository extends IBaseRepository<EvidenceRecordDbRow> {
  getByEmployee(employeeId: string, tenantId: string): Promise<EvidenceRecordDbRow[]>;
  getByFunction(functionId: string, tenantId: string): Promise<EvidenceRecordDbRow[]>;
  getByAsset(assetId: string, tenantId: string): Promise<EvidenceRecordDbRow[]>;
}

export interface IActionPlanRepository extends IBaseRepository<ActionPlanDbRow> {
  getByOwner(employeeId: string, tenantId: string): Promise<ActionPlanDbRow[]>;
  getByFunction(functionId: string, tenantId: string): Promise<ActionPlanDbRow[]>;
  getBySource(sourceType: ActionPlanDbRow["source_type"], sourceRecordId: string, tenantId: string): Promise<ActionPlanDbRow[]>;
}

export interface IImportBatchRepository {
  getBatchById(id: string, tenantId: string): Promise<ImportBatchDbRow | null>;
  getBatches(tenantId: string): Promise<ImportBatchDbRow[]>;
  
  /**
   * Commits a complete parsed batch transaction logging errors and warnings.
   */
  commitBatch(
    batch: ImportBatchDbRow,
    errors: ImportErrorDbRow[],
    warnings: ImportWarningDbRow[]
  ): Promise<void>;
  
  getErrors(batchId: string, tenantId: string): Promise<ImportErrorDbRow[]>;
  getWarnings(batchId: string, tenantId: string): Promise<ImportWarningDbRow[]>;
}

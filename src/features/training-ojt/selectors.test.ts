import { describe, it } from "node:test";
import assert from "node:assert";
import {
  Employee,
  EmployeeAssignment,
  OrganizationUnit,
  Function,
  BackupAssignment,
  TrainingProgram,
  OjtPlan,
  EvidenceRecord
} from "../../shared/domain/people/entities";

import { EvidenceStatus } from "../../shared/domain/people/enums";

import {
  getTrainingRowsByTenant,
  getOjtRowsByTenant,
  getCompletedTrainingsByEmployee,
  getPendingTrainingsByEmployee,
  getOverdueTrainings,
  getOjtPlansByFunction,
  getCompletedOjtByFunction,
  getEmployeesWithoutRequiredTraining,
  getEmployeesWithoutPracticalOjtValidation,
  getTrainingOjtCoverageByOrgUnit,
  getTrainingOjtGapIndicators,
  getTrainingOjtSummaryDashboardData
} from "./selectors";

// ============================================================================
// TEST BUILDERS
// ============================================================================

const createMockEmployee = (
  id: string,
  name: string,
  unitId: string,
  skills: Array<{ skillId: string; proficiencyLevel: string; certified: boolean }> = [],
  tenantId = "tenant_1"
): Employee => ({
  id,
  tenantId,
  name,
  email: `${id}@nexus.com`,
  organizationUnitId: unitId,
  status: "active",
  skills
});

const createMockUnit = (id: string, name: string, tenantId = "tenant_1"): OrganizationUnit => ({
  id,
  tenantId,
  name,
  type: "sector"
});

const createMockFunction = (
  id: string,
  code: string,
  name: string,
  unitId: string,
  isCritical: boolean,
  tenantId = "tenant_1"
): Function => ({
  id,
  tenantId,
  code,
  name,
  description: `${name} description`,
  organizationUnitId: unitId,
  isCritical,
  requiredBackupQuantity: 1
});

const createMockAssignment = (
  id: string,
  employeeId: string,
  functionId: string,
  unitId: string,
  isPrimary: boolean,
  startDate = "2026-05-15",
  tenantId = "tenant_1"
): EmployeeAssignment => ({
  id,
  tenantId,
  employeeId,
  organizationUnitId: unitId,
  functionId,
  positionTitle: "Operator",
  status: "active",
  isPrimary,
  startDate,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01"
});

// ============================================================================
// TEST SUITE
// ============================================================================

describe("Training & OJT Pure Selectors Suite", () => {
  const tenantId = "tenant_1";

  // Mock Units
  const mockUnits = [
    createMockUnit("unit_corte", "Corte Automático", tenantId),
    createMockUnit("unit_costura", "Costura de Sacos", tenantId)
  ];

  // Mock Employees
  // - emp_1: Primary on func_01 (Certified skill). OJT completed. Fully compliant!
  // - emp_2: Primary on func_02 (Skill NOT certified). OJT in_progress. Overdue (start: 2026-01-01)!
  // - emp_3: Backup on func_01 (Certified skill). OJT completed but NO validated evidence (validation gap).
  const mockEmployees = [
    createMockEmployee(
      "emp_1",
      "Kaiky Competent",
      "unit_corte",
      [{ skillId: "func_01", proficiencyLevel: "Operational", certified: true }],
      tenantId
    ),
    createMockEmployee(
      "emp_2",
      "Arthur Apprentice",
      "unit_costura",
      [{ skillId: "func_02", proficiencyLevel: "Junior", certified: false }],
      tenantId
    ),
    createMockEmployee(
      "emp_3",
      "Eliane Expert",
      "unit_corte",
      [{ skillId: "func_01", proficiencyLevel: "Operational", certified: true }],
      tenantId
    )
  ];

  // Mock Functions
  const mockFunctions = [
    createMockFunction("func_01", "FC-01", "Corte Principal", "unit_corte", true, tenantId),
    createMockFunction("func_02", "FC-02", "Costura Principal", "unit_costura", true, tenantId)
  ];

  // Mock Assignments
  const mockAssignments = [
    createMockAssignment("asg_1", "emp_1", "func_01", "unit_corte", true, "2026-05-25", tenantId),
    createMockAssignment("asg_2", "emp_2", "func_02", "unit_costura", true, "2026-01-01", tenantId) // Overdue (> 30 days)
  ];

  // Mock Backups
  const mockBackups: BackupAssignment[] = [
    { id: "bkp_1", tenantId, functionId: "func_01", employeeId: "emp_3", status: "active" }
  ];

  // Mock Training Programs
  const mockPrograms: TrainingProgram[] = [
    { id: "prog_1", tenantId, name: "Theoretical Corte Course", skillId: "func_01" },
    { id: "prog_2", tenantId, name: "Theoretical Costura Course", skillId: "func_02" }
  ];

  // Mock OJT Plans
  const mockOjts: OjtPlan[] = [
    { id: "ojt_1", tenantId, employeeId: "emp_1", skillId: "func_01", status: "completed" },
    { id: "ojt_2", tenantId, employeeId: "emp_2", skillId: "func_02", status: "in_progress" },
    { id: "ojt_3", tenantId, employeeId: "emp_3", skillId: "func_01", status: "completed" }
  ];

  // Mock Evidence Records
  const mockEvidences: EvidenceRecord[] = [
    { id: "ev_1", tenantId, employeeId: "emp_1", functionId: "func_01", status: EvidenceStatus.VALIDATED, evidenceUrl: "url_1" },
    { id: "ev_3", tenantId, employeeId: "emp_3", functionId: "func_01", status: EvidenceStatus.PENDING, evidenceUrl: "url_3" } // Validation Gap
  ];

  it("should calculate theoretical training rows for active assignments", () => {
    const rows = getTrainingRowsByTenant(
      mockEmployees,
      mockAssignments,
      mockBackups,
      mockPrograms,
      mockFunctions,
      mockUnits,
      { tenantId }
    );

    // emp_1 (primary func_01), emp_2 (primary func_02), emp_3 (backup func_01)
    assert.strictEqual(rows.length, 3);

    const r1 = rows.find(r => r.employeeId === "emp_1")!;
    assert.strictEqual(r1.isCertified, true);
    assert.strictEqual(r1.status, "completed");
    assert.strictEqual(r1.isOverdue, false);

    const r2 = rows.find(r => r.employeeId === "emp_2")!;
    assert.strictEqual(r2.isCertified, false);
    assert.strictEqual(r2.status, "pending");
    assert.strictEqual(r2.isOverdue, true); // started 2026-01-01 (> 30 days before 2026-06-01)
  });

  it("should calculate practical OJT rows and track evidence verification states", () => {
    const rows = getOjtRowsByTenant(
      mockOjts,
      mockEmployees,
      mockAssignments,
      mockBackups,
      mockFunctions,
      mockUnits,
      mockEvidences,
      { tenantId }
    );

    assert.strictEqual(rows.length, 3);

    const o1 = rows.find(o => o.employeeId === "emp_1")!;
    assert.strictEqual(o1.status, "completed");
    assert.strictEqual(o1.hasEvidenceRecord, true);
    assert.strictEqual(o1.evidenceStatus, EvidenceStatus.VALIDATED);

    const o2 = rows.find(o => o.employeeId === "emp_2")!;
    assert.strictEqual(o2.status, "in_progress");
    assert.strictEqual(o2.hasEvidenceRecord, false);
    assert.strictEqual(o2.isOverdue, true); // started 2026-01-01

    const o3 = rows.find(o => o.employeeId === "emp_3")!;
    assert.strictEqual(o3.status, "completed");
    assert.strictEqual(o3.hasEvidenceRecord, true);
    assert.strictEqual(o3.evidenceStatus, EvidenceStatus.PENDING); // validation gap!
  });

  it("should verify tenant isolation with zero cross-tenant leakage", () => {
    const empTenantA = createMockEmployee("emp_a", "Emp A", "unit_corte", [], "tenant_A");
    const empTenantB = createMockEmployee("emp_b", "Emp B", "unit_corte", [], "tenant_B");

    const rows = getTrainingRowsByTenant(
      [empTenantA, empTenantB],
      [],
      [],
      [],
      [],
      [],
      { tenantId: "tenant_A" }
    );

    assert.strictEqual(rows.length, 0); // No assignments on this tenant
  });

  it("should handle empty arrays gracefully and return safely", () => {
    const rows = getTrainingRowsByTenant([], [], [], [], [], []);
    assert.strictEqual(rows.length, 0);

    const summary = getTrainingOjtSummaryDashboardData([], [], [], [], [], [], [], []);
    assert.strictEqual(summary.totalEmployees, 0);
  });

  it("should filter completed and pending training rows by specific employee", () => {
    const completed = getCompletedTrainingsByEmployee(
      "emp_1",
      mockEmployees,
      mockAssignments,
      mockBackups,
      mockPrograms,
      mockFunctions,
      mockUnits,
      { tenantId }
    );
    assert.strictEqual(completed.length, 1);
    assert.strictEqual(completed[0].functionId, "func_01");

    const pending = getPendingTrainingsByEmployee(
      "emp_2",
      mockEmployees,
      mockAssignments,
      mockBackups,
      mockPrograms,
      mockFunctions,
      mockUnits,
      { tenantId }
    );
    assert.strictEqual(pending.length, 1);
    assert.strictEqual(pending[0].functionId, "func_02");
  });

  it("should select all overdue trainings across the tenant", () => {
    const overdue = getOverdueTrainings(
      mockEmployees,
      mockAssignments,
      mockBackups,
      mockPrograms,
      mockFunctions,
      mockUnits,
      { tenantId }
    );
    // Only emp_2 is overdue on func_02 (started 2026-01-01)
    assert.strictEqual(overdue.length, 1);
    assert.strictEqual(overdue[0].employeeId, "emp_2");
  });

  it("should select OJT plans and completed OJTs by specific function", () => {
    const funcOjts = getOjtPlansByFunction(
      "func_01",
      mockOjts,
      mockEmployees,
      mockAssignments,
      mockBackups,
      mockFunctions,
      mockUnits,
      mockEvidences,
      { tenantId }
    );
    // emp_1 and emp_3 completed OJT on func_01
    assert.strictEqual(funcOjts.length, 2);

    const completedFuncOjts = getCompletedOjtByFunction(
      "func_01",
      mockOjts,
      mockEmployees,
      mockAssignments,
      mockBackups,
      mockFunctions,
      mockUnits,
      mockEvidences,
      { tenantId }
    );
    assert.strictEqual(completedFuncOjts.length, 2);
  });

  it("should select employees without required certified training", () => {
    const list = getEmployeesWithoutRequiredTraining(
      mockEmployees,
      mockAssignments,
      mockBackups,
      mockPrograms,
      mockFunctions,
      mockUnits,
      { tenantId }
    );
    // emp_2 lacks certified training on func_02
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].id, "emp_2");
  });

  it("should select employees lacking completed practical OJT validation", () => {
    const list = getEmployeesWithoutPracticalOjtValidation(
      mockEmployees,
      mockAssignments,
      mockBackups,
      mockOjts,
      mockFunctions,
      mockUnits,
      mockEvidences,
      { tenantId }
    );
    // emp_2 is primary on func_02 but OJT is in_progress
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].id, "emp_2");
  });

  it("should calculate coverage rates aggregated by organization units", () => {
    const coverage = getTrainingOjtCoverageByOrgUnit(
      mockEmployees,
      mockAssignments,
      mockBackups,
      mockPrograms,
      mockOjts,
      mockFunctions,
      mockUnits,
      mockEvidences,
      { tenantId }
    );

    assert.strictEqual(coverage.length, 2);

    const corte = coverage.find(c => c.organizationUnitId === "unit_corte")!;
    assert.strictEqual(corte.totalEmployees, 2); // emp_1 and emp_3
    assert.strictEqual(corte.trainedEmployeesCount, 1); // emp_1 is primary active & certified (emp_3 is backup)
    assert.strictEqual(corte.ojtValidatedEmployeesCount, 1); // emp_1 completed OJT
    assert.strictEqual(corte.trainingCoverageRate, 50); // 1 / 2 * 100

    const costura = coverage.find(c => c.organizationUnitId === "unit_costura")!;
    assert.strictEqual(costura.totalEmployees, 1); // emp_2
    assert.strictEqual(costura.trainedEmployeesCount, 0);
    assert.strictEqual(costura.trainingCoverageRate, 0);
  });

  it("should detect gap indicators including missing training, OJT, validation and compliance overdue risks", () => {
    const gaps = getTrainingOjtGapIndicators(
      mockEmployees,
      mockAssignments,
      mockBackups,
      mockPrograms,
      mockOjts,
      mockFunctions,
      mockUnits,
      mockEvidences,
      { tenantId }
    );

    assert.strictEqual(gaps.length > 0, true);

    // Verify evidence validation gap detection (emp_3 completed OJT but evidence is pending)
    const valGap = gaps.find(g => g.employeeId === "emp_3" && g.gapType === "evidence_validation_gap")!;
    assert.ok(valGap);
    assert.strictEqual(valGap.functionId, "func_01");

    // Verify overdue compliance risk (emp_2 active > 30 days with incomplete competency)
    const overdueGap = gaps.find(g => g.employeeId === "emp_2" && g.gapType === "overdue_compliance_risk")!;
    assert.ok(overdueGap);
  });

  it("should calculate correct summary totals and operational compliance metrics", () => {
    const summary = getTrainingOjtSummaryDashboardData(
      mockEmployees,
      mockAssignments,
      mockBackups,
      mockPrograms,
      mockOjts,
      mockFunctions,
      mockUnits,
      mockEvidences,
      { tenantId }
    );

    assert.strictEqual(summary.totalEmployees, 3);
    assert.strictEqual(summary.completedTrainingsCount, 2); // emp_1 and emp_3
    assert.strictEqual(summary.pendingTrainingsCount, 1); // emp_2
    assert.strictEqual(summary.overdueTrainingsCount, 1); // emp_2
    assert.strictEqual(summary.completedOjtPlansCount, 2); // emp_1 and emp_3
    assert.strictEqual(summary.pendingOjtPlansCount, 1); // emp_2
    assert.strictEqual(summary.overdueOjtPlansCount, 1); // emp_2
    assert.strictEqual(summary.evidenceValidationGapsCount, 1); // emp_3
    assert.strictEqual(summary.operationalComplianceRate, 67); // emp_1 and emp_3 are compliant out of 3 active assignments (67%)
  });
});

import { describe, it } from "node:test";
import assert from "node:assert";
import {
  Employee,
  EmployeeAssignment,
  OrganizationUnit,
  Function,
  BackupAssignment,
  SuccessionCandidate
} from "../../shared/domain/people/entities";

import {
  getBackupCoverageRowsByTenant,
  getSuccessionReadinessRowsByTenant,
  getFunctionsWithNoBackup,
  getFunctionsWithUnvalidatedBackup,
  getFunctionsWithNoSuccessionCandidate,
  getEmployeesBackingUpMultipleCriticalFunctions,
  getBackupOverloadIndicators,
  getSuccessionPipelineByOrgUnit,
  getContinuityRiskIndicators,
  getBackupSuccessionSummaryDashboardData
} from "./selectors";

// ============================================================================
// TEST BUILDERS
// ============================================================================

const createMockEmployee = (id: string, name: string, unitId: string, tenantId = "tenant_1"): Employee => ({
  id,
  tenantId,
  name,
  email: `${id}@nexus.com`,
  organizationUnitId: unitId,
  status: "active",
  skills: []
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
  requiredBackups = 2,
  tenantId = "tenant_1"
): Function => ({
  id,
  tenantId,
  code,
  name,
  description: `${name} description`,
  organizationUnitId: unitId,
  isCritical,
  requiredBackupQuantity: requiredBackups
});

const createMockAssignment = (
  id: string,
  employeeId: string,
  functionId: string,
  unitId: string,
  isPrimary: boolean,
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
  startDate: "2026-01-01",
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01"
});

// ============================================================================
// TEST SUITE
// ============================================================================

describe("Backup & Succession Pure Selectors Suite", () => {
  const tenantId = "tenant_1";

  // Set up mock units
  const mockUnits = [
    createMockUnit("unit_corte", "Corte Automático", tenantId),
    createMockUnit("unit_costura", "Costura Manual", tenantId)
  ];

  // Set up mock employees
  const mockEmployees = [
    createMockEmployee("emp_primary_1", "Primary Operator One", "unit_corte", tenantId),
    createMockEmployee("emp_primary_2", "Primary Operator Two", "unit_costura", tenantId),
    createMockEmployee("emp_backup_1", "Backup Operator One", "unit_corte", tenantId),
    createMockEmployee("emp_backup_2", "Backup Operator Two", "unit_costura", tenantId),
    createMockEmployee("emp_backup_multi", "Super Backup Operator", "unit_corte", tenantId)
  ];

  // Set up mock functions (both are critical)
  const mockFunctions = [
    createMockFunction("func_01", "FC-01", "Corte Principal", "unit_corte", true, 2, tenantId),
    createMockFunction("func_02", "FC-02", "Costura Principal", "unit_costura", true, 1, tenantId)
  ];

  // Set up mock primary assignments
  const mockAssignments = [
    createMockAssignment("asg_01", "emp_primary_1", "func_01", "unit_corte", true, tenantId),
    createMockAssignment("asg_02", "emp_primary_2", "func_02", "unit_costura", true, tenantId)
  ];

  // Set up backup assignments
  // func_01:
  // - emp_backup_1 (active) -> 1 active backup (gap of 1 since required is 2)
  // - emp_backup_multi (active) -> active backup
  // - emp_backup_2 (in_training) -> in-training backup
  // func_02:
  // - emp_backup_multi (active) -> active backup (fully covered since required is 1)
  const mockBackups: BackupAssignment[] = [
    { id: "bkp_01", tenantId, functionId: "func_01", employeeId: "emp_backup_1", status: "active" },
    { id: "bkp_02", tenantId, functionId: "func_01", employeeId: "emp_backup_multi", status: "active" },
    { id: "bkp_03", tenantId, functionId: "func_01", employeeId: "emp_backup_2", status: "in_training" },
    { id: "bkp_04", tenantId, functionId: "func_02", employeeId: "emp_backup_multi", status: "active" }
  ];

  // Set up succession candidates
  // func_01: emp_backup_1 (readiness: 85 - High)
  // func_02: emp_backup_2 (readiness: 45 - Low)
  const mockCandidates: SuccessionCandidate[] = [
    { id: "cand_01", tenantId, functionId: "func_01", employeeId: "emp_backup_1", readinessScore: 85 },
    { id: "cand_02", tenantId, functionId: "func_02", employeeId: "emp_backup_2", readinessScore: 45 }
  ];

  it("should calculate backup coverage rows with full and partial coverage details", () => {
    const rows = getBackupCoverageRowsByTenant(
      mockFunctions,
      mockAssignments,
      mockEmployees,
      mockBackups,
      mockUnits,
      { tenantId }
    );

    assert.strictEqual(rows.length, 2);

    const row1 = rows.find(r => r.functionId === "func_01")!;
    assert.strictEqual(row1.functionCode, "FC-01");
    assert.strictEqual(row1.primaryEmployeeName, "Primary Operator One");
    assert.strictEqual(row1.activeBackupCount, 2);
    assert.strictEqual(row1.inTrainingBackupCount, 1);
    assert.strictEqual(row1.requiredBackupQuantity, 2);
    assert.strictEqual(row1.isFullyCovered, true);
    assert.strictEqual(row1.coverageGap, 0);

    const row2 = rows.find(r => r.functionId === "func_02")!;
    assert.strictEqual(row2.functionCode, "FC-02");
    assert.strictEqual(row2.primaryEmployeeName, "Primary Operator Two");
    assert.strictEqual(row2.activeBackupCount, 1);
    assert.strictEqual(row2.requiredBackupQuantity, 1);
    assert.strictEqual(row2.isFullyCovered, true);
    assert.strictEqual(row2.coverageGap, 0);
  });

  it("should verify tenant isolation with zero cross-tenant leakage", () => {
    const fnTenantA = createMockFunction("fn_a", "FA", "Func A", "unit_corte", true, 1, "tenant_A");
    const fnTenantB = createMockFunction("fn_b", "FB", "Func B", "unit_corte", true, 1, "tenant_B");

    const rows = getBackupCoverageRowsByTenant(
      [fnTenantA, fnTenantB],
      [],
      [],
      [],
      [],
      { tenantId: "tenant_A" }
    );

    assert.strictEqual(rows.length, 1);
    assert.strictEqual(rows[0].functionCode, "FA");
    assert.strictEqual(rows[0].tenantId, "tenant_A");
  });

  it("should handle empty arrays gracefully and return empty rows / safe metrics", () => {
    const rows = getBackupCoverageRowsByTenant([], [], [], [], []);
    assert.strictEqual(rows.length, 0);

    const summary = getBackupSuccessionSummaryDashboardData([], [], [], [], [], []);
    assert.strictEqual(summary.totalCriticalFunctions, 0);
    assert.strictEqual(summary.overloadedEmployeesCount, 0);
  });

  it("should select functions with no active backup", () => {
    // Let's create an uncovered function
    const funcUncovered = createMockFunction("func_unc", "FC-UNC", "Uncovered Func", "unit_corte", true, 1, tenantId);
    const noBackupRows = getFunctionsWithNoBackup(
      [...mockFunctions, funcUncovered],
      mockAssignments,
      mockEmployees,
      mockBackups,
      mockUnits,
      { tenantId }
    );

    assert.strictEqual(noBackupRows.length, 1);
    assert.strictEqual(noBackupRows[0].functionId, "func_unc");
    assert.strictEqual(noBackupRows[0].activeBackupCount, 0);
  });

  it("should select functions with unvalidated backup (proposed or in-training)", () => {
    const unvalidatedRows = getFunctionsWithUnvalidatedBackup(
      mockFunctions,
      mockAssignments,
      mockEmployees,
      mockBackups,
      mockUnits,
      { tenantId }
    );

    // func_01 has 1 backup in_training
    assert.strictEqual(unvalidatedRows.length, 1);
    assert.strictEqual(unvalidatedRows[0].functionId, "func_01");
    assert.strictEqual(unvalidatedRows[0].inTrainingBackupCount, 1);
  });

  it("should identify succession readiness and map readiness levels cleanly", () => {
    const rows = getSuccessionReadinessRowsByTenant(
      mockFunctions,
      mockAssignments,
      mockEmployees,
      mockCandidates,
      mockUnits,
      { tenantId }
    );

    assert.strictEqual(rows.length, 2);

    const row1 = rows.find(r => r.functionId === "func_01")!;
    assert.strictEqual(row1.successionCandidateCount, 1);
    assert.strictEqual(row1.candidates[0].employeeName, "Backup Operator One");
    assert.strictEqual(row1.candidates[0].readinessLevel, "high");
    assert.strictEqual(row1.hasReadySuccessor, true);

    const row2 = rows.find(r => r.functionId === "func_02")!;
    assert.strictEqual(row2.successionCandidateCount, 1);
    assert.strictEqual(row2.candidates[0].readinessLevel, "low");
    assert.strictEqual(row2.hasReadySuccessor, false);
  });

  it("should select functions with no succession candidate", () => {
    const funcNoSuccessor = createMockFunction("func_ns", "FC-NS", "No successor function", "unit_corte", true, 1, tenantId);
    
    const rows = getFunctionsWithNoSuccessionCandidate(
      [...mockFunctions, funcNoSuccessor],
      mockAssignments,
      mockEmployees,
      mockCandidates,
      mockUnits,
      { tenantId }
    );

    assert.strictEqual(rows.length, 1);
    assert.strictEqual(rows[0].functionId, "func_ns");
  });

  it("should verify backup overload risk detection when employees exceed critical thresholds", () => {
    // emp_backup_multi acts as backup for both critical functions: func_01 and func_02 (count = 2)
    // Overload limit is > 2 active backups. So currently it's not overloaded.
    const indicators = getBackupOverloadIndicators(
      mockEmployees,
      mockBackups,
      mockFunctions,
      mockUnits,
      { tenantId }
    );

    const multi = indicators.find(i => i.employeeId === "emp_backup_multi")!;
    assert.strictEqual(multi.activeBackupCount, 2);
    assert.strictEqual(multi.isOverloaded, false);

    // Let's add a third critical function backup for emp_backup_multi
    const func03 = createMockFunction("func_03", "FC-03", "Third Critical Func", "unit_corte", true, 1, tenantId);
    const backup03: BackupAssignment = {
      id: "bkp_05",
      tenantId,
      functionId: "func_03",
      employeeId: "emp_backup_multi",
      status: "active"
    };

    const updatedIndicators = getBackupOverloadIndicators(
      mockEmployees,
      [...mockBackups, backup03],
      [...mockFunctions, func03],
      mockUnits,
      { tenantId }
    );

    const multiUpdated = updatedIndicators.find(i => i.employeeId === "emp_backup_multi")!;
    assert.strictEqual(multiUpdated.activeBackupCount, 3);
    assert.strictEqual(multiUpdated.isOverloaded, true); // Overloaded since count = 3 > 2!
  });

  it("should verify employees acting as backup for multiple critical functions", () => {
    const multiBackups = getEmployeesBackingUpMultipleCriticalFunctions(
      mockEmployees,
      mockBackups,
      mockFunctions,
      mockUnits,
      { tenantId }
    );

    // emp_backup_multi is the only one backing up > 1 critical function (func_01 and func_02)
    assert.strictEqual(multiBackups.length, 1);
    assert.strictEqual(multiBackups[0].employeeId, "emp_backup_multi");
  });

  it("should map succession pipelines grouped by organization unit", () => {
    const pipelines = getSuccessionPipelineByOrgUnit(
      mockFunctions,
      mockCandidates,
      mockUnits,
      { tenantId }
    );

    assert.strictEqual(pipelines.length, 2);

    const corte = pipelines.find(p => p.organizationUnitId === "unit_corte")!;
    assert.strictEqual(corte.organizationUnitName, "Corte Automático");
    assert.strictEqual(corte.totalCriticalFunctions, 1);
    assert.strictEqual(corte.functionsWithSuccessorCount, 1);
    assert.strictEqual(corte.totalCandidatesCount, 1);
    assert.strictEqual(corte.readyCandidatesCount, 1);
    assert.strictEqual(corte.pipelineCoverageRate, 100);

    const costura = pipelines.find(p => p.organizationUnitId === "unit_costura")!;
    assert.strictEqual(costura.organizationUnitName, "Costura Manual");
    assert.strictEqual(costura.totalCriticalFunctions, 1);
    assert.strictEqual(costura.functionsWithSuccessorCount, 1);
    assert.strictEqual(costura.totalCandidatesCount, 1);
    assert.strictEqual(costura.readyCandidatesCount, 0); // readiness is 45 (< 80)
    assert.strictEqual(costura.pipelineCoverageRate, 100);
  });

  it("should calculate operational continuity risk levels based on backups and successors", () => {
    // Let's add a function with 0 backups and 0 successors -> high continuity risk
    const funcHighRisk = createMockFunction("func_hr", "FC-HR", "High Risk Function", "unit_corte", true, 1, tenantId);

    const risks = getContinuityRiskIndicators(
      [...mockFunctions, funcHighRisk],
      mockAssignments,
      mockEmployees,
      mockBackups,
      mockCandidates,
      mockUnits,
      { tenantId }
    );

    const hr = risks.find(r => r.functionId === "func_hr")!;
    assert.strictEqual(hr.hasActiveBackup, false);
    assert.strictEqual(hr.hasSuccessor, false);
    assert.strictEqual(hr.riskLevel, "high");

    const func1 = risks.find(r => r.functionId === "func_01")!;
    assert.strictEqual(func1.hasActiveBackup, true);
    assert.strictEqual(func1.hasSuccessor, true);
    assert.strictEqual(func1.riskLevel, "low");
  });

  it("should aggregate comprehensive dashboard summaries correctly", () => {
    const summary = getBackupSuccessionSummaryDashboardData(
      mockFunctions,
      mockAssignments,
      mockEmployees,
      mockBackups,
      mockCandidates,
      mockUnits,
      { tenantId }
    );

    assert.strictEqual(summary.totalCriticalFunctions, 2);
    assert.strictEqual(summary.fullyCoveredFunctionsCount, 2); // both fully covered
    assert.strictEqual(summary.partiallyCoveredFunctionsCount, 0);
    assert.strictEqual(summary.uncoveredFunctionsCount, 0);
    assert.strictEqual(summary.functionsWithSuccessorCount, 2);
    assert.strictEqual(summary.functionsWithoutSuccessorCount, 0);
    assert.strictEqual(summary.overloadedEmployeesCount, 0);
    assert.strictEqual(summary.highContinuityRiskCount, 0);
  });
});

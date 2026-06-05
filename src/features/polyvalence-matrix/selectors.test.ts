import { describe, it } from "node:test";
import assert from "node:assert";
import { EvidenceStatus } from "../../shared/domain/people/enums";
import {
  Employee,
  OrganizationUnit,
  Function,
  BackupAssignment,
  TrainingProgram,
  OjtPlan,
  EvidenceRecord,
  EmployeeAssignment
} from "../../shared/domain/people/entities";

import {
  getPolyvalenceMatrixRowsByTenant,
  getEmployeeFunctionCapabilityMap,
  getFunctionsCoveredByTrainedEmployees,
  getFunctionsWithoutTrainedBackup,
  getEmployeesWithMultipleValidatedFunctions,
  getSinglePointOfFailureFunctions,
  getPolyvalenceCoverageByOrgUnit,
  getTrainingGapIndicators,
  getOjtGapIndicators,
  getPolyvalenceSummaryDashboardData
} from "./selectors";

// ============================================================================
// TEST BUILDERS
// ============================================================================

const createMockEmployee = (id: string, name: string, certifiedSkillId?: string, tenantId = "tenant_1"): Employee => ({
  id,
  tenantId,
  name,
  email: `${id}@nexus.com`,
  organizationUnitId: "unit_corte",
  status: "active",
  skills: certifiedSkillId ? [{ skillId: certifiedSkillId, proficiencyLevel: "Multiplier", certified: true }] : []
});

const createMockUnit = (id: string, name: string, tenantId = "tenant_1"): OrganizationUnit => ({
  id,
  tenantId,
  name,
  type: "sector"
});

const createMockFunction = (id: string, code: string, name: string, tenantId = "tenant_1"): Function => ({
  id,
  tenantId,
  code,
  name,
  description: `${name} desc`,
  organizationUnitId: "unit_corte",
  isCritical: true,
  requiredBackupQuantity: 2
});

const createMockAssignment = (
  id: string,
  employeeId: string,
  functionId: string,
  isPrimary: boolean,
  tenantId = "tenant_1"
): EmployeeAssignment => ({
  id,
  tenantId,
  employeeId,
  organizationUnitId: "unit_corte",
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

describe("SaaS Polyvalence Matrix Pure Selectors Suite", () => {

  const tenantId = "tenant_1";

  const mockUnits = [
    createMockUnit("unit_corte", "Corte Automático", tenantId)
  ];

  const mockEmployees = [
    // emp_01: certified in func_01
    createMockEmployee("emp_01", "Kaiky Principal", "func_01", tenantId),
    createMockEmployee("emp_02", "Eliane Backup", undefined, tenantId)
  ];

  const mockFunctions = [
    createMockFunction("func_01", "FC-01", "Corte Automático", tenantId),
    createMockFunction("func_02", "FC-02", "Costura Manual", tenantId)
  ];

  const mockAssignments = [
    createMockAssignment("asg_01", "emp_01", "func_01", true, tenantId)
  ];

  const mockBackups: BackupAssignment[] = [
    {
      id: "bkp_01",
      tenantId,
      functionId: "func_01",
      employeeId: "emp_02",
      status: "active"
    }
  ];

  const mockOjts: OjtPlan[] = [
    // emp_02 completed OJT in func_01
    {
      id: "ojt_01",
      tenantId,
      employeeId: "emp_02",
      skillId: "func_01",
      status: "completed"
    }
  ];

  const mockEvidences: EvidenceRecord[] = [];
  const mockPrograms: TrainingProgram[] = [];

  it("should map employee capability baseline cleanly", () => {
    const rows = getPolyvalenceMatrixRowsByTenant(
      mockEmployees,
      mockUnits,
      mockFunctions,
      mockAssignments,
      mockBackups,
      mockPrograms,
      mockOjts,
      mockEvidences,
      { tenantId }
    );

    assert.strictEqual(rows.length, 2);
    
    // emp_01: Primary active assignment in func_01 -> operational capability level
    const r1 = rows.find(r => r.employeeId === "emp_01")!;
    const cap1 = r1.capabilities.find(c => c.functionId === "func_01")!;
    assert.strictEqual(cap1.capabilityLevel, "operational");
    assert.strictEqual(cap1.isPrimary, true);
    assert.strictEqual(cap1.isTrained, true);

    // emp_02: Validated active backup in func_01 -> backup capability level
    const r2 = rows.find(r => r.employeeId === "emp_02")!;
    const cap2 = r2.capabilities.find(c => c.functionId === "func_01")!;
    assert.strictEqual(cap2.capabilityLevel, "backup");
    assert.strictEqual(cap2.isBackup, true);
    assert.strictEqual(cap2.isPractical, true); // completed OJT plan
  });

  it("should verify tenant isolation with zero cross-tenant leakage", () => {
    const empA = createMockEmployee("emp_A", "Emp A", undefined, "tenant_A");
    const empB = createMockEmployee("emp_B", "Emp B", undefined, "tenant_B");

    const rows = getPolyvalenceMatrixRowsByTenant([empA, empB], [], [], [], [], [], [], [], { tenantId: "tenant_A" });
    assert.strictEqual(rows.length, 1);
    assert.strictEqual(rows[0].employeeName, "Emp A");
  });

  it("should verify empty arrays return safely", () => {
    const rows = getPolyvalenceMatrixRowsByTenant([], [], [], [], [], [], [], []);
    assert.strictEqual(rows.length, 0);

    const summary = getPolyvalenceSummaryDashboardData([], [], [], [], [], [], [], []);
    assert.strictEqual(summary.totalEmployees, 0);
  });

  it("should verify covered functions and functions without validated backup", () => {
    const covered = getFunctionsCoveredByTrainedEmployees(
      mockEmployees, mockUnits, mockFunctions, mockAssignments, mockBackups, mockPrograms, mockOjts, mockEvidences, { tenantId }
    );
    // func_01 is covered. func_02 is not.
    assert.strictEqual(covered.length, 1);
    assert.strictEqual(covered[0].id, "func_01");

    const noBackup = getFunctionsWithoutTrainedBackup(
      mockEmployees, mockUnits, mockFunctions, mockAssignments, mockBackups, mockPrograms, mockOjts, mockEvidences, { tenantId }
    );
    // func_02 has 0 backups
    assert.strictEqual(noBackup.length, 1);
    assert.strictEqual(noBackup[0].id, "func_02");
  });

  it("should verify employees with multiple validated functions", () => {
    // emp_01 has 1 validated function (func_01)
    const list = getEmployeesWithMultipleValidatedFunctions(
      mockEmployees, mockUnits, mockFunctions, mockAssignments, mockBackups, mockPrograms, mockOjts, mockEvidences, { tenantId }
    );
    assert.strictEqual(list.length, 0);
  });

  it("should verify Single Point of Failure (SPOF) function detection", () => {
    // func_01 has active primary emp_01 and backup emp_02 -> not SPOF.
    // Let's create func_03 with primary but 0 backups
    const func03 = createMockFunction("func_03", "FC-03", "Corte Três", tenantId);
    const asg03 = createMockAssignment("asg_03", "emp_01", "func_03", true, tenantId);

    const spofs = getSinglePointOfFailureFunctions(
      mockEmployees, mockUnits, [...mockFunctions, func03], [...mockAssignments, asg03], mockBackups, mockPrograms, mockOjts, mockEvidences, { tenantId }
    );

    assert.strictEqual(spofs.length, 1);
    assert.strictEqual(spofs[0].id, "func_03");
  });

  it("should verify coverage indicators by organization units", () => {
    const coverage = getPolyvalenceCoverageByOrgUnit(
      mockEmployees, mockUnits, mockFunctions, mockAssignments, mockBackups, mockPrograms, mockOjts, mockEvidences, { tenantId }
    );

    assert.strictEqual(coverage.length, 1);
    assert.strictEqual(coverage[0].organizationUnitName, "Corte Automático");
    assert.strictEqual(coverage[0].employeeCount, 2);
  });

  it("should verify training and OJT gap detections", () => {
    const trainingGaps = getTrainingGapIndicators(
      mockEmployees, mockUnits, mockFunctions, mockAssignments, mockBackups, mockPrograms, mockOjts, mockEvidences, { tenantId }
    );
    // emp_02 is backup on func_01 but lacks certified skill -> 1 training gap!
    assert.strictEqual(trainingGaps.length, 1);
    assert.strictEqual(trainingGaps[0].employeeId, "emp_02");

    const ojtGaps = getOjtGapIndicators(
      mockEmployees, mockUnits, mockFunctions, mockAssignments, mockBackups, mockPrograms, mockOjts, mockEvidences, { tenantId }
    );
    // emp_01 is primary on func_01 but lacks completed OJT -> 1 OJT gap!
    assert.strictEqual(ojtGaps.length, 1);
    assert.strictEqual(ojtGaps[0].employeeId, "emp_01");
  });

  it("should verify summary totals calculations", () => {
    const summary = getPolyvalenceSummaryDashboardData(
      mockEmployees, mockUnits, mockFunctions, mockAssignments, mockBackups, mockPrograms, mockOjts, mockEvidences, { tenantId }
    );

    assert.strictEqual(summary.totalEmployees, 2);
    assert.strictEqual(summary.polyvalentEmployeesCount, 0);
    assert.strictEqual(summary.spofFunctionsCount, 0);
    assert.strictEqual(summary.functionsWithoutBackupCount, 1);
    assert.strictEqual(summary.trainingGapsCount, 1);
    assert.strictEqual(summary.ojtGapsCount, 1);
  });

});

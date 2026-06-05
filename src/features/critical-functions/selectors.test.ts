import { describe, it } from "node:test";
import assert from "node:assert";
import { Priority, EvidenceStatus } from "../../shared/domain/people/enums";
import {
  Employee,
  Function,
  CriticalFunctionAssessment,
  BackupAssignment,
  SuccessionCandidate,
  KnowledgeAsset,
  EvidenceRecord,
  VulnerabilitySnapshot,
  EmployeeAssignment
} from "../../shared/domain/people/entities";

import {
  getCriticalFunctionsByTenant,
  getCriticalFunctionsByOrgUnit,
  getCriticalityLevelDistribution,
  getFunctionsWithoutActivePrimaryEmployee,
  getFunctionsWithoutValidatedBackup,
  getFunctionsWithoutSuccessionCandidate,
  getFunctionsWithoutKnowledgeAsset,
  getFunctionsWithoutEvidenceRecord,
  getHighExposureCriticalFunctions,
  getCriticalFunctionsSummaryDashboardData
} from "./selectors";

// ============================================================================
// TEST BUILDERS
// ============================================================================

const createMockFunction = (id: string, code: string, name: string, isCritical = true, tenantId = "tenant_1"): Function => ({
  id,
  tenantId,
  code,
  name,
  description: `${name} desc`,
  organizationUnitId: "unit_corte",
  isCritical,
  requiredBackupQuantity: 2
});

const createMockAssessment = (id: string, functionId: string, classification: Priority, tenantId = "tenant_1"): CriticalFunctionAssessment => ({
  id,
  tenantId,
  functionId,
  gutScore: 27,
  vulnerabilityScore: 10,
  classification
});

// ============================================================================
// TEST SUITE
// ============================================================================

describe("SaaS Critical Functions Pure Selectors Suite", () => {

  const tenantId = "tenant_1";

  const mockFunctions = [
    createMockFunction("func_01", "FC-01", "Corte Automático", true, tenantId),
    createMockFunction("func_02", "FC-02", "Costura Manual", true, tenantId)
  ];

  const mockAssessments = [
    createMockAssessment("assess_01", "func_01", Priority.HIGH, tenantId),
    createMockAssessment("assess_02", "func_02", Priority.LOW, tenantId)
  ];

  const mockEmployees: Employee[] = [
    {
      id: "emp_kaiky",
      tenantId,
      name: "Kaiky Principal",
      email: "kaiky@nexus.com",
      organizationUnitId: "unit_corte",
      status: "active",
      skills: []
    }
  ];

  const mockAssignments: EmployeeAssignment[] = [
    {
      id: "asg_01",
      tenantId,
      employeeId: "emp_kaiky",
      organizationUnitId: "unit_corte",
      functionId: "func_01",
      positionTitle: "Lead Operator",
      status: "active",
      isPrimary: true,
      startDate: "2026-01-01",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01"
    }
  ];

  const mockBackups: BackupAssignment[] = [];
  const mockCandidates: SuccessionCandidate[] = [];
  const mockAssets: KnowledgeAsset[] = [];
  const mockEvidences: EvidenceRecord[] = [];
  const mockSnapshots: VulnerabilitySnapshot[] = [];

  it("should calculate a structured CriticalFunctionRow baseline correctly", () => {
    // Under baseline:
    // func_01 has active primary Kaiky, no backups, no successors, no assets, no evidences
    const rows = getCriticalFunctionsByTenant(
      mockFunctions,
      mockAssessments,
      mockEmployees,
      mockAssignments,
      mockBackups,
      mockCandidates,
      mockAssets,
      mockEvidences,
      mockSnapshots,
      { tenantId }
    );

    assert.strictEqual(rows.length, 2);
    const r1 = rows.find(r => r.functionId === "func_01")!;
    assert.strictEqual(r1.code, "FC-01");
    assert.strictEqual(r1.primaryEmployeeName, "Kaiky Principal");
    assert.strictEqual(r1.validatedBackupCount, 0);
    assert.strictEqual(r1.successionCandidateCount, 0);
    assert.strictEqual(r1.hasKnowledgeAsset, false);
    assert.strictEqual(r1.hasEvidenceRecord, false);
    assert.strictEqual(r1.classification, Priority.HIGH);

    // Exposure calculations: High priority base (15) + missing backup (25) + missing successor (15) + missing asset (12) + missing evidence (15) = 82 exposure.
    assert.strictEqual(r1.exposureScore, 82);
    assert.strictEqual(r1.isHighExposure, true);
  });

  it("should verify tenant isolation with zero cross-tenant leakage", () => {
    const funcA = createMockFunction("func_A", "FC-A", "A", true, "tenant_A");
    const funcB = createMockFunction("func_B", "FC-B", "B", true, "tenant_B");

    const rows = getCriticalFunctionsByTenant([funcA, funcB], [], [], [], [], [], [], [], [], { tenantId: "tenant_A" });
    assert.strictEqual(rows.length, 1);
    assert.strictEqual(rows[0].functionId, "func_A");
  });

  it("should verify empty arrays return safely", () => {
    const rows = getCriticalFunctionsByTenant([], [], [], [], [], [], [], [], []);
    assert.strictEqual(rows.length, 0);

    const summary = getCriticalFunctionsSummaryDashboardData([], [], [], [], [], [], [], [], []);
    assert.strictEqual(summary.totalFunctions, 0);
  });

  it("should verify organization unit filtering resolution", () => {
    const rows = getCriticalFunctionsByOrgUnit(
      mockFunctions,
      mockAssessments,
      mockEmployees,
      mockAssignments,
      mockBackups,
      mockCandidates,
      mockAssets,
      mockEvidences,
      mockSnapshots,
      { organizationUnitId: "unit_corte", tenantId }
    );
    assert.strictEqual(rows.length, 2);
  });

  it("should verify active primary employee detection & missing backup detection", () => {
    const rowsNoPrimary = getFunctionsWithoutActivePrimaryEmployee(
      mockFunctions, mockAssessments, mockEmployees, mockAssignments, mockBackups, mockCandidates, mockAssets, mockEvidences, mockSnapshots, { tenantId }
    );
    // func_02 is missing primary operator
    assert.strictEqual(rowsNoPrimary.length, 1);
    assert.strictEqual(rowsNoPrimary[0].functionId, "func_02");

    const rowsNoBackup = getFunctionsWithoutValidatedBackup(
      mockFunctions, mockAssessments, mockEmployees, mockAssignments, mockBackups, mockCandidates, mockAssets, mockEvidences, mockSnapshots, { tenantId }
    );
    // Both functions have 0 backups
    assert.strictEqual(rowsNoBackup.length, 2);
  });

  it("should verify missing succession candidate, knowledge asset, and evidence record", () => {
    const rowsNoCandidate = getFunctionsWithoutSuccessionCandidate(
      mockFunctions, mockAssessments, mockEmployees, mockAssignments, mockBackups, mockCandidates, mockAssets, mockEvidences, mockSnapshots, { tenantId }
    );
    assert.strictEqual(rowsNoCandidate.length, 2);

    const rowsNoAsset = getFunctionsWithoutKnowledgeAsset(
      mockFunctions, mockAssessments, mockEmployees, mockAssignments, mockBackups, mockCandidates, mockAssets, mockEvidences, mockSnapshots, { tenantId }
    );
    assert.strictEqual(rowsNoAsset.length, 2);

    const rowsNoEvidence = getFunctionsWithoutEvidenceRecord(
      mockFunctions, mockAssessments, mockEmployees, mockAssignments, mockBackups, mockCandidates, mockAssets, mockEvidences, mockSnapshots, { tenantId }
    );
    assert.strictEqual(rowsNoEvidence.length, 2);
  });

  it("should verify summary totals calculations & exposure metrics", () => {
    const summary = getCriticalFunctionsSummaryDashboardData(
      mockFunctions,
      mockAssessments,
      mockEmployees,
      mockAssignments,
      mockBackups,
      mockCandidates,
      mockAssets,
      mockEvidences,
      mockSnapshots,
      { tenantId }
    );

    assert.strictEqual(summary.totalFunctions, 2);
    assert.strictEqual(summary.criticalFunctionsCount, 2);
    assert.strictEqual(summary.functionsWithoutPrimary, 1);
    assert.strictEqual(summary.functionsWithoutBackup, 2);
    assert.strictEqual(summary.functionsWithoutSuccessor, 2);
    assert.strictEqual(summary.functionsWithoutKnowledge, 2);
    assert.strictEqual(summary.functionsWithoutEvidence, 2);
    assert.strictEqual(summary.highExposureCount, 2);
  });

  it("should verify criticality level distribution calculations", () => {
    const dist = getCriticalityLevelDistribution(mockAssessments, { tenantId });

    assert.strictEqual(dist.lowCount, 1);
    assert.strictEqual(dist.highCount, 1);
    assert.strictEqual(dist.mediumCount, 0);
    assert.strictEqual(dist.criticalCount, 0);
  });

});

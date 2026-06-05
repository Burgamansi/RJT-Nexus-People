import { describe, it } from "node:test";
import assert from "node:assert";
import {
  EvidenceRecord,
  Employee,
  OrganizationUnit,
  Function,
  BackupAssignment,
  OjtPlan,
  KnowledgeAsset
} from "../../shared/domain/people/entities";

import { EvidenceStatus } from "../../shared/domain/people/enums";

import {
  getEvidenceRecordsByTenant,
  getEvidenceRecordsByStatus,
  getEvidenceRecordsByFunction,
  getEvidenceRecordsByOrgUnit,
  getEvidenceRecordsLinkedToEmployees,
  getPendingEvidenceRecords,
  getRejectedEvidenceRecords,
  getExpiredOrOutdatedEvidenceRecords,
  getMissingEvidenceForCriticalFunctions,
  getMissingEvidenceForTrainingOjt,
  getMissingEvidenceForBackupValidation,
  getEvidenceAuditSummaryDashboardData
} from "./selectors";

// ============================================================================
// TEST BUILDERS
// ============================================================================

const createMockEmployee = (
  id: string,
  name: string,
  unitId: string,
  tenantId = "tenant_1"
): Employee => ({
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

// ============================================================================
// TEST SUITE
// ============================================================================

describe("Evidence Center Pure Selectors Suite", () => {
  const tenantId = "tenant_1";

  // Mock Units
  const mockUnits = [
    createMockUnit("unit_corte", "Corte Automático", tenantId),
    createMockUnit("unit_costura", "Costura Manual", tenantId)
  ];

  // Mock Functions
  const mockFunctions = [
    createMockFunction("func_01", "FC-01", "Corte Principal", "unit_corte", true, tenantId),
    createMockFunction("func_02", "FC-02", "Costura Principal", "unit_costura", true, tenantId)
  ];

  // Mock Employees
  const mockEmployees = [
    createMockEmployee("emp_1", "Kaiky Competent", "unit_corte", tenantId),
    createMockEmployee("emp_2", "Arthur Backup", "unit_corte", tenantId)
  ];

  // Mock Knowledge Assets
  const mockAssets: KnowledgeAsset[] = [
    { id: "asset_1", tenantId, code: "SOP-01", title: "Corte SOP Guide", functionId: "func_01" }
  ];

  // Mock Evidences
  // ev_1: validated, not expired, uploaded 2026-05-20.
  // ev_2: pending, expired/outdated (uploaded 2024-01-01).
  // ev_3: rejected.
  const mockEvidences: EvidenceRecord[] = [
    {
      id: "ev_1",
      tenantId,
      employeeId: "emp_1",
      functionId: "func_01",
      status: EvidenceStatus.VALIDATED,
      evidenceUrl: "url_1",
      uploadedAt: "2026-05-20"
    },
    {
      id: "ev_2",
      tenantId,
      employeeId: "emp_1",
      knowledgeAssetId: "asset_1",
      status: EvidenceStatus.PENDING,
      evidenceUrl: "url_2",
      uploadedAt: "2024-01-01",
      expiresAt: "2025-01-01" // expired compared to 2026-06-01
    },
    {
      id: "ev_3",
      tenantId,
      employeeId: "emp_2",
      functionId: "func_02",
      status: EvidenceStatus.REJECTED,
      evidenceUrl: "url_3"
    }
  ];

  it("should calculate evidence rows isolated by tenant and identify expired statuses", () => {
    const rows = getEvidenceRecordsByTenant(
      mockEvidences,
      mockEmployees,
      mockUnits,
      mockFunctions,
      mockAssets,
      { tenantId }
    );

    assert.strictEqual(rows.length, 3);

    const r1 = rows.find(r => r.evidenceId === "ev_1")!;
    assert.strictEqual(r1.employeeName, "Kaiky Competent");
    assert.strictEqual(r1.functionName, "Corte Principal");
    assert.strictEqual(r1.status, EvidenceStatus.VALIDATED);
    assert.strictEqual(r1.isExpired, false);
    assert.strictEqual(r1.isOutdated, false);

    const r2 = rows.find(r => r.evidenceId === "ev_2")!;
    assert.strictEqual(r2.isExpired, true); // expiresAt is 2025-01-01 (< 2026-06-01)
    assert.strictEqual(r2.isOutdated, true);
  });

  it("should verify tenant isolation with zero cross-tenant leakage", () => {
    const evTenantA = { id: "ev_a", tenantId: "tenant_A", employeeId: "emp_1", status: EvidenceStatus.PENDING, evidenceUrl: "url_a" };
    const evTenantB = { id: "ev_b", tenantId: "tenant_B", employeeId: "emp_1", status: EvidenceStatus.PENDING, evidenceUrl: "url_b" };

    const rows = getEvidenceRecordsByTenant(
      [evTenantA, evTenantB],
      [],
      [],
      [],
      [],
      { tenantId: "tenant_A" }
    );

    assert.strictEqual(rows.length, 1);
    assert.strictEqual(rows[0].evidenceId, "ev_a");
  });

  it("should handle empty arrays safely", () => {
    const rows = getEvidenceRecordsByTenant([], [], [], [], []);
    assert.strictEqual(rows.length, 0);

    const summary = getEvidenceAuditSummaryDashboardData([], [], [], [], [], [], []);
    assert.strictEqual(summary.totalEvidenceRecords, 0);
  });

  it("should filter evidence records by status, function, organization unit and linked employee", () => {
    const validated = getEvidenceRecordsByStatus(
      EvidenceStatus.VALIDATED,
      mockEvidences,
      mockEmployees,
      mockUnits,
      mockFunctions,
      mockAssets,
      { tenantId }
    );
    assert.strictEqual(validated.length, 1);
    assert.strictEqual(validated[0].evidenceId, "ev_1");

    const funcEv = getEvidenceRecordsByFunction(
      "func_01",
      mockEvidences,
      mockEmployees,
      mockUnits,
      mockFunctions,
      mockAssets,
      { tenantId }
    );
    assert.strictEqual(funcEv.length, 1);

    const unitEv = getEvidenceRecordsByOrgUnit(
      "unit_corte",
      mockEvidences,
      mockEmployees,
      mockUnits,
      mockFunctions,
      mockAssets,
      { tenantId }
    );
    assert.strictEqual(unitEv.length, 3); // both employees are in unit_corte

    const empEv = getEvidenceRecordsLinkedToEmployees(
      "emp_2",
      mockEvidences,
      mockEmployees,
      mockUnits,
      mockFunctions,
      mockAssets,
      { tenantId }
    );
    assert.strictEqual(empEv.length, 1);
  });

  it("should select pending, rejected and expired/outdated evidence records", () => {
    const pending = getPendingEvidenceRecords(
      mockEvidences,
      mockEmployees,
      mockUnits,
      mockFunctions,
      mockAssets,
      { tenantId }
    );
    assert.strictEqual(pending.length, 1);
    assert.strictEqual(pending[0].evidenceId, "ev_2");

    const rejected = getRejectedEvidenceRecords(
      mockEvidences,
      mockEmployees,
      mockUnits,
      mockFunctions,
      mockAssets,
      { tenantId }
    );
    assert.strictEqual(rejected.length, 1);
    assert.strictEqual(rejected[0].evidenceId, "ev_3");

    const expiredOutdated = getExpiredOrOutdatedEvidenceRecords(
      mockEvidences,
      mockEmployees,
      mockUnits,
      mockFunctions,
      mockAssets,
      { tenantId }
    );
    assert.strictEqual(expiredOutdated.length, 1);
    assert.strictEqual(expiredOutdated[0].evidenceId, "ev_2");
  });

  it("should identify missing evidence for critical functions", () => {
    // func_02 is critical but has NO validated evidence record (ev_3 is rejected)
    const missing = getMissingEvidenceForCriticalFunctions(
      mockFunctions,
      mockEvidences,
      mockUnits,
      { tenantId }
    );

    assert.strictEqual(missing.length, 1);
    assert.strictEqual(missing[0].functionId, "func_02");
    assert.strictEqual(missing[0].missingType, "critical_function");
  });

  it("should identify missing evidence for training/OJT validation", () => {
    // ojt_1 completed by emp_1 on func_02 but has NO validated evidence on func_02
    const ojts: OjtPlan[] = [
      { id: "ojt_1", tenantId, employeeId: "emp_1", skillId: "func_02", status: "completed" }
    ];

    const missing = getMissingEvidenceForTrainingOjt(
      mockEmployees,
      ojts,
      mockFunctions,
      mockUnits,
      mockEvidences,
      { tenantId }
    );

    assert.strictEqual(missing.length, 1);
    assert.strictEqual(missing[0].employeeId, "emp_1");
    assert.strictEqual(missing[0].missingType, "training_ojt");
  });

  it("should identify missing evidence for backup validation", () => {
    // emp_2 acts as active backup on func_01 but lacks validated evidence on func_01
    const backups: BackupAssignment[] = [
      { id: "bkp_1", tenantId, functionId: "func_01", employeeId: "emp_2", status: "active" }
    ];

    const missing = getMissingEvidenceForBackupValidation(
      mockEmployees,
      backups,
      mockFunctions,
      mockUnits,
      mockEvidences,
      { tenantId }
    );

    assert.strictEqual(missing.length, 1);
    assert.strictEqual(missing[0].employeeId, "emp_2");
    assert.strictEqual(missing[0].missingType, "backup_validation");
  });

  it("should calculate correct summary totals and audit readiness compliance scores", () => {
    const summary = getEvidenceAuditSummaryDashboardData(
      mockEvidences,
      mockEmployees,
      mockUnits,
      mockFunctions,
      mockAssets,
      [],
      [],
      { tenantId }
    );

    assert.strictEqual(summary.totalEvidenceRecords, 3);
    assert.strictEqual(summary.validatedCount, 1); // ev_1
    assert.strictEqual(summary.pendingCount, 1); // ev_2
    assert.strictEqual(summary.rejectedCount, 1); // ev_3
    assert.strictEqual(summary.expiredCount, 1); // ev_2
    assert.strictEqual(summary.outdatedCount, 1); // ev_2
    assert.strictEqual(summary.criticalMissingCount, 1); // func_02 has no validated evidence
    // Score calculation: 1 validated / (3 records + 1 critical missing) * 100 = 25%
    assert.strictEqual(summary.auditReadinessScore, 25);
  });
});

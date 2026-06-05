import { describe, it } from "node:test";
import assert from "node:assert";
import { Priority, ActionStatus, EvidenceStatus, ActionGapType } from "../../shared/domain/people/enums";
import {
  Employee,
  OrganizationUnit,
  Function,
  CriticalFunctionAssessment,
  BackupAssignment,
  SuccessionCandidate,
  TrainingProgram,
  OjtPlan,
  KnowledgeAsset,
  EvidenceRecord,
  VulnerabilitySnapshot,
  ActionPlan
} from "../../shared/domain/people/entities";

import {
  getActionPlanRows,
  getActionItemRows,
  getActionOwnerRows,
  getActionSourceLinkRows,
  getActionGapRows,
  getActionPlansSummary
} from "./selectors";

// ============================================================================
// TEST BUILDER UTILITIES
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

const createMockFunction = (id: string, code: string, name: string, unitId: string, isCritical = true, tenantId = "tenant_1"): Function => ({
  id,
  tenantId,
  code,
  name,
  description: `${name} desc`,
  organizationUnitId: unitId,
  isCritical,
  requiredBackupQuantity: 2
});

const createMockAction = (
  id: string,
  title: string,
  functionId: string,
  ownerId: string | null,
  status: ActionStatus,
  priority: Priority,
  dueDate: string | undefined,
  tenantId = "tenant_1"
): ActionPlan => ({
  id,
  tenantId,
  title,
  description: `${title} description`,
  status,
  priority,
  ownerEmployeeId: ownerId,
  functionId,
  sourceType: "critical_function",
  sourceRecordId: functionId,
  dueDate,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01"
});

// ============================================================================
// TEST SUITE
// ============================================================================

describe("SaaS Action Plans Selector Suite (Shared Domain Only)", () => {

  const tenantId = "tenant_1";
  
  const mockUnits: OrganizationUnit[] = [
    createMockUnit("unit_corte", "Corte Automático", tenantId)
  ];

  const mockEmployees: Employee[] = [
    createMockEmployee("emp_kaiky", "Kaiky Owner", "unit_corte", tenantId),
    createMockEmployee("emp_eliane", "Eliane Assigner", "unit_corte", tenantId)
  ];

  const mockFunctions: Function[] = [
    createMockFunction("func_01", "FC-101", "Operação de Guilhotina", "unit_corte", true, tenantId)
  ];

  const mockEvidences: EvidenceRecord[] = [
    {
      id: "ev_01",
      tenantId,
      employeeId: "emp_kaiky",
      functionId: "func_01",
      status: EvidenceStatus.VALIDATED,
      evidenceUrl: "http://evidence/guilhotina"
    }
  ];

  const mockSnapshots: VulnerabilitySnapshot[] = [
    {
      id: "snap_01",
      tenantId,
      functionId: "func_01",
      score: 80,
      riskLevel: Priority.HIGH
    }
  ];

  it("should map an ActionPlan into a structured ActionPlanRow baseline correctly", () => {
    const plan = createMockAction("plan_01", "Capacitar Operadores", "func_01", "emp_kaiky", ActionStatus.PENDING, Priority.MEDIUM, "2026-12-31", tenantId);

    const rows = getActionPlanRows([plan], mockFunctions, mockEmployees, mockUnits, mockEvidences, mockSnapshots);

    assert.strictEqual(rows.length, 1);
    const row = rows[0];
    assert.strictEqual(row.actionPlanId, "plan_01");
    assert.strictEqual(row.title, "Capacitar Operadores");
    assert.strictEqual(row.status, ActionStatus.PENDING);
    assert.strictEqual(row.priority, Priority.MEDIUM);
    assert.strictEqual(row.ownerEmployeeId, "emp_kaiky");
    assert.strictEqual(row.ownerName, "Kaiky Owner");
    assert.strictEqual(row.organizationUnitName, "Corte Automático");
    assert.strictEqual(row.functionName, "Operação de Guilhotina");
    assert.strictEqual(row.linkedEvidenceCount, 1);
    assert.strictEqual(row.openItemCount, 1);
    assert.strictEqual(row.completedItemCount, 0);
    assert.strictEqual(row.isOverdue, false);
    assert.strictEqual(row.tenantId, tenantId);
  });

  it("should verify tenant isolation for mapped action rows", () => {
    const planA = createMockAction("plan_A", "Ação A", "func_01", "emp_kaiky", ActionStatus.PENDING, Priority.MEDIUM, "2026-12-31", "tenant_A");
    const planB = createMockAction("plan_B", "Ação B", "func_01", "emp_kaiky", ActionStatus.PENDING, Priority.MEDIUM, "2026-12-31", "tenant_B");

    const rows = getActionPlanRows([planA, planB], mockFunctions, mockEmployees, mockUnits, [], [], { tenantId: "tenant_A" });
    assert.strictEqual(rows.length, 1);
    assert.strictEqual(rows[0].actionPlanId, "plan_A");
  });

  it("should verify status counting & overdue action detection (Reference Date 2026-06-01)", () => {
    const planOverdue = createMockAction("p1", "Overdue", "func_01", "emp_kaiky", ActionStatus.IN_PROGRESS, Priority.HIGH, "2026-05-15", tenantId);
    const planCompleted = createMockAction("p2", "Completed", "func_01", "emp_kaiky", ActionStatus.COMPLETED, Priority.HIGH, "2026-05-15", tenantId);

    const rows = getActionPlanRows([planOverdue, planCompleted], mockFunctions, mockEmployees, mockUnits, [], []);

    assert.strictEqual(rows.length, 2);
    const r1 = rows.find(r => r.actionPlanId === "p1")!;
    assert.strictEqual(r1.isOverdue, true);
    assert.strictEqual(r1.overdueItemCount, 1);
    assert.strictEqual(r1.openItemCount, 1);

    const r2 = rows.find(r => r.actionPlanId === "p2")!;
    assert.strictEqual(r2.isOverdue, false);
    assert.strictEqual(r2.completedItemCount, 1);
    assert.strictEqual(r2.openItemCount, 0);
  });

  it("should verify owner and source link resolutions", () => {
    const plan = createMockAction("p1", "Ação", "func_01", "emp_kaiky", ActionStatus.PENDING, Priority.MEDIUM, "2026-12-31", tenantId);

    const owners = getActionOwnerRows([plan], mockFunctions, mockEmployees, mockUnits, [], []);
    assert.strictEqual(owners.length, 1);
    assert.strictEqual(owners[0].employeeId, "emp_kaiky");
    assert.strictEqual(owners[0].employeeName, "Kaiky Owner");
    assert.strictEqual(owners[0].activeActionPlansCount, 1);

    const links = getActionSourceLinkRows([plan], mockFunctions, mockEmployees, mockUnits, [], []);
    assert.strictEqual(links.length, 1);
    assert.strictEqual(links[0].sourceRecordId, "func_01");
    assert.strictEqual(links[0].sourceType, "critical_function");
  });

  it("should detect missing owner and missing evidence gaps", () => {
    const planNoOwner = createMockAction("p1", "Sem Dono", "func_01", null, ActionStatus.PENDING, Priority.MEDIUM, "2026-12-31", tenantId);
    const planNoEv = createMockAction("p2", "No Ev", "func_01", "emp_kaiky", ActionStatus.COMPLETED, Priority.MEDIUM, "2026-12-31", tenantId);

    const gaps = getActionGapRows([planNoOwner, planNoEv], mockFunctions, mockEmployees, mockUnits, [], []);

    const missingOwner = gaps.find(g => g.gapType === ActionGapType.MISSING_OWNER);
    assert.ok(missingOwner);
    assert.strictEqual(missingOwner.severity, "critical");

    const missingEvidence = gaps.find(g => g.gapType === ActionGapType.MISSING_EVIDENCE);
    assert.ok(missingEvidence);
    assert.strictEqual(missingEvidence.severity, "warning");
  });

  it("should detect critical function without action and vulnerability without action gaps", () => {
    const gaps = getActionGapRows([], mockFunctions, mockEmployees, mockUnits, [], mockSnapshots, { tenantId });

    const missingAction = gaps.find(g => g.gapType === ActionGapType.CRITICAL_FUNCTION_WITHOUT_ACTION);
    assert.ok(missingAction);
    assert.strictEqual(missingAction.targetRecordId, "func_01");
    assert.strictEqual(missingAction.severity, "critical");

    const missingVulnAction = gaps.find(g => g.gapType === ActionGapType.VULNERABILITY_WITHOUT_ACTION);
    assert.ok(missingVulnAction);
    assert.strictEqual(missingVulnAction.targetRecordId, "func_01");
    assert.strictEqual(missingVulnAction.severity, "critical");
  });

  it("should verify summary calculations and completion rate averages", () => {
    const p1 = createMockAction("p1", "Plan 1", "func_01", "emp_kaiky", ActionStatus.PENDING, Priority.MEDIUM, "2026-12-31", tenantId);
    const p2 = createMockAction("p2", "Plan 2", "func_01", "emp_kaiky", ActionStatus.COMPLETED, Priority.MEDIUM, "2026-12-31", tenantId);

    const summary = getActionPlansSummary([p1, p2], mockFunctions, mockEmployees, mockUnits, [], []);

    assert.strictEqual(summary.totalActionPlans, 2);
    assert.strictEqual(summary.openActionPlans, 1);
    assert.strictEqual(summary.completedActionPlans, 1);
    assert.strictEqual(summary.averageCompletionRate, 50);
  });

});

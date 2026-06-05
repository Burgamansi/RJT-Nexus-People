import { describe, it } from "node:test";
import assert from "node:assert";
import {
  Employee,
  OrganizationUnit,
  Function,
  EmployeeAssignment
} from "../../shared/domain/people/entities";

import {
  getWorkforceEmployeeRows,
  getWorkforceFunctionRows,
  getWorkforceOrgUnitRows,
  getWorkforceAssignmentRows,
  getWorkforceMapSummary
} from "./selectors";

// ============================================================================
// MOCK BUILDER UTILITIES
// ============================================================================

const createMockEmployee = (id: string, name: string, status: "active" | "inactive" = "active", tenantId = "tenant_1"): Employee => ({
  id,
  tenantId,
  name,
  email: `${id}@nexus.com`,
  organizationUnitId: "unit_corte",
  status,
  skills: []
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
  description: `${name} description`,
  organizationUnitId: "unit_corte",
  isCritical: true,
  requiredBackupQuantity: 2
});

const createMockAssignment = (
  id: string,
  employeeId: string,
  functionId: string,
  isPrimary: boolean,
  status: "active" | "inactive" | "ended",
  tenantId = "tenant_1"
): EmployeeAssignment => ({
  id,
  tenantId,
  employeeId,
  organizationUnitId: "unit_corte",
  functionId,
  positionTitle: isPrimary ? "Lead Operator" : "Support Operator",
  status,
  isPrimary,
  startDate: "2026-01-01",
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01"
});

// ============================================================================
// TEST SUITE
// ============================================================================

describe("SaaS Workforce Map Pure Selectors Suite", () => {

  const tenantId = "tenant_1";

  const mockUnits = [
    createMockUnit("unit_corte", "Corte Automático", tenantId)
  ];

  const mockEmployees = [
    createMockEmployee("emp_01", "Kaiky Principal", "active", tenantId),
    createMockEmployee("emp_02", "Eliane Backup", "active", tenantId),
    createMockEmployee("emp_03", "Marcos Inactive", "inactive", tenantId)
  ];

  const mockFunctions = [
    createMockFunction("func_01", "FC-01", "Corte de Guilhotina", tenantId),
    createMockFunction("func_02", "FC-02", "Costura de Sacos", tenantId)
  ];

  const mockAssignments = [
    createMockAssignment("asg_01", "emp_01", "func_01", true, "active", tenantId),
    createMockAssignment("asg_02", "emp_02", "func_01", false, "active", tenantId),
    createMockAssignment("asg_03", "emp_02", "func_02", false, "ended", tenantId)
  ];

  it("should map employees into WorkforceEmployeeRow baseline correctly", () => {
    const rows = getWorkforceEmployeeRows(mockEmployees, mockUnits, mockFunctions, mockAssignments);

    assert.strictEqual(rows.length, 3);
    const kRow = rows.find(r => r.employeeId === "emp_01")!;
    assert.strictEqual(kRow.employeeName, "Kaiky Principal");
    assert.strictEqual(kRow.primaryPositionTitle, "Lead Operator");
    assert.strictEqual(kRow.primaryFunctionName, "Corte de Guilhotina");
    assert.strictEqual(kRow.organizationUnitName, "Corte Automático");
    assert.strictEqual(kRow.assignmentsCount, 1);
  });

  it("should verify tenant isolation for workforce map mapping", () => {
    const empA = createMockEmployee("emp_A", "Emp A", "active", "tenant_A");
    const empB = createMockEmployee("emp_B", "Emp B", "active", "tenant_B");

    const rows = getWorkforceEmployeeRows([empA, empB], mockUnits, mockFunctions, [], { tenantId: "tenant_A" });
    assert.strictEqual(rows.length, 1);
    assert.strictEqual(rows[0].employeeName, "Emp A");
  });

  it("should verify assignment states (active, inactive, ended)", () => {
    const rows = getWorkforceAssignmentRows(mockEmployees, mockUnits, mockFunctions, mockAssignments);

    assert.strictEqual(rows.length, 3);
    const asg1 = rows.find(r => r.assignmentId === "asg_01")!;
    assert.strictEqual(asg1.status, "active");
    assert.strictEqual(asg1.isPrimary, true);

    const asg3 = rows.find(r => r.assignmentId === "asg_03")!;
    assert.strictEqual(asg3.status, "ended");
  });

  it("should verify employees without assignment and functions without owner", () => {
    const summary = getWorkforceMapSummary(mockEmployees, mockUnits, mockFunctions, mockAssignments);

    // emp_03 is inactive. emp_01 & emp_02 have active assignments. So 0 active employees without assignment
    assert.strictEqual(summary.employeesWithoutAssignment, 0);

    // func_01 has active primary owner emp_01. func_02 has ended backup. So func_02 has 0 active primary owners -> 1 function without owner
    assert.strictEqual(summary.functionsWithoutOwner, 1);
  });

  it("should verify assignments breakdown: primary, temporary, ended", () => {
    const summary = getWorkforceMapSummary(mockEmployees, mockUnits, mockFunctions, mockAssignments);

    assert.strictEqual(summary.primaryAssignments, 1); // asg_01
    assert.strictEqual(summary.temporaryAssignments, 1); // asg_02
    assert.strictEqual(summary.endedAssignments, 1); // asg_03
  });

  it("should verify workforce map filtering logic", () => {
    // Search filter
    const rowsSearch = getWorkforceEmployeeRows(mockEmployees, mockUnits, mockFunctions, mockAssignments, { search: "guilhotina" });
    // "Kaiky Principal" is primary on "Corte de Guilhotina", but Guilhotina is Function Name, wait search matches employeeName, email, and positionTitle.
    // Let's test search with employeeName:
    const rowsName = getWorkforceEmployeeRows(mockEmployees, mockUnits, mockFunctions, mockAssignments, { search: "kaiky" });
    assert.strictEqual(rowsName.length, 1);
    assert.strictEqual(rowsName[0].employeeName, "Kaiky Principal");

    // Without assignment filter
    const unassignedEmployee = createMockEmployee("emp_unassigned", "No Work", "active", tenantId);
    const list = [...mockEmployees, unassignedEmployee];
    const rowsUnassigned = getWorkforceEmployeeRows(list, mockUnits, mockFunctions, mockAssignments, { onlyWithoutAssignment: true });
    assert.strictEqual(rowsUnassigned.length, 2); // Marcos Inactive (no assignments) + No Work
  });

  it("should verify summary totals calculations", () => {
    const summary = getWorkforceMapSummary(mockEmployees, mockUnits, mockFunctions, mockAssignments);

    assert.strictEqual(summary.totalEmployees, 3);
    assert.strictEqual(summary.activeEmployees, 2);
    assert.strictEqual(summary.inactiveEmployees, 1);
    assert.strictEqual(summary.totalOrgUnits, 1);
    assert.strictEqual(summary.totalFunctions, 2);
  });

});

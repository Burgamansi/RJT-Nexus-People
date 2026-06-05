import { describe, it } from "node:test";
import assert from "node:assert";
import {
  parseCSV,
  DefaultXLSXAdapter,
  validateRow,
  mapRowToEntity,
  processImportPipeline,
  ImportMapping
} from "./index";
import { Employee, ActionPlan } from "../../shared/domain/people/entities";
import { Priority, ActionStatus } from "../../shared/domain/people/enums";

describe("SaaS Import Center Core Suite", () => {
  
  // ============================================================================
  // 1. CSV PARSER TESTS
  // ============================================================================
  describe("CSV Parser logic", () => {
    it("should parse normal rows separated by commas", () => {
      const csv = "id,name,tenantId\nEMP001,John Doe,tenant_ubg\nEMP002,Jane Smith,tenant_ubg";
      const rows = parseCSV(csv);
      assert.strictEqual(rows.length, 2);
      assert.strictEqual(rows[0].id, "EMP001");
      assert.strictEqual(rows[0].name, "John Doe");
      assert.strictEqual(rows[0].tenantid, "tenant_ubg");
    });

    it("should parse rows with different delimiters like semicolon or tab", () => {
      const csv = "id;name;tenantId\nEMP001;John Doe;tenant_ubg";
      const rows = parseCSV(csv, ";");
      assert.strictEqual(rows.length, 1);
      assert.strictEqual(rows[0].id, "EMP001");
      assert.strictEqual(rows[0].name, "John Doe");
    });

    it("should handle double-quoted fields with commas inside quotes", () => {
      const csv = 'id,name,description,tenantId\nEMP001,"Doe, John","Main, Supervisor",tenant_ubg';
      const rows = parseCSV(csv);
      assert.strictEqual(rows.length, 1);
      assert.strictEqual(rows[0].name, "Doe, John");
      assert.strictEqual(rows[0].description, "Main, Supervisor");
    });

    it("should handle escaped quotes represented as double-quotes inside quotes", () => {
      const csv = 'id,name,tenantId\nEMP001,"John ""The Boss"" Doe",tenant_ubg';
      const rows = parseCSV(csv);
      assert.strictEqual(rows.length, 1);
      assert.strictEqual(rows[0].name, 'John "The Boss" Doe');
    });

    it("should handle newlines within double-quoted fields", () => {
      const csv = 'id,description,tenantId\nEMP001,"First Line\nSecond Line",tenant_ubg';
      const rows = parseCSV(csv);
      assert.strictEqual(rows.length, 1);
      assert.strictEqual(rows[0].description, "First Line\nSecond Line");
    });
  });

  // ============================================================================
  // 2. XLSX ADAPTER TESTS
  // ============================================================================
  describe("XLSX Adapter logic", () => {
    it("should process JSON-encoded sheets in buffer correctly", () => {
      const adapter = new DefaultXLSXAdapter();
      const mockJson = JSON.stringify([
        { id: "EMP001", name: "John Doe", tenantId: "tenant_ubg" }
      ]);
      const encoder = new TextEncoder();
      const buffer = encoder.encode(mockJson).buffer;

      const rows = adapter.parseWorkbook(buffer);
      assert.strictEqual(rows.length, 1);
      assert.strictEqual(rows[0].id, "EMP001");
      assert.strictEqual(rows[0].name, "John Doe");
    });
  });

  // ============================================================================
  // 3. VALIDATION LAYER TESTS
  // ============================================================================
  describe("Validation Engine logic", () => {
    it("should reject row if missing required tenantId", () => {
      const row = { id: "EMP001", name: "John Doe" };
      const outcome = validateRow(row, 2, "employee");
      assert.strictEqual(outcome.errors.length > 0, true);
      assert.strictEqual(outcome.errors[0].column, "tenantId");
    });

    it("should reject row if tenantId mismatch", () => {
      const row = {
        id: "EMP001",
        name: "John Doe",
        email: "john@doe.com",
        organizationUnitId: "ORG001",
        tenantId: "tenant_other"
      };
      const outcome = validateRow(row, 2, "employee", "tenant_ubg");
      assert.strictEqual(outcome.errors.length, 1);
      assert.strictEqual(outcome.errors[0].column, "tenantId");
    });

    it("should validate employee fields and format warning", () => {
      const row = {
        id: "EMP001",
        name: "John Doe",
        email: "invalid-email-no-at",
        organizationUnitId: "ORG001",
        tenantId: "tenant_ubg",
        status: "invalid-status"
      };

      const outcome = validateRow(row, 2, "employee", "tenant_ubg");
      assert.strictEqual(outcome.errors.length, 1); // status invalid
      assert.strictEqual(outcome.errors[0].column, "status");

      assert.strictEqual(outcome.warnings.length, 1); // email format warning
      assert.strictEqual(outcome.warnings[0].column, "email");
    });

    it("should validate Action Plan enums, statuses, and sources", () => {
      const row = {
        id: "AP001",
        title: "Action Plan",
        description: "Desc",
        status: "invalid-status",
        priority: "invalid-priority",
        sourceType: "invalid-source",
        sourceRecordId: "REC001",
        tenantId: "tenant_ubg"
      };

      const outcome = validateRow(row, 2, "action_plan", "tenant_ubg");
      // Expect 3 errors: status, priority, sourceType
      assert.strictEqual(outcome.errors.length, 3);
      const cols = outcome.errors.map(e => e.column);
      assert.ok(cols.includes("status"));
      assert.ok(cols.includes("priority"));
      assert.ok(cols.includes("sourceType"));
    });
  });

  // ============================================================================
  // 4. MAPPING LAYER TESTS
  // ============================================================================
  describe("Mapping engine logic", () => {
    it("should map raw row to Employee entity with resolved skill array", () => {
      const row = {
        id: "EMP001",
        name: "John Doe",
        email: "john@doe.com",
        organizationUnitId: "ORG001",
        status: "ACTIVE",
        skills: "SKILL1:Multiplier:true,SKILL2:Independent:false",
        tenantId: "tenant_ubg"
      };

      const employee = mapRowToEntity<Employee>(row, "employee");
      assert.strictEqual(employee.id, "EMP001");
      assert.strictEqual(employee.status, "active");
      assert.strictEqual(employee.skills.length, 2);
      assert.deepStrictEqual(employee.skills[0], {
        skillId: "SKILL1",
        proficiencyLevel: "Multiplier",
        certified: true
      });
    });

    it("should respect custom mappings and fallback values", () => {
      const row = {
        emp_code: "EMP002",
        full_name: "Jane Smith",
        email: "jane@smith.com",
        unit_id: "ORG001",
        tenantId: "tenant_ubg"
      };

      const mapping: ImportMapping = {
        columnMappings: {
          emp_code: "id",
          full_name: "name",
          unit_id: "organizationUnitId"
        },
        fallbackValues: {
          status: "inactive"
        }
      };

      const employee = mapRowToEntity<Employee>(row, "employee", mapping);
      assert.strictEqual(employee.id, "EMP002");
      assert.strictEqual(employee.name, "Jane Smith");
      assert.strictEqual(employee.organizationUnitId, "ORG001");
      assert.strictEqual(employee.status, "inactive");
    });
  });

  // ============================================================================
  // 5. ORCHESTRATION PIPELINE TESTS
  // ============================================================================
  describe("Import pipeline coordinator", () => {
    it("should coordinate high-level processing of multiple rows", () => {
      const rawCSV = `id,title,description,status,priority,sourceType,sourceRecordId,tenantId
AP001,Action 1,Desc 1,pending,low,vulnerability,REC001,tenant_ubg
AP002,Action 2,Desc 2,invalid-status,high,vulnerability,REC002,tenant_ubg
AP003,Action 3,Desc 3,completed,critical,skill_gap,REC003,tenant_ubg`;

      const result = processImportPipeline<ActionPlan>(rawCSV, {
        importType: "action_plan",
        tenantId: "tenant_ubg"
      });

      assert.strictEqual(result.processedCount, 3);
      assert.strictEqual(result.successCount, 2); // row 2 should fail due to status
      assert.strictEqual(result.entities.length, 2);
      assert.strictEqual(result.entities[0].id, "AP001");
      assert.strictEqual(result.entities[0].status, ActionStatus.PENDING);
      assert.strictEqual(result.entities[1].id, "AP003");
      assert.strictEqual(result.entities[1].status, ActionStatus.COMPLETED);

      assert.strictEqual(result.errors.length, 1);
      assert.strictEqual(result.errors[0].row, 3); // index + 2 offset
      assert.strictEqual(result.errors[0].column, "status");
    });
  });

});

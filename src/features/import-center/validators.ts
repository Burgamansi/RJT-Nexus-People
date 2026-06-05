import { ImportError, ImportWarning, ImportType, RawImportRow } from "./types";
import { Priority, ActionStatus, EvidenceStatus } from "../../shared/domain/people/enums";

// Helper validator regexes
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export interface ValidationOutcome {
  errors: ImportError[];
  warnings: ImportWarning[];
}

/**
 * Validates a single parsed row for a specific ImportType under strict multi-tenant constraints.
 */
export function validateRow(
  row: RawImportRow,
  rowNumber: number,
  importType: ImportType,
  targetTenantId?: string
): ValidationOutcome {
  const errors: ImportError[] = [];
  const warnings: ImportWarning[] = [];

  // Helper to push errors
  const addError = (column: string, message: string, value?: string) => {
    errors.push({
      row: rowNumber,
      column,
      message,
      value,
      isCritical: true
    });
  };

  // Helper to push warnings
  const addWarning = (column: string, message: string, value?: string) => {
    warnings.push({
      row: rowNumber,
      column,
      message,
      value
    });
  };

  // --- Strict Tenant-Aware Verification ---
  const tenantId = row["tenantid"] || row["tenantId"] || "";
  if (!tenantId || tenantId.trim() === "") {
    addError("tenantId", "Missing tenant identifier. All imports must be tenant isolated.");
  } else if (targetTenantId && tenantId !== targetTenantId) {
    addError(
      "tenantId",
      `Tenant ID mismatch. Expected '${targetTenantId}', but row specifies '${tenantId}'.`,
      tenantId
    );
  }

  // --- Entity Schema Validations ---
  switch (importType) {
    case "employee": {
      // Required: id, name, email, organizationunitid
      const id = row["id"] || "";
      const name = row["name"] || "";
      const email = row["email"] || "";
      const orgUnitId = row["organizationunitid"] || row["organizationUnitId"] || "";
      const status = (row["status"] || "active").toLowerCase();

      if (!id) addError("id", "Employee ID is required.");
      if (!name) addError("name", "Employee name is required.");
      if (!email) {
        addError("email", "Employee email is required.");
      } else if (!EMAIL_REGEX.test(email)) {
        addWarning("email", "Invalid email format detected.", email);
      }
      if (!orgUnitId) addError("organizationUnitId", "Organization unit ID is required.");

      if (status !== "active" && status !== "inactive") {
        addError("status", "Status must be either 'active' or 'inactive'.", status);
      }
      break;
    }

    case "organization_unit": {
      // Required: id, name, type
      const id = row["id"] || "";
      const name = row["name"] || "";
      const type = (row["type"] || "").toLowerCase();

      if (!id) addError("id", "Organization Unit ID is required.");
      if (!name) addError("name", "Organization Unit name is required.");
      
      const validTypes = ["department", "sector", "division"];
      if (!type) {
        addError("type", "Organization Unit type is required.");
      } else if (!validTypes.includes(type)) {
        addError(
          "type",
          `Invalid type. Must be one of department, sector, or division.`,
          type
        );
      }
      break;
    }

    case "function": {
      // Required: id, code, name, organizationunitid
      const id = row["id"] || "";
      const code = row["code"] || "";
      const name = row["name"] || "";
      const orgUnitId = row["organizationunitid"] || row["organizationUnitId"] || "";
      const isCriticalStr = (row["iscritical"] || row["isCritical"] || "false").toLowerCase();

      if (!id) addError("id", "Function ID is required.");
      if (!code) addError("code", "Function code (e.g. FC001) is required.");
      if (!name) addError("name", "Function name is required.");
      if (!orgUnitId) addError("organizationUnitId", "Organization Unit ID mapping is required.");

      if (isCriticalStr !== "true" && isCriticalStr !== "false") {
        addWarning("isCritical", "Invalid boolean value. Defaulting to false.", isCriticalStr);
      }
      break;
    }

    case "employee_assignment": {
      // Required: id, employeeid, organizationunitid, functionid, positiontitle
      const id = row["id"] || "";
      const empId = row["employeeid"] || row["employeeId"] || "";
      const orgUnitId = row["organizationunitid"] || row["organizationUnitId"] || "";
      const funcId = row["functionid"] || row["functionId"] || "";
      const positionTitle = row["positiontitle"] || row["positionTitle"] || "";
      const isPrimaryStr = (row["isprimary"] || row["isPrimary"] || "false").toLowerCase();
      const status = (row["status"] || "active").toLowerCase();
      const startDate = row["startdate"] || row["startDate"] || "";

      if (!id) addError("id", "Assignment ID is required.");
      if (!empId) addError("employeeId", "Employee ID reference is required.");
      if (!orgUnitId) addError("organizationUnitId", "Organization Unit ID reference is required.");
      if (!funcId) addError("functionId", "Function ID reference is required.");
      if (!positionTitle) addError("positionTitle", "Position title is required.");

      if (status !== "active" && status !== "inactive" && status !== "ended") {
        addError("status", "Status must be active, inactive, or ended.", status);
      }

      if (startDate && !DATE_REGEX.test(startDate)) {
        addWarning("startDate", "Date must follow YYYY-MM-DD format.", startDate);
      }
      if (isPrimaryStr !== "true" && isPrimaryStr !== "false") {
        addWarning("isPrimary", "Invalid boolean value. Defaulting to false.", isPrimaryStr);
      }
      break;
    }

    case "training_program": {
      // Required: id, name, skillid
      const id = row["id"] || "";
      const name = row["name"] || "";
      const skillId = row["skillid"] || row["skillId"] || "";

      if (!id) addError("id", "Training Program ID is required.");
      if (!name) addError("name", "Training Program name is required.");
      if (!skillId) addError("skillId", "Skill ID target is required.");
      break;
    }

    case "ojt_plan": {
      // Required: id, employeeid, skillid, status
      const id = row["id"] || "";
      const empId = row["employeeid"] || row["employeeId"] || "";
      const skillId = row["skillid"] || row["skillId"] || "";
      const status = (row["status"] || "").toLowerCase();

      if (!id) addError("id", "OJT Plan ID is required.");
      if (!empId) addError("employeeId", "Employee ID reference is required.");
      if (!skillId) addError("skillId", "Skill ID target is required.");

      const validStatuses = ["planned", "in_progress", "completed"];
      if (!status) {
        addError("status", "Status is required.");
      } else if (!validStatuses.includes(status)) {
        addError("status", "Status must be planned, in_progress, or completed.", status);
      }
      break;
    }

    case "knowledge_asset": {
      // Required: id, code, title, functionid
      const id = row["id"] || "";
      const code = row["code"] || "";
      const title = row["title"] || "";
      const funcId = row["functionid"] || row["functionId"] || "";
      const lastReviewedAt = row["lastreviewedat"] || row["lastReviewedAt"] || "";

      if (!id) addError("id", "Knowledge Asset ID is required.");
      if (!code) addError("code", "Document code is required.");
      if (!title) addError("title", "Asset title is required.");
      if (!funcId) addError("functionId", "Function ID reference is required.");

      if (lastReviewedAt && !DATE_REGEX.test(lastReviewedAt)) {
        addWarning("lastReviewedAt", "Date must follow YYYY-MM-DD format.", lastReviewedAt);
      }
      break;
    }

    case "evidence_record": {
      // Required: id, employeeid, evidenceurl, status
      const id = row["id"] || "";
      const empId = row["employeeid"] || row["employeeId"] || "";
      const url = row["evidenceurl"] || row["evidenceUrl"] || "";
      const status = (row["status"] || "").toLowerCase();

      if (!id) addError("id", "Evidence Record ID is required.");
      if (!empId) addError("employeeId", "Employee ID reference is required.");
      if (!url) addError("evidenceUrl", "Evidence storage URL is required.");

      const validStatuses = Object.values(EvidenceStatus) as string[];
      if (!status) {
        addError("status", "Evidence status is required.");
      } else if (!validStatuses.includes(status)) {
        addError(
          "status",
          `Status must be one of: ${validStatuses.join(", ")}`,
          status
        );
      }
      break;
    }

    case "action_plan": {
      // Required: id, title, description, status, priority, sourcetype, sourcerecordid
      const id = row["id"] || "";
      const title = row["title"] || "";
      const desc = row["description"] || row["description"] || "";
      const status = (row["status"] || "").toLowerCase();
      const priority = (row["priority"] || "").toLowerCase();
      const sourceType = (row["sourcetype"] || row["sourceType"] || "").toLowerCase();
      const sourceRecordId = row["sourcerecordid"] || row["sourceRecordId"] || "";
      const dueDate = row["duedate"] || row["dueDate"] || "";

      if (!id) addError("id", "Action Plan ID is required.");
      if (!title) addError("title", "Title is required.");
      if (!desc) addError("description", "Description is required.");

      const validStatuses = Object.values(ActionStatus) as string[];
      if (!status) {
        addError("status", "Action status is required.");
      } else if (!validStatuses.includes(status)) {
        addError(
          "status",
          `Status must be one of: ${validStatuses.join(", ")}`,
          status
        );
      }

      const validPriorities = Object.values(Priority) as string[];
      if (!priority) {
        addError("priority", "Priority is required.");
      } else if (!validPriorities.includes(priority)) {
        addError(
          "priority",
          `Priority must be one of: ${validPriorities.join(", ")}`,
          priority
        );
      }

      const validSources = [
        "vulnerability",
        "critical_function",
        "skill_gap",
        "backup_gap",
        "succession_gap",
        "knowledge_gap",
        "evidence_gap"
      ];
      if (!sourceType) {
        addError("sourceType", "Source Type is required.");
      } else if (!validSources.includes(sourceType)) {
        addError(
          "sourceType",
          `Source Type must be one of: ${validSources.join(", ")}`,
          sourceType
        );
      }

      if (!sourceRecordId) addError("sourceRecordId", "Source Record ID is required.");
      
      if (dueDate && !DATE_REGEX.test(dueDate)) {
        addWarning("dueDate", "Date must follow YYYY-MM-DD format.", dueDate);
      }
      break;
    }
  }

  return { errors, warnings };
}

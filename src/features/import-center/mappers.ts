import { RawImportRow, ImportType, ImportMapping } from "./types";
import { Priority, ActionStatus, EvidenceStatus } from "../../shared/domain/people/enums";

/**
 * Resolves a property value from a raw parsed row.
 * Respects custom header mappings, supports fallback values, and performs case-insensitive casing match.
 */
export function resolvePropValue(
  row: RawImportRow,
  propName: string,
  mapping?: ImportMapping
): any {
  const normPropName = propName.toLowerCase();

  // 1. Column mapping lookup
  if (mapping?.columnMappings) {
    for (const [csvHeader, entityProp] of Object.entries(mapping.columnMappings)) {
      if (entityProp.toLowerCase() === normPropName) {
        const val = row[csvHeader.toLowerCase()];
        if (val !== undefined && val !== "") return val;
      }
    }
  }

  // 2. Generic case-insensitive lookup
  for (const [key, val] of Object.entries(row)) {
    if (key.toLowerCase() === normPropName) {
      if (val !== undefined && val !== "") return val;
    }
  }

  // 3. Fallback configuration lookup
  if (mapping?.fallbackValues && mapping.fallbackValues[propName] !== undefined) {
    return mapping.fallbackValues[propName];
  }

  return undefined;
}

/**
 * Transforms a single RawImportRow into a normalized domain entity.
 */
export function mapRowToEntity<T>(
  row: RawImportRow,
  importType: ImportType,
  mapping?: ImportMapping
): T {
  const getProp = (propName: string, defaultVal: any = ""): any => {
    const val = resolvePropValue(row, propName, mapping);
    return val !== undefined ? val : defaultVal;
  };

  const tenantId = getProp("tenantId");

  switch (importType) {
    case "employee": {
      const skillsStr = getProp("skills", "");
      let skills: any[] = [];
      if (skillsStr && typeof skillsStr === "string") {
        try {
          skills = JSON.parse(skillsStr);
        } catch {
          // Fallback parsing: "skillId:proficiencyLevel:certified,..."
          skillsStr.split(",").forEach(s => {
            const parts = s.split(":");
            if (parts[0]) {
              skills.push({
                skillId: parts[0].trim(),
                proficiencyLevel: parts[1] ? parts[1].trim() : "UNASSESSED",
                certified: parts[2] ? parts[2].trim().toLowerCase() === "true" : false
              });
            }
          });
        }
      } else if (Array.isArray(skillsStr)) {
        skills = skillsStr;
      }

      return {
        id: getProp("id"),
        tenantId,
        name: getProp("name"),
        email: getProp("email"),
        organizationUnitId: getProp("organizationUnitId"),
        status: (getProp("status", "active") as string).toLowerCase() === "active" ? "active" : "inactive",
        skills
      } as unknown as T;
    }

    case "organization_unit": {
      return {
        id: getProp("id"),
        tenantId,
        name: getProp("name"),
        type: (getProp("type", "department") as string).toLowerCase()
      } as unknown as T;
    }

    case "function": {
      const isCriticalStr = String(getProp("isCritical", "false")).toLowerCase();
      const requiredBackup = getProp("requiredBackupQuantity", "0");

      return {
        id: getProp("id"),
        tenantId,
        code: getProp("code"),
        name: getProp("name"),
        description: getProp("description", ""),
        organizationUnitId: getProp("organizationUnitId"),
        isCritical: isCriticalStr === "true",
        requiredBackupQuantity: parseInt(requiredBackup, 10) || 0
      } as unknown as T;
    }

    case "employee_assignment": {
      const isPrimaryStr = String(getProp("isPrimary", "false")).toLowerCase();
      const nowStr = new Date().toISOString().split("T")[0];

      return {
        id: getProp("id"),
        tenantId,
        employeeId: getProp("employeeId"),
        organizationUnitId: getProp("organizationUnitId"),
        functionId: getProp("functionId"),
        positionTitle: getProp("positionTitle"),
        status: (getProp("status", "active") as string).toLowerCase(),
        isPrimary: isPrimaryStr === "true",
        startDate: getProp("startDate", nowStr),
        endDate: getProp("endDate") || undefined,
        managerEmployeeId: getProp("managerEmployeeId") || undefined,
        createdAt: getProp("createdAt", new Date().toISOString()),
        updatedAt: getProp("updatedAt", new Date().toISOString())
      } as unknown as T;
    }

    case "training_program": {
      return {
        id: getProp("id"),
        tenantId,
        name: getProp("name"),
        skillId: getProp("skillId")
      } as unknown as T;
    }

    case "ojt_plan": {
      return {
        id: getProp("id"),
        tenantId,
        employeeId: getProp("employeeId"),
        skillId: getProp("skillId"),
        status: (getProp("status", "planned") as string).toLowerCase()
      } as unknown as T;
    }

    case "knowledge_asset": {
      return {
        id: getProp("id"),
        tenantId,
        code: getProp("code"),
        title: getProp("title"),
        functionId: getProp("functionId"),
        lastReviewedAt: getProp("lastReviewedAt") || undefined
      } as unknown as T;
    }

    case "evidence_record": {
      return {
        id: getProp("id"),
        tenantId,
        employeeId: getProp("employeeId"),
        functionId: getProp("functionId") || undefined,
        knowledgeAssetId: getProp("knowledgeAssetId") || undefined,
        status: (getProp("status", EvidenceStatus.PENDING) as string).toLowerCase() as EvidenceStatus,
        evidenceUrl: getProp("evidenceUrl"),
        uploadedAt: getProp("uploadedAt") || new Date().toISOString(),
        expiresAt: getProp("expiresAt") || undefined
      } as unknown as T;
    }

    case "action_plan": {
      const nowStr = new Date().toISOString();
      return {
        id: getProp("id"),
        tenantId,
        title: getProp("title"),
        description: getProp("description"),
        status: (getProp("status", ActionStatus.PENDING) as string).toLowerCase() as ActionStatus,
        priority: (getProp("priority", Priority.LOW) as string).toLowerCase() as Priority,
        ownerEmployeeId: getProp("ownerEmployeeId") || null,
        functionId: getProp("functionId") || undefined,
        sourceType: (getProp("sourceType", "critical_function") as string).toLowerCase(),
        sourceRecordId: getProp("sourceRecordId"),
        dueDate: getProp("dueDate") || undefined,
        createdAt: getProp("createdAt", nowStr),
        updatedAt: getProp("updatedAt", nowStr)
      } as unknown as T;
    }
  }

  throw new Error(`Unsupported mapping entity type: ${importType}`);
}

/**
 * High-level orchestration function to process an array of raw rows into mapped SaaS entities.
 */
export function mapRowsToEntities<T>(
  rows: RawImportRow[],
  importType: ImportType,
  mapping?: ImportMapping
): T[] {
  return rows.map(row => mapRowToEntity<T>(row, importType, mapping));
}

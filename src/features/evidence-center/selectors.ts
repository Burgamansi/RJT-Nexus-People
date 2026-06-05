import {
  EvidenceRecord,
  Employee,
  OrganizationUnit,
  Function,
  BackupAssignment,
  OjtPlan,
  KnowledgeAsset,
  ActionPlan
} from "../../shared/domain/people/entities";

import { EvidenceStatus } from "../../shared/domain/people/enums";

import {
  EvidenceFilters,
  EvidenceRow,
  MissingEvidenceRow,
  EvidenceAuditSummary
} from "./types";

// ============================================================================
// HELPERS
// ============================================================================
function filterTenantData<T>(items: T[], tenantId?: string): T[] {
  if (!tenantId) return items;
  return items.filter(item => (item as any).tenantId === tenantId);
}

function getDaysDifference(startStr: string, refStr: string): number {
  const start = new Date(startStr);
  const ref = new Date(refStr);
  if (isNaN(start.getTime()) || isNaN(ref.getTime())) {
    return 0;
  }
  const diffTime = ref.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// ============================================================================
// 1. EVIDENCE RECORDS BY TENANT
// ============================================================================
export function getEvidenceRecordsByTenant(
  evidences: EvidenceRecord[],
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assets: KnowledgeAsset[],
  filters?: EvidenceFilters
): EvidenceRow[] {
  const tenantId = filters?.tenantId;

  // Isolate by tenant
  const tEvidences = filterTenantData(evidences, tenantId);
  const tEmployees = filterTenantData(employees, tenantId);
  const tUnits = filterTenantData(units, tenantId);
  const tFunctions = filterTenantData(functions, tenantId);
  const tAssets = filterTenantData(assets, tenantId);

  const rows: EvidenceRow[] = tEvidences.map(ev => {
    // Resolve employee
    const emp = tEmployees.find(e => e.id === ev.employeeId);
    const employeeName = emp ? emp.name : "Unknown Employee";
    const organizationUnitId = emp ? emp.organizationUnitId : "";

    // Resolve organization unit
    const unit = tUnits.find(u => u.id === organizationUnitId);
    const organizationUnitName = unit ? unit.name : "Unknown Unit";

    // Resolve function
    const func = ev.functionId ? tFunctions.find(f => f.id === ev.functionId) : undefined;
    const functionName = func ? func.name : undefined;
    const isCritical = func ? func.isCritical : false;

    // Resolve knowledge asset
    const asset = ev.knowledgeAssetId ? tAssets.find(a => a.id === ev.knowledgeAssetId) : undefined;
    const knowledgeAssetTitle = asset ? asset.title : undefined;

    // Resolve expiration / outdated status relative to reference date 2026-06-01
    let isExpired = false;
    if (ev.expiresAt) {
      const days = getDaysDifference(ev.expiresAt, "2026-06-01");
      isExpired = days > 0; // expiresAt is in the past compared to 2026-06-01
    }

    let isOutdated = isExpired;
    if (ev.uploadedAt && !isOutdated) {
      const days = getDaysDifference(ev.uploadedAt, "2026-06-01");
      isOutdated = days > 365; // Uploaded more than a year ago
    }

    return {
      evidenceId: ev.id,
      employeeId: ev.employeeId,
      employeeName,
      organizationUnitId,
      organizationUnitName,
      functionId: ev.functionId,
      functionName,
      knowledgeAssetId: ev.knowledgeAssetId,
      knowledgeAssetTitle,
      status: ev.status,
      evidenceUrl: ev.evidenceUrl,
      uploadedAt: ev.uploadedAt,
      expiresAt: ev.expiresAt,
      isOutdated,
      isExpired,
      tenantId: ev.tenantId
    };
  });

  // Apply filters
  return rows.filter(row => {
    if (filters?.organizationUnitId && row.organizationUnitId !== filters.organizationUnitId) {
      return false;
    }
    if (filters?.status && row.status !== filters.status) {
      return false;
    }
    if (filters?.employeeId && row.employeeId !== filters.employeeId) {
      return false;
    }
    if (filters?.functionId && row.functionId !== filters.functionId) {
      return false;
    }
    if (filters?.isCriticalOnly) {
      // Find matching function to verify criticality
      const func = tFunctions.find(f => f.id === row.functionId);
      if (!func || !func.isCritical) return false;
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      const matchEmp = row.employeeName.toLowerCase().includes(query);
      const matchUnit = row.organizationUnitName.toLowerCase().includes(query);
      const matchFunc = row.functionName?.toLowerCase().includes(query);
      if (!matchEmp && !matchUnit && !matchFunc) {
        return false;
      }
    }
    return true;
  });
}

// ============================================================================
// 2. EVIDENCE RECORDS BY STATUS
// ============================================================================
export function getEvidenceRecordsByStatus(
  status: EvidenceStatus,
  evidences: EvidenceRecord[],
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assets: KnowledgeAsset[],
  filters?: EvidenceFilters
): EvidenceRow[] {
  const rows = getEvidenceRecordsByTenant(evidences, employees, units, functions, assets, filters);
  return rows.filter(r => r.status === status);
}

// ============================================================================
// 3. EVIDENCE RECORDS BY FUNCTION
// ============================================================================
export function getEvidenceRecordsByFunction(
  functionId: string,
  evidences: EvidenceRecord[],
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assets: KnowledgeAsset[],
  filters?: EvidenceFilters
): EvidenceRow[] {
  const rows = getEvidenceRecordsByTenant(evidences, employees, units, functions, assets, filters);
  return rows.filter(r => r.functionId === functionId);
}

// ============================================================================
// 4. EVIDENCE RECORDS BY ORGANIZATION UNIT
// ============================================================================
export function getEvidenceRecordsByOrgUnit(
  organizationUnitId: string,
  evidences: EvidenceRecord[],
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assets: KnowledgeAsset[],
  filters?: EvidenceFilters
): EvidenceRow[] {
  const rows = getEvidenceRecordsByTenant(evidences, employees, units, functions, assets, filters);
  return rows.filter(r => r.organizationUnitId === organizationUnitId);
}

// ============================================================================
// 5. EVIDENCE RECORDS LINKED TO EMPLOYEES
// ============================================================================
export function getEvidenceRecordsLinkedToEmployees(
  employeeId: string,
  evidences: EvidenceRecord[],
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assets: KnowledgeAsset[],
  filters?: EvidenceFilters
): EvidenceRow[] {
  const rows = getEvidenceRecordsByTenant(evidences, employees, units, functions, assets, filters);
  return rows.filter(r => r.employeeId === employeeId);
}

// ============================================================================
// 6. PENDING EVIDENCE RECORDS
// ============================================================================
export function getPendingEvidenceRecords(
  evidences: EvidenceRecord[],
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assets: KnowledgeAsset[],
  filters?: EvidenceFilters
): EvidenceRow[] {
  return getEvidenceRecordsByStatus(EvidenceStatus.PENDING, evidences, employees, units, functions, assets, filters);
}

// ============================================================================
// 7. REJECTED EVIDENCE RECORDS
// ============================================================================
export function getRejectedEvidenceRecords(
  evidences: EvidenceRecord[],
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assets: KnowledgeAsset[],
  filters?: EvidenceFilters
): EvidenceRow[] {
  return getEvidenceRecordsByStatus(EvidenceStatus.REJECTED, evidences, employees, units, functions, assets, filters);
}

// ============================================================================
// 8. EXPIRED OR OUTDATED EVIDENCE RECORDS
// ============================================================================
export function getExpiredOrOutdatedEvidenceRecords(
  evidences: EvidenceRecord[],
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assets: KnowledgeAsset[],
  filters?: EvidenceFilters
): EvidenceRow[] {
  const rows = getEvidenceRecordsByTenant(evidences, employees, units, functions, assets, filters);
  return rows.filter(r => r.isExpired || r.isOutdated);
}

// ============================================================================
// 9. MISSING EVIDENCE FOR CRITICAL FUNCTIONS
// ============================================================================
export function getMissingEvidenceForCriticalFunctions(
  functions: Function[],
  evidences: EvidenceRecord[],
  units: OrganizationUnit[],
  filters?: EvidenceFilters
): MissingEvidenceRow[] {
  const tenantId = filters?.tenantId;

  // Isolate by tenant
  const tFunctions = filterTenantData(functions, tenantId);
  const tEvidences = filterTenantData(evidences, tenantId);
  const tUnits = filterTenantData(units, tenantId);

  const missing: MissingEvidenceRow[] = [];

  tFunctions.forEach(func => {
    if (!func.isCritical) return;

    const unit = tUnits.find(u => u.id === func.organizationUnitId);
    const organizationUnitName = unit ? unit.name : "Unknown Unit";

    // Check if there is any validated evidence record for this function
    const hasValidatedEvidence = tEvidences.some(
      ev => ev.functionId === func.id && ev.status === EvidenceStatus.VALIDATED
    );

    if (!hasValidatedEvidence) {
      missing.push({
        functionId: func.id,
        functionName: func.name,
        isCritical: func.isCritical,
        organizationUnitId: func.organizationUnitId,
        organizationUnitName,
        missingType: "critical_function",
        description: `Critical function [${func.name}] has no validated competence evidence record.`,
        tenantId: func.tenantId
      });
    }
  });

  // Apply filters
  return missing.filter(row => {
    if (filters?.organizationUnitId && row.organizationUnitId !== filters.organizationUnitId) {
      return false;
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      if (!row.functionName?.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });
}

// ============================================================================
// 10. MISSING EVIDENCE FOR TRAINING / OJT
// ============================================================================
export function getMissingEvidenceForTrainingOjt(
  employees: Employee[],
  ojts: OjtPlan[],
  functions: Function[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  filters?: EvidenceFilters
): MissingEvidenceRow[] {
  const tenantId = filters?.tenantId;

  // Isolate by tenant
  const tEmployees = filterTenantData(employees, tenantId);
  const tOjts = filterTenantData(ojts, tenantId);
  const tFunctions = filterTenantData(functions, tenantId);
  const tUnits = filterTenantData(units, tenantId);
  const tEvidences = filterTenantData(evidences, tenantId);

  const missing: MissingEvidenceRow[] = [];

  tOjts.forEach(ojt => {
    if (ojt.status !== "completed") return;

    const emp = tEmployees.find(e => e.id === ojt.employeeId);
    if (!emp) return;

    const unit = tUnits.find(u => u.id === emp.organizationUnitId);
    const organizationUnitName = unit ? unit.name : "Unknown Unit";

    const func = tFunctions.find(f => f.id === ojt.skillId);
    const functionName = func ? func.name : "General Skill";
    const isCritical = func ? func.isCritical : false;

    // Check validated evidence
    const hasEvidence = tEvidences.some(
      ev => ev.employeeId === ojt.employeeId && ev.functionId === ojt.skillId && ev.status === EvidenceStatus.VALIDATED
    );

    if (!hasEvidence) {
      missing.push({
        functionId: ojt.skillId,
        functionName,
        isCritical,
        organizationUnitId: emp.organizationUnitId,
        organizationUnitName,
        missingType: "training_ojt",
        employeeId: emp.id,
        employeeName: emp.name,
        description: `Employee [${emp.name}] completed practical OJT for [${functionName}] but lacks a validated evidence record.`,
        tenantId: ojt.tenantId
      });
    }
  });

  // Apply filters
  return missing.filter(row => {
    if (filters?.organizationUnitId && row.organizationUnitId !== filters.organizationUnitId) {
      return false;
    }
    if (filters?.isCriticalOnly && !row.isCritical) {
      return false;
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      const matchEmp = row.employeeName?.toLowerCase().includes(query);
      const matchFunc = row.functionName?.toLowerCase().includes(query);
      if (!matchEmp && !matchFunc) {
        return false;
      }
    }
    return true;
  });
}

// ============================================================================
// 11. MISSING EVIDENCE FOR BACKUP VALIDATION
// ============================================================================
export function getMissingEvidenceForBackupValidation(
  employees: Employee[],
  backups: BackupAssignment[],
  functions: Function[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  filters?: EvidenceFilters
): MissingEvidenceRow[] {
  const tenantId = filters?.tenantId;

  // Isolate by tenant
  const tEmployees = filterTenantData(employees, tenantId);
  const tBackups = filterTenantData(backups, tenantId);
  const tFunctions = filterTenantData(functions, tenantId);
  const tUnits = filterTenantData(units, tenantId);
  const tEvidences = filterTenantData(evidences, tenantId);

  const missing: MissingEvidenceRow[] = [];

  tBackups.forEach(backup => {
    if (backup.status !== "active") return;

    const emp = tEmployees.find(e => e.id === backup.employeeId);
    if (!emp) return;

    const unit = tUnits.find(u => u.id === emp.organizationUnitId);
    const organizationUnitName = unit ? unit.name : "Unknown Unit";

    const func = tFunctions.find(f => f.id === backup.functionId);
    const functionName = func ? func.name : "General Skill";
    const isCritical = func ? func.isCritical : false;

    // Check validated evidence
    const hasEvidence = tEvidences.some(
      ev => ev.employeeId === backup.employeeId && ev.functionId === backup.functionId && ev.status === EvidenceStatus.VALIDATED
    );

    if (!hasEvidence) {
      missing.push({
        functionId: backup.functionId,
        functionName,
        isCritical,
        organizationUnitId: emp.organizationUnitId,
        organizationUnitName,
        missingType: "backup_validation",
        employeeId: emp.id,
        employeeName: emp.name,
        description: `Employee [${emp.name}] acts as active backup for [${functionName}] but lacks a validated evidence record.`,
        tenantId: backup.tenantId
      });
    }
  });

  // Apply filters
  return missing.filter(row => {
    if (filters?.organizationUnitId && row.organizationUnitId !== filters.organizationUnitId) {
      return false;
    }
    if (filters?.isCriticalOnly && !row.isCritical) {
      return false;
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      const matchEmp = row.employeeName?.toLowerCase().includes(query);
      const matchFunc = row.functionName?.toLowerCase().includes(query);
      if (!matchEmp && !matchFunc) {
        return false;
      }
    }
    return true;
  });
}

// ============================================================================
// 12. AUDIT READINESS SUMMARY DASHBOARD DATA
// ============================================================================
export function getEvidenceAuditSummaryDashboardData(
  evidences: EvidenceRecord[],
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assets: KnowledgeAsset[],
  ojts: OjtPlan[],
  backups: BackupAssignment[],
  filters?: EvidenceFilters
): EvidenceAuditSummary {
  const tenantId = filters?.tenantId;

  const mappedRows = getEvidenceRecordsByTenant(evidences, employees, units, functions, assets, { tenantId });
  const missingCritical = getMissingEvidenceForCriticalFunctions(functions, evidences, units, { tenantId });

  const totalEvidenceRecords = mappedRows.length;
  const validatedCount = mappedRows.filter(r => r.status === EvidenceStatus.VALIDATED).length;
  const pendingCount = mappedRows.filter(r => r.status === EvidenceStatus.PENDING).length;
  const rejectedCount = mappedRows.filter(r => r.status === EvidenceStatus.REJECTED).length;

  const expiredCount = mappedRows.filter(r => r.isExpired).length;
  const outdatedCount = mappedRows.filter(r => r.isOutdated).length;

  const criticalMissingCount = missingCritical.length;

  // Audit readiness score represents percentage of expected critical proof documents validated
  const expectedItemsCount = totalEvidenceRecords + criticalMissingCount;
  const auditReadinessScore =
    expectedItemsCount > 0 ? Math.round((validatedCount / expectedItemsCount) * 100) : 0;

  return {
    totalEvidenceRecords,
    validatedCount,
    pendingCount,
    rejectedCount,
    expiredCount,
    outdatedCount,
    criticalMissingCount,
    auditReadinessScore,
    tenantId: tenantId || ""
  };
}

import { Priority, EvidenceStatus } from "../../shared/domain/people/enums";
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
  PolyvalenceMatrixFilters,
  PolyvalenceEmployeeRow,
  EmployeeCapability,
  PolyvalenceOrgUnitRow,
  PolyvalenceSummary,
  CapabilityLevel
} from "./types";

// ============================================================================
// 1. HELPER TENANT FILTER
// ============================================================================

function filterTenantData<T>(items: T[], tenantId?: string): T[] {
  if (!tenantId) return items;
  return items.filter(item => (item as any).tenantId === tenantId);
}

// ============================================================================
// 2. 10 PURE SELECTORS IMPLEMENTATION
// ============================================================================

/**
 * 1. Returns mapped workforce polyvalence matrix rows isolated by tenant and applying filters.
 */
export function getPolyvalenceMatrixRowsByTenant(
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  programs: TrainingProgram[],
  ojts: OjtPlan[],
  evidences: EvidenceRecord[],
  filters?: PolyvalenceMatrixFilters
): PolyvalenceEmployeeRow[] {
  const tenantId = filters?.tenantId;

  // Isolate by tenant
  const tEmployees = filterTenantData(employees, tenantId);
  const tUnits = filterTenantData(units, tenantId);
  const tFuncs = filterTenantData(functions, tenantId);
  const tAssignments = filterTenantData(assignments, tenantId);
  const tBackups = filterTenantData(backups, tenantId);
  const tOjts = filterTenantData(ojts, tenantId);

  const rows: PolyvalenceEmployeeRow[] = tEmployees.map(emp => {
    // Resolve organization unit name
    const orgUnit = tUnits.find(u => u.id === emp.organizationUnitId);
    const organizationUnitName = orgUnit ? orgUnit.name : "Unassigned";

    // Resolve capabilities for each function in this tenant
    const capabilities: EmployeeCapability[] = tFuncs.map(func => {
      const isPrimary = tAssignments.some(
        a => a.employeeId === emp.id && a.functionId === func.id && a.isPrimary && a.status === "active"
      );

      const isBackup = tBackups.some(
        b => b.employeeId === emp.id && b.functionId === func.id && b.status === "active"
      );

      const isTrained = emp.skills.some(
        s => s.skillId === func.id && s.certified
      );

      const isPractical = tOjts.some(
        o => o.employeeId === emp.id && o.skillId === func.id && o.status === "completed"
      );

      let capabilityLevel: CapabilityLevel = "none";
      if (isPrimary) {
        capabilityLevel = "operational";
      } else if (isBackup) {
        capabilityLevel = "backup";
      } else if (isPractical) {
        capabilityLevel = "practical";
      } else if (isTrained) {
        capabilityLevel = "training";
      }

      return {
        functionId: func.id,
        functionCode: func.code,
        functionName: func.name,
        isPrimary,
        isBackup,
        isTrained,
        isPractical,
        capabilityLevel
      };
    });

    const primaryCount = capabilities.filter(c => c.isPrimary).length;
    const backupCount = capabilities.filter(c => c.isBackup).length;
    const totalValidatedCount = capabilities.filter(c => c.capabilityLevel !== "none").length;

    return {
      employeeId: emp.id,
      employeeName: emp.name,
      organizationUnitId: emp.organizationUnitId,
      organizationUnitName,
      capabilities,
      primaryCount,
      backupCount,
      totalValidatedCount,
      tenantId: emp.tenantId
    };
  });

  // Apply filters
  return rows.filter(row => {
    if (filters?.organizationUnitId && row.organizationUnitId !== filters.organizationUnitId) {
      return false;
    }
    if (filters?.employeeId && row.employeeId !== filters.employeeId) {
      return false;
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      if (!row.employeeName.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });
}

/**
 * 2. Resolves capability map filtering by employee or function.
 */
export function getEmployeeFunctionCapabilityMap(
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  programs: TrainingProgram[],
  ojts: OjtPlan[],
  evidences: EvidenceRecord[],
  filters?: PolyvalenceMatrixFilters
): PolyvalenceEmployeeRow[] {
  return getPolyvalenceMatrixRowsByTenant(
    employees, units, functions, assignments, backups, programs, ojts, evidences, filters
  );
}

/**
 * 3. Returns functions currently covered by at least one qualified/trained employee.
 */
export function getFunctionsCoveredByTrainedEmployees(
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  programs: TrainingProgram[],
  ojts: OjtPlan[],
  evidences: EvidenceRecord[],
  filters?: PolyvalenceMatrixFilters
): Function[] {
  const tenantId = filters?.tenantId;
  const tFuncs = filterTenantData(functions, tenantId);

  const matrix = getPolyvalenceMatrixRowsByTenant(
    employees, units, functions, assignments, backups, programs, ojts, evidences, { tenantId }
  );

  return tFuncs.filter(func => {
    return matrix.some(row => {
      const cap = row.capabilities.find(c => c.functionId === func.id);
      return cap && (cap.capabilityLevel === "operational" || cap.capabilityLevel === "backup" || cap.isTrained || cap.isPractical);
    });
  });
}

/**
 * 4. Returns functions lacking any active, validated backup.
 */
export function getFunctionsWithoutTrainedBackup(
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  programs: TrainingProgram[],
  ojts: OjtPlan[],
  evidences: EvidenceRecord[],
  filters?: PolyvalenceMatrixFilters
): Function[] {
  const tenantId = filters?.tenantId;
  const tFuncs = filterTenantData(functions, tenantId);

  const matrix = getPolyvalenceMatrixRowsByTenant(
    employees, units, functions, assignments, backups, programs, ojts, evidences, { tenantId }
  );

  return tFuncs.filter(func => {
    const backupCount = matrix.filter(row => {
      const cap = row.capabilities.find(c => c.functionId === func.id);
      return cap && cap.isBackup;
    }).length;
    return backupCount === 0;
  });
}

/**
 * 5. Returns active employees who hold multiple validated capabilities.
 */
export function getEmployeesWithMultipleValidatedFunctions(
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  programs: TrainingProgram[],
  ojts: OjtPlan[],
  evidences: EvidenceRecord[],
  filters?: PolyvalenceMatrixFilters
): PolyvalenceEmployeeRow[] {
  const rows = getPolyvalenceMatrixRowsByTenant(
    employees, units, functions, assignments, backups, programs, ojts, evidences, filters
  );
  return rows.filter(row => row.totalValidatedCount >= 2);
}

/**
 * 6. Returns Single Point of Failure (SPOF) functions:
 * Has an active primary employee assignment but 0 active validated backups.
 */
export function getSinglePointOfFailureFunctions(
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  programs: TrainingProgram[],
  ojts: OjtPlan[],
  evidences: EvidenceRecord[],
  filters?: PolyvalenceMatrixFilters
): Function[] {
  const tenantId = filters?.tenantId;
  const tFuncs = filterTenantData(functions, tenantId);
  const tAssignments = filterTenantData(assignments, tenantId);
  const tBackups = filterTenantData(backups, tenantId);

  return tFuncs.filter(func => {
    const hasPrimary = tAssignments.some(a => a.functionId === func.id && a.isPrimary && a.status === "active");
    const hasBackup = tBackups.some(b => b.functionId === func.id && b.status === "active");
    return hasPrimary && !hasBackup;
  });
}

/**
 * 7. Groups and counts polyvalence indices aggregated by organization units.
 */
export function getPolyvalenceCoverageByOrgUnit(
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  programs: TrainingProgram[],
  ojts: OjtPlan[],
  evidences: EvidenceRecord[],
  filters?: PolyvalenceMatrixFilters
): PolyvalenceOrgUnitRow[] {
  const tenantId = filters?.tenantId;
  const tUnits = filterTenantData(units, tenantId);

  const rows = getPolyvalenceMatrixRowsByTenant(
    employees, units, functions, assignments, backups, programs, ojts, evidences, { tenantId }
  );

  const spofs = getSinglePointOfFailureFunctions(
    employees, units, functions, assignments, backups, programs, ojts, evidences, { tenantId }
  );

  return tUnits.map(unit => {
    const unitRows = rows.filter(r => r.organizationUnitId === unit.id);
    const count = unitRows.length;
    const totalValidatedIndex = unitRows.reduce((sum, r) => sum + r.totalValidatedCount, 0);
    
    const unitSpofs = spofs.filter(f => f.organizationUnitId === unit.id).length;

    return {
      organizationUnitId: unit.id,
      organizationUnitName: unit.name,
      employeeCount: count,
      averagePolyvalenceIndex: count > 0 ? parseFloat((totalValidatedIndex / count).toFixed(2)) : 0,
      spofCount: unitSpofs,
      tenantId: unit.tenantId
    };
  });
}

export interface PolyvalenceGapIndicator {
  employeeId: string;
  employeeName: string;
  functionId: string;
  functionName: string;
  type: "training_gap" | "ojt_gap";
  description: string;
}

/**
 * 8. Returns training gap indicators (assigned primary/backup employee missing certified skills).
 */
export function getTrainingGapIndicators(
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  programs: TrainingProgram[],
  ojts: OjtPlan[],
  evidences: EvidenceRecord[],
  filters?: PolyvalenceMatrixFilters
): PolyvalenceGapIndicator[] {
  const rows = getPolyvalenceMatrixRowsByTenant(
    employees, units, functions, assignments, backups, programs, ojts, evidences, filters
  );

  const gaps: PolyvalenceGapIndicator[] = [];

  rows.forEach(row => {
    row.capabilities.forEach(cap => {
      const isActiveAssigned = cap.isPrimary || cap.isBackup;
      if (isActiveAssigned && !cap.isTrained) {
        gaps.push({
          employeeId: row.employeeId,
          employeeName: row.employeeName,
          functionId: cap.functionId,
          functionName: cap.functionName,
          type: "training_gap",
          description: `Employee [${row.employeeName}] is active in function but has no certified training on record.`
        });
      }
    });
  });

  return gaps;
}

/**
 * 9. Returns OJT gap indicators (assigned primary/backup employee lacking completed practical OJT).
 */
export function getOjtGapIndicators(
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  programs: TrainingProgram[],
  ojts: OjtPlan[],
  evidences: EvidenceRecord[],
  filters?: PolyvalenceMatrixFilters
): PolyvalenceGapIndicator[] {
  const rows = getPolyvalenceMatrixRowsByTenant(
    employees, units, functions, assignments, backups, programs, ojts, evidences, filters
  );

  const gaps: PolyvalenceGapIndicator[] = [];

  rows.forEach(row => {
    row.capabilities.forEach(cap => {
      const isActiveAssigned = cap.isPrimary || cap.isBackup;
      if (isActiveAssigned && !cap.isPractical) {
        gaps.push({
          employeeId: row.employeeId,
          employeeName: row.employeeName,
          functionId: cap.functionId,
          functionName: cap.functionName,
          type: "ojt_gap",
          description: `Employee [${row.employeeName}] is active in function but lacks practical completed OJT training.`
        });
      }
    });
  });

  return gaps;
}

/**
 * 10. Returns the complete dashboard polyvalence summary calculations.
 */
export function getPolyvalenceSummaryDashboardData(
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  programs: TrainingProgram[],
  ojts: OjtPlan[],
  evidences: EvidenceRecord[],
  filters?: PolyvalenceMatrixFilters
): PolyvalenceSummary {
  const tenantId = filters?.tenantId;

  const tFuncs = filterTenantData(functions, tenantId);

  const rows = getPolyvalenceMatrixRowsByTenant(
    employees, units, functions, assignments, backups, programs, ojts, evidences, { tenantId }
  );

  const spofs = getSinglePointOfFailureFunctions(
    employees, units, functions, assignments, backups, programs, ojts, evidences, { tenantId }
  );

  const withoutBackup = getFunctionsWithoutTrainedBackup(
    employees, units, functions, assignments, backups, programs, ojts, evidences, { tenantId }
  );

  const trainingGaps = getTrainingGapIndicators(
    employees, units, functions, assignments, backups, programs, ojts, evidences, { tenantId }
  );

  const ojtGaps = getOjtGapIndicators(
    employees, units, functions, assignments, backups, programs, ojts, evidences, { tenantId }
  );

  const totalEmployees = rows.length;
  const polyvalentCount = rows.filter(r => r.totalValidatedCount >= 2).length;

  let totalBackupsCount = 0;
  tFuncs.forEach(func => {
    totalBackupsCount += rows.filter(row => {
      const cap = row.capabilities.find(c => c.functionId === func.id);
      return cap && cap.isBackup;
    }).length;
  });

  const totalFunctions = tFuncs.length;
  const coverageIndex = totalFunctions > 0 ? parseFloat((totalBackupsCount / totalFunctions).toFixed(2)) : 0;

  return {
    totalEmployees,
    polyvalentEmployeesCount: polyvalentCount,
    spofFunctionsCount: spofs.length,
    functionsWithoutBackupCount: withoutBackup.length,
    trainingGapsCount: trainingGaps.length,
    ojtGapsCount: ojtGaps.length,
    averageCoverageIndex: coverageIndex
  };
}

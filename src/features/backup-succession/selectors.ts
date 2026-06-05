import {
  Employee,
  EmployeeAssignment,
  OrganizationUnit,
  Function,
  BackupAssignment,
  SuccessionCandidate
} from "../../shared/domain/people/entities";

import {
  BackupSuccessionFilters,
  BackupCoverageRow,
  SuccessionCandidateDetail,
  SuccessionReadinessRow,
  BackupOverloadIndicator,
  OrgUnitPipelineRow,
  ContinuityRiskIndicator,
  BackupSuccessionSummary
} from "./types";

// ============================================================================
// HELPER: TENANT FILTERING
// ============================================================================
function filterTenantData<T>(items: T[], tenantId?: string): T[] {
  if (!tenantId) return items;
  return items.filter(item => (item as any).tenantId === tenantId);
}

// ============================================================================
// 1. BACKUP COVERAGE ROWS BY TENANT
// ============================================================================
export function getBackupCoverageRowsByTenant(
  functions: Function[],
  assignments: EmployeeAssignment[],
  employees: Employee[],
  backups: BackupAssignment[],
  units: OrganizationUnit[],
  filters?: BackupSuccessionFilters
): BackupCoverageRow[] {
  const tenantId = filters?.tenantId;

  // Isolate by tenant
  const tFuncs = filterTenantData(functions, tenantId);
  const tAssignments = filterTenantData(assignments, tenantId);
  const tEmployees = filterTenantData(employees, tenantId);
  const tBackups = filterTenantData(backups, tenantId);
  const tUnits = filterTenantData(units, tenantId);

  const rows: BackupCoverageRow[] = tFuncs.map(func => {
    // Resolve organization unit
    const unit = tUnits.find(u => u.id === func.organizationUnitId);
    const organizationUnitName = unit ? unit.name : "Unknown";

    // Resolve primary employee (active and primary assignment)
    const primaryAsg = tAssignments.find(
      asg => asg.functionId === func.id && asg.isPrimary && asg.status === "active"
    );
    const primaryEmp = primaryAsg ? tEmployees.find(e => e.id === primaryAsg.employeeId) : null;
    const primaryEmployeeId = primaryEmp ? primaryEmp.id : "";
    const primaryEmployeeName = primaryEmp ? primaryEmp.name : "None";

    // Filter backups
    const funcBackups = tBackups.filter(b => b.functionId === func.id);
    const activeBackupCount = funcBackups.filter(b => b.status === "active").length;
    const inTrainingBackupCount = funcBackups.filter(b => b.status === "in_training").length;
    const proposedBackupCount = funcBackups.filter(b => b.status === "proposed").length;

    const isFullyCovered = activeBackupCount >= func.requiredBackupQuantity;
    const coverageGap = Math.max(0, func.requiredBackupQuantity - activeBackupCount);

    return {
      functionId: func.id,
      functionCode: func.code,
      functionName: func.name,
      organizationUnitId: func.organizationUnitId,
      organizationUnitName,
      primaryEmployeeId,
      primaryEmployeeName,
      isCritical: func.isCritical,
      requiredBackupQuantity: func.requiredBackupQuantity,
      activeBackupCount,
      inTrainingBackupCount,
      proposedBackupCount,
      isFullyCovered,
      coverageGap,
      tenantId: func.tenantId
    };
  });

  // Apply filters
  return rows.filter(row => {
    if (filters?.organizationUnitId && row.organizationUnitId !== filters.organizationUnitId) {
      return false;
    }
    if (filters?.isCriticalOnly && !row.isCritical) {
      return false;
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      const matchName = row.functionName.toLowerCase().includes(query);
      const matchCode = row.functionCode.toLowerCase().includes(query);
      const matchOwner = row.primaryEmployeeName.toLowerCase().includes(query);
      const matchUnit = row.organizationUnitName.toLowerCase().includes(query);
      if (!matchName && !matchCode && !matchOwner && !matchUnit) {
        return false;
      }
    }
    return true;
  });
}

// ============================================================================
// 2. SUCCESSION READINESS ROWS BY TENANT
// ============================================================================
export function getSuccessionReadinessRowsByTenant(
  functions: Function[],
  assignments: EmployeeAssignment[],
  employees: Employee[],
  candidates: SuccessionCandidate[],
  units: OrganizationUnit[],
  filters?: BackupSuccessionFilters
): SuccessionReadinessRow[] {
  const tenantId = filters?.tenantId;

  // Isolate by tenant
  const tFuncs = filterTenantData(functions, tenantId);
  const tAssignments = filterTenantData(assignments, tenantId);
  const tEmployees = filterTenantData(employees, tenantId);
  const tCandidates = filterTenantData(candidates, tenantId);
  const tUnits = filterTenantData(units, tenantId);

  const rows: SuccessionReadinessRow[] = tFuncs.map(func => {
    // Resolve organization unit
    const unit = tUnits.find(u => u.id === func.organizationUnitId);
    const organizationUnitName = unit ? unit.name : "Unknown";

    // Resolve primary employee
    const primaryAsg = tAssignments.find(
      asg => asg.functionId === func.id && asg.isPrimary && asg.status === "active"
    );
    const primaryEmp = primaryAsg ? tEmployees.find(e => e.id === primaryAsg.employeeId) : null;
    const primaryEmployeeId = primaryEmp ? primaryEmp.id : "";
    const primaryEmployeeName = primaryEmp ? primaryEmp.name : "None";

    // Filter candidates
    const funcCandidates = tCandidates.filter(c => c.functionId === func.id);
    const mappedCandidates: SuccessionCandidateDetail[] = funcCandidates
      .map(c => {
        const emp = tEmployees.find(e => e.id === c.employeeId);
        const name = emp ? emp.name : "Unknown Employee";
        
        let readinessLevel: "high" | "medium" | "low" = "low";
        if (c.readinessScore >= 80) {
          readinessLevel = "high";
        } else if (c.readinessScore >= 50) {
          readinessLevel = "medium";
        }

        return {
          employeeId: c.employeeId,
          employeeName: name,
          readinessScore: c.readinessScore,
          readinessLevel
        };
      })
      .sort((a, b) => b.readinessScore - a.readinessScore);

    const hasReadySuccessor = mappedCandidates.some(c => c.readinessScore >= 80);

    return {
      functionId: func.id,
      functionCode: func.code,
      functionName: func.name,
      organizationUnitId: func.organizationUnitId,
      organizationUnitName,
      primaryEmployeeId,
      primaryEmployeeName,
      isCritical: func.isCritical,
      successionCandidateCount: mappedCandidates.length,
      candidates: mappedCandidates,
      hasReadySuccessor,
      tenantId: func.tenantId
    };
  });

  // Apply filters
  return rows.filter(row => {
    if (filters?.organizationUnitId && row.organizationUnitId !== filters.organizationUnitId) {
      return false;
    }
    if (filters?.isCriticalOnly && !row.isCritical) {
      return false;
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      const matchName = row.functionName.toLowerCase().includes(query);
      const matchCode = row.functionCode.toLowerCase().includes(query);
      const matchOwner = row.primaryEmployeeName.toLowerCase().includes(query);
      const matchUnit = row.organizationUnitName.toLowerCase().includes(query);
      if (!matchName && !matchCode && !matchOwner && !matchUnit) {
        return false;
      }
    }
    return true;
  });
}

// ============================================================================
// 3. FUNCTIONS WITH NO BACKUP
// ============================================================================
export function getFunctionsWithNoBackup(
  functions: Function[],
  assignments: EmployeeAssignment[],
  employees: Employee[],
  backups: BackupAssignment[],
  units: OrganizationUnit[],
  filters?: BackupSuccessionFilters
): BackupCoverageRow[] {
  const rows = getBackupCoverageRowsByTenant(
    functions,
    assignments,
    employees,
    backups,
    units,
    filters
  );
  return rows.filter(r => r.activeBackupCount === 0);
}

// ============================================================================
// 4. FUNCTIONS WITH UNVALIDATED BACKUP
// ============================================================================
export function getFunctionsWithUnvalidatedBackup(
  functions: Function[],
  assignments: EmployeeAssignment[],
  employees: Employee[],
  backups: BackupAssignment[],
  units: OrganizationUnit[],
  filters?: BackupSuccessionFilters
): BackupCoverageRow[] {
  const rows = getBackupCoverageRowsByTenant(
    functions,
    assignments,
    employees,
    backups,
    units,
    filters
  );
  return rows.filter(r => r.inTrainingBackupCount > 0 || r.proposedBackupCount > 0);
}

// ============================================================================
// 5. FUNCTIONS WITH NO SUCCESSION CANDIDATE
// ============================================================================
export function getFunctionsWithNoSuccessionCandidate(
  functions: Function[],
  assignments: EmployeeAssignment[],
  employees: Employee[],
  candidates: SuccessionCandidate[],
  units: OrganizationUnit[],
  filters?: BackupSuccessionFilters
): SuccessionReadinessRow[] {
  const rows = getSuccessionReadinessRowsByTenant(
    functions,
    assignments,
    employees,
    candidates,
    units,
    filters
  );
  return rows.filter(r => r.successionCandidateCount === 0);
}

// ============================================================================
// 6. EMPLOYEES ACTING AS BACKUP FOR MULTIPLE CRITICAL FUNCTIONS
// ============================================================================
export function getEmployeesBackingUpMultipleCriticalFunctions(
  employees: Employee[],
  backups: BackupAssignment[],
  functions: Function[],
  units: OrganizationUnit[],
  filters?: BackupSuccessionFilters
): BackupOverloadIndicator[] {
  const overloadIndicators = getBackupOverloadIndicators(
    employees,
    backups,
    functions,
    units,
    filters
  );
  return overloadIndicators.filter(indicator => indicator.criticalFunctionIds.length > 1);
}

// ============================================================================
// 7. BACKUP OVERLOAD INDICATORS
// ============================================================================
export function getBackupOverloadIndicators(
  employees: Employee[],
  backups: BackupAssignment[],
  functions: Function[],
  units: OrganizationUnit[],
  filters?: BackupSuccessionFilters
): BackupOverloadIndicator[] {
  const tenantId = filters?.tenantId;

  // Isolate by tenant
  const tEmployees = filterTenantData(employees, tenantId);
  const tBackups = filterTenantData(backups, tenantId);
  const tFunctions = filterTenantData(functions, tenantId);
  const tUnits = filterTenantData(units, tenantId);

  const indicators: BackupOverloadIndicator[] = tEmployees.map(emp => {
    const unit = tUnits.find(u => u.id === emp.organizationUnitId);
    const organizationUnitName = unit ? unit.name : "Unknown";

    // Active validated backup assignments for this employee
    const activeBackups = tBackups.filter(
      b => b.employeeId === emp.id && b.status === "active"
    );

    // Identify which are for critical functions
    const criticalFunctionIds = activeBackups
      .map(b => tFunctions.find(f => f.id === b.functionId))
      .filter((f): f is Function => !!f && f.isCritical)
      .map(f => f.id);

    const activeBackupCount = criticalFunctionIds.length;
    const isOverloaded = activeBackupCount > 2;

    return {
      employeeId: emp.id,
      employeeName: emp.name,
      organizationUnitId: emp.organizationUnitId,
      organizationUnitName,
      activeBackupCount,
      criticalFunctionIds,
      isOverloaded,
      tenantId: emp.tenantId
    };
  });

  // Apply filters
  return indicators.filter(indicator => {
    if (filters?.organizationUnitId && indicator.organizationUnitId !== filters.organizationUnitId) {
      return false;
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      const matchEmp = indicator.employeeName.toLowerCase().includes(query);
      const matchUnit = indicator.organizationUnitName.toLowerCase().includes(query);
      if (!matchEmp && !matchUnit) {
        return false;
      }
    }
    return true;
  });
}

// ============================================================================
// 8. SUCCESSION PIPELINE BY ORGANIZATION UNIT
// ============================================================================
export function getSuccessionPipelineByOrgUnit(
  functions: Function[],
  candidates: SuccessionCandidate[],
  units: OrganizationUnit[],
  filters?: BackupSuccessionFilters
): OrgUnitPipelineRow[] {
  const tenantId = filters?.tenantId;

  // Isolate by tenant
  const tFuncs = filterTenantData(functions, tenantId);
  const tCandidates = filterTenantData(candidates, tenantId);
  const tUnits = filterTenantData(units, tenantId);

  const rows: OrgUnitPipelineRow[] = tUnits.map(unit => {
    // Critical functions in this organization unit
    const unitCriticalFuncs = tFuncs.filter(
      f => f.organizationUnitId === unit.id && f.isCritical
    );

    const totalCriticalFunctions = unitCriticalFuncs.length;

    let functionsWithSuccessorCount = 0;
    let totalCandidatesCount = 0;
    let readyCandidatesCount = 0;

    unitCriticalFuncs.forEach(func => {
      const funcCandidates = tCandidates.filter(c => c.functionId === func.id);
      if (funcCandidates.length > 0) {
        functionsWithSuccessorCount++;
      }
      totalCandidatesCount += funcCandidates.length;
      readyCandidatesCount += funcCandidates.filter(c => c.readinessScore >= 80).length;
    });

    const pipelineCoverageRate =
      totalCriticalFunctions > 0
        ? Math.round((functionsWithSuccessorCount / totalCriticalFunctions) * 100)
        : 0;

    return {
      organizationUnitId: unit.id,
      organizationUnitName: unit.name,
      totalCriticalFunctions,
      functionsWithSuccessorCount,
      totalCandidatesCount,
      readyCandidatesCount,
      pipelineCoverageRate,
      tenantId: unit.tenantId
    };
  });

  // Apply filters
  return rows.filter(row => {
    if (filters?.organizationUnitId && row.organizationUnitId !== filters.organizationUnitId) {
      return false;
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      if (!row.organizationUnitName.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });
}

// ============================================================================
// 9. CONTINUITY RISK INDICATORS
// ============================================================================
export function getContinuityRiskIndicators(
  functions: Function[],
  assignments: EmployeeAssignment[],
  employees: Employee[],
  backups: BackupAssignment[],
  candidates: SuccessionCandidate[],
  units: OrganizationUnit[],
  filters?: BackupSuccessionFilters
): ContinuityRiskIndicator[] {
  const tenantId = filters?.tenantId;

  // Isolate by tenant
  const tFuncs = filterTenantData(functions, tenantId);
  const tBackups = filterTenantData(backups, tenantId);
  const tCandidates = filterTenantData(candidates, tenantId);
  const tUnits = filterTenantData(units, tenantId);

  const indicators: ContinuityRiskIndicator[] = tFuncs.map(func => {
    const unit = tUnits.find(u => u.id === func.organizationUnitId);
    const organizationUnitName = unit ? unit.name : "Unknown";

    const hasActiveBackup = tBackups.some(
      b => b.functionId === func.id && b.status === "active"
    );
    const hasSuccessor = tCandidates.some(c => c.functionId === func.id);

    let riskLevel: "high" | "medium" | "low" = "low";
    if (!hasActiveBackup && !hasSuccessor) {
      riskLevel = "high";
    } else if (!hasActiveBackup || !hasSuccessor) {
      riskLevel = "medium";
    }

    return {
      functionId: func.id,
      functionCode: func.code,
      functionName: func.name,
      organizationUnitId: func.organizationUnitId,
      organizationUnitName,
      isCritical: func.isCritical,
      hasActiveBackup,
      hasSuccessor,
      riskLevel,
      tenantId: func.tenantId
    };
  });

  // Apply filters
  return indicators.filter(row => {
    if (filters?.organizationUnitId && row.organizationUnitId !== filters.organizationUnitId) {
      return false;
    }
    if (filters?.isCriticalOnly && !row.isCritical) {
      return false;
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      const matchName = row.functionName.toLowerCase().includes(query);
      const matchCode = row.functionCode.toLowerCase().includes(query);
      const matchUnit = row.organizationUnitName.toLowerCase().includes(query);
      if (!matchName && !matchCode && !matchUnit) {
        return false;
      }
    }
    return true;
  });
}

// ============================================================================
// 10. BACKUP & SUCCESSION SUMMARY DASHBOARD DATA
// ============================================================================
export function getBackupSuccessionSummaryDashboardData(
  functions: Function[],
  assignments: EmployeeAssignment[],
  employees: Employee[],
  backups: BackupAssignment[],
  candidates: SuccessionCandidate[],
  units: OrganizationUnit[],
  filters?: BackupSuccessionFilters
): BackupSuccessionSummary {
  const queryFilters: BackupSuccessionFilters = {
    tenantId: filters?.tenantId,
    organizationUnitId: filters?.organizationUnitId
  };

  const coverageRows = getBackupCoverageRowsByTenant(
    functions,
    assignments,
    employees,
    backups,
    units,
    queryFilters
  );

  // Filter metrics specifically for Critical functions (as requested)
  const criticalRows = coverageRows.filter(r => r.isCritical);

  let fullyCovered = 0;
  let partiallyCovered = 0;
  let uncovered = 0;

  criticalRows.forEach(row => {
    if (row.isFullyCovered) {
      fullyCovered++;
    } else if (row.activeBackupCount > 0) {
      partiallyCovered++;
    } else {
      uncovered++;
    }
  });

  // Succession Candidate metrics
  const criticalFuncIds = new Set(criticalRows.map(r => r.functionId));
  const tCandidates = filterTenantData(candidates, filters?.tenantId);
  const criticalCandidates = tCandidates.filter(c => criticalFuncIds.has(c.functionId));

  const functionsWithSuccessor = criticalRows.filter(row =>
    criticalCandidates.some(c => c.functionId === row.functionId)
  );

  const functionsWithSuccessorCount = functionsWithSuccessor.length;
  const functionsWithoutSuccessorCount = criticalRows.length - functionsWithSuccessorCount;

  // Overloaded employees
  const overloadIndicators = getBackupOverloadIndicators(
    employees,
    backups,
    functions,
    units,
    queryFilters
  );
  const overloadedEmployeesCount = overloadIndicators.filter(i => i.isOverloaded).length;

  // High continuity risk functions (critical functions only)
  const riskIndicators = getContinuityRiskIndicators(
    functions,
    assignments,
    employees,
    backups,
    candidates,
    units,
    queryFilters
  );
  const highContinuityRiskCount = riskIndicators.filter(
    i => i.isCritical && i.riskLevel === "high"
  ).length;

  return {
    totalCriticalFunctions: criticalRows.length,
    fullyCoveredFunctionsCount: fullyCovered,
    partiallyCoveredFunctionsCount: partiallyCovered,
    uncoveredFunctionsCount: uncovered,
    functionsWithSuccessorCount,
    functionsWithoutSuccessorCount,
    overloadedEmployeesCount,
    highContinuityRiskCount,
    tenantId: filters?.tenantId || ""
  };
}

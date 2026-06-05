import { Priority, EvidenceStatus } from "../../shared/domain/people/enums";
import {
  Employee,
  OrganizationUnit,
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
  CriticalFunctionFilters,
  CriticalFunctionRow,
  CriticalityDistribution,
  CriticalFunctionsSummary
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
 * 1. Returns mapped critical function rows by tenant, applying search and unit filters.
 */
export function getCriticalFunctionsByTenant(
  functions: Function[],
  assessments: CriticalFunctionAssessment[],
  employees: Employee[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  candidates: SuccessionCandidate[],
  assets: KnowledgeAsset[],
  evidences: EvidenceRecord[],
  snapshots: VulnerabilitySnapshot[],
  filters?: CriticalFunctionFilters
): CriticalFunctionRow[] {
  const tenantId = filters?.tenantId;

  // Isolate by tenant
  const tFuncs = filterTenantData(functions, tenantId);
  const tAssessments = filterTenantData(assessments, tenantId);
  const tEmployees = filterTenantData(employees, tenantId);
  const tAssignments = filterTenantData(assignments, tenantId);
  const tBackups = filterTenantData(backups, tenantId);
  const tCandidates = filterTenantData(candidates, tenantId);
  const tAssets = filterTenantData(assets, tenantId);
  const tEvidences = filterTenantData(evidences, tenantId);
  const tSnapshots = filterTenantData(snapshots, tenantId);

  const rows: CriticalFunctionRow[] = tFuncs.map(func => {
    // Resolve assessment
    const assess = tAssessments.find(a => a.functionId === func.id);
    const gutScore = assess ? assess.gutScore : 0;
    
    // Resolve vulnerability score
    const snap = tSnapshots.find(s => s.functionId === func.id);
    const vulnerabilityScore = snap ? snap.score : (assess ? assess.vulnerabilityScore : 0);
    const classification = assess ? assess.classification : Priority.LOW;

    // Resolve primary employee
    const primaryAsg = tAssignments.find(a => a.functionId === func.id && a.isPrimary && a.status === "active");
    const primaryEmp = primaryAsg ? tEmployees.find(e => e.id === primaryAsg.employeeId) : null;
    const primaryEmployeeName = primaryEmp ? primaryEmp.name : "None";

    // Resolve backups
    const funcBackups = tBackups.filter(b => b.functionId === func.id);
    const backupEmployeeCount = funcBackups.length;
    const validatedBackupCount = funcBackups.filter(b => b.status === "active").length;

    // Resolve candidates
    const successionCandidateCount = tCandidates.filter(c => c.functionId === func.id).length;

    // Resolve knowledge
    const hasKnowledgeAsset = tAssets.some(a => a.functionId === func.id);

    // Resolve evidence
    const hasEvidenceRecord = tEvidences.some(ev => ev.functionId === func.id && ev.status === EvidenceStatus.VALIDATED);

    // --- Calculate Strategic Exposure Score (0-100) ---
    let exposureScore = 0;
    if (classification === Priority.CRITICAL) {
      exposureScore += 25;
    } else if (classification === Priority.HIGH) {
      exposureScore += 15;
    } else if (classification === Priority.MEDIUM) {
      exposureScore += 8;
    } else {
      exposureScore += 2;
    }

    if (primaryEmployeeName === "None") {
      exposureScore += 20;
    }
    if (validatedBackupCount === 0) {
      exposureScore += 25;
    }
    if (successionCandidateCount === 0) {
      exposureScore += 15;
    }
    if (!hasKnowledgeAsset) {
      exposureScore += 12;
    }
    if (!hasEvidenceRecord) {
      exposureScore += 15;
    }

    const finalExposure = Math.min(100, Math.max(0, exposureScore));
    const isHighExposure = finalExposure >= 60;

    // Resolve organization unit name (mock/fallback sector matching)
    const organizationUnitName = func.organizationUnitId === "unit_corte" ? "Corte Automático" : "Costura de Sacos";

    return {
      functionId: func.id,
      code: func.code,
      name: func.name,
      description: func.description,
      organizationUnitId: func.organizationUnitId,
      organizationUnitName,
      isCritical: func.isCritical,
      gutScore,
      vulnerabilityScore,
      classification,
      primaryEmployeeName,
      backupEmployeeCount,
      validatedBackupCount,
      successionCandidateCount,
      hasKnowledgeAsset,
      hasEvidenceRecord,
      exposureScore: finalExposure,
      isHighExposure,
      tenantId: func.tenantId
    };
  });

  // Apply filters
  return rows.filter(row => {
    if (filters?.isCriticalOnly && !row.isCritical) {
      return false;
    }
    if (filters?.organizationUnitId && row.organizationUnitId !== filters.organizationUnitId) {
      return false;
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      const matchName = row.name.toLowerCase().includes(query);
      const matchCode = row.code.toLowerCase().includes(query);
      if (!matchName && !matchCode) {
        return false;
      }
    }
    return true;
  });
}

/**
 * 2. Returns critical function rows filtered by organization unit ID.
 */
export function getCriticalFunctionsByOrgUnit(
  functions: Function[],
  assessments: CriticalFunctionAssessment[],
  employees: Employee[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  candidates: SuccessionCandidate[],
  assets: KnowledgeAsset[],
  evidences: EvidenceRecord[],
  snapshots: VulnerabilitySnapshot[],
  filters?: CriticalFunctionFilters
): CriticalFunctionRow[] {
  const queryFilters: CriticalFunctionFilters = {
    tenantId: filters?.tenantId,
    search: filters?.search,
    isCriticalOnly: filters?.isCriticalOnly
  };

  const rows = getCriticalFunctionsByTenant(
    functions,
    assessments,
    employees,
    assignments,
    backups,
    candidates,
    assets,
    evidences,
    snapshots,
    queryFilters
  );

  return rows.filter(row => {
    if (filters?.organizationUnitId && row.organizationUnitId !== filters.organizationUnitId) {
      return false;
    }
    return true;
  });
}

/**
 * 3. Returns distribution count totals across Priority levels.
 */
export function getCriticalityLevelDistribution(
  assessments: CriticalFunctionAssessment[],
  filters?: CriticalFunctionFilters
): CriticalityDistribution {
  const tenantId = filters?.tenantId;
  const tAssessments = filterTenantData(assessments, tenantId);

  let low = 0;
  let medium = 0;
  let high = 0;
  let critical = 0;

  tAssessments.forEach(a => {
    if (a.classification === Priority.CRITICAL) {
      critical++;
    } else if (a.classification === Priority.HIGH) {
      high++;
    } else if (a.classification === Priority.MEDIUM) {
      medium++;
    } else {
      low++;
    }
  });

  return {
    lowCount: low,
    mediumCount: medium,
    highCount: high,
    criticalCount: critical
  };
}

/**
 * 4. Returns functions lacking active primary employee assignments.
 */
export function getFunctionsWithoutActivePrimaryEmployee(
  functions: Function[],
  assessments: CriticalFunctionAssessment[],
  employees: Employee[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  candidates: SuccessionCandidate[],
  assets: KnowledgeAsset[],
  evidences: EvidenceRecord[],
  snapshots: VulnerabilitySnapshot[],
  filters?: CriticalFunctionFilters
): CriticalFunctionRow[] {
  const rows = getCriticalFunctionsByTenant(
    functions, assessments, employees, assignments, backups, candidates, assets, evidences, snapshots, filters
  );
  return rows.filter(row => row.primaryEmployeeName === "None");
}

/**
 * 5. Returns functions without active validated backups.
 */
export function getFunctionsWithoutValidatedBackup(
  functions: Function[],
  assessments: CriticalFunctionAssessment[],
  employees: Employee[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  candidates: SuccessionCandidate[],
  assets: KnowledgeAsset[],
  evidences: EvidenceRecord[],
  snapshots: VulnerabilitySnapshot[],
  filters?: CriticalFunctionFilters
): CriticalFunctionRow[] {
  const rows = getCriticalFunctionsByTenant(
    functions, assessments, employees, assignments, backups, candidates, assets, evidences, snapshots, filters
  );
  return rows.filter(row => row.validatedBackupCount === 0);
}

/**
 * 6. Returns functions without active succession candidates.
 */
export function getFunctionsWithoutSuccessionCandidate(
  functions: Function[],
  assessments: CriticalFunctionAssessment[],
  employees: Employee[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  candidates: SuccessionCandidate[],
  assets: KnowledgeAsset[],
  evidences: EvidenceRecord[],
  snapshots: VulnerabilitySnapshot[],
  filters?: CriticalFunctionFilters
): CriticalFunctionRow[] {
  const rows = getCriticalFunctionsByTenant(
    functions, assessments, employees, assignments, backups, candidates, assets, evidences, snapshots, filters
  );
  return rows.filter(row => row.successionCandidateCount === 0);
}

/**
 * 7. Returns functions lacking active documentation / SOP knowledge assets.
 */
export function getFunctionsWithoutKnowledgeAsset(
  functions: Function[],
  assessments: CriticalFunctionAssessment[],
  employees: Employee[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  candidates: SuccessionCandidate[],
  assets: KnowledgeAsset[],
  evidences: EvidenceRecord[],
  snapshots: VulnerabilitySnapshot[],
  filters?: CriticalFunctionFilters
): CriticalFunctionRow[] {
  const rows = getCriticalFunctionsByTenant(
    functions, assessments, employees, assignments, backups, candidates, assets, evidences, snapshots, filters
  );
  return rows.filter(row => !row.hasKnowledgeAsset);
}

/**
 * 8. Returns functions without validated ISO competency records.
 */
export function getFunctionsWithoutEvidenceRecord(
  functions: Function[],
  assessments: CriticalFunctionAssessment[],
  employees: Employee[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  candidates: SuccessionCandidate[],
  assets: KnowledgeAsset[],
  evidences: EvidenceRecord[],
  snapshots: VulnerabilitySnapshot[],
  filters?: CriticalFunctionFilters
): CriticalFunctionRow[] {
  const rows = getCriticalFunctionsByTenant(
    functions, assessments, employees, assignments, backups, candidates, assets, evidences, snapshots, filters
  );
  return rows.filter(row => !row.hasEvidenceRecord);
}

/**
 * 9. Returns critical functions where the calculated exposure is high/critical.
 */
export function getHighExposureCriticalFunctions(
  functions: Function[],
  assessments: CriticalFunctionAssessment[],
  employees: Employee[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  candidates: SuccessionCandidate[],
  assets: KnowledgeAsset[],
  evidences: EvidenceRecord[],
  snapshots: VulnerabilitySnapshot[],
  filters?: CriticalFunctionFilters
): CriticalFunctionRow[] {
  const rows = getCriticalFunctionsByTenant(
    functions, assessments, employees, assignments, backups, candidates, assets, evidences, snapshots, filters
  );
  return rows.filter(row => row.isHighExposure);
}

/**
 * 10. Returns the complete dashboard summary aggregates.
 */
export function getCriticalFunctionsSummaryDashboardData(
  functions: Function[],
  assessments: CriticalFunctionAssessment[],
  employees: Employee[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  candidates: SuccessionCandidate[],
  assets: KnowledgeAsset[],
  evidences: EvidenceRecord[],
  snapshots: VulnerabilitySnapshot[],
  filters?: CriticalFunctionFilters
): CriticalFunctionsSummary {
  const queryFilters: CriticalFunctionFilters = {
    tenantId: filters?.tenantId,
    organizationUnitId: filters?.organizationUnitId,
    search: filters?.search
  };

  const rows = getCriticalFunctionsByTenant(
    functions, assessments, employees, assignments, backups, candidates, assets, evidences, snapshots, queryFilters
  );

  const total = rows.length;
  if (total === 0) {
    return {
      totalFunctions: 0,
      criticalFunctionsCount: 0,
      functionsWithoutPrimary: 0,
      functionsWithoutBackup: 0,
      functionsWithoutSuccessor: 0,
      functionsWithoutKnowledge: 0,
      functionsWithoutEvidence: 0,
      highExposureCount: 0,
      averageVulnerabilityScore: 0
    };
  }

  let criticalCount = 0;
  let withoutPrimary = 0;
  let withoutBackup = 0;
  let withoutSuccessor = 0;
  let withoutKnowledge = 0;
  let withoutEvidence = 0;
  let highExposure = 0;
  let vulnSum = 0;

  rows.forEach(row => {
    if (row.isCritical) {
      criticalCount++;
      
      if (row.primaryEmployeeName === "None") {
        withoutPrimary++;
      }
      if (row.validatedBackupCount === 0) {
        withoutBackup++;
      }
      if (row.successionCandidateCount === 0) {
        withoutSuccessor++;
      }
      if (!row.hasKnowledgeAsset) {
        withoutKnowledge++;
      }
      if (!row.hasEvidenceRecord) {
        withoutEvidence++;
      }
    }
    if (row.isHighExposure) {
      highExposure++;
    }
    vulnSum += row.vulnerabilityScore;
  });

  return {
    totalFunctions: total,
    criticalFunctionsCount: criticalCount,
    functionsWithoutPrimary: withoutPrimary,
    functionsWithoutBackup: withoutBackup,
    functionsWithoutSuccessor: withoutSuccessor,
    functionsWithoutKnowledge: withoutKnowledge,
    functionsWithoutEvidence: withoutEvidence,
    highExposureCount: highExposure,
    averageVulnerabilityScore: Math.round(vulnSum / total)
  };
}

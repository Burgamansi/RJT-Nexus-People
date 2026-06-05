import {
  Employee,
  EmployeeAssignment,
  OrganizationUnit,
  Function,
  BackupAssignment,
  TrainingProgram,
  OjtPlan,
  EvidenceRecord
} from "../../shared/domain/people/entities";

import { EvidenceStatus } from "../../shared/domain/people/enums";

import {
  TrainingOjtFilters,
  TrainingRow,
  OjtRow,
  OrgUnitTrainingOjtCoverageRow,
  TrainingOjtGapIndicator,
  TrainingOjtSummary
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
// 1. TRAINING ROWS BY TENANT
// ============================================================================
export function getTrainingRowsByTenant(
  employees: Employee[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  programs: TrainingProgram[],
  functions: Function[],
  units: OrganizationUnit[],
  filters?: TrainingOjtFilters
): TrainingRow[] {
  const tenantId = filters?.tenantId;

  // Isolate by tenant
  const tEmployees = filterTenantData(employees, tenantId);
  const tAssignments = filterTenantData(assignments, tenantId);
  const tBackups = filterTenantData(backups, tenantId);
  const tPrograms = filterTenantData(programs, tenantId);
  const tFunctions = filterTenantData(functions, tenantId);
  const tUnits = filterTenantData(units, tenantId);

  const rows: TrainingRow[] = [];

  tEmployees.forEach(emp => {
    const unit = tUnits.find(u => u.id === emp.organizationUnitId);
    const organizationUnitName = unit ? unit.name : "Unknown";

    // Primary Assignments
    const primaryAsgs = tAssignments.filter(
      asg => asg.employeeId === emp.id && asg.isPrimary && asg.status === "active"
    );

    // Active Backup Assignments
    const backupAsgs = tBackups.filter(
      b => b.employeeId === emp.id && b.status === "active"
    );

    // Gather all active roles/functions for this employee
    const activeRoles: Array<{ functionId: string; startDate: string }> = [];

    primaryAsgs.forEach(asg => {
      activeRoles.push({ functionId: asg.functionId, startDate: asg.startDate });
    });

    backupAsgs.forEach(b => {
      // Backups do not have an explicit start date in BackupAssignment, fallback to baseline reference start date
      activeRoles.push({ functionId: b.functionId, startDate: "2026-05-01" });
    });

    activeRoles.forEach(role => {
      const func = tFunctions.find(f => f.id === role.functionId);
      if (!func) return;

      // Find program matching this skillId / functionId
      const program = tPrograms.find(p => p.skillId === func.id);
      const programId = program ? program.id : "";
      const programName = program ? program.name : "Standard Theoretical Training";

      // Check if employee is certified in this skill
      const skillEntry = emp.skills.find(s => s.skillId === func.id);
      const isCertified = skillEntry ? skillEntry.certified : false;

      let status: "completed" | "pending" | "not_started" = "not_started";
      if (isCertified) {
        status = "completed";
      } else if (skillEntry) {
        status = "pending";
      }

      // Overdue logic: not certified and assignment started > 30 days relative to 2026-06-01
      const isOverdue = !isCertified && getDaysDifference(role.startDate, "2026-06-01") > 30;

      rows.push({
        employeeId: emp.id,
        employeeName: emp.name,
        organizationUnitId: emp.organizationUnitId,
        organizationUnitName,
        functionId: func.id,
        functionName: func.name,
        skillId: func.id,
        programId,
        programName,
        isCertified,
        status,
        startDate: role.startDate,
        isOverdue,
        tenantId: emp.tenantId
      });
    });
  });

  // Apply filters
  return rows.filter(row => {
    if (filters?.organizationUnitId && row.organizationUnitId !== filters.organizationUnitId) {
      return false;
    }
    if (filters?.isCriticalOnly) {
      const func = tFunctions.find(f => f.id === row.functionId);
      if (!func || !func.isCritical) return false;
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      const matchEmp = row.employeeName.toLowerCase().includes(query);
      const matchFunc = row.functionName.toLowerCase().includes(query);
      const matchUnit = row.organizationUnitName.toLowerCase().includes(query);
      if (!matchEmp && !matchFunc && !matchUnit) {
        return false;
      }
    }
    return true;
  });
}

// ============================================================================
// 2. OJT ROWS BY TENANT
// ============================================================================
export function getOjtRowsByTenant(
  ojts: OjtPlan[],
  employees: Employee[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  functions: Function[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  filters?: TrainingOjtFilters
): OjtRow[] {
  const tenantId = filters?.tenantId;

  // Isolate by tenant
  const tOjts = filterTenantData(ojts, tenantId);
  const tEmployees = filterTenantData(employees, tenantId);
  const tAssignments = filterTenantData(assignments, tenantId);
  const tBackups = filterTenantData(backups, tenantId);
  const tFunctions = filterTenantData(functions, tenantId);
  const tUnits = filterTenantData(units, tenantId);
  const tEvidences = filterTenantData(evidences, tenantId);

  const rows: OjtRow[] = tOjts.map(ojt => {
    const emp = tEmployees.find(e => e.id === ojt.employeeId);
    const employeeName = emp ? emp.name : "Unknown Employee";
    const organizationUnitId = emp ? emp.organizationUnitId : "";
    
    const unit = tUnits.find(u => u.id === organizationUnitId);
    const organizationUnitName = unit ? unit.name : "Unknown";

    const func = tFunctions.find(f => f.id === ojt.skillId);
    const functionName = func ? func.name : "General Workplace Skill";

    // Resolve evidence status
    const evidence = tEvidences.find(
      ev => ev.employeeId === ojt.employeeId && ev.functionId === ojt.skillId
    );
    const hasEvidenceRecord = !!evidence;
    const evidenceStatus = evidence ? evidence.status : undefined;
    const evidenceUrl = evidence ? evidence.evidenceUrl : undefined;

    // Resolve assignment start date for overdue check
    let startDate = "2026-05-01";
    const primaryAsg = tAssignments.find(
      a => a.employeeId === ojt.employeeId && a.functionId === ojt.skillId && a.isPrimary && a.status === "active"
    );
    if (primaryAsg) {
      startDate = primaryAsg.startDate;
    }

    const isCompleted = ojt.status === "completed";
    const isOverdue = !isCompleted && getDaysDifference(startDate, "2026-06-01") > 30;

    return {
      ojtPlanId: ojt.id,
      employeeId: ojt.employeeId,
      employeeName,
      organizationUnitId,
      organizationUnitName,
      functionId: ojt.skillId,
      functionName,
      skillId: ojt.skillId,
      status: ojt.status,
      hasEvidenceRecord,
      evidenceStatus,
      evidenceUrl,
      isOverdue,
      tenantId: ojt.tenantId
    };
  });

  // Apply filters
  return rows.filter(row => {
    if (filters?.organizationUnitId && row.organizationUnitId !== filters.organizationUnitId) {
      return false;
    }
    if (filters?.isCriticalOnly) {
      const func = tFunctions.find(f => f.id === row.functionId);
      if (!func || !func.isCritical) return false;
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      const matchEmp = row.employeeName.toLowerCase().includes(query);
      const matchFunc = row.functionName.toLowerCase().includes(query);
      const matchUnit = row.organizationUnitName.toLowerCase().includes(query);
      if (!matchEmp && !matchFunc && !matchUnit) {
        return false;
      }
    }
    return true;
  });
}

// ============================================================================
// 3. COMPLETED TRAININGS BY EMPLOYEE
// ============================================================================
export function getCompletedTrainingsByEmployee(
  employeeId: string,
  employees: Employee[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  programs: TrainingProgram[],
  functions: Function[],
  units: OrganizationUnit[],
  filters?: TrainingOjtFilters
): TrainingRow[] {
  const rows = getTrainingRowsByTenant(
    employees,
    assignments,
    backups,
    programs,
    functions,
    units,
    filters
  );
  return rows.filter(r => r.employeeId === employeeId && r.status === "completed");
}

// ============================================================================
// 4. PENDING TRAININGS BY EMPLOYEE
// ============================================================================
export function getPendingTrainingsByEmployee(
  employeeId: string,
  employees: Employee[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  programs: TrainingProgram[],
  functions: Function[],
  units: OrganizationUnit[],
  filters?: TrainingOjtFilters
): TrainingRow[] {
  const rows = getTrainingRowsByTenant(
    employees,
    assignments,
    backups,
    programs,
    functions,
    units,
    filters
  );
  return rows.filter(r => r.employeeId === employeeId && (r.status === "pending" || r.status === "not_started"));
}

// ============================================================================
// 5. OVERDUE TRAININGS
// ============================================================================
export function getOverdueTrainings(
  employees: Employee[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  programs: TrainingProgram[],
  functions: Function[],
  units: OrganizationUnit[],
  filters?: TrainingOjtFilters
): TrainingRow[] {
  const rows = getTrainingRowsByTenant(
    employees,
    assignments,
    backups,
    programs,
    functions,
    units,
    filters
  );
  return rows.filter(r => r.isOverdue);
}

// ============================================================================
// 6. OJT PLANS BY FUNCTION
// ============================================================================
export function getOjtPlansByFunction(
  functionId: string,
  ojts: OjtPlan[],
  employees: Employee[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  functions: Function[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  filters?: TrainingOjtFilters
): OjtRow[] {
  const rows = getOjtRowsByTenant(
    ojts,
    employees,
    assignments,
    backups,
    functions,
    units,
    evidences,
    filters
  );
  return rows.filter(r => r.functionId === functionId);
}

// ============================================================================
// 7. COMPLETED OJT BY FUNCTION
// ============================================================================
export function getCompletedOjtByFunction(
  functionId: string,
  ojts: OjtPlan[],
  employees: Employee[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  functions: Function[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  filters?: TrainingOjtFilters
): OjtRow[] {
  const rows = getOjtPlansByFunction(
    functionId,
    ojts,
    employees,
    assignments,
    backups,
    functions,
    units,
    evidences,
    filters
  );
  return rows.filter(r => r.status === "completed");
}

// ============================================================================
// 8. EMPLOYEES WITHOUT REQUIRED TRAINING
// ============================================================================
export function getEmployeesWithoutRequiredTraining(
  employees: Employee[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  programs: TrainingProgram[],
  functions: Function[],
  units: OrganizationUnit[],
  filters?: TrainingOjtFilters
): Employee[] {
  const tenantId = filters?.tenantId;
  const tEmployees = filterTenantData(employees, tenantId);

  const trainingRows = getTrainingRowsByTenant(
    employees,
    assignments,
    backups,
    programs,
    functions,
    units,
    filters
  );

  const untrainedEmpIds = new Set(
    trainingRows.filter(r => !r.isCertified).map(r => r.employeeId)
  );

  return tEmployees.filter(emp => untrainedEmpIds.has(emp.id));
}

// ============================================================================
// 9. EMPLOYEES WITHOUT PRACTICAL OJT VALIDATION
// ============================================================================
export function getEmployeesWithoutPracticalOjtValidation(
  employees: Employee[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  ojts: OjtPlan[],
  functions: Function[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  filters?: TrainingOjtFilters
): Employee[] {
  const tenantId = filters?.tenantId;
  const tEmployees = filterTenantData(employees, tenantId);

  // We find active primary or backup assignments
  const tAssignments = filterTenantData(assignments, tenantId);
  const tBackups = filterTenantData(backups, tenantId);
  const tOjts = filterTenantData(ojts, tenantId);

  const unvalidatedEmpIds = new Set<string>();

  tEmployees.forEach(emp => {
    // Gather all active roles/functions for this employee
    const activeFuncIds = new Set<string>();

    tAssignments.filter(a => a.employeeId === emp.id && a.isPrimary && a.status === "active")
      .forEach(a => activeFuncIds.add(a.functionId));

    tBackups.filter(b => b.employeeId === emp.id && b.status === "active")
      .forEach(b => activeFuncIds.add(b.functionId));

    if (activeFuncIds.size === 0) return;

    // Check if employee has completed OJT for ALL active assigned functions
    for (const funcId of activeFuncIds) {
      const completedOjt = tOjts.some(
        ojt => ojt.employeeId === emp.id && ojt.skillId === funcId && ojt.status === "completed"
      );
      if (!completedOjt) {
        unvalidatedEmpIds.add(emp.id);
        break;
      }
    }
  });

  return tEmployees.filter(emp => unvalidatedEmpIds.has(emp.id));
}

// ============================================================================
// 10. TRAINING AND OJT COVERAGE BY ORGANIZATION UNIT
// ============================================================================
export function getTrainingOjtCoverageByOrgUnit(
  employees: Employee[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  programs: TrainingProgram[],
  ojts: OjtPlan[],
  functions: Function[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  filters?: TrainingOjtFilters
): OrgUnitTrainingOjtCoverageRow[] {
  const tenantId = filters?.tenantId;

  // Isolate by tenant
  const tEmployees = filterTenantData(employees, tenantId);
  const tUnits = filterTenantData(units, tenantId);
  const tAssignments = filterTenantData(assignments, tenantId);
  const tBackups = filterTenantData(backups, tenantId);
  const tOjts = filterTenantData(ojts, tenantId);

  return tUnits.map(unit => {
    const unitEmployees = tEmployees.filter(emp => emp.organizationUnitId === unit.id);
    const totalEmployees = unitEmployees.length;

    let trainedCount = 0;
    let ojtValidatedCount = 0;

    unitEmployees.forEach(emp => {
      // Check active primary assignment
      const primaryAsg = tAssignments.find(
        a => a.employeeId === emp.id && a.isPrimary && a.status === "active"
      );
      
      if (primaryAsg) {
        const isCertified = emp.skills.some(
          s => s.skillId === primaryAsg.functionId && s.certified
        );
        if (isCertified) {
          trainedCount++;
        }

        const completedOjt = tOjts.some(
          o => o.employeeId === emp.id && o.skillId === primaryAsg.functionId && o.status === "completed"
        );
        if (completedOjt) {
          ojtValidatedCount++;
        }
      }
    });

    const trainingCoverageRate = totalEmployees > 0 ? Math.round((trainedCount / totalEmployees) * 100) : 0;
    const ojtCoverageRate = totalEmployees > 0 ? Math.round((ojtValidatedCount / totalEmployees) * 100) : 0;

    return {
      organizationUnitId: unit.id,
      organizationUnitName: unit.name,
      totalEmployees,
      trainedEmployeesCount: trainedCount,
      ojtValidatedEmployeesCount: ojtValidatedCount,
      trainingCoverageRate,
      ojtCoverageRate,
      tenantId: unit.tenantId
    };
  });
}

// ============================================================================
// 11. TRAINING GAP INDICATORS
// ============================================================================
export function getTrainingOjtGapIndicators(
  employees: Employee[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  programs: TrainingProgram[],
  ojts: OjtPlan[],
  functions: Function[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  filters?: TrainingOjtFilters
): TrainingOjtGapIndicator[] {
  const tenantId = filters?.tenantId;

  // Isolate by tenant
  const tEmployees = filterTenantData(employees, tenantId);
  const tAssignments = filterTenantData(assignments, tenantId);
  const tBackups = filterTenantData(backups, tenantId);
  const tFunctions = filterTenantData(functions, tenantId);
  const tUnits = filterTenantData(units, tenantId);
  const tOjts = filterTenantData(ojts, tenantId);
  const tEvidences = filterTenantData(evidences, tenantId);

  const gaps: TrainingOjtGapIndicator[] = [];

  tEmployees.forEach(emp => {
    const unit = tUnits.find(u => u.id === emp.organizationUnitId);
    const organizationUnitName = unit ? unit.name : "Unknown";

    // Gather active roles (primary and active backup)
    const activeRoles: Array<{ functionId: string; isPrimary: boolean; startDate: string }> = [];

    tAssignments.filter(a => a.employeeId === emp.id && a.isPrimary && a.status === "active")
      .forEach(a => activeRoles.push({ functionId: a.functionId, isPrimary: true, startDate: a.startDate }));

    tBackups.filter(b => b.employeeId === emp.id && b.status === "active")
      .forEach(b => activeRoles.push({ functionId: b.functionId, isPrimary: false, startDate: "2026-05-01" }));

    activeRoles.forEach(role => {
      const func = tFunctions.find(f => f.id === role.functionId);
      if (!func) return;

      const skillEntry = emp.skills.find(s => s.skillId === func.id);
      const isCertified = skillEntry ? skillEntry.certified : false;

      const ojt = tOjts.find(o => o.employeeId === emp.id && o.skillId === func.id);
      const isOjtCompleted = ojt ? ojt.status === "completed" : false;

      const evidence = tEvidences.find(e => e.employeeId === emp.id && e.functionId === func.id);
      const isEvidenceValidated = evidence ? evidence.status === EvidenceStatus.VALIDATED : false;

      const roleTypeStr = role.isPrimary ? "primary" : "backup";

      // 1. Missing Training
      if (!isCertified) {
        gaps.push({
          employeeId: emp.id,
          employeeName: emp.name,
          functionId: func.id,
          functionName: func.name,
          organizationUnitId: emp.organizationUnitId,
          organizationUnitName,
          gapType: "missing_training",
          description: `Employee [${emp.name}] acts as ${roleTypeStr} but has no certified theoretical training on record.`,
          tenantId: emp.tenantId
        });
      }

      // 2. Missing OJT
      if (!isOjtCompleted) {
        gaps.push({
          employeeId: emp.id,
          employeeName: emp.name,
          functionId: func.id,
          functionName: func.name,
          organizationUnitId: emp.organizationUnitId,
          organizationUnitName,
          gapType: "missing_ojt",
          description: `Employee [${emp.name}] acts as ${roleTypeStr} but lacks completed practical OJT validation.`,
          tenantId: emp.tenantId
        });
      }

      // 3. Incomplete Readiness (has training but no OJT)
      if (isCertified && !isOjtCompleted) {
        gaps.push({
          employeeId: emp.id,
          employeeName: emp.name,
          functionId: func.id,
          functionName: func.name,
          organizationUnitId: emp.organizationUnitId,
          organizationUnitName,
          gapType: "incomplete_readiness",
          description: `Employee [${emp.name}] has certified training for ${func.name} but lacks practical OJT completion.`,
          tenantId: emp.tenantId
        });
      }

      // 4. Evidence Validation Gap (completed OJT but evidence is not validated)
      if (isOjtCompleted && !isEvidenceValidated) {
        gaps.push({
          employeeId: emp.id,
          employeeName: emp.name,
          functionId: func.id,
          functionName: func.name,
          organizationUnitId: emp.organizationUnitId,
          organizationUnitName,
          gapType: "evidence_validation_gap",
          description: `Employee [${emp.name}] completed OJT for ${func.name} but evidence record is pending/unvalidated.`,
          tenantId: emp.tenantId
        });
      }

      // 5. Overdue Compliance Risk
      const daysSinceStart = getDaysDifference(role.startDate, "2026-06-01");
      if ((!isCertified || !isOjtCompleted) && daysSinceStart > 30) {
        gaps.push({
          employeeId: emp.id,
          employeeName: emp.name,
          functionId: func.id,
          functionName: func.name,
          organizationUnitId: emp.organizationUnitId,
          organizationUnitName,
          gapType: "overdue_compliance_risk",
          description: `Employee [${emp.name}] is active > 30 days without completing theoretical/OJT training compliance.`,
          tenantId: emp.tenantId
        });
      }
    });
  });

  // Apply filters
  return gaps.filter(row => {
    if (filters?.organizationUnitId && row.organizationUnitId !== filters.organizationUnitId) {
      return false;
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      const matchEmp = row.employeeName.toLowerCase().includes(query);
      const matchFunc = row.functionName.toLowerCase().includes(query);
      const matchUnit = row.organizationUnitName.toLowerCase().includes(query);
      if (!matchEmp && !matchFunc && !matchUnit) {
        return false;
      }
    }
    return true;
  });
}

// ============================================================================
// 12. TRAINING & OJT SUMMARY DASHBOARD DATA
// ============================================================================
export function getTrainingOjtSummaryDashboardData(
  employees: Employee[],
  assignments: EmployeeAssignment[],
  backups: BackupAssignment[],
  programs: TrainingProgram[],
  ojts: OjtPlan[],
  functions: Function[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  filters?: TrainingOjtFilters
): TrainingOjtSummary {
  const tenantId = filters?.tenantId;

  const tEmployees = filterTenantData(employees, tenantId);
  const tPrograms = filterTenantData(programs, tenantId);
  const tOjts = filterTenantData(ojts, tenantId);

  const trainingRows = getTrainingRowsByTenant(
    employees,
    assignments,
    backups,
    programs,
    functions,
    units,
    { tenantId }
  );

  const ojtRows = getOjtRowsByTenant(
    ojts,
    employees,
    assignments,
    backups,
    functions,
    units,
    evidences,
    { tenantId }
  );

  const completedTrainingsCount = trainingRows.filter(r => r.status === "completed").length;
  const pendingTrainingsCount = trainingRows.filter(r => r.status === "pending" || r.status === "not_started").length;
  const overdueTrainingsCount = trainingRows.filter(r => r.isOverdue).length;

  const completedOjtPlansCount = ojtRows.filter(r => r.status === "completed").length;
  const pendingOjtPlansCount = ojtRows.filter(r => r.status === "planned" || r.status === "in_progress").length;
  const overdueOjtPlansCount = ojtRows.filter(r => r.isOverdue).length;

  // Validation gaps count: OjtPlan completed but no validated evidence record
  const gaps = getTrainingOjtGapIndicators(
    employees,
    assignments,
    backups,
    programs,
    ojts,
    functions,
    units,
    evidences,
    { tenantId }
  );
  const evidenceValidationGapsCount = gaps.filter(g => g.gapType === "evidence_validation_gap").length;

  // Calculate Operational Compliance Rate
  // Defined as percentage of active roles (primary and backups) that are fully compliant (both certified AND OJT completed)
  let totalRoles = trainingRows.length; // Each training row corresponds to a unique active role assignment
  let compliantRoles = 0;

  trainingRows.forEach(tRow => {
    // Check if there is also a completed OJT plan for this employee & function
    const hasCompletedOjt = ojtRows.some(
      o => o.employeeId === tRow.employeeId && o.functionId === tRow.functionId && o.status === "completed"
    );
    if (tRow.isCertified && hasCompletedOjt) {
      compliantRoles++;
    }
  });

  const operationalComplianceRate = totalRoles > 0 ? Math.round((compliantRoles / totalRoles) * 100) : 0;

  return {
    totalEmployees: tEmployees.length,
    totalTrainingPrograms: tPrograms.length,
    completedTrainingsCount,
    pendingTrainingsCount,
    overdueTrainingsCount,
    completedOjtPlansCount,
    pendingOjtPlansCount,
    overdueOjtPlansCount,
    evidenceValidationGapsCount,
    operationalComplianceRate,
    tenantId: tenantId || ""
  };
}

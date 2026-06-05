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
  ActionPlanFilters,
  ActionPlanRow,
  ActionItemRow,
  ActionOwnerRow,
  ActionSourceLinkRow,
  ActionGapRow,
  ActionPlansSummary
} from "./types";

// ============================================================================
// 1. TENANT FILTER UTILITY
// ============================================================================

function filterTenantData<T>(items: T[], tenantId?: string): T[] {
  if (!tenantId) return items;
  return items.filter(item => (item as any).tenantId === tenantId);
}

// ============================================================================
// 2. PURE SELECTORS
// ============================================================================

export function getActionPlanRows(
  actionPlans: ActionPlan[],
  functions: Function[],
  employees: Employee[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  snapshots: VulnerabilitySnapshot[],
  filters?: ActionPlanFilters
): ActionPlanRow[] {
  const tenantId = filters?.tenantId;

  // Isolate by tenant
  const tActions = filterTenantData(actionPlans, tenantId);
  const tFuncs = filterTenantData(functions, tenantId);
  const tEmployees = filterTenantData(employees, tenantId);
  const tUnits = filterTenantData(units, tenantId);
  const tEvidences = filterTenantData(evidences, tenantId);
  const tSnapshots = filterTenantData(snapshots, tenantId);

  const todayStr = "2026-06-01";

  const rows: ActionPlanRow[] = tActions.map(ac => {
    // Resolve Function
    const func = tFuncs.find(f => f.id === ac.functionId);

    // Resolve Employee owner
    const owner = ac.ownerEmployeeId ? tEmployees.find(e => e.id === ac.ownerEmployeeId) : null;
    const ownerName = owner ? owner.name : "Unassigned";

    // Resolve Org Unit
    const orgUnitId = func ? func.organizationUnitId : "Unassigned";
    const orgUnit = tUnits.find(u => u.id === orgUnitId);
    const orgUnitName = orgUnit ? orgUnit.name : "Unassigned";

    // Evidence records count
    const linkedEvidences = func
      ? tEvidences.filter(ev => ev.functionId === func.id)
      : [];

    // Overdue state
    const isCompleted = ac.status === ActionStatus.COMPLETED || ac.status === ActionStatus.CANCELLED;
    const isOverdue = !isCompleted && !!ac.dueDate && ac.dueDate < todayStr;

    return {
      actionPlanId: ac.id,
      title: ac.title,
      status: ac.status,
      priority: ac.priority,
      ownerEmployeeId: ac.ownerEmployeeId,
      ownerName,
      organizationUnitId: orgUnitId,
      organizationUnitName: orgUnitName,
      functionId: func ? func.id : "Unassigned",
      functionName: func ? func.name : "Unassigned",
      sourceType: ac.sourceType,
      sourceRecordId: ac.sourceRecordId,
      linkedEvidenceCount: linkedEvidences.length,
      openItemCount: isCompleted ? 0 : 1,
      completedItemCount: ac.status === ActionStatus.COMPLETED ? 1 : 0,
      overdueItemCount: isOverdue ? 1 : 0,
      dueDate: ac.dueDate,
      isOverdue,
      createdAt: ac.createdAt,
      updatedAt: ac.updatedAt,
      tenantId: ac.tenantId
    };
  });

  // Apply filters
  return rows.filter(row => {
    if (filters?.organizationUnitId && row.organizationUnitId !== filters.organizationUnitId) {
      return false;
    }
    if (filters?.functionId && row.functionId !== filters.functionId) {
      return false;
    }
    if (filters?.ownerEmployeeId && row.ownerEmployeeId !== filters.ownerEmployeeId) {
      return false;
    }
    if (filters?.status && row.status !== filters.status) {
      return false;
    }
    if (filters?.priority && row.priority !== filters.priority) {
      return false;
    }
    if (filters?.sourceType && row.sourceType !== filters.sourceType) {
      return false;
    }
    if (filters?.onlyOverdue && !row.isOverdue) {
      return false;
    }
    if (filters?.onlyWithoutOwner && row.ownerEmployeeId !== null) {
      return false;
    }
    if (filters?.onlyWithoutEvidence && row.linkedEvidenceCount > 0) {
      return false;
    }
    if (filters?.onlyHighPriority && row.priority !== Priority.HIGH && row.priority !== Priority.CRITICAL) {
      return false;
    }
    if (filters?.onlyLinkedToCriticalFunctions) {
      const func = tFuncs.find(f => f.id === row.functionId);
      if (!func || !func.isCritical) return false;
    }
    if (filters?.onlyLinkedToVulnerabilities) {
      const snap = tSnapshots.find(s => s.functionId === row.functionId);
      if (!snap || snap.score < 60) return false;
    }
    return true;
  });
}

export function getActionPlansSummary(
  actionPlans: ActionPlan[],
  functions: Function[],
  employees: Employee[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  snapshots: VulnerabilitySnapshot[],
  filters?: ActionPlanFilters
): ActionPlansSummary {
  const queryFilters: ActionPlanFilters = {
    tenantId: filters?.tenantId,
    organizationUnitId: filters?.organizationUnitId,
    functionId: filters?.functionId,
    ownerEmployeeId: filters?.ownerEmployeeId,
    status: filters?.status,
    priority: filters?.priority,
    sourceType: filters?.sourceType
  };

  const rows = getActionPlanRows(actionPlans, functions, employees, units, evidences, snapshots, queryFilters);
  const count = rows.length;

  if (count === 0) {
    return {
      totalActionPlans: 0,
      openActionPlans: 0,
      completedActionPlans: 0,
      overdueActionPlans: 0,
      highPriorityActions: 0,
      actionsWithoutOwner: 0,
      actionsWithoutEvidence: 0,
      actionsLinkedToCriticalFunctions: 0,
      actionsLinkedToVulnerabilities: 0,
      averageCompletionRate: 0
    };
  }

  let openCount = 0;
  let completedCount = 0;
  let overdueCount = 0;
  let highPriorityCount = 0;
  let withoutOwner = 0;
  let withoutEvidence = 0;
  let linkedToCriticalFunctions = 0;
  let linkedToVulnerabilities = 0;
  let completionSum = 0;

  const tenantId = filters?.tenantId;
  const tFuncs = filterTenantData(functions, tenantId);
  const tSnapshots = filterTenantData(snapshots, tenantId);

  rows.forEach(row => {
    if (row.status === ActionStatus.COMPLETED) {
      completedCount++;
      completionSum += 100;
    } else {
      openCount++;
      if (row.status === ActionStatus.IN_PROGRESS) {
        completionSum += 50;
      }
    }

    if (row.isOverdue) {
      overdueCount++;
    }

    if (row.priority === Priority.HIGH || row.priority === Priority.CRITICAL) {
      highPriorityCount++;
    }

    if (row.ownerEmployeeId === null) {
      withoutOwner++;
    }

    if (row.linkedEvidenceCount === 0) {
      withoutEvidence++;
    }

    const func = tFuncs.find(f => f.id === row.functionId);
    if (func && func.isCritical) {
      linkedToCriticalFunctions++;
    }

    const snap = tSnapshots.find(s => s.functionId === row.functionId);
    if (snap && snap.score >= 60) {
      linkedToVulnerabilities++;
    }
  });

  return {
    totalActionPlans: count,
    openActionPlans: openCount,
    completedActionPlans: completedCount,
    overdueActionPlans: overdueCount,
    highPriorityActions: highPriorityCount,
    actionsWithoutOwner: withoutOwner,
    actionsWithoutEvidence: withoutEvidence,
    actionsLinkedToCriticalFunctions: linkedToCriticalFunctions,
    actionsLinkedToVulnerabilities: linkedToVulnerabilities,
    averageCompletionRate: Math.round(completionSum / count)
  };
}

export function getActionItemRows(
  actionPlans: ActionPlan[],
  functions: Function[],
  employees: Employee[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  snapshots: VulnerabilitySnapshot[],
  filters?: ActionPlanFilters
): ActionItemRow[] {
  const rows = getActionPlanRows(actionPlans, functions, employees, units, evidences, snapshots, filters);

  return rows.map(row => {
    return {
      actionItemId: `item_${row.actionPlanId}`,
      actionPlanId: row.actionPlanId,
      title: row.title,
      status: row.status,
      isCompleted: row.status === ActionStatus.COMPLETED,
      dueDate: row.dueDate,
      isOverdue: row.isOverdue,
      tenantId: row.tenantId
    };
  });
}

export function getActionOwnerRows(
  actionPlans: ActionPlan[],
  functions: Function[],
  employees: Employee[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  snapshots: VulnerabilitySnapshot[],
  filters?: ActionPlanFilters
): ActionOwnerRow[] {
  const rows = getActionPlanRows(actionPlans, functions, employees, units, evidences, snapshots, filters);
  const tenantId = filters?.tenantId || "";
  const tEmployees = filterTenantData(employees, tenantId);

  const ownersMap: Record<string, { active: number; overdue: number }> = {};

  rows.forEach(row => {
    const ownerId = row.ownerEmployeeId || "unassigned";
    if (!ownersMap[ownerId]) {
      ownersMap[ownerId] = { active: 0, overdue: 0 };
    }
    if (row.status !== ActionStatus.COMPLETED && row.status !== ActionStatus.CANCELLED) {
      ownersMap[ownerId].active++;
    }
    if (row.isOverdue) {
      ownersMap[ownerId].overdue++;
    }
  });

  return Object.entries(ownersMap).map(([ownerId, stats]) => {
    const emp = tEmployees.find(e => e.id === ownerId);
    return {
      employeeId: ownerId,
      employeeName: emp ? emp.name : "Unassigned",
      activeActionPlansCount: stats.active,
      overdueActionPlansCount: stats.overdue,
      tenantId
    };
  });
}

export function getActionSourceLinkRows(
  actionPlans: ActionPlan[],
  functions: Function[],
  employees: Employee[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  snapshots: VulnerabilitySnapshot[],
  filters?: ActionPlanFilters
): ActionSourceLinkRow[] {
  const rows = getActionPlanRows(actionPlans, functions, employees, units, evidences, snapshots, filters);
  return rows.map(row => {
    return {
      actionPlanId: row.actionPlanId,
      sourceType: row.sourceType,
      sourceRecordId: row.sourceRecordId,
      sourceRecordName: row.functionName,
      tenantId: row.tenantId
    };
  });
}

export function getActionGapRows(
  actionPlans: ActionPlan[],
  functions: Function[],
  employees: Employee[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  snapshots: VulnerabilitySnapshot[],
  filters?: ActionPlanFilters
): ActionGapRow[] {
  const tenantId = filters?.tenantId;

  const tActions = filterTenantData(actionPlans, tenantId);
  const tFuncs = filterTenantData(functions, tenantId);
  const tEmployees = filterTenantData(employees, tenantId);
  const tEvidences = filterTenantData(evidences, tenantId);
  const tSnapshots = filterTenantData(snapshots, tenantId);

  const gapRows: ActionGapRow[] = [];
  const todayStr = "2026-06-01";

  // Pre-fetch mappings
  const planRows = getActionPlanRows(tActions, tFuncs, tEmployees, units, tEvidences, tSnapshots, { tenantId });

  // 1 & 2 & 3 & 4 & 5: ActionPlan Rows Specific Gaps
  planRows.forEach(row => {
    if (!row.ownerEmployeeId) {
      gapRows.push({
        gapType: ActionGapType.MISSING_OWNER,
        description: `Action plan [${row.actionPlanId}] is missing a designated owner.`,
        severity: "critical",
        targetRecordId: row.actionPlanId,
        targetRecordName: row.title,
        tenantId: row.tenantId
      });
    }

    if (!row.dueDate) {
      gapRows.push({
        gapType: ActionGapType.MISSING_DUE_DATE,
        description: `Action plan [${row.actionPlanId}] is missing a target due date.`,
        severity: "critical",
        targetRecordId: row.actionPlanId,
        targetRecordName: row.title,
        tenantId: row.tenantId
      });
    }

    if (row.status === ActionStatus.COMPLETED && row.linkedEvidenceCount === 0) {
      gapRows.push({
        gapType: ActionGapType.MISSING_EVIDENCE,
        description: `Action plan [${row.actionPlanId}] was completed without validated ISO evidence records.`,
        severity: "warning",
        targetRecordId: row.actionPlanId,
        targetRecordName: row.title,
        tenantId: row.tenantId
      });
    }

    if (row.isOverdue) {
      gapRows.push({
        gapType: ActionGapType.OVERDUE_ACTION,
        description: `Action plan [${row.actionPlanId}] is overdue past scheduled due date [${row.dueDate}].`,
        severity: "critical",
        targetRecordId: row.actionPlanId,
        targetRecordName: row.title,
        tenantId: row.tenantId
      });
    }

    const isOpen = row.status !== ActionStatus.COMPLETED && row.status !== ActionStatus.CANCELLED;
    if (isOpen && (row.priority === Priority.HIGH || row.priority === Priority.CRITICAL)) {
      gapRows.push({
        gapType: ActionGapType.HIGH_PRIORITY_OPEN,
        description: `High-priority action plan is open past schedule.`,
        severity: "warning",
        targetRecordId: row.actionPlanId,
        targetRecordName: row.title,
        tenantId: row.tenantId
      });
    }
  });

  // 6 & 7 & 8 & 9 & 10: Missing actions for critical or vulnerable targets
  tFuncs.forEach(func => {
    const hasActions = planRows.some(row => row.functionId === func.id);
    const hasTrainingAction = planRows.some(row => row.functionId === func.id && row.sourceType === "training_program");
    const hasDocAction = planRows.some(row => row.functionId === func.id && row.sourceType === "knowledge_gap");

    const linkedEvidences = tEvidences.filter(ev => ev.functionId === func.id);

    if (func.isCritical && !hasActions) {
      gapRows.push({
        gapType: ActionGapType.CRITICAL_FUNCTION_WITHOUT_ACTION,
        description: `Critical function [${func.code} - ${func.name}] is currently missing mitigation action plans.`,
        severity: "critical",
        targetRecordId: func.id,
        targetRecordName: func.name,
        tenantId: func.tenantId
      });
    }

    const snap = tSnapshots.find(s => s.functionId === func.id);
    if (snap && snap.score >= 60 && !hasActions) {
      gapRows.push({
        gapType: ActionGapType.VULNERABILITY_WITHOUT_ACTION,
        description: `High-vulnerability snapshot rating (${snap.score}%) lacks corrective actions.`,
        severity: "critical",
        targetRecordId: func.id,
        targetRecordName: func.name,
        tenantId: func.tenantId
      });
    }

    // 8. Training Need check
    const employeesWithOjt = tEmployees.filter(e => e.skills.some(s => !s.certified));
    const hasOjtGaps = employeesWithOjt.some(e => e.organizationUnitId === func.organizationUnitId);
    if (hasOjtGaps && !hasTrainingAction) {
      gapRows.push({
        gapType: ActionGapType.TRAINING_NEED_WITHOUT_ACTION,
        description: `Employee training needs noted on function sector [${func.name}] without OJT training programs.`,
        severity: "warning",
        targetRecordId: func.id,
        targetRecordName: func.name,
        tenantId: func.tenantId
      });
    }

    // 9. Knowledge Gap check
    if (func.requiredBackupQuantity > 1 && !hasDocAction) {
      gapRows.push({
        gapType: ActionGapType.KNOWLEDGE_GAP_WITHOUT_ACTION,
        description: `Backup requirements require document knowledge assets mapping for [${func.name}].`,
        severity: "warning",
        targetRecordId: func.id,
        targetRecordName: func.name,
        tenantId: func.tenantId
      });
    }

    // 10. Evidence Gap check
    const hasValidatedEvidence = linkedEvidences.some(ev => ev.status === EvidenceStatus.VALIDATED);
    if (!hasValidatedEvidence && !hasActions) {
      gapRows.push({
        gapType: ActionGapType.EVIDENCE_GAP_WITHOUT_ACTION,
        description: `Missing validated audit evidence records for function [${func.name}].`,
        severity: "warning",
        targetRecordId: func.id,
        targetRecordName: func.name,
        tenantId: func.tenantId
      });
    }
  });

  return gapRows;
}

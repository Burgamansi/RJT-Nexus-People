import { Priority, ActionStatus, ActionGapType } from "../../shared/domain/people/enums";

export interface ActionPlanFilters {
  tenantId?: string;
  organizationUnitId?: string;
  functionId?: string;
  ownerEmployeeId?: string;
  status?: ActionStatus;
  priority?: Priority;
  sourceType?: string;
  onlyOverdue?: boolean;
  onlyWithoutOwner?: boolean;
  onlyWithoutEvidence?: boolean;
  onlyHighPriority?: boolean;
  onlyLinkedToCriticalFunctions?: boolean;
  onlyLinkedToVulnerabilities?: boolean;
}

export interface ActionPlanRow {
  actionPlanId: string;
  title: string;
  status: ActionStatus;
  priority: Priority;
  ownerEmployeeId: string | null;
  ownerName: string;
  organizationUnitId: string;
  organizationUnitName: string;
  functionId: string;
  functionName: string;
  sourceType: string;
  sourceRecordId: string;
  linkedEvidenceCount: number;
  openItemCount: number;
  completedItemCount: number;
  overdueItemCount: number;
  dueDate?: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

export interface ActionItemRow {
  actionItemId: string;
  actionPlanId: string;
  title: string;
  status: ActionStatus;
  isCompleted: boolean;
  dueDate?: string;
  isOverdue: boolean;
  tenantId: string;
}

export interface ActionOwnerRow {
  employeeId: string;
  employeeName: string;
  activeActionPlansCount: number;
  overdueActionPlansCount: number;
  tenantId: string;
}

export interface ActionSourceLinkRow {
  actionPlanId: string;
  sourceType: string;
  sourceRecordId: string;
  sourceRecordName: string;
  tenantId: string;
}

export interface ActionGapRow {
  gapType: ActionGapType | string; // gap type string literal
  description: string;
  severity: "info" | "warning" | "critical";
  targetRecordId: string;
  targetRecordName: string;
  tenantId: string;
}

export interface ActionPlansSummary {
  totalActionPlans: number;
  openActionPlans: number;
  completedActionPlans: number;
  overdueActionPlans: number;
  highPriorityActions: number;
  actionsWithoutOwner: number;
  actionsWithoutEvidence: number;
  actionsLinkedToCriticalFunctions: number;
  actionsLinkedToVulnerabilities: number;
  averageCompletionRate: number;
}

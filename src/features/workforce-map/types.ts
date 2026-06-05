export interface WorkforceMapFilters {
  tenantId?: string;
  organizationUnitId?: string;
  functionId?: string;
  employeeStatus?: "active" | "inactive";
  assignmentStatus?: "active" | "inactive" | "ended";
  onlyWithoutAssignment?: boolean;
  onlyFunctionsWithoutOwner?: boolean;
  search?: string;
}

export interface WorkforceEmployeeRow {
  employeeId: string;
  employeeName: string;
  email: string;
  status: "active" | "inactive";
  organizationUnitId: string;
  organizationUnitName: string;
  primaryPositionTitle: string;
  primaryFunctionId: string;
  primaryFunctionName: string;
  managerName?: string;
  assignmentsCount: number;
  tenantId: string;
}

export interface WorkforceFunctionRow {
  functionId: string;
  code: string;
  name: string;
  description: string;
  isCritical: boolean;
  organizationUnitId: string;
  organizationUnitName: string;
  primaryOwnerCount: number;
  totalOwnerCount: number;
  tenantId: string;
}

export interface WorkforceOrgUnitRow {
  organizationUnitId: string;
  name: string;
  type: "department" | "sector" | "division";
  employeeCount: number;
  functionCount: number;
  activeAssignmentCount: number;
  tenantId: string;
}

export interface WorkforceAssignmentRow {
  assignmentId: string;
  employeeId: string;
  employeeName: string;
  organizationUnitId: string;
  organizationUnitName: string;
  functionId: string;
  functionName: string;
  positionTitle: string;
  status: "active" | "inactive" | "ended";
  isPrimary: boolean;
  startDate: string;
  endDate?: string;
  managerName?: string;
  tenantId: string;
}

export interface WorkforceMapSummary {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalOrgUnits: number;
  totalFunctions: number;
  employeesWithoutAssignment: number;
  functionsWithoutOwner: number;
  primaryAssignments: number;
  temporaryAssignments: number;
  endedAssignments: number;
}

import {
  Employee,
  OrganizationUnit,
  Function,
  EmployeeAssignment
} from "../../shared/domain/people/entities";

import {
  WorkforceMapFilters,
  WorkforceEmployeeRow,
  WorkforceFunctionRow,
  WorkforceOrgUnitRow,
  WorkforceAssignmentRow,
  WorkforceMapSummary
} from "./types";

// ============================================================================
// 1. HELPER TENANT FILTER
// ============================================================================

function filterTenantData<T>(items: T[], tenantId?: string): T[] {
  if (!tenantId) return items;
  return items.filter(item => (item as any).tenantId === tenantId);
}

// ============================================================================
// 2. PURE SELECTORS
// ============================================================================

export function getWorkforceEmployeeRows(
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assignments: EmployeeAssignment[],
  filters?: WorkforceMapFilters
): WorkforceEmployeeRow[] {
  const tenantId = filters?.tenantId;

  const tEmployees = filterTenantData(employees, tenantId);
  const tUnits = filterTenantData(units, tenantId);
  const tFuncs = filterTenantData(functions, tenantId);
  const tAssignments = filterTenantData(assignments, tenantId);

  const rows: WorkforceEmployeeRow[] = tEmployees.map(emp => {
    const empAssignments = tAssignments.filter(a => a.employeeId === emp.id);
    const primaryAsg = empAssignments.find(a => a.isPrimary && a.status === "active");

    const primaryFunctionId = primaryAsg ? primaryAsg.functionId : "None";
    const primaryFunc = tFuncs.find(f => f.id === primaryFunctionId);
    const primaryFunctionName = primaryFunc ? primaryFunc.name : "None";

    const organizationUnitId = primaryAsg ? primaryAsg.organizationUnitId : emp.organizationUnitId;
    const orgUnit = tUnits.find(u => u.id === organizationUnitId);
    const organizationUnitName = orgUnit ? orgUnit.name : "None";

    let managerName: string | undefined;
    if (primaryAsg && primaryAsg.managerEmployeeId) {
      const manager = tEmployees.find(e => e.id === primaryAsg.managerEmployeeId);
      if (manager) managerName = manager.name;
    }

    return {
      employeeId: emp.id,
      employeeName: emp.name,
      email: emp.email,
      status: emp.status,
      organizationUnitId,
      organizationUnitName,
      primaryPositionTitle: primaryAsg ? primaryAsg.positionTitle : "None",
      primaryFunctionId,
      primaryFunctionName,
      managerName,
      assignmentsCount: empAssignments.filter(a => a.status === "active").length,
      tenantId: emp.tenantId
    };
  });

  // Apply filters
  return rows.filter(row => {
    if (filters?.organizationUnitId && row.organizationUnitId !== filters.organizationUnitId) {
      return false;
    }
    if (filters?.functionId && row.primaryFunctionId !== filters.functionId) {
      return false;
    }
    if (filters?.employeeStatus && row.status !== filters.employeeStatus) {
      return false;
    }
    if (filters?.onlyWithoutAssignment && row.assignmentsCount > 0) {
      return false;
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      const matchName = row.employeeName.toLowerCase().includes(query);
      const matchEmail = row.email.toLowerCase().includes(query);
      const matchTitle = row.primaryPositionTitle.toLowerCase().includes(query);
      if (!matchName && !matchEmail && !matchTitle) {
        return false;
      }
    }
    return true;
  });
}

export function getWorkforceFunctionRows(
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assignments: EmployeeAssignment[],
  filters?: WorkforceMapFilters
): WorkforceFunctionRow[] {
  const tenantId = filters?.tenantId;

  const tEmployees = filterTenantData(employees, tenantId);
  const tUnits = filterTenantData(units, tenantId);
  const tFuncs = filterTenantData(functions, tenantId);
  const tAssignments = filterTenantData(assignments, tenantId);

  const rows: WorkforceFunctionRow[] = tFuncs.map(func => {
    const orgUnit = tUnits.find(u => u.id === func.organizationUnitId);
    const funcAssignments = tAssignments.filter(a => a.functionId === func.id && a.status === "active");

    const primaryOwnerCount = funcAssignments.filter(a => a.isPrimary).length;

    return {
      functionId: func.id,
      code: func.code,
      name: func.name,
      description: func.description,
      isCritical: func.isCritical,
      organizationUnitId: func.organizationUnitId,
      organizationUnitName: orgUnit ? orgUnit.name : "None",
      primaryOwnerCount,
      totalOwnerCount: funcAssignments.length,
      tenantId: func.tenantId
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
    if (filters?.onlyFunctionsWithoutOwner && row.primaryOwnerCount > 0) {
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

export function getWorkforceOrgUnitRows(
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assignments: EmployeeAssignment[],
  filters?: WorkforceMapFilters
): WorkforceOrgUnitRow[] {
  const tenantId = filters?.tenantId;

  const tEmployees = filterTenantData(employees, tenantId);
  const tUnits = filterTenantData(units, tenantId);
  const tFuncs = filterTenantData(functions, tenantId);
  const tAssignments = filterTenantData(assignments, tenantId);

  const rows: WorkforceOrgUnitRow[] = tUnits.map(unit => {
    const empCount = tEmployees.filter(e => e.organizationUnitId === unit.id).length;
    const funcCount = tFuncs.filter(f => f.organizationUnitId === unit.id).length;
    const activeAssignments = tAssignments.filter(a => a.organizationUnitId === unit.id && a.status === "active").length;

    return {
      organizationUnitId: unit.id,
      name: unit.name,
      type: unit.type,
      employeeCount: empCount,
      functionCount: funcCount,
      activeAssignmentCount: activeAssignments,
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
      if (!row.name.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });
}

export function getWorkforceAssignmentRows(
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assignments: EmployeeAssignment[],
  filters?: WorkforceMapFilters
): WorkforceAssignmentRow[] {
  const tenantId = filters?.tenantId;

  const tEmployees = filterTenantData(employees, tenantId);
  const tUnits = filterTenantData(units, tenantId);
  const tFuncs = filterTenantData(functions, tenantId);
  const tAssignments = filterTenantData(assignments, tenantId);

  const rows: WorkforceAssignmentRow[] = tAssignments.map(asg => {
    const emp = tEmployees.find(e => e.id === asg.employeeId);
    const unit = tUnits.find(u => u.id === asg.organizationUnitId);
    const func = tFuncs.find(f => f.id === asg.functionId);

    let managerName: string | undefined;
    if (asg.managerEmployeeId) {
      const manager = tEmployees.find(e => e.id === asg.managerEmployeeId);
      if (manager) managerName = manager.name;
    }

    return {
      assignmentId: asg.id,
      employeeId: asg.employeeId,
      employeeName: emp ? emp.name : "Unknown",
      organizationUnitId: asg.organizationUnitId,
      organizationUnitName: unit ? unit.name : "Unknown",
      functionId: asg.functionId,
      functionName: func ? func.name : "Unknown",
      positionTitle: asg.positionTitle,
      status: asg.status,
      isPrimary: asg.isPrimary,
      startDate: asg.startDate,
      endDate: asg.endDate,
      managerName,
      tenantId: asg.tenantId
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
    if (filters?.assignmentStatus && row.status !== filters.assignmentStatus) {
      return false;
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      const matchEmp = row.employeeName.toLowerCase().includes(query);
      const matchTitle = row.positionTitle.toLowerCase().includes(query);
      const matchFunc = row.functionName.toLowerCase().includes(query);
      const matchUnit = row.organizationUnitName.toLowerCase().includes(query);
      if (!matchEmp && !matchTitle && !matchFunc && !matchUnit) {
        return false;
      }
    }
    return true;
  });
}

export function getWorkforceMapSummary(
  employees: Employee[],
  units: OrganizationUnit[],
  functions: Function[],
  assignments: EmployeeAssignment[],
  filters?: WorkforceMapFilters
): WorkforceMapSummary {
  const tenantId = filters?.tenantId;

  const tEmployees = filterTenantData(employees, tenantId);
  const tUnits = filterTenantData(units, tenantId);
  const tFuncs = filterTenantData(functions, tenantId);
  const tAssignments = filterTenantData(assignments, tenantId);

  const activeEmployees = tEmployees.filter(e => e.status === "active").length;
  const inactiveEmployees = tEmployees.filter(e => e.status === "inactive").length;

  const withoutAssignmentCount = tEmployees.filter(
    e => e.status === "active" && !tAssignments.some(a => a.employeeId === e.id && a.status === "active")
  ).length;

  const functionsWithoutOwner = tFuncs.filter(
    f => !tAssignments.some(a => a.functionId === f.id && a.isPrimary && a.status === "active")
  ).length;

  const primaryAssignments = tAssignments.filter(a => a.isPrimary && a.status === "active").length;
  const temporaryAssignments = tAssignments.filter(a => !a.isPrimary && a.status === "active").length;
  const endedAssignments = tAssignments.filter(a => a.status === "ended").length;

  return {
    totalEmployees: tEmployees.length,
    activeEmployees,
    inactiveEmployees,
    totalOrgUnits: tUnits.length,
    totalFunctions: tFuncs.length,
    employeesWithoutAssignment: withoutAssignmentCount,
    functionsWithoutOwner,
    primaryAssignments,
    temporaryAssignments,
    endedAssignments
  };
}

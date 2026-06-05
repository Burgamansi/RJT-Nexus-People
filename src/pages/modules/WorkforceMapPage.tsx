import React, { useState } from "react";
import { Users, Layers, Award, Search, HelpCircle, Shield, Briefcase, FileText } from "lucide-react";
import { MetricCard } from "../../components/ui/MetricCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { usePeopleDataset } from "../../app/data/usePeopleDataset";

import {
  getWorkforceEmployeeRows,
  getWorkforceFunctionRows,
  getWorkforceOrgUnitRows,
  getWorkforceMapSummary
} from "../../features/workforce-map/selectors";

export const WorkforceMapPage: React.FC = () => {
  const { dataset, tenants } = usePeopleDataset();
  const DEMO_EMPLOYEES = dataset.employees;
  const DEMO_UNITS = dataset.units;
  const DEMO_FUNCTIONS = dataset.functions;
  const DEMO_ASSIGNMENTS = dataset.assignments;
  // Tenant selection state
  const [selectedTenant, setSelectedTenant] = useState<string>(dataset.tenantId);
  // Search query state
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Hydrate workforce selectors with the demo datasets isolated by the selected tenant
  const filters = {
    tenantId: selectedTenant,
    search: searchQuery || undefined
  };

  const summary = getWorkforceMapSummary(
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    { tenantId: selectedTenant }
  );

  const employeeRows = getWorkforceEmployeeRows(
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    filters
  );

  const functionRows = getWorkforceFunctionRows(
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    filters
  );

  const orgUnitRows = getWorkforceOrgUnitRows(
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    filters
  );

  // Identify empty units (Organization units without active employees)
  const emptyUnits = orgUnitRows.filter(o => o.employeeCount === 0);

  // Identify functions without owner (Functions with 0 primary owners)
  const functionsWithoutOwner = functionRows.filter(f => f.primaryOwnerCount === 0);

  return (
    <div className="space-y-10">
      {/* Module Title Header with Tenant Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full uppercase border border-cyan-500/20 select-none">
            PDCA Ação 01 · ISO 6.1
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight pt-2">
            Mapa Operacional
          </h1>
          <p className="text-xs text-slate-400">
            View live employee allocations, assignments, organization departments, and structural compliance.
          </p>
        </div>

        {/* Multi-Tenant Switcher Widget */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-2xl border border-slate-800">
          <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
          <select
            value={selectedTenant}
            onChange={(e) => {
              setSelectedTenant(e.target.value);
              setSearchQuery(""); // Reset search on tenant toggle
            }}
            className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-4"
          >
            {tenants.map(t => (
              <option key={t.id} value={t.id} className="bg-[#0C0C14] text-white text-xs font-semibold">
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytical Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Organization Units"
          value={summary.totalOrgUnits}
          icon={<Layers className="w-5 h-5 text-cyan-400" />}
        />
        <MetricCard
          title="Total Assigned Employees"
          value={`${summary.activeEmployees} / ${summary.totalEmployees}`}
          icon={<Users className="w-5 h-5 text-emerald-400" />}
          change={`${summary.inactiveEmployees} inactive entries`}
          isPositive={false}
        />
        <MetricCard
          title="Organogram Roles / Functions"
          value={summary.totalFunctions}
          icon={<Briefcase className="w-5 h-5 text-blue-400" />}
          change={`${summary.functionsWithoutOwner} vacant roles`}
          isPositive={summary.functionsWithoutOwner === 0}
        />
        <MetricCard
          title="Workforce Allocation Gaps"
          value={summary.employeesWithoutAssignment}
          icon={<HelpCircle className="w-5 h-5 text-amber-400" />}
          change="active personnel without assignment"
          isPositive={summary.employeesWithoutAssignment === 0}
        />
      </div>

      {/* Search Filter Controls */}
      <div className="flex items-center gap-3 bg-slate-900/50 rounded-xl p-3 border border-slate-800/80 max-w-md">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          placeholder="Filter employees, roles, units..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-[10px] text-cyan-400 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Primary Analytics Table: Mapped Employees */}
      <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Employee Allocations Map
            </h3>
          </div>
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800">
            {employeeRows.length} entries
          </span>
        </div>

        <div className="overflow-x-auto">
          {employeeRows.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="p-4 font-semibold uppercase text-[10px]">Name</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Unit</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Position Title</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Primary Function</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Manager</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {employeeRows.map(row => (
                  <tr key={row.employeeId} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-white leading-none">{row.employeeName}</p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-none">{row.email}</p>
                    </td>
                    <td className="p-4 font-semibold text-slate-200">{row.organizationUnitName}</td>
                    <td className="p-4 text-slate-300">{row.primaryPositionTitle}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {row.primaryFunctionName}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{row.managerName || "None"}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                        row.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12">
              <EmptyState
                title="No employees found"
                message="Adjust your filters or query text above to find matches inside this isolated tenant."
              />
            </div>
          )}
        </div>
      </div>

      {/* Secondary Analytics: vacant roles & empty units */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Empty Units List */}
        <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Vacant Departments / Units
                </h3>
              </div>
            </div>

            <div className="p-6 divide-y divide-slate-800/50">
              {emptyUnits.length > 0 ? (
                emptyUnits.map(unit => (
                  <div key={unit.organizationUnitId} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div>
                      <p className="font-bold text-white text-xs">{unit.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase mt-0.5">Type: {unit.type}</p>
                    </div>
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                      0 Assigned Employees
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs py-4 text-center">
                  All departments have at least one active employee mapped.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Vacant Roles List */}
        <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Vacant Functions / Roles
                </h3>
              </div>
            </div>

            <div className="p-6 divide-y divide-slate-800/50">
              {functionsWithoutOwner.length > 0 ? (
                functionsWithoutOwner.map(func => (
                  <div key={func.functionId} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div>
                      <p className="font-bold text-white text-xs">
                        {func.name} <span className="text-[10px] font-mono text-slate-500">[{func.code}]</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">{func.description}</p>
                    </div>
                    <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[9px] font-bold text-rose-400 border border-rose-500/20 uppercase tracking-wider shrink-0 ml-4">
                      No Owner
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs py-4 text-center">
                  All functions have primary operators assigned.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { Award, Shield, Search, CheckCircle, AlertTriangle, Activity, Users, Layers, AlertCircle } from "lucide-react";
import { MetricCard } from "../../components/ui/MetricCard";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  DEMO_TENANTS,
  DEMO_EMPLOYEES,
  DEMO_UNITS,
  DEMO_FUNCTIONS,
  DEMO_ASSIGNMENTS,
  DEMO_BACKUPS,
  DEMO_PROGRAMS,
  DEMO_OJTS,
  DEMO_EVIDENCES
} from "../../app/data/peopleDemoDataset";

import {
  getPolyvalenceMatrixRowsByTenant,
  getFunctionsCoveredByTrainedEmployees,
  getFunctionsWithoutTrainedBackup,
  getEmployeesWithMultipleValidatedFunctions,
  getSinglePointOfFailureFunctions,
  getPolyvalenceCoverageByOrgUnit,
  getTrainingGapIndicators,
  getOjtGapIndicators,
  getPolyvalenceSummaryDashboardData
} from "../../features/polyvalence-matrix/selectors";

export const PolyvalenceMatrixPage: React.FC = () => {
  // Tenant switcher state
  const [selectedTenant, setSelectedTenant] = useState<string>("tenant_ubg");
  // Search query state
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filters = {
    tenantId: selectedTenant,
    search: searchQuery || undefined
  };

  // Hydrate selectors
  const summary = getPolyvalenceSummaryDashboardData(
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_PROGRAMS,
    DEMO_OJTS,
    DEMO_EVIDENCES,
    { tenantId: selectedTenant }
  );

  const matrixRows = getPolyvalenceMatrixRowsByTenant(
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_PROGRAMS,
    DEMO_OJTS,
    DEMO_EVIDENCES,
    filters
  );

  // Functions in this tenant to dynamically form grid columns
  const tenantFunctions = DEMO_FUNCTIONS.filter(f => f.tenantId === selectedTenant);

  const coveredFunctions = getFunctionsCoveredByTrainedEmployees(
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_PROGRAMS,
    DEMO_OJTS,
    DEMO_EVIDENCES,
    { tenantId: selectedTenant }
  );

  const functionsWithoutTrainedBackup = getFunctionsWithoutTrainedBackup(
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_PROGRAMS,
    DEMO_OJTS,
    DEMO_EVIDENCES,
    { tenantId: selectedTenant }
  );

  const polyvalentEmployees = getEmployeesWithMultipleValidatedFunctions(
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_PROGRAMS,
    DEMO_OJTS,
    DEMO_EVIDENCES,
    filters
  );

  const spofFunctions = getSinglePointOfFailureFunctions(
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_PROGRAMS,
    DEMO_OJTS,
    DEMO_EVIDENCES,
    { tenantId: selectedTenant }
  );

  const orgUnitCoverage = getPolyvalenceCoverageByOrgUnit(
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_PROGRAMS,
    DEMO_OJTS,
    DEMO_EVIDENCES,
    { tenantId: selectedTenant }
  );

  const trainingGaps = getTrainingGapIndicators(
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_PROGRAMS,
    DEMO_OJTS,
    DEMO_EVIDENCES,
    filters
  );

  const ojtGaps = getOjtGapIndicators(
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_PROGRAMS,
    DEMO_OJTS,
    DEMO_EVIDENCES,
    filters
  );

  // Renders premium color-coded badges for capability levels
  const renderCapabilityBadge = (level: string) => {
    switch (level) {
      case "operational":
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 select-none">
            OPERATIONAL
          </span>
        );
      case "backup":
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 select-none">
            BACKUP
          </span>
        );
      case "practical":
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 select-none">
            PRACTICAL (OJT)
          </span>
        );
      case "training":
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 select-none">
            TRAINING
          </span>
        );
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-slate-500 border border-slate-800 select-none">
            NONE
          </span>
        );
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full uppercase border border-blue-500/20 select-none">
            PDCA Ação 03 · ISO 7.2
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight pt-2">
            Matriz de Polivalência
          </h1>
          <p className="text-xs text-slate-400">
            Mapeie competências por função, identifique lacunas de treinamento e pontos únicos de falha operacional.
          </p>
        </div>

        {/* Tenant Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-2xl border border-slate-800">
          <Shield className="w-4 h-4 text-blue-400 shrink-0" />
          <select
            value={selectedTenant}
            onChange={(e) => {
              setSelectedTenant(e.target.value);
              setSearchQuery("");
            }}
            className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-4"
          >
            {DEMO_TENANTS.map(t => (
              <option key={t.id} value={t.id} className="bg-[#0C0C14] text-white text-xs font-semibold">
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Polyvalence Index"
          value={summary.averageCoverageIndex}
          icon={<Activity className="w-5 h-5 text-cyan-400" />}
          change="avg backups per function"
        />
        <MetricCard
          title="Polyvalent Employees"
          value={`${summary.polyvalentEmployeesCount} / ${summary.totalEmployees}`}
          icon={<Users className="w-5 h-5 text-blue-400" />}
          change="personnel with multi-roles"
        />
        <MetricCard
          title="SPOF Vulnerable roles"
          value={summary.spofFunctionsCount}
          icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
          change="active primary but 0 active backups"
          isPositive={summary.spofFunctionsCount === 0}
        />
        <MetricCard
          title="Theoretical Training Gaps"
          value={summary.trainingGapsCount}
          icon={<AlertCircle className="w-5 h-5 text-amber-400" />}
          change="operators missing certified skill"
          isPositive={summary.trainingGapsCount === 0}
        />
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3 bg-slate-900/50 rounded-xl p-3 border border-slate-800/80 max-w-md">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          placeholder="Filter employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-[10px] text-blue-400 hover:underline">
            Clear
          </button>
        )}
      </div>

      {/* Primary Matrix Grid: Employee x Function Capabilities */}
      <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Employee x Function Capability Grid
            </h3>
          </div>
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800">
            {matrixRows.length} employees mapped
          </span>
        </div>

        <div className="overflow-x-auto">
          {matrixRows.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="p-4 font-semibold uppercase text-[10px] min-w-[200px]">Employee / Department</th>
                  {tenantFunctions.map(func => (
                    <th key={func.id} className="p-4 font-semibold uppercase text-[10px] text-center min-w-[150px]">
                      <span className="block font-mono text-cyan-400 font-bold">{func.code}</span>
                      <span className="text-[9px] text-slate-400 block truncate max-w-[150px] mt-1">{func.name}</span>
                    </th>
                  ))}
                  <th className="p-4 font-semibold uppercase text-[10px] text-center">Validated Roles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {matrixRows.map(row => (
                  <tr key={row.employeeId} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-white leading-none">{row.employeeName}</p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-none">{row.organizationUnitName}</p>
                    </td>
                    {tenantFunctions.map(func => {
                      const cap = row.capabilities.find(c => c.functionId === func.id);
                      const level = cap ? cap.capabilityLevel : "none";
                      return (
                        <td key={func.id} className="p-4 text-center">
                          {renderCapabilityBadge(level)}
                        </td>
                      );
                    })}
                    <td className="p-4 text-center font-mono font-bold text-white">
                      {row.totalValidatedCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12">
              <EmptyState
                title="No matrix records found"
                message="Adjust filters to display mapped capability grids inside this tenant."
              />
            </div>
          )}
        </div>
      </div>

      {/* Grid: Unit Performance & structural competency gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coverage by Org Unit */}
        <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Sectors Average Polyvalence Index
                </h3>
              </div>
            </div>

            <div className="p-6 divide-y divide-slate-800/50">
              {orgUnitCoverage.length > 0 ? (
                orgUnitCoverage.map(unit => (
                  <div key={unit.organizationUnitId} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div>
                      <p className="font-bold text-white text-xs">{unit.organizationUnitName}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{unit.employeeCount} mapped personnel</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-extrabold text-cyan-400 text-xs">
                        {unit.averagePolyvalenceIndex} index
                      </p>
                      <p className="text-[9px] text-rose-400 mt-0.5 font-semibold font-mono">{unit.spofCount} SPOFs</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs py-4 text-center">No units configured.</p>
              )}
            </div>
          </div>
        </div>

        {/* Competency Gap Alerts: Training & OJT */}
        <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Theoretical & Practical Training Gaps
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Training Gaps */}
              <div>
                <p className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-semibold mb-2">
                  Theoretical Training Gaps ({trainingGaps.length})
                </p>
                {trainingGaps.length > 0 ? (
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-2">
                    {trainingGaps.map((gap, i) => (
                      <div key={i} className="text-xs flex items-center justify-between bg-slate-900/40 p-2 rounded border border-slate-800/30">
                        <span className="text-slate-200 font-semibold truncate max-w-[200px]">{gap.employeeName}</span>
                        <span className="text-amber-400 font-mono text-[9px] truncate max-w-[150px]">{gap.functionName}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-emerald-400 text-[11px] font-semibold">0 certified training gaps detected!</p>
                )}
              </div>

              {/* OJT Gaps */}
              <div className="pt-2">
                <p className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-semibold mb-2">
                  Practical On-the-Job (OJT) Gaps ({ojtGaps.length})
                </p>
                {ojtGaps.length > 0 ? (
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-2">
                    {ojtGaps.map((gap, i) => (
                      <div key={i} className="text-xs flex items-center justify-between bg-slate-900/40 p-2 rounded border border-slate-800/30">
                        <span className="text-slate-200 font-semibold truncate max-w-[200px]">{gap.employeeName}</span>
                        <span className="text-amber-400 font-mono text-[9px] truncate max-w-[150px]">{gap.functionName}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-emerald-400 text-[11px] font-semibold">0 completed OJT gaps detected!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

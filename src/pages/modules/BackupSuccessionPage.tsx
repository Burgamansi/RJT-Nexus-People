import React, { useState } from "react";
import { Shield, Search, Award, Activity, AlertTriangle, AlertCircle, Users, Layers, ShieldCheck, ChevronRight } from "lucide-react";
import { MetricCard } from "../../components/ui/MetricCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { usePeopleDataset } from "../../app/data/usePeopleDataset";

import {
  getBackupCoverageRowsByTenant,
  getSuccessionReadinessRowsByTenant,
  getFunctionsWithNoBackup,
  getFunctionsWithUnvalidatedBackup,
  getFunctionsWithNoSuccessionCandidate,
  getEmployeesBackingUpMultipleCriticalFunctions,
  getBackupOverloadIndicators,
  getSuccessionPipelineByOrgUnit,
  getContinuityRiskIndicators,
  getBackupSuccessionSummaryDashboardData
} from "../../features/backup-succession/selectors";

export const BackupSuccessionPage: React.FC = () => {
  const { dataset, tenants } = usePeopleDataset();
  const DEMO_EMPLOYEES = dataset.employees;
  const DEMO_UNITS = dataset.units;
  const DEMO_FUNCTIONS = dataset.functions;
  const DEMO_ASSIGNMENTS = dataset.assignments;
  const DEMO_BACKUPS = dataset.backups;
  const DEMO_SUCCESSORS = dataset.successors;
  // Tenant switcher state
  const [selectedTenant, setSelectedTenant] = useState<string>(dataset.tenantId);
  // Search query state
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filters = {
    tenantId: selectedTenant,
    search: searchQuery || undefined
  };

  // Hydrate selectors
  const summary = getBackupSuccessionSummaryDashboardData(
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    DEMO_EMPLOYEES,
    DEMO_BACKUPS,
    DEMO_SUCCESSORS,
    DEMO_UNITS,
    { tenantId: selectedTenant }
  );

  const coverageRows = getBackupCoverageRowsByTenant(
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    DEMO_EMPLOYEES,
    DEMO_BACKUPS,
    DEMO_UNITS,
    filters
  );

  const successionRows = getSuccessionReadinessRowsByTenant(
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    DEMO_EMPLOYEES,
    DEMO_SUCCESSORS,
    DEMO_UNITS,
    filters
  );

  const withoutBackup = getFunctionsWithNoBackup(
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    DEMO_EMPLOYEES,
    DEMO_BACKUPS,
    DEMO_UNITS,
    filters
  );

  const unvalidatedBackup = getFunctionsWithUnvalidatedBackup(
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    DEMO_EMPLOYEES,
    DEMO_BACKUPS,
    DEMO_UNITS,
    filters
  );

  const withoutSuccessor = getFunctionsWithNoSuccessionCandidate(
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    DEMO_EMPLOYEES,
    DEMO_SUCCESSORS,
    DEMO_UNITS,
    filters
  );

  const backupMultipliers = getEmployeesBackingUpMultipleCriticalFunctions(
    DEMO_EMPLOYEES,
    DEMO_BACKUPS,
    DEMO_FUNCTIONS,
    DEMO_UNITS,
    filters
  );

  const overloadIndicators = getBackupOverloadIndicators(
    DEMO_EMPLOYEES,
    DEMO_BACKUPS,
    DEMO_FUNCTIONS,
    DEMO_UNITS,
    filters
  );

  const pipelineRows = getSuccessionPipelineByOrgUnit(
    DEMO_FUNCTIONS,
    DEMO_SUCCESSORS,
    DEMO_UNITS,
    { tenantId: selectedTenant }
  );

  const continuityRisks = getContinuityRiskIndicators(
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    DEMO_EMPLOYEES,
    DEMO_BACKUPS,
    DEMO_SUCCESSORS,
    DEMO_UNITS,
    filters
  );

  const getRiskLevelBadge = (level: "high" | "medium" | "low") => {
    switch (level) {
      case "high":
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
            High Risk
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Medium Risk
          </span>
        );
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Monitored
          </span>
        );
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full uppercase border border-cyan-500/20 select-none">
            PDCA Ação 05 · ISO 7.2 · 7.3
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight pt-2">
            Backup Operacional
          </h1>
          <p className="text-xs text-slate-400">
            Address functional vacancies, track successor pipelines, and protect organizational continuity.
          </p>
        </div>

        {/* Tenant Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-2xl border border-slate-800">
          <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
          <select
            value={selectedTenant}
            onChange={(e) => {
              setSelectedTenant(e.target.value);
              setSearchQuery("");
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

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Backup Coverage index"
          value={`${summary.fullyCoveredFunctionsCount} / ${summary.totalCriticalFunctions}`}
          icon={<ShieldCheck className="w-5 h-5 text-cyan-400" />}
          change={`${summary.partiallyCoveredFunctionsCount} partially covered`}
        />
        <MetricCard
          title="Continuity critical risk"
          value={summary.highContinuityRiskCount}
          icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
          change="functions lacking backup & successor"
          isPositive={summary.highContinuityRiskCount === 0}
        />
        <MetricCard
          title="Succession Depth"
          value={`${summary.functionsWithSuccessorCount} / ${summary.totalCriticalFunctions}`}
          icon={<Award className="w-5 h-5 text-emerald-400" />}
          change={`${summary.functionsWithoutSuccessorCount} lacking successor`}
        />
        <MetricCard
          title="Backup Overload alerts"
          value={summary.overloadedEmployeesCount}
          icon={<Users className="w-5 h-5 text-purple-400" />}
          change="active backups for > 2 critical roles"
          isPositive={summary.overloadedEmployeesCount === 0}
        />
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3 bg-slate-900/50 rounded-xl p-3 border border-slate-800/80 max-w-md">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          placeholder="Filter by code, role title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-[10px] text-cyan-400 hover:underline">
            Clear
          </button>
        )}
      </div>

      {/* Primary Table: Backup Coverage Matrix */}
      <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Backup Coverage Mapping
            </h3>
          </div>
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800">
            {coverageRows.length} roles mapped
          </span>
        </div>

        <div className="overflow-x-auto">
          {coverageRows.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="p-4 font-semibold uppercase text-[10px]">Role / Department</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Primary Owner</th>
                  <th className="p-4 font-semibold uppercase text-[10px] text-center">Active Backups</th>
                  <th className="p-4 font-semibold uppercase text-[10px] text-center">In Training</th>
                  <th className="p-4 font-semibold uppercase text-[10px] text-center">Proposed</th>
                  <th className="p-4 font-semibold uppercase text-[10px] text-center">Required</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {coverageRows.map(row => (
                  <tr key={row.functionId} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${row.isCritical ? "bg-amber-400" : "bg-slate-600"}`} />
                        <span className="font-mono text-cyan-400 font-bold">[{row.functionCode}]</span>
                        <span className="font-bold text-white">{row.functionName}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-snug pl-3.5">{row.organizationUnitName}</p>
                    </td>
                    <td className="p-4 text-slate-300 font-semibold">{row.primaryEmployeeName}</td>
                    <td className="p-4 text-center font-bold text-white">{row.activeBackupCount}</td>
                    <td className="p-4 text-center text-slate-400">{row.inTrainingBackupCount}</td>
                    <td className="p-4 text-center text-slate-400">{row.proposedBackupCount}</td>
                    <td className="p-4 text-center text-slate-400 font-mono font-bold">{row.requiredBackupQuantity}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        row.isFullyCovered
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {row.isFullyCovered ? "Fully Covered" : `Gap of ${row.coverageGap}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12">
              <EmptyState title="No backup coverage data" message="Adjust filters to display rows in this tenant." />
            </div>
          )}
        </div>
      </div>

      {/* Secondary Table: Succession Readiness deep-dive */}
      <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Succession Pipeline Depth
            </h3>
          </div>
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800">
            {successionRows.length} pipelines
          </span>
        </div>

        <div className="overflow-x-auto">
          {successionRows.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="p-4 font-semibold uppercase text-[10px]">Role / Unit</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Primary Operator</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Successors Depth</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Ready Succession</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {successionRows.map(row => (
                  <tr key={row.functionId} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 font-bold">[{row.functionCode}]</span>
                        <span className="font-bold text-white">{row.functionName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 font-semibold">{row.primaryEmployeeName}</td>
                    <td className="p-4">
                      {row.successionCandidateCount > 0 ? (
                        <div className="space-y-1">
                          {row.candidates.map((cand, i) => (
                            <div key={i} className="flex items-center gap-2 text-[10px] text-slate-300">
                              <span className="font-semibold text-white">{cand.employeeName}</span>
                              <span className="text-cyan-400">({cand.readinessScore}%)</span>
                              <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded border ${
                                cand.readinessLevel === "high"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }`}>
                                {cand.readinessLevel}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 font-semibold italic">No candidates mapped</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                        row.hasReadySuccessor
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {row.hasReadySuccessor ? "Successor Ready" : "Pipeline Gap"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12">
              <EmptyState title="No succession pipeline data" message="Adjust filters to display rows in this tenant." />
            </div>
          )}
        </div>
      </div>

      {/* Grid: Unit Pipelines & Multipliers / Overloads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Org Unit pipelines */}
        <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Sectors Pipeline Coverage
                </h3>
              </div>
            </div>

            <div className="p-6 divide-y divide-slate-800/50">
              {pipelineRows.length > 0 ? (
                pipelineRows.map(unit => (
                  <div key={unit.organizationUnitId} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div>
                      <p className="font-bold text-white text-xs">{unit.organizationUnitName}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {unit.totalCriticalFunctions} critical functions | {unit.totalCandidatesCount} total candidates
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-extrabold text-cyan-400 text-xs">
                        {unit.pipelineCoverageRate}% rate
                      </p>
                      <p className="text-[9px] text-emerald-400 mt-0.5 font-semibold font-mono">
                        {unit.readyCandidatesCount} ready successors
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs py-4 text-center">No pipelines configured.</p>
              )}
            </div>
          </div>
        </div>

        {/* Backup Multipliers & Overloads */}
        <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Backup Overload & Multiplier Risk
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Overload Indicators */}
              <div>
                <p className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-semibold mb-2">
                  Active Backup Overloads ({overloadIndicators.filter(o => o.isOverloaded).length})
                </p>
                {overloadIndicators.filter(o => o.isOverloaded).length > 0 ? (
                  <div className="space-y-1.5">
                    {overloadIndicators.filter(o => o.isOverloaded).map((indicator, i) => (
                      <div key={i} className="text-xs flex items-center justify-between bg-rose-500/10 p-2.5 rounded border border-rose-500/20">
                        <span className="text-white font-semibold">{indicator.employeeName}</span>
                        <span className="text-rose-400 font-mono text-[10px] font-bold">
                          Backing up {indicator.activeBackupCount} critical functions!
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-emerald-400 text-[11px] font-semibold">0 backup overload alerts detected.</p>
                )}
              </div>

              {/* Multipliers */}
              <div className="pt-2">
                <p className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-semibold mb-2">
                  Backup Multipliers ({backupMultipliers.length})
                </p>
                {backupMultipliers.length > 0 ? (
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-2">
                    {backupMultipliers.map((multiplier, i) => (
                      <div key={i} className="text-xs flex items-center justify-between bg-slate-900/40 p-2.5 rounded border border-slate-800/30">
                        <div>
                          <p className="text-white font-semibold leading-none">{multiplier.employeeName}</p>
                          <p className="text-[9px] text-slate-500 mt-1 uppercase font-mono">Department: {multiplier.organizationUnitName}</p>
                        </div>
                        <span className="text-amber-400 font-mono font-bold text-[10px] bg-amber-400/5 px-2 py-0.5 border border-amber-400/20 rounded">
                          {multiplier.criticalFunctionIds.length} roles
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-[11px] italic">0 backup multipliers on record.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continuity Risk Overview */}
      <div className="space-y-4 pt-4">
        <h2 className="text-base font-bold text-white tracking-wide border-l-[3px] border-amber-400 pl-3 uppercase font-mono">
          Continuity Risk Indicators
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {continuityRisks.map(risk => (
            <div key={risk.functionId} className="bg-white/[0.03] rounded-2xl border border-slate-800 p-6 flex flex-col justify-between group transition-all hover:border-slate-700">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-cyan-400 font-bold text-[10px]">[{risk.functionCode}]</span>
                  {getRiskLevelBadge(risk.riskLevel)}
                </div>
                <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-400">{risk.functionName}</h4>
                <p className="text-[10px] text-slate-500 mt-1">{risk.organizationUnitName}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Active Validated Backup:</span>
                  <span className={`font-bold ${risk.hasActiveBackup ? "text-emerald-400" : "text-rose-400"}`}>
                    {risk.hasActiveBackup ? "YES" : "NO"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Succession Candidate:</span>
                  <span className={`font-bold ${risk.hasSuccessor ? "text-emerald-400" : "text-rose-400"}`}>
                    {risk.hasSuccessor ? "YES" : "NO"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

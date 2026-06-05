import React, { useState } from "react";
import { AlertTriangle, Shield, Search, Award, Activity, FileText, CheckCircle, Users, Layers } from "lucide-react";
import { MetricCard } from "../../components/ui/MetricCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { usePeopleDataset } from "../../app/data/usePeopleDataset";

import {
  getCriticalFunctionsByTenant,
  getCriticalityLevelDistribution,
  getFunctionsWithoutActivePrimaryEmployee,
  getFunctionsWithoutValidatedBackup,
  getFunctionsWithoutSuccessionCandidate,
  getFunctionsWithoutKnowledgeAsset,
  getFunctionsWithoutEvidenceRecord,
  getHighExposureCriticalFunctions,
  getCriticalFunctionsSummaryDashboardData
} from "../../features/critical-functions/selectors";

export const CriticalFunctionsPage: React.FC = () => {
  const { dataset, tenants } = usePeopleDataset();
  const DEMO_EMPLOYEES = dataset.employees;
  const DEMO_FUNCTIONS = dataset.functions;
  const DEMO_ASSIGNMENTS = dataset.assignments;
  const DEMO_BACKUPS = dataset.backups;
  const DEMO_SUCCESSORS = dataset.successors;
  const DEMO_ASSETS = dataset.assets;
  const DEMO_EVIDENCES = dataset.evidences;
  const DEMO_SNAPSHOTS = dataset.snapshots;
  const DEMO_CF_ASSESSMENTS = dataset.assessments;
  // Tenant switcher state
  const [selectedTenant, setSelectedTenant] = useState<string>(dataset.tenantId);
  // Search query state
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filters = {
    tenantId: selectedTenant,
    search: searchQuery || undefined
  };

  // Hydrate selectors
  const summary = getCriticalFunctionsSummaryDashboardData(
    DEMO_FUNCTIONS,
    DEMO_CF_ASSESSMENTS,
    DEMO_EMPLOYEES,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_SUCCESSORS,
    DEMO_ASSETS,
    DEMO_EVIDENCES,
    DEMO_SNAPSHOTS,
    { tenantId: selectedTenant }
  );

  const distribution = getCriticalityLevelDistribution(
    DEMO_CF_ASSESSMENTS,
    { tenantId: selectedTenant }
  );

  const criticalFuncs = getCriticalFunctionsByTenant(
    DEMO_FUNCTIONS,
    DEMO_CF_ASSESSMENTS,
    DEMO_EMPLOYEES,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_SUCCESSORS,
    DEMO_ASSETS,
    DEMO_EVIDENCES,
    DEMO_SNAPSHOTS,
    filters
  );

  const withoutPrimary = getFunctionsWithoutActivePrimaryEmployee(
    DEMO_FUNCTIONS,
    DEMO_CF_ASSESSMENTS,
    DEMO_EMPLOYEES,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_SUCCESSORS,
    DEMO_ASSETS,
    DEMO_EVIDENCES,
    DEMO_SNAPSHOTS,
    filters
  );

  const withoutBackup = getFunctionsWithoutValidatedBackup(
    DEMO_FUNCTIONS,
    DEMO_CF_ASSESSMENTS,
    DEMO_EMPLOYEES,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_SUCCESSORS,
    DEMO_ASSETS,
    DEMO_EVIDENCES,
    DEMO_SNAPSHOTS,
    filters
  );

  const withoutSuccessor = getFunctionsWithoutSuccessionCandidate(
    DEMO_FUNCTIONS,
    DEMO_CF_ASSESSMENTS,
    DEMO_EMPLOYEES,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_SUCCESSORS,
    DEMO_ASSETS,
    DEMO_EVIDENCES,
    DEMO_SNAPSHOTS,
    filters
  );

  const withoutKnowledge = getFunctionsWithoutKnowledgeAsset(
    DEMO_FUNCTIONS,
    DEMO_CF_ASSESSMENTS,
    DEMO_EMPLOYEES,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_SUCCESSORS,
    DEMO_ASSETS,
    DEMO_EVIDENCES,
    DEMO_SNAPSHOTS,
    filters
  );

  const withoutEvidence = getFunctionsWithoutEvidenceRecord(
    DEMO_FUNCTIONS,
    DEMO_CF_ASSESSMENTS,
    DEMO_EMPLOYEES,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_SUCCESSORS,
    DEMO_ASSETS,
    DEMO_EVIDENCES,
    DEMO_SNAPSHOTS,
    filters
  );

  const highExposure = getHighExposureCriticalFunctions(
    DEMO_FUNCTIONS,
    DEMO_CF_ASSESSMENTS,
    DEMO_EMPLOYEES,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_SUCCESSORS,
    DEMO_ASSETS,
    DEMO_EVIDENCES,
    DEMO_SNAPSHOTS,
    filters
  );

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full uppercase border border-amber-400/20 select-none">
            Operational Risk Pillar
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight pt-2">
            Funções Críticas
          </h1>
          <p className="text-xs text-slate-400">
            Identify operational critical functions, trace competence exposure, and monitor risk mitigations.
          </p>
        </div>

        {/* Tenant Switcher Widget */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-2xl border border-slate-800">
          <Shield className="w-4 h-4 text-amber-400 shrink-0" />
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

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Critical assessed"
          value={summary.criticalFunctionsCount}
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          change={`${summary.totalFunctions} total mapped functions`}
        />
        <MetricCard
          title="High Exposure Functions"
          value={summary.highExposureCount}
          icon={<Activity className="w-5 h-5 text-rose-400" />}
          change="requires immediate action plans"
          isPositive={summary.highExposureCount === 0}
        />
        <MetricCard
          title="Avg Vulnerability score"
          value={`${summary.averageVulnerabilityScore}%`}
          icon={<Award className="w-5 h-5 text-cyan-400" />}
        />
        <MetricCard
          title="Criticality Distribution"
          value={`C: ${distribution.criticalCount} | H: ${distribution.highCount}`}
          icon={<Layers className="w-5 h-5 text-purple-400" />}
          change={`M: ${distribution.mediumCount} | L: ${distribution.lowCount}`}
        />
      </div>

      {/* Filter and Search Box */}
      <div className="flex items-center gap-3 bg-slate-900/50 rounded-xl p-3 border border-slate-800/80 max-w-md">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          placeholder="Search by code, function name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-[10px] text-amber-400 hover:underline">
            Clear
          </button>
        )}
      </div>

      {/* Primary Analytics Table: Funções Críticas List */}
      <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Operational Funções Críticas Matrix
            </h3>
          </div>
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800">
            {criticalFuncs.length} entries
          </span>
        </div>

        <div className="overflow-x-auto">
          {criticalFuncs.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="p-4 font-semibold uppercase text-[10px]">Code / Name</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Primary Operator</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Backups (Active/Tot)</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Successors</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">ISO Proof</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Exposure Score</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {criticalFuncs.map(row => (
                  <tr key={row.functionId} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${row.isCritical ? "bg-amber-400" : "bg-slate-600"}`} />
                        <span className="font-mono text-cyan-400 font-bold">[{row.code}]</span>
                        <span className="font-bold text-white">{row.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-snug pl-3.5">{row.description}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        row.primaryEmployeeName === "None"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-slate-900 border border-slate-800 text-slate-200"
                      }`}>
                        {row.primaryEmployeeName}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-300 font-bold">{row.validatedBackupCount}</span>
                      <span className="text-slate-500"> / {row.backupEmployeeCount}</span>
                    </td>
                    <td className="p-4 text-slate-300 font-semibold">{row.successionCandidateCount} candidates</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-mono ${row.hasKnowledgeAsset ? "text-emerald-400" : "text-rose-400"}`}>
                          SOP: {row.hasKnowledgeAsset ? "YES" : "NO"}
                        </span>
                        <span className={`text-[10px] font-mono ${row.hasEvidenceRecord ? "text-emerald-400" : "text-rose-400"}`}>
                          ISO: {row.hasEvidenceRecord ? "YES" : "NO"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-extrabold text-slate-200">{row.exposureScore}%</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        row.isHighExposure
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {row.isHighExposure ? "High Exposure" : "Monitored"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12">
              <EmptyState
                title="No critical functions found"
                message="Adjust filters or query to display assessed roles in this isolated tenant."
              />
            </div>
          )}
        </div>
      </div>

      {/* Structural Gaps / Risks Grid */}
      <div className="space-y-4 pt-4">
        <h2 className="text-base font-bold text-white tracking-wide border-l-[3px] border-amber-400 pl-3 uppercase font-mono">
          Identified Operational Gaps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Missing primary operator */}
          <div className="bg-white/[0.03] rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-400 mb-3">
                <Users className="w-5 h-5" />
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono">Missing Primary Owners</h4>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Critical functions running without active assigned primary operators represent immediate workplace halts.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800">
              {withoutPrimary.length > 0 ? (
                <div className="space-y-2">
                  {withoutPrimary.map(f => (
                    <div key={f.functionId} className="flex items-center justify-between text-xs">
                      <span className="text-white font-semibold truncate">{f.name}</span>
                      <span className="text-rose-400 font-mono text-[10px]">[{f.code}]</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-emerald-400 text-xs font-semibold">100% Owner coverage compliant.</p>
              )}
            </div>
          </div>

          {/* Missing validated backup */}
          <div className="bg-white/[0.03] rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-400 mb-3">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono">Missing Validated Backups</h4>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Critical functions with zero active validated backup operators are vulnerable to immediate single-point-of-failure.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800">
              {withoutBackup.length > 0 ? (
                <div className="space-y-2">
                  {withoutBackup.map(f => (
                    <div key={f.functionId} className="flex items-center justify-between text-xs">
                      <span className="text-white font-semibold truncate">{f.name}</span>
                      <span className="text-rose-400 font-mono text-[10px]">[{f.code}]</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-emerald-400 text-xs font-semibold">100% backup qualification compliant.</p>
              )}
            </div>
          </div>

          {/* Missing knowledge or evidence */}
          <div className="bg-white/[0.03] rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-400 mb-3">
                <FileText className="w-5 h-5" />
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono">Audit Tracing Gaps</h4>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Critical functions missing documented SOP guides or validated compliance evidence face audit failures.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Missing SOP Guides:</span>
                <span className={`font-bold ${withoutKnowledge.length > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {withoutKnowledge.length} functions
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Missing ISO Evidence:</span>
                <span className={`font-bold ${withoutEvidence.length > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {withoutEvidence.length} functions
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

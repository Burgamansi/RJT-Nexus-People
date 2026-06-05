import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Shield,
  Layers,
  Award,
  AlertTriangle,
  AlertCircle,
  Briefcase,
  Clock,
  CheckCircle2,
  FileText
} from "lucide-react";
import { MetricCard } from "../../components/ui/MetricCard";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  DEMO_TENANTS,
  DEMO_ASSETS,
  DEMO_FUNCTIONS,
  DEMO_UNITS,
  DEMO_EVIDENCES,
  DEMO_EMPLOYEES,
  DEMO_OJTS
} from "../../app/data/peopleDemoDataset";

import {
  getKnowledgeAssetsByTenant,
  getKnowledgeCoverageByFunction,
  getKnowledgeCoverageByOrgUnit,
  getFunctionsWithoutKnowledgeAssets,
  getCriticalFunctionsWithoutKnowledgeAssets,
  getOutdatedKnowledgeAssets,
  getKnowledgeAssetsWithoutEvidence,
  getKnowledgeGapIndicators,
  getKnowledgeHubSummaryDashboardData
} from "../../features/knowledge-hub/selectors";

export const KnowledgeHubPage: React.FC = () => {
  // Tenant switcher state
  const [selectedTenant, setSelectedTenant] = useState<string>("tenant_ubg");
  // Search query state
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filters = {
    tenantId: selectedTenant,
    search: searchQuery || undefined
  };

  // Hydrate selectors
  const summary = getKnowledgeHubSummaryDashboardData(
    DEMO_ASSETS,
    DEMO_FUNCTIONS,
    DEMO_UNITS,
    DEMO_EVIDENCES,
    DEMO_EMPLOYEES,
    DEMO_OJTS,
    { tenantId: selectedTenant }
  );

  const assetRows = getKnowledgeAssetsByTenant(
    DEMO_ASSETS,
    DEMO_FUNCTIONS,
    DEMO_UNITS,
    DEMO_EVIDENCES,
    filters
  );

  const coverageRows = getKnowledgeCoverageByFunction(
    DEMO_FUNCTIONS,
    DEMO_ASSETS,
    DEMO_EMPLOYEES,
    DEMO_OJTS,
    DEMO_UNITS,
    filters
  );

  const orgUnitCoverageRows = getKnowledgeCoverageByOrgUnit(
    DEMO_FUNCTIONS,
    DEMO_ASSETS,
    DEMO_EMPLOYEES,
    DEMO_OJTS,
    DEMO_UNITS,
    filters
  );

  const functionsWithoutAsset = getFunctionsWithoutKnowledgeAssets(
    DEMO_FUNCTIONS,
    DEMO_ASSETS,
    filters
  );

  const criticalFunctionsWithoutAsset = getCriticalFunctionsWithoutKnowledgeAssets(
    DEMO_FUNCTIONS,
    DEMO_ASSETS,
    filters
  );

  const outdatedAssets = getOutdatedKnowledgeAssets(
    DEMO_ASSETS,
    DEMO_FUNCTIONS,
    DEMO_UNITS,
    DEMO_EVIDENCES,
    filters
  );

  const assetsWithoutEvidence = getKnowledgeAssetsWithoutEvidence(
    DEMO_ASSETS,
    DEMO_FUNCTIONS,
    DEMO_UNITS,
    DEMO_EVIDENCES,
    filters
  );

  const gapIndicators = getKnowledgeGapIndicators(
    DEMO_FUNCTIONS,
    DEMO_ASSETS,
    DEMO_EMPLOYEES,
    DEMO_OJTS,
    DEMO_UNITS,
    DEMO_EVIDENCES,
    filters
  );

  const getRiskBadge = (level: "high_knowledge_loss_risk" | "medium" | "low") => {
    switch (level) {
      case "high_knowledge_loss_risk":
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
            HIGH LOSS RISK
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            MEDIUM RISK
          </span>
        );
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            SECURE
          </span>
        );
    }
  };

  const getGapBadge = (type: string) => {
    switch (type) {
      case "high_knowledge_loss_risk":
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Loss Risk
          </span>
        );
      case "critical_function_without_knowledge_asset":
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-600/25 text-rose-500 border border-rose-600/30">
            Critical Vacant SOP
          </span>
        );
      case "function_without_knowledge_asset":
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/25">
            Missing SOP
          </span>
        );
      case "outdated_knowledge_asset":
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
            Outdated Asset
          </span>
        );
      case "knowledge_asset_without_evidence":
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Missing Evidence
          </span>
        );
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/20">
            Gap
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
            PDCA Ação 01 · 04 · ISO 7.1.6 · 8.5.1
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight pt-2">
            Base de Conhecimento
          </h1>
          <p className="text-xs text-slate-400">
            Document operational know-how, trace standard operating procedures (SOP), and safeguard organizational continuity against knowledge loss.
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
            {DEMO_TENANTS.map(t => (
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
          title="Knowledge Health Index"
          value={`${summary.knowledgeBaseHealthScore}%`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          change="SOPs active & validated by ISO"
        />
        <MetricCard
          title="Total SOP Assets"
          value={summary.totalKnowledgeAssets}
          icon={<BookOpen className="w-5 h-5 text-cyan-400" />}
          change={`${summary.outdatedAssetsCount} outdated SOPs`}
          isPositive={summary.outdatedAssetsCount === 0}
        />
        <MetricCard
          title="Continuity Asset Gaps"
          value={`${summary.criticalFunctionsWithoutAssetCount} / ${summary.functionsWithoutAssetCount}`}
          icon={<AlertCircle className="w-5 h-5 text-rose-400" />}
          change="critical functions missing SOPs"
          isPositive={summary.criticalFunctionsWithoutAssetCount === 0}
        />
        <MetricCard
          title="Validation Audit Risks"
          value={summary.highKnowledgeLossRiskCount}
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          change="roles lacking SOP and backup"
          isPositive={summary.highKnowledgeLossRiskCount === 0}
        />
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-3 bg-slate-900/50 rounded-xl p-3 border border-slate-800/80 max-w-md">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          placeholder="Filter SOP by title, code, function..."
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

      {/* Primary Table: Mapped Knowledge Assets */}
      <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Documented SOP Assets
            </h3>
          </div>
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800">
            {assetRows.length} assets active
          </span>
        </div>

        <div className="overflow-x-auto">
          {assetRows.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="p-4 font-semibold uppercase text-[10px]">SOP Code / Title</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Linked Function</th>
                  <th className="p-4 font-semibold uppercase text-[10px] text-center">Last Review</th>
                  <th className="p-4 font-semibold uppercase text-[10px] text-center">ISO Evidence</th>
                  <th className="p-4 font-semibold uppercase text-[10px] text-center">Revision State</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">ISO Validated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {assetRows.map(row => (
                  <tr key={row.assetId} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 font-bold">[{row.code}]</span>
                        <span className="font-bold text-white">{row.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 pl-16">{row.organizationUnitName}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {row.isCritical && (
                          <span className="px-1.5 py-0.2 rounded border bg-rose-500/10 border-rose-500/20 text-[8px] font-mono font-bold text-rose-400 uppercase select-none">
                            CRITICAL
                          </span>
                        )}
                        <span className="font-semibold text-slate-200">{row.functionName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center font-mono text-slate-400">{row.lastReviewedAt || "Never reviewed"}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        row.hasEvidence
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {row.hasEvidence ? "Evidence Linked" : "Missing Evidence"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                        !row.isOutdated
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {!row.isOutdated ? "Up to date" : "Needs Review"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                        row.evidenceStatus === "validated"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {row.evidenceStatus || "Missing"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12">
              <EmptyState title="No knowledge assets found" message="Adjust filters to search rows within this isolated tenant." />
            </div>
          )}
        </div>
      </div>

      {/* Secondary Table: Knowledge Coverage by Function */}
      <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Knowledge Continuity Coverage by Operational Function
            </h3>
          </div>
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800">
            {coverageRows.length} functions evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          {coverageRows.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="p-4 font-semibold uppercase text-[10px]">Function / Unit</th>
                  <th className="p-4 font-semibold uppercase text-[10px] text-center">Criticality</th>
                  <th className="p-4 font-semibold uppercase text-[10px] text-center">SOP Asset Count</th>
                  <th className="p-4 font-semibold uppercase text-[10px] text-center">Trained personnel Mapped</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Risk State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {coverageRows.map(row => (
                  <tr key={row.functionId} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 font-bold">[{row.functionCode}]</span>
                        <span className="font-bold text-white">{row.functionName}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 pl-16">{row.organizationUnitName}</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        row.isCritical
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-slate-900 text-slate-500 border-slate-800"
                      }`}>
                        {row.isCritical ? "Critical" : "Standard"}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-white">{row.assetCount} SOPs</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        row.hasTrainedOrOjtEmployee
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {row.hasTrainedOrOjtEmployee ? "Personnel Active" : "No Active Operator"}
                      </span>
                    </td>
                    <td className="p-4">
                      {getRiskBadge(row.riskLevel)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12">
              <EmptyState title="No coverage data" message="Adjust filters to search rows within this isolated tenant." />
            </div>
          )}
        </div>
      </div>

      {/* Grid: Unit Coverage & Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Org Unit Knowledge Coverage */}
        <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Sectors Knowledge Coverage
                </h3>
              </div>
            </div>

            <div className="p-6 divide-y divide-slate-800/50">
              {orgUnitCoverageRows.length > 0 ? (
                orgUnitCoverageRows.map(unit => (
                  <div key={unit.organizationUnitId} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                    <div>
                      <p className="font-bold text-white text-xs">{unit.organizationUnitName}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {unit.totalFunctions} functions | {unit.functionsWithAssetCount} SOP documented | {unit.highKnowledgeLossRiskCount} high risk indicators
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="font-mono font-extrabold text-cyan-400 text-xs">
                        {unit.knowledgeCoverageRate}% rate
                      </p>
                      {unit.highKnowledgeLossRiskCount > 0 && (
                        <p className="text-[9px] text-rose-400 mt-1 font-semibold font-mono animate-pulse uppercase">
                          {unit.highKnowledgeLossRiskCount} Loss Alert
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs py-4 text-center">No sectors found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Alert lists: Missing critical SOP, outdated assets, and assets without evidence */}
        <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Critical Knowledge Base Warnings
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Critical functions missing SOPs */}
              <div>
                <p className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-semibold mb-2">
                  Critical Functions Lacking SOP Document ({criticalFunctionsWithoutAsset.length})
                </p>
                {criticalFunctionsWithoutAsset.length > 0 ? (
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                    {criticalFunctionsWithoutAsset.map(func => (
                      <div key={func.id} className="text-xs flex items-center justify-between bg-rose-500/10 p-2.5 rounded border border-rose-500/20">
                        <span className="text-white font-semibold">[{func.code}] {func.name}</span>
                        <span className="text-rose-400 font-mono text-[9px] font-bold uppercase bg-rose-400/5 px-2 py-0.5 border border-rose-400/20 rounded shrink-0">
                          Vacant SOP
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-emerald-400 text-[11px] font-semibold">0 critical functions missing SOP assets.</p>
                )}
              </div>

              {/* SOPs lacking evidence validation */}
              <div className="pt-2">
                <p className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-semibold mb-2">
                  SOPs Lacking ISO Evidence Validation ({assetsWithoutEvidence.length})
                </p>
                {assetsWithoutEvidence.length > 0 ? (
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                    {assetsWithoutEvidence.map(row => (
                      <div key={row.assetId} className="text-xs flex items-center justify-between bg-purple-500/10 p-2.5 rounded border border-purple-500/20">
                        <span className="text-white font-semibold">[{row.code}] {row.title}</span>
                        <span className="text-purple-400 font-mono text-[9px] font-bold uppercase bg-purple-500/5 px-2 py-0.5 border border-purple-500/20 rounded shrink-0">
                          No ISO Proof
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-[11px] italic">0 active SOPs lacking validated ISO evidence.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continuity / SOP Knowledge Gaps */}
      <div className="space-y-4 pt-4">
        <h2 className="text-base font-bold text-white tracking-wide border-l-[3px] border-[#00E7F8] pl-3 uppercase font-mono">
          Knowledge Base & Audit Gaps
        </h2>
        {gapIndicators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gapIndicators.map((gap, idx) => (
              <div key={idx} className="bg-white/[0.03] rounded-2xl border border-slate-800 p-6 flex flex-col justify-between group transition-all hover:border-slate-750">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-cyan-400 font-bold text-[10px]">{gap.organizationUnitName}</span>
                    {getGapBadge(gap.gapType)}
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug group-hover:text-cyan-400">
                    {gap.assetTitle || gap.functionName}
                  </h4>
                  {gap.assetTitle && (
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono">Linked Function: {gap.functionName}</p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <p className="text-[10px] text-slate-300 leading-snug italic">
                    "{gap.description}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-8 text-center text-xs text-slate-400">
            ✔ 0 knowledge base or audit gaps identified in this tenant!
          </div>
        )}
      </div>
    </div>
  );
};

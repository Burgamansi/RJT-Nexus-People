import React, { useState } from "react";
import {
  Shield,
  Search,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  FileText,
  Users,
  Briefcase,
  Layers,
  ExternalLink,
  Clock,
  ThumbsDown,
  FolderOpen
} from "lucide-react";
import { MetricCard } from "../../components/ui/MetricCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { usePeopleDataset } from "../../app/data/usePeopleDataset";
import { EvidenceStatus } from "../../shared/domain/people/enums";

import {
  getEvidenceRecordsByTenant,
  getEvidenceRecordsByStatus,
  getEvidenceRecordsByFunction,
  getEvidenceRecordsByOrgUnit,
  getEvidenceRecordsLinkedToEmployees,
  getPendingEvidenceRecords,
  getRejectedEvidenceRecords,
  getExpiredOrOutdatedEvidenceRecords,
  getMissingEvidenceForCriticalFunctions,
  getMissingEvidenceForTrainingOjt,
  getMissingEvidenceForBackupValidation,
  getEvidenceAuditSummaryDashboardData
} from "../../features/evidence-center/selectors";

export const EvidenceCenterPage: React.FC = () => {
  const { dataset, tenants } = usePeopleDataset();
  const DEMO_EVIDENCES = dataset.evidences;
  const DEMO_EMPLOYEES = dataset.employees;
  const DEMO_UNITS = dataset.units;
  const DEMO_FUNCTIONS = dataset.functions;
  const DEMO_ASSETS = dataset.assets;
  const DEMO_OJTS = dataset.ojts;
  const DEMO_BACKUPS = dataset.backups;
  // Tenant switcher state
  const [selectedTenant, setSelectedTenant] = useState<string>(dataset.tenantId);
  // Search query state
  const [searchQuery, setSearchQuery] = useState<string>("");
  // Quick status tab state
  const [activeTab, setActiveTab] = useState<EvidenceStatus | "all" | "expired_outdated" | "missing_evidence">("all");

  const filters = {
    tenantId: selectedTenant,
    search: searchQuery || undefined
  };

  // Hydrate selectors
  const summary = getEvidenceAuditSummaryDashboardData(
    DEMO_EVIDENCES,
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_FUNCTIONS,
    DEMO_ASSETS,
    DEMO_OJTS,
    DEMO_BACKUPS,
    { tenantId: selectedTenant }
  );

  const evidenceRows = getEvidenceRecordsByTenant(
    DEMO_EVIDENCES,
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_FUNCTIONS,
    DEMO_ASSETS,
    filters
  );

  const pendingEvidence = getPendingEvidenceRecords(
    DEMO_EVIDENCES,
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_FUNCTIONS,
    DEMO_ASSETS,
    filters
  );

  const rejectedEvidence = getRejectedEvidenceRecords(
    DEMO_EVIDENCES,
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_FUNCTIONS,
    DEMO_ASSETS,
    filters
  );

  const expiredOrOutdatedEvidence = getExpiredOrOutdatedEvidenceRecords(
    DEMO_EVIDENCES,
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_FUNCTIONS,
    DEMO_ASSETS,
    filters
  );

  // Missing Evidence Selectors
  const missingCriticalFunctions = getMissingEvidenceForCriticalFunctions(
    DEMO_FUNCTIONS,
    DEMO_EVIDENCES,
    DEMO_UNITS,
    filters
  );

  const missingTrainingOjt = getMissingEvidenceForTrainingOjt(
    DEMO_EMPLOYEES,
    DEMO_OJTS,
    DEMO_FUNCTIONS,
    DEMO_UNITS,
    DEMO_EVIDENCES,
    filters
  );

  const missingBackup = getMissingEvidenceForBackupValidation(
    DEMO_EMPLOYEES,
    DEMO_BACKUPS,
    DEMO_FUNCTIONS,
    DEMO_UNITS,
    DEMO_EVIDENCES,
    filters
  );

  const combinedMissingEvidence = [
    ...missingCriticalFunctions,
    ...missingTrainingOjt,
    ...missingBackup
  ];

  const getStatusBadge = (status: EvidenceStatus) => {
    switch (status) {
      case EvidenceStatus.VALIDATED:
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Validated
          </span>
        );
      case EvidenceStatus.REJECTED:
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Pending
          </span>
        );
    }
  };

  const getMissingBadge = (type: string) => {
    switch (type) {
      case "critical_function":
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Critical SOP Gap
          </span>
        );
      case "training_ojt":
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
            OJT Proof Gap
          </span>
        );
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
            Backup Proof Gap
          </span>
        );
    }
  };

  const getFilteredRows = () => {
    if (activeTab === "all") return evidenceRows;
    if (activeTab === "expired_outdated") return expiredOrOutdatedEvidence;
    if (activeTab === "missing_evidence") return [];
    return evidenceRows.filter(r => r.status === activeTab);
  };

  const filteredRows = getFilteredRows();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full uppercase border border-cyan-500/20 select-none">
            PDCA · ISO 9.1 · Rastreabilidade
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight pt-2">
            Central de Evidências
          </h1>
          <p className="text-xs text-slate-400">
            Audit compliance proof records, trace qualification signatures, manage verification status queues, and track audit readiness scores.
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
          title="Audit Readiness Score"
          value={`${summary.auditReadinessScore}%`}
          icon={<Shield className="w-5 h-5 text-emerald-400" />}
          change="validated proofs vs expected count"
        />
        <MetricCard
          title="Validation Backlog"
          value={summary.pendingCount}
          icon={<Clock className="w-5 h-5 text-cyan-400" />}
          change="proof records awaiting audit review"
          isPositive={summary.pendingCount === 0}
        />
        <MetricCard
          title="Rejected Proof Records"
          value={summary.rejectedCount}
          icon={<ThumbsDown className="w-5 h-5 text-rose-400" />}
          change="failed verification audits"
          isPositive={summary.rejectedCount === 0}
        />
        <MetricCard
          title="Missing Audit Evidence"
          value={summary.criticalMissingCount + expiredOrOutdatedEvidence.length}
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          change="critical SOP or expired document gaps"
          isPositive={summary.criticalMissingCount === 0}
        />
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3 bg-slate-900/50 rounded-xl p-3 border border-slate-800/80 max-w-md">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          placeholder="Filter audit proof by employee, unit, function..."
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

      {/* Quick Filter Status Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl border transition-all ${
            activeTab === "all"
              ? "bg-cyan-500/10 text-cyan-400 border-[#00E7F8]/30"
              : "bg-slate-900/40 text-slate-400 border-transparent hover:text-white"
          }`}
        >
          All Proof ({evidenceRows.length})
        </button>
        <button
          onClick={() => setActiveTab(EvidenceStatus.VALIDATED)}
          className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl border transition-all ${
            activeTab === EvidenceStatus.VALIDATED
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-slate-900/40 text-slate-400 border-transparent hover:text-white"
          }`}
        >
          Validated ({summary.validatedCount})
        </button>
        <button
          onClick={() => setActiveTab(EvidenceStatus.PENDING)}
          className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl border transition-all ${
            activeTab === EvidenceStatus.PENDING
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
              : "bg-slate-900/40 text-slate-400 border-transparent hover:text-white"
          }`}
        >
          Pending Queue ({summary.pendingCount})
        </button>
        <button
          onClick={() => setActiveTab(EvidenceStatus.REJECTED)}
          className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl border transition-all ${
            activeTab === EvidenceStatus.REJECTED
              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
              : "bg-slate-900/40 text-slate-400 border-transparent hover:text-white"
          }`}
        >
          Rejected ({summary.rejectedCount})
        </button>
        <button
          onClick={() => setActiveTab("expired_outdated")}
          className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl border transition-all ${
            activeTab === "expired_outdated"
              ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
              : "bg-slate-900/40 text-slate-400 border-transparent hover:text-white"
          }`}
        >
          Expired/Outdated ({expiredOrOutdatedEvidence.length})
        </button>
        <button
          onClick={() => setActiveTab("missing_evidence")}
          className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl border transition-all ${
            activeTab === "missing_evidence"
              ? "bg-rose-600/10 text-rose-400 border-rose-600/30 animate-pulse"
              : "bg-slate-900/40 text-slate-400 border-transparent hover:text-white"
          }`}
        >
          Missing Audit Proof ({combinedMissingEvidence.length})
        </button>
      </div>

      {activeTab !== "missing_evidence" ? (
        /* Primary Evidence Records List */
        <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Audit Evidence Ledger
              </h3>
            </div>
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800">
              {filteredRows.length} audit sheets loaded
            </span>
          </div>

          <div className="overflow-x-auto">
            {filteredRows.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="p-4 font-semibold uppercase text-[10px]">Employee / Department</th>
                    <th className="p-4 font-semibold uppercase text-[10px]">Linked Scope (Function/Asset)</th>
                    <th className="p-4 font-semibold uppercase text-[10px]">Document Link</th>
                    <th className="p-4 font-semibold uppercase text-[10px] text-center">Uploaded</th>
                    <th className="p-4 font-semibold uppercase text-[10px] text-center">Expiration</th>
                    <th className="p-4 font-semibold uppercase text-[10px] text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRows.map(row => (
                    <tr key={row.evidenceId} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-white leading-none">{row.employeeName}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{row.organizationUnitName}</p>
                      </td>
                      <td className="p-4">
                        {row.functionName && (
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="font-semibold text-slate-200">{row.functionName}</span>
                          </div>
                        )}
                        {row.knowledgeAssetTitle && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="text-[10px] text-slate-400 italic font-medium">{row.knowledgeAssetTitle}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <a
                          href={row.evidenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <span>View Proof Document</span>
                        </a>
                      </td>
                      <td className="p-4 text-center font-mono text-slate-400">{row.uploadedAt || "—"}</td>
                      <td className="p-4 text-center font-mono">
                        {row.expiresAt ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={row.isExpired ? "text-rose-400 font-bold" : "text-slate-400"}>
                              {row.expiresAt}
                            </span>
                            {row.isExpired && (
                              <span className="inline-flex px-1 py-0.2 rounded border bg-rose-500/10 text-rose-400 border-rose-500/20 text-[8px] font-mono font-bold animate-pulse">
                                EXPIRED
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500">Continuous Validation</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {getStatusBadge(row.status)}
                          {row.isOutdated && !row.isExpired && (
                            <span className="inline-flex px-1.5 py-0.2 rounded border bg-amber-500/10 text-amber-400 border-amber-500/20 text-[8px] font-mono font-bold">
                              OUTDATED
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12">
                <EmptyState title="No evidence records found" message="Adjust filters to search rows within this isolated tenant." />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Expected Gaps & Missing Evidence Lists */
        <div className="space-y-8">
          {/* Missing critical proof list */}
          <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Lacking / Missing Audit Proof Records
                </h3>
              </div>
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-rose-400 border border-rose-500/20 font-bold">
                {combinedMissingEvidence.length} compliance gaps
              </span>
            </div>

            <div className="overflow-x-auto">
              {combinedMissingEvidence.length > 0 ? (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono">
                      <th className="p-4 font-semibold uppercase text-[10px]">Target Scope / Unit</th>
                      <th className="p-4 font-semibold uppercase text-[10px]">Type</th>
                      <th className="p-4 font-semibold uppercase text-[10px]">Associated employee</th>
                      <th className="p-4 font-semibold uppercase text-[10px]">Gap Context Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {combinedMissingEvidence.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{row.functionName || "General Area"}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">{row.organizationUnitName}</p>
                        </td>
                        <td className="p-4">
                          {getMissingBadge(row.missingType)}
                        </td>
                        <td className="p-4 font-semibold text-slate-200">
                          {row.employeeName || (
                            <span className="text-slate-500 font-semibold italic">Organization wide</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-300 italic">
                          "{row.description}"
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-slate-400 text-xs font-mono">
                  ✔ 0 missing evidence gaps detected! Excellent compliance validation rate.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

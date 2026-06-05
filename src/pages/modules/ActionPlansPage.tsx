import React, { useState } from "react";
import {
  Shield,
  Search,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Users,
  Briefcase,
  Layers,
  Clock,
  ThumbsDown,
  CheckSquare,
  TrendingUp,
  Filter
} from "lucide-react";
import { MetricCard } from "../../components/ui/MetricCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { usePeopleDataset } from "../../app/data/usePeopleDataset";
import { Priority, ActionStatus } from "../../shared/domain/people/enums";

import {
  getActionPlanRows,
  getActionPlansSummary,
  getActionItemRows,
  getActionOwnerRows,
  getActionSourceLinkRows,
  getActionGapRows
} from "../../features/action-plans/selectors";

export const ActionPlansPage: React.FC = () => {
  const { dataset, tenants } = usePeopleDataset();
  const DEMO_ACTION_PLANS = dataset.actionPlans;
  const DEMO_FUNCTIONS = dataset.functions;
  const DEMO_EMPLOYEES = dataset.employees;
  const DEMO_UNITS = dataset.units;
  const DEMO_EVIDENCES = dataset.evidences;
  const DEMO_SNAPSHOTS = dataset.snapshots;
  // Tenant switcher state
  const [selectedTenant, setSelectedTenant] = useState<string>(dataset.tenantId);
  // Search query state
  const [searchQuery, setSearchQuery] = useState<string>("");
  // Quick priority filters
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  // Quick status filters
  const [statusFilter, setStatusFilter] = useState<ActionStatus | "all">("all");
  // Toggle show only overdue
  const [onlyOverdue, setOnlyOverdue] = useState<boolean>(false);

  const filters = {
    tenantId: selectedTenant,
    search: searchQuery || undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    onlyOverdue: onlyOverdue || undefined
  };

  // Hydrate selectors
  const summary = getActionPlansSummary(
    DEMO_ACTION_PLANS,
    DEMO_FUNCTIONS,
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_EVIDENCES,
    DEMO_SNAPSHOTS,
    { tenantId: selectedTenant }
  );

  const actionRows = getActionPlanRows(
    DEMO_ACTION_PLANS,
    DEMO_FUNCTIONS,
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_EVIDENCES,
    DEMO_SNAPSHOTS,
    filters
  );

  const gapRows = getActionGapRows(
    DEMO_ACTION_PLANS,
    DEMO_FUNCTIONS,
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_EVIDENCES,
    DEMO_SNAPSHOTS,
    { tenantId: selectedTenant }
  );

  const ownerRows = getActionOwnerRows(
    DEMO_ACTION_PLANS,
    DEMO_FUNCTIONS,
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_EVIDENCES,
    DEMO_SNAPSHOTS,
    { tenantId: selectedTenant }
  );

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case Priority.CRITICAL:
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-rose-600/20 text-rose-400 border border-rose-600/30 animate-pulse">
            Critical
          </span>
        );
      case Priority.HIGH:
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
            High
          </span>
        );
      case Priority.MEDIUM:
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
            Low
          </span>
        );
    }
  };

  const getStatusBadge = (s: ActionStatus) => {
    switch (s) {
      case ActionStatus.COMPLETED:
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Completed
          </span>
        );
      case ActionStatus.IN_PROGRESS:
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            In progress
          </span>
        );
      case ActionStatus.CANCELLED:
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-500 border border-slate-700">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Planned
          </span>
        );
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "critical":
        return (
          <span className="inline-flex px-1.5 py-0.2 rounded border bg-rose-500/10 text-rose-400 border-rose-500/20 text-[8px] font-mono font-bold uppercase animate-pulse">
            Critical
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex px-1.5 py-0.2 rounded border bg-amber-500/10 text-amber-400 border-amber-500/20 text-[8px] font-mono font-bold uppercase">
            Warning
          </span>
        );
      default:
        return (
          <span className="inline-flex px-1.5 py-0.2 rounded border bg-slate-800 text-slate-400 border-slate-700 text-[8px] font-mono font-bold uppercase">
            Info
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
            PDCA Ação 06 · ISO 9.3 · Ciclo PDCA
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight pt-2">
            Planos de Ação (PDCA)
          </h1>
          <p className="text-xs text-slate-400">
            Manage corrective actions, track continuous workforce training programs, trace organizational knowledge creation schedules, and secure continuous improvements.
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
          title="PDCA Completion Rate"
          value={`${summary.averageCompletionRate}%`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          change={`${summary.completedActionPlans} plans completed`}
        />
        <MetricCard
          title="Active Backlog Tasks"
          value={summary.openActionPlans}
          icon={<Clock className="w-5 h-5 text-cyan-400" />}
          change={`${summary.overdueActionPlans} overdue plans`}
          isPositive={summary.overdueActionPlans === 0}
        />
        <MetricCard
          title="High Priority Backlog"
          value={summary.highPriorityActions}
          icon={<AlertCircle className="w-5 h-5 text-rose-400" />}
          change="critical or high priority actions"
          isPositive={summary.highPriorityActions === 0}
        />
        <MetricCard
          title="Process Validation Risks"
          value={summary.actionsWithoutOwner + summary.actionsWithoutEvidence}
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          change="actions missing owner or evidence"
          isPositive={summary.actionsWithoutOwner + summary.actionsWithoutEvidence === 0}
        />
      </div>

      {/* Filters Form Panel */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 space-y-4 max-w-4xl">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs font-mono uppercase tracking-wider">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>Filter Planos de Ação</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search query input */}
          <div className="flex items-center gap-3 bg-slate-900/60 rounded-xl px-3 py-2 border border-slate-800 col-span-1 md:col-span-2">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search by action title, owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-[10px] text-cyan-400 hover:underline shrink-0">
                Clear
              </button>
            )}
          </div>

          {/* Priority dropdown selector */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-xs text-white font-semibold rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value={Priority.CRITICAL}>Critical Priority</option>
            <option value={Priority.HIGH}>High Priority</option>
            <option value={Priority.MEDIUM}>Medium Priority</option>
            <option value={Priority.LOW}>Low Priority</option>
          </select>

          {/* Status dropdown selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-xs text-white font-semibold rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value={ActionStatus.PENDING}>Planned</option>
            <option value={ActionStatus.IN_PROGRESS}>In progress</option>
            <option value={ActionStatus.COMPLETED}>Completed</option>
            <option value={ActionStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyOverdue}
              onChange={(e) => setOnlyOverdue(e.target.checked)}
              className="rounded bg-slate-900 border-slate-800 text-cyan-400 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span>Show Overdue Plans Only</span>
          </label>
        </div>
      </div>

      {/* Primary Table: Planos de Ação Matrix */}
      <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Action Plan Execution Ledger
            </h3>
          </div>
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800">
            {actionRows.length} active plans listed
          </span>
        </div>

        <div className="overflow-x-auto">
          {actionRows.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="p-4 font-semibold uppercase text-[10px]">Action Plan / Context</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Linked Critical Function</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Owner / Unit</th>
                  <th className="p-4 font-semibold uppercase text-[10px] text-center">Due Date</th>
                  <th className="p-4 font-semibold uppercase text-[10px] text-center">Priority</th>
                  <th className="p-4 font-semibold uppercase text-[10px] text-center">Evidence Proofs</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {actionRows.map(row => (
                  <tr key={row.actionPlanId} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 font-bold">[{row.actionPlanId}]</span>
                        <span className="font-bold text-white">{row.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 pl-16 uppercase font-mono">Source: {row.sourceType.replace("_", " ")}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="font-semibold text-slate-200">{row.functionName}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-300">
                      <p className="font-bold text-white leading-none">{row.ownerName}</p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-none">{row.organizationUnitName}</p>
                    </td>
                    <td className="p-4 text-center font-mono">
                      {row.dueDate ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={row.isOverdue ? "text-rose-400 font-bold" : "text-slate-400"}>
                            {row.dueDate}
                          </span>
                          {row.isOverdue && (
                            <span className="inline-flex px-1.5 py-0.2 rounded border bg-rose-500/10 text-rose-400 border-rose-500/20 text-[8px] font-mono font-bold animate-pulse">
                              OVERDUE
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {getPriorityBadge(row.priority)}
                    </td>
                    <td className="p-4 text-center font-mono font-semibold text-slate-300">
                      {row.linkedEvidenceCount} documents
                    </td>
                    <td className="p-4">
                      {getStatusBadge(row.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12">
              <EmptyState title="No action plans found" message="Adjust search query or filters to show rows inside this isolated tenant." />
            </div>
          )}
        </div>
      </div>

      {/* Grid: Action Owners & Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Action Owners Summary list */}
        <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Owner Performance & Workload Backlog
                </h3>
              </div>
            </div>

            <div className="p-6 divide-y divide-slate-800/50">
              {ownerRows.length > 0 ? (
                ownerRows.map(owner => (
                  <div key={owner.employeeId} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div>
                      <p className="font-bold text-white text-xs">{owner.employeeName}</p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono">ID: {owner.employeeId}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4 space-y-1">
                      <span className="inline-flex rounded-full bg-slate-900 px-2 py-0.5 text-[9px] font-bold text-cyan-400 border border-slate-800">
                        {owner.activeActionPlansCount} Active Plans
                      </span>
                      {owner.overdueActionPlansCount > 0 && (
                        <p className="text-[9px] text-rose-400 font-bold font-mono animate-pulse uppercase">
                          {owner.overdueActionPlansCount} OVERDUE
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs py-4 text-center">No action owners active.</p>
              )}
            </div>
          </div>
        </div>

        {/* Continuous Process Improvement / Gaps */}
        <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Continuous Process Improvement Gaps
                </h3>
              </div>
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-amber-400 border border-amber-500/20 font-bold">
                {gapRows.length} process warnings
              </span>
            </div>

            <div className="p-6 divide-y divide-slate-800/50 max-h-[300px] overflow-y-auto pr-1">
              {gapRows.length > 0 ? (
                gapRows.map((gap, idx) => (
                  <div key={idx} className="py-3 flex flex-col justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                        {gap.gapType.replace("_", " ")}
                      </span>
                      {getSeverityBadge(gap.severity)}
                    </div>
                    <p className="text-[11px] text-slate-350 italic leading-snug">
                      "{gap.description}"
                    </p>
                    <p className="text-[9px] text-slate-500 mt-1 uppercase font-mono">Target: {gap.targetRecordName}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs py-4 text-center">
                  ✔ 0 continuous process improvement warnings detected!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

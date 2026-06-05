import React, { useState } from "react";
import {
  Award,
  BookOpen,
  Search,
  Shield,
  Layers,
  Users,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  FileCheck,
  HelpCircle,
  TrendingUp,
  FileText
} from "lucide-react";
import { MetricCard } from "../../components/ui/MetricCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { usePeopleDataset } from "../../app/data/usePeopleDataset";

import {
  getTrainingRowsByTenant,
  getOjtRowsByTenant,
  getCompletedTrainingsByEmployee,
  getPendingTrainingsByEmployee,
  getOverdueTrainings,
  getOjtPlansByFunction,
  getCompletedOjtByFunction,
  getEmployeesWithoutRequiredTraining,
  getEmployeesWithoutPracticalOjtValidation,
  getTrainingOjtCoverageByOrgUnit,
  getTrainingOjtGapIndicators,
  getTrainingOjtSummaryDashboardData
} from "../../features/training-ojt/selectors";

export const TrainingOJTPage: React.FC = () => {
  const { dataset, tenants } = usePeopleDataset();
  const DEMO_EMPLOYEES = dataset.employees;
  const DEMO_UNITS = dataset.units;
  const DEMO_FUNCTIONS = dataset.functions;
  const DEMO_ASSIGNMENTS = dataset.assignments;
  const DEMO_BACKUPS = dataset.backups;
  const DEMO_PROGRAMS = dataset.programs;
  const DEMO_OJTS = dataset.ojts;
  const DEMO_EVIDENCES = dataset.evidences;
  // Tenant switcher state
  const [selectedTenant, setSelectedTenant] = useState<string>(dataset.tenantId);
  // Search query state
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filters = {
    tenantId: selectedTenant,
    search: searchQuery || undefined
  };

  // Hydrate selectors
  const summary = getTrainingOjtSummaryDashboardData(
    DEMO_EMPLOYEES,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_PROGRAMS,
    DEMO_OJTS,
    DEMO_FUNCTIONS,
    DEMO_UNITS,
    DEMO_EVIDENCES,
    { tenantId: selectedTenant }
  );

  const trainingRows = getTrainingRowsByTenant(
    DEMO_EMPLOYEES,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_PROGRAMS,
    DEMO_FUNCTIONS,
    DEMO_UNITS,
    filters
  );

  const ojtRows = getOjtRowsByTenant(
    DEMO_OJTS,
    DEMO_EMPLOYEES,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_FUNCTIONS,
    DEMO_UNITS,
    DEMO_EVIDENCES,
    filters
  );

  const overdueTrainings = getOverdueTrainings(
    DEMO_EMPLOYEES,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_PROGRAMS,
    DEMO_FUNCTIONS,
    DEMO_UNITS,
    filters
  );

  const untrainedEmployees = getEmployeesWithoutRequiredTraining(
    DEMO_EMPLOYEES,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_PROGRAMS,
    DEMO_FUNCTIONS,
    DEMO_UNITS,
    { tenantId: selectedTenant }
  );

  const unvalidatedOjtEmployees = getEmployeesWithoutPracticalOjtValidation(
    DEMO_EMPLOYEES,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_OJTS,
    DEMO_FUNCTIONS,
    DEMO_UNITS,
    DEMO_EVIDENCES,
    { tenantId: selectedTenant }
  );

  const coverageRows = getTrainingOjtCoverageByOrgUnit(
    DEMO_EMPLOYEES,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_PROGRAMS,
    DEMO_OJTS,
    DEMO_FUNCTIONS,
    DEMO_UNITS,
    DEMO_EVIDENCES,
    filters
  );

  const gapIndicators = getTrainingOjtGapIndicators(
    DEMO_EMPLOYEES,
    DEMO_ASSIGNMENTS,
    DEMO_BACKUPS,
    DEMO_PROGRAMS,
    DEMO_OJTS,
    DEMO_FUNCTIONS,
    DEMO_UNITS,
    DEMO_EVIDENCES,
    filters
  );

  // Helper for gap type styling
  const getGapBadge = (type: string) => {
    switch (type) {
      case "missing_training":
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Missing Training
          </span>
        );
      case "missing_ojt":
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Missing OJT
          </span>
        );
      case "incomplete_readiness":
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
            Incomplete Readiness
          </span>
        );
      case "evidence_validation_gap":
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Evidence Pending
          </span>
        );
      case "overdue_compliance_risk":
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-600/20 text-rose-500 border border-rose-600/30">
            Overdue compliance
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

  const activeTenantEmployees = DEMO_EMPLOYEES.filter(
    emp => emp.tenantId === selectedTenant && emp.status === "active"
  );
  const activeTenantFunctions = DEMO_FUNCTIONS.filter(
    func => func.tenantId === selectedTenant
  );

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full uppercase border border-cyan-500/20 select-none">
            PDCA Ação 05 · ISO 7.2 · 7.3
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight pt-2">
            Treinamento & OJT
          </h1>
          <p className="text-xs text-slate-400">
            Manage theoretical qualification certifications, verify practical On-the-Job validations, and address compliance gaps.
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
          title="Operational Compliance"
          value={`${summary.operationalComplianceRate}%`}
          icon={<TrendingUp className="w-5 h-5 text-cyan-400" />}
          change="certified and OJT-completed roles"
        />
        <MetricCard
          title="Theoretical training"
          value={`${summary.completedTrainingsCount} / ${summary.completedTrainingsCount + summary.pendingTrainingsCount}`}
          icon={<BookOpen className="w-5 h-5 text-emerald-400" />}
          change={`${summary.overdueTrainingsCount} overdue training gaps`}
          isPositive={summary.overdueTrainingsCount === 0}
        />
        <MetricCard
          title="Practical OJT Plans"
          value={`${summary.completedOjtPlansCount} / ${summary.completedOjtPlansCount + summary.pendingOjtPlansCount}`}
          icon={<FileCheck className="w-5 h-5 text-purple-400" />}
          change={`${summary.overdueOjtPlansCount} overdue OJT tasks`}
          isPositive={summary.overdueOjtPlansCount === 0}
        />
        <MetricCard
          title="Evidence Validation Gaps"
          value={summary.evidenceValidationGapsCount}
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          change="completed OJTs without validated proof"
          isPositive={summary.evidenceValidationGapsCount === 0}
        />
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3 bg-slate-900/50 rounded-xl p-3 border border-slate-800/80 max-w-md">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          placeholder="Filter by employee, training, role, unit..."
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

      {/* Table: Theoretical Training Records */}
      <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Theoretical Training Matrix
            </h3>
          </div>
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800">
            {trainingRows.length} active assignments mapped
          </span>
        </div>

        <div className="overflow-x-auto">
          {trainingRows.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="p-4 font-semibold uppercase text-[10px]">Employee / Department</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Assigned Role</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Required Program</th>
                  <th className="p-4 font-semibold uppercase text-[10px] text-center">Start Date</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">State</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Theoretical Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {trainingRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-white leading-none">{row.employeeName}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{row.organizationUnitName}</p>
                    </td>
                    <td className="p-4 font-semibold text-slate-200">{row.functionName}</td>
                    <td className="p-4 text-slate-300">{row.programName}</td>
                    <td className="p-4 text-center font-mono text-slate-400">{row.startDate}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                        row.isCertified
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {row.isCertified ? "Certified" : "Uncertified"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                          row.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          {row.status.replace("_", " ")}
                        </span>
                        {row.isOverdue && (
                          <span className="inline-flex px-1.5 py-0.2 rounded border bg-rose-500/10 text-rose-400 border-rose-500/20 text-[9px] font-mono font-bold animate-pulse">
                            OVERDUE
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
              <EmptyState title="No theoretical trainings found" message="Adjust filters to search rows within this isolated tenant." />
            </div>
          )}
        </div>
      </div>

      {/* Table: Practical OJT Plan Records */}
      <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              On-the-Job (OJT) Practical Validation
            </h3>
          </div>
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800">
            {ojtRows.length} OJT plans active
          </span>
        </div>

        <div className="overflow-x-auto">
          {ojtRows.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="p-4 font-semibold uppercase text-[10px]">Employee / Department</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Assigned Role / Function</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">OJT Validation State</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Evidence Proof</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Evidence Status</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">OJT Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ojtRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-white leading-none">{row.employeeName}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{row.organizationUnitName}</p>
                    </td>
                    <td className="p-4 font-semibold text-slate-200">{row.functionName}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                        row.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {row.status === "completed" ? "Practical Validated" : "Practical Pending"}
                      </span>
                    </td>
                    <td className="p-4">
                      {row.hasEvidenceRecord && row.evidenceUrl ? (
                        <a
                          href={row.evidenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span>View Evidence Document</span>
                        </a>
                      ) : (
                        <span className="text-slate-500 font-semibold italic">No proof uploaded</span>
                      )}
                    </td>
                    <td className="p-4">
                      {row.hasEvidenceRecord && row.evidenceStatus ? (
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                          row.evidenceStatus === "validated"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : row.evidenceStatus === "rejected"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          {row.evidenceStatus}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                          row.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          {row.status.replace("_", " ")}
                        </span>
                        {row.isOverdue && (
                          <span className="inline-flex px-1.5 py-0.2 rounded border bg-rose-500/10 text-rose-400 border-rose-500/20 text-[9px] font-mono font-bold animate-pulse">
                            OVERDUE
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
              <EmptyState title="No On-the-Job (OJT) plans mapped" message="Adjust filters to search rows within this isolated tenant." />
            </div>
          )}
        </div>
      </div>

      {/* Grid: Unit Coverage Matrix & Employees Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Org Unit Coverage Rates */}
        <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Sectors Qualification Coverage
                </h3>
              </div>
            </div>

            <div className="p-6 divide-y divide-slate-800/50">
              {coverageRows.length > 0 ? (
                coverageRows.map(unit => (
                  <div key={unit.organizationUnitId} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                    <div>
                      <p className="font-bold text-white text-xs">{unit.organizationUnitName}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {unit.totalEmployees} employees | {unit.trainedEmployeesCount} certified | {unit.ojtValidatedEmployeesCount} practical validated
                      </p>
                    </div>
                    <div className="text-right space-y-1 shrink-0 ml-4">
                      <p className="text-[11px] font-bold text-cyan-400 font-mono">
                        {unit.trainingCoverageRate}% Certified
                      </p>
                      <p className="text-[10px] font-semibold text-purple-400 font-mono">
                        {unit.ojtCoverageRate}% OJT Validated
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs py-4 text-center">No sectors found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Untrained & Unvalidated Lists */}
        <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Critical Qualification Alerts
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Without Certified Training */}
              <div>
                <p className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-semibold mb-2">
                  Active Personnel Lacking Certified Training ({untrainedEmployees.length})
                </p>
                {untrainedEmployees.length > 0 ? (
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                    {untrainedEmployees.map((emp) => {
                      const pending = getPendingTrainingsByEmployee(
                        emp.id,
                        DEMO_EMPLOYEES,
                        DEMO_ASSIGNMENTS,
                        DEMO_BACKUPS,
                        DEMO_PROGRAMS,
                        DEMO_FUNCTIONS,
                        DEMO_UNITS,
                        { tenantId: selectedTenant }
                      );
                      return (
                        <div key={emp.id} className="text-xs flex items-center justify-between bg-rose-500/10 p-2.5 rounded border border-rose-500/20">
                          <div>
                            <p className="text-white font-semibold">{emp.name}</p>
                            <p className="text-[9px] text-slate-500 mt-1 uppercase font-mono">Lacks training for {pending.map(p => p.functionName).join(", ") || "Active role"}</p>
                          </div>
                          <span className="text-rose-400 font-mono text-[9px] font-bold uppercase bg-rose-400/5 px-2 py-0.5 border border-rose-400/20 rounded">
                            Uncertified
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-emerald-400 text-[11px] font-semibold">0 active employees lacking certified training.</p>
                )}
              </div>

              {/* Without Practical OJT Validation */}
              <div>
                <p className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-semibold mb-2">
                  Active Personnel Lacking OJT Practical Validation ({unvalidatedOjtEmployees.length})
                </p>
                {unvalidatedOjtEmployees.length > 0 ? (
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                    {unvalidatedOjtEmployees.map((emp) => (
                      <div key={emp.id} className="text-xs flex items-center justify-between bg-purple-500/10 p-2.5 rounded border border-purple-500/20">
                        <span className="text-white font-semibold">{emp.name}</span>
                        <span className="text-purple-400 font-mono text-[9px] font-bold uppercase bg-purple-500/5 px-2 py-0.5 border border-purple-500/20 rounded">
                          OJT Needed
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-emerald-400 text-[11px] font-semibold">0 active employees lacking practical validation.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Function deep dives completed vs plans */}
      <div className="bg-white/[0.03] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              OJT plans & coverage by operational function
            </h3>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTenantFunctions.map(func => {
            const allOjt = getOjtPlansByFunction(
              func.id,
              DEMO_OJTS,
              DEMO_EMPLOYEES,
              DEMO_ASSIGNMENTS,
              DEMO_BACKUPS,
              DEMO_FUNCTIONS,
              DEMO_UNITS,
              DEMO_EVIDENCES,
              { tenantId: selectedTenant }
            );
            const completedOjt = getCompletedOjtByFunction(
              func.id,
              DEMO_OJTS,
              DEMO_EMPLOYEES,
              DEMO_ASSIGNMENTS,
              DEMO_BACKUPS,
              DEMO_FUNCTIONS,
              DEMO_UNITS,
              DEMO_EVIDENCES,
              { tenantId: selectedTenant }
            );
            return (
              <div key={func.id} className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-cyan-400 font-bold text-[10px]">[{func.code}]</span>
                    {func.isCritical && (
                      <span className="inline-flex px-1.5 py-0.2 rounded border bg-rose-500/10 text-rose-400 border-rose-500/20 text-[9px] font-mono font-bold">
                        CRITICAL
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">{func.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 truncate">{func.description}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
                  <span>OJT Plans: <strong className="text-white">{allOjt.length}</strong></span>
                  <span>Practical Validated: <strong className="text-emerald-400">{completedOjt.length}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continuity / Qualification Gap Indicators */}
      <div className="space-y-4 pt-4">
        <h2 className="text-base font-bold text-white tracking-wide border-l-[3px] border-[#00E7F8] pl-3 uppercase font-mono">
          Qualification & Compliance Gaps
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
                    {gap.employeeName}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1">Role: {gap.functionName}</p>
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
            ✔ 0 qualification or compliance gaps identified in this tenant!
          </div>
        )}
      </div>
    </div>
  );
};

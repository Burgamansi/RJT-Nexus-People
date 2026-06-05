import React, { useState } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Clock,
  BookOpen,
  Briefcase,
  Layers,
  Users,
  Activity,
  Award,
  FileCheck,
  FileText,
  ThumbsDown,
  ChevronRight,
  AlertTriangle
} from "lucide-react";
import { MetricCard } from "../components/ui/MetricCard";
import { EmptyState } from "../components/ui/EmptyState";
import { usePeopleDataset } from "../app/data/usePeopleDataset";
import { CompetencyLevel, MaturityLevel } from "../types";

// Import Components
import { ContinuityScoreCard } from "../components/intelligence/ContinuityScoreCard";
import { KnowledgeHealthCard } from "../components/intelligence/KnowledgeHealthCard";
import { SuccessionReadinessCard } from "../components/intelligence/SuccessionReadinessCard";
import { PolyvalenceCoverageCard } from "../components/intelligence/PolyvalenceCoverageCard";
import { VulnerabilityRanking } from "../components/intelligence/VulnerabilityRanking";
import { RiskHeatmap } from "../components/intelligence/RiskHeatmap";

// Import Selectors from all 9 validated modules
import { getWorkforceMapSummary } from "../features/workforce-map/selectors";
import { getCriticalFunctionsSummaryDashboardData } from "../features/critical-functions/selectors";
import { getPolyvalenceSummaryDashboardData } from "../features/polyvalence-matrix/selectors";
import { getBackupSuccessionSummaryDashboardData } from "../features/backup-succession/selectors";
import { getTrainingOjtSummaryDashboardData } from "../features/training-ojt/selectors";
import { getKnowledgeHubSummaryDashboardData } from "../features/knowledge-hub/selectors";
import { getEvidenceAuditSummaryDashboardData } from "../features/evidence-center/selectors";
import { getActionPlansSummary } from "../features/action-plans/selectors";
import {
  getVulnerabilityAnalyticsSummary,
  getVulnerabilityFunctionRows,
  getVulnerabilityFactorRows
} from "../features/vulnerability-analytics/selectors";

export const ExecutiveDashboardPage: React.FC = () => {
  const { dataset, tenants } = usePeopleDataset();
  const DEMO_EMPLOYEES = dataset.employees;
  const DEMO_UNITS = dataset.units;
  const DEMO_FUNCTIONS = dataset.functions;
  const DEMO_ASSIGNMENTS = dataset.assignments;
  const DEMO_CF_ASSESSMENTS = dataset.assessments;
  const DEMO_BACKUPS = dataset.backups;
  const DEMO_SUCCESSORS = dataset.successors;
  const DEMO_PROGRAMS = dataset.programs;
  const DEMO_OJTS = dataset.ojts;
  const DEMO_ASSETS = dataset.assets;
  const DEMO_EVIDENCES = dataset.evidences;
  const DEMO_ACTION_PLANS = dataset.actionPlans;
  const DEMO_SNAPSHOTS = dataset.snapshots;
  // Tenant switcher state
  const [selectedTenant, setSelectedTenant] = useState<string>(dataset.tenantId);

  // ============================================================================
  // ADAPTER: Map modern multitenant datasets to legacy formats for vulnerability
  // ============================================================================

  const mappedFunctions = DEMO_FUNCTIONS.map((f, idx) => {
    const mainAsg = DEMO_ASSIGNMENTS.filter(
      a => a.functionId === f.id && a.isPrimary && a.status === "active"
    );
    const mainOps = mainAsg.map(a => a.employeeId);
    const mainOpNames = mainAsg.map(
      a => DEMO_EMPLOYEES.find(e => e.id === a.employeeId)?.name || ""
    ).filter(Boolean);
    
    const bkpList = DEMO_BACKUPS.filter(b => b.functionId === f.id && b.status === "active");
    const backupOps = bkpList.map(b => b.employeeId);
    const bkpNames = bkpList.map(b => DEMO_EMPLOYEES.find(e => e.id === b.employeeId)?.name || "");

    const cfAssessment = DEMO_CF_ASSESSMENTS.find(c => c.functionId === f.id);
    const gutScore = cfAssessment?.gutScore || (f.isCritical ? 27 : 8);
    const vulnScore = cfAssessment?.vulnerabilityScore || 10;
    const classification = String(cfAssessment?.classification || (f.isCritical ? "critical" : "low")).toLowerCase();
    
    let classLabel: "Crítico" | "Alto" | "Médio" | "Baixo" = "Baixo";
    if (classification === "critical") classLabel = "Crítico";
    else if (classification === "high") classLabel = "Alto";
    else if (classification === "medium") classLabel = "Médio";

    const asset = DEMO_ASSETS.find(a => a.functionId === f.id);
    const docCode = asset?.code || "";

    return {
      id: idx + 1,
      idFuncao: f.id,
      setor: DEMO_UNITS.find(u => u.id === f.organizationUnitId)?.name || "Unknown Unit",
      processo: "Industrial Operations",
      funcaoCritica: f.name,
      atividadeTecnicaCritica: f.description,
      colaboradorPrincipal: mainOpNames.join(", ") || "Sem Operador",
      backup1: bkpNames[0] || "Sem Backup",
      backup2: bkpNames[1] || "Sem Backup",
      existeBackup: bkpList.length > 0 ? ("SIM" as const) : ("NÃO" as const),
      quantidadePessoasAptas: mainOps.length + bkpList.length,
      nivelPolivalencia: 3,
      grauDependenciaTecnica: 3,
      tempoEstimadoFormacao: "3 meses",
      complexidadeTecnica: "Média" as const,
      impactoProducao: 3,
      impactoCliente: 3,
      impactoQualidade: 3,
      gravidade: 3,
      urgencia: 3,
      tendencia: 3,
      scoreGUT: gutScore,
      scoreVulnerabilidade: vulnScore,
      wreIndex: 30,
      classificacaoFinal: classLabel,
      necessidadeIT: "SIM",
      necessidadeTreinamento: "SIM",
      necessidadeSucessao: "NÃO",
      requisitoISO: "7.2",
      evidenciaNecessaria: "Upload",
      codigoDocumentoUBG: docCode,
      acaoPDCARelacionada: "",
      responsavel: "Supervisor",
      prazo: "2026-12-31",
      status: "Planejado" as const,
      mainOperatorIds: mainOps,
      backupOperatorIds: backupOps,
      requiredSkillIds: [f.id],
      requiredBackupQuantity: f.requiredBackupQuantity,
      requiredSkills: [
        {
          skillId: f.id,
          requiredProficiencyLevel: "INDEPENDENT" as any,
          isMandatory: true
        }
      ],
      tenantId: f.tenantId
    };
  });

  const mappedCollaborators = DEMO_EMPLOYEES.map(emp => {
    const asg = DEMO_ASSIGNMENTS.find(a => a.employeeId === emp.id && a.isPrimary && a.status === "active");
    const primaryFuncId = asg ? asg.functionId : "";

    return {
      id: emp.id,
      name: emp.name,
      primaryFunctionId: primaryFuncId,
      currentMaturity: "PLENO" as any,
      skills: emp.skills.map(s => {
        let lvl = "UNASSESSED" as any;
        if (s.proficiencyLevel === "Multiplier") lvl = "MULTIPLIER" as any;
        else if (s.proficiencyLevel === "Operational" || s.proficiencyLevel === "Independent") lvl = "INDEPENDENT" as any;
        else if (s.proficiencyLevel === "Junior") lvl = "IN_TRAINING" as any;
        
        return {
          skillId: s.skillId,
          proficiencyLevel: lvl,
          isCertified: s.certified
        };
      }),
      tenantId: emp.tenantId
    };
  });

  const mappedEvidences = DEMO_EVIDENCES.map((ev, idx) => {
    const asset = DEMO_ASSETS.find(a => a.functionId === ev.functionId);
    const docCode = asset?.code || "";

    let statusStr: "Pendente" | "Em Análise" | "Validada" = "Pendente";
    if (ev.status === "validated") statusStr = "Validada";

    return {
      id: idx + 1,
      requisitoISO: "7.2",
      descricaoRequisito: "Competency proof",
      evidenciaNecessaria: "Ficha",
      codigoDocumentoUBG: docCode,
      descricaoDocumento: ev.evidenceUrl,
      status: statusStr,
      dataColeta: ev.uploadedAt,
      responsavelColeta: "Auditor",
      collaboratorId: ev.employeeId,
      functionId: ev.functionId,
      tenantId: ev.tenantId
    };
  });

  const mappedActions = DEMO_ACTION_PLANS.map((ac, idx) => {
    const funcIdx = DEMO_FUNCTIONS.findIndex(f => f.id === ac.functionId);

    let statusStr: "Planejado" | "Em Execução" | "Concluido" | "Cancelado" = "Planejado";
    if (ac.status === "completed") statusStr = "Concluido";
    else if (ac.status === "in_progress") statusStr = "Em Execução";

    return {
      id: idx + 1,
      funcaoCriticaId: funcIdx + 1,
      funcaoCriticaCodigo: ac.functionId,
      funcaoCriticaNome: ac.title,
      descricaoAcao: ac.description,
      tipoAcao: "Treinamento" as const,
      responsavel: ac.ownerEmployeeId,
      dataInicio: ac.createdAt,
      dataPrazo: ac.dueDate,
      status: statusStr,
      acaoPDCA: "P" as const,
      observacoes: ac.description,
      tenantId: ac.tenantId
    };
  });

  // ============================================================================
  // HYDRATE ALL SELECTORS
  // ============================================================================

  const workforceSummary = getWorkforceMapSummary(
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    { tenantId: selectedTenant }
  );

  const criticalFunctionsSummary = getCriticalFunctionsSummaryDashboardData(
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

  const polyvalenceSummary = getPolyvalenceSummaryDashboardData(
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

  const backupSuccessionSummary = getBackupSuccessionSummaryDashboardData(
    DEMO_FUNCTIONS,
    DEMO_ASSIGNMENTS,
    DEMO_EMPLOYEES,
    DEMO_BACKUPS,
    DEMO_SUCCESSORS,
    DEMO_UNITS,
    { tenantId: selectedTenant }
  );

  const trainingOjtSummary = getTrainingOjtSummaryDashboardData(
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

  const knowledgeSummary = getKnowledgeHubSummaryDashboardData(
    DEMO_ASSETS,
    DEMO_FUNCTIONS,
    DEMO_UNITS,
    DEMO_EVIDENCES,
    DEMO_EMPLOYEES,
    DEMO_OJTS,
    { tenantId: selectedTenant }
  );

  const evidenceSummary = getEvidenceAuditSummaryDashboardData(
    DEMO_EVIDENCES,
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_FUNCTIONS,
    DEMO_ASSETS,
    DEMO_OJTS,
    DEMO_BACKUPS,
    { tenantId: selectedTenant }
  );

  const vulnerabilitySummary = getVulnerabilityAnalyticsSummary(
    mappedFunctions,
    mappedCollaborators,
    mappedEvidences,
    mappedActions,
    { tenantId: selectedTenant }
  );

  const actionSummary = getActionPlansSummary(
    DEMO_ACTION_PLANS,
    DEMO_FUNCTIONS,
    DEMO_EMPLOYEES,
    DEMO_UNITS,
    DEMO_EVIDENCES,
    DEMO_SNAPSHOTS,
    { tenantId: selectedTenant }
  );

  const vulnerabilityRows = getVulnerabilityFunctionRows(
    mappedFunctions,
    mappedCollaborators,
    mappedEvidences,
    mappedActions,
    { tenantId: selectedTenant }
  );

  const factorRows = getVulnerabilityFactorRows(
    mappedFunctions,
    mappedCollaborators,
    mappedEvidences,
    mappedActions,
    { tenantId: selectedTenant }
  );

  // ============================================================================
  // EXECUTIVE SCORES CALCULATIONS
  // ============================================================================

  // 1. Workforce Coverage Score: assigned employees / total active (%)
  const activeTenantEmployees = DEMO_EMPLOYEES.filter(
    e => e.tenantId === selectedTenant && e.status === "active"
  );
  const workforceCoverageScore = activeTenantEmployees.length > 0
    ? Math.round((workforceSummary.activeEmployees / activeTenantEmployees.length) * 100)
    : 0;

  // 2. Critical Functions Coverage Score
  const criticalFunctionsCoverageScore = backupSuccessionSummary.totalCriticalFunctions > 0
    ? Math.round((backupSuccessionSummary.fullyCoveredFunctionsCount / backupSuccessionSummary.totalCriticalFunctions) * 100)
    : 0;

  // 3. Polyvalence Coverage Score (index value scaled)
  const polyvalenceCoverageScore = polyvalenceSummary.averageCoverageIndex;

  // 4. Backup Coverage Score
  const backupCoverageScore = backupSuccessionSummary.fullyCoveredFunctionsCount;

  // 5. Succession Readiness Score
  const successionReadinessScore = backupSuccessionSummary.functionsWithSuccessorCount;

  // 6. Training Compliance Score
  const totalTrainings = trainingOjtSummary.completedTrainingsCount + trainingOjtSummary.pendingTrainingsCount;
  const trainingComplianceScore = totalTrainings > 0
    ? Math.round((trainingOjtSummary.completedTrainingsCount / totalTrainings) * 100)
    : 0;

  // 7. OJT Compliance Score
  const totalOjts = trainingOjtSummary.completedOjtPlansCount + trainingOjtSummary.pendingOjtPlansCount;
  const ojtComplianceScore = totalOjts > 0
    ? Math.round((trainingOjtSummary.completedOjtPlansCount / totalOjts) * 100)
    : 0;

  // 8. Knowledge Health Score
  const knowledgeHealthScore = knowledgeSummary.knowledgeBaseHealthScore;

  // 9. Evidence Readiness Score
  const evidenceReadinessScore = evidenceSummary.auditReadinessScore;

  // 10. Vulnerability Exposure Score
  const vulnerabilityExposureScore = vulnerabilitySummary.overallVulnerabilityScore;

  // 11. Action Plan Completion Score
  const actionPlanCompletionScore = actionSummary.averageCompletionRate;

  // 12. Organizational Health Score: calculated as 100 - average vulnerability rating
  const organizationalHealthScore = Math.max(0, 100 - vulnerabilityExposureScore);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full uppercase border border-blue-500/20 select-none">
            PDCA Brain · ISO 9001:2015
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight pt-2">
            Dashboard Executivo
          </h1>
          <p className="text-xs text-slate-400">
            Visão consolidada de conformidade ISO, riscos operacionais, competências e efetividade do ciclo PDCA em tempo real.
          </p>
        </div>

        {/* Tenant Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-2xl border border-slate-800">
          <Shield className="w-4 h-4 text-blue-400 shrink-0" />
          <select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
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

      {/* Main Grid: Organizational Health & Executive Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Organizational Health Score Circle */}
        <div className="bg-white/[0.03] rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-between shadow-xl text-center">
          <div className="space-y-1 w-full text-left border-b border-slate-850 pb-4 mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Organizational Health
            </h3>
            <p className="text-[10px] text-slate-500">Overall risk mitigation index.</p>
          </div>

          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG circle stroke representation */}
            <svg className="absolute w-full h-full -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="74"
                className="stroke-slate-800 fill-none"
                strokeWidth="10"
              />
              <circle
                cx="88"
                cy="88"
                r="74"
                className={`fill-none transition-all duration-500 ${
                  organizationalHealthScore >= 80
                    ? "stroke-emerald-400"
                    : organizationalHealthScore >= 60
                    ? "stroke-amber-400"
                    : "stroke-rose-500"
                }`}
                strokeWidth="10"
                strokeDasharray="465"
                strokeDashoffset={465 - (465 * organizationalHealthScore) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="z-10 text-center">
              <span className={`text-4xl font-extrabold block ${
                organizationalHealthScore >= 80
                  ? "text-emerald-400"
                  : organizationalHealthScore >= 60
                  ? "text-amber-400"
                  : "text-rose-500"
              }`}>
                {organizationalHealthScore}%
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-1 block">
                Health Score
              </span>
            </div>
          </div>

          <div className="w-full text-slate-400 text-xs italic mt-6 border-t border-slate-850 pt-4 leading-relaxed">
            {organizationalHealthScore >= 80
              ? "✔ High continuity readiness. Quality certifications and backups are fully secured."
              : organizationalHealthScore >= 60
              ? "⚠ Moderate exposure. Address training certification gaps and backup shortages."
              : "✖ Critical exposure warning. Address Single Point of Failure (SPOF) risks immediately."}
          </div>
        </div>

        {/* Executive KPI Score Metrics (11 Core Scores) */}
        <div className="bg-white/[0.03] rounded-2xl border border-slate-800 p-6 lg:col-span-2 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Aggregated Executive Performance Indices
            </h3>
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-500 border border-slate-800">
              11 Core Scores Hydrated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* KPI Progress rows */}
            <div className="space-y-3.5">
              {/* 1. Workforce Allocation */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-400">1. Workforce Allocation Score</span>
                  <span className="font-mono text-blue-400 font-bold">{workforceCoverageScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00E7F8] rounded-full" style={{ width: `${workforceCoverageScore}%` }} />
                </div>
              </div>

              {/* 2. Critical Functions Coverage */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-400">2. Critical Functions Coverage</span>
                  <span className="font-mono text-[#00A4FF] font-bold">{criticalFunctionsCoverageScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00A4FF] rounded-full" style={{ width: `${criticalFunctionsCoverageScore}%` }} />
                </div>
              </div>

              {/* 3. Polyvalence Coverage Score */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-400">3. Polyvalence Coverage Rating</span>
                  <span className="font-mono text-amber-400 font-bold">{polyvalenceCoverageScore} index</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min(100, polyvalenceCoverageScore * 25)}%` }} />
                </div>
              </div>

              {/* 4. Backup Coverage Score */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-400">4. Fully Mapped Backups</span>
                  <span className="font-mono text-emerald-400 font-bold">{backupCoverageScore} / {backupSuccessionSummary.totalCriticalFunctions} roles</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(backupCoverageScore / backupSuccessionSummary.totalCriticalFunctions) * 100}%` }} />
                </div>
              </div>

              {/* 5. Succession Readiness Score */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-400">5. Succession Pipeline Depth</span>
                  <span className="font-mono text-purple-400 font-bold">{successionReadinessScore} / {backupSuccessionSummary.totalCriticalFunctions} roles</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(successionReadinessScore / backupSuccessionSummary.totalCriticalFunctions) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="space-y-3.5">
              {/* 6. Training Compliance Score */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-400">6. Theoretical Training Compliance</span>
                  <span className="font-mono text-emerald-400 font-bold">{trainingComplianceScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${trainingComplianceScore}%` }} />
                </div>
              </div>

              {/* 7. OJT Compliance Score */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-400">7. Practical OJT Validation Compliance</span>
                  <span className="font-mono text-blue-400 font-bold">{ojtComplianceScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00E7F8] rounded-full" style={{ width: `${ojtComplianceScore}%` }} />
                </div>
              </div>

              {/* 8. Knowledge Health Score */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-400">8. ISO Knowledge Hub Health</span>
                  <span className="font-mono text-purple-400 font-bold">{knowledgeHealthScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${knowledgeHealthScore}%` }} />
                </div>
              </div>

              {/* 9. Evidence Readiness Score */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-400">9. Evidence Center Audit Readiness</span>
                  <span className="font-mono text-[#00A4FF] font-bold">{evidenceReadinessScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00A4FF] rounded-full" style={{ width: `${evidenceReadinessScore}%` }} />
                </div>
              </div>

              {/* 10. Vulnerability Exposure Score */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-400">10. Operational Vulnerability Exposure</span>
                  <span className="font-mono text-rose-400 font-bold">{vulnerabilityExposureScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${vulnerabilityExposureScore}%` }} />
                </div>
              </div>

              {/* 11. Action Plan Completion Score */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-400">11. Action Plan (PDCA) Completion</span>
                  <span className="font-mono text-emerald-400 font-bold">{actionPlanCompletionScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${actionPlanCompletionScore}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Risk Heatmap Grid & Vulnerability Ranking */}
      <div className="space-y-8">
        <RiskHeatmap factorRows={factorRows} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <VulnerabilityRanking rows={vulnerabilityRows} />

          {/* Top Operational Gaps & Continuity Risks List */}
          <div className="bg-white/[0.03] rounded-2xl border border-slate-800 p-6 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Top Continuity Risks & Action Backlogs
                  </h3>
                </div>
              </div>

              <div className="space-y-3.5 pt-3 max-h-[300px] overflow-y-auto pr-1">
                {/* Overdue Action Plans warning */}
                {actionSummary.overdueActionPlans > 0 && (
                  <div className="text-xs flex items-center justify-between bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-rose-400 shrink-0" />
                      <div>
                        <p className="font-bold text-white leading-none">Overdue PDCA Actions Backlog</p>
                        <p className="text-[10px] text-slate-500 mt-1 leading-none">Mitigation target schedules missed</p>
                      </div>
                    </div>
                    <span className="text-rose-450 font-mono text-[10px] font-bold bg-rose-500/5 px-2 py-0.5 border border-rose-500/20 rounded">
                      {actionSummary.overdueActionPlans} active
                    </span>
                  </div>
                )}

                {/* SPOF warning */}
                {polyvalenceSummary.spofFunctionsCount > 0 && (
                  <div className="text-xs flex items-center justify-between bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                      <div>
                        <p className="font-bold text-white leading-none">Single Points of Failure (SPOFs)</p>
                        <p className="text-[10px] text-slate-500 mt-1 leading-none">Roles with zero qualified backup operators</p>
                      </div>
                    </div>
                    <span className="text-rose-450 font-mono text-[10px] font-bold bg-rose-500/5 px-2 py-0.5 border border-rose-500/20 rounded">
                      {polyvalenceSummary.spofFunctionsCount} active
                    </span>
                  </div>
                )}

                {/* ISO Audit warning */}
                {evidenceSummary.criticalMissingCount > 0 && (
                  <div className="text-xs flex items-center justify-between bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <p className="font-bold text-white leading-none">ISO Audit Validation Deficiencies</p>
                        <p className="text-[10px] text-slate-500 mt-1 leading-none">SOPs without required evidence files</p>
                      </div>
                    </div>
                    <span className="text-amber-450 font-mono text-[10px] font-bold bg-amber-500/5 px-2 py-0.5 border border-amber-500/20 rounded">
                      {evidenceSummary.criticalMissingCount} active
                    </span>
                  </div>
                )}

                {/* OJT training warning */}
                {trainingOjtSummary.overdueOjtPlansCount > 0 && (
                  <div className="text-xs flex items-center justify-between bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <p className="font-bold text-white leading-none">On-the-Job Training Gaps</p>
                        <p className="text-[10px] text-slate-500 mt-1 leading-none">Operators without practical validation</p>
                      </div>
                    </div>
                    <span className="text-amber-450 font-mono text-[10px] font-bold bg-amber-500/5 px-2 py-0.5 border border-amber-500/20 rounded">
                      {trainingOjtSummary.overdueOjtPlansCount} active
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Continuity, Knowledge, Succession, and Polyvalence Sub-Pillars scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ContinuityScoreCard
          totalCritical={backupSuccessionSummary.totalCriticalFunctions}
          fullyCovered={backupSuccessionSummary.fullyCoveredFunctionsCount}
          partiallyCovered={backupSuccessionSummary.partiallyCoveredFunctionsCount}
          uncovered={backupSuccessionSummary.uncoveredFunctionsCount}
          backupCoverageIndex={`${backupSuccessionSummary.fullyCoveredFunctionsCount} / ${backupSuccessionSummary.totalCriticalFunctions}`}
        />

        <KnowledgeHealthCard
          healthScore={knowledgeHealthScore}
          totalAssets={knowledgeSummary.totalKnowledgeAssets}
          outdatedCount={knowledgeSummary.outdatedAssetsCount}
          missingEvidenceCount={knowledgeSummary.assetsWithoutEvidenceCount}
          criticalMissingCount={knowledgeSummary.criticalFunctionsWithoutAssetCount}
        />

        <SuccessionReadinessCard
          functionsWithSuccessorCount={backupSuccessionSummary.functionsWithSuccessorCount}
          totalCritical={backupSuccessionSummary.totalCriticalFunctions}
          readyCandidatesCount={1}
          functionsWithoutSuccessorCount={backupSuccessionSummary.functionsWithoutSuccessorCount}
        />

        <PolyvalenceCoverageCard
          averageCoverageIndex={polyvalenceCoverageScore}
          polyvalentEmployeesCount={polyvalenceSummary.polyvalentEmployeesCount}
          spofFunctionsCount={polyvalenceSummary.spofFunctionsCount}
          totalEmployees={polyvalenceSummary.totalEmployees}
          trainingGapsCount={polyvalenceSummary.trainingGapsCount}
        />
      </div>
    </div>
  );
};

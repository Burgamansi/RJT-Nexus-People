import { useState } from "react";
import { 
  Users, 
  TrendingUp, 
  Award,
  AlertTriangle,
  Building,
  CheckSquare,
  ArrowRight,
  Briefcase,
  Layers,
  ChevronRight,
  UserCheck,
  Shield,
  BookOpen,
  Activity
} from "lucide-react";
import { 
  FuncaoCritica, 
  ActionPlan,
  ISOEvidence,
  Collaborator,
  calculateBackupScore,
  calculateCoverageScore,
  calculateTrainingScore,
  calculateMaturityScore,
  getFunctionAlerts,
  selectIsValidBackup,
  selectRiskScore
} from "../types";

interface DashboardProps {
  funcoes: FuncaoCritica[];
  acoes: ActionPlan[];
  collaborators?: Collaborator[];
  evidencias?: ISOEvidence[];
  onNavigateTab: (tab: string) => void;
}

export default function Dashboard({ 
  funcoes, 
  acoes, 
  collaborators = [], 
  evidencias = [], 
  onNavigateTab 
}: DashboardProps) {
  
  // Create a fast map for collaborator lookups by ID
  const collaboratorsMap = collaborators.reduce((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {} as Record<string, Collaborator>);

  const totalFuncoes = funcoes.length;
  
  // Real critical count
  const criticalCount = funcoes.filter(f => 
    f.classificacaoFinal === "Crítico" || f.classificacaoFinal === "Alta" || f.classificacaoFinal === "Alto"
  ).length;

  // Active Single Point of Failure count (SPOF)
  const spofCount = funcoes.filter(f => {
    if (f.classificacaoFinal !== "Crítico" && f.classificacaoFinal !== "Alto" && f.classificacaoFinal !== "Alta") return false;
    const backupIds = f.backupOperatorIds || [];
    const validBackups = backupIds.filter(id => {
      const colab = collaboratorsMap[id];
      return colab && selectIsValidBackup(colab, f, evidencias, acoes);
    });
    return validBackups.length === 0;
  }).length;

  // Functions with backup gap (where backup quality score < 100%)
  const functionsWithGap = funcoes.filter(f => {
    const bkp = calculateBackupScore(f, collaborators, evidencias, acoes);
    return bkp < 100;
  }).length;

  // Training gaps count (total difference between required and actual backups)
  const trainingGapCount = funcoes.reduce((sum, f) => {
    const backupQty = f.requiredBackupQuantity || (f.existeBackup === "SIM" ? 2 : 0);
    const currentBackups = (f.backupOperatorIds || []).length;
    const gap = backupQty - currentBackups;
    return sum + (gap > 0 ? gap : 0);
  }, 0);

  // Aggregate stats
  let totalMaturity = 0;
  let totalCoverageScore = 0;
  let totalCriticalAlerts = 0;
  let totalBackupScore = 0;

  funcoes.forEach(f => {
    const bkp = calculateBackupScore(f, collaborators, evidencias, acoes);
    const cov = calculateCoverageScore(f, collaborators, evidencias, acoes);
    const trn = calculateTrainingScore(f, acoes);
    const mat = calculateMaturityScore(bkp, trn, cov);
    
    totalMaturity += mat;
    totalCoverageScore += cov;
    totalBackupScore += bkp;

    const alerts = getFunctionAlerts(f, acoes);
    totalCriticalAlerts += alerts.filter(al => al.active && al.severity === "critical").length;
  });

  const avgMaturity = totalFuncoes > 0 ? Math.round(totalMaturity / totalFuncoes) : 0;
  const avgCoverage = totalFuncoes > 0 ? Math.round(totalCoverageScore / totalFuncoes) : 0;
  const avgBackupScore = totalFuncoes > 0 ? Math.round(totalBackupScore / totalFuncoes) : 0;

  // 1. DYNAMIC HEATMAP DATA - BY DEPARTMENT SECTOR
  const sectorsList = Array.from(new Set(funcoes.map(f => f.setor)));
  const heatmapData = sectorsList.map(sector => {
    const deptFunctions = funcoes.filter(f => f.setor === sector);
    const count = deptFunctions.length;
    
    const totalRisk = deptFunctions.reduce((sum, f) => {
      return sum + selectRiskScore(f, collaboratorsMap, evidencias, acoes);
    }, 0);
    
    const avgRisk = count > 0 ? Math.round(totalRisk / count) : 0;

    return {
      department: sector,
      count,
      avgRisk
    };
  }).sort((a, b) => b.avgRisk - a.avgRisk); // Sort highest risk first

  // 2. WATCHLIST - TOP 5 EXPOSED ROLES (Highest Risk Score)
  const top5VulnerableList = [...funcoes]
    .map(f => {
      const bkp = calculateBackupScore(f, collaborators, evidencias, acoes);
      const cov = calculateCoverageScore(f, collaborators, evidencias, acoes);
      const trn = calculateTrainingScore(f, acoes);
      const mat = calculateMaturityScore(bkp, trn, cov);
      const risk = selectRiskScore(f, collaboratorsMap, evidencias, acoes);

      return {
        ...f,
        maturityScore: mat,
        riskScore: risk
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  // PDCA QUICK SUMMARY
  const totalAcoes = acoes.length;
  const acoesConcluidas = acoes.filter(a => a.status === "Concluido").length;
  const acoesEmExecucao = acoes.filter(a => a.status === "Em Execução" || a.status === "Planejado").length;
  const acoesPercent = totalAcoes > 0 ? Math.round((acoesConcluidas / totalAcoes) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* 1. SECTOR HEADER AREA */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 p-6 rounded shadow-sm">
        <div>
          <span className="text-[9px] font-bold text-[#00A4FF] uppercase tracking-widest block font-sans">Controle de Riscos Operacionais</span>
          <h2 className="text-lg font-bold uppercase text-[#04044A] tracking-wider mt-0.5">Nexus People Workspace — União Bag</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Painel consolidado para auditorias regulatórias da <strong className="font-bold">ISO 9001:2015</strong> e mapeamento de contingência técnica de cargos industriais.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-right shrink-0">
            <span className="text-[8px] font-bold uppercase text-rose-700 block leading-none">Alertas Críticos Ativos</span>
            <span className="text-lg font-mono font-bold text-rose-800 leading-none mt-1 block">{totalCriticalAlerts}</span>
          </div>
          <div className="p-3 bg-teal-50 border border-teal-200 rounded text-right shrink-0">
            <span className="text-[8px] font-bold uppercase text-teal-700 block leading-none">Nível Médio de Maturidade</span>
            <span className="text-lg font-mono font-bold text-teal-800 leading-none mt-1 block">{avgMaturity}%</span>
          </div>
        </div>
      </header>

      {/* 2. OPERATIONAL AUDIT NOTE ALERT */}
      {avgBackupScore === 0 && (
        <section className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded text-xs text-amber-800 leading-relaxed shadow-sm">
          <div className="flex gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">DIAGNÓSTICO INICIAL REAL (PDCA 01) — PLANTA NÃO AVALIADA</p>
              <p className="mt-1">
                Todas as proficiências dos 55 colaboradores estão configuradas como <strong className="font-bold">UNASSESSED (Não Avaliado)</strong>. O indicador de <strong>Backup Quality Score está em 0%</strong> e o risco geral é alto. Esta é a linha de base exata e auditarizada de conformidade física, sinalizando que a União Bag precisa formalizar as avaliações de polivalência para reverter os alertas de segurança.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 3. EXECUTIVE DASHBOARD PRIMARY INDEXES */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1: Total Functions */}
        <div className="bg-white border border-slate-200 p-5 rounded flex flex-col justify-between h-32 hover:shadow-sm transition-shadow">
          <div>
            <span className="text-[9px] font-bold tracking-wider text-slate-450 uppercase">TOTAL DE FUNÇÕES</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-mono font-bold text-[#04044A]">{totalFuncoes}</span>
            </div>
          </div>
          <span className="text-[9px] text-[#00A4FF] font-bold uppercase tracking-wider">União Bag Mapeadas</span>
        </div>

        {/* Metric 2: Critical Functions */}
        <div className="bg-white border border-slate-200 p-5 rounded flex flex-col justify-between h-32 hover:shadow-sm transition-shadow">
          <div>
            <span className="text-[9px] font-bold tracking-wider text-slate-450 uppercase font-sans">FUNÇÕES CRÍTICAS</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-mono font-bold text-rose-600">{criticalCount}</span>
            </div>
          </div>
          <span className="text-[9px] text-rose-600 font-bold uppercase tracking-wider">Foco Sucessório</span>
        </div>

        {/* Metric 3: Single Point of Failure (SPOF) */}
        <div className="bg-white border border-slate-200 p-5 rounded flex flex-col justify-between h-32 hover:shadow-sm transition-shadow">
          <div>
            <span className="text-[9px] font-bold tracking-wider text-slate-450 uppercase">PONTOS DE FALHA (SPOF)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl font-mono font-bold ${spofCount > 0 ? "text-red-600 animate-pulse" : "text-amber-600"}`}>{spofCount}</span>
            </div>
          </div>
          <span className="text-[9px] text-rose-500 font-bold uppercase tracking-wider">sem backups válidos</span>
        </div>

        {/* Metric 4: Backup Quality Score */}
        <div className="bg-white border border-slate-200 p-5 rounded flex flex-col justify-between h-32 hover:shadow-sm transition-shadow">
          <div>
            <span className="text-[9px] font-bold tracking-wider text-slate-450 uppercase">BACKUP QUALITY SCORE</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-mono font-bold text-[#000675]">{avgBackupScore}.0%</span>
            </div>
          </div>
          <div>
            <div className="w-full bg-slate-100 h-1 rounded overflow-hidden">
              <div className="bg-[#000675] h-1 animate-pulse" style={{ width: `${avgBackupScore}%` }}></div>
            </div>
            <span className="text-[8px] text-slate-450 mt-1 block uppercase font-bold tracking-wider font-mono">{functionsWithGap} funções com gap</span>
          </div>
        </div>

        {/* Metric 5: Average Competency Coverage */}
        <div className="bg-white border border-slate-200 p-5 rounded flex flex-col justify-between h-32 hover:shadow-sm transition-shadow">
          <div>
            <span className="text-[9px] font-bold tracking-wider text-slate-450 uppercase">KNOWLEDGE COVERAGE</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-mono font-bold text-[#00E7F8]">{avgCoverage}.0%</span>
            </div>
          </div>
          <div>
            <div className="w-full bg-slate-100 h-1 rounded overflow-hidden">
              <div className="bg-[#00E7F8] h-1" style={{ width: `${avgCoverage}%` }}></div>
            </div>
            <span className="text-[8px] text-slate-450 mt-1 block uppercase font-bold tracking-wider font-mono">{trainingGapCount} capacitações faltantes</span>
          </div>
        </div>

      </section>

      {/* 4. WORKFORCE RISK HEATMAP */}
      <section className="bg-white border border-slate-200 p-6 rounded space-y-4 shadow-sm">
        <div>
          <span className="text-[9px] font-bold text-[#00A4FF] uppercase tracking-widest block font-sans">Visual Matrix</span>
          <h3 className="text-sm font-bold uppercase text-[#04044A] tracking-wider mt-0.5">Workforce Risk Heatmap (Mapeamento de Riscos por Setores)</h3>
          <p className="text-[11px] text-slate-500">Exposição volumétrica e score médio de vulnerabilidade de pessoal por departamento operacional União Bag S/A.</p>
        </div>

        {/* Dynamic Heatmap Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
          {heatmapData.map((data) => {
            let riskColor = "bg-slate-50 border-slate-200 text-slate-500";
            let riskLabel = "Sem risco";
            if (data.count > 0) {
              if (data.avgRisk >= 60) {
                riskColor = "bg-rose-50 border-rose-200 text-rose-800";
                riskLabel = "Alto risco";
              } else if (data.avgRisk >= 20) {
                riskColor = "bg-amber-50 border-amber-200 text-amber-800";
                riskLabel = "Risco moderado";
              } else {
                riskColor = "bg-teal-50 border-teal-200 text-teal-800";
                riskLabel = "Baixo risco";
              }
            }

            return (
              <div key={data.department} className={`p-4 border rounded flex flex-col justify-between h-28 transition-colors hover:shadow-md ${riskColor}`}>
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider line-clamp-1 flex-1 pr-1">{data.department}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest px-1 py-0.5 rounded bg-white/85 shrink-0">{riskLabel}</span>
                  </div>
                  <p className="text-xs font-mono font-bold mt-1 opacity-70">
                    {data.count} {data.count === 1 ? 'Cargo Mapeado' : 'Cargos Mapeados'}
                  </p>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-black/5">
                  <span className="text-[9px] font-bold uppercase">Avg Risk Score:</span>
                  <span className="text-lg font-mono font-bold">{data.avgRisk}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. OPERATIONAL WATCHLIST & EXECUTIVE ALERT CENTER */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top 5 Vulnerable Functions list - Operational Watchlist */}
        <div className="bg-white border border-slate-200 p-6 rounded lg:col-span-7 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-[#04044A] text-xs uppercase tracking-wider font-sans">Operational Watchlist — Top 5 Exposed Roles</h4>
              <p className="text-[10px] text-slate-450 mt-0.5">Mapeamento dinâmico dos cargos União Bag com maior vulnerabilidade de sucessão</p>
            </div>
            <button 
              onClick={() => onNavigateTab("ranking")} 
              className="text-[#000675] hover:text-[#00A4FF] font-bold text-xs flex items-center gap-0.5 transition-all cursor-pointer border-0 bg-transparent"
            >
              <span>Ver Base Completa</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#000675]" />
            </button>
          </div>

          <div className="space-y-3">
            {top5VulnerableList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Nenhum cargo registrado.</p>
            ) : (
              top5VulnerableList.map((f) => (
                <div 
                  key={f.id} 
                  className="p-3 rounded border border-slate-200 bg-[#F8FAFC]/50 hover:bg-[#F8FAFC] transition-all flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono bg-white border border-slate-250 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500">{f.idFuncao}</span>
                      <span className="font-bold text-slate-800 truncate">{f.funcaoCritica}</span>
                      {f.riskScore >= 75 && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[8px] font-bold uppercase shrink-0">Crítico</span>
                      )}
                    </div>
                    <p className="text-slate-450 truncate text-[11px]">{f.setor} — {f.processo}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block font-mono font-bold text-sm text-rose-600">
                      {f.riskScore}
                    </span>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Score de Risco</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PDCA / Action Plan quick view - Executive Alert Center */}
        <div className="bg-white border border-slate-200 p-6 rounded lg:col-span-5 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-[#04044A] text-xs uppercase tracking-wider font-sans">Executive Alert Center</h4>
              <p className="text-[10px] text-slate-450 mt-0.5">Rotas de contingenciamento e conformidade de SGQ</p>
            </div>
            <button 
              onClick={() => onNavigateTab("plano")} 
              className="text-[#000675] hover:text-[#00A4FF] font-bold text-xs flex items-center gap-0.5 transition-all cursor-pointer border-0 bg-transparent"
            >
              <span>Gerenciar Planos</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#000675]" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F8FAFC] rounded p-4 border border-slate-150 flex flex-col justify-between h-24">
              <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Mitigação Concluída</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-mono font-bold text-teal-650">{acoesConcluidas}</span>
                <span className="text-[10px] text-slate-400 font-mono">/ {totalAcoes} ações</span>
              </div>
              <div className="w-full bg-slate-250 h-1 rounded overflow-hidden mt-1">
                <div className="bg-[#000675] h-1" style={{ width: `${acoesPercent}%` }}></div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] rounded p-4 border border-slate-150 flex flex-col justify-between h-24">
              <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Mitigações Abertas</span>
              <div className="mt-1">
                <span className="text-2xl font-mono font-bold text-[#000675]">{acoesEmExecucao}</span>
              </div>
              <p className="text-[9px] text-slate-450 font-bold tracking-wider uppercase leading-none">&#10226; Auditoria ISO em Foco</p>
            </div>
          </div>

          {/* Quick Quote of Audit guidance */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-start gap-2.5 text-xs text-[#04044A] leading-relaxed">
            <Award className="w-5 h-5 shrink-0 text-[#000675] mt-0.5" />
            <span>
              O item <strong className="font-bold">7.2 (Competências)</strong> da norma <strong className="font-bold">ISO 9001:2015</strong> exige que a União Bag S/A documente e valide a qualificação dos técnicos operacionais, provando com evidências auditáveis a retenção do conhecimento de fabricação.
            </span>
          </div>

        </div>

      </section>

    </div>
  );
}

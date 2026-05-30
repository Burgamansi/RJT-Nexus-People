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
  calculateBackupScore,
  calculateCoverageScore,
  calculateTrainingScore,
  calculateMaturityScore,
  getFunctionAlerts
} from "../types";

interface DashboardProps {
  funcoes: FuncaoCritica[];
  acoes: ActionPlan[];
  onNavigateTab: (tab: string) => void;
}

export default function Dashboard({ funcoes, acoes, onNavigateTab }: DashboardProps) {
  const totalFuncoes = funcoes.length;
  
  // Mapeamento real União Bag
  const criticalCount = funcoes.filter(f => 
    f.classificacaoFinal === "Crítico" || f.classificacaoFinal === "Alta"
  ).length;

  const withoutBackupCount = funcoes.filter(f => 
    f.existeBackup === "NÃO" || (f as any).backupStatus === "Sem backup"
  ).length;

  const backupCoveragePercent = totalFuncoes > 0 
    ? Math.round(((totalFuncoes - withoutBackupCount) / totalFuncoes) * 100) 
    : 0;

  // Aggregate stats
  let totalMaturity = 0;
  let totalCoverageScore = 0;
  let totalCriticalAlerts = 0;

  funcoes.forEach(f => {
    const bkp = calculateBackupScore(f);
    const cov = calculateCoverageScore(f);
    const trn = calculateTrainingScore(f, acoes);
    const mat = calculateMaturityScore(bkp, trn, cov);
    
    totalMaturity += mat;
    totalCoverageScore += cov;

    const alerts = getFunctionAlerts(f, acoes);
    totalCriticalAlerts += alerts.filter(al => al.active && al.severity === "critical").length;
  });

  const avgMaturity = totalFuncoes > 0 ? Math.round(totalMaturity / totalFuncoes) : 0;
  const avgCoverage = totalFuncoes > 0 ? Math.round(totalCoverageScore / totalFuncoes) : 0;

  // Knowledge Coverage percentage
  const knowledgeCoverageIndex = avgCoverage;

  // Selected Top 5 Vulnerable Functions (lowest maturity)
  const top5VulnerableList = [...funcoes]
    .map(f => {
      const bkp = calculateBackupScore(f);
      const cov = calculateCoverageScore(f);
      const trn = calculateTrainingScore(f, acoes);
      const mat = calculateMaturityScore(bkp, trn, cov);
      return { ...f, maturityScore: mat };
    })
    .sort((a, b) => a.maturityScore - b.maturityScore)
    .slice(0, 5);

  // Actions status tracker (Safely derived from PDCA/action data)
  const totalAcoes = acoes ? acoes.length : 0;
  const acoesConcluidas = acoes ? acoes.filter(a => a.status === "Concluido" || a.status === "Concluído").length : 0;
  const acoesEmExecucao = acoes ? acoes.filter(a => a.status === "Em Execução").length : 0;
  const acoesPercent = totalAcoes > 0 ? Math.round((acoesConcluidas / totalAcoes) * 100) : 0;

  // Departments for the new heatmap
  const UBG_DEPARTMENTS = [
    "Produção – Corte",
    "Produção – Costura",
    "Produção – Apoio",
    "Produção – Processos",
    "Expedição",
    "Logística / Transporte",
    "Compras / Suprimentos",
    "Financeiro",
    "Recursos Humanos",
    "Manutenção",
    "Gestão Administrativa",
    "Restaurante Industrial",
    "Serviços Gerais"
  ];

  // Workforce Risk Heatmap Department Calculation
  const heatmapData = UBG_DEPARTMENTS.map(dept => {
    const deptFunctions = funcoes.filter(f => f.setor.toLowerCase() === dept.toLowerCase());
    const count = deptFunctions.length;
    
    // Average risk score calculation (0 to 100)
    const totalRisk = deptFunctions.reduce((sum, f) => sum + f.scoreVulnerabilidade, 0);
    const avgRisk = count > 0 ? Math.round(totalRisk / count) : 0;

    return {
      department: dept,
      count,
      avgRisk
    };
  });

  return (
    <div className="space-y-8 text-[#04044A] antialiased">
      
      {/* 13. Workforce Command Center Header */}
      <div className="bg-white border border-slate-200 rounded p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[10px] font-bold text-[#00A4FF] tracking-wider uppercase">Workforce Command Center</span>
          <h2 className="text-xl font-bold tracking-tight text-[#04044A] mt-1">Real-Time Resilience Cockpit</h2>
          <p className="text-xs text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
            Plataforma de alta governança de capital humano da União Bag S/A. Mapeamento consolidado de funções críticas do Cadastro Mestre de Funções, auditorias ISO 9001:2015 e redundâncias operacionais.
          </p>
        </div>
        <button
          onClick={() => onNavigateTab("cadastro")}
          className="px-4 py-2 bg-[#000675] hover:bg-[#04044A] active:bg-black text-white text-xs font-bold rounded transition-all shrink-0 cursor-pointer border-0"
        >
          Cadastrar Nova Função
        </button>
      </div>

      {/* 3. EXECUTIVE DASHBOARD PRIMARY INDEXES */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1: Total Functions */}
        <div className="bg-white border border-slate-200 p-5 rounded flex flex-col justify-between h-32">
          <div>
            <span className="text-[9px] font-bold tracking-wider text-slate-450 uppercase">TOTAL DE FUNÇÕES</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-mono font-bold text-[#04044A]">{totalFuncoes}</span>
            </div>
          </div>
          <span className="text-[9px] text-[#00A4FF] font-bold uppercase tracking-wider">União Bag Mapeadas</span>
        </div>

        {/* Metric 2: Critical Functions */}
        <div className="bg-white border border-slate-200 p-5 rounded flex flex-col justify-between h-32">
          <div>
            <span className="text-[9px] font-bold tracking-wider text-slate-450 uppercase font-sans">CRITICAL FUNCTIONS</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-mono font-bold text-rose-600">{criticalCount}</span>
            </div>
          </div>
          <span className="text-[9px] text-rose-600 font-bold uppercase tracking-wider">Foco Sucessório</span>
        </div>

        {/* Metric 3: Without Backup */}
        <div className="bg-white border border-slate-200 p-5 rounded flex flex-col justify-between h-32">
          <div>
            <span className="text-[9px] font-bold tracking-wider text-slate-450 uppercase">SEM BACKUP ATIVO</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-mono font-bold text-amber-600">{withoutBackupCount}</span>
            </div>
          </div>
          <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider">exposição direta</span>
        </div>

        {/* Metric 4: Backup Coverage */}
        <div className="bg-white border border-slate-200 p-5 rounded flex flex-col justify-between h-32">
          <div>
            <span className="text-[9px] font-bold tracking-wider text-slate-450 uppercase">BACKUP COVERAGE</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-mono font-bold text-[#000675]">{backupCoveragePercent}.0%</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded overflow-hidden">
            <div className="bg-[#000675] h-1" style={{ width: `${backupCoveragePercent}%` }}></div>
          </div>
        </div>

        {/* Metric 5: Knowledge Coverage */}
        <div className="bg-white border border-slate-200 p-5 rounded flex flex-col justify-between h-32">
          <div>
            <span className="text-[9px] font-bold tracking-wider text-slate-450 uppercase">KNOWLEDGE COVERAGE</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-mono font-bold text-[#00E7F8]">{knowledgeCoverageIndex}.0%</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded overflow-hidden">
            <div className="bg-[#00E7F8] h-1" style={{ width: `${knowledgeCoverageIndex}%` }}></div>
          </div>
        </div>

      </section>

      {/* 4. WORKFORCE RISK HEATMAP */}
      <section className="bg-white border border-slate-200 p-6 rounded space-y-4">
        <div>
          <span className="text-[9px] font-bold text-[#00A4FF] uppercase tracking-widest block font-sans">Visual Matrix</span>
          <h3 className="text-sm font-bold uppercase text-[#04044A] tracking-wider mt-0.5">Workforce Risk Heatmap (Mapeamento de Riscos por Setores)</h3>
          <p className="text-[11px] text-slate-500">Exposição volumétrica e score médio de vulnerabilidade de pessoal por departamento operacional União Bag S/A.</p>
        </div>

        {/* Dynamic Heatmap Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
          {heatmapData.map((data) => {
            // Determine risk colors by department average risk score (0 to 100 scale)
            let riskColor = "bg-slate-50 border-slate-200 text-slate-500";
            let riskLabel = "Sem risco";
            if (data.count > 0) {
              if (data.avgRisk >= 60) {
                riskColor = "bg-rose-50/70 border-rose-200 text-rose-800";
                riskLabel = "Alto risco";
              } else if (data.avgRisk >= 20) {
                riskColor = "bg-amber-50/70 border-amber-200 text-amber-800";
                riskLabel = "Risco moderado";
              } else {
                riskColor = "bg-teal-50/70 border-teal-200 text-teal-800";
                riskLabel = "Baixo risco";
              }
            }

            return (
              <div key={data.department} className={`p-4 border rounded flex flex-col justify-between h-28 transition-colors hover:shadow-sm ${riskColor}`}>
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider line-clamp-1 flex-1 pr-1">{data.department}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest px-1 py-0.5 rounded bg-white/80 shrink-0">{riskLabel}</span>
                  </div>
                  <p className="text-xs font-mono font-bold mt-1 text-slate-400">
                    {data.count} {data.count === 1 ? 'Cargo Mapeado' : 'Cargos Mapeados'}
                  </p>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-black/5">
                  <span className="text-[9px] font-bold uppercase">Avg Risk:</span>
                  <span className="text-lg font-mono font-bold">{data.avgRisk}.00</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. OPERATIONAL WATCHLIST & EXECUTIVE ALERT CENTER */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top 5 Vulnerable Functions list - Operational Watchlist */}
        <div className="bg-white border border-slate-200 p-6 rounded lg:col-span-7 space-y-4">
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
                    </div>
                    <p className="text-slate-450 truncate text-[11px]">{f.setor} — {f.processo}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`block font-mono font-bold text-sm ${
                      f.maturityScore < 50 ? "text-rose-600" : "text-amber-600"
                    }`}>
                      {f.maturityScore}.00%
                    </span>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Maturidade</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PDCA / Action Plan quick view - Executive Alert Center */}
        <div className="bg-white border border-slate-200 p-6 rounded lg:col-span-5 space-y-4">
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
              <div className="w-full bg-slate-200 h-1 rounded overflow-hidden mt-1">
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

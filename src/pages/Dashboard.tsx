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
  getFunctionAlerts,
  SETORES
} from "../types";

interface DashboardProps {
  funcoes: FuncaoCritica[];
  acoes: ActionPlan[];
  onNavigateTab: (tab: string) => void;
}

export default function Dashboard({ funcoes, acoes, onNavigateTab }: DashboardProps) {
  const totalFuncoes = funcoes.length;
  
  // Calculate aggregate metrics
  let totalMaturity = 0;
  let totalBackupScore = 0;
  let totalCoverageScore = 0;
  let totalTrainingScore = 0;
  let totalCriticalAlerts = 0;
  let totalWarningAlerts = 0;

  funcoes.forEach(f => {
    const bkp = calculateBackupScore(f);
    const cov = calculateCoverageScore(f);
    const trn = calculateTrainingScore(f, acoes);
    const mat = calculateMaturityScore(bkp, trn, cov);
    
    totalMaturity += mat;
    totalBackupScore += bkp;
    totalCoverageScore += cov;
    totalTrainingScore += trn;

    const alerts = getFunctionAlerts(f, acoes);
    totalCriticalAlerts += alerts.filter(al => al.active && al.severity === "critical").length;
    totalWarningAlerts += alerts.filter(al => al.active && al.severity === "warning").length;
  });

  const avgMaturity = totalFuncoes > 0 ? Math.round(totalMaturity / totalFuncoes) : 0;
  const avgBackup = totalFuncoes > 0 ? Math.round(totalBackupScore / totalFuncoes) : 0;
  const avgCoverage = totalFuncoes > 0 ? Math.round(totalCoverageScore / totalFuncoes) : 0;
  const avgTraining = totalFuncoes > 0 ? Math.round(totalTrainingScore / totalFuncoes) : 0;

  // 15. Global Resilience Index (Maturity score of the workforce)
  const globalResilienceIndex = avgMaturity;

  // 16. Operational Vulnerability Index (Active critical alerts percentage)
  const operationalVulnerabilityIndex = totalFuncoes > 0 
    ? Math.min(100, Math.round((totalCriticalAlerts / totalFuncoes) * 100))
    : 0;

  // 17. Backup Coverage Index (Average backup score)
  const backupCoverageIndex = avgBackup;

  // 18. Knowledge Coverage Index (Average coverage score)
  const knowledgeCoverageIndex = avgCoverage;

  // GUT Classification Counts
  const criticosCount = funcoes.filter(f => f.classificacaoFinal === "Crítico").length;
  const altosCount = funcoes.filter(f => f.classificacaoFinal === "Alto").length;
  const mediosCount = funcoes.filter(f => f.classificacaoFinal === "Médio").length;
  const baixosCount = funcoes.filter(f => f.classificacaoFinal === "Baixo").length;

  // Actions status tracker
  const totalAcoes = acoes.length;
  const acoesConcluidas = acoes.filter(a => a.status === "Concluido").length;
  const acoesEmExecucao = acoes.filter(a => a.status === "Em Execução").length;
  const acoesPercent = totalAcoes > 0 ? Math.round((acoesConcluidas / totalAcoes) * 100) : 0;

  // Sector stats
  const sectorMap: { [key: string]: { total: number; mSum: number; critCount: number } } = {};
  funcoes.forEach(f => {
    const bkp = calculateBackupScore(f);
    const cov = calculateCoverageScore(f);
    const trn = calculateTrainingScore(f, acoes);
    const mat = calculateMaturityScore(bkp, trn, cov);

    if (!sectorMap[f.setor]) {
      sectorMap[f.setor] = { total: 0, mSum: 0, critCount: 0 };
    }
    sectorMap[f.setor].total += 1;
    sectorMap[f.setor].mSum += mat;
    if (f.classificacaoFinal === "Crítico") {
      sectorMap[f.setor].critCount += 1;
    }
  });

  const sectorData = Object.keys(sectorMap).map(sec => ({
    name: sec,
    count: sectorMap[sec].total,
    mAvg: Math.round(sectorMap[sec].mSum / sectorMap[sec].total),
    critCount: sectorMap[sec].critCount
  })).sort((a, b) => b.count - a.count);

  // Top 3 functions needing critical succession support (lowest maturity)
  const priorityMaturityList = [...funcoes]
    .map(f => {
      const bkp = calculateBackupScore(f);
      const cov = calculateCoverageScore(f);
      const trn = calculateTrainingScore(f, acoes);
      const mat = calculateMaturityScore(bkp, trn, cov);
      return { ...f, maturityScore: mat };
    })
    .sort((a, b) => a.maturityScore - b.maturityScore)
    .slice(0, 3);

  // Mapped list of sectors in Union Bag for the Heatmap Grid
  const heatmapSectors = ["PRODUÇÃO", "MANUTENÇÃO", "QUALIDADE", "LOGÍSTICA", "ADMINISTRATIVO"];
  const severityLevels = ["Crítico", "Alto", "Médio", "Baixo"];

  // Heatmap counting matrix [sector][severity]
  const getHeatmapCount = (sector: string, severity: string) => {
    return funcoes.filter(f => f.setor.toUpperCase() === sector && f.classificacaoFinal === severity).length;
  };

  return (
    <div className="space-y-8 text-[#04044A] antialiased">
      
      {/* 13. Workforce Command Center Header (Real-Time Resilience Cockpit) */}
      <div className="bg-white border border-slate-200 rounded p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[10px] font-bold text-[#00A4FF] tracking-wider uppercase">Workforce Command Center</span>
          <h2 className="text-xl font-bold tracking-tight text-[#04044A] mt-1">Real-Time Resilience Cockpit</h2>
          <p className="text-xs text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
            Plataforma de alta governança humana da União Bag S/A. Monitoramento contínuo de vulnerabilidades operacionais, planos de redundância de equipe, mapeamento de competências críticas e conformidade técnica ISO 9001:2015.
          </p>
        </div>
        <button
          onClick={() => onNavigateTab("cadastro")}
          className="px-4 py-2 bg-[#000675] hover:bg-[#04044A] active:bg-black text-white text-xs font-bold rounded transition-all shrink-0 cursor-pointer border-0"
        >
          Mapear Nova Competência
        </button>
      </div>

      {/* 6. HIGH-DENSITY ENTERPRISE GOVERNANCE INDEX BLOCK */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 15. Global Resilience Index Card */}
        <div className="bg-white border border-slate-200 p-6 rounded flex flex-col justify-between h-36">
          <div>
            <span className="text-[9px] font-bold tracking-wider text-slate-450 uppercase">GLOBAL RESILIENCE INDEX</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-mono font-bold tracking-tight text-[#000675]">{globalResilienceIndex}.00%</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 h-1 rounded overflow-hidden">
              <div className="bg-[#000675] h-1" style={{ width: `${globalResilienceIndex}%` }}></div>
            </div>
            <div className="flex justify-between text-[9px] text-slate-450 font-bold uppercase tracking-wider">
              <span>Maturidade Geral</span>
              <span className="text-[#000675]">{globalResilienceIndex >= 75 ? "Ótimo" : "Sob Atenção"}</span>
            </div>
          </div>
        </div>

        {/* 16. Operational Vulnerability Index Card */}
        <div className="bg-white border border-slate-200 p-6 rounded flex flex-col justify-between h-36">
          <div>
            <span className="text-[9px] font-bold tracking-wider text-slate-450 uppercase">OPERATIONAL VULNERABILITY</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-3xl font-mono font-bold tracking-tight ${operationalVulnerabilityIndex > 25 ? 'text-rose-600' : 'text-[#04044A]'}`}>
                {operationalVulnerabilityIndex}.00%
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 h-1 rounded overflow-hidden">
              <div className={`h-1 ${operationalVulnerabilityIndex > 25 ? 'bg-rose-500' : 'bg-slate-350'}`} style={{ width: `${operationalVulnerabilityIndex}%` }}></div>
            </div>
            <div className="flex justify-between text-[9px] text-slate-450 font-bold uppercase tracking-wider">
              <span>Alertas Críticos Ativos</span>
              <span>{totalCriticalAlerts} pendentes</span>
            </div>
          </div>
        </div>

        {/* 17. Backup Coverage Index Card */}
        <div className="bg-white border border-slate-200 p-6 rounded flex flex-col justify-between h-36">
          <div>
            <span className="text-[9px] font-bold tracking-wider text-slate-450 uppercase">BACKUP COVERAGE INDEX</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-mono font-bold tracking-tight text-[#00A4FF]">{backupCoverageIndex}.00%</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 h-1 rounded overflow-hidden">
              <div className="bg-[#00A4FF] h-1" style={{ width: `${backupCoverageIndex}%` }}></div>
            </div>
            <div className="flex justify-between text-[9px] text-slate-450 font-bold uppercase tracking-wider">
              <span>Redundância Nominal</span>
              <span>Méd. {backupCoverageIndex}%</span>
            </div>
          </div>
        </div>

        {/* 18. Knowledge Coverage Index Card */}
        <div className="bg-white border border-slate-200 p-6 rounded flex flex-col justify-between h-36">
          <div>
            <span className="text-[9px] font-bold tracking-wider text-slate-450 uppercase">KNOWLEDGE COVERAGE INDEX</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-mono font-bold tracking-tight text-[#00E7F8]">{knowledgeCoverageIndex}.00%</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 h-1 rounded overflow-hidden">
              <div className="bg-[#00E7F8] h-1" style={{ width: `${knowledgeCoverageIndex}%` }}></div>
            </div>
            <div className="flex justify-between text-[9px] text-slate-450 font-bold uppercase tracking-wider">
              <span>Polivalência do Time</span>
              <span>Média Geral</span>
            </div>
          </div>
        </div>

      </section>

      {/* 14. LARGE WORKFORCE RISK HEATMAP */}
      <section className="bg-white border border-slate-200 p-6 rounded space-y-4">
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Matriz Científica de Governança</span>
          <h3 className="text-sm font-bold uppercase text-[#04044A] tracking-wider mt-0.5">Workforce Risk Heatmap (Mapeamento GUT de Setores)</h3>
          <p className="text-[11px] text-slate-500">Distribuição dinâmica de cargos mapeados com base na criticidade GUT de conhecimento versus setores da União Bag S/A.</p>
        </div>

        {/* Heatmap Grid Layout */}
        <div className="border border-slate-200 rounded overflow-hidden">
          <div className="grid grid-cols-5 bg-slate-50 border-b border-slate-200 text-center font-bold text-[10px] text-slate-500 uppercase tracking-wider py-2">
            <div className="text-left pl-4">SETOR / DEPARTAMENTO</div>
            <div>CRÍTICO</div>
            <div>ALTO</div>
            <div>MÉDIO</div>
            <div>BAIXO</div>
          </div>
          <div className="divide-y divide-slate-200">
            {heatmapSectors.map((sector) => (
              <div key={sector} className="grid grid-cols-5 items-center text-center py-3 hover:bg-slate-50 transition-colors">
                <div className="text-left pl-4 font-bold text-xs text-slate-700">{sector}</div>
                {severityLevels.map((severity) => {
                  const count = getHeatmapCount(sector, severity);
                  
                  // Strict monochromatic/cyan scale based on count intensity
                  let cellClass = "border border-slate-100 bg-white text-slate-400";
                  if (count > 0) {
                    if (severity === "Crítico") {
                      cellClass = "bg-[#04044A] text-white font-bold border border-[#04044A]";
                    } else if (severity === "Alto") {
                      cellClass = "bg-[#000675] text-white font-bold border border-[#000675]";
                    } else if (severity === "Médio") {
                      cellClass = "bg-[#00A4FF]/20 text-[#000675] font-bold border border-[#00A4FF]/30";
                    } else {
                      cellClass = "bg-[#00E7F8]/20 text-[#000675] font-bold border border-[#00E7F8]/30";
                    }
                  } else {
                    cellClass = "border border-dashed border-slate-200 text-slate-300";
                  }

                  return (
                    <div key={severity} className="px-4">
                      <div className={`py-2 text-xs rounded transition-all font-mono ${cellClass}`}>
                        {count > 0 ? `${count} ${count === 1 ? 'Cargo' : 'Cargos'}` : "0"}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="flex flex-wrap gap-4 text-[10px] text-slate-550 font-bold uppercase tracking-wider pt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#04044A] border border-[#04044A]"></span>
            <span>Risco Crítico (Exigência PDCA)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#000675] border border-[#000675]"></span>
            <span>Risco Alto (Sucessão Necessária)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#00A4FF]/20 border border-[#00A4FF]/30"></span>
            <span>Risco Médio (Monitoramento)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#00E7F8]/20 border border-[#00E7F8]/30"></span>
            <span>Risco Baixo (Estável)</span>
          </div>
        </div>
      </section>

      {/* DETAILED DATA MATRICES */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sector Resilience Progress Grid */}
        <div className="bg-white border border-slate-200 p-6 rounded lg:col-span-7 space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-[#04044A] text-xs uppercase tracking-wider">Maturidade de Conhecimento por Setor</h4>
              <p className="text-[10px] text-slate-450 mt-0.5">Volumetria e média ponderada de polivalência</p>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ordenado por Mapeadas</span>
          </div>

          <div className="space-y-4">
            {sectorData.length === 0 ? (
              <p className="text-xs text-slate-450 text-center py-10">Nenhum dado cadastrado.</p>
            ) : (
              sectorData.map((sec) => {
                const maxCount = Math.max(...sectorData.map(s => s.count)) || 1;
                const progressPercent = (sec.count / maxCount) * 100;
                return (
                  <div key={sec.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">{sec.name}</span>
                      <div className="flex items-center gap-3 font-semibold text-[11px]">
                        <span className="text-slate-400 font-mono">{sec.count} {sec.count === 1 ? 'função' : 'funções'}</span>
                        <span className="text-[#000675] font-mono">Maturidade {sec.mAvg}.00%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded overflow-hidden border border-slate-200">
                      <div 
                        className={`h-2.5 rounded transition-all duration-500 ${
                          sec.mAvg < 50 
                            ? "bg-rose-500" 
                            : sec.mAvg < 75 
                            ? "bg-amber-400" 
                            : "bg-[#00A4FF]"
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Global Criticality Donut */}
        <div className="bg-white border border-slate-200 p-6 rounded lg:col-span-5 space-y-5">
          <div>
            <h4 className="font-bold text-[#04044A] text-xs uppercase tracking-wider">Distribuição Geral de Criticidade (GUT)</h4>
            <p className="text-[10px] text-slate-450 mt-0.5">Impacto operacional geral da ausência de profissionais</p>
          </div>

          <div className="flex items-center justify-center py-2 relative">
            <svg className="w-36 h-36" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Critical slice */}
              <circle
                className="text-rose-500"
                strokeWidth="4"
                strokeDasharray={`${totalFuncoes > 0 ? (criticosCount / totalFuncoes) * 100 : 0}, 100`}
                stroke="currentColor"
                fill="none"
                cx="18"
                cy="18"
                r="15.9155"
              />
              {/* High slice */}
              <circle
                className="text-amber-500"
                strokeWidth="4"
                strokeDashoffset={`-${totalFuncoes > 0 ? (criticosCount / totalFuncoes) * 100 : 0}`}
                strokeDasharray={`${totalFuncoes > 0 ? (altosCount / totalFuncoes) * 100 : 0}, 100`}
                stroke="currentColor"
                fill="none"
                cx="18"
                cy="18"
                r="15.9155"
              />
              {/* Medium slice */}
              <circle
                className="text-[#000675]"
                strokeWidth="4"
                strokeDashoffset={`-${totalFuncoes > 0 ? ((criticosCount + altosCount) / totalFuncoes) * 100 : 0}`}
                strokeDasharray={`${totalFuncoes > 0 ? (mediosCount / totalFuncoes) * 100 : 0}, 100`}
                stroke="currentColor"
                fill="none"
                cx="18"
                cy="18"
                r="15.9155"
              />
              {/* Low slice */}
              <circle
                className="text-teal-500"
                strokeWidth="4"
                strokeDashoffset={`-${totalFuncoes > 0 ? ((criticosCount + altosCount + mediosCount) / totalFuncoes) * 100 : 0}`}
                strokeDasharray={`${totalFuncoes > 0 ? (baixosCount / totalFuncoes) * 100 : 0}, 100`}
                stroke="currentColor"
                fill="none"
                cx="18"
                cy="18"
                r="15.9155"
              />
            </svg>
            <div className="absolute text-center">
              <span className="block text-2xl font-mono font-bold text-[#04044A]">{totalFuncoes}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Cargos</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-650 font-semibold">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded p-1.5">
              <span className="w-2 h-2 rounded bg-rose-500 block shrink-0"></span>
              <span className="truncate text-[10px] font-mono">Crítico ({criticosCount})</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded p-1.5">
              <span className="w-2 h-2 rounded bg-amber-500 block shrink-0"></span>
              <span className="truncate text-[10px] font-mono">Alto ({altosCount})</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded p-1.5">
              <span className="w-2 h-2 rounded bg-[#000675] block shrink-0"></span>
              <span className="truncate text-[10px] font-mono">Médio ({mediosCount})</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded p-1.5">
              <span className="w-2 h-2 rounded bg-teal-500 block shrink-0"></span>
              <span className="truncate text-[10px] font-mono">Baixo ({baixosCount})</span>
            </div>
          </div>
        </div>

      </section>

      {/* HIGHEST VULNERABILITY ALERT SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Highest vulnerability list */}
        <div className="bg-white border border-slate-200 p-6 rounded space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-[#04044A] text-xs uppercase tracking-wider">Fichas de Exposição Crítica</h4>
              <p className="text-[10px] text-slate-450">Cargos prioritários de sucessão por menor maturidade de equipe</p>
            </div>
            <button 
              onClick={() => onNavigateTab("ranking")} 
              className="text-[#000675] hover:text-[#00A4FF] font-bold text-xs flex items-center gap-0.5 transition-all cursor-pointer border-0 bg-transparent"
            >
              <span>Ver Perfis</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#000675]" />
            </button>
          </div>

          <div className="space-y-3">
            {priorityMaturityList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Nenhum cargo de alta criticidade registrado.</p>
            ) : (
              priorityMaturityList.map((f) => (
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
                    <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Resiliência</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PDCA / Action Plan quick view */}
        <div className="bg-white border border-slate-200 p-6 rounded space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-[#04044A] text-xs uppercase tracking-wider">Ações Corretivas PDCA</h4>
              <p className="text-[10px] text-slate-450">Ações de mitigação de vulnerabilidade humana mapeadas</p>
            </div>
            <button 
              onClick={() => onNavigateTab("plano")} 
              className="text-[#000675] hover:text-[#00A4FF] font-bold text-xs flex items-center gap-0.5 transition-all cursor-pointer border-0 bg-transparent"
            >
              <span>Gerenciar Sucessões</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#000675]" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F8FAFC] rounded p-4 border border-slate-150 flex flex-col justify-between h-24">
              <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Capacitação Concluída</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-mono font-bold text-teal-650">{acoesConcluidas}</span>
                <span className="text-[10px] text-slate-400 font-mono">/ {totalAcoes} acões</span>
              </div>
              <div className="w-full bg-slate-200 h-1 rounded overflow-hidden mt-1">
                <div className="bg-teal-500 h-1" style={{ width: `${acoesPercent}%` }}></div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] rounded p-4 border border-slate-150 flex flex-col justify-between h-24">
              <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Ações em Andamento</span>
              <div className="mt-1">
                <span className="text-2xl font-mono font-bold text-[#000675]">{acoesEmExecucao}</span>
              </div>
              <p className="text-[9.5px] text-slate-400 font-bold tracking-wider uppercase leading-none">&#10226; Conformidade Garantida</p>
            </div>
          </div>

          {/* Quick Quote of Audit guidance */}
          <div className="p-3.5 bg-slate-50 border border-slate-250 rounded flex items-start gap-3 text-xs text-[#04044A]">
            <Award className="w-5 h-5 shrink-0 text-[#000675] mt-0.5" />
            <span className="leading-relaxed">
              O requisito <strong className="font-bold">7.2 (Competências)</strong> da norma <strong className="font-bold">ISO 9001:2015</strong> exige que a União Bag S/A determine a competência necessária das pessoas que realizam trabalhos sob o seu controle, assegurando que estas sejam competentes com base em educação, treinamento ou experiência apropriada.
            </span>
          </div>

        </div>

      </section>

    </div>
  );
}

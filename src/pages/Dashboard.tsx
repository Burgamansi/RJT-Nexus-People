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
  UserCheck
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
import { AnimatedCounter } from "../components/AnimatedCounter";

interface DashboardProps {
  funcoes: FuncaoCritica[];
  acoes: ActionPlan[];
  onNavigateTab: (tab: string) => void;
}

export default function Dashboard({ funcoes, acoes, onNavigateTab }: DashboardProps) {
  const totalFuncoes = funcoes.length;
  
  // Calculate aggregate metrics using the new calculators
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
  const sectorMap: { [key: string]: { total: number; mSum: number } } = {};
  funcoes.forEach(f => {
    const bkp = calculateBackupScore(f);
    const cov = calculateCoverageScore(f);
    const trn = calculateTrainingScore(f, acoes);
    const mat = calculateMaturityScore(bkp, trn, cov);

    if (!sectorMap[f.setor]) {
      sectorMap[f.setor] = { total: 0, mSum: 0 };
    }
    sectorMap[f.setor].total += 1;
    sectorMap[f.setor].mSum += mat;
  });

  const sectorData = Object.keys(sectorMap).map(sec => ({
    name: sec,
    count: sectorMap[sec].total,
    mAvg: Math.round(sectorMap[sec].mSum / sectorMap[sec].total)
  })).sort((a, b) => b.count - a.count);

  // Top 3 functions needing critical succession support (sorted by lowest maturity)
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

  return (
    <div className="space-y-6 animate-fade-in relative z-10 text-slate-800">
      
      {/* Dynamic Introduction Header */}
      <div className="bg-gradient-to-r from-indigo-600/5 to-violet-600/5 border border-slate-200 backdrop-blur-md rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">Mesa de Talentos & People Analytics</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            Visão consolidada do capital humano da União Bag S/A. Acompanhe a robustez operacional, polivalência de equipe, mitigação de riscos de sucessão e conformidade com o SGQ.
          </p>
        </div>
        <button
          onClick={() => onNavigateTab("cadastro")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-lg shadow-md transition-all shrink-0 cursor-pointer border-0"
        >
          Mapear Nova Competência
        </button>
      </div>

      {/* KPI GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Cargos Mapeados</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                <AnimatedCounter value={totalFuncoes} />
              </h3>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 shadow-sm">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Governança Humana Integrada</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Alertas Críticos Ativos</p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">
                <AnimatedCounter value={totalCriticalAlerts} />
              </h3>
            </div>
            <div className={`p-2.5 rounded-lg border shadow-sm ${totalCriticalAlerts > 0 ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse-slow' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${totalCriticalAlerts > 0 ? 'bg-rose-500' : 'bg-slate-300'}`}></span>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Lacunas imediatas de backup</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Maturidade de Talentos</p>
              <h3 className="text-2xl font-black text-indigo-600 mt-1">{avgMaturity}%</h3>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 shadow-sm">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
            <div className="bg-indigo-600 h-1 rounded-full" style={{ width: `${avgMaturity}%` }}></div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Capacitação / Skills</p>
              <h3 className="text-2xl font-black text-teal-600 mt-1">{avgTraining}%</h3>
            </div>
            <div className="p-2.5 bg-teal-50 text-teal-650 rounded-lg border border-teal-100 shadow-sm">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Redundância: {avgBackup}%</span>
            <span>Cobertura: {avgCoverage}%</span>
          </div>
        </div>

      </section>

      {/* MATRIX AND CHART SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Risk Distribution Visual (Donut SVG representation) */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm lg:col-span-4 space-y-5">
          <div>
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Criticidade GUT do Conhecimento</h4>
            <p className="text-[10px] text-slate-450 mt-0.5">Impacto operacional da ausência inesperada</p>
          </div>

          <div className="flex items-center justify-center py-4 relative">
            {/* Custom Responsive SVG Donut Chart */}
            <svg className="w-40 h-40" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Critical slice */}
              <circle
                className="text-rose-500"
                strokeWidth="3.8"
                strokeDasharray={`${totalFuncoes > 0 ? (criticosCount / totalFuncoes) * 100 : 0}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                cx="18"
                cy="18"
                r="15.9155"
              />
              {/* High slice */}
              <circle
                className="text-amber-500"
                strokeWidth="3.8"
                strokeDashoffset={`-${totalFuncoes > 0 ? (criticosCount / totalFuncoes) * 100 : 0}`}
                strokeDasharray={`${totalFuncoes > 0 ? (altosCount / totalFuncoes) * 100 : 0}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                cx="18"
                cy="18"
                r="15.9155"
              />
              {/* Medium slice */}
              <circle
                className="text-indigo-650"
                strokeWidth="3.8"
                strokeDashoffset={`-${totalFuncoes > 0 ? ((criticosCount + altosCount) / totalFuncoes) * 100 : 0}`}
                strokeDasharray={`${totalFuncoes > 0 ? (mediosCount / totalFuncoes) * 100 : 0}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                cx="18"
                cy="18"
                r="15.9155"
              />
              {/* Low slice */}
              <circle
                className="text-teal-500"
                strokeWidth="3.8"
                strokeDashoffset={`-${totalFuncoes > 0 ? ((criticosCount + altosCount + mediosCount) / totalFuncoes) * 100 : 0}`}
                strokeDasharray={`${totalFuncoes > 0 ? (baixosCount / totalFuncoes) * 100 : 0}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                cx="18"
                cy="18"
                r="15.9155"
              />
            </svg>
            <div className="absolute text-center">
              <span className="block text-2xl font-black text-slate-800">{totalFuncoes}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Mapeadas</span>
            </div>
          </div>

          {/* Color Indicators Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-semibold">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-md p-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 block shrink-0"></span>
              <span className="truncate text-[10px]">Crítico ({criticosCount})</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-md p-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 block shrink-0"></span>
              <span className="truncate text-[10px]">Alto ({altosCount})</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-md p-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-650 block shrink-0"></span>
              <span className="truncate text-[10px]">Médio ({mediosCount})</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-md p-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 block shrink-0"></span>
              <span className="truncate text-[10px]">Baixo ({baixosCount})</span>
            </div>
          </div>
        </div>
 
        {/* Sector Analytics Progress Grid */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm lg:col-span-8 space-y-5">
          <div className="flex justify-between items-center border-b border-slate-150 pb-3">
            <div>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Robusto de Conhecimento por Setor</h4>
              <p className="text-[10px] text-slate-450">Volumetria e média de maturidade de talentos UBG</p>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ordenado por Mapeadas</span>
          </div>

          <div className="space-y-4">
            {sectorData.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">Nenhum dado cadastrado para consolidar.</p>
            ) : (
              sectorData.map((sec) => {
                const maxCount = Math.max(...sectorData.map(s => s.count)) || 1;
                const progressPercent = (sec.count / maxCount) * 100;
                return (
                  <div key={sec.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">{sec.name}</span>
                      <div className="flex items-center gap-3 font-semibold text-[11px]">
                        <span className="text-slate-400">{sec.count} {sec.count === 1 ? 'função' : 'funções'}</span>
                        <span className="text-indigo-600">Maturidade &oslash; {sec.mAvg}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          sec.mAvg < 50 
                            ? "bg-rose-500" 
                            : sec.mAvg < 75 
                            ? "bg-amber-400" 
                            : "bg-teal-500"
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

      </section>

      {/* HIGHEST VULNERABILITY ALERT SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Highest vulnerability list */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Funções Prioritárias de Sucessão</h4>
              <p className="text-[10px] text-slate-450">Cargos cruciais com os menores scores de maturidade de equipe</p>
            </div>
            <button 
              onClick={() => onNavigateTab("ranking")} 
              className="text-indigo-600 hover:text-indigo-700 font-bold text-xs flex items-center gap-0.5 transition-all cursor-pointer border-0 bg-transparent"
            >
              <span>Ver Perfis</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
            </button>
          </div>

          <div className="space-y-3">
            {priorityMaturityList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Nenhuma função crítica cadastrada.</p>
            ) : (
              priorityMaturityList.map((f) => (
                <div 
                  key={f.id} 
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono bg-white border border-slate-250 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500">{f.idFuncao}</span>
                      <span className="font-bold text-slate-800 truncate">{f.funcaoCritica}</span>
                    </div>
                    <p className="text-slate-450 truncate text-[11px]">{f.setor} — {f.processo}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`block font-bold text-sm ${
                      f.maturityScore < 50 ? "text-rose-600" : "text-amber-600"
                    }`}>
                      {f.maturityScore}%
                    </span>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Maturidade</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PDCA / Action Plan quick view */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Status das Ações PDCA</h4>
              <p className="text-[10px] text-slate-450">Desenvolvimento de polivalências e planos de contingenciamento</p>
            </div>
            <button 
              onClick={() => onNavigateTab("plano")} 
              className="text-indigo-600 hover:text-indigo-700 font-bold text-xs flex items-center gap-0.5 transition-all cursor-pointer border-0 bg-transparent"
            >
              <span>Painel de Sucessão</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between h-24">
              <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Treinamento Eficaz</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-teal-600">{acoesConcluidas}</span>
                <span className="text-xs text-slate-400 font-medium">/ {totalAcoes} concluidos</span>
              </div>
              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mt-1">
                <div className="bg-teal-500 h-1" style={{ width: `${acoesPercent}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between h-24">
              <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Ações em Andamento</span>
              <div className="mt-1">
                <span className="text-2xl font-black text-indigo-600">{acoesEmExecucao}</span>
              </div>
              <p className="text-[9px] text-slate-400 font-bold tracking-wider uppercase leading-none">&#10226; Sincronizado com Auditoria</p>
            </div>
          </div>

          {/* Quick Quote of Audit guidance */}
          <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-start gap-3 text-xs text-indigo-800">
            <Award className="w-5 h-5 shrink-0 text-indigo-600 mt-0.5" />
            <span className="leading-relaxed">
              O item <strong className="font-bold text-indigo-900">7.2 (Competências)</strong> da norma <strong className="font-bold text-indigo-900">ISO 9001:2015</strong> exige que a empresa documente a capacitação dos recursos que afetam o desempenho da qualidade do produto.
            </span>
          </div>

        </div>

      </section>

    </div>
  );
}

import { useState, useEffect } from "react";
import { 
  Users, 
  TrendingUp, 
  Award, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles,
  CheckCircle,
  FileText,
  BookmarkCheck,
  UserCheck2,
  Clock,
  Briefcase
} from "lucide-react";
import UniaoBagLogo from "../components/UniaoBagLogo";

interface HomeProps {
  onEnterApp: () => void;
  funcoesCount: number;
  criticalCount: number;
  coveragePercent: number;
}

export default function Home({ onEnterApp, funcoesCount, criticalCount, coveragePercent }: HomeProps) {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-indigo-600 selection:text-white relative overflow-hidden font-sans">
      
      {/* Background Decorative Blurs for Premium Light SaaS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-indigo-500/5 rounded-full blur-[140px] opacity-80"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-teal-500/5 rounded-full blur-[140px] opacity-80"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] opacity-60"></div>
      </div>

      {/* Upper Corporate Meta Information Bar */}
      <div className="border-b border-slate-200 bg-white/70 backdrop-blur-md px-6 py-2.5 flex justify-between items-center text-[11px] text-slate-500 font-medium z-10">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          <span className="font-semibold text-slate-600">SISTEMA ATIVO: RJT NEXUS INTEL</span>
          <span className="text-slate-200">|</span>
          <span className="hidden sm:inline">CONTROLADORA: UNIÃO BAG S/A</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{currentTime || "14:08"} local</span>
          </span>
          <span className="text-slate-200">|</span>
          <span className="hidden md:inline font-mono">CONFIDENCIALIDADE: GRAU A (MÁXIMA)</span>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="px-6 lg:px-12 py-4 flex justify-between items-center border-b border-slate-200 bg-white/80 backdrop-blur-md z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <UniaoBagLogo className="w-9 h-9 shrink-0 text-indigo-600" onlyIcon={true} />
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">
              RJT NEXUS
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 mt-1 leading-none">
              People & Succession Intelligence
            </p>
          </div>
        </div>
        <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-600">
          <a href="#solucao" className="hover:text-indigo-600 transition-colors">A Plataforma</a>
          <a href="#gut" className="hover:text-indigo-600 transition-colors">Matriz de Criticidade</a>
          <a href="#iso" className="hover:text-indigo-600 transition-colors">Conformidade ISO 9001</a>
          <a href="#metricas" className="hover:text-indigo-600 transition-colors">Governança Humana</a>
        </nav>
        <div>
          <button 
            onClick={onEnterApp}
            className="group relative inline-flex items-center justify-center px-4.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border-0"
          >
            Acessar Console Executivo
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 z-10">
        <section className="relative px-6 py-16 lg:py-24 lg:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Plataforma de People Analytics & Skills Management</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Inteligência e governança de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">capital humano corporativo</span>
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
              Gerencie a continuidade operacional da sua empresa com base científica. O <strong className="font-semibold text-slate-900">RJT NEXUS</strong> unifica o mapeamento de competências essenciais, o planejamento de sucessões de cargos críticos, e a conformidade reguladora com as normas de SGQ <strong className="font-semibold text-slate-900">ISO 9001:2015</strong> em um ecossistema executivo de alta governança.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onEnterApp}
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer border-0"
              >
                Entrar no Analytics Hub
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              <a
                href="#solucao"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 shadow-sm transition-all"
              >
                Conhecer Metodologia
              </a>
            </div>

            {/* Executive Stats Row connected to App State */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 max-w-lg">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Cargos Mapeados</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{funcoesCount}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Gargalos Críticos</p>
                <p className="text-2xl font-black text-rose-600 mt-1">{criticalCount}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Cobertura de Backup</p>
                <p className="text-2xl font-black text-teal-600 mt-1">{coveragePercent}%</p>
              </div>
            </div>
          </div>

          {/* Right Column Visual / Preview Card */}
          <div className="lg:col-span-5 h-full flex items-center justify-center">
            <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="absolute top-0 right-0 -mr-2 -mt-2 w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center border border-teal-100 text-teal-600">
                <Users className="w-5 h-5" />
              </div>
              
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Função ID: FC-EXT-001</h3>
                  <p className="text-xs text-indigo-600 font-medium font-sans">Supervisor de Extrusora Flat</p>
                </div>
                <div className="px-2.5 py-1 rounded-md bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider">
                  Risco de Sucessão Alto
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">COLABORADOR PRINCIPAL</span>
                    <span className="font-bold text-slate-800">Alessandro Ribeiro</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">DEPENDÊNCIA TÉCNICA</span>
                    <span className="font-bold text-indigo-600">Nível 5 (Forte)</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex justify-between text-[11px] mb-1 font-semibold text-slate-600">
                    <span>Maturidade da Função</span>
                    <span className="text-amber-600 font-bold">58% (Alerta de Cobertura)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-indigo-500 h-1.5 rounded-full" style={{ width: '58%' }}></div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-teal-700 bg-teal-50/50 p-2.5 rounded-lg border border-teal-100">
                  <BookmarkCheck className="w-4 h-4 shrink-0 text-teal-600" />
                  <span>ISO 9001 Conforme (Cláusula 7.2 - Competência)</span>
                </div>
              </div>

              <button 
                onClick={onEnterApp}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 transition-all text-xs text-slate-700 font-bold rounded-lg border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Visualizar no Painel Executivo
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>
        </section>

        {/* Methodology Feature Section */}
        <section id="solucao" className="bg-white py-16 border-t border-slate-200 shadow-inner">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-16">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <h2 className="text-xs uppercase tracking-wider text-indigo-600 font-bold">People Analytics Superior</h2>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Metodologia Estruturada de Continuidade Organizacional
              </p>
              <p className="text-slate-500 text-sm">
                Uma arquitetura integrada que monitora o conhecimento, a capacidade técnica operacional e garante que a planta industrial permaneça Blindada contra gargalos e lacunas humanas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-slate-50 border border-slate-200 hover:border-indigo-200 hover:bg-white transition-all duration-300 rounded-xl p-6 space-y-4 shadow-sm hover:shadow-md">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Mapeamento de Competências</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Avalie o chão de fábrica sob 34 premissas completas: nível de polivalência do time, backups alocados nominalmente, tempo estimado para substituição e complexidades operacionais sob relatórios dinâmicos.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-50 border border-slate-200 hover:border-indigo-200 hover:bg-white transition-all duration-300 rounded-xl p-6 space-y-4 shadow-sm hover:shadow-md">
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600 border border-teal-100">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Análise de Criticidade e Risco</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Nossos algoritmos derivam o risco de sucessão e a criticidade através do cruzamento dinâmico entre a Matriz GUT e o índice de vulnerabilidade de pessoal, disparando alertas imediatos para pontos sensíveis.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-50 border border-slate-200 hover:border-indigo-200 hover:bg-white transition-all duration-300 rounded-xl p-6 space-y-4 shadow-sm hover:shadow-md">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Conformidade com a Norma ISO 9001</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Responda de forma ágil a inspeções e auditorias de qualidade. Vincule perfis de função às cláusulas de competência (7.2), garantindo a gestão integrada de evidências do SGQ.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Process Flow explanation */}
        <section id="gut" className="py-16 max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Mapeamento de Riscos de Sucessão Humana
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              O motor de inteligência do RJT NEXUS avalia continuamente o capital de conhecimento e a vulnerabilidade da operação através de duas métricas clássicas de governança corporativa:
            </p>

            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 h-fit rounded font-bold font-mono text-xs border border-indigo-100">GUT</div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Criticidade de Tarefa (Matriz GUT)</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Soma e ponderação da Gravidade, Urgência e Tendência da perda inesperada de um cargo técnico. Classificações altas demandam planos de ação PDCA corporativos imediatos.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="bg-teal-50 text-teal-700 px-3 py-1.5 h-fit rounded font-bold font-mono text-xs border border-teal-100">VUL</div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Vulnerabilidade de Conhecimento</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Mapeia o nível de dependência que as máquinas têm da operação e o impacto em produção e qualidade. A inexistência de um backup estruturado gera penalidade imediata na pontuação.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-lg space-y-6">
            <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Classificação de Gravidade Organizacional</span>
              <span className="text-teal-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                PREVISTO NO SGQ
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-700 border-b border-slate-100 pb-2">
                <span className="font-medium">Nível Crítico (Score GUT &ge; 100)</span>
                <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded text-[10px]">Ação de Sucessão Imediata</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-700 border-b border-slate-100 pb-2">
                <span className="font-medium">Nível Alto (Score GUT 60 - 99)</span>
                <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px]">Capacitação de Backup</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-700 border-b border-slate-100 pb-2">
                <span className="font-medium">Nível Médio (Score GUT 30 - 59)</span>
                <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded text-[10px]">Monitoramento Preventivo</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-700 border-b border-slate-100 pb-2">
                <span className="font-medium">Nível Baixo (Score GUT &lt; 30)</span>
                <span className="text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded text-[10px]">Revisão de Rotinas</span>
              </div>
            </div>
            
            <button
              onClick={onEnterApp}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-xs font-bold text-white rounded-lg flex items-center justify-center gap-2 cursor-pointer border-0 shadow-md hover:shadow-lg transition-all"
            >
              Iniciar Análise de Continuidade Humana
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </section>

        {/* Trust Bottom Banner for Union Bag */}
        <footer className="border-t border-slate-200 bg-white mt-16 py-10 px-6 lg:px-12 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left space-y-1">
              <p className="font-bold text-slate-700 uppercase tracking-widest text-[10px]">SISTEMA RJT NEXUS</p>
              <p className="text-[11px] text-slate-400">Desenvolvido em parceria exclusiva para governança de capital humano da União Bag S/A.</p>
            </div>
            <div className="text-center md:text-right text-[11px] space-y-1">
              <p>Auditor de Metodologia: <strong className="text-slate-600 font-semibold">RJT Consultoria Empresarial</strong></p>
              <p>© 2026 RJT NEXUS HR Intelligence. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

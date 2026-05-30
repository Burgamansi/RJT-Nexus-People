import { useState, FormEvent } from "react";
import { 
  Calendar, 
  Plus, 
  TrendingUp, 
  Users, 
  FileText, 
  CheckCircle, 
  Play, 
  X, 
  AlertTriangle,
  HelpCircle,
  Tag,
  Check,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Clock
} from "lucide-react";
import { ActionPlan, FuncaoCritica } from "../types";

interface PlanoAcaoProps {
  acoes: ActionPlan[];
  funcoes: FuncaoCritica[];
  onAddAcao: (action: ActionPlan) => void;
  onUpdateAcaoStatus: (id: number, newStatus: "Planejado" | "Em Execução" | "Concluido" | "Cancelado") => void;
}

export default function PlanoAcao({ acoes, funcoes, onAddAcao, onUpdateAcaoStatus }: PlanoAcaoProps) {
  
  const [showModal, setShowModal] = useState(false);
  const [selectedPDCAFilter, setSelectedPDCAFilter] = useState<"ALL" | "P" | "D" | "C" | "A">("ALL");

  // Form State
  const [funcaoId, setFuncaoId] = useState<number>(funcoes[0]?.id || 1);
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<"Treinamento" | "Sucessão" | "Documentação" | "Processo">("Treinamento");
  const [responsavel, setResponsavel] = useState("");
  const [prazo, setPrazo] = useState(new Date().toISOString().split('T')[0]);
  const [pdca, setPdca] = useState<"P" | "D" | "C" | "A">("P");
  const [obs, setObs] = useState("");

  const filteredAcoes = selectedPDCAFilter === "ALL" 
    ? acoes 
    : acoes.filter(a => a.acaoPDCA === selectedPDCAFilter);

  // Stats Counters
  const countP = acoes.filter(a => a.acaoPDCA === "P").length;
  const countD = acoes.filter(a => a.acaoPDCA === "D").length;
  const countC = acoes.filter(a => a.acaoPDCA === "C").length;
  const countA = acoes.filter(a => a.acaoPDCA === "A").length;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!descricao.trim() || !responsavel.trim()) {
      alert("Por favor, preencha a descrição e o responsável pela ação.");
      return;
    }

    const targetedFunc = funcoes.find(f => f.id === Number(funcaoId)) || funcoes[0];

    const newAction: ActionPlan = {
      id: Date.now(),
      funcaoCriticaId: Number(funcaoId),
      funcaoCriticaCodigo: targetedFunc?.idFuncao || "FC099",
      funcaoCriticaNome: targetedFunc?.funcaoCritica || "Função Genérica",
      descricaoAcao: descricao,
      tipoAcao: tipo,
      responsavel,
      dataInicio: new Date().toISOString().split('T')[0],
      dataPrazo: prazo,
      status: "Planejado",
      acaoPDCA: pdca,
      observacoes: obs
    };

    onAddAcao(newAction);
    
    // Reset Form & Hide Modal
    setDescricao("");
    setResponsavel("");
    setObs("");
    setShowModal(false);
  };

  return (
    <div className="space-y-6 text-slate-800 relative z-10 animate-fade-in">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans">Ciclos de Melhoria Contínua & Sucessão (PDCA)</h2>
          <p className="text-xs text-slate-500 mt-1">Gerencie planos corretivos de qualificação técnica e reduza gargalos operacionais no chão de fábrica.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-650 hover:bg-indigo-700 active:bg-indigo-850 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer transition-all shrink-0 border-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Ação PDCA</span>
        </button>
      </div>

      {/* METRIC PDCA SELECTOR SLOTS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Slot ALL */}
        <button
          onClick={() => setSelectedPDCAFilter("ALL")}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedPDCAFilter === "ALL"
              ? "bg-indigo-600 border-indigo-650 text-white shadow-md"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
          }`}
        >
          <span className="block text-[10px] font-bold tracking-wider uppercase opacity-80">Geral</span>
          <span className="block text-2xl font-black font-mono mt-1">{acoes.length}</span>
          <span className="text-[10px] block mt-1.5 font-bold">Todas as Ações</span>
        </button>

        {/* Slot P */}
        <button
          onClick={() => setSelectedPDCAFilter("P")}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedPDCAFilter === "P"
              ? "bg-indigo-50 border-indigo-300 text-indigo-850 shadow-sm"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-600">P - Plan (Planejar)</span>
            <span className={`w-1.5 h-1.5 rounded-full ${selectedPDCAFilter === 'P' ? 'bg-indigo-600' : 'bg-transparent'}`}></span>
          </div>
          <span className={`block text-2xl font-black font-mono mt-1 ${selectedPDCAFilter === 'P' ? 'text-indigo-800' : 'text-slate-800'}`}>{countP}</span>
          <span className="text-[10px] block mt-1.5 text-slate-400 font-semibold">Identificar Gap</span>
        </button>

        {/* Slot D */}
        <button
          onClick={() => setSelectedPDCAFilter("D")}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedPDCAFilter === "D"
              ? "bg-amber-50 border-amber-300 text-amber-850 shadow-sm"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold tracking-wider uppercase text-amber-600">D - Do (Executar)</span>
            <span className={`w-1.5 h-1.5 rounded-full ${selectedPDCAFilter === 'D' ? 'bg-amber-600' : 'bg-transparent'}`}></span>
          </div>
          <span className={`block text-2xl font-black font-mono mt-1 ${selectedPDCAFilter === 'D' ? 'text-amber-800' : 'text-slate-800'}`}>{countD}</span>
          <span className="text-[10px] block mt-1.5 text-slate-400 font-semibold">Capacitar & Treinar</span>
        </button>

        {/* Slot C */}
        <button
          onClick={() => setSelectedPDCAFilter("C")}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedPDCAFilter === "C"
              ? "bg-blue-50 border-blue-300 text-blue-850 shadow-sm"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600">C - Check (Avaliar)</span>
            <span className={`w-1.5 h-1.5 rounded-full ${selectedPDCAFilter === 'C' ? 'bg-blue-600' : 'bg-transparent'}`}></span>
          </div>
          <span className={`block text-2xl font-black font-mono mt-1 ${selectedPDCAFilter === 'C' ? 'text-blue-800' : 'text-slate-800'}`}>{countC}</span>
          <span className="text-[10px] block mt-1.5 text-slate-400 font-semibold">Testar Retenção</span>
        </button>

        {/* Slot A */}
        <button
          onClick={() => setSelectedPDCAFilter("A")}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedPDCAFilter === "A"
              ? "bg-teal-50 border-teal-300 text-teal-850 shadow-sm"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold tracking-wider uppercase text-teal-600">A - Act (Padronizar)</span>
            <span className={`w-1.5 h-1.5 rounded-full ${selectedPDCAFilter === 'A' ? 'bg-teal-600' : 'bg-transparent'}`}></span>
          </div>
          <span className={`block text-2xl font-black font-mono mt-1 ${selectedPDCAFilter === 'A' ? 'text-teal-800' : 'text-slate-800'}`}>{countA}</span>
          <span className="text-[10px] block mt-1.5 text-slate-400 font-semibold">Registrar Habilidade</span>
        </button>

      </div>

      {/* RENDER ACTIVE ACTIONS */}
      <div className="space-y-4">
        {filteredAcoes.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 rounded-xl text-center space-y-3 shadow-sm">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-sm font-bold text-slate-850">Nenhum plano de ação registrado nesta fase do ciclo.</p>
            <p className="text-xs text-slate-500 font-medium">Mude a seleção acima ou crie uma nova ação corretiva no botão do topo.</p>
          </div>
        ) : (
          filteredAcoes.map(acao => {
            
            const pdcaColors = {
              P: "bg-indigo-50 text-indigo-700 border-indigo-200",
              D: "bg-amber-50 text-amber-700 border-amber-200",
              C: "bg-blue-50 text-blue-700 border-blue-200",
              A: "bg-teal-50 text-teal-700 border-teal-200"
            }[acao.acaoPDCA];

            return (
              <div 
                key={acao.id} 
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    
                    {/* Circle letter representing PDCA */}
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-sm border ${pdcaColors}`}>
                      {acao.acaoPDCA}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-slate-100 text-indigo-650 font-bold px-1.5 py-0.5 rounded text-[10px] border border-slate-200">{acao.funcaoCriticaCodigo}</span>
                        <h4 className="font-bold text-slate-850 text-sm">{acao.funcaoCriticaNome}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">Módulo: {acao.tipoAcao} de Competência</p>
                    </div>
                  </div>

                  {/* Status pills selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase hidden sm:inline">Status:</span>
                    <select
                      value={acao.status}
                      onChange={e => onUpdateAcaoStatus(acao.id, e.target.value as any)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer focus:outline-none focus:ring-1 ${
                        acao.status === "Concluido" 
                          ? "bg-teal-50 border-teal-200 text-teal-750 font-extrabold" 
                          : acao.status === "Em Execução" 
                          ? "bg-indigo-50 border-indigo-250 text-indigo-755 font-bold" 
                          : "bg-slate-50 border-slate-250 text-slate-655"
                      }`}
                    >
                      <option value="Planejado">Planejado</option>
                      <option value="Em Execução">Em Execução</option>
                      <option value="Concluido">Concluído</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>

                {/* Body Content */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs text-slate-700">
                  
                  {/* Left block description */}
                  <div className="md:col-span-8 space-y-2">
                    <strong className="text-slate-450 font-bold block uppercase text-[9px] tracking-wider">Ação Preventiva Recomendada</strong>
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-150">
                      {acao.descricaoAcao}
                    </p>
                    {acao.observacoes && (
                      <div className="text-slate-600 text-[11px] leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-150">
                        <strong className="font-bold uppercase text-[9px] text-indigo-700 not-italic block mb-0.5">Nota de Conformidade:</strong>
                        <span className="italic">"{acao.observacoes}"</span>
                      </div>
                    )}
                  </div>

                  {/* Right block metrics */}
                  <div className="md:col-span-4 bg-slate-50 p-4 rounded-lg space-y-2 border border-slate-200 self-center">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 uppercase text-[9px] font-bold">Líder Executor:</span>
                      <span className="font-bold text-slate-800 text-right truncate pl-2" title={acao.responsavel}>{acao.responsavel}</span>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-200 pt-2 text-[11px]">
                      <span className="text-slate-400 uppercase text-[9px] font-bold font-sans">Prazo de Conclusão:</span>
                      <span className="font-mono font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {acao.dataPrazo}</span>
                    </div>

                    {acao.dataInicio && (
                      <div className="flex justify-between items-center border-t border-slate-200 pt-2 text-[11px]">
                        <span className="text-slate-400 uppercase text-[9px] font-bold font-sans">Registrado em:</span>
                        <span className="font-mono text-slate-500 font-bold">{acao.dataInicio}</span>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ADD ACTION POPUP FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 max-w-lg w-full overflow-hidden rounded-xl shadow-2xl animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Registrar Nova Ação Preventiva</h3>
                <p className="text-[11px] text-slate-500 mt-1">Insira as premissas práticas para desenvolvimento de backups no setor.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors border-0 bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-slate-700">
              
              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Função Crítica Vinculada *</label>
                <select
                  value={funcaoId}
                  onChange={e => setFuncaoId(Number(e.target.value))}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 text-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none font-semibold"
                >
                  {funcoes.map(f => (
                    <option key={f.id} value={f.id}>[{f.idFuncao}] {f.funcaoCritica} - {f.setor}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Descrição Detalhada da Ação *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva a atividade prática de treinamento shadow ou elaboração de documento técnico..."
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-white text-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Classificação do PDCA</label>
                  <select
                    value={pdca}
                    onChange={e => setPdca(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 text-slate-800 rounded-lg focus:ring-1 outline-none font-semibold"
                  >
                    <option value="P">P - Planejar Solução (Plan)</option>
                    <option value="D">D - Capacitar na Prática (Do)</option>
                    <option value="C">C - Validar Eficácia / Testar (Check)</option>
                    <option value="A">A - Padronizar Instrução / IT (Act)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Tipo de Mitigação</label>
                  <select
                    value={tipo}
                    onChange={e => setTipo(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 text-slate-800 rounded-lg focus:ring-1 outline-none font-semibold"
                  >
                    <option value="Treinamento">Treinamento Técnico</option>
                    <option value="Sucessão">Plano de Sucessão Humana</option>
                    <option value="Documentação">Redação de Instrução (IT)</option>
                    <option value="Processo">Modificação de Processo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Responsável / Supervisor *</label>
                  <input
                    type="text"
                    required
                    placeholder="Supervisor Marcos Paulo"
                    value={responsavel}
                    onChange={e => setResponsavel(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white text-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Prazo de Resolução</label>
                  <input
                    type="date"
                    value={prazo}
                    onChange={e => setPrazo(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white text-slate-800 rounded-lg focus:ring-1 outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Anotações do SGQ</label>
                <input
                  type="text"
                  placeholder="Observações complementares sobre recursos ou licenças..."
                  value={obs}
                  onChange={e => setObs(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-white text-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3.5 border-t border-slate-250 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-500 rounded-lg font-bold transition-colors cursor-pointer border-0 bg-transparent"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 active:bg-indigo-850 text-white rounded-lg font-bold shadow-md transition-colors cursor-pointer border-0"
                >
                  Registrar Ação
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* FOOTER Sparkles info */}
      <div className="text-[11px] text-slate-500 bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm font-semibold">
        <Sparkles className="w-5 h-5 shrink-0 text-indigo-500" />
        <span>
          <strong className="text-slate-700">Motor PDCA de Pessoal:</strong> Ao concluir ações de treinamento vinculadas a uma função, as notas de polivalência e maturidade são recalculadas e os alertas de redundância são mitigados automaticamente em tempo real!
        </span>
      </div>

    </div>
  );
}

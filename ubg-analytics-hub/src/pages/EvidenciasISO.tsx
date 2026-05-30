import { useState, FormEvent } from "react";
import { 
  FileBadge2, 
  Search, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Award, 
  ChevronRight, 
  Paperclip,
  Check,
  Plus,
  X,
  FileCode,
  ShieldAlert,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { ISOEvidence, REQUISITOS_ISO } from "../types";

interface EvidenciasISOProps {
  evidencias: ISOEvidence[];
  onAddEvidencia: (evidencia: ISOEvidence) => void;
  onUpdateEvidenciaStatus: (id: number, status: "Pendente" | "Em Análise" | "Validada") => void;
}

export default function EvidenciasISO({ evidencias, onAddEvidencia, onUpdateEvidenciaStatus }: EvidenciasISOProps) {
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedReqFilter, setSelectedReqFilter] = useState("TODOS");

  // Form states
  const [reqId, setReqId] = useState("7.2");
  const [evidenciaNecessaria, setEvidenciaNecessaria] = useState("");
  const [codigoDocumentoUBG, setCodigoDocumentoUBG] = useState("UBG-IT-");
  const [descricaoDocumento, setDescricaoDocumento] = useState("");
  const [responsavel, setResponsavel] = useState("");

  const filteredEvidencias = selectedReqFilter === "TODOS"
    ? evidencias
    : evidencias.filter(e => e.requisitoISO === selectedReqFilter);

  // Counters for status overview
  const validadasCount = evidencias.filter(e => e.status === "Validada").length;
  const analiseCount = evidencias.filter(e => e.status === "Em Análise").length;
  const pendentesCount = evidencias.filter(e => e.status === "Pendente").length;
  const alignmentPercent = evidencias.length > 0 ? Math.round((validadasCount / evidencias.length) * 100) : 0;

  const handleCreateGeneric = (e: FormEvent) => {
    e.preventDefault();
    if (!evidenciaNecessaria.trim() || !codigoDocumentoUBG.trim() || !descricaoDocumento.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const linkedClauseDesc = REQUISITOS_ISO.find(r => r.id === reqId)?.desc || "Cláusula ISO Mapeada";

    const item: ISOEvidence = {
      id: Date.now(),
      requisitoISO: reqId,
      descricaoRequisito: linkedClauseDesc,
      evidenciaNecessaria,
      codigoDocumentoUBG,
      descricaoDocumento,
      status: "Em Análise",
      dataColeta: new Date().toISOString().split('T')[0],
      responsavelColeta: responsavel || "Karina Mendes (SGQ)"
    };

    onAddEvidencia(item);

    // Reset Form
    setEvidenciaNecessaria("");
    setCodigoDocumentoUBG("UBG-IT-");
    setDescricaoDocumento("");
    setResponsavel("");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 text-slate-800 relative z-10 animate-fade-in">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans">Evidências de Conformidade (ISO 9001:2015)</h2>
          <p className="text-xs text-slate-500 mt-1">Repositório oficial de instruções de trabalho, listas de presença e validações de auditoria do SGQ.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-655 hover:bg-teal-700 active:bg-teal-850 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer transition-all shrink-0 border-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload de Evidência</span>
        </button>
      </div>

      {/* ISO AUDIT SCOREBAR */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        
        {/* Left metric */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aderência à Norma ISO 9001</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-extrabold text-indigo-650 font-mono">{alignmentPercent}%</span>
            <span className="text-xs text-slate-500 font-bold">das evidências validadas</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
            <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${alignmentPercent}%` }}></div>
          </div>
        </div>

        {/* Center metric */}
        <div className="flex justify-around border-y md:border-y-0 md:border-x border-slate-200 py-4 md:py-0 text-center font-mono">
          <div>
            <span className="block text-2xl font-black text-teal-600 leading-none">{validadasCount}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold mt-1.5 block">Validadas</span>
          </div>
          <div>
            <span className="block text-2xl font-black text-amber-500 leading-none">{analiseCount}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold mt-1.5 block">Em Análise</span>
          </div>
          <div>
            <span className="block text-2xl font-black text-rose-500 leading-none">{pendentesCount}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold mt-1.5 block">Pendentes</span>
          </div>
        </div>

        {/* Right recommendation box */}
        <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-xs flex gap-3 text-slate-700">
          <Award className="w-5 h-5 shrink-0 text-indigo-600" />
          <div>
            <span className="font-bold text-indigo-700 leading-none uppercase">Status do Acervo SGQ</span>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-semibold">Os registros estão mapeados e prontos para inspeções externas de certificação.</p>
          </div>
        </div>

      </div>

      {/* REQUISITO CLAUSE QUICK CHIP FILTERS */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedReqFilter("TODOS")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
            selectedReqFilter === "TODOS"
              ? "bg-indigo-650 border-indigo-700 text-white shadow-sm"
              : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
          }`}
        >
          Todas as Cláusulas
        </button>
        {REQUISITOS_ISO.map(clause => (
          <button
            key={clause.id}
            onClick={() => setSelectedReqFilter(clause.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              selectedReqFilter === clause.id
                ? "bg-indigo-650 border-indigo-700 text-white shadow-sm"
                : "bg-white border-slate-200 text-slate-655 hover:bg-slate-50"
            }`}
          >
            Cláusula {clause.id}
          </button>
        ))}
      </div>

      {/* EVIDENCES CONTAINER CARDS */}
      <div className="grid grid-cols-1 gap-4">
        {filteredEvidencias.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 rounded-xl text-center text-slate-400 text-xs font-bold shadow-sm">
            Nenhuma evidência normatizada registrada sob esta cláusula da qualidade.
          </div>
        ) : (
          filteredEvidencias.map(ev => {
            const statusStyle = {
              Validada: "bg-teal-50 text-teal-700 border-teal-200 font-extrabold",
              "Em Análise": "bg-amber-50 text-amber-700 border-amber-250 font-bold",
              Pendente: "bg-rose-50 text-rose-700 border-rose-250 font-bold"
            }[ev.status];

            return (
              <div 
                key={ev.id} 
                className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-5"
              >
                {/* Left Visual Badge Column */}
                <div className="flex items-center md:flex-col justify-between md:justify-center shrink-0 w-full md:w-36 bg-slate-50 p-4 border border-slate-200 rounded-xl text-center gap-1.5 shadow-inner">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto border border-indigo-150">
                    <FileBadge2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-sans font-bold text-indigo-755 text-sm leading-none mt-1">Cláusula {ev.requisitoISO}</span>
                    <span className="text-[9px] font-bold tracking-wider text-slate-400 block mt-1.5 uppercase font-sans">ISO 9001:2015</span>
                  </div>
                </div>

                {/* Primary Content Description Column */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="font-bold text-slate-850 text-sm leading-snug">{ev.evidenciaNecessaria}</h4>
                    <p className="text-slate-500 text-[11px] font-semibold leading-relaxed mt-0.5">{ev.descricaoRequisito}</p>
                  </div>

                  {/* Document and collectors tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100 text-xs text-slate-655 font-semibold">
                    <div>
                      <strong className="text-slate-450 font-bold uppercase text-[9px] block">Código e Título UBG</strong>
                      <span className="font-bold text-slate-800 flex items-center gap-1.5 pt-1">
                        <Paperclip className="w-3.5 h-3.5 text-indigo-550" />
                        <code className="text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded text-[10px] border border-indigo-100 font-mono font-bold">{ev.codigoDocumentoUBG}</code>
                        <span className="truncate max-w-[200px]" title={ev.descricaoDocumento}>{ev.descricaoDocumento}</span>
                      </span>
                    </div>

                    <div className="border-l border-slate-200 pl-4">
                      <strong className="text-slate-450 font-bold uppercase text-[9px] block">Coletor / Auditoria</strong>
                      <span className="text-slate-800 font-bold pt-0.5 block">{ev.responsavelColeta}</span>
                      <span className="text-[10px] text-slate-400 block font-mono font-medium">Coletado em {ev.dataColeta}</span>
                    </div>
                  </div>
                </div>

                {/* Status Column */}
                <div className="shrink-0 flex md:flex-col justify-between md:justify-center items-end md:items-center gap-3 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 pl-0 md:pl-5">
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded border uppercase tracking-wider font-mono text-center shrink-0 ${statusStyle}`}>
                    {ev.status}
                  </span>
                  
                  {/* Status Toggle buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onUpdateEvidenciaStatus(ev.id, "Validada")}
                      className={`p-1.5 bg-white hover:bg-teal-50 text-slate-400 hover:text-teal-600 rounded-lg border border-slate-250 transition-colors cursor-pointer ${ev.status === 'Validada' ? 'bg-teal-50 border-teal-200 text-teal-600 shadow-sm font-bold' : ''}`}
                      title="Validar Evidência no Acervo"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onUpdateEvidenciaStatus(ev.id, "Pendente")}
                      className={`p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-250 transition-colors cursor-pointer ${ev.status === 'Pendente' ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm font-bold' : ''}`}
                      title="Marcar Pendente"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* UPLOAD FORM POPUP */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 max-w-md w-full overflow-hidden rounded-xl shadow-2xl animate-scale-up">
            
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Registrar Evidência de Conformidade</h3>
                <p className="text-[11px] text-slate-500 mt-1">Insira os laudos, fotos ou listas de presenças coletados.</p>
              </div>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors border-0 bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGeneric} className="p-5 space-y-4 text-xs text-slate-700">
              
              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Cláusula ISO 9001 *</label>
                <select
                  value={reqId}
                  onChange={e => setReqId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 text-slate-800 rounded-lg focus:ring-1 outline-none font-semibold"
                >
                  {REQUISITOS_ISO.map(clause => (
                    <option key={clause.id} value={clause.id}>Cláusula {clause.id} - {clause.desc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Evidência Requerida / Coleta *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lista de presença do treinamento prático de partida de bobina"
                  value={evidenciaNecessaria}
                  onChange={e => setEvidenciaNecessaria(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-white text-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Código de Documento UBG *</label>
                  <input
                    type="text"
                    required
                    placeholder="UBG-IT-MP-001"
                    value={codigoDocumentoUBG}
                    onChange={e => setCodigoDocumentoUBG(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white text-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Título do Documento *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Registro de Qualificação Industrial"
                    value={descricaoDocumento}
                    onChange={e => setDescricaoDocumento(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white text-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Responsável Auditor / Coleta</label>
                <input
                  type="text"
                  placeholder="Karina Mendes (SGQ)"
                  value={responsavel}
                  onChange={e => setResponsavel(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-white text-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-250 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-500 rounded-lg font-bold transition-colors cursor-pointer border-0 bg-transparent"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-850 text-white rounded-lg font-bold shadow-md transition-colors cursor-pointer border-0"
                >
                  Confirmar Envio
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
          <strong className="text-slate-700">Evidência Dinâmica:</strong> Os laudos carregados aqui integram instantaneamente os perfis unificados de funções correspondentes, validando cláusulas da ISO e elevando a pontuação geral da planta.
        </span>
      </div>

    </div>
  );
}

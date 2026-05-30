import { useState, useEffect, FormEvent } from "react";
import { 
  PlusCircle, 
  HelpCircle, 
  Calculator, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Check, 
  Sparkles,
  Info,
  Layers,
  FileText,
  Award,
  Users,
  Clock,
  UserCheck,
  AlertTriangle
} from "lucide-react";
import { 
  FuncaoCritica, 
  SETORES, 
  REQUISITOS_ISO, 
  calculateGUT, 
  calculateVulnerability, 
  getFinalClassification,
  calculateWREIndex,
  getWREClassification
} from "../types";

interface CadastroFuncoesProps {
  funcoes: FuncaoCritica[];
  onAddFuncao: (funcao: FuncaoCritica) => void;
  onUpdateFuncao: (funcao: FuncaoCritica) => void;
  editFuncNode: FuncaoCritica | null;
  clearEditNode: () => void;
}

export default function CadastroFuncoes({ 
  funcoes, 
  onAddFuncao, 
  onUpdateFuncao, 
  editFuncNode, 
  clearEditNode 
}: CadastroFuncoesProps) {
  
  const [activeStep, setActiveStep] = useState(1);

  // Initial State for form holding the 34 fields
  const getInitialState = () => ({
    idFuncao: "",
    setor: "Corte",
    processo: "",
    funcaoCritica: "",
    atividadeTecnicaCritica: "",
    colaboradorPrincipal: "",
    backup1: "",
    backup2: "",
    existeBackup: "NÃO" as "SIM" | "NÃO",
    quantidadePessoasAptas: 1,
    nivelPolivalencia: 2, // 1-4
    grauDependenciaTecnica: 3, // 1-5
    tempoEstimadoFormacao: "6 meses",
    complexidadeTecnica: "Média" as "Baixa" | "Média" | "Alta",
    impactoProducao: 3, // 1-5
    impactoCliente: 3, // 1-5
    impactoQualidade: 3, // 1-5
    gravidade: 3, // 1-5
    urgencia: 3, // 1-5
    tendencia: 3, // 1-5
    necessidadeIT: "Elaborar ou revisar instrução de trabalho técnica (IT).",
    necessidadeTreinamento: "Inserir nos ciclos de treinamentos práticos semanais.",
    necessidadeSucessao: "Planejar formação de backup adicional no setor.",
    requisitoISO: "7.2",
    evidenciaNecessaria: "Ficha de treinamento assinada e avaliação teórica validada pelo SGQ.",
    codigoDocumentoUBG: "UBG-IT-OS-",
    acaoPDCARelacionada: "PDCA-GARGALO-",
    responsavel: "RH Industrial",
    prazo: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    status: "Planejado" as "Planejado" | "Em Execução" | "Concluído" | "Atrasado",
  });

  const [form, setForm] = useState(getInitialState());

  // Handle Edit Trigger
  useEffect(() => {
    if (editFuncNode) {
      setForm({
        idFuncao: editFuncNode.idFuncao,
        setor: editFuncNode.setor,
        processo: editFuncNode.processo,
        funcaoCritica: editFuncNode.funcaoCritica,
        atividadeTecnicaCritica: editFuncNode.atividadeTecnicaCritica,
        colaboradorPrincipal: editFuncNode.colaboradorPrincipal,
        backup1: editFuncNode.backup1 === "Sem Backup Cadastrado" ? "" : editFuncNode.backup1,
        backup2: editFuncNode.backup2 === "Sem Backup Cadastrado" ? "" : editFuncNode.backup2,
        existeBackup: editFuncNode.existeBackup,
        quantidadePessoasAptas: editFuncNode.quantidadePessoasAptas,
        nivelPolivalencia: editFuncNode.nivelPolivalencia,
        grauDependenciaTecnica: editFuncNode.grauDependenciaTecnica,
        tempoEstimadoFormacao: editFuncNode.tempoEstimadoFormacao,
        complexidadeTecnica: editFuncNode.complexidadeTecnica,
        impactoProducao: editFuncNode.impactoProducao,
        impactoCliente: editFuncNode.impactoCliente,
        impactoQualidade: editFuncNode.impactoQualidade,
        gravidade: editFuncNode.gravidade,
        urgencia: editFuncNode.urgencia,
        tendencia: editFuncNode.tendencia,
        necessidadeIT: editFuncNode.necessidadeIT,
        necessidadeTreinamento: editFuncNode.necessidadeTreinamento,
        necessidadeSucessao: editFuncNode.necessidadeSucessao,
        requisitoISO: editFuncNode.requisitoISO,
        evidenciaNecessaria: editFuncNode.evidenciaNecessaria,
        codigoDocumentoUBG: editFuncNode.codigoDocumentoUBG,
        acaoPDCARelacionada: editFuncNode.acaoPDCARelacionada,
        responsavel: editFuncNode.responsavel,
        prazo: editFuncNode.prazo,
        status: editFuncNode.status,
      });
      // Go to first step of editing
      setActiveStep(1);
    }
  }, [editFuncNode]);

  // Realtime calculations derived from form state
  const liveGUT = calculateGUT(form.gravidade, form.urgencia, form.tendencia);
  const liveVulnerability = calculateVulnerability(
    form.grauDependenciaTecnica,
    form.impactoProducao,
    form.impactoCliente,
    form.impactoQualidade,
    form.existeBackup
  );
  const liveClassification = getFinalClassification(liveGUT);

  // Live Succession Simulator Math
  const liveBackupScore = (() => {
    if (form.existeBackup === "NÃO") return 0;
    let score = 0;
    if (form.backup1 && form.backup1.trim() !== "" && !form.backup1.toLowerCase().includes("nenhum")) {
      score += 50;
    }
    if (form.backup2 && form.backup2.trim() !== "" && !form.backup2.toLowerCase().includes("nenhum") && !form.backup2.toLowerCase().includes("sem backup")) {
      score += 50;
    }
    if (form.existeBackup === "SIM" && score === 0) {
      score = 50; // Fallback
    }
    return score;
  })();

  const liveCoverageScore = form.existeBackup === "NÃO" ? 30 : (form.quantidadePessoasAptas >= 3 ? 100 : (form.quantidadePessoasAptas === 2 ? 70 : 30));

  const liveTrainingScore = (() => {
    if (form.nivelPolivalencia === 1) return 25;
    if (form.nivelPolivalencia === 2) return 50;
    if (form.nivelPolivalencia === 3) return 75;
    if (form.nivelPolivalencia === 4) return 100;
    return 50;
  })();

  const liveMaturityScore = Math.round((liveBackupScore * 0.4) + (liveTrainingScore * 0.3) + (liveCoverageScore * 0.3));

  // Live alert tracker inside simulator
  const liveAlerts = [];
  if (form.existeBackup === "NÃO" || liveBackupScore === 0) {
    liveAlerts.push({ label: "Sem Backup Habilitado", severity: "critical" });
  }
  if (liveCoverageScore < 50 || form.quantidadePessoasAptas < 2) {
    liveAlerts.push({ label: "Baixa Cobertura de Equipe", severity: "critical" });
  }
  if (form.nivelPolivalencia < 3) {
    liveAlerts.push({ label: "Competência do Principal em Desenvolvimento", severity: "warning" });
  }
  const formatTime = form.tempoEstimadoFormacao.toLowerCase();
  if (formatTime.includes("6") || formatTime.includes("8") || formatTime.includes("12") || formatTime.includes("ano") || formatTime.includes("semestre")) {
    liveAlerts.push({ label: "Longo Tempo de Capacitação (Maturidade Lenta)", severity: "warning" });
  }

  // Field update utility
  const updateField = (key: string, value: any) => {
    setForm(prev => {
      const draft = { ...prev, [key]: value };
      
      // Auto-toggle existeBackup when backups change
      if (key === "backup1" || key === "backup2" || key === "existeBackup") {
        if (key === "existeBackup") {
          draft.existeBackup = value;
        } else {
          const hasBackup1 = draft.backup1 && draft.backup1.trim() !== "" && !draft.backup1.toLowerCase().includes("sem backup") && !draft.backup1.toLowerCase().includes("nenhum");
          const hasBackup2 = draft.backup2 && draft.backup2.trim() !== "" && !draft.backup2.toLowerCase().includes("sem backup") && !draft.backup2.toLowerCase().includes("nenhum");
          draft.existeBackup = (hasBackup1 || hasBackup2) ? "SIM" : "NÃO";
        }
      }

      // Pre-fill ID Função standard prefix if empty
      if (key === "setor" && !draft.idFuncao) {
        const sectorPrefixes: { [key: string]: string } = {
          "Corte": "COR",
          "Costura/Confecção": "COS",
          "Alças": "ALC",
          "Controle da Qualidade": "QLD",
          "PCP": "PCP",
          "Logística": "LOG",
          "Manutenção": "MNT",
          "Compras": "COM",
          "SGQ/RH": "SGQ"
        };
        const nextId = funcoes.filter(f => f.setor === value).length + 1;
        draft.idFuncao = `FC-${sectorPrefixes[value] || "GEN"}-${String(nextId).padStart(3, '0')}`;
      }

      return draft;
    });
  };

  // Steps definition for 34 fields
  const steps = [
    { title: "Identificação", desc: "Setor, Cargo e Processo" },
    { title: "Gestão Humana", desc: "Backups e polivalência" },
    { title: "Criticidade GUT", desc: "Severidade operacional" },
    { title: "Vulnerabilidade", desc: "Impactos industriais" },
    { title: "Plano & ISO", desc: "Conformidade e melhoria" }
  ];

  const handleNext = (e: FormEvent) => {
    e.preventDefault();
    if (activeStep < steps.length) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep(prev => prev - 1);
    }
  };

  // Form Submission
  const handleSave = () => {
    // Quick validation
    if (!form.idFuncao || !form.processo || !form.funcaoCritica) {
      alert("Por favor, preencha todos os campos obrigatórios na Etapa 1 (Setor, ID, Processo e Nome da Função).");
      setActiveStep(1);
      return;
    }

    const liveWREIndex = calculateWREIndex(liveGUT, liveVulnerability);
    const liveWREClassification = getWREClassification(liveWREIndex);

    const payload: FuncaoCritica = {
      id: editFuncNode ? editFuncNode.id : Date.now(),
      idFuncao: form.idFuncao,
      setor: form.setor,
      processo: form.processo,
      funcaoCritica: form.funcaoCritica,
      atividadeTecnicaCritica: form.atividadeTecnicaCritica || "Mapeamento padrão de habilidades industriais.",
      colaboradorPrincipal: form.colaboradorPrincipal || "Pendente de Alocação",
      backup1: form.backup1 || "Sem Backup Cadastrado",
      backup2: form.backup2 || "Sem Backup Cadastrado",
      existeBackup: form.existeBackup,
      quantidadePessoasAptas: Number(form.quantidadePessoasAptas) || 1,
      nivelPolivalencia: Number(form.nivelPolivalencia),
      grauDependenciaTecnica: Number(form.grauDependenciaTecnica),
      tempoEstimadoFormacao: form.tempoEstimadoFormacao || "6 meses",
      complexidadeTecnica: form.complexidadeTecnica,
      impactoProducao: Number(form.impactoProducao),
      impactoCliente: Number(form.impactoCliente),
      impactoQualidade: Number(form.impactoQualidade),
      gravidade: Number(form.gravidade),
      urgencia: Number(form.urgencia),
      tendencia: Number(form.tendencia),
      scoreGUT: liveGUT,
      scoreVulnerabilidade: liveVulnerability,
      wreIndex: liveWREIndex,
      classificacaoFinal: liveWREClassification,
      necessidadeIT: form.necessidadeIT || "Não especificado",
      necessidadeTreinamento: form.necessidadeTreinamento || "Não especificado",
      necessidadeSucessao: form.necessidadeSucessao || "Não especificado",
      requisitoISO: form.requisitoISO,
      evidenciaNecessaria: form.evidenciaNecessaria || "Pendente de envio",
      codigoDocumentoUBG: form.codigoDocumentoUBG || "UBG-IT-GEN",
      acaoPDCARelacionada: form.acaoPDCARelacionada || "PDCA-RH",
      responsavel: form.responsavel || "SGQ",
      prazo: form.prazo || new Date().toISOString().split('T')[0],
      status: form.status,
    };

    if (editFuncNode) {
      onUpdateFuncao(payload);
      clearEditNode();
    } else {
      onAddFuncao(payload);
    }

    // Reset Form
    setForm(getInitialState());
    setActiveStep(1);
  };

  return (
    <div className="space-y-6 text-slate-800 relative z-10 animate-fade-in">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans">
            {editFuncNode ? `Editar Ficha de Competência: ${editFuncNode.idFuncao}` : "Mapeamento & Diagnóstico de Continuidade Humana"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {editFuncNode 
              ? "Modifique os 34 parâmetros integrados de conformidade desta função crítica." 
              : "Defina novas posições de trabalho no chão de fábrica e calcule live a mitigação contra gargalos operacionais."
            }
          </p>
        </div>
        {editFuncNode && (
          <button 
            onClick={clearEditNode}
            className="text-xs font-bold px-3 py-1.5 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar Edição
          </button>
        )}
      </div>

      {/* STEPPERS VISUALIZER */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between gap-4">
        {steps.map((st, i) => {
          const isCurrent = activeStep === i + 1;
          const isPassed = activeStep > i + 1;
          return (
            <div key={st.title} className="flex-1 flex items-center gap-3">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                isCurrent 
                  ? "bg-indigo-600 text-white shadow-md border border-indigo-650" 
                  : isPassed 
                  ? "bg-teal-50 text-teal-700 border border-teal-150 font-bold" 
                  : "bg-slate-50 text-slate-400 border border-slate-200"
              }`}>
                {isPassed ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${isCurrent ? "text-indigo-600" : isPassed ? "text-teal-700" : "text-slate-400"}`}>
                  {st.title}
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate hidden md:block">{st.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILED ACTIVE STEP FORM ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Fields */}
        <form onSubmit={handleNext} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm lg:col-span-8 space-y-6">
          
          {/* STEP 1: IDENTIFICATION & PROCESS */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Etapa 1: Identificação Operacional & Processo</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Setor União Bag *</label>
                  <select
                    value={form.setor}
                    onChange={e => updateField("setor", e.target.value)}
                    className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 outline-none font-semibold"
                  >
                    {SETORES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID da Função (Geração Automática)</label>
                  <input
                    type="text"
                    required
                    value={form.idFuncao}
                    placeholder="e.g. FC-COR-001"
                    onChange={e => updateField("idFuncao", e.target.value)}
                    className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-lg p-2.5 font-mono focus:ring-1 focus:ring-indigo-500 outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Processo Industrial Vinculado *</label>
                <input
                  type="text"
                  required
                  value={form.processo}
                  placeholder="e.g. Extrusão flat de bobinas ráfia"
                  onChange={e => updateField("processo", e.target.value)}
                  className="w-full text-xs border border-slate-200 bg-white text-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Função Crítica / Cargo *</label>
                <input
                  type="text"
                  required
                  value={form.funcaoCritica}
                  placeholder="e.g. Operador Especialista de Extrusora Flat"
                  onChange={e => updateField("funcaoCritica", e.target.value)}
                  className="w-full text-xs border border-slate-200 bg-white text-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 outline-none font-bold text-indigo-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Atividades Técnicas Detalhadas</label>
                <textarea
                  rows={3}
                  value={form.atividadeTecnicaCritica}
                  placeholder="Descreva detalhadamente as atribuições, habilidades mecânicas e setups requeridos para este cargo."
                  onChange={e => updateField("atividadeTecnicaCritica", e.target.value)}
                  className="w-full text-xs border border-slate-200 bg-white text-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 outline-none font-medium leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Supervisor / Responsável Direto</label>
                  <input
                    type="text"
                    value={form.responsavel}
                    placeholder="Supervisor Marcos Paulo"
                    onChange={e => updateField("responsavel", e.target.value)}
                    className="w-full text-xs border border-slate-200 bg-white text-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código do Documento de Instrução (IT)</label>
                  <input
                    type="text"
                    value={form.codigoDocumentoUBG}
                    placeholder="UBG-IT-EXT-104"
                    onChange={e => updateField("codigoDocumentoUBG", e.target.value)}
                    className="w-full text-xs border border-slate-200 bg-white text-slate-800 rounded-lg p-2.5 font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: GESTÃO HUMANA & COOPERATORS */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
                <Info className="w-4 h-4 text-indigo-500" />
                <span>Etapa 2: Recursos Humanos, Backups e Polivalência</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Colaborador Principal Alocado</label>
                <input
                  type="text"
                  value={form.colaboradorPrincipal}
                  placeholder="Nome completo do colaborador principal sênior"
                  onChange={e => updateField("colaboradorPrincipal", e.target.value)}
                  className="w-full text-xs border border-slate-200 bg-white text-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Colaborador Backup #1</label>
                  <input
                    type="text"
                    value={form.backup1}
                    placeholder="Nome do substituto principal técnico"
                    onChange={e => updateField("backup1", e.target.value)}
                    className="w-full text-xs border border-slate-200 bg-white text-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Colaborador Backup #2</label>
                  <input
                    type="text"
                    value={form.backup2}
                    placeholder="Nome do substituto secundário"
                    onChange={e => updateField("backup2", e.target.value)}
                    className="w-full text-xs border border-slate-200 bg-white text-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Backup Existente?</label>
                  <select
                    value={form.existeBackup}
                    onChange={e => updateField("existeBackup", e.target.value)}
                    className="w-full text-xs border border-slate-200 bg-white text-slate-800 rounded-lg p-1.5 focus:ring-1 outline-none font-bold"
                  >
                    <option value="SIM">SIM: Backup Habilitado</option>
                    <option value="NÃO">NÃO: Sem Substitutos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Total de Pessoas Aptas</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={form.quantidadePessoasAptas}
                    onChange={e => updateField("quantidadePessoasAptas", Number(e.target.value))}
                    className="w-full text-xs border border-slate-200 bg-white text-slate-800 rounded-lg p-1.5 font-mono focus:ring-1 focus:ring-indigo-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Complexidade Técnica</label>
                  <select
                    value={form.complexidadeTecnica}
                    onChange={e => updateField("complexidadeTecnica", e.target.value)}
                    className="w-full text-xs border border-slate-200 bg-white text-slate-800 rounded-lg p-1.5 focus:ring-1 outline-none font-semibold"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nível de Polivalência do Principal</label>
                  <select
                    value={form.nivelPolivalencia}
                    onChange={e => updateField("nivelPolivalencia", Number(e.target.value))}
                    className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-lg p-2.5 focus:ring-1 outline-none font-semibold"
                  >
                    <option value={1}>Grau 1 - Em Formação Básica</option>
                    <option value={2}>Grau 2 - Operador em Supervisão</option>
                    <option value={3}>Grau 3 - Operador Autônomo (Ideal)</option>
                    <option value={4}>Grau 4 - Multiplicador / Instrutor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tempo Média de Capacitação</label>
                  <input
                    type="text"
                    value={form.tempoEstimadoFormacao}
                    placeholder="e.g. 6 meses para formação prática"
                    onChange={e => updateField("tempoEstimadoFormacao", e.target.value)}
                    className="w-full text-xs border border-slate-200 bg-white text-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 outline-none font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MATRIZ GUT CRITICIDADE */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
                <Calculator className="w-4 h-4 text-indigo-500" />
                <span>Etapa 3: Avaliação de Criticidade - Matriz GUT</span>
              </div>

              <p className="text-xs text-indigo-800 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 leading-relaxed font-semibold">
                Avalie os impactos corporativos sob a Matriz GUT. Riscos agudos (GUT &ge; 100) demandam planos imediatos de polivalência para auditorias do SGQ.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Gravidade (G)</label>
                    <span className="text-xs font-mono font-bold text-indigo-650">{form.gravidade}/5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={form.gravidade}
                    onChange={e => updateField("gravidade", Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-[9px] text-slate-400 block mt-1 font-bold">1: Baixa | 5: Gravíssima</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Urgência (U)</label>
                    <span className="text-xs font-mono font-bold text-indigo-650">{form.urgencia}/5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={form.urgencia}
                    onChange={e => updateField("urgencia", Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-[9px] text-slate-400 block mt-1 font-bold">1: Longo Prazo | 5: Imediata</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Tendência (T)</label>
                    <span className="text-xs font-mono font-bold text-indigo-650">{form.tendencia}/5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={form.tendencia}
                    onChange={e => updateField("tendencia", Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-[9px] text-slate-400 block mt-1 font-bold">1: Estável | 5: Piora Rápida</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mt-4">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Criticidade GUT Resultante</span>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-3xl font-mono font-black text-slate-800">{liveGUT}</span>
                  <span className="text-xs text-slate-400 font-bold uppercase">pontos</span>
                  <span className={`ml-4 text-xs font-extrabold px-2.5 py-1 rounded uppercase tracking-wider ${
                    liveClassification === "Crítico" 
                      ? "bg-rose-50 text-rose-700 border border-rose-100" 
                      : liveClassification === "Alto" 
                      ? "bg-amber-50 text-amber-700 border border-amber-100" 
                      : liveClassification === "Médio" 
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-100" 
                      : "bg-teal-50 text-teal-700 border border-teal-100"
                  }`}>
                    {liveClassification}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código do Plano PDCA Relacionado</label>
                <input
                  type="text"
                  value={form.acaoPDCARelacionada}
                  placeholder="e.g. PDCA-CORTE-2026-04"
                  onChange={e => updateField("acaoPDCARelacionada", e.target.value)}
                  className="w-full text-xs border border-slate-200 bg-white text-slate-800 rounded-lg p-2.5 font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: VULNERABILITY & PROCESS IMPACT */}
          {activeStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>Etapa 4: Vulnerabilidade Técnica Industrial</span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Avalie o impacto financeiro/operacional e a dependência que o maquinário possui da regulagem técnica do colaborador principal.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Grau de Dependência Técnica</label>
                  <select
                    value={form.grauDependenciaTecnica}
                    onChange={e => updateField("grauDependenciaTecnica", Number(e.target.value))}
                    className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-lg p-2.5 focus:ring-1 outline-none font-semibold"
                  >
                    <option value={1}>1 - Operação simples / sem setups</option>
                    <option value={2}>2 - Regulagem pontual de guia</option>
                    <option value={3}>3 - Operador comum de máquina</option>
                    <option value={4}>4 - Engenharia de processo fina</option>
                    <option value={5}>5 - Dependência exclusiva (Gargalo Humano)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Impacto na Manufatura / Produção</label>
                    <span className="text-xs font-mono font-bold text-indigo-650">{form.impactoProducao}/5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={form.impactoProducao}
                    onChange={e => updateField("impactoProducao", Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-[9px] text-slate-400 block mt-1 font-bold">1: Leve atraso | 5: Parada total de planta</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Impacto no Atendimento ao Cliente</label>
                    <span className="text-xs font-mono font-bold text-indigo-650">{form.impactoCliente}/5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={form.impactoCliente}
                    onChange={e => updateField("impactoCliente", Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-[9px] text-slate-400 block mt-1 font-bold">1: Insignificante | 5: Multas / Cancelamentos</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Impacto da Perda na Qualidade</label>
                    <span className="text-xs font-mono font-bold text-indigo-650">{form.impactoQualidade}/5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={form.impactoQualidade}
                    onChange={e => updateField("impactoQualidade", Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-[9px] text-slate-400 block mt-1 font-bold">1: Variação estética | 5: Recall / Defeito crítico</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Diagnóstico Geral de Vulnerabilidade</span>
                <div className="flex justify-between items-center pt-1">
                  <div>
                    <span className="text-3xl font-mono font-black text-slate-800">{liveVulnerability}</span>
                    <span className="text-xs text-slate-400 font-bold uppercase ml-1">/ 30 pontos</span>
                  </div>
                  <div className="text-right text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                    <p>Fórmula: Dep. Técnica + Prod + Cli + Qual</p>
                    <p className="mt-1">Punição sem Backup: {form.existeBackup === "NÃO" ? "+10 (Ativo)" : "+0 (Isento)"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: ACTIONS, ISO COMPLIANCE */}
          {activeStep === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Etapa 5: Requisitos ISO 9001:2015 & Planos de Mitigação</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Requisito ISO Regulador</label>
                  <select
                    value={form.requisitoISO}
                    onChange={e => updateField("requisitoISO", e.target.value)}
                    className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-lg p-2.5 focus:ring-1 outline-none font-semibold"
                  >
                    {REQUISITOS_ISO.map(item => (
                      <option key={item.id} value={item.id}>Cláusula {item.id} - {item.desc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Evidência de Conformidade Recomenda</label>
                  <input
                    type="text"
                    value={form.evidenciaNecessaria}
                    placeholder="e.g. Ficha de treinamento e registro de habilidade"
                    onChange={e => updateField("evidenciaNecessaria", e.target.value)}
                    className="w-full text-xs border border-slate-200 bg-white text-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prazo de Mitigação Planejado</label>
                  <input
                    type="date"
                    value={form.prazo}
                    onChange={e => updateField("prazo", e.target.value)}
                    className="w-full text-xs border border-slate-200 bg-white text-slate-800 rounded-lg p-2.5 focus:ring-1 outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status do Plano</label>
                  <select
                    value={form.status}
                    onChange={e => updateField("status", e.target.value)}
                    className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-lg p-2.5 focus:ring-1 outline-none font-semibold"
                  >
                    <option value="Planejado">Planejado</option>
                    <option value="Em Execução">Em Execução</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Atrasado">Atrasado</option>
                  </select>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
                <h6 className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider">Ações de Contingenciamento de Pessoal</h6>
                
                <div className="grid grid-cols-1 gap-3 text-xs text-slate-700">
                  <div>
                    <span className="block font-bold text-slate-500 mb-1 text-[9px] uppercase tracking-wider">Ação para Redação de IT</span>
                    <input
                      type="text"
                      value={form.necessidadeIT}
                      onChange={e => updateField("necessidadeIT", e.target.value)}
                      className="w-full text-xs border border-slate-200 bg-white text-slate-800 rounded-lg p-2 focus:ring-1 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-500 mb-1 text-[9px] uppercase tracking-wider">Ação de Capacitação / Treinamentos</span>
                    <input
                      type="text"
                      value={form.necessidadeTreinamento}
                      onChange={e => updateField("necessidadeTreinamento", e.target.value)}
                      className="w-full text-xs border border-slate-200 bg-white text-slate-800 rounded-lg p-2 focus:ring-1 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-500 mb-1 text-[9px] uppercase tracking-wider">Ação de Sucessão / Duplicidade Humana</span>
                    <input
                      type="text"
                      value={form.necessidadeSucessao}
                      onChange={e => updateField("necessidadeSucessao", e.target.value)}
                      className="w-full text-xs border border-slate-200 bg-white text-slate-800 rounded-lg p-2 focus:ring-1 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex justify-between items-center border-t border-slate-200 pt-5 mt-4">
            <button
              type="button"
              disabled={activeStep === 1}
              onClick={handleBack}
              className="px-4 py-2 text-xs font-bold border border-slate-200 text-slate-650 rounded-lg disabled:opacity-40 enabled:hover:bg-slate-50 cursor-pointer flex items-center gap-1 transition-all outline-none"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            {activeStep < steps.length ? (
              <button
                type="submit"
                className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-700 active:bg-indigo-850 rounded-lg cursor-pointer flex items-center gap-1 transition-all outline-none border-0 shadow-sm"
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-850 rounded-lg shadow-sm cursor-pointer flex items-center gap-1 transition-all outline-none border-0"
              >
                <Save className="w-4 h-4" />
                {editFuncNode ? "Salvar Alterações" : "Salvar Registro Completo"}
              </button>
            )}
          </div>

        </form>

        {/* Right Column: Calculations & Live Succession Simulator Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Live succession simulator panel */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-5">
            <div className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full w-fit text-[10px] font-bold border border-indigo-100">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Simulador de Sucessão Live</span>
            </div>

            {/* Simulated Live Scores */}
            <div className="space-y-4 pt-1">
              
              {/* Radial or circular progress simulation replacement */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between gap-4 shadow-inner">
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider leading-none">Maturidade do Cargo</span>
                  <span className="block text-2xl font-black text-slate-800 font-mono mt-1">{liveMaturityScore}%</span>
                  <span className="block text-[8px] text-slate-400 font-bold uppercase mt-0.5">Maturidade Ponderada UBG</span>
                </div>
                <div className="w-14 h-14 relative flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.915" fill="none" 
                      stroke={liveMaturityScore < 50 ? '#ef4444' : liveMaturityScore < 75 ? '#f59e0b' : '#0d9488'} 
                      strokeWidth="3.5" 
                      strokeDasharray={`${liveMaturityScore}, 100`} 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black font-mono text-slate-700">{liveMaturityScore}%</span>
                </div>
              </div>

              {/* Sub-scores */}
              <div className="space-y-3 font-semibold text-[11px] text-slate-600">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Skills / Polivalência (Grau {form.nivelPolivalencia})</span>
                    <span className="font-bold text-slate-850">{liveTrainingScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                    <div className={`h-1.5 rounded-full ${liveTrainingScore < 50 ? 'bg-rose-500' : liveTrainingScore < 75 ? 'bg-amber-400' : 'bg-teal-500'}`} style={{ width: `${liveTrainingScore}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Backup Redundância</span>
                    <span className="font-bold text-slate-850">{liveBackupScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                    <div className={`h-1.5 rounded-full ${liveBackupScore === 0 ? 'bg-rose-500' : liveBackupScore < 100 ? 'bg-amber-400' : 'bg-teal-500'}`} style={{ width: `${liveBackupScore}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Cobertura Geral de Equipe</span>
                    <span className="font-bold text-slate-850">{liveCoverageScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                    <div className={`h-1.5 rounded-full ${liveCoverageScore < 50 ? 'bg-rose-500' : liveCoverageScore < 100 ? 'bg-amber-400' : 'bg-teal-500'}`} style={{ width: `${liveCoverageScore}%` }}></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Live Alerts generated inside simulator */}
            <div className="border-t border-slate-200 pt-4 space-y-2">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Alertas Simulados Live</span>
              {liveAlerts.length === 0 ? (
                <div className="p-2.5 bg-teal-50 border border-teal-100 text-teal-700 text-[10px] rounded font-bold">
                  ✓ Configuração Segura de Sucessão!
                </div>
              ) : (
                <div className="space-y-1 max-h-[100px] overflow-y-auto pr-1">
                  {liveAlerts.map((al, idx) => (
                    <div key={idx} className={`p-2 rounded border text-[9px] flex items-center gap-1.5 font-bold ${
                      al.severity === 'critical' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-amber-50 border-amber-100 text-amber-700'
                    }`}>
                      <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${al.severity === 'critical' ? 'text-rose-600' : 'text-amber-600'}`} />
                      <span className="truncate">{al.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Vulnerabilidade Padrão</span>
                <span className={`font-bold ${liveVulnerability >= 25 ? 'text-rose-600' : 'text-slate-800'}`}>{liveVulnerability} pt</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Criticidade GUT</span>
                <span className={`font-bold ${liveGUT >= 100 ? 'text-rose-600' : 'text-slate-800'}`}>{liveGUT} pt</span>
              </div>
            </div>
          </div>

          {/* Quick tips about parameters list */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm text-xs text-slate-600 space-y-2.5">
            <h6 className="font-bold text-slate-800 font-sans">Guia de Preenchimento do Mapeamento</h6>
            <ul className="space-y-2 list-disc list-inside text-slate-500 font-semibold text-[11px]">
              <li>Use o <strong className="text-slate-700">Setor</strong> para sugerir prefixos padronizados de ID.</li>
              <li>O campo <strong className="text-slate-700">Backup 1</strong> é vital para elevar o score de redundância live.</li>
              <li>Associe um código de documento UBG válido sob controle da norma ISO Cl. 7.2.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}

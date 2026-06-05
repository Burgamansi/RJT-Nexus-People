import { useState } from "react";
import { 
  Search, 
  Trash2, 
  Edit3, 
  FileSpreadsheet, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal,
  X,
  FileCheck,
  Calendar,
  AlertTriangle,
  Award,
  Users,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  Zap
} from "lucide-react";
import { 
  FuncaoCritica, 
  ActionPlan, 
  ISOEvidence, 
  SETORES,
  Collaborator,
  Skill,
  CompetencyAssessment,
  CompetencyLevel,
  CompetencyLabels,
  calculateBackupScore,
  calculateCoverageScore,
  calculateTrainingScore,
  calculateMaturityScore,
  getFunctionAlerts,
  selectIsValidBackup,
  selectSkillGapsForFunction,
  selectBackupCandidatesForFunction,
  selectRiskScore
} from "../types";

interface RankingVulnerabilidadeProps {
  funcoes: FuncaoCritica[];
  acoes: ActionPlan[];
  evidencias: ISOEvidence[];
  collaborators?: Collaborator[];
  skills?: Skill[];
  assessments?: CompetencyAssessment[];
  onDeleteFuncao: (id: number) => void;
  onSelectEdit: (funcao: FuncaoCritica) => void;
  onUpdateAcaoStatus: (id: number, newStatus: "Planejado" | "Em Execução" | "Concluido" | "Cancelado") => void;
  onUpdateEvidenciaStatus: (id: number, status: "Pendente" | "Em Análise" | "Validada") => void;
  onNavigateTab: (tab: string) => void;
  onUpdateCollaboratorSkills?: (colabId: string, updatedSkills: any[]) => void;
  onAddAssessment?: (newAs: CompetencyAssessment) => void;
}

export default function RankingVulnerabilidade({ 
  funcoes, 
  acoes,
  evidencias,
  collaborators = [],
  skills = [],
  assessments = [],
  onDeleteFuncao, 
  onSelectEdit,
  onUpdateAcaoStatus,
  onUpdateEvidenciaStatus,
  onNavigateTab,
  onUpdateCollaboratorSkills = () => {},
  onAddAssessment = () => {}
}: RankingVulnerabilidadeProps) {
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("TODOS");
  const [selectedRisk, setSelectedRisk] = useState("TODOS");
  const [selectedBackupState, setSelectedBackupState] = useState("TODOS");
  const [sortBy, setSortBy] = useState<"vulnerabilidade" | "gut" | "codigo" | "maturidade">("vulnerabilidade");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Competency Assessment Form State
  const [assessmentForm, setAssessmentForm] = useState<{
    collaboratorId: string;
    skillId: string;
    level: CompetencyLevel;
    evidenceUrl: string;
  }>({
    collaboratorId: "",
    skillId: "",
    level: CompetencyLevel.INDEPENDENT,
    evidenceUrl: ""
  });

  const getCalculatedStats = (f: FuncaoCritica) => {
    const bkp = calculateBackupScore(f, collaborators, evidencias, acoes);
    const cov = calculateCoverageScore(f, collaborators, evidencias, acoes);
    const trn = calculateTrainingScore(f, acoes);
    const mat = calculateMaturityScore(bkp, trn, cov);
    return { bkp, cov, trn, mat };
  };

  // Filter application
  const filteredList = funcoes.filter(f => {
    const bkpScore = calculateBackupScore(f, collaborators, evidencias, acoes);
    
    const matchesSearch = f.funcaoCritica.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.colaboradorPrincipal.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.idFuncao.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSector = selectedSector === "TODOS" || f.setor === selectedSector;
    const matchesRisk = selectedRisk === "TODOS" || f.classificacaoFinal === selectedRisk;
    
    const matchesBackup = selectedBackupState === "TODOS" || 
                         (selectedBackupState === "COM_BKP" && bkpScore > 0) || 
                         (selectedBackupState === "SEM_BKP" && bkpScore === 0);

    return matchesSearch && matchesSector && matchesRisk && matchesBackup;
  });

  const sortedList = [...filteredList].sort((a, b) => {
    let multiplier = sortOrder === "desc" ? 1 : -1;
    if (sortBy === "vulnerabilidade") {
      return (b.scoreVulnerabilidade - a.scoreVulnerabilidade) * multiplier;
    } else if (sortBy === "gut") {
      return (b.scoreGUT - a.scoreGUT) * multiplier;
    } else if (sortBy === "maturidade") {
      const statsA = getCalculatedStats(a);
      const statsB = getCalculatedStats(b);
      return (statsB.mat - statsA.mat) * multiplier;
    } else {
      return a.idFuncao.localeCompare(b.idFuncao) * multiplier;
    }
  });

  const handleSortToggle = (type: "vulnerabilidade" | "gut" | "codigo" | "maturidade") => {
    if (sortBy === type) {
      setSortOrder(prev => prev === "desc" ? "asc" : "desc");
    } else {
      setSortBy(type);
      setSortOrder("desc");
    }
  };

  const toggleRowExpand = (id: number) => {
    setExpandedRow(prev => prev === id ? null : id);
    // Reset form when expanding/collapsing
    setAssessmentForm({
      collaboratorId: "",
      skillId: "",
      level: CompetencyLevel.INDEPENDENT,
      evidenceUrl: ""
    });
  };

  // Perform a direct competency assessment on an operator
  const handleRegisterAssessment = (func: FuncaoCritica) => {
    const colabId = assessmentForm.collaboratorId;
    const skillId = assessmentForm.skillId;
    const levelStr = assessmentForm.level;
    
    if (!colabId || !skillId) {
      alert("Selecione o Colaborador e a Habilidade para avaliar.");
      return;
    }
    
    const colab = collaborators.find(c => c.id === colabId);
    const skill = skills.find(s => s.id === skillId);
    if (!colab || !skill) return;
    
    // Update the collaborator's skills array
    const updatedSkills = colab.skills.map(s => {
      if (s.skillId === skillId) {
        return {
          ...s,
          proficiencyLevel: levelStr,
          acquiredAt: new Date().toISOString().split("T")[0],
          isCertified: levelStr === CompetencyLevel.INDEPENDENT || levelStr === CompetencyLevel.MULTIPLIER
        };
      }
      return s;
    });
    
    // Register CompetencyAssessment audit trail
    const newAs: CompetencyAssessment = {
      id: `as_${Date.now()}`,
      collaboratorId: colabId,
      skillId: skillId,
      assessedLevel: levelStr,
      assessedById: "colab_03", // Supervisor (Eliane Marchesine Netto)
      assessmentDate: new Date().toISOString().split("T")[0],
      evidenceDocumentUrl: assessmentForm.evidenceUrl || undefined,
      observations: `Avaliação regulatória no posto de trabalho União Bag para a função ${func.idFuncao}.`
    };
    
    onUpdateCollaboratorSkills(colabId, updatedSkills);
    onAddAssessment(newAs);
    
    // Reset form
    setAssessmentForm({
      collaboratorId: "",
      skillId: "",
      level: CompetencyLevel.INDEPENDENT,
      evidenceUrl: ""
    });
  };

  const handleExportCSV = () => {
    const headers = [
      "ID", "Setor", "Processo", "Função Crítica", "Principal", "Backup 1", "Backup 2",
      "Existe Backup", "GUT Score", "Vulnerabilidade Score", "Classificação", "ISO Cláusula", "Maturidade Score"
    ];
    
    const csvRows = funcoes.map(f => {
      const stats = getCalculatedStats(f);
      return [
        f.idFuncao, f.setor, f.processo, `"${f.funcaoCritica}"`, `"${f.colaboradorPrincipal}"`, 
        `"${f.backup1}"`, `"${f.backup2}"`, f.existeBackup, f.scoreGUT, f.scoreVulnerabilidade, 
        f.classificacaoFinal, f.requisitoISO, `${stats.mat}%`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...csvRows.map(row => row.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RJT_NEXUS_Ranking_Talentos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-800 relative z-10 animate-fade-in">
      
      {/* Title & Quick actions header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans">Fichas Operacionais & Risco de Sucessão</h2>
          <p className="text-xs text-slate-500">Mapeamento de polivalência, análise GUT e conformidade de competências técnicas.</p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer shadow-sm transition-all"
            title="Exportar base consolidada para planilha Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-600" />
            <span>Exportar (CSV)</span>
          </button>
          
          <button
            onClick={() => onNavigateTab("cadastro")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-650 hover:bg-indigo-700 active:bg-indigo-850 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer transition-all border-0"
          >
            <Plus className="w-4 h-4" />
            <span>Mapear Competência</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS GRID */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-655" />
          <span>Filtros do Sistema de Sucessão</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Buscar por função, ID ou colaborador..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50 text-slate-800 text-xs rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={selectedSector}
              onChange={e => setSelectedSector(e.target.value)}
              className="w-full p-2 border border-slate-200 bg-slate-50 text-slate-705 text-xs rounded-lg focus:outline-none focus:ring-1"
            >
              <option value="TODOS">Setor: Todos</option>
              {SETORES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <select
              value={selectedRisk}
              onChange={e => setSelectedRisk(e.target.value)}
              className="w-full p-2 border border-slate-200 bg-slate-50 text-slate-705 text-xs rounded-lg focus:outline-none focus:ring-1"
            >
              <option value="TODOS">Criticidade: Todas</option>
              <option value="Crítico">Crítico (WRE Index &ge; 75)</option>
              <option value="Alto">Alto (WRE Index 40-74)</option>
              <option value="Médio">Médio (WRE Index 20-39)</option>
              <option value="Baixo">Baixo (WRE Index &lt; 20)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedBackupState}
              onChange={e => setSelectedBackupState(e.target.value)}
              className="w-full p-2 border border-slate-200 bg-slate-50 text-slate-705 text-xs rounded-lg focus:outline-none focus:ring-1"
            >
              <option value="TODOS">Mapeamento Backup: Todos</option>
              <option value="SEM_BKP">Sem backup ativo (Risco Elevado)</option>
              <option value="COM_BKP">Com backup habilitado</option>
            </select>
          </div>

        </div>

        {/* Clear filters utility if there are filters active */}
        {(searchTerm || selectedSector !== "TODOS" || selectedRisk !== "TODOS" || selectedBackupState !== "TODOS") && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedSector("TODOS");
                setSelectedRisk("TODOS");
                setSelectedBackupState("TODOS");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-655 rounded-full text-[10px] font-bold cursor-pointer transition-all border border-slate-200"
            >
              <X className="w-3 h-3 text-slate-500" />
              Resetar Filtros
            </button>
          </div>
        )}
      </div>

      {/* DETAILED DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider [&>th]:px-6 [&>th]:py-3.5">
                <th className="cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSortToggle("codigo")}>
                  <div className="flex items-center gap-1">
                    <span>ID Função</span>
                    {sortBy === "codigo" && (sortOrder === "desc" ? <ChevronDown className="w-3.5 h-3.5 text-slate-600" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-600" />)}
                  </div>
                </th>
                <th>Setor & Processo</th>
                <th>Cargo / Função Mapeada</th>
                <th>Operador Principal</th>
                <th className="cursor-pointer hover:bg-slate-100 transition-colors text-center" onClick={() => handleSortToggle("gut")}>
                  <div className="flex items-center justify-center gap-1">
                    <span>Criticidade (GUT)</span>
                    {sortBy === "gut" && (sortOrder === "desc" ? <ChevronDown className="w-3.5 h-3.5 text-slate-600" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-600" />)}
                  </div>
                </th>
                <th className="cursor-pointer hover:bg-slate-100 transition-colors text-center" onClick={() => handleSortToggle("maturidade")}>
                  <div className="flex items-center justify-center gap-1 text-[#000675]">
                    <span>Maturidade</span>
                    {sortBy === "maturidade" && (sortOrder === "desc" ? <ChevronDown className="w-3.5 h-3.5 text-[#000675]" /> : <ChevronUp className="w-3.5 h-3.5 text-[#000675]" />)}
                  </div>
                </th>
                <th className="text-right pr-6">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {sortedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-bold">
                    Nenhuma ficha de competência encontrada.
                  </td>
                </tr>
              ) : (
                sortedList.map(f => {
                  const isExpanded = expandedRow === f.id;
                  const stats = getCalculatedStats(f);
                  const isLowMaturity = stats.mat < 50;
                  const isNoBackup = f.existeBackup === "NÃO" || stats.bkp === 0;

                  // Find connected Action Plans & ISO Evidence
                  const linkedActions = acoes.filter(ac => ac.funcaoCriticaId === f.id);
                  const linkedEvidences = evidencias.filter(ev => 
                    ev.codigoDocumentoUBG === f.codigoDocumentoUBG
                  );

                  // Collaborators mapped to this function
                  const mainOps = collaborators.filter(c => (f.mainOperatorIds || []).includes(c.id));
                  const backupOps = collaborators.filter(c => (f.backupOperatorIds || []).includes(c.id));

                  // Gather unique skills configurations
                  const requiredSkillsConfig = f.requiredSkills || [];

                  return (
                    <table-row-container key={f.id} className="contents">
                      {/* Standard row */}
                      <tr className={`hover:bg-slate-50 transition-all cursor-pointer ${
                        isLowMaturity ? "bg-rose-50/20" : isNoBackup ? "bg-amber-50/15" : ""
                      }`}>
                        
                        <td className="px-6 py-4.5 font-mono font-bold text-indigo-655" onClick={() => toggleRowExpand(f.id)}>
                          <span>{f.idFuncao}</span>
                        </td>

                        <td className="px-6 py-4.5 max-w-[200px]" onClick={() => toggleRowExpand(f.id)}>
                          <span className="block font-bold text-slate-800 truncate">{f.setor}</span>
                          <span className="block text-slate-400 text-[10px] truncate" title={f.processo}>{f.processo}</span>
                        </td>

                        <td className="px-6 py-4.5 font-medium text-slate-800 pr-2" onClick={() => toggleRowExpand(f.id)}>
                          <span className="block text-[13px] font-bold text-slate-900">{f.funcaoCritica}</span>
                          <span className="text-[9px] font-bold tracking-wider text-[#00A4FF] mt-0.5 inline-block uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                            ISO COMP: Cl. {f.requisitoISO}
                          </span>
                        </td>

                        <td className="px-6 py-4.5" onClick={() => toggleRowExpand(f.id)}>
                          <span className="font-bold text-slate-800 block">{f.colaboradorPrincipal}</span>
                          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400">
                            <span>Backup habilitado:</span>
                            <span className={isNoBackup ? "text-rose-600 font-bold" : "text-teal-600 font-bold"}>
                              {stats.bkp > 0 ? `${stats.bkp}%` : "Nenhum Ativo"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4.5 text-center" onClick={() => toggleRowExpand(f.id)}>
                          <span className="font-mono font-black block text-slate-850 text-sm">{f.scoreGUT}</span>
                          <span className={`inline-block text-[9px] font-extrabold uppercase mt-1 px-2 py-0.5 rounded ${
                            f.classificacaoFinal === "Crítico" 
                              ? "bg-rose-50 text-rose-700 border border-rose-100" 
                              : f.classificacaoFinal === "Alto" 
                              ? "bg-amber-50 text-amber-700 border border-amber-100" 
                              : f.classificacaoFinal === "Médio" 
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-100" 
                              : "bg-teal-50 text-teal-700 border border-teal-100"
                          }`}>
                            {f.classificacaoFinal}
                          </span>
                        </td>

                        <td className="px-6 py-4.5 text-center" onClick={() => toggleRowExpand(f.id)}>
                          <span className={`font-mono font-black text-sm block ${
                            isLowMaturity ? "text-rose-600" : stats.mat < 75 ? "text-amber-500" : "text-teal-655"
                          }`}>
                            {stats.mat}%
                          </span>
                          <div className="w-14 bg-slate-100 h-1.5 rounded-full overflow-hidden mx-auto mt-1 border border-slate-200">
                            <div className={`h-1.5 rounded-full ${
                              isLowMaturity ? "bg-rose-500" : stats.mat < 75 ? "bg-amber-400" : "bg-teal-500"
                            }`} style={{ width: `${stats.mat}%` }}></div>
                          </div>
                        </td>

                        <td className="px-6 py-4.5 text-right pr-6">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRowExpand(f.id);
                              }}
                              className="px-2.5 py-1 bg-[#000675] hover:bg-[#04044A] text-white rounded text-[10px] font-bold transition-all cursor-pointer border-0 shadow-sm"
                            >
                              {isExpanded ? "Fechar Dossiê" : "Ver Dossiê"}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectEdit(f);
                                onNavigateTab("cadastro");
                              }}
                              className="p-1.5 bg-white hover:bg-slate-100 text-slate-500 hover:text-indigo-650 rounded border border-slate-200 transition-colors cursor-pointer"
                              title="Editar registro"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Confirma a exclusão definitiva da função crítica [${f.idFuncao} - ${f.funcaoCritica}]?`)) {
                                  onDeleteFuncao(f.id);
                                }
                              }}
                              className="p-1.5 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded border border-slate-200 transition-colors cursor-pointer"
                              title="Excluir registro"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>

                      {/* Expandable row detail holding the Dossiê & the Skill Assessment Audit System */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 font-sans border-t border-b border-slate-200 animate-fade-in shadow-inner">
                          <td colSpan={7} className="px-6 py-6 text-xs text-slate-700">
                            
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-200 rounded p-5 shadow-sm">
                              
                              {/* COL 1: Dossiê Geral & Headcount */}
                              <div className="lg:col-span-4 space-y-4">
                                <div>
                                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                                    <BookOpen className="w-3.5 h-3.5 text-[#000675]" />
                                    Dossiê União Bag — Força de Trabalho
                                  </h4>
                                </div>
                                <div className="space-y-2.5">
                                  <p><strong className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Função Técnica Mapeada</strong> <span className="font-bold text-slate-800 text-xs">{f.funcaoCritica} ({f.idFuncao})</span></p>
                                  <p><strong className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Departamento Operacional</strong> <span className="font-semibold text-slate-700">{f.setor}</span></p>
                                  <p><strong className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Operadores Principais Ativos ({mainOps.length})</strong> 
                                    <span className="block leading-relaxed bg-slate-50 p-2 rounded border border-slate-150 text-[11px] font-bold text-[#04044A]">
                                      {mainOps.length > 0 ? mainOps.map(m => m.name).join(", ") : f.colaboradorPrincipal}
                                    </span>
                                  </p>
                                  <p><strong className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Operadores Substitutos Cadastrados ({backupOps.length})</strong> 
                                    <span className="block leading-relaxed bg-slate-50 p-2 rounded border border-slate-150 text-[11px] font-bold text-slate-700">
                                      {backupOps.length > 0 ? backupOps.map(b => b.name).join(", ") : f.backup1}
                                    </span>
                                  </p>
                                  <p><strong className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Tempo de Formação Requerido</strong> <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px]"><Clock className="w-3 h-3 text-slate-500" /> {f.tempoEstimadoFormacao}</span></p>
                                </div>
                              </div>

                              {/* COL 2: ISO, Evidências & Watchlist */}
                              <div className="lg:col-span-4 space-y-4 border-t lg:border-t-0 lg:border-l lg:border-r border-slate-200 lg:px-6">
                                <div>
                                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#000675]" />
                                    ISO 9001:2015 & Alertas
                                  </h4>
                                </div>
                                <div className="space-y-3">
                                  <div className="bg-slate-50 p-2.5 border border-slate-200 rounded flex items-center justify-between">
                                    <div>
                                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Risco de Sucessão Consolidado</span>
                                      <span className="block text-xs font-mono font-bold mt-1 text-slate-500">Calculado reativamente</span>
                                    </div>
                                    <span className={`text-xl font-mono font-bold ${f.scoreVulnerabilidade >= 60 ? 'text-rose-600 animate-pulse' : f.scoreVulnerabilidade >= 20 ? 'text-amber-600' : 'text-teal-655'}`}>
                                      {selectRiskScore(f, collaborators.reduce((acc, c) => ({ ...acc, [c.id]: c }), {}), evidencias, acoes)}
                                    </span>
                                  </div>

                                  <div className="bg-slate-50 p-2.5 border border-slate-200 rounded space-y-1">
                                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase">
                                      <span>Evidência Regulatório / ISO</span>
                                      <span>{f.codigoDocumentoUBG}</span>
                                    </div>
                                    <p className="text-[11px] font-medium text-slate-655 leading-snug">{f.evidenciaNecessaria}</p>
                                  </div>

                                  {/* Alertas dinâmicos baseados na proficiência real */}
                                  <div className="space-y-1">
                                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Passivo de Auditoria</span>
                                    {getFunctionAlerts(f, acoes).filter(al => al.active).map(al => (
                                      <div key={al.id} className={`p-2 rounded border text-[9px] leading-relaxed flex items-start gap-1 font-bold ${
                                        al.severity === "critical" 
                                          ? "bg-rose-50 border-rose-100 text-rose-700" 
                                          : "bg-amber-50 border-amber-100 text-amber-700"
                                      }`}>
                                        <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 text-rose-655" />
                                        <div>
                                          <p className="font-extrabold">{al.label}</p>
                                          <p className="text-[8.5px] font-medium text-slate-500">{al.desc}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                </div>
                              </div>

                              {/* COL 3: THE HR SKILL ASSESSMENT AUDIT TERMINAL (Auditable future support) */}
                              <div className="lg:col-span-4 space-y-4">
                                <div>
                                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                                    <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    Avaliação Prática de Competência
                                  </h4>
                                </div>

                                <div className="bg-[#F8FAFC] border border-slate-200 rounded p-4 space-y-3 text-xs shadow-inner">
                                  <span className="text-[9px] font-bold text-indigo-655 uppercase tracking-wider block">Registrar Novo Laudo de Proficiência</span>
                                  
                                  {/* Dropdown 1: Select Collaborator (Main or backup or any other) */}
                                  <div className="space-y-1">
                                    <label className="text-[9.5px] font-bold text-slate-550 uppercase">Colaborador Avaliado</label>
                                    <select
                                      value={assessmentForm.collaboratorId}
                                      onChange={e => setAssessmentForm(prev => ({ ...prev, collaboratorId: e.target.value }))}
                                      className="w-full p-1.5 border border-slate-250 bg-white text-xs rounded focus:outline-none"
                                    >
                                      <option value="">-- Selecionar Operador (55 da Planta) --</option>
                                      <optgroup label="Operadores deste Cargo">
                                        {[...mainOps, ...backupOps].map(c => (
                                          <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                      </optgroup>
                                      <optgroup label="Outros da Planta União Bag">
                                        {collaborators
                                          .filter(c => !mainOps.some(mo => mo.id === c.id) && !backupOps.some(bo => bo.id === c.id))
                                          .sort((a, b) => a.name.localeCompare(b.name))
                                          .map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                          ))
                                        }
                                      </optgroup>
                                    </select>
                                  </div>

                                  {/* Dropdown 2: Select Skill related to this function */}
                                  <div className="space-y-1">
                                    <label className="text-[9.5px] font-bold text-slate-550 uppercase">Habilidade Aferida</label>
                                    <select
                                      value={assessmentForm.skillId}
                                      onChange={e => setAssessmentForm(prev => ({ ...prev, skillId: e.target.value }))}
                                      className="w-full p-1.5 border border-slate-250 bg-white text-xs rounded focus:outline-none"
                                    >
                                      <option value="">-- Selecionar Requisito Técnico --</option>
                                      {requiredSkillsConfig.map(r => {
                                        const s = skills.find(sk => sk.id === r.skillId);
                                        return s ? (
                                          <option key={s.id} value={s.id}>{s.name} {r.isMandatory ? "(Obrigatória)" : ""}</option>
                                        ) : null;
                                      })}
                                      {requiredSkillsConfig.length === 0 && (
                                        <option value="" disabled>Sem habilidades vinculadas a este cargo</option>
                                      )}
                                    </select>
                                  </div>

                                  {/* Dropdown 3: Select Competency Level */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <label className="text-[9.5px] font-bold text-slate-550 uppercase">Nível Aferido</label>
                                      <select
                                        value={assessmentForm.level}
                                        onChange={e => setAssessmentForm(prev => ({ ...prev, level: e.target.value as CompetencyLevel }))}
                                        className="w-full p-1.5 border border-slate-250 bg-white text-xs rounded focus:outline-none font-bold text-slate-700"
                                      >
                                        {Object.entries(CompetencyLabels).map(([lvl, lbl]) => (
                                          <option key={lvl} value={lvl}>{lbl}</option>
                                        ))}
                                      </select>
                                    </div>

                                    {/* Input: Document verification code */}
                                    <div className="space-y-1">
                                      <label className="text-[9.5px] font-bold text-slate-550 uppercase">Ficha UBG Assinada</label>
                                      <input
                                        type="text"
                                        placeholder="Ex: Ficha UBG-098"
                                        value={assessmentForm.evidenceUrl}
                                        onChange={e => setAssessmentForm(prev => ({ ...prev, evidenceUrl: e.target.value }))}
                                        className="w-full p-1.5 border border-slate-250 bg-white text-xs rounded focus:outline-none font-mono"
                                      />
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => handleRegisterAssessment(f)}
                                    className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded font-bold transition-all shadow cursor-pointer border-0 mt-1 uppercase text-[10px]"
                                  >
                                    Salvar Laudo de Auditoria
                                  </button>
                                </div>

                              </div>

                            </div>

                            {/* Technical Gaps Watchlist */}
                            <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 text-[10px]">
                              
                              {/* Left column: Missing Gaps for registered operators */}
                              <div>
                                <span className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Relatório de Gaps de Habilidade da Função</span>
                                <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                                  {[...mainOps, ...backupOps].map(colab => {
                                    const gaps = selectSkillGapsForFunction(f, colab);
                                    if (gaps.length === 0) return null;
                                    return (
                                      <div key={colab.id} className="p-2 border border-slate-150 rounded bg-[#F8FAFC]">
                                        <span className="font-bold text-slate-750 block">{colab.name} (Pendente)</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {gaps.map(g => {
                                            const sk = skills.find(s => s.id === g.skillId);
                                            return (
                                              <span key={g.skillId} className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-100 text-[8.5px]">
                                                Falta {sk?.name || g.skillId} ({g.requiredLevel})
                                              </span>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {[...mainOps, ...backupOps].every(c => selectSkillGapsForFunction(f, c).length === 0) && (
                                    <p className="text-slate-400 italic text-[11px] leading-relaxed">Nenhum gap detectado nos operadores ativos.</p>
                                  )}
                                </div>
                              </div>

                              {/* Right column: Best Succession Candidates available in the plant */}
                              <div>
                                <span className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Candidatos a Backup Próximos de Qualificação</span>
                                <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                                  {selectBackupCandidatesForFunction(f, collaborators, evidencias, acoes).slice(0, 3).map(cnd => (
                                    <div key={cnd.collaborator.id} className="p-2 border border-slate-200 rounded bg-white flex items-center justify-between">
                                      <div>
                                        <span className="font-bold text-slate-800 block">{cnd.collaborator.name}</span>
                                        <span className="text-slate-450 block text-[8.5px] mt-0.5">Cargo: {skills.find(s => s.id === cnd.collaborator.primaryFunctionId)?.name || cnd.collaborator.primaryFunctionId}</span>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <span className="text-indigo-600 font-bold font-mono">{cnd.completedSkillsCount} / {(f.requiredSkills || []).length}</span>
                                        <span className="block text-slate-400 text-[8px] font-bold uppercase">Habilidades completas</span>
                                      </div>
                                    </div>
                                  ))}
                                  {selectBackupCandidatesForFunction(f, collaborators, evidencias, acoes).length === 0 && (
                                    <p className="text-slate-400 italic text-[11px] leading-relaxed">Nenhum candidato mapeado para a sucessão técnica.</p>
                                  )}
                                </div>
                              </div>

                            </div>

                          </td>
                        </tr>
                      )}
                    </table-row-container>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-[11px] text-slate-500 bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm font-semibold">
        <Sparkles className="w-5 h-5 shrink-0 text-indigo-500 animate-pulse-slow" />
        <span>
          <strong className="text-slate-700">Painel Integrado RJT:</strong> Clique em qualquer linha para abrir a <strong className="text-indigo-650">Ficha Unificada de Competência & Sucessão</strong>. Nela, você pode visualizar a maturidade da função, alertas ativos, preencher e salvar o laudo prático de auditoria para os operadores em tempo real!
        </span>
      </div>

    </div>
  );
}

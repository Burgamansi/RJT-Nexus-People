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
  TrendingUp
} from "lucide-react";
import { 
  FuncaoCritica, 
  ActionPlan, 
  ISOEvidence, 
  SETORES,
  calculateBackupScore,
  calculateCoverageScore,
  calculateTrainingScore,
  calculateMaturityScore,
  getFunctionAlerts
} from "../types";

interface RankingVulnerabilidadeProps {
  funcoes: FuncaoCritica[];
  acoes: ActionPlan[];
  evidencias: ISOEvidence[];
  onDeleteFuncao: (id: number) => void;
  onSelectEdit: (funcao: FuncaoCritica) => void;
  onUpdateAcaoStatus: (id: number, newStatus: "Planejado" | "Em Execução" | "Concluido" | "Cancelado") => void;
  onUpdateEvidenciaStatus: (id: number, status: "Pendente" | "Em Análise" | "Validada") => void;
  onNavigateTab: (tab: string) => void;
}

export default function RankingVulnerabilidade({ 
  funcoes, 
  acoes,
  evidencias,
  onDeleteFuncao, 
  onSelectEdit,
  onUpdateAcaoStatus,
  onUpdateEvidenciaStatus,
  onNavigateTab 
}: RankingVulnerabilidadeProps) {
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("TODOS");
  const [selectedRisk, setSelectedRisk] = useState("TODOS");
  const [selectedBackupState, setSelectedBackupState] = useState("TODOS");
  const [sortBy, setSortBy] = useState<"vulnerabilidade" | "gut" | "codigo" | "maturidade">("vulnerabilidade");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Helper to get all calculated stats for sorting
  const getCalculatedStats = (f: FuncaoCritica) => {
    const bkp = calculateBackupScore(f);
    const cov = calculateCoverageScore(f);
    const trn = calculateTrainingScore(f, acoes);
    const mat = calculateMaturityScore(bkp, trn, cov);
    return { bkp, cov, trn, mat };
  };

  // Filter application
  const filteredList = funcoes.filter(f => {
    const matchesSearch = f.funcaoCritica.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.colaboradorPrincipal.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.idFuncao.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSector = selectedSector === "TODOS" || f.setor === selectedSector;
    const matchesRisk = selectedRisk === "TODOS" || f.classificacaoFinal === selectedRisk;
    
    const matchesBackup = selectedBackupState === "TODOS" || 
                         (selectedBackupState === "COM_BKP" && f.existeBackup === "SIM") || 
                         (selectedBackupState === "SEM_BKP" && f.existeBackup === "NÃO");

    return matchesSearch && matchesSector && matchesRisk && matchesBackup;
  });

  // Sorting
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
  };

  // CSV Mock Export Utility
  const handleExportCSV = () => {
    const headers = [
      "ID", "Setor", "Processo", "Função Crítica", "Principal", "Backup 1", "Backup 2",
      "Existe Backup", "Polivalência", "Dependência", "GUT Score", 
      "Vulnerabilidade Score", "Classificação", "ISO Cláusula", "Maturidade Score"
    ];
    
    const csvRows = funcoes.map(f => {
      const stats = getCalculatedStats(f);
      return [
        f.idFuncao, f.setor, f.processo, `"${f.funcaoCritica}"`, `"${f.colaboradorPrincipal}"`, 
        `"${f.backup1}"`, `"${f.backup2}"`, f.existeBackup, f.nivelPolivalencia, f.grauDependenciaTecnica, 
        f.scoreGUT, f.scoreVulnerabilidade, f.classificacaoFinal, f.requisitoISO, `${stats.mat}%`
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer transition-all border-0"
          >
            <Plus className="w-4 h-4" />
            <span>Mapear Competência</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS GRID */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-650" />
          <span>Filtros do Sistema de Sucessão</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Search bar */}
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

          {/* Sector filter */}
          <div>
            <select
              value={selectedSector}
              onChange={e => setSelectedSector(e.target.value)}
              className="w-full p-2 border border-slate-200 bg-slate-50 text-slate-700 text-xs rounded-lg focus:outline-none focus:ring-1"
            >
              <option value="TODOS">Setor: Todos</option>
              {SETORES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Risk WRE Filter */}
          <div>
            <select
              value={selectedRisk}
              onChange={e => setSelectedRisk(e.target.value)}
              className="w-full p-2 border border-slate-200 bg-slate-50 text-slate-700 text-xs rounded-lg focus:outline-none focus:ring-1"
            >
              <option value="TODOS">Criticidade: Todas</option>
              <option value="Crítico">Crítico (WRE Index &ge; 75)</option>
              <option value="Alto">Alto (WRE Index 40-74)</option>
              <option value="Médio">Médio (WRE Index 20-39)</option>
              <option value="Baixo">Baixo (WRE Index &lt; 20)</option>
            </select>
          </div>

          {/* Backup state Filter */}
          <div>
            <select
              value={selectedBackupState}
              onChange={e => setSelectedBackupState(e.target.value)}
              className="w-full p-2 border border-slate-200 bg-slate-50 text-slate-700 text-xs rounded-lg focus:outline-none focus:ring-1"
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-[10px] font-bold cursor-pointer transition-all border border-slate-200"
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
                  <div className="flex items-center justify-center gap-1 text-indigo-650">
                    <span>Maturidade</span>
                    {sortBy === "maturidade" && (sortOrder === "desc" ? <ChevronDown className="w-3.5 h-3.5 text-indigo-650" /> : <ChevronUp className="w-3.5 h-3.5 text-indigo-650" />)}
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
                    ev.codigoDocumentoUBG === f.codigoDocumentoUBG || 
                    ev.requisitoISO === f.requisitoISO
                  );

                  // Extract dynamic skill tags
                  const skills = f.atividadeTecnicaCritica
                    .split(",")
                    .map(s => s.trim())
                    .filter(s => s.length > 0)
                    .slice(0, 4);

                  return (
                    <table-row-container key={f.id} className="contents">
                      {/* Standard row */}
                      <tr className={`hover:bg-slate-50 transition-all cursor-pointer ${
                        isLowMaturity ? "bg-rose-50/30" : isNoBackup ? "bg-amber-50/20" : ""
                      }`}>
                        
                        {/* ID */}
                        <td className="px-6 py-4.5 font-mono font-bold text-indigo-600" onClick={() => toggleRowExpand(f.id)}>
                          <span>{f.idFuncao}</span>
                        </td>

                        {/* Sector & Process */}
                        <td className="px-6 py-4.5 max-w-[200px]" onClick={() => toggleRowExpand(f.id)}>
                          <span className="block font-bold text-slate-800">{f.setor}</span>
                          <span className="block text-slate-400 text-[10px] truncate" title={f.processo}>{f.processo}</span>
                        </td>

                        {/* Critical function */}
                        <td className="px-6 py-4.5 font-medium text-slate-800 pr-2" onClick={() => toggleRowExpand(f.id)}>
                          <span className="block text-[13px] font-bold text-slate-900">{f.funcaoCritica}</span>
                          <span className="text-[9px] font-bold tracking-wider text-slate-400 mt-0.5 inline-block uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                            ISO COMP: Cl. {f.requisitoISO}
                          </span>
                        </td>

                        {/* Principal worker */}
                        <td className="px-6 py-4.5" onClick={() => toggleRowExpand(f.id)}>
                          <span className="font-bold text-slate-800">{f.colaboradorPrincipal}</span>
                          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400">
                            <span>Backup:</span>
                            <span className={isNoBackup ? "text-rose-600 font-bold" : "text-teal-600 font-bold"}>
                              {f.existeBackup === "SIM" && f.backup1 ? f.backup1 : "Nenhum Ativo"}
                            </span>
                          </div>
                        </td>

                        {/* GUT Score with severity pill */}
                        <td className="px-6 py-4.5 text-center" onClick={() => toggleRowExpand(f.id)}>
                          <span className="font-mono font-black block text-slate-800 text-sm">{f.scoreGUT}</span>
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

                        {/* Function Maturity Score indicator */}
                        <td className="px-6 py-4.5 text-center" onClick={() => toggleRowExpand(f.id)}>
                          <span className={`font-mono font-black text-sm block ${
                            isLowMaturity ? "text-rose-655" : stats.mat < 75 ? "text-amber-600" : "text-teal-655"
                          }`}>
                            {stats.mat}%
                          </span>
                          <div className="w-14 bg-slate-100 h-1.5 rounded-full overflow-hidden mx-auto mt-1 border border-slate-200">
                            <div className={`h-1.5 rounded-full ${
                              isLowMaturity ? "bg-rose-500" : stats.mat < 75 ? "bg-amber-400" : "bg-teal-500"
                            }`} style={{ width: `${stats.mat}%` }}></div>
                          </div>
                        </td>

                        {/* Row Action triggers */}
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

                      {/* Expandable row detail holding more of the 34 fields */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 font-sans border-t border-b border-slate-200 animate-fade-in shadow-inner">
                          <td colSpan={7} className="px-6 py-6 text-xs text-slate-700">
                            
                            {/* Segmented Dossiê Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-200 rounded p-5 shadow-sm">
                              
                              {/* COL 1: Dossiê Geral & Sucessores */}
                              <div className="lg:col-span-4 space-y-4">
                                <div>
                                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100 font-sans">
                                    <BookOpen className="w-3.5 h-3.5 text-[#000675]" />
                                    Dossiê da Função — União Bag
                                  </h4>
                                </div>
                                <div className="space-y-2.5">
                                  <p><strong className="text-slate-450 font-bold uppercase text-[9px] tracking-wider block">Função Mapeada</strong> <span className="font-bold text-slate-800 text-xs">{f.funcaoCritica} ({f.idFuncao})</span></p>
                                  <p><strong className="text-slate-450 font-bold uppercase text-[9px] tracking-wider block">Setor / Departamento</strong> <span className="font-semibold text-slate-750">{f.setor}</span></p>
                                  <p><strong className="text-slate-450 font-bold uppercase text-[9px] tracking-wider block">Atividade Prática Crítica</strong> <span className="block leading-relaxed bg-slate-50 p-2 rounded border border-slate-150 text-[11px] font-medium">{f.atividadeTecnicaCritica}</span></p>
                                  <p><strong className="text-slate-450 font-bold uppercase text-[9px] tracking-wider block">Nível de Criticidade</strong> <span className={`font-bold inline-block px-1.5 py-0.5 rounded text-[9.5px] uppercase ${f.classificacaoFinal === 'Crítico' || f.classificacaoFinal === 'Alta' ? 'bg-rose-50 text-rose-700 border border-rose-100' : f.classificacaoFinal === 'Alto' || f.classificacaoFinal === 'Média' || f.classificacaoFinal === 'Médio' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-teal-50 text-teal-700 border border-teal-100'}`}>{f.classificacaoFinal}</span></p>
                                  <p><strong className="text-slate-450 font-bold uppercase text-[9px] tracking-wider block">Backup Status</strong> <span className="font-bold text-slate-800">{ (f as any).backupStatus || (f.existeBackup === "SIM" ? "Backup validado" : "Sem backup") }</span></p>
                                  <p><strong className="text-slate-450 font-bold uppercase text-[9px] tracking-wider block">Status de Treinamento</strong> <span className="font-bold text-slate-800">{ (f as any).trainingStatus || "Não iniciado" }</span></p>
                                  <p><strong className="text-slate-450 font-bold uppercase text-[9px] tracking-wider block">Tempo Estimado de Formação</strong> <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px]"><Clock className="w-3 h-3 text-slate-500" /> { (f as any).tempoEstimadoFormacaoDias ? `${(f as any).tempoEstimadoFormacaoDias} dias` : f.tempoEstimadoFormacao }</span></p>
                                  <div>
                                    <strong className="text-slate-450 font-bold uppercase text-[9px] tracking-wider block mb-1">Competências Requeridas</strong>
                                    <div className="flex flex-wrap gap-1">
                                      {skills.length > 0 ? skills.map((s, idx) => (
                                        <span key={idx} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[9px] font-bold border border-indigo-100">{s}</span>
                                      )) : <span className="text-slate-400 italic">Nenhum requisito cadastrado</span>}
                                    </div>
                                  </div>
                                              {/* COL 2: Métricas, Risco & Evidências ISO */}
                              <div className="lg:col-span-4 space-y-4 border-t lg:border-t-0 lg:border-l lg:border-r border-slate-200 lg:px-6">
                                <div>
                                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100 font-sans">
                                    <TrendingUp className="w-3.5 h-3.5 text-[#000675]" />
                                    Risco, ISO & Evidências
                                  </h4>
                                </div>
                                <div className="space-y-3">
                                  <div className="bg-slate-50 p-3 border border-slate-200 rounded flex items-center justify-between">
                                    <div>
                                      <span className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider leading-none">Risk Score (Vulnerabilidade)</span>
                                      <span className="block text-xs font-mono font-bold mt-1 text-slate-400">Escala de 0 a 100</span>
                                    </div>
                                    <span className={`text-xl font-mono font-bold ${f.scoreVulnerabilidade >= 60 ? 'text-rose-600' : f.scoreVulnerabilidade >= 20 ? 'text-amber-600' : 'text-teal-600'}`}>
                                      {f.scoreVulnerabilidade}.00
                                    </span>
                                  </div>

                                  <div className="bg-slate-50 p-3 border border-slate-200 rounded flex items-center justify-between">
                                    <div>
                                      <span className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider leading-none">Relação ISO 9001:2015</span>
                                      <span className="block text-xs font-bold mt-1 text-slate-700">Cláusula {f.requisitoISO}</span>
                                    </div>
                                  </div>

                                  <div className="bg-slate-50 p-3 border border-slate-200 rounded space-y-1.5">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider leading-none">Evidência Requerida</span>
                                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${ (f as any).evidenciaStatus === "Validada" ? "bg-teal-50 text-teal-700 border border-teal-100" : (f as any).evidenciaStatus === "Parcial" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-rose-50 text-rose-700 border border-rose-100" }`}>
                                        { (f as any).evidenciaStatus || "Pendente" }
                                      </span>
                                    </div>
                                    <span className="block text-[11px] font-medium leading-relaxed text-slate-600 pt-0.5">
                                      {f.evidenciaNecessaria || "Ficha de polivalência técnica homologada no SGQ"}
                                    </span>
                                  </div>
                                </div>                     </div>
                                </div>

                                {/* Active HR succession alerts */}
                                <div className="space-y-1.5 pt-1">
                                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Garantia contra gargalos</span>
                                  {getFunctionAlerts(f, acoes).filter(al => al.active).length === 0 ? (
                                    <div className="p-2.5 bg-teal-50 border border-teal-100 text-teal-700 text-[10px] rounded font-bold flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                                      <span>Função Operacional Segura e Mitigada</span>
                                    </div>
                                  ) : (
                                    <div className="space-y-1.5 max-h-[85px] overflow-y-auto pr-1">
                                      {getFunctionAlerts(f, acoes).filter(al => al.active).map(al => (
                                        <div key={al.id} className={`p-2 rounded border text-[9px] leading-relaxed flex items-start gap-1.5 font-bold ${
                                          al.severity === "critical" 
                                            ? "bg-rose-50 border-rose-100 text-rose-700" 
                                            : "bg-amber-50 border-amber-100 text-amber-700"
                                        }`}>
                                          <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${al.severity === 'critical' ? 'text-rose-600' : 'text-amber-600'}`} />
                                          <div>
                                            <p className="font-extrabold">{al.label}</p>
                                            <p className="text-[8.5px] font-medium text-slate-500 mt-0.5">{al.desc}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* COL 3: PDCA & Auditoria ISO (Conectividade Direta) */}
                              <div className="lg:col-span-4 space-y-4">
                                <div>
                                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                                    <FileCheck className="w-3.5 h-3.5 text-indigo-650" />
                                    Planos PDCA & Evidências
                                  </h4>
                                </div>

                                {/* PDCA Actions List with direct status update */}
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                    <span>Planos de Ação Conectados</span>
                                    <span className="text-indigo-600 font-extrabold">Direto</span>
                                  </div>
                                  
                                  {linkedActions.length === 0 ? (
                                    <p className="text-[10px] text-slate-400 italic bg-slate-50 p-2.5 rounded text-center border border-slate-100">Nenhum plano de ação pendente.</p>
                                  ) : (
                                    <div className="space-y-1.5 max-h-[105px] overflow-y-auto pr-1">
                                      {linkedActions.map(ac => (
                                        <div key={ac.id} className="p-2 border border-slate-200 rounded bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between text-[10px] gap-2">
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1 text-[9px] font-bold">
                                              <span className="text-indigo-600 uppercase font-mono">{ac.tipoAcao}</span>
                                              <span className="text-slate-300">|</span>
                                              <span className="text-slate-500 truncate" title={ac.descricaoAcao}>{ac.descricaoAcao}</span>
                                            </div>
                                            <p className="text-slate-400 text-[8.5px] mt-0.5 truncate">Prazo: {ac.dataPrazo}</p>
                                          </div>
                                          <div>
                                            <select
                                              value={ac.status}
                                              onChange={(e) => onUpdateAcaoStatus(ac.id, e.target.value as any)}
                                              className={`p-1 text-[9px] rounded font-bold border ${
                                                ac.status === "Concluido" 
                                                  ? "bg-teal-50 border-teal-150 text-teal-700" 
                                                  : ac.status === "Em Execução" 
                                                  ? "bg-indigo-50 border-indigo-150 text-indigo-700" 
                                                  : "bg-slate-100 border-slate-250 text-slate-600"
                                              }`}
                                            >
                                              <option value="Planejado">Planejado</option>
                                              <option value="Em Execução">Em Execução</option>
                                              <option value="Concluido">Concluido</option>
                                              <option value="Cancelado">Cancelado</option>
                                            </select>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* ISO 9001 Evidences list with Direct Validation checkbox */}
                                <div className="space-y-2 pt-1">
                                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                    <span>Conformidade ISO 9001:2015</span>
                                    <span className="text-teal-600 font-extrabold uppercase">SGQ</span>
                                  </div>
                                  
                                  {linkedEvidences.length === 0 ? (
                                    <div className="p-2.5 bg-slate-50 border border-slate-100 text-[10px] rounded text-slate-500 text-center">
                                      <span>Sem evidências vinculadas ao código UBG.</span>
                                    </div>
                                  ) : (
                                    <div className="space-y-1.5 max-h-[105px] overflow-y-auto pr-1">
                                      {linkedEvidences.map(ev => (
                                        <div key={ev.id} className="p-2 border border-slate-200 rounded bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between text-[10px] gap-2">
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1 font-bold text-[9px]">
                                              <span className="text-teal-700 font-mono">{ev.codigoDocumentoUBG}</span>
                                              <span className="text-slate-350">|</span>
                                              <span className="text-slate-600 truncate" title={ev.descricaoDocumento}>{ev.descricaoDocumento}</span>
                                            </div>
                                            <p className="text-slate-400 text-[8.5px] mt-0.5">Cláusula SGQ: {ev.requisitoISO}</p>
                                          </div>
                                          <div>
                                            <select
                                              value={ev.status}
                                              onChange={(e) => onUpdateEvidenciaStatus(ev.id, e.target.value as any)}
                                              className={`p-1 text-[9px] rounded font-bold border ${
                                                ev.status === "Validada" 
                                                  ? "bg-teal-50 border-teal-150 text-teal-700" 
                                                  : ev.status === "Em Análise" 
                                                  ? "bg-amber-50 border-amber-150 text-amber-700" 
                                                  : "bg-slate-100 border-slate-250 text-slate-655"
                                              }`}
                                            >
                                              <option value="Pendente">Pendente</option>
                                              <option value="Em Análise">Em Análise</option>
                                              <option value="Validada">Validada</option>
                                            </select>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                              </div>

                            </div>

                            {/* Additional critical outputs */}
                            <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                              <div><strong>Ação de Instrução:</strong> <span className="text-slate-600 normal-case font-medium block mt-0.5">{f.necessidadeIT}</span></div>
                              <div><strong>Plano de Treinamento:</strong> <span className="text-slate-600 normal-case font-medium block mt-0.5">{f.necessidadeTreinamento}</span></div>
                              <div><strong>Ficha Sucessora:</strong> <span className="text-slate-600 normal-case font-medium block mt-0.5">{f.necessidadeSucessao}</span></div>
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

      {/* FOOTER INFO CORRESPONDENCE */}
      <div className="text-[11px] text-slate-500 bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm font-semibold">
        <Sparkles className="w-5 h-5 shrink-0 text-indigo-500 animate-pulse-slow" />
        <span>
          <strong className="text-slate-700">Painel Integrado RJT:</strong> Clique em qualquer linha para abrir a <strong className="text-indigo-650">Ficha Unificada de Competência & Sucessão</strong>. Nela, você pode visualizar a maturidade da função, alertas ativos e gerenciar status de planos PDCA e evidências ISO diretamente.
        </span>
      </div>

    </div>
  );
}

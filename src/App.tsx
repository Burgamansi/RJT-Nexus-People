import { useState, useEffect } from "react";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import CadastroFuncoes from "./pages/CadastroFuncoes";
import RankingVulnerabilidade from "./pages/RankingVulnerabilidade";
import PlanoAcao from "./pages/PlanoAcao";
import EvidenciasISO from "./pages/EvidenciasISO";

import { 
  FuncaoCritica, 
  ActionPlan, 
  ISOEvidence, 
  INITIAL_FUNCOES, 
  INITIAL_ACTIONS, 
  INITIAL_EVIDENCES,
  calculateGUT,
  calculateVulnerability,
  getFinalClassification,
  Collaborator,
  Skill,
  CompetencyAssessment
} from "./types";
import { UBG_FUNCTIONS } from "./data/ubgFunctions";
import { UBG_COLLABORATORS, UBG_SKILLS, UBG_FUNCTION_SKILLS_MAP } from "./data/ubgCompetencyData";

export default function App() {
  // Navigation states
  const [activeTab, setActiveTab] = useState("dashboard");

  // New competency and polivalency state tables
  const [collaborators, setCollaborators] = useState<Collaborator[]>(() => {
    const saved = localStorage.getItem("ubg_collaborators");
    return saved ? JSON.parse(saved) : UBG_COLLABORATORS;
  });

  const [skills, setSkills] = useState<Skill[]>(() => {
    const saved = localStorage.getItem("ubg_skills");
    return saved ? JSON.parse(saved) : UBG_SKILLS;
  });

  const [assessments, setAssessments] = useState<CompetencyAssessment[]>(() => {
    const saved = localStorage.getItem("ubg_assessments");
    return saved ? JSON.parse(saved) : [];
  });

  // State entities loaded with fallback seed data and dynamic matrix hydration
  const [funcoes, setFuncoes] = useState<FuncaoCritica[]>(() => {
    const saved = localStorage.getItem("ubg_funcoes_criticas");
    let baseFuncs = UBG_FUNCTIONS;
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length === 18 && parsed.some((p: any) => p.idFuncao.startsWith("UBG-"))) {
        baseFuncs = parsed;
      }
    }
    
    // Hydrate relations
    return baseFuncs.map(f => {
      // Find main operators by name match or primaryFunctionId match
      const mainOps = UBG_COLLABORATORS
        .filter(c => c.primaryFunctionId === f.idFuncao || f.colaboradorPrincipal.toLowerCase().includes(c.name.toLowerCase()))
        .map(c => c.id);
      
      // Find backup operators based on simple matching or existing mappings
      const backupOps: string[] = [];
      if (f.backup1 && f.backup1 !== "Sem Backup Cadastrado" && !f.backup1.toLowerCase().includes("nenhum")) {
        const match = UBG_COLLABORATORS.find(c => f.backup1.toLowerCase().includes(c.name.toLowerCase()));
        if (match) backupOps.push(match.id);
        else {
          const placeholder = UBG_COLLABORATORS.find(c => c.primaryFunctionId === "UBG-006" || c.name.toLowerCase().includes("silva"));
          if (placeholder && !mainOps.includes(placeholder.id)) backupOps.push(placeholder.id);
        }
      }
      if (f.backup2 && f.backup2 !== "Sem Backup Cadastrado" && !f.backup2.toLowerCase().includes("nenhum") && !f.backup2.toLowerCase().includes("sem backup")) {
        const match = UBG_COLLABORATORS.find(c => f.backup2.toLowerCase().includes(c.name.toLowerCase()));
        if (match) backupOps.push(match.id);
      }

      if (f.existeBackup === "SIM" && backupOps.length === 0) {
        const fallback = UBG_COLLABORATORS.find(c => !mainOps.includes(c.id));
        if (fallback) backupOps.push(fallback.id);
      }

      const reqSkills = UBG_FUNCTION_SKILLS_MAP[f.idFuncao] || [];

      return {
        ...f,
        mainOperatorIds: f.mainOperatorIds || mainOps,
        backupOperatorIds: f.backupOperatorIds || backupOps,
        requiredSkills: f.requiredSkills || reqSkills,
        requiredBackupQuantity: f.requiredBackupQuantity || (f.existeBackup === "SIM" ? 2 : 0)
      };
    });
  });

  const [acoes, setAcoes] = useState<ActionPlan[]>(() => {
    const saved = localStorage.getItem("ubg_action_plans");
    return saved ? JSON.parse(saved) : INITIAL_ACTIONS;
  });

  const [evidencias, setEvidencias] = useState<ISOEvidence[]>(() => {
    const saved = localStorage.getItem("ubg_iso_evidences");
    return saved ? JSON.parse(saved) : INITIAL_EVIDENCES;
  });

  // Dual editing node state
  const [editFuncNode, setEditFuncNode] = useState<FuncaoCritica | null>(null);

  // Custom Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "danger" } | null>(null);

  // Auto-dismiss Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const triggerToast = (message: string, type: "success" | "info" | "danger" = "success") => {
    setToast({ message, type });
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("ubg_funcoes_criticas", JSON.stringify(funcoes));
  }, [funcoes]);

  useEffect(() => {
    localStorage.setItem("ubg_action_plans", JSON.stringify(acoes));
  }, [acoes]);

  useEffect(() => {
    localStorage.setItem("ubg_iso_evidences", JSON.stringify(evidencias));
  }, [evidencias]);

  useEffect(() => {
    localStorage.setItem("ubg_collaborators", JSON.stringify(collaborators));
  }, [collaborators]);

  useEffect(() => {
    localStorage.setItem("ubg_skills", JSON.stringify(skills));
  }, [skills]);

  useEffect(() => {
    localStorage.setItem("ubg_assessments", JSON.stringify(assessments));
  }, [assessments]);

  // CRITICAL FUNCTIONS CALLBACKS
  const handleAddFuncao = (funcao: FuncaoCritica) => {
    const duplicate = funcoes.some(f => f.idFuncao === funcao.idFuncao);
    if (duplicate) {
      triggerToast(`O ID Função "${funcao.idFuncao}" já existe. Geramos um ID alternativo automaticamente.`, "info");
      funcao.idFuncao = `${funcao.idFuncao}_NEW`;
    }

    setFuncoes(prev => [funcao, ...prev]);
    triggerToast(`Função crítica [${funcao.idFuncao}] mapeada com sucesso!`);
  };

  const handleUpdateFuncao = (updated: FuncaoCritica) => {
    setFuncoes(prev => prev.map(f => f.id === updated.id ? updated : f));
    triggerToast(`Ficha da função [${updated.idFuncao}] foi atualizada com sucesso!`, "info");
    
    setAcoes(prev => prev.map(ac => {
      if (ac.funcaoCriticaId === updated.id) {
        return {
          ...ac,
          funcaoCriticaCodigo: updated.idFuncao,
          funcaoCriticaNome: updated.funcaoCritica
        };
      }
      return ac;
    }));
  };

  const handleDeleteFuncao = (id: number) => {
    const target = funcoes.find(f => f.id === id);
    setFuncoes(prev => prev.filter(f => f.id !== id));
    triggerToast(`Função [${target?.idFuncao || ""}] removida dos registros.`, "danger");

    if (editFuncNode?.id === id) {
      setEditFuncNode(null);
    }
  };

  const handleSelectEdit = (funcao: FuncaoCritica) => {
    setEditFuncNode(funcao);
    setActiveTab("cadastro");
    triggerToast(`Função [${funcao.idFuncao}] carregada para modificação.`, "info");
  };

  // ACTION PLAN CALLBACKS
  const handleAddAcao = (newAction: ActionPlan) => {
    setAcoes(prev => [newAction, ...prev]);
    triggerToast(`Plano de ação PDCA registrado para ${newAction.funcaoCriticaCodigo}`);
  };

  const handleUpdateAcaoStatus = (id: number, newStatus: "Planejado" | "Em Execução" | "Concluido" | "Cancelado") => {
    setAcoes(prev => prev.map(ac => ac.id === id ? { ...ac, status: newStatus } : ac));
    
    if (newStatus === "Concluido") {
      triggerToast("Ação PDCA concluída com sucesso! Parabéns!");
    } else {
      triggerToast(`Status alterado para "${newStatus}"`, "info");
    }
  };

  // EVIDENCING CLAUSES CALLBACKS
  const handleAddEvidencia = (newEv: ISOEvidence) => {
    setEvidencias(prev => [newEv, ...prev]);
    triggerToast(`Evidência de auditoria codificada: ${newEv.codigoDocumentoUBG}`);
  };

  const handleUpdateEvidenciaStatus = (id: number, status: "Pendente" | "Em Análise" | "Validada") => {
    setEvidencias(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    if (status === "Validada") {
      triggerToast("Evidência validada pelo auditor de conformidade!", "success");
    } else {
      triggerToast(`Status alterado para "${status}"`, "info");
    }
  };

  const totalFuncoesCount = funcoes.length;
  const criticalCount = funcoes.filter(f => f.classificacaoFinal === "Crítico" || f.classificacaoFinal === "Alto").length;

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans antialiased text-[#04044A]">
      <DashboardLayout
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== "cadastro") {
            setEditFuncNode(null);
          }
        }}
        onExitWorkspace={() => {}}
        userEmail="kaikoko9@gmail.com"
        criticalCount={criticalCount}
      >
        
        {activeTab === "dashboard" && (
          <Dashboard 
            funcoes={funcoes} 
            acoes={acoes} 
            collaborators={collaborators}
            evidencias={evidencias}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              if (tab !== "cadastro") setEditFuncNode(null);
            }} 
          />
        )}

        {activeTab === "cadastro" && (
          <CadastroFuncoes
            funcoes={funcoes}
            onAddFuncao={handleAddFuncao}
            onUpdateFuncao={handleUpdateFuncao}
            editFuncNode={editFuncNode}
            clearEditNode={() => setEditFuncNode(null)}
            collaborators={collaborators}
            skills={skills}
          />
        )}

        {activeTab === "ranking" && (
          <RankingVulnerabilidade
            funcoes={funcoes}
            acoes={acoes}
            evidencias={evidencias}
            onDeleteFuncao={handleDeleteFuncao}
            onSelectEdit={handleSelectEdit}
            onUpdateAcaoStatus={handleUpdateAcaoStatus}
            onUpdateEvidenciaStatus={handleUpdateEvidenciaStatus}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              if (tab !== "cadastro") setEditFuncNode(null);
            }}
            collaborators={collaborators}
            skills={skills}
            assessments={assessments}
            onUpdateCollaboratorSkills={(colabId, updatedSkills) => {
              const updated = collaborators.map(c => c.id === colabId ? { ...c, skills: updatedSkills } : c);
              setCollaborators(updated);
              triggerToast("Proficiência atualizada no prontuário do colaborador!", "success");
            }}
            onAddAssessment={(newAs) => {
              setAssessments(prev => [newAs, ...prev]);
              triggerToast(`Avaliação de competência registrada!`, "success");
            }}
          />
        )}

        {activeTab === "plano" && (
          <PlanoAcao
            acoes={acoes}
            funcoes={funcoes}
            onAddAcao={handleAddAcao}
            onUpdateAcaoStatus={handleUpdateAcaoStatus}
          />
        )}

        {activeTab === "iso" && (
          <EvidenciasISO
            evidencias={evidencias}
            onAddEvidencia={handleAddEvidencia}
            onUpdateEvidenciaStatus={handleUpdateEvidenciaStatus}
          />
        )}

      </DashboardLayout>

      {/* RICH LIGHTWEIGHT SYSTEM TOASTS OVERLAY */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-md text-xs font-semibold text-white shadow-lg max-w-sm animate-slide-up border select-none bg-[#04044A] border-slate-700">
          <div className="flex gap-2">
            <span className={`w-2 h-2 rounded-full block shrink-0 mt-1 ${
              toast.type === "success" 
                ? "bg-[#00E7F8]" 
                : toast.type === "danger" 
                ? "bg-rose-500" 
                : "bg-[#00A4FF]"
            }`}></span>
            <div>
              <p className="font-mono text-[9px] text-[#00E7F8] uppercase tracking-wider leading-none">RJT NEXUS Intelligence</p>
              <p className="text-slate-300 mt-1 leading-snug">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

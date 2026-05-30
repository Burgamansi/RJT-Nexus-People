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
  getFinalClassification
} from "./types";
import { UBG_FUNCTIONS } from "./data/ubgFunctions";

export default function App() {
  // Navigation states - Default inWorkspace to true
  const [activeTab, setActiveTab] = useState("dashboard");

  // State entities loaded with fallback seed data
  const [funcoes, setFuncoes] = useState<FuncaoCritica[]>(() => {
    const saved = localStorage.getItem("ubg_funcoes_criticas");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length === 18 && parsed.some((p: any) => p.idFuncao.startsWith("UBG-"))) {
        return parsed;
      }
    }
    return UBG_FUNCTIONS;
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

  // CRITICAL FUNCTIONS CALLBACKS
  const handleAddFuncao = (funcao: FuncaoCritica) => {
    // Check if ID already exists
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
    
    // Auto sync code/name inside PDCA actions that refer to this function
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

    // Clear editing node if it was deleted
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
    
    // If action is concluded, trigger message
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

  // Navigation and stats definitions
  const totalFuncoesCount = funcoes.length;
  const criticalCount = funcoes.filter(f => f.classificacaoFinal === "Crítico").length;

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans antialiased text-[#04044A]">
      <DashboardLayout
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // Cancel editing mode when leaving cadastro tab
          if (tab !== "cadastro") {
            setEditFuncNode(null);
          }
        }}
        onExitWorkspace={() => {}}
        userEmail="kaikoko9@gmail.com"
        criticalCount={criticalCount}
      >
        
        {/* Active view component projection */}
        {activeTab === "dashboard" && (
          <Dashboard 
            funcoes={funcoes} 
            acoes={acoes} 
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
              <p className="text-slate-350 mt-1 leading-snug">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

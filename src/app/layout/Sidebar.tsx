import React from "react";
import {
  LayoutDashboard, Brain, UploadCloud,
  Map, Zap, Grid, Shield, BookOpen, FolderCheck,
  BarChart2, ClipboardList, GraduationCap, Users
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

const NAV_SECTIONS = [
  {
    label: "Visão Geral",
    items: [
      { id: "dashboard",    label: "Dashboard",           icon: LayoutDashboard },
      { id: "intelligence", label: "People Intelligence", icon: Brain },
      { id: "import-center",label: "Import Center",       icon: UploadCloud },
    ],
  },
  {
    label: "Estrutura Operacional",
    pdca: "Ação 01–02",
    items: [
      { id: "workforce-map",       label: "Workforce Map",       icon: Map },
      { id: "critical-functions",  label: "Funções Críticas",    icon: Zap },
    ],
  },
  {
    label: "Competência & Cobertura",
    pdca: "Ação 03–05",
    items: [
      { id: "polyvalence-matrix",  label: "Matriz Polivalência", icon: Grid },
      { id: "backup-succession",   label: "Backup Operacional",  icon: Shield },
      { id: "training-ojt",        label: "Treinamento & OJT",   icon: GraduationCap },
    ],
  },
  {
    label: "Risco & Conformidade",
    pdca: "Ação 06",
    items: [
      { id: "knowledge-hub",         label: "Base de Conhecimento", icon: BookOpen },
      { id: "evidence-center",       label: "Central de Evidências", icon: FolderCheck },
      { id: "vulnerability-analytics",label: "Vulnerabilidade",     icon: BarChart2 },
      { id: "action-plans",          label: "Planos de Ação",       icon: ClipboardList },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onNavigate }) => {
  return (
    <aside
      className="w-[220px] flex flex-col justify-between shrink-0 h-screen select-none"
      style={{
        background: "#09090F",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* ── Brand ── */}
      <div>
        <div
          className="px-5 py-5 flex items-center gap-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #2563EB, #06B6D4)",
              boxShadow: "0 0 16px rgba(37,99,235,0.4)",
            }}
          >
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-extrabold tracking-tight text-white leading-none">
              Nexus People
            </p>
            <p
              className="text-[9px] font-mono font-semibold uppercase tracking-widest mt-1"
              style={{ color: "#06B6D4" }}
            >
              RJT · ISO 9001
            </p>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav className="px-3 py-4 space-y-5 overflow-y-auto" style={{ maxHeight: "calc(100vh - 160px)" }}>
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="flex items-center justify-between px-2 mb-1.5">
                <p
                  className="text-[9px] font-mono font-bold uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {section.label}
                </p>
                {section.pdca && (
                  <span
                    className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{
                      background: "rgba(37,99,235,0.15)",
                      color: "#60A5FA",
                      border: "1px solid rgba(37,99,235,0.25)",
                    }}
                  >
                    {section.pdca}
                  </span>
                )}
              </div>
              <div className="space-y-0.5">
                {section.items.map(({ id, label, icon: Icon }) => {
                  const active = currentTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => onNavigate(id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11.5px] font-semibold transition-all duration-150 text-left"
                      style={{
                        background: active ? "rgba(37,99,235,0.15)" : "transparent",
                        color: active ? "#93C5FD" : "rgba(255,255,255,0.45)",
                        border: active
                          ? "1px solid rgba(37,99,235,0.3)"
                          : "1px solid transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            "rgba(255,255,255,0.04)";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "rgba(255,255,255,0.8)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "rgba(255,255,255,0.45)";
                        }
                      }}
                    >
                      <Icon
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: active ? "#60A5FA" : "rgba(255,255,255,0.35)" }}
                      />
                      <span className="truncate">{label}</span>
                      {active && (
                        <span
                          className="ml-auto w-1 h-1 rounded-full shrink-0"
                          style={{ background: "#60A5FA" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* ── Footer ── */}
      <div
        className="px-4 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
            style={{
              background: "rgba(37,99,235,0.2)",
              border: "1px solid rgba(37,99,235,0.3)",
              color: "#93C5FD",
            }}
          >
            <Users className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-white leading-none">União Bag</p>
            <p className="text-[9px] font-mono mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              Tenant Ativo
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 text-[9px] font-mono"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: "#10B981", boxShadow: "0 0 6px #10B981" }}
          />
          Sistema Ativo · v2.0.0
        </div>
      </div>
    </aside>
  );
};

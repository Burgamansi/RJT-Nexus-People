import React from "react";
import {
  LayoutDashboard, Brain, UploadCloud,
  Map, Zap, Grid, Shield, BookOpen, FolderCheck,
  BarChart2, ClipboardList, GraduationCap, Users
} from "lucide-react";
import { RJT_COLORS } from "../../styles/rjtColors";

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

const NAV_SECTIONS = [
  {
    label: "Visao Geral",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "intelligence", label: "Modulos", icon: Brain },
      { id: "import-center", label: "Importacao", icon: UploadCloud },
    ],
  },
  {
    label: "Estrutura Operacional",
    pdca: "Acao 01-02",
    items: [
      { id: "workforce-map", label: "Mapa da Forca", icon: Map },
      { id: "critical-functions", label: "Funcoes Criticas", icon: Zap },
    ],
  },
  {
    label: "Competencia & Cobertura",
    pdca: "Acao 03-05",
    items: [
      { id: "polyvalence-matrix", label: "Matriz Polivalencia", icon: Grid },
      { id: "backup-succession", label: "Backup Operacional", icon: Shield },
      { id: "training-ojt", label: "Treinamento & OJT", icon: GraduationCap },
    ],
  },
  {
    label: "Risco & Conformidade",
    pdca: "Acao 06",
    items: [
      { id: "knowledge-hub", label: "Base de Conhecimento", icon: BookOpen },
      { id: "evidence-center", label: "Central de Evidencias", icon: FolderCheck },
      { id: "vulnerability-analytics", label: "Vulnerabilidade", icon: BarChart2 },
      { id: "action-plans", label: "Planos de Acao", icon: ClipboardList },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onNavigate }) => {
  return (
    <aside className="w-[248px] flex flex-col justify-between shrink-0 h-screen select-none bg-white border-r border-slate-200 shadow-[8px_0_28px_rgba(15,23,42,0.04)]">
      <div>
        <div className="px-5 py-5 flex items-center gap-3 border-b border-slate-200">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: RJT_COLORS.primary.darkNavy, boxShadow: '0_8px_18px_rgba(0,31,63,0.18)' }}>
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold tracking-tight text-slate-950 leading-none truncate">
              Nexus People
            </p>
            <p className="text-[9px] font-mono font-semibold uppercase tracking-widest mt-1 text-slate-500">
              RJT Inteligencia Executiva
            </p>
          </div>
        </div>

        <nav className="px-3 py-4 space-y-5 overflow-y-auto" style={{ maxHeight: "calc(100vh - 170px)" }}>
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="flex items-center justify-between gap-2 px-2 mb-1.5">
                <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 truncate">
                  {section.label}
                </p>
                {section.pdca && (
                  <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0" style={{ borderColor: RJT_COLORS.primary.cyan, backgroundColor: RJT_COLORS.primary.lightBlue, color: RJT_COLORS.primary.darkNavy, border: `1px solid ${RJT_COLORS.primary.cyan}` }}>
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
                      style={{
                        backgroundColor: active ? RJT_COLORS.primary.lightBlue : 'transparent',
                        color: active ? RJT_COLORS.primary.darkNavy : RJT_COLORS.neutral.mediumGray,
                        borderColor: active ? RJT_COLORS.primary.cyan : 'transparent',
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[12px] font-semibold transition-all duration-150 text-left border hover:bg-slate-50`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: active ? RJT_COLORS.primary.darkNavy : RJT_COLORS.neutral.mediumGray }} />
                      <span className="truncate">{label}</span>
                      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: RJT_COLORS.primary.darkNavy }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="px-4 py-4 border-t border-slate-200">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ backgroundColor: RJT_COLORS.primary.lightBlue, border: `1px solid ${RJT_COLORS.primary.cyan}`, color: RJT_COLORS.primary.darkNavy }}>
            <Users className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-950 leading-none truncate">Uniao Bag</p>
            <p className="text-[9px] font-mono mt-0.5 text-slate-500">Empresa ativa</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-green-600" />
          Sistema ativo - v2.0.0
        </div>
      </div>
    </aside>
  );
};

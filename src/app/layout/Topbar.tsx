import React from "react";
import { Bell, ShieldCheck, Building2 } from "lucide-react";
import { peopleFeatureRegistry } from "../registry/peopleFeatureRegistry";
import { RJT_COLORS } from "../../styles/rjtColors";

const PAGE_LABELS: Record<string, { title: string; iso: string }> = {
  "dashboard": { title: "Dashboard Executivo", iso: "ISO 9001 - Visao Geral" },
  "intelligence": { title: "Modulos de Inteligencia", iso: "Analise Integrada" },
  "import-center": { title: "Centro de Importacao", iso: "Importacao de Dados" },
  "workforce-map": { title: "Mapa da Forca de Trabalho", iso: "ISO 6.1 - Estrutura Operacional" },
  "critical-functions": { title: "Funcoes Criticas", iso: "ISO 6.1 - 7.2 - PDCA Acao 02" },
  "polyvalence-matrix": { title: "Matriz de Polivalencia", iso: "ISO 7.2 - PDCA Acao 03" },
  "backup-succession": { title: "Backup Operacional", iso: "ISO 7.2 - 7.3 - PDCA Acao 05" },
  "training-ojt": { title: "Treinamento & OJT", iso: "ISO 7.2 - 7.3" },
  "knowledge-hub": { title: "Base de Conhecimento", iso: "ISO 7.1.6 - 8.5.1 - PDCA Acao 01" },
  "evidence-center": { title: "Central de Evidencias", iso: "ISO 9.1 - Rastreabilidade" },
  "vulnerability-analytics": { title: "Analise de Vulnerabilidade", iso: "ISO 9.1 - 9.3 - PDCA Acao 06" },
  "action-plans": { title: "Planos de Acao", iso: "ISO 9.3 - Ciclo PDCA" },
};

interface TopbarProps {
  currentTab: string;
}

export const Topbar: React.FC<TopbarProps> = ({ currentTab }) => {
  const page = PAGE_LABELS[currentTab] ?? {
    title: peopleFeatureRegistry.find(f => f.id === currentTab)?.title ?? "Modulo",
    iso: "RJT Nexus People",
  };

  return (
    <header className="h-16 px-5 md:px-8 flex items-center justify-between shrink-0 z-10 bg-white/95 border-b border-slate-200 backdrop-blur-xl">
      <div className="flex items-center gap-3 min-w-0">
        <span className="h-8 w-1 rounded-full shrink-0" style={{ backgroundColor: RJT_COLORS.primary.darkNavy }} />
        <div className="min-w-0">
          <p className="text-[15px] font-extrabold text-slate-950 leading-tight tracking-tight truncate">
            {page.title}
          </p>
          <p className="text-[10px] font-mono mt-0.5 text-slate-500 truncate">
            {page.iso}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono font-semibold" style={{ backgroundColor: RJT_COLORS.primary.lightBlue, border: `1px solid ${RJT_COLORS.primary.cyan}`, color: RJT_COLORS.primary.darkNavy }}>
          <Building2 className="w-3 h-3 shrink-0" style={{ color: RJT_COLORS.primary.darkNavy }} />
          Uniao Bag
        </div>

        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
          <ShieldCheck className="w-3 h-3 shrink-0" />
          ISO 9001:2015
        </div>

        <button className="relative w-9 h-9 rounded-md flex items-center justify-center transition-all bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: RJT_COLORS.primary.darkNavy }} />
        </button>
      </div>
    </header>
  );
};

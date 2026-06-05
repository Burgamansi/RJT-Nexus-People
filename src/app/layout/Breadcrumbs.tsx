import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { peopleFeatureRegistry } from "../registry/peopleFeatureRegistry";

const ROOT_LABELS: Record<string, string> = {
  dashboard: "Dashboard Executivo",
  intelligence: "Modulos de Inteligencia",
  "import-center": "Centro de Importacao",
};

interface BreadcrumbsProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentTab, onNavigate }) => {
  const feature = peopleFeatureRegistry.find((item) => item.id === currentTab);
  const currentLabel = feature?.title ?? ROOT_LABELS[currentTab] ?? "Modulo";
  const showModuleRoot = Boolean(feature);

  return (
    <nav className="mb-5 flex min-w-0 items-center gap-1.5 text-[12px] font-semibold text-slate-500">
      <button
        type="button"
        onClick={() => onNavigate("dashboard")}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-slate-600 transition-colors hover:bg-white hover:text-blue-700"
      >
        <Home className="h-3.5 w-3.5" />
        Inicio
      </button>

      {showModuleRoot && (
        <>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <button
            type="button"
            onClick={() => onNavigate("intelligence")}
            className="rounded-md px-2 py-1 transition-colors hover:bg-white hover:text-blue-700"
          >
            Modulos
          </button>
        </>
      )}

      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      <span className="min-w-0 truncate rounded-md bg-white px-2 py-1 text-slate-900 border border-slate-200">
        {currentLabel}
      </span>
    </nav>
  );
};

import React from "react";
import { ChevronRight, Award, Shield, Layers } from "lucide-react";

interface ModuleCardProps {
  title: string;
  description: string;
  category: "Estrutura da Forca de Trabalho" | "Competencia e Cobertura" | "Risco e Conformidade";
  businessPurpose: string;
  status: string;
  onClick?: () => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  category,
  businessPurpose,
  status,
  onClick
}) => {
  const iconClass = "w-5 h-5 text-blue-700";
  const getCategoryIcon = () => {
    switch (category) {
      case "Estrutura da Forca de Trabalho":
        return <Layers className={iconClass} />;
      case "Competencia e Cobertura":
        return <Award className={iconClass} />;
      case "Risco e Conformidade":
        return <Shield className={iconClass} />;
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-lg border border-slate-200 bg-white p-6 text-left shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_38px_rgba(15,23,42,0.10)] focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer flex flex-col justify-between h-full min-h-[260px]"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-700" />

      <div>
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 shrink-0">
              {getCategoryIcon()}
            </div>
            <span className="text-[10px] font-mono tracking-wide text-slate-500 uppercase">
              {category}
            </span>
          </div>
          <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[9px] font-mono font-semibold tracking-wide text-blue-700 border border-slate-200 uppercase shrink-0">
            {status}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-950 leading-snug transition-colors group-hover:text-blue-700">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="bg-slate-50 rounded-md p-3 mb-4 border border-slate-200">
          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wide">Objetivo operacional</p>
          <p className="text-[12px] text-slate-700 mt-1 leading-snug">
            {businessPurpose}
          </p>
        </div>

        <div className="flex items-center justify-end text-xs font-semibold text-blue-700 gap-1">
          Abrir modulo
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
};

import React from "react";
import { Award, Shield, Layers } from "lucide-react";
import { peopleFeatureRegistry } from "../app/registry/peopleFeatureRegistry";
import { ModuleCard } from "../components/ui/ModuleCard";

interface PeopleIntelligencePageProps {
  onNavigate: (tab: string) => void;
}

export const PeopleIntelligencePage: React.FC<PeopleIntelligencePageProps> = ({ onNavigate }) => {
  const categories = ["Estrutura da Forca de Trabalho", "Competencia e Cobertura", "Risco e Conformidade"] as const;

  const getCategoryHeaderIcon = (category: string) => {
    switch (category) {
      case "Estrutura da Forca de Trabalho":
        return <Layers className="w-5 h-5 text-[#00E7F8]" />;
      case "Competencia e Cobertura":
        return <Award className="w-5 h-5 text-[#00A4FF]" />;
      case "Risco e Conformidade":
        return <Shield className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-12">
      {/* Intro Header */}
      <div className="space-y-2 max-w-2xl">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Modulos de Inteligencia Operacional
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Navegue pelos modulos gerados a partir do dataset RH/PDCA. Cada widget abre uma frente operacional com isolamento por tenant.
        </p>
      </div>

      {/* Grouped Grids */}
      {categories.map(cat => {
        const catFeatures = peopleFeatureRegistry.filter(f => f.category === cat);
        return (
          <div key={cat} className="space-y-6 pt-6 border-t border-slate-800/60 first:border-t-0 first:pt-0">
            {/* Category title */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800 shrink-0">
                {getCategoryHeaderIcon(cat)}
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide uppercase font-mono">
                  {cat}
                </h2>
                <p className="text-[10px] text-slate-500 font-mono">
                  Widgets operacionais conectados ao dataset importado
                </p>
              </div>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catFeatures.map(feat => (
                <ModuleCard
                  key={feat.id}
                  title={feat.title}
                  description={feat.description}
                  category={feat.category}
                  businessPurpose={feat.businessPurpose}
                  status={feat.status}
                  onClick={() => onNavigate(feat.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

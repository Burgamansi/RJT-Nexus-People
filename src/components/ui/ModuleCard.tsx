import React from "react";
import { ChevronRight, Award, Shield, Layers } from "lucide-react";

interface ModuleCardProps {
  title: string;
  description: string;
  category: "Workforce Structure" | "Competence & Coverage" | "Risk & Compliance";
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
  const getCategoryIcon = () => {
    switch (category) {
      case "Workforce Structure":
        return <Layers className="w-5 h-5 text-[#00E7F8]" />;
      case "Competence & Coverage":
        return <Award className="w-5 h-5 text-[#00A4FF]" />;
      case "Risk & Compliance":
        return <Shield className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getCategoryGradient = () => {
    switch (category) {
      case "Workforce Structure":
        return "from-[#00E7F8]/20 to-[#00A4FF]/5";
      case "Competence & Coverage":
        return "from-[#00A4FF]/20 to-indigo-900/5";
      case "Risk & Compliance":
        return "from-emerald-500/20 to-[#04044A]/5";
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#04044A]/40 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#00E7F8]/50 hover:bg-[#04044A]/70 cursor-pointer flex flex-col justify-between h-full`}
    >
      {/* Decorative Top Glow */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${
        category === "Workforce Structure"
          ? "from-[#00E7F8] to-[#00A4FF]"
          : category === "Competence & Coverage"
          ? "from-[#00A4FF] to-indigo-500"
          : "from-emerald-400 to-teal-500"
      }`} />

      <div>
        {/* Category Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getCategoryIcon()}
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
              {category}
            </span>
          </div>
          <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[9px] font-mono font-semibold tracking-wider text-[#00E7F8] border border-[#00E7F8]/30 uppercase">
            {status}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white transition-colors group-hover:text-[#00E7F8]">
          {title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          {description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/80">
        {/* Business Purpose */}
        <div className="bg-slate-900/50 rounded-lg p-2.5 mb-4 border border-slate-800/30">
          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Business Purpose</p>
          <p className="text-[11px] text-slate-300 mt-1 italic leading-snug">
            "{businessPurpose}"
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-end text-xs font-semibold text-[#00E7F8] group-hover:underline gap-1">
          Explore Module
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
};

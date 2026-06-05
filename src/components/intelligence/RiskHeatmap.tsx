import React from "react";
import { Layers } from "lucide-react";

interface RiskHeatmapProps {
  factorRows: Array<{
    factorName: string;
    impactScore: number;
    vulnerableFunctionsCount: number;
    description: string;
  }>;
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ factorRows }) => {
  const getImpactColor = (score: number) => {
    if (score >= 20) return "bg-rose-600/30 text-rose-450 border border-rose-500/20";
    if (score >= 12) return "bg-rose-500/10 text-rose-400 border border-rose-500/10";
    if (score >= 7) return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    return "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20";
  };

  return (
    <div className="bg-[#04044A]/40 rounded-2xl border border-slate-800 p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00E7F8]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            7-Pillar Vulnerability Heatmap Grid
          </h3>
        </div>
        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800">
          Operational Risk Distribution
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {factorRows.map((factor, idx) => (
          <div key={idx} className={`p-4 rounded-xl flex flex-col justify-between space-y-3 ${getImpactColor(factor.impactScore)}`}>
            <div>
              <p className="font-mono font-bold text-xs uppercase tracking-wider text-white">{factor.factorName}</p>
              <p className="text-[9px] text-slate-400 mt-1 leading-snug">{factor.description}</p>
            </div>
            <div className="flex items-end justify-between pt-1 border-t border-slate-850">
              <span className="text-[9px] font-semibold text-slate-400">{factor.vulnerableFunctionsCount} functions</span>
              <span className="font-mono font-extrabold text-sm text-white">{factor.impactScore} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

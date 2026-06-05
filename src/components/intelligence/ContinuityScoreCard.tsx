import React from "react";
import { Shield } from "lucide-react";

interface ContinuityScoreCardProps {
  totalCritical: number;
  fullyCovered: number;
  partiallyCovered: number;
  uncovered: number;
  backupCoverageIndex: string;
}

export const ContinuityScoreCard: React.FC<ContinuityScoreCardProps> = ({
  totalCritical,
  fullyCovered,
  partiallyCovered,
  uncovered,
  backupCoverageIndex
}) => {
  const percentCovered = totalCritical > 0 ? Math.round((fullyCovered / totalCritical) * 100) : 0;
  return (
    <div className="bg-[#04044A]/40 rounded-2xl border border-slate-800 p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#00E7F8]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Painel de Continuidade
          </h3>
        </div>
        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-[#00E7F8] border border-slate-800">
          Pilar de mitigacao GUT
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Indice de continuidade</p>
          <p className="text-3xl font-extrabold text-white mt-1">{percentCovered}%</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Cobertura de backup</p>
          <p className="text-sm font-bold text-white mt-1">{backupCoverageIndex}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px]">
        <div className="bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
          <p className="text-emerald-450 font-bold text-lg leading-none">{fullyCovered}</p>
          <p className="text-slate-450 mt-1">Cobertura total</p>
        </div>
        <div className="bg-amber-500/10 p-2 rounded border border-amber-500/20">
          <p className="text-amber-450 font-bold text-lg leading-none">{partiallyCovered}</p>
          <p className="text-slate-450 mt-1">Cobertura parcial</p>
        </div>
        <div className="bg-rose-500/10 p-2 rounded border border-rose-500/20">
          <p className="text-rose-450 font-bold text-lg leading-none">{uncovered}</p>
          <p className="text-slate-450 mt-1">Sem cobertura</p>
        </div>
      </div>
    </div>
  );
};

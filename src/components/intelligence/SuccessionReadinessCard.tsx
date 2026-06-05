import React from "react";
import { Award } from "lucide-react";

interface SuccessionReadinessCardProps {
  functionsWithSuccessorCount: number;
  totalCritical: number;
  pipelineCoverageRate?: number;
  readyCandidatesCount?: number;
  functionsWithoutSuccessorCount: number;
}

export const SuccessionReadinessCard: React.FC<SuccessionReadinessCardProps> = ({
  functionsWithSuccessorCount,
  totalCritical,
  pipelineCoverageRate = 0,
  readyCandidatesCount = 0,
  functionsWithoutSuccessorCount
}) => {
  const readinessRate = totalCritical > 0 ? Math.round((functionsWithSuccessorCount / totalCritical) * 100) : 0;
  return (
    <div className="bg-[#04044A]/40 rounded-2xl border border-slate-800 p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Succession Pipeline Depth
          </h3>
        </div>
        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-slate-800">
          Talent Continuity
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Succession Depth Index</p>
          <p className="text-3xl font-extrabold text-white mt-1">{readinessRate}%</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Pipeline Coverage</p>
          <p className="text-sm font-bold text-white mt-1">{functionsWithSuccessorCount} / {totalCritical} roles</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 text-center text-[10px]">
        <div className="bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
          <p className="text-emerald-450 font-bold text-base leading-none">{readyCandidatesCount || 1}</p>
          <p className="text-slate-400 mt-1">Ready Successors</p>
        </div>
        <div className="bg-rose-500/10 p-2 rounded border border-rose-500/20">
          <p className="text-rose-450 font-bold text-base leading-none">{functionsWithoutSuccessorCount}</p>
          <p className="text-slate-400 mt-1">Pipeline Gaps</p>
        </div>
      </div>
    </div>
  );
};

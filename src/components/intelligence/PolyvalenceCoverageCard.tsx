import React from "react";
import { Award } from "lucide-react";

interface PolyvalenceCoverageCardProps {
  averageCoverageIndex: number;
  polyvalentEmployeesCount: number;
  spofFunctionsCount: number;
  totalEmployees: number;
  trainingGapsCount: number;
}

export const PolyvalenceCoverageCard: React.FC<PolyvalenceCoverageCardProps> = ({
  averageCoverageIndex,
  polyvalentEmployeesCount,
  spofFunctionsCount,
  totalEmployees,
  trainingGapsCount
}) => {
  return (
    <div className="bg-[#04044A]/40 rounded-2xl border border-slate-800 p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#00A4FF]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Polyvalence & Skill Coverage
          </h3>
        </div>
        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-[#00A4FF] border border-slate-800">
          Cross-Qualification
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Average Polyvalence Index</p>
          <p className="text-3xl font-extrabold text-white mt-1">{averageCoverageIndex}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Cross-Trained Workforce</p>
          <p className="text-sm font-bold text-white mt-1">{polyvalentEmployeesCount} / {totalEmployees} employees</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 text-center text-[10px]">
        <div className="bg-rose-500/10 p-2 rounded border border-rose-500/20">
          <p className="text-rose-450 font-bold text-base leading-none">{spofFunctionsCount}</p>
          <p className="text-slate-400 mt-1">Single Point Gaps (SPOF)</p>
        </div>
        <div className="bg-amber-500/10 p-2 rounded border border-amber-500/20">
          <p className="text-amber-450 font-bold text-base leading-none">{trainingGapsCount}</p>
          <p className="text-slate-400 mt-1">Theoretical Gaps</p>
        </div>
      </div>
    </div>
  );
};

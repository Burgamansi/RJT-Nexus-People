import React from "react";
import { BookOpen } from "lucide-react";

interface KnowledgeHealthCardProps {
  healthScore: number;
  totalAssets: number;
  outdatedCount: number;
  missingEvidenceCount: number;
  criticalMissingCount: number;
}

export const KnowledgeHealthCard: React.FC<KnowledgeHealthCardProps> = ({
  healthScore,
  totalAssets,
  outdatedCount,
  missingEvidenceCount,
  criticalMissingCount
}) => {
  return (
    <div className="bg-[#04044A]/40 rounded-2xl border border-slate-800 p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Saude do Conhecimento
          </h3>
        </div>
        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-purple-400 border border-slate-800">
          Conformidade ISO 9001:2015
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Saude da base</p>
          <p className="text-3xl font-extrabold text-white mt-1">{healthScore}%</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Documentos totais</p>
          <p className="text-sm font-bold text-white mt-1">{totalAssets} ativos</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px]">
        <div className="bg-slate-900/50 p-2 rounded border border-slate-800/40">
          <p className="text-amber-400 font-bold text-base leading-none">{outdatedCount}</p>
          <p className="text-slate-400 mt-1">Desatualizados</p>
        </div>
        <div className="bg-slate-900/50 p-2 rounded border border-slate-800/40">
          <p className="text-purple-400 font-bold text-base leading-none">{missingEvidenceCount}</p>
          <p className="text-slate-400 mt-1">Gaps de auditoria</p>
        </div>
        <div className="bg-slate-900/50 p-2 rounded border border-slate-800/40">
          <p className="text-rose-400 font-bold text-base leading-none">{criticalMissingCount}</p>
          <p className="text-slate-400 mt-1">Criticos ausentes</p>
        </div>
      </div>
    </div>
  );
};

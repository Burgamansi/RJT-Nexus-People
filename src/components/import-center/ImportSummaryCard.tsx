import React from "react";
import { ImportResult } from "../../features/import-center/types";
import {
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Hourglass
} from "lucide-react";

interface ImportSummaryCardProps {
  result: ImportResult<any>;
}

export const ImportSummaryCard: React.FC<ImportSummaryCardProps> = ({ result }) => {
  const metrics = [
    {
      label: "Total Rows Processed",
      value: result.processedCount,
      desc: "Total CSV records detected",
      icon: <FileSpreadsheet className="w-4 h-4 text-[#00E7F8]" />,
      bgColor: "bg-[#00E7F8]/10 border-[#00E7F8]/20"
    },
    {
      label: "Success / Mapped Rows",
      value: result.successCount,
      desc: "Valid entities parsed to domain",
      icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
      bgColor: "bg-emerald-500/10 border-emerald-500/20"
    },
    {
      label: "Validation Errors",
      value: result.errors.length,
      desc: "Critical issues skipping rows",
      icon: <AlertOctagon className="w-4 h-4 text-rose-500" />,
      bgColor: "bg-rose-500/10 border-rose-500/20"
    },
    {
      label: "Validation Warnings",
      value: result.warnings.length,
      desc: "Non-blocking format recommendations",
      icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
      bgColor: "bg-amber-500/10 border-amber-500/20"
    },
    {
      label: "Processing Duration",
      value: `${result.elapsedMs} ms`,
      desc: "Pure analytical parsing speed",
      icon: <Hourglass className="w-4 h-4 text-purple-400" />,
      bgColor: "bg-purple-500/10 border-purple-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {metrics.map((m, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 shadow-md ${m.bgColor}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider leading-none">
              {m.label}
            </span>
            <div className="shrink-0">{m.icon}</div>
          </div>
          <div className="pt-2">
            <span className="text-xl font-extrabold text-white block leading-none font-mono">
              {m.value}
            </span>
            <span className="text-[9px] text-slate-500 block mt-1.5 leading-none">
              {m.desc}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

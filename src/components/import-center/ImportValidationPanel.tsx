import React, { useState } from "react";
import { ImportError, ImportWarning } from "../../features/import-center/types";
import { AlertOctagon, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface ImportValidationPanelProps {
  errors: ImportError[];
  warnings: ImportWarning[];
}

export const ImportValidationPanel: React.FC<ImportValidationPanelProps> = ({
  errors,
  warnings
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"errors" | "warnings">("errors");

  const totalErrors = errors.length;
  const totalWarnings = warnings.length;

  if (totalErrors === 0 && totalWarnings === 0) {
    return (
      <div className="bg-emerald-500/5 rounded-2xl border border-emerald-500/20 p-6 flex items-center gap-4">
        <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
            Conformidade assegurada
          </h4>
          <p className="text-[10px] text-slate-500 leading-normal">
            Nenhum erro ou alerta detectado. Todas as linhas passaram pelas regras multitenant e podem ser publicadas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#04044A]/40 rounded-2xl border border-slate-800 p-6 space-y-4">
      {/* Subtab selection headers */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveSubTab("errors")}
            className={`flex items-center gap-2 pb-3 text-xs font-bold font-mono uppercase tracking-wider relative -mb-3 transition-all ${
              activeSubTab === "errors"
                ? "text-rose-450 border-b-2 border-rose-500"
                : "text-slate-500 hover:text-slate-350"
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Erros criticos ({totalErrors})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("warnings")}
            className={`flex items-center gap-2 pb-3 text-xs font-bold font-mono uppercase tracking-wider relative -mb-3 transition-all ${
              activeSubTab === "warnings"
                ? "text-amber-400 border-b-2 border-amber-500"
                : "text-slate-500 hover:text-slate-350"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Alertas ({totalWarnings})
          </button>
        </div>

        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[9px] font-mono text-slate-500 border border-slate-800">
          Diagnostico da validacao
        </span>
      </div>

      {/* Main lists */}
      <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2.5 pt-2">
        {activeSubTab === "errors" ? (
          <>
            {errors.map((err, idx) => (
              <div
                key={idx}
                className="text-xs flex items-start gap-3 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10"
              >
                <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[9px] font-bold text-rose-450 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                      Linha {err.row}
                    </span>
                    {err.column && (
                      <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        Campo: {err.column}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 mt-1.5 leading-relaxed">{err.message}</p>
                  {err.value !== undefined && (
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      Valor recebido: <code className="bg-slate-950 px-1 py-0.5 rounded border border-slate-850">{err.value || "vazio"}</code>
                    </p>
                  )}
                </div>
              </div>
            ))}
            {totalErrors === 0 && (
              <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-[11px] text-slate-400">Nenhum bloqueio critico de schema detectado.</p>
              </div>
            )}
          </>
        ) : (
          <>
            {warnings.map((warn, idx) => (
              <div
                key={idx}
                className="text-xs flex items-start gap-3 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[9px] font-bold text-amber-450 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      Linha {warn.row}
                    </span>
                    {warn.column && (
                      <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        Campo: {warn.column}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 mt-1.5 leading-relaxed">{warn.message}</p>
                  {warn.value !== undefined && (
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      Valor: <code className="bg-slate-950 px-1 py-0.5 rounded border border-slate-850">{warn.value || "vazio"}</code>
                    </p>
                  )}
                </div>
              </div>
            ))}
            {totalWarnings === 0 && (
              <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-[11px] text-slate-400">Nenhuma recomendacao ou alerta de formato detectado.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

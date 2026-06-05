import React, { useState } from "react";
import { Table, Eye, Code, Layers } from "lucide-react";

interface ImportPreviewTableProps {
  entities: any[];
}

export const ImportPreviewTable: React.FC<ImportPreviewTableProps> = ({ entities }) => {
  const [viewMode, setViewMode] = useState<"table" | "json">("table");

  if (!entities || entities.length === 0) {
    return (
      <div className="bg-[#04044A]/20 rounded-2xl border border-slate-800 p-8 text-center text-slate-500 italic text-xs">
        No valid entities loaded for preview. Correct critical validation errors first.
      </div>
    );
  }

  // Extract all unique property keys from mapped entities to dynamically construct columns
  const allKeysSet = new Set<string>();
  entities.forEach((ent) => {
    Object.keys(ent).forEach((k) => {
      // Exclude nested/complex arrays from direct column display to keep table clean
      if (typeof ent[k] !== "object") {
        allKeysSet.add(k);
      }
    });
  });
  const columns = Array.from(allKeysSet);

  return (
    <div className="bg-[#04044A]/40 rounded-2xl border border-slate-800 p-6 space-y-4">
      {/* Table headers toggle */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-[#00A4FF]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Auditable Domain Mapping Preview
          </h3>
        </div>

        <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold font-mono uppercase tracking-wider transition-all ${
              viewMode === "table"
                ? "bg-[#00A4FF]/20 text-[#00E7F8] border border-[#00A4FF]/30"
                : "text-slate-500 hover:text-slate-400"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Table View
          </button>
          <button
            type="button"
            onClick={() => setViewMode("json")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold font-mono uppercase tracking-wider transition-all ${
              viewMode === "json"
                ? "bg-[#00A4FF]/20 text-[#00E7F8] border border-[#00A4FF]/30"
                : "text-slate-500 hover:text-slate-400"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Raw JSON
          </button>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                {columns.map((col) => (
                  <th key={col} className="py-2.5 font-semibold pr-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {entities.map((ent, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-900/20 text-slate-350">
                  {columns.map((col) => {
                    const value = ent[col];
                    const isId = col.toLowerCase().includes("id") || col.toLowerCase().includes("code");
                    const valueStr = value !== undefined && value !== null ? String(value) : "";
                    
                    return (
                      <td
                        key={col}
                        className={`py-3 pr-3 font-mono text-[11px] max-w-xs truncate ${
                          isId ? "text-[#00E7F8] font-bold" : ""
                        }`}
                      >
                        {valueStr === "true" ? (
                          <span className="text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20">true</span>
                        ) : valueStr === "false" ? (
                          <span className="text-slate-500 bg-slate-950 px-1 py-0.5 rounded border border-slate-850">false</span>
                        ) : (
                          valueStr || <span className="text-slate-650 italic">null</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <pre className="w-full h-[300px] overflow-y-auto rounded-xl bg-slate-950 p-4 text-[10px] font-mono text-emerald-400 border border-slate-850 leading-relaxed overflow-x-auto">
          {JSON.stringify(entities, null, 2)}
        </pre>
      )}
    </div>
  );
};

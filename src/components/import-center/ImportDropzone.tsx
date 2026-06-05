import React, { useState } from "react";
import { UploadCloud, FileSpreadsheet, Clipboard, RefreshCw } from "lucide-react";
import { ImportType } from "../../features/import-center/types";

interface ImportDropzoneProps {
  importType: ImportType;
  onDataLoaded: (rawData: string) => void;
  onWorkbookLoaded?: (fileName: string, buffer: ArrayBuffer) => void;
}

export const ImportDropzone: React.FC<ImportDropzoneProps> = ({
  importType,
  onDataLoaded,
  onWorkbookLoaded
}) => {
  const [pastedText, setPastedText] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Return mock CSV data according to the selected import type
  const getMockCSVSeed = (type: ImportType): string => {
    switch (type) {
      case "employee":
        return `id,name,email,organizationUnitId,status,skills,tenantId
EMP001,John Doe,john@ubg.com,unit_prod_corte,active,"[{\\"skillId\\":\\"UBG-001\\",\\"proficiencyLevel\\":\\"Independent\\",\\"certified\\":true}]",tenant_ubg
EMP002,Jane Smith,jane@ubg.com,unit_prod_costura,active,"[{\\"skillId\\":\\"UBG-002\\",\\"proficiencyLevel\\":\\"Multiplier\\",\\"certified\\":true}]",tenant_ubg
EMP003,Carlos Santos,carlos@ubg.com,unit_prod_apoio,inactive,"[]",tenant_ubg
EMP004,Alice Jones,alice@other.com,unit_other,active,"[]",tenant_other`;

      case "organization_unit":
        return `id,tenantId,name,type
unit_prod_corte,tenant_ubg,Produção - Corte,sector
unit_prod_costura,tenant_ubg,Produção - Costura,sector
unit_prod_apoio,tenant_ubg,Produção - Apoio,sector
unit_other,tenant_other,External Branch,department`;

      case "function":
        return `id,code,name,description,organizationUnitId,isCritical,requiredBackupQuantity,tenantId
UBG-001,FC001,Corte Mecânico,Operação de maquinário pesado para corte,unit_prod_corte,true,2,tenant_ubg
UBG-002,FC002,Costura Reta,Operação de máquinas industriais de costura,unit_prod_costura,true,3,tenant_ubg
UBG-003,FC003,Apoio Técnico,Suporte geral na linha operacional,unit_prod_apoio,false,0,tenant_ubg`;

      case "employee_assignment":
        return `id,employeeId,organizationUnitId,functionId,positionTitle,status,isPrimary,startDate,tenantId
ASG001,EMP001,unit_prod_corte,UBG-001,Operador Especialista,active,true,2025-01-01,tenant_ubg
ASG002,EMP002,unit_prod_costura,UBG-002,Operadora Master,active,true,2025-01-01,tenant_ubg`;

      case "training_program":
        return `id,name,skillId,tenantId
TP001,Treinamento de Integração NR-12,UBG-001,tenant_ubg
TP002,Curso Avançado de Costura Plena,UBG-002,tenant_ubg`;

      case "ojt_plan":
        return `id,employeeId,skillId,status,tenantId
OJT001,EMP001,UBG-001,completed,tenant_ubg
OJT002,EMP002,UBG-002,in_progress,tenant_ubg`;

      case "knowledge_asset":
        return `id,code,title,functionId,lastReviewedAt,tenantId
KA001,SOP-UBG-01,Standard Instruction Corte Mecânico,UBG-001,2026-01-15,tenant_ubg
KA002,SOP-UBG-02,Standard Instruction Costura Industrial,UBG-002,2026-02-20,tenant_ubg`;

      case "evidence_record":
        return `id,employeeId,functionId,status,evidenceUrl,uploadedAt,tenantId
EV001,EMP001,UBG-001,validated,https://ubg-storage.com/proofs/emp001.pdf,2026-05-10,tenant_ubg
EV002,EMP002,UBG-002,under_review,https://ubg-storage.com/proofs/emp002.pdf,2026-05-25,tenant_ubg`;

      case "action_plan":
        return `id,title,description,status,priority,sourceType,sourceRecordId,tenantId
AP001,Capacitação Reserva UBG-001,Qualificar operadores adicionais para a função,pending,high,critical_function,UBG-001,tenant_ubg
AP002,Atualizar SOP Corte Mecânico,Revisão do manual operacional vencido,in_progress,medium,knowledge_gap,KA001,tenant_ubg`;
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      readFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      readFile(e.target.files[0]);
    }
  };

  const readFile = (file: File) => {
    const isWorkbook = /\.(xlsx|xls)$/i.test(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (isWorkbook && onWorkbookLoaded) {
        onWorkbookLoaded(file.name, event.target?.result as ArrayBuffer);
      } else {
        onDataLoaded(event.target?.result as string);
      }
    };
    if (isWorkbook && onWorkbookLoaded) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleLoadMock = () => {
    const mock = getMockCSVSeed(importType);
    setPastedText(mock);
    onDataLoaded(mock);
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDataLoaded(pastedText);
  };

  return (
    <div className="space-y-6">
      {/* File Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${
          dragActive
            ? "border-[#00E7F8] bg-[#00E7F8]/5 text-white"
            : "border-slate-800 bg-[#04044A]/10 text-slate-400 hover:border-slate-700/60"
        }`}
      >
        <UploadCloud className="w-10 h-10 text-[#00E7F8] mb-3 animate-pulse" />
        <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
          Drag & Drop File Here
        </h4>
        <p className="text-[10px] text-slate-500 mt-1 leading-normal max-w-xs">
          Supports `.xlsx`, `.xls`, `.csv` or `.txt` files conforming to RH PDCA import structures.
        </p>
        <label className="mt-4 px-4 py-2 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs font-bold text-[#00E7F8] cursor-pointer transition-all">
          <FileSpreadsheet className="w-3.5 h-3.5 inline-block mr-1.5 shrink-0" />
          Choose File
          <input
            type="file"
            accept=".xlsx,.xls,.csv,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Or Pasting Simulator */}
      <div className="bg-[#04044A]/20 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clipboard className="w-4 h-4 text-[#00A4FF]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Simulated Raw Data Paste / Sandbox
            </h3>
          </div>
          <button
            type="button"
            onClick={handleLoadMock}
            className="flex items-center gap-1.5 text-[10px] font-bold text-[#00E7F8] bg-[#00E7F8]/10 hover:bg-[#00E7F8]/20 px-2.5 py-1 rounded border border-[#00E7F8]/20 font-mono"
          >
            <RefreshCw className="w-3 h-3" />
            Load Mock Seed Data
          </button>
        </div>

        <form onSubmit={handlePasteSubmit} className="space-y-4">
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste raw comma-separated values (CSV) with headers..."
            className="w-full h-44 rounded-xl bg-slate-900/60 border border-slate-800 p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#00A4FF] transition-all resize-none leading-relaxed"
          />
          <button
            type="submit"
            disabled={!pastedText.trim()}
            className="w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md bg-gradient-to-r from-[#00E7F8] to-[#00A4FF] text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
          >
            Analyze & Validate Loaded Data
          </button>
        </form>
      </div>
    </div>
  );
};

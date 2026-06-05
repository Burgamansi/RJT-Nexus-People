import React, { useState } from "react";
import { UploadCloud, FileSpreadsheet } from "lucide-react";
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
  void importType;
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
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

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-lg p-5 md:p-6 flex flex-col items-center justify-center text-center transition-all ${
        dragActive
          ? "border-[#00E7F8] bg-[#00E7F8]/5 text-white"
          : "border-slate-800 bg-[#04044A]/10 text-slate-400 hover:border-slate-700/60"
      }`}
    >
      <UploadCloud className="w-8 h-8 text-[#00E7F8] mb-3" />
      <h4 className="text-sm font-bold text-white">
        Envie a planilha oficial de RH
      </h4>
      <p className="text-[11px] text-slate-500 mt-1 leading-normal max-w-xl">
        Arquivos aceitos: `.xlsx`, `.xls`, `.csv` ou `.txt`. A importacao usa dados reais do arquivo e publica o dataset somente quando nao houver erro critico.
      </p>
      <label className="mt-4 px-4 py-2 rounded-md bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs font-bold text-[#00E7F8] cursor-pointer transition-all">
        <FileSpreadsheet className="w-3.5 h-3.5 inline-block mr-1.5 shrink-0" />
        Selecionar arquivo
        <input
          type="file"
          accept=".xlsx,.xls,.csv,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );
};

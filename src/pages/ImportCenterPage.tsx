import React, { useState } from "react";
import { ImportType, ImportResult } from "../features/import-center/types";
import { DefaultXLSXAdapter, parseCSV, processImportPipeline } from "../features/import-center/index";
import { Shield, BrainCircuit, CheckCircle2, AlertTriangle, Database } from "lucide-react";
import { buildPeopleIntelligenceFromRHRows, RHSpreadsheetImportResult } from "../features/import-center/rhSpreadsheetEngine";
import { saveImportedPeopleDataset } from "../app/data/peopleDatasetStore";
import { usePeopleDataset } from "../app/data/usePeopleDataset";

// Component imports
import { ImportTypeSelector } from "../components/import-center/ImportTypeSelector";
import { ImportDropzone } from "../components/import-center/ImportDropzone";
import { ColumnMappingGrid } from "../components/import-center/ColumnMappingGrid";
import { ImportSummaryCard } from "../components/import-center/ImportSummaryCard";
import { ImportValidationPanel } from "../components/import-center/ImportValidationPanel";
import { ImportPreviewTable } from "../components/import-center/ImportPreviewTable";

export const ImportCenterPage: React.FC = () => {
  const [selectedTenant, setSelectedTenant] = useState<string>("tenant_ubg");
  const [importType, setImportType] = useState<ImportType>("employee");
  const [rawData, setRawData] = useState<string>("");
  const [pipelineResult, setPipelineResult] = useState<ImportResult<any> | null>(null);
  const [rhResult, setRhResult] = useState<RHSpreadsheetImportResult | null>(null);
  const { tenants } = usePeopleDataset();

  const handleDataLoaded = (text: string) => {
    setRawData(text);
    const delimiter = text.includes(";") ? ";" : ",";
    const rawRows = parseCSV(text, delimiter as "," | ";");
    const intelligenceResult = buildPeopleIntelligenceFromRHRows(rawRows, {
      tenantId: selectedTenant,
      tenantName: tenants.find(t => t.id === selectedTenant)?.name,
      sourceName: "CSV RH PDCA import"
    });
    setRhResult(intelligenceResult);
    if (intelligenceResult.errors.filter(error => error.isCritical).length === 0) {
      saveImportedPeopleDataset(intelligenceResult.dataset);
    }
    
    const result = processImportPipeline<any>(text, {
      importType,
      tenantId: selectedTenant
    });
    
    setPipelineResult(result);
  };

  const handleWorkbookLoaded = (fileName: string, buffer: ArrayBuffer) => {
    const adapter = new DefaultXLSXAdapter();
    const rawRows = adapter.parseWorkbook(buffer);
    const intelligenceResult = buildPeopleIntelligenceFromRHRows(rawRows, {
      tenantId: selectedTenant,
      tenantName: tenants.find(t => t.id === selectedTenant)?.name,
      sourceName: fileName,
      parseMetadata: adapter.getLastParseMetadata()
    });
    setRawData("");
    setPipelineResult(null);
    setRhResult(intelligenceResult);
    if (intelligenceResult.errors.filter(error => error.isCritical).length === 0) {
      saveImportedPeopleDataset(intelligenceResult.dataset);
    }
  };

  const handleTypeChange = (type: ImportType) => {
    setImportType(type);
    // Reset simulation states on type switch
    setRawData("");
    setPipelineResult(null);
    setRhResult(null);
  };

  const handleTenantChange = (tenant: string) => {
    setSelectedTenant(tenant);
    // Reset simulation states on tenant switch
    setRawData("");
    setPipelineResult(null);
    setRhResult(null);
  };

  // Extract CSV headers dynamically for the ColumnMappingGrid
  const getCSVHeaders = (text: string): string[] => {
    if (!text || text.trim() === "") return [];
    const firstLine = text.split("\n")[0];
    if (!firstLine) return [];
    return firstLine.split(",").map(h => h.trim());
  };

  const headers = getCSVHeaders(rawData);

  return (
    <div className="space-y-10">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase border border-emerald-500/20 select-none">
            Intelligent RH Import Engine
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight pt-2">
            Import Center
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Transforme a planilha RH PDCA em Workforce Map, ranking de funções críticas, matriz de backup, sucessão, plano de treinamento, evidências, PDCA e dashboard executivo.
          </p>
        </div>

        {/* Tenant Selector */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-2xl border border-slate-800 shrink-0">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <select
            value={selectedTenant}
            onChange={(e) => handleTenantChange(e.target.value)}
            className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-4"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id} className="bg-[#020224] text-white text-xs font-semibold">
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          ["Score G×U×T", "priorização numérica das ações e rankings"],
          ["Criticidade G.U.T", "classificação principal de risco"],
          ["ISO + SGQ", "rastreabilidade normativa e evidência objetiva"]
        ].map(([title, desc]) => (
          <div key={title} className="bg-white/[0.03] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 text-emerald-400">
              <BrainCircuit className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase font-mono tracking-wider">{title}</h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">{desc}</p>
          </div>
        ))}
      </div>

      {/* Grid Step 2: Upload dropzone or Paste simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-l-[3px] border-emerald-500 pl-2.5">
            Step 1: Upload RH Spreadsheet
          </h3>
          <ImportDropzone importType={importType} onDataLoaded={handleDataLoaded} onWorkbookLoaded={handleWorkbookLoaded} />
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-l-[3px] border-emerald-500 pl-2.5">
            SaaS Schema Fallback
          </h3>
          <ImportTypeSelector selectedType={importType} onChange={handleTypeChange} />
          <ColumnMappingGrid importType={importType} headers={headers} />
        </div>
      </div>

      {rhResult && (
        <div className="space-y-8 animate-fade-in pt-4 border-t border-slate-850">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-l-[3px] border-emerald-500 pl-2.5">
                Intelligent RH Transformation Output
              </h3>
              <p className="text-[11px] text-slate-500 mt-2">
                Fonte: {rhResult.sourceName} · {rhResult.successCount}/{rhResult.processedCount} linhas válidas · tenant {rhResult.tenantId}
                {rhResult.parseMetadata && (
                  <>
                    {" "}· aba {rhResult.parseMetadata.sheetName} · cabeçalho linha {rhResult.parseMetadata.headerRowNumber} · {rhResult.parseMetadata.totalDataRows} linhas lidas
                  </>
                )}
              </p>
            </div>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase border ${
              rhResult.errors.some(error => error.isCritical)
                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            }`}>
              {rhResult.errors.some(error => error.isCritical) ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {rhResult.errors.some(error => error.isCritical) ? "Validation blocked" : "Dataset published"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {rhResult.workProducts.map(product => (
              <div key={product.id} className="bg-white/[0.03] border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between gap-3">
                  <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[10px] font-mono text-slate-500">{product.rowsAffected} registros</span>
                </div>
                <h4 className="text-xs font-bold text-white mt-3">{product.title}</h4>
                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">{product.evidenceRequired}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ImportValidationPanel errors={rhResult.errors} warnings={rhResult.warnings} />
            <div className="lg:col-span-2">
              <ImportPreviewTable entities={rhResult.rows.slice(0, 20)} />
            </div>
          </div>
        </div>
      )}

      {/* Grid Step 3: Outcomes summary and Previews (Only displays if pipeline ran) */}
      {pipelineResult && !rhResult && (
        <div className="space-y-8 animate-fade-in pt-4 border-t border-slate-850">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-l-[3px] border-emerald-500 pl-2.5">
            Step 4: Audit & Pipeline Validation Outcomes
          </h3>

          {/* KPI Summary statistics */}
          <ImportSummaryCard result={pipelineResult} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Validation errors/warnings */}
            <div className="lg:col-span-1">
              <ImportValidationPanel
                errors={pipelineResult.errors}
                warnings={pipelineResult.warnings}
              />
            </div>

            {/* Mapped domain entities table/JSON preview */}
            <div className="lg:col-span-2">
              <ImportPreviewTable entities={pipelineResult.entities} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

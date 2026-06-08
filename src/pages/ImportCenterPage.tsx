import React, { useState, useMemo } from "react";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Database,
  GraduationCap,
  Layers,
  Repeat2,
  Shield,
  Zap,
  Download,
  AlertCircle,
  Info,
} from "lucide-react";
import { RJT_COLORS } from "../styles/rjtColors";
import { validateAndImportData, generateImportReport, ImportValidationResult } from "../services/robustImportService";
import { convertImportedDataToDataset, saveDatasetToLocalStorage } from "../services/importDataConverter";
import { ImportDropzone } from "../components/import-center/ImportDropzone";
import * as XLSX from 'xlsx';

interface ImportCenterPageProps {
  onNavigate?: (tab: string) => void;
}

export const ImportCenterPage: React.FC<ImportCenterPageProps> = ({ onNavigate }) => {
  const [selectedTenant, setSelectedTenant] = useState<string>("tenant_ubg");
  const [importResult, setImportResult] = useState<ImportValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  const tenants = [
    { id: "tenant_ubg", name: "UNIÃO BAG - Empresa Oficial" },
    { id: "tenant_demo", name: "Demo Tenant (Testes)" },
  ];

  const handleWorkbookLoaded = async (name: string, buffer: ArrayBuffer) => {
    setIsProcessing(true);
    setFileName(name);
    
    try {
      const workbook = XLSX.read(buffer, { type: "array" });
      const result = validateAndImportData(workbook);
      setImportResult(result);

      // Se validação bem-sucedida, converter e salvar dados
      if (result.success && result.data.length > 0) {
        const dataset = convertImportedDataToDataset(
          result,
          selectedTenant,
          tenants.find(t => t.id === selectedTenant)?.name || "UNIÃO BAG"
        );
        saveDatasetToLocalStorage(dataset);
        console.log("✅ Dados importados e salvos com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      setImportResult({
        success: false,
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        errors: [`Erro ao processar arquivo: ${String(error)}`],
        warnings: [],
        data: [],
        stats: {
          totalFunctions: 0,
          sectors: 0,
          processes: 0,
          criticalFunctions: 0,
          totalBackupsRecommended: 0,
          functionsByStatus: {},
          functionsByCriticality: {},
        },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!importResult) return;

    const report = generateImportReport(importResult);
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(report));
    element.setAttribute("download", `relatorio_importacao_${new Date().toISOString().split('T')[0]}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExportData = () => {
    if (!importResult || !importResult.data.length) return;

    const ws = XLSX.utils.json_to_sheet(importResult.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CATALOGO_IMPORTADO");
    XLSX.writeFile(wb, `catalogo_importado_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const summary = useMemo(() => {
    if (!importResult) return null;

    return {
      totalFunctions: importResult.stats.totalFunctions,
      sectors: importResult.stats.sectors,
      processes: importResult.stats.processes,
      criticalFunctions: importResult.stats.criticalFunctions,
      totalBackups: importResult.stats.totalBackupsRecommended,
      criticality: importResult.stats.functionsByCriticality,
      status: importResult.stats.functionsByStatus,
    };
  }, [importResult]);

  const hasCriticalErrors = importResult?.errors.length ?? 0 > 0;
  const isValid = importResult?.success ?? false;

  return (
    <div className="space-y-7 p-6" style={{ backgroundColor: RJT_COLORS.neutral.lightGray }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 pb-5" style={{ borderColor: RJT_COLORS.primary.cyan }}>
        <div className="space-y-1">
          <span 
            className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-full uppercase border select-none inline-block"
            style={{ backgroundColor: RJT_COLORS.primary.lightBlue, color: RJT_COLORS.primary.darkNavy, borderColor: RJT_COLORS.primary.cyan }}
          >
            ✓ Motor de Importação Robusto
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight pt-2" style={{ color: RJT_COLORS.primary.darkNavy }}>
            Centro de Importação
          </h1>
          <p className="text-sm max-w-3xl" style={{ color: RJT_COLORS.neutral.mediumGray }}>
            Importe o CATALOGO_MESTRE oficial da UNIÃO BAG para validar 71 funções, 17 setores, 34 processos e 25 funções críticas.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg border shrink-0" style={{ backgroundColor: RJT_COLORS.primary.lightBlue, borderColor: RJT_COLORS.primary.cyan }}>
          <Shield className="w-4 h-4 shrink-0" style={{ color: RJT_COLORS.primary.darkNavy }} />
          <select
            value={selectedTenant}
            onChange={(e) => {
              setSelectedTenant(e.target.value);
              setImportResult(null);
            }}
            className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer pr-4"
            style={{ color: RJT_COLORS.primary.darkNavy }}
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id} style={{ color: RJT_COLORS.primary.darkNavy }}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload Area */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5">
        <ImportDropzone 
          importType="employee" 
          onDataLoaded={() => {}} 
          onWorkbookLoaded={handleWorkbookLoaded}
          isProcessing={isProcessing}
        />

        {/* Info Panel */}
        <div className="rounded-lg border-2 p-4" style={{ backgroundColor: RJT_COLORS.neutral.white, borderColor: RJT_COLORS.primary.cyan }}>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 shrink-0" style={{ color: RJT_COLORS.primary.darkNavy }} />
            <h2 className="text-xs font-bold uppercase font-mono" style={{ color: RJT_COLORS.primary.darkNavy }}>Status da Importação</h2>
          </div>
          <div className="mt-3 space-y-2 text-[11px]">
            <p style={{ color: RJT_COLORS.neutral.mediumGray }}>
              Tenant: <strong style={{ color: RJT_COLORS.primary.darkNavy }}>
                {tenants.find(t => t.id === selectedTenant)?.name}
              </strong>
            </p>
            <p style={{ color: RJT_COLORS.neutral.mediumGray }}>
              Arquivo: <strong style={{ color: RJT_COLORS.primary.darkNavy }}>
                {fileName || "Aguardando..."}
              </strong>
            </p>
            <p style={{ color: RJT_COLORS.neutral.mediumGray }}>
              Status: <strong style={{ 
                color: isValid ? RJT_COLORS.status.success : (importResult ? RJT_COLORS.status.error : RJT_COLORS.neutral.mediumGray)
              }}>
                {!importResult ? "Aguardando arquivo" : (isValid ? "✓ Validado" : "✗ Erro")}
              </strong>
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: "Funções", value: summary.totalFunctions, icon: <Briefcase className="w-4 h-4" /> },
            { label: "Setores", value: summary.sectors, icon: <Layers className="w-4 h-4" /> },
            { label: "Processos", value: summary.processes, icon: <Zap className="w-4 h-4" /> },
            { label: "Críticas", value: summary.criticalFunctions, icon: <AlertTriangle className="w-4 h-4" /> },
            { label: "Backups", value: summary.totalBackups, icon: <Repeat2 className="w-4 h-4" /> },
            { label: "Status", value: isValid ? "✓ OK" : "✗ Erro", icon: <CheckCircle2 className="w-4 h-4" /> },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border-2 p-4 text-left"
              style={{ 
                backgroundColor: RJT_COLORS.neutral.white,
                borderColor: RJT_COLORS.primary.cyan,
              }}
            >
              <div className="flex items-center justify-between gap-2" style={{ color: RJT_COLORS.primary.darkNavy }}>
                {item.icon}
                <span className="text-[10px] font-mono uppercase" style={{ color: RJT_COLORS.neutral.mediumGray }}>
                  {item.label}
                </span>
              </div>
              <p className="mt-3 text-2xl font-extrabold leading-tight" style={{ color: RJT_COLORS.primary.darkNavy }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Validation Results */}
      {importResult && (
        <div className="space-y-6 pt-2">
          {/* Status Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg border-2 p-4" 
            style={{ 
              backgroundColor: isValid ? RJT_COLORS.status.success + "10" : RJT_COLORS.status.error + "10",
              borderColor: isValid ? RJT_COLORS.status.success : RJT_COLORS.status.error,
            }}>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono" style={{ color: RJT_COLORS.primary.darkNavy }}>
                Resultado da Validação
              </h3>
              <p className="text-[11px] mt-2" style={{ color: RJT_COLORS.neutral.mediumGray }}>
                {importResult.validRows} de {importResult.totalRows} linhas processadas com sucesso
              </p>
            </div>
            <span 
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase border"
              style={{ 
                backgroundColor: isValid ? RJT_COLORS.status.success + "20" : RJT_COLORS.status.error + "20",
                borderColor: isValid ? RJT_COLORS.status.success : RJT_COLORS.status.error,
                color: isValid ? RJT_COLORS.status.success : RJT_COLORS.status.error,
              }}
            >
              {isValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {isValid ? "Validado com Sucesso" : "Erros Detectados"}
            </span>
          </div>

          {/* Criticality Distribution */}
          {summary?.criticality && (
            <div className="rounded-lg border-2 p-4" style={{ backgroundColor: RJT_COLORS.neutral.white, borderColor: RJT_COLORS.primary.cyan }}>
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono" style={{ color: RJT_COLORS.primary.darkNavy }}>
                Distribuição por Criticidade
              </h3>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(summary.criticality).map(([crit, count]) => (
                  <div key={crit} className="text-center">
                    <p className="text-2xl font-extrabold" style={{ color: RJT_COLORS.primary.darkNavy }}>
                      {count}
                    </p>
                    <p className="text-[10px] font-mono uppercase mt-1" style={{ color: RJT_COLORS.neutral.mediumGray }}>
                      {crit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {importResult.errors.length > 0 && (
            <div className="rounded-lg border-2 p-4" style={{ backgroundColor: RJT_COLORS.status.error + "10", borderColor: RJT_COLORS.status.error }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4" style={{ color: RJT_COLORS.status.error }} />
                <h3 className="text-xs font-bold uppercase" style={{ color: RJT_COLORS.status.error }}>
                  Erros Críticos ({importResult.errors.length})
                </h3>
              </div>
              <ul className="space-y-1 text-[11px]">
                {importResult.errors.map((error, idx) => (
                  <li key={idx} style={{ color: RJT_COLORS.status.error }}>
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {importResult.warnings.length > 0 && (
            <div className="rounded-lg border-2 p-4" style={{ backgroundColor: RJT_COLORS.status.warning + "10", borderColor: RJT_COLORS.status.warning }}>
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4" style={{ color: RJT_COLORS.status.warning }} />
                <h3 className="text-xs font-bold uppercase" style={{ color: RJT_COLORS.status.warning }}>
                  Avisos ({importResult.warnings.length})
                </h3>
              </div>
              <ul className="space-y-1 text-[11px]">
                {importResult.warnings.slice(0, 5).map((warning, idx) => (
                  <li key={idx} style={{ color: RJT_COLORS.status.warning }}>
                    • {warning}
                  </li>
                ))}
                {importResult.warnings.length > 5 && (
                  <li style={{ color: RJT_COLORS.status.warning }}>
                    ... e mais {importResult.warnings.length - 5} avisos
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          {isValid && (
            <div className="flex gap-3">
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                style={{ 
                  backgroundColor: RJT_COLORS.primary.darkNavy,
                  color: RJT_COLORS.neutral.white,
                }}
              >
                <Download className="w-4 h-4" />
                Baixar Relatório
              </button>
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                style={{ 
                  backgroundColor: RJT_COLORS.primary.cyan,
                  color: RJT_COLORS.neutral.white,
                }}
              >
                <Download className="w-4 h-4" />
                Exportar Dados
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

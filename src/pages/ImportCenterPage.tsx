import React, { useMemo, useState } from "react";
import { ImportType } from "../features/import-center/types";
import { DefaultXLSXAdapter, parseCSV } from "../features/import-center/index";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Database,
  GraduationCap,
  Layers,
  Repeat2,
  Shield,
  Zap
} from "lucide-react";
import { buildPeopleIntelligenceFromRHRows, RHSpreadsheetImportResult } from "../features/import-center/rhSpreadsheetEngine";
import { saveImportedPeopleDataset } from "../app/data/peopleDatasetStore";
import { usePeopleDataset } from "../app/data/usePeopleDataset";
import { Priority } from "../shared/domain/people/enums";

import { ImportDropzone } from "../components/import-center/ImportDropzone";
import { ImportValidationPanel } from "../components/import-center/ImportValidationPanel";
import { ImportPreviewTable } from "../components/import-center/ImportPreviewTable";

interface ImportCenterPageProps {
  onNavigate?: (tab: string) => void;
}

const WORK_PRODUCT_ROUTES: Record<string, string> = {
  workforce_map: "workforce-map",
  critical_functions_ranking: "critical-functions",
  backup_matrix: "backup-succession",
  succession_plan: "backup-succession",
  training_ojt_plan: "training-ojt",
  evidence_center: "evidence-center",
  pdca_action_plan: "action-plans",
  executive_dashboard: "dashboard",
};

const WORK_PRODUCT_TITLES: Record<string, string> = {
  workforce_map: "Mapa da Forca de Trabalho",
  critical_functions_ranking: "Ranking de Funcoes Criticas",
  backup_matrix: "Matriz de Backup",
  succession_plan: "Plano de Sucessao",
  training_ojt_plan: "Plano de Treinamento e OJT",
  evidence_center: "Central de Evidencias",
  pdca_action_plan: "Plano de Acao PDCA",
  executive_dashboard: "Dashboard Executivo",
};

const getProcessName = (description: string) => {
  const [processName] = description.split(". Impacto SGQ:");
  return processName?.trim() || "Processo nao informado";
};

export const ImportCenterPage: React.FC<ImportCenterPageProps> = ({ onNavigate }) => {
  const [selectedTenant, setSelectedTenant] = useState<string>("tenant_ubg");
  const [importType] = useState<ImportType>("employee");
  const [rhResult, setRhResult] = useState<RHSpreadsheetImportResult | null>(null);
  const { tenants } = usePeopleDataset();

  const publishResult = (intelligenceResult: RHSpreadsheetImportResult) => {
    setRhResult(intelligenceResult);
    if (intelligenceResult.errors.filter(error => error.isCritical).length === 0) {
      saveImportedPeopleDataset(intelligenceResult.dataset);
    }
  };

  const handleDataLoaded = (text: string) => {
    const delimiter = text.includes(";") ? ";" : ",";
    const rawRows = parseCSV(text, delimiter as "," | ";");
    publishResult(buildPeopleIntelligenceFromRHRows(rawRows, {
      tenantId: selectedTenant,
      tenantName: tenants.find(t => t.id === selectedTenant)?.name,
      sourceName: "Importacao CSV RH/PDCA"
    }));
  };

  const handleWorkbookLoaded = (fileName: string, buffer: ArrayBuffer) => {
    const adapter = new DefaultXLSXAdapter();
    const rawRows = adapter.parseWorkbook(buffer);
    publishResult(buildPeopleIntelligenceFromRHRows(rawRows, {
      tenantId: selectedTenant,
      tenantName: tenants.find(t => t.id === selectedTenant)?.name,
      sourceName: fileName,
      parseMetadata: adapter.getLastParseMetadata()
    }));
  };

  const summary = useMemo(() => {
    if (!rhResult) return null;

    const functions = rhResult.dataset.functions;
    const assessments = rhResult.dataset.assessments;
    const processes = new Set(functions.map(func => getProcessName(func.description)));
    const criticality = {
      criticas: assessments.filter(item => item.classification === Priority.CRITICAL).length,
      altas: assessments.filter(item => item.classification === Priority.HIGH).length,
      medias: assessments.filter(item => item.classification === Priority.MEDIUM).length,
      baixas: assessments.filter(item => item.classification === Priority.LOW).length,
    };

    return {
      functions: functions.length,
      sectors: rhResult.dataset.units.length,
      processes: processes.size,
      criticality,
      backups: functions.reduce((sum, item) => sum + item.requiredBackupQuantity, 0),
      trainings: rhResult.dataset.programs.length + rhResult.dataset.ojts.length,
    };
  }, [rhResult]);

  const hasCriticalErrors = rhResult?.errors.some(error => error.isCritical) ?? false;

  return (
    <div className="space-y-7">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase border border-emerald-500/20 select-none">
            Motor RH/PDCA Inteligente
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight pt-2">
            Centro de Importacao
          </h1>
          <p className="text-xs text-slate-400 max-w-3xl">
            Importe a planilha de RH para gerar mapa da forca de trabalho, criticidade, backups, sucessao, treinamentos, evidencias, plano PDCA e dashboard executivo.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-lg border border-slate-800 shrink-0">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <select
            value={selectedTenant}
            onChange={(e) => {
              setSelectedTenant(e.target.value);
              setRhResult(null);
            }}
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

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5">
        <ImportDropzone importType={importType} onDataLoaded={handleDataLoaded} onWorkbookLoaded={handleWorkbookLoaded} />

        <div className="rounded-lg border border-slate-800 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold text-white uppercase font-mono">Resumo da importacao</h2>
          </div>
          <div className="mt-3 space-y-2 text-[11px] text-slate-500">
            <p>Tenant: <strong className="text-white">{tenants.find(t => t.id === selectedTenant)?.name}</strong></p>
            <p>Status: <strong className={hasCriticalErrors ? "text-rose-500" : "text-emerald-600"}>
              {rhResult ? (hasCriticalErrors ? "bloqueada por erros" : "dataset publicado") : "aguardando arquivo"}
            </strong></p>
            {rhResult?.parseMetadata && (
              <p>
                Aba usada: <strong className="text-white">{rhResult.parseMetadata.sheetName}</strong> | cabecalho linha {rhResult.parseMetadata.headerRowNumber}
              </p>
            )}
          </div>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: "Funcoes", value: summary.functions, icon: <Briefcase className="w-4 h-4" />, route: "workforce-map" },
            { label: "Setores", value: summary.sectors, icon: <Layers className="w-4 h-4" />, route: "workforce-map" },
            { label: "Processos", value: summary.processes, icon: <Zap className="w-4 h-4" />, route: "critical-functions" },
            { label: "Criticidade", value: `${summary.criticality.criticas}/${summary.criticality.altas}/${summary.criticality.medias}/${summary.criticality.baixas}`, icon: <AlertTriangle className="w-4 h-4" />, route: "critical-functions" },
            { label: "Backups", value: summary.backups, icon: <Repeat2 className="w-4 h-4" />, route: "backup-succession" },
            { label: "Treinamentos", value: summary.trainings, icon: <GraduationCap className="w-4 h-4" />, route: "training-ojt" },
          ].map(item => (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate?.(item.route)}
              className="rounded-lg border border-slate-800 bg-white/[0.03] p-4 text-left transition-all hover:border-blue-200 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center justify-between gap-2 text-blue-700">
                {item.icon}
                <span className="text-[10px] font-mono uppercase text-slate-500">{item.label}</span>
              </div>
              <p className="mt-3 text-2xl font-extrabold leading-tight text-white">{item.value}</p>
            </button>
          ))}
        </div>
      )}

      {rhResult && (
        <div className="space-y-6 animate-fade-in pt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-l-[3px] border-emerald-500 pl-2.5">
                Saida da transformacao RH
              </h3>
              <p className="text-[11px] text-slate-500 mt-2">
                Fonte: {rhResult.sourceName} | {rhResult.successCount}/{rhResult.processedCount} linhas validas | tenant {rhResult.tenantId}
              </p>
            </div>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase border ${
              hasCriticalErrors
                ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
            }`}>
              {hasCriticalErrors ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {hasCriticalErrors ? "validacao bloqueada" : "dataset publicado"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {rhResult.workProducts.map(product => (
              <button
                key={product.id}
                type="button"
                onClick={() => onNavigate?.(WORK_PRODUCT_ROUTES[product.id] ?? "intelligence")}
                className="bg-white/[0.03] border border-slate-800 rounded-lg p-5 text-left transition-all hover:border-blue-200 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[10px] font-mono text-slate-500">{product.rowsAffected} registros</span>
                </div>
                <h4 className="text-xs font-bold text-white mt-3">{WORK_PRODUCT_TITLES[product.id] ?? product.title}</h4>
                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">{product.evidenceRequired}</p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ImportValidationPanel errors={rhResult.errors} warnings={rhResult.warnings} />
            <div className="lg:col-span-2">
              <ImportPreviewTable entities={rhResult.rows.slice(0, 20)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

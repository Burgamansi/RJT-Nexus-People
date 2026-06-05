import React from "react";
import { Bell, ShieldCheck, Building2 } from "lucide-react";
import { peopleFeatureRegistry } from "../registry/peopleFeatureRegistry";

const PAGE_LABELS: Record<string, { title: string; iso: string }> = {
  "dashboard":               { title: "Executive Dashboard",      iso: "ISO 9001 · Visão Geral" },
  "intelligence":            { title: "People Intelligence",      iso: "Análise Integrada" },
  "import-center":           { title: "Import Center",            iso: "Importação de Dados" },
  "workforce-map":           { title: "Workforce Map",            iso: "ISO 6.1 · Estrutura Operacional" },
  "critical-functions":      { title: "Funções Críticas",         iso: "ISO 6.1 · 7.2 · PDCA Ação 02" },
  "polyvalence-matrix":      { title: "Matriz de Polivalência",   iso: "ISO 7.2 · PDCA Ação 03" },
  "backup-succession":       { title: "Backup Operacional",       iso: "ISO 7.2 · 7.3 · PDCA Ação 05" },
  "training-ojt":            { title: "Treinamento & OJT",        iso: "ISO 7.2 · 7.3" },
  "knowledge-hub":           { title: "Base de Conhecimento",     iso: "ISO 7.1.6 · 8.5.1 · PDCA Ação 01" },
  "evidence-center":         { title: "Central de Evidências",    iso: "ISO 9.1 · Rastreabilidade" },
  "vulnerability-analytics": { title: "Análise de Vulnerabilidade", iso: "ISO 9.1 · 9.3 · PDCA Ação 06" },
  "action-plans":            { title: "Planos de Ação",           iso: "ISO 9.3 · Ciclo PDCA" },
};

interface TopbarProps { currentTab: string; }

export const Topbar: React.FC<TopbarProps> = ({ currentTab }) => {
  const page = PAGE_LABELS[currentTab] ?? {
    title: peopleFeatureRegistry.find(f => f.id === currentTab)?.title ?? "Módulo",
    iso: "RJT Nexus People",
  };

  return (
    <header
      className="h-14 px-8 flex items-center justify-between shrink-0 z-10"
      style={{
        background: "rgba(9,9,15,0.95)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-3">
        <span
          className="h-4 w-[2px] rounded-full shrink-0"
          style={{ background: "linear-gradient(180deg, #2563EB, #06B6D4)" }}
        />
        <div>
          <p className="text-[13px] font-bold text-white leading-none tracking-tight">
            {page.title}
          </p>
          <p className="text-[9px] font-mono mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            {page.iso}
          </p>
        </div>
      </div>

      {/* Right: status chips + bell */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <Building2 className="w-3 h-3 shrink-0" style={{ color: "#60A5FA" }} />
          União Bag
        </div>

        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold"
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
            color: "#34D399",
          }}
        >
          <ShieldCheck className="w-3 h-3 shrink-0" />
          ISO 9001:2015
        </div>

        <button
          className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          <Bell className="w-3.5 h-3.5" />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: "#2563EB", boxShadow: "0 0 6px #2563EB" }}
          />
        </button>
      </div>
    </header>
  );
};

import React from "react";
import { ExecutiveDashboardPage } from "../pages/ExecutiveDashboardPage";
import { PeopleIntelligencePage } from "../pages/PeopleIntelligencePage";
import { ImportCenterPage } from "../pages/ImportCenterPage";
import { WorkforceMapPage } from "../pages/modules/WorkforceMapPage";
import { CriticalFunctionsPage } from "../pages/modules/CriticalFunctionsPage";
import { PolyvalenceMatrixPage } from "../pages/modules/PolyvalenceMatrixPage";
import { BackupSuccessionPage } from "../pages/modules/BackupSuccessionPage";
import { TrainingOJTPage } from "../pages/modules/TrainingOJTPage";
import { KnowledgeHubPage } from "../pages/modules/KnowledgeHubPage";
import { EvidenceCenterPage } from "../pages/modules/EvidenceCenterPage";
import { VulnerabilityAnalyticsPage } from "../pages/modules/VulnerabilityAnalyticsPage";
import { ActionPlansPage } from "../pages/modules/ActionPlansPage";
import { peopleFeatureRegistry } from "./registry/peopleFeatureRegistry";
import { EmptyState } from "../components/ui/EmptyState";

interface RouteRendererProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const RouteRenderer: React.FC<RouteRendererProps> = ({
  currentTab,
  onNavigate
}) => {
  if (currentTab === "dashboard") {
    return <ExecutiveDashboardPage onNavigate={onNavigate} />;
  }

  if (currentTab === "intelligence") {
    return <PeopleIntelligencePage onNavigate={onNavigate} />;
  }

  if (currentTab === "import-center") {
    return <ImportCenterPage onNavigate={onNavigate} />;
  }

  if (currentTab === "workforce-map") {
    return <WorkforceMapPage />;
  }

  if (currentTab === "critical-functions") {
    return <CriticalFunctionsPage />;
  }

  if (currentTab === "polyvalence-matrix") {
    return <PolyvalenceMatrixPage />;
  }

  if (currentTab === "backup-succession") {
    return <BackupSuccessionPage />;
  }

  if (currentTab === "training-ojt") {
    return <TrainingOJTPage />;
  }

  if (currentTab === "knowledge-hub") {
    return <KnowledgeHubPage />;
  }

  if (currentTab === "evidence-center") {
    return <EvidenceCenterPage />;
  }

  if (currentTab === "vulnerability-analytics") {
    return <VulnerabilityAnalyticsPage />;
  }

  if (currentTab === "action-plans") {
    return <ActionPlansPage />;
  }

  const feat = peopleFeatureRegistry.find(f => f.id === currentTab);
  if (feat) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Modulo indisponivel nesta rota"
          message={`${feat.title} ja esta registrado na navegacao mestre. Volte para a central de modulos para abrir a experiencia operacional correspondente.`}
          actionLabel="Voltar aos modulos"
          onAction={() => onNavigate("intelligence")}
        />
      </div>
    );
  }

  return (
    <EmptyState
      title="Pagina nao encontrada"
      message="A aba solicitada nao existe na plataforma RJT Nexus People."
      actionLabel="Voltar ao dashboard"
      onAction={() => onNavigate("dashboard")}
    />
  );
};

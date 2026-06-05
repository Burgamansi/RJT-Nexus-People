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
    return <ExecutiveDashboardPage />;
  }

  if (currentTab === "intelligence") {
    return <PeopleIntelligencePage onNavigate={onNavigate} />;
  }

  if (currentTab === "import-center") {
    return <ImportCenterPage />;
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

  // Handle module pages dynamically
  const feat = peopleFeatureRegistry.find(f => f.id === currentTab);
  if (feat) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <span className="text-[9px] font-mono font-bold tracking-widest text-[#00E7F8] bg-[#00E7F8]/10 px-2.5 py-1 rounded-full uppercase border border-[#00E7F8]/20 select-none">
            {feat.category}
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight pt-2">
            {feat.title}
          </h1>
          <p className="text-xs text-[#00E7F8] font-mono">
            Status: {feat.status.toUpperCase()}
          </p>
        </div>

        <div className="bg-[#04044A]/40 rounded-2xl border border-slate-800 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase font-mono">Overview</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {feat.description}
          </p>
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/40">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Business Purpose</p>
            <p className="text-xs text-slate-200 mt-1 italic">
              "{feat.businessPurpose}"
            </p>
          </div>
        </div>

        <div className="pt-6">
          <EmptyState
            title={`${feat.title} Dashboard Pending Integration`}
            message={`The backend analytics for ${feat.title} have been fully modernized in selectors.ts. This UI placeholder will consume the validated multitenant calculations in the subsequent phase.`}
            actionLabel="Return to People Intelligence Dashboard"
            onAction={() => onNavigate("intelligence")}
          />
        </div>
      </div>
    );
  }

  return (
    <EmptyState
      title="404 Page Not Found"
      message="The requested People Intelligence sub-tab does not exist."
      actionLabel="Back to Dashboard"
      onAction={() => onNavigate("dashboard")}
    />
  );
};

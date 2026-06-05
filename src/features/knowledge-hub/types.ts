export interface KnowledgeHubFilters {
  tenantId?: string;
  organizationUnitId?: string;
  search?: string;
  isCriticalOnly?: boolean;
}

export interface KnowledgeAssetRow {
  assetId: string;
  code: string;
  title: string;
  functionId: string;
  functionName: string;
  isCritical: boolean;
  organizationUnitId: string;
  organizationUnitName: string;
  lastReviewedAt?: string;
  isOutdated: boolean;
  hasEvidence: boolean;
  evidenceStatus?: string;
  tenantId: string;
}

export interface KnowledgeCoverageRow {
  functionId: string;
  functionCode: string;
  functionName: string;
  isCritical: boolean;
  organizationUnitId: string;
  organizationUnitName: string;
  assetCount: number;
  hasAsset: boolean;
  hasTrainedOrOjtEmployee: boolean;
  riskLevel: "high_knowledge_loss_risk" | "medium" | "low";
  tenantId: string;
}

export interface OrgUnitKnowledgeCoverageRow {
  organizationUnitId: string;
  organizationUnitName: string;
  totalFunctions: number;
  functionsWithAssetCount: number;
  knowledgeCoverageRate: number; // percentage
  highKnowledgeLossRiskCount: number;
  tenantId: string;
}

export interface KnowledgeGapIndicator {
  functionId: string;
  functionName: string;
  organizationUnitId: string;
  organizationUnitName: string;
  assetId?: string;
  assetTitle?: string;
  gapType: "critical_function_without_knowledge_asset" | "function_without_knowledge_asset" | "outdated_knowledge_asset" | "knowledge_asset_without_evidence" | "high_knowledge_loss_risk";
  description: string;
  tenantId: string;
}

export interface KnowledgeHubSummary {
  totalKnowledgeAssets: number;
  functionsWithoutAssetCount: number;
  criticalFunctionsWithoutAssetCount: number;
  outdatedAssetsCount: number;
  assetsWithoutEvidenceCount: number;
  highKnowledgeLossRiskCount: number;
  knowledgeBaseHealthScore: number; // percentage
  tenantId: string;
}

import {
  Employee,
  OrganizationUnit,
  Function,
  CriticalFunctionAssessment,
  KnowledgeAsset,
  EvidenceRecord,
  TrainingProgram,
  OjtPlan
} from "../../shared/domain/people/entities";

import { EvidenceStatus } from "../../shared/domain/people/enums";

import {
  KnowledgeHubFilters,
  KnowledgeAssetRow,
  KnowledgeCoverageRow,
  OrgUnitKnowledgeCoverageRow,
  KnowledgeGapIndicator,
  KnowledgeHubSummary
} from "./types";

// ============================================================================
// HELPERS
// ============================================================================
function filterTenantData<T>(items: T[], tenantId?: string): T[] {
  if (!tenantId) return items;
  return items.filter(item => (item as any).tenantId === tenantId);
}

function getDaysDifference(startStr: string, refStr: string): number {
  const start = new Date(startStr);
  const ref = new Date(refStr);
  if (isNaN(start.getTime()) || isNaN(ref.getTime())) {
    return 0;
  }
  const diffTime = ref.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// ============================================================================
// 1. KNOWLEDGE ASSETS BY TENANT
// ============================================================================
export function getKnowledgeAssetsByTenant(
  assets: KnowledgeAsset[],
  functions: Function[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  filters?: KnowledgeHubFilters
): KnowledgeAssetRow[] {
  const tenantId = filters?.tenantId;

  // Isolate by tenant
  const tAssets = filterTenantData(assets, tenantId);
  const tFunctions = filterTenantData(functions, tenantId);
  const tUnits = filterTenantData(units, tenantId);
  const tEvidences = filterTenantData(evidences, tenantId);

  const rows: KnowledgeAssetRow[] = tAssets.map(asset => {
    // Resolve function
    const func = tFunctions.find(f => f.id === asset.functionId);
    const functionName = func ? func.name : "Unknown Function";
    const isCritical = func ? func.isCritical : false;
    const organizationUnitId = func ? func.organizationUnitId : "";

    // Resolve organization unit
    const unit = tUnits.find(u => u.id === organizationUnitId);
    const organizationUnitName = unit ? unit.name : "Unknown Unit";

    // Resolve evidence
    const evidence = tEvidences.find(e => e.knowledgeAssetId === asset.id);
    const hasEvidence = !!evidence;
    const evidenceStatus = evidence ? evidence.status : undefined;

    // Outdated check relative to reference date 2026-06-01
    // Consider outdated if review date is missing or > 365 days ago
    let isOutdated = true;
    if (asset.lastReviewedAt) {
      const days = getDaysDifference(asset.lastReviewedAt, "2026-06-01");
      isOutdated = days > 365;
    }

    return {
      assetId: asset.id,
      code: asset.code,
      title: asset.title,
      functionId: asset.functionId,
      functionName,
      isCritical,
      organizationUnitId,
      organizationUnitName,
      lastReviewedAt: asset.lastReviewedAt,
      isOutdated,
      hasEvidence,
      evidenceStatus,
      tenantId: asset.tenantId
    };
  });

  // Apply filters
  return rows.filter(row => {
    if (filters?.organizationUnitId && row.organizationUnitId !== filters.organizationUnitId) {
      return false;
    }
    if (filters?.isCriticalOnly && !row.isCritical) {
      return false;
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      const matchTitle = row.title.toLowerCase().includes(query);
      const matchCode = row.code.toLowerCase().includes(query);
      const matchFunc = row.functionName.toLowerCase().includes(query);
      if (!matchTitle && !matchCode && !matchFunc) {
        return false;
      }
    }
    return true;
  });
}

// ============================================================================
// 2. KNOWLEDGE ASSETS BY FUNCTION
// ============================================================================
export function getKnowledgeAssetsByFunction(
  functionId: string,
  assets: KnowledgeAsset[],
  functions: Function[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  filters?: KnowledgeHubFilters
): KnowledgeAssetRow[] {
  const rows = getKnowledgeAssetsByTenant(assets, functions, units, evidences, filters);
  return rows.filter(r => r.functionId === functionId);
}

// ============================================================================
// 3. KNOWLEDGE ASSETS BY ORGANIZATION UNIT
// ============================================================================
export function getKnowledgeAssetsByOrgUnit(
  organizationUnitId: string,
  assets: KnowledgeAsset[],
  functions: Function[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  filters?: KnowledgeHubFilters
): KnowledgeAssetRow[] {
  const rows = getKnowledgeAssetsByTenant(assets, functions, units, evidences, filters);
  return rows.filter(r => r.organizationUnitId === organizationUnitId);
}

// ============================================================================
// 4. FUNCTIONS WITHOUT KNOWLEDGE ASSETS
// ============================================================================
export function getFunctionsWithoutKnowledgeAssets(
  functions: Function[],
  assets: KnowledgeAsset[],
  filters?: KnowledgeHubFilters
): Function[] {
  const tenantId = filters?.tenantId;
  const tFunctions = filterTenantData(functions, tenantId);
  const tAssets = filterTenantData(assets, tenantId);

  return tFunctions.filter(func => {
    const hasAsset = tAssets.some(a => a.functionId === func.id);
    return !hasAsset;
  });
}

// ============================================================================
// 5. CRITICAL FUNCTIONS WITHOUT KNOWLEDGE ASSETS
// ============================================================================
export function getCriticalFunctionsWithoutKnowledgeAssets(
  functions: Function[],
  assets: KnowledgeAsset[],
  filters?: KnowledgeHubFilters
): Function[] {
  const list = getFunctionsWithoutKnowledgeAssets(functions, assets, filters);
  return list.filter(f => f.isCritical);
}

// ============================================================================
// 6. OUTDATED KNOWLEDGE ASSETS
// ============================================================================
export function getOutdatedKnowledgeAssets(
  assets: KnowledgeAsset[],
  functions: Function[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  filters?: KnowledgeHubFilters
): KnowledgeAssetRow[] {
  const rows = getKnowledgeAssetsByTenant(assets, functions, units, evidences, filters);
  return rows.filter(r => r.isOutdated);
}

// ============================================================================
// 7. KNOWLEDGE ASSETS WITHOUT EVIDENCE
// ============================================================================
export function getKnowledgeAssetsWithoutEvidence(
  assets: KnowledgeAsset[],
  functions: Function[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  filters?: KnowledgeHubFilters
): KnowledgeAssetRow[] {
  const rows = getKnowledgeAssetsByTenant(assets, functions, units, evidences, filters);
  return rows.filter(r => r.evidenceStatus !== EvidenceStatus.VALIDATED);
}

// ============================================================================
// 8. KNOWLEDGE COVERAGE BY FUNCTION
// ============================================================================
export function getKnowledgeCoverageByFunction(
  functions: Function[],
  assets: KnowledgeAsset[],
  employees: Employee[],
  ojts: OjtPlan[],
  units: OrganizationUnit[],
  filters?: KnowledgeHubFilters
): KnowledgeCoverageRow[] {
  const tenantId = filters?.tenantId;

  // Isolate by tenant
  const tFunctions = filterTenantData(functions, tenantId);
  const tAssets = filterTenantData(assets, tenantId);
  const tEmployees = filterTenantData(employees, tenantId);
  const tOjts = filterTenantData(ojts, tenantId);
  const tUnits = filterTenantData(units, tenantId);

  const rows: KnowledgeCoverageRow[] = tFunctions.map(func => {
    const unit = tUnits.find(u => u.id === func.organizationUnitId);
    const organizationUnitName = unit ? unit.name : "Unknown Unit";

    const funcAssets = tAssets.filter(a => a.functionId === func.id);
    const assetCount = funcAssets.length;
    const hasAsset = assetCount > 0;

    // Check if there is a trained or OJT-validated employee in the tenant
    const hasTrainedOrOjtEmployee = tEmployees.some(emp => {
      // 1. Certified skill
      const isCertified = emp.skills.some(s => s.skillId === func.id && s.certified);
      // 2. Completed OJT
      const hasCompletedOjt = tOjts.some(
        o => o.employeeId === emp.id && o.skillId === func.id && o.status === "completed"
      );
      return isCertified || hasCompletedOjt;
    });

    let riskLevel: "high_knowledge_loss_risk" | "medium" | "low" = "low";
    if (!hasAsset && !hasTrainedOrOjtEmployee) {
      riskLevel = "high_knowledge_loss_risk";
    } else if (!hasAsset || !hasTrainedOrOjtEmployee) {
      riskLevel = "medium";
    }

    return {
      functionId: func.id,
      functionCode: func.code,
      functionName: func.name,
      isCritical: func.isCritical,
      organizationUnitId: func.organizationUnitId,
      organizationUnitName,
      assetCount,
      hasAsset,
      hasTrainedOrOjtEmployee,
      riskLevel,
      tenantId: func.tenantId
    };
  });

  // Apply filters
  return rows.filter(row => {
    if (filters?.organizationUnitId && row.organizationUnitId !== filters.organizationUnitId) {
      return false;
    }
    if (filters?.isCriticalOnly && !row.isCritical) {
      return false;
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      const matchFunc = row.functionName.toLowerCase().includes(query);
      const matchUnit = row.organizationUnitName.toLowerCase().includes(query);
      if (!matchFunc && !matchUnit) {
        return false;
      }
    }
    return true;
  });
}

// ============================================================================
// 9. KNOWLEDGE COVERAGE BY ORGANIZATION UNIT
// ============================================================================
export function getKnowledgeCoverageByOrgUnit(
  functions: Function[],
  assets: KnowledgeAsset[],
  employees: Employee[],
  ojts: OjtPlan[],
  units: OrganizationUnit[],
  filters?: KnowledgeHubFilters
): OrgUnitKnowledgeCoverageRow[] {
  const tenantId = filters?.tenantId;

  // Isolate by tenant
  const tFunctions = filterTenantData(functions, tenantId);
  const tUnits = filterTenantData(units, tenantId);

  const coverageRows = getKnowledgeCoverageByFunction(
    functions,
    assets,
    employees,
    ojts,
    units,
    { tenantId }
  );

  return tUnits.map(unit => {
    const unitCoverage = coverageRows.filter(r => r.organizationUnitId === unit.id);
    const totalFunctions = unitCoverage.length;
    const functionsWithAssetCount = unitCoverage.filter(r => r.hasAsset).length;
    const highKnowledgeLossRiskCount = unitCoverage.filter(
      r => r.riskLevel === "high_knowledge_loss_risk"
    ).length;

    const knowledgeCoverageRate =
      totalFunctions > 0 ? Math.round((functionsWithAssetCount / totalFunctions) * 100) : 0;

    return {
      organizationUnitId: unit.id,
      organizationUnitName: unit.name,
      totalFunctions,
      functionsWithAssetCount,
      knowledgeCoverageRate,
      highKnowledgeLossRiskCount,
      tenantId: unit.tenantId
    };
  });
}

// ============================================================================
// 10. KNOWLEDGE GAP INDICATORS
// ============================================================================
export function getKnowledgeGapIndicators(
  functions: Function[],
  assets: KnowledgeAsset[],
  employees: Employee[],
  ojts: OjtPlan[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  filters?: KnowledgeHubFilters
): KnowledgeGapIndicator[] {
  const tenantId = filters?.tenantId;

  // Resolve assets, coverage and gaps
  const assetRows = getKnowledgeAssetsByTenant(assets, functions, units, evidences, { tenantId });
  const coverageRows = getKnowledgeCoverageByFunction(
    functions,
    assets,
    employees,
    ojts,
    units,
    { tenantId }
  );

  const gaps: KnowledgeGapIndicator[] = [];

  // 1. High Knowledge Loss Risk, Function/Critical Function without Asset
  coverageRows.forEach(cov => {
    if (cov.riskLevel === "high_knowledge_loss_risk") {
      gaps.push({
        functionId: cov.functionId,
        functionName: cov.functionName,
        organizationUnitId: cov.organizationUnitId,
        organizationUnitName: cov.organizationUnitName,
        gapType: "high_knowledge_loss_risk",
        description: `Critical function [${cov.functionName}] has no knowledge asset AND no trained or OJT-validated employees on record.`,
        tenantId: cov.tenantId
      });
    }

    if (!cov.hasAsset) {
      if (cov.isCritical) {
        gaps.push({
          functionId: cov.functionId,
          functionName: cov.functionName,
          organizationUnitId: cov.organizationUnitId,
          organizationUnitName: cov.organizationUnitName,
          gapType: "critical_function_without_knowledge_asset",
          description: `Critical function [${cov.functionName}] lacks documented know-how / SOP knowledge assets.`,
          tenantId: cov.tenantId
        });
      } else {
        gaps.push({
          functionId: cov.functionId,
          functionName: cov.functionName,
          organizationUnitId: cov.organizationUnitId,
          organizationUnitName: cov.organizationUnitName,
          gapType: "function_without_knowledge_asset",
          description: `Function [${cov.functionName}] lacks documented SOP knowledge assets.`,
          tenantId: cov.tenantId
        });
      }
    }
  });

  // 2. Outdated Assets and Assets without Evidence validation
  assetRows.forEach(asset => {
    if (asset.isOutdated) {
      gaps.push({
        functionId: asset.functionId,
        functionName: asset.functionName,
        organizationUnitId: asset.organizationUnitId,
        organizationUnitName: asset.organizationUnitName,
        assetId: asset.assetId,
        assetTitle: asset.title,
        gapType: "outdated_knowledge_asset",
        description: `Knowledge asset [${asset.title}] is outdated (last reviewed: ${asset.lastReviewedAt || "never"}).`,
        tenantId: asset.tenantId
      });
    }

    if (asset.evidenceStatus !== EvidenceStatus.VALIDATED) {
      gaps.push({
        functionId: asset.functionId,
        functionName: asset.functionName,
        organizationUnitId: asset.organizationUnitId,
        organizationUnitName: asset.organizationUnitName,
        assetId: asset.assetId,
        assetTitle: asset.title,
        gapType: "knowledge_asset_without_evidence",
        description: `Knowledge asset [${asset.title}] has no validated evidence record (validation gap).`,
        tenantId: asset.tenantId
      });
    }
  });

  // Apply filters
  return gaps.filter(row => {
    if (filters?.organizationUnitId && row.organizationUnitId !== filters.organizationUnitId) {
      return false;
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      const matchFunc = row.functionName.toLowerCase().includes(query);
      const matchUnit = row.organizationUnitName.toLowerCase().includes(query);
      const matchAsset = row.assetTitle?.toLowerCase().includes(query);
      if (!matchFunc && !matchUnit && !matchAsset) {
        return false;
      }
    }
    return true;
  });
}

// ============================================================================
// 11. KNOWLEDGE HUB SUMMARY DASHBOARD DATA
// ============================================================================
export function getKnowledgeHubSummaryDashboardData(
  assets: KnowledgeAsset[],
  functions: Function[],
  units: OrganizationUnit[],
  evidences: EvidenceRecord[],
  employees: Employee[],
  ojts: OjtPlan[],
  filters?: KnowledgeHubFilters
): KnowledgeHubSummary {
  const tenantId = filters?.tenantId;

  const tAssets = filterTenantData(assets, tenantId);

  const assetRows = getKnowledgeAssetsByTenant(assets, functions, units, evidences, { tenantId });
  const coverageRows = getKnowledgeCoverageByFunction(
    functions,
    assets,
    employees,
    ojts,
    units,
    { tenantId }
  );

  const criticalFuncs = coverageRows.filter(r => r.isCritical);

  const functionsWithoutAssetCount = coverageRows.filter(r => !r.hasAsset).length;
  const criticalFunctionsWithoutAssetCount = criticalFuncs.filter(r => !r.hasAsset).length;

  const outdatedAssetsCount = assetRows.filter(r => r.isOutdated).length;
  const assetsWithoutEvidenceCount = assetRows.filter(
    r => r.evidenceStatus !== EvidenceStatus.VALIDATED
  ).length;

  const highKnowledgeLossRiskCount = coverageRows.filter(
    r => r.riskLevel === "high_knowledge_loss_risk"
  ).length;

  // Health Score: percentage of assets that are BOTH up-to-date and have validated evidence
  const healthyCount = assetRows.filter(
    r => !r.isOutdated && r.evidenceStatus === EvidenceStatus.VALIDATED
  ).length;

  const knowledgeBaseHealthScore =
    tAssets.length > 0 ? Math.round((healthyCount / tAssets.length) * 100) : 0;

  return {
    totalKnowledgeAssets: tAssets.length,
    functionsWithoutAssetCount,
    criticalFunctionsWithoutAssetCount,
    outdatedAssetsCount,
    assetsWithoutEvidenceCount,
    highKnowledgeLossRiskCount,
    knowledgeBaseHealthScore,
    tenantId: tenantId || ""
  };
}

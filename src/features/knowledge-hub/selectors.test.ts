import { describe, it } from "node:test";
import assert from "node:assert";
import {
  Employee,
  OrganizationUnit,
  Function,
  KnowledgeAsset,
  EvidenceRecord,
  OjtPlan
} from "../../shared/domain/people/entities";

import { EvidenceStatus } from "../../shared/domain/people/enums";

import {
  getKnowledgeAssetsByTenant,
  getKnowledgeAssetsByFunction,
  getKnowledgeAssetsByOrgUnit,
  getFunctionsWithoutKnowledgeAssets,
  getCriticalFunctionsWithoutKnowledgeAssets,
  getOutdatedKnowledgeAssets,
  getKnowledgeAssetsWithoutEvidence,
  getKnowledgeCoverageByFunction,
  getKnowledgeCoverageByOrgUnit,
  getKnowledgeGapIndicators,
  getKnowledgeHubSummaryDashboardData
} from "./selectors";

// ============================================================================
// TEST BUILDERS
// ============================================================================

const createMockEmployee = (
  id: string,
  name: string,
  unitId: string,
  skills: Array<{ skillId: string; proficiencyLevel: string; certified: boolean }> = [],
  tenantId = "tenant_1"
): Employee => ({
  id,
  tenantId,
  name,
  email: `${id}@nexus.com`,
  organizationUnitId: unitId,
  status: "active",
  skills
});

const createMockUnit = (id: string, name: string, tenantId = "tenant_1"): OrganizationUnit => ({
  id,
  tenantId,
  name,
  type: "sector"
});

const createMockFunction = (
  id: string,
  code: string,
  name: string,
  unitId: string,
  isCritical: boolean,
  tenantId = "tenant_1"
): Function => ({
  id,
  tenantId,
  code,
  name,
  description: `${name} description`,
  organizationUnitId: unitId,
  isCritical,
  requiredBackupQuantity: 1
});

// ============================================================================
// TEST SUITE
// ============================================================================

describe("Knowledge Hub Pure Selectors Suite", () => {
  const tenantId = "tenant_1";

  // Mock Units
  const mockUnits = [
    createMockUnit("unit_corte", "Corte Automático", tenantId),
    createMockUnit("unit_costura", "Costura Manual", tenantId)
  ];

  // Mock Functions
  // func_01: critical, has asset.
  // func_02: critical, NO asset.
  // func_03: not critical, NO asset.
  const mockFunctions = [
    createMockFunction("func_01", "FC-01", "Corte Principal", "unit_corte", true, tenantId),
    createMockFunction("func_02", "FC-02", "Costura Principal", "unit_costura", true, tenantId),
    createMockFunction("func_03", "FN-03", "Simple Task", "unit_corte", false, tenantId)
  ];

  // Mock Knowledge Assets
  // asset_1: up-to-date (reviewed 2026-05-20), validated evidence.
  // asset_2: outdated (reviewed 2024-01-01), no evidence.
  const mockAssets: KnowledgeAsset[] = [
    { id: "asset_1", tenantId, code: "SOP-01", title: "Corte SOP Guide", functionId: "func_01", lastReviewedAt: "2026-05-20" },
    { id: "asset_2", tenantId, code: "SOP-02", title: "Secondary guide", functionId: "func_01", lastReviewedAt: "2024-01-01" }
  ];

  // Mock Evidence Records
  const mockEvidences: EvidenceRecord[] = [
    { id: "ev_1", tenantId, employeeId: "emp_1", knowledgeAssetId: "asset_1", status: EvidenceStatus.VALIDATED, evidenceUrl: "url_1" }
  ];

  // Mock Employees
  // emp_1: certified in func_01, OJT completed
  const mockEmployees = [
    createMockEmployee(
      "emp_1",
      "Kaiky Competent",
      "unit_corte",
      [
        { skillId: "func_01", proficiencyLevel: "Operational", certified: true },
        { skillId: "func_03", proficiencyLevel: "Operational", certified: true }
      ],
      tenantId
    )
  ];

  // Mock Ojt Plans
  const mockOjts: OjtPlan[] = [
    { id: "ojt_1", tenantId, employeeId: "emp_1", skillId: "func_01", status: "completed" }
  ];

  it("should calculate knowledge asset rows isolated by tenant", () => {
    const rows = getKnowledgeAssetsByTenant(
      mockAssets,
      mockFunctions,
      mockUnits,
      mockEvidences,
      { tenantId }
    );

    assert.strictEqual(rows.length, 2);

    const r1 = rows.find(r => r.assetId === "asset_1")!;
    assert.strictEqual(r1.code, "SOP-01");
    assert.strictEqual(r1.functionName, "Corte Principal");
    assert.strictEqual(r1.isOutdated, false); // reviewed 2026-05-20 is recent relative to 2026-06-01
    assert.strictEqual(r1.hasEvidence, true);
    assert.strictEqual(r1.evidenceStatus, EvidenceStatus.VALIDATED);

    const r2 = rows.find(r => r.assetId === "asset_2")!;
    assert.strictEqual(r2.isOutdated, true); // reviewed 2024-01-01 (> 365 days ago)
    assert.strictEqual(r2.hasEvidence, false);
  });

  it("should verify tenant isolation with zero cross-tenant leakage", () => {
    const assetTenantA = { id: "as_a", tenantId: "tenant_A", code: "A", title: "A", functionId: "func_01" };
    const assetTenantB = { id: "as_b", tenantId: "tenant_B", code: "B", title: "B", functionId: "func_01" };

    const rows = getKnowledgeAssetsByTenant(
      [assetTenantA, assetTenantB],
      [],
      [],
      [],
      { tenantId: "tenant_A" }
    );

    assert.strictEqual(rows.length, 1);
    assert.strictEqual(rows[0].assetId, "as_a");
  });

  it("should handle empty arrays safely", () => {
    const rows = getKnowledgeAssetsByTenant([], [], [], []);
    assert.strictEqual(rows.length, 0);

    const summary = getKnowledgeHubSummaryDashboardData([], [], [], [], [], []);
    assert.strictEqual(summary.totalKnowledgeAssets, 0);
  });

  it("should filter assets by specific function and organization unit", () => {
    const funcAssets = getKnowledgeAssetsByFunction(
      "func_01",
      mockAssets,
      mockFunctions,
      mockUnits,
      mockEvidences,
      { tenantId }
    );
    assert.strictEqual(funcAssets.length, 2);

    const orgAssets = getKnowledgeAssetsByOrgUnit(
      "unit_corte",
      mockAssets,
      mockFunctions,
      mockUnits,
      mockEvidences,
      { tenantId }
    );
    assert.strictEqual(orgAssets.length, 2);
  });

  it("should select functions and critical functions lacking knowledge assets", () => {
    const withoutAsset = getFunctionsWithoutKnowledgeAssets(mockFunctions, mockAssets, { tenantId });
    // func_02 and func_03 have 0 assets
    assert.strictEqual(withoutAsset.length, 2);
    assert.ok(withoutAsset.some(f => f.id === "func_02"));
    assert.ok(withoutAsset.some(f => f.id === "func_03"));

    const criticalWithoutAsset = getCriticalFunctionsWithoutKnowledgeAssets(mockFunctions, mockAssets, { tenantId });
    // func_02 is critical, func_03 is not
    assert.strictEqual(criticalWithoutAsset.length, 1);
    assert.strictEqual(criticalWithoutAsset[0].id, "func_02");
  });

  it("should identify outdated knowledge assets", () => {
    const outdated = getOutdatedKnowledgeAssets(
      mockAssets,
      mockFunctions,
      mockUnits,
      mockEvidences,
      { tenantId }
    );
    // asset_2 is outdated
    assert.strictEqual(outdated.length, 1);
    assert.strictEqual(outdated[0].assetId, "asset_2");
  });

  it("should identify knowledge assets lacking validated evidence", () => {
    const missingEv = getKnowledgeAssetsWithoutEvidence(
      mockAssets,
      mockFunctions,
      mockUnits,
      mockEvidences,
      { tenantId }
    );
    // asset_2 has no evidence validation
    assert.strictEqual(missingEv.length, 1);
    assert.strictEqual(missingEv[0].assetId, "asset_2");
  });

  it("should calculate knowledge coverage and risk levels by function", () => {
    const coverage = getKnowledgeCoverageByFunction(
      mockFunctions,
      mockAssets,
      mockEmployees,
      mockOjts,
      mockUnits,
      { tenantId }
    );

    assert.strictEqual(coverage.length, 3);

    // func_01: has asset + has trained employee -> low risk
    const c1 = coverage.find(c => c.functionId === "func_01")!;
    assert.strictEqual(c1.hasAsset, true);
    assert.strictEqual(c1.hasTrainedOrOjtEmployee, true);
    assert.strictEqual(c1.riskLevel, "low");

    // func_02: critical, NO asset + NO trained employee -> high knowledge loss risk!
    const c2 = coverage.find(c => c.functionId === "func_02")!;
    assert.strictEqual(c2.hasAsset, false);
    assert.strictEqual(c2.hasTrainedOrOjtEmployee, false);
    assert.strictEqual(c2.riskLevel, "high_knowledge_loss_risk");
  });

  it("should calculate coverage rates aggregated by organization unit", () => {
    const coverage = getKnowledgeCoverageByOrgUnit(
      mockFunctions,
      mockAssets,
      mockEmployees,
      mockOjts,
      mockUnits,
      { tenantId }
    );

    assert.strictEqual(coverage.length, 2);

    const corte = coverage.find(c => c.organizationUnitId === "unit_corte")!;
    assert.strictEqual(corte.totalFunctions, 2); // func_01 and func_03
    assert.strictEqual(corte.functionsWithAssetCount, 1); // func_01 has assets, func_03 doesn't
    assert.strictEqual(corte.knowledgeCoverageRate, 50); // 1 / 2 * 100
  });

  it("should detect all knowledge gap indicators", () => {
    const gaps = getKnowledgeGapIndicators(
      mockFunctions,
      mockAssets,
      mockEmployees,
      mockOjts,
      mockUnits,
      mockEvidences,
      { tenantId }
    );

    assert.strictEqual(gaps.length > 0, true);

    // Verify high knowledge loss risk gap (func_02)
    const lossGap = gaps.find(g => g.functionId === "func_02" && g.gapType === "high_knowledge_loss_risk")!;
    assert.ok(lossGap);

    // Verify outdated knowledge asset (asset_2)
    const outdatedGap = gaps.find(g => g.assetId === "asset_2" && g.gapType === "outdated_knowledge_asset")!;
    assert.ok(outdatedGap);
  });

  it("should calculate correct summary totals and dashboard health metrics", () => {
    const summary = getKnowledgeHubSummaryDashboardData(
      mockAssets,
      mockFunctions,
      mockUnits,
      mockEvidences,
      mockEmployees,
      mockOjts,
      { tenantId }
    );

    assert.strictEqual(summary.totalKnowledgeAssets, 2);
    assert.strictEqual(summary.functionsWithoutAssetCount, 2); // func_02 and func_03
    assert.strictEqual(summary.criticalFunctionsWithoutAssetCount, 1); // func_02
    assert.strictEqual(summary.outdatedAssetsCount, 1); // asset_2
    assert.strictEqual(summary.assetsWithoutEvidenceCount, 1); // asset_2
    assert.strictEqual(summary.highKnowledgeLossRiskCount, 1); // func_02
    assert.strictEqual(summary.knowledgeBaseHealthScore, 50); // 1 healthy (asset_1) out of 2 total assets (50%)
  });
});

import {
  ActionPlan,
  BackupAssignment,
  CriticalFunctionAssessment,
  Employee,
  EmployeeAssignment,
  EvidenceRecord,
  Function as PeopleFunction,
  KnowledgeAsset,
  OjtPlan,
  OrganizationUnit,
  SuccessionCandidate,
  TrainingProgram,
  VulnerabilitySnapshot
} from "../../shared/domain/people/entities";
import { ActionStatus, EvidenceStatus, Priority } from "../../shared/domain/people/enums";
import { ImportError, ImportWarning, RawImportRow, XLSXParseMetadata } from "./types";

export interface PeopleIntelligenceDataset {
  tenantId: string;
  tenants: Array<{ id: string; name: string }>;
  employees: Employee[];
  units: OrganizationUnit[];
  functions: PeopleFunction[];
  assignments: EmployeeAssignment[];
  assessments: CriticalFunctionAssessment[];
  backups: BackupAssignment[];
  successors: SuccessionCandidate[];
  programs: TrainingProgram[];
  ojts: OjtPlan[];
  assets: KnowledgeAsset[];
  evidences: EvidenceRecord[];
  snapshots: VulnerabilitySnapshot[];
  actionPlans: ActionPlan[];
}

export interface ImportedWorkProduct {
  id: string;
  module:
    | "workforce_map"
    | "critical_functions_ranking"
    | "backup_matrix"
    | "succession_plan"
    | "training_ojt_plan"
    | "evidence_center"
    | "pdca_action_plan"
    | "executive_dashboard";
  title: string;
  priorityScore: number;
  classification: Priority;
  evidenceRequired: string;
  isoClause?: string;
  sourceFunctionId?: string;
  rowsAffected: number;
}

export interface RHSpreadsheetImportResult {
  tenantId: string;
  sourceName: string;
  parseMetadata?: XLSXParseMetadata;
  processedCount: number;
  successCount: number;
  elapsedMs: number;
  rows: NormalizedRHRow[];
  dataset: PeopleIntelligenceDataset;
  workProducts: ImportedWorkProduct[];
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface NormalizedRHRow {
  rowNumber: number;
  raw: RawImportRow;
  functionCode: string;
  functionName: string;
  sectorName: string;
  processName: string;
  scoreGut: number;
  criticality: Priority;
  trainingTimeRecommended: string;
  requiredBackupQuantity: number;
  requiredCompetencies: string[];
  sgqImpact: string;
  isoClause: string;
  primaryEmployeeName?: string;
  backupNames: string[];
  evidenceUrl?: string;
}

const REQUIRED_HEADERS = [
  "functionName",
  "sectorName",
  "processName",
  "scoreGut",
  "criticality",
  "trainingTimeRecommended",
  "requiredBackupQuantity",
  "requiredCompetencies",
  "sgqImpact",
  "isoClause"
] as const;

const HEADER_ALIASES: Record<(typeof REQUIRED_HEADERS)[number] | "functionCode" | "primaryEmployeeName" | "backupNames" | "evidenceUrl", string[]> = {
  functionCode: ["id da funcao"],
  functionName: ["nome da funcao"],
  sectorName: ["setor", "area", "departamento", "unidade"],
  processName: ["processo", "macroprocesso"],
  scoreGut: ["score gut", "score g x u x t", "score g×u×t", "score g*u*t", "gut", "scoregut"],
  criticality: ["criticidade gut", "criticidade g.u.t", "criticidade", "classificacao final", "classificação final"],
  trainingTimeRecommended: ["tempo de treinamento recomendado", "tempo treinamento recomendado", "tempo estimado formacao"],
  requiredBackupQuantity: ["qtd de backup recomendada", "qtd. de backup recomendada", "quantidade de backups recomendada", "backup recomendado", "required backup quantity"],
  requiredCompetencies: ["competencias requeridas", "competencias", "skills"],
  sgqImpact: ["impacto no sgq", "impacto sgq", "impacto qualidade", "impacto no sistema de gestao da qualidade"],
  isoClause: ["clausula iso 9001", "requisito iso", "iso 9001", "clausula iso"],
  primaryEmployeeName: ["colaborador principal", "responsavel", "operador principal", "titular"],
  backupNames: ["backup", "backup 1", "backup1", "backup 2", "backup2", "colaborador backup", "backups"],
  evidenceUrl: ["evidencia", "link evidencia", "evidence url", "url evidencia"]
};

function normalizeKey(value: string): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[×*]/g, "x")
    .replace(/[^\w\s.]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function slug(value: string, fallback: string): string {
  const normalized = normalizeKey(value)
    .replace(/[.\s]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return normalized || fallback;
}

function getCell(row: RawImportRow, aliases: string[], allowContains = true): string {
  const entries = Object.entries(row);
  for (const alias of aliases.map(normalizeKey)) {
    const found = entries.find(([key]) => normalizeKey(key) === alias);
    if (found) return String(found[1] ?? "").trim();
  }
  if (allowContains) {
    for (const alias of aliases.map(normalizeKey)) {
      const found = entries.find(([key]) => normalizeKey(key).includes(alias));
      if (found) return String(found[1] ?? "").trim();
    }
  }
  return "";
}

function parsePositiveInt(value: string): number {
  const match = String(value || "").match(/\d+/);
  return match ? Math.max(0, parseInt(match[0], 10)) : 0;
}

function parseScore(value: string): number {
  const numeric = Number(String(value || "").replace(",", ".").match(/-?\d+(\.\d+)?/)?.[0] || 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function splitList(value: string): string[] {
  return String(value || "")
    .split(/[,;|]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function priorityFromCriticality(value: string, scoreGut: number): Priority {
  const text = normalizeKey(value);
  if (text.includes("critic")) return Priority.CRITICAL;
  if (text.includes("alto") || text.includes("alta") || text.includes("high")) return Priority.HIGH;
  if (text.includes("medio") || text.includes("media") || text.includes("medium")) return Priority.MEDIUM;
  if (text.includes("baixo") || text.includes("baixa") || text.includes("low")) return Priority.LOW;
  if (scoreGut >= 80) return Priority.CRITICAL;
  if (scoreGut >= 40) return Priority.HIGH;
  if (scoreGut >= 15) return Priority.MEDIUM;
  return Priority.LOW;
}

function addBusinessDays(base: Date, days: number): string {
  const due = new Date(base);
  due.setDate(due.getDate() + days);
  return due.toISOString().slice(0, 10);
}

function actionPriority(classification: Priority): Priority {
  return classification === Priority.CRITICAL ? Priority.CRITICAL : classification === Priority.HIGH ? Priority.HIGH : Priority.MEDIUM;
}

export function normalizeRHRows(rows: RawImportRow[], tenantId: string): {
  rows: NormalizedRHRow[];
  errors: ImportError[];
  warnings: ImportWarning[];
} {
  const errors: ImportError[] = [];
  const warnings: ImportWarning[] = [];

  const normalizedRows = rows.map((row, index): NormalizedRHRow | null => {
    const rowNumber = index + 2;
    const scoreGut = parseScore(getCell(row, HEADER_ALIASES.scoreGut));
    const criticalityRaw = getCell(row, HEADER_ALIASES.criticality);
    const normalized: NormalizedRHRow = {
      rowNumber,
      raw: row,
      functionCode: getCell(row, HEADER_ALIASES.functionCode, false),
      functionName: getCell(row, HEADER_ALIASES.functionName, false),
      sectorName: getCell(row, HEADER_ALIASES.sectorName),
      processName: getCell(row, HEADER_ALIASES.processName),
      scoreGut,
      criticality: priorityFromCriticality(criticalityRaw, scoreGut),
      trainingTimeRecommended: getCell(row, HEADER_ALIASES.trainingTimeRecommended),
      requiredBackupQuantity: parsePositiveInt(getCell(row, HEADER_ALIASES.requiredBackupQuantity)),
      requiredCompetencies: splitList(getCell(row, HEADER_ALIASES.requiredCompetencies)),
      sgqImpact: getCell(row, HEADER_ALIASES.sgqImpact),
      isoClause: getCell(row, HEADER_ALIASES.isoClause) || "ISO 9001:2015 7.2",
      primaryEmployeeName: getCell(row, HEADER_ALIASES.primaryEmployeeName) || undefined,
      backupNames: splitList(getCell(row, HEADER_ALIASES.backupNames, false)),
      evidenceUrl: getCell(row, HEADER_ALIASES.evidenceUrl) || undefined
    };

    for (const field of REQUIRED_HEADERS) {
      const value = normalized[field];
      const isMissing = Array.isArray(value) ? value.length === 0 : value === "" || value === 0;
      if (isMissing && field !== "requiredBackupQuantity") {
        errors.push({
          row: rowNumber,
          column: field,
          message: `Campo obrigatório de inteligência RH ausente: ${field}.`,
          isCritical: true
        });
      }
    }

    if (!normalized.functionName || !normalized.sectorName || !normalized.processName) return null;
    if (!normalized.primaryEmployeeName) {
      warnings.push({
        row: rowNumber,
        column: "primaryEmployeeName",
        message: "Sem colaborador principal informado; o motor gerará lacuna de Workforce Map sem inventar responsável."
      });
    }
    if (normalized.backupNames.length < normalized.requiredBackupQuantity) {
      warnings.push({
        row: rowNumber,
        column: "requiredBackupQuantity",
        message: `Cobertura insuficiente: ${normalized.backupNames.length} backup(s) real(is) para ${normalized.requiredBackupQuantity} recomendado(s).`
      });
    }

    return normalized;
  }).filter((row): row is NormalizedRHRow => row !== null);

  if (normalizedRows.length === 0) {
    errors.push({
      row: 1,
      message: `Nenhuma linha válida para o tenant ${tenantId}. Verifique cabeçalhos e campos obrigatórios da planilha RH.`,
      isCritical: true
    });
  }

  return { rows: normalizedRows, errors, warnings };
}

export function buildPeopleIntelligenceFromRHRows(
  sourceRows: RawImportRow[],
  options: { tenantId: string; tenantName?: string; sourceName?: string; parseMetadata?: XLSXParseMetadata }
): RHSpreadsheetImportResult {
  const startedAt = Date.now();
  const tenantId = options.tenantId;
  const { rows, errors, warnings } = normalizeRHRows(sourceRows, tenantId);
  const now = new Date("2026-06-04T12:00:00.000Z");

  const units = new Map<string, OrganizationUnit>();
  const employees = new Map<string, Employee>();
  const functions: PeopleFunction[] = [];
  const assignments: EmployeeAssignment[] = [];
  const assessments: CriticalFunctionAssessment[] = [];
  const backups: BackupAssignment[] = [];
  const successors: SuccessionCandidate[] = [];
  const programs: TrainingProgram[] = [];
  const ojts: OjtPlan[] = [];
  const assets: KnowledgeAsset[] = [];
  const evidences: EvidenceRecord[] = [];
  const snapshots: VulnerabilitySnapshot[] = [];
  const actionPlans: ActionPlan[] = [];

  const ensureEmployee = (name: string, unitId: string): Employee => {
    const id = `emp_${slug(name, "employee")}`;
    const existing = employees.get(id);
    if (existing) return existing;
    const employee: Employee = {
      id,
      tenantId,
      name,
      email: "",
      organizationUnitId: unitId,
      status: "active",
      skills: []
    };
    employees.set(id, employee);
    return employee;
  };

  rows.forEach((row, index) => {
    const unitId = `unit_${slug(row.sectorName, String(index + 1))}`;
    if (!units.has(unitId)) {
      units.set(unitId, {
        id: unitId,
        tenantId,
        name: row.sectorName,
        type: "sector"
      });
    }

    const functionId = `func_${slug(row.functionCode || row.functionName, String(index + 1))}`;
    const isCritical = row.criticality === Priority.CRITICAL || row.criticality === Priority.HIGH;
    functions.push({
      id: functionId,
      tenantId,
      code: row.functionCode || `RH-${String(index + 1).padStart(3, "0")}`,
      name: row.functionName,
      description: `${row.processName}. Impacto SGQ: ${row.sgqImpact}`,
      organizationUnitId: unitId,
      isCritical,
      requiredBackupQuantity: row.requiredBackupQuantity
    });

    const vulnerabilityScore = Math.min(100, Math.round((row.scoreGut / 125) * 100));
    assessments.push({
      id: `cf_${functionId}`,
      tenantId,
      functionId,
      gutScore: row.scoreGut,
      vulnerabilityScore,
      classification: row.criticality
    });
    snapshots.push({
      id: `snap_${functionId}`,
      tenantId,
      functionId,
      score: vulnerabilityScore,
      riskLevel: row.criticality
    });

    programs.push({
      id: `prog_${functionId}`,
      tenantId,
      name: `Plano de treinamento - ${row.functionName} (${row.trainingTimeRecommended})`,
      skillId: functionId
    });
    assets.push({
      id: `asset_${functionId}`,
      tenantId,
      code: `ISO-${String(index + 1).padStart(3, "0")}`,
      title: `${row.isoClause} - ${row.functionName} / ${row.sgqImpact}`,
      functionId,
      lastReviewedAt: undefined
    });

    if (row.primaryEmployeeName) {
      const employee = ensureEmployee(row.primaryEmployeeName, unitId);
      employee.skills.push({
        skillId: functionId,
        proficiencyLevel: "Required",
        certified: Boolean(row.evidenceUrl)
      });
      assignments.push({
        id: `asg_${employee.id}_${functionId}`,
        tenantId,
        employeeId: employee.id,
        organizationUnitId: unitId,
        functionId,
        positionTitle: row.functionName,
        status: "active",
        isPrimary: true,
        startDate: "2026-06-04",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      });
      ojts.push({
        id: `ojt_${employee.id}_${functionId}`,
        tenantId,
        employeeId: employee.id,
        skillId: functionId,
        status: row.evidenceUrl ? "completed" : "planned"
      });
      evidences.push({
        id: `ev_${employee.id}_${functionId}`,
        tenantId,
        employeeId: employee.id,
        functionId,
        knowledgeAssetId: `asset_${functionId}`,
        status: row.evidenceUrl ? EvidenceStatus.VALIDATED : EvidenceStatus.PENDING,
        evidenceUrl: row.evidenceUrl || "",
        uploadedAt: row.evidenceUrl ? "2026-06-04" : undefined
      });
    }

    row.backupNames.forEach((backupName, backupIndex) => {
      const employee = ensureEmployee(backupName, unitId);
      employee.skills.push({
        skillId: functionId,
        proficiencyLevel: backupIndex < row.requiredBackupQuantity ? "Backup" : "Additional",
        certified: false
      });
      backups.push({
        id: `bkp_${employee.id}_${functionId}`,
        tenantId,
        functionId,
        employeeId: employee.id,
        status: "in_training"
      });
      successors.push({
        id: `succ_${employee.id}_${functionId}`,
        tenantId,
        functionId,
        employeeId: employee.id,
        readinessScore: row.evidenceUrl ? 70 : 45
      });
      ojts.push({
        id: `ojt_${employee.id}_${functionId}`,
        tenantId,
        employeeId: employee.id,
        skillId: functionId,
        status: "planned"
      });
    });

    const coverageGap = Math.max(0, row.requiredBackupQuantity - row.backupNames.length);
    const evidenceRequired = `Evidência objetiva obrigatória: matriz de competência assinada, OJT validado, registro de treinamento (${row.trainingTimeRecommended}) e vínculo à ${row.isoClause}.`;

    if (!row.primaryEmployeeName) {
      actionPlans.push(makeActionPlan(tenantId, functionId, row, "Definir titular da função crítica", "critical_function", `owner_${functionId}`, evidenceRequired, now, 7));
    }
    if (coverageGap > 0) {
      actionPlans.push(makeActionPlan(tenantId, functionId, row, `Cobrir gap de ${coverageGap} backup(s)`, "backup_gap", `backup_${functionId}`, evidenceRequired, now, 15));
    }
    if (row.requiredCompetencies.length > 0) {
      actionPlans.push(makeActionPlan(tenantId, functionId, row, "Executar plano de capacitação por competências requeridas", "skill_gap", `skill_${functionId}`, evidenceRequired, now, 30));
    }
    if (!row.evidenceUrl) {
      actionPlans.push(makeActionPlan(tenantId, functionId, row, "Anexar evidência objetiva de competência e impacto SGQ", "evidence_gap", `evidence_${functionId}`, evidenceRequired, now, 10));
    }
  });

  const dataset: PeopleIntelligenceDataset = {
    tenantId,
    tenants: [{ id: tenantId, name: options.tenantName || "Imported RH Tenant" }],
    employees: [...employees.values()],
    units: [...units.values()],
    functions,
    assignments,
    assessments,
    backups,
    successors,
    programs,
    ojts,
    assets,
    evidences,
    snapshots,
    actionPlans
  };

  return {
    tenantId,
    sourceName: options.sourceName || "RJT_NEXUS_PEOPLE_UBG_Extracao_RH_PDCA01.xlsx",
    parseMetadata: options.parseMetadata,
    processedCount: sourceRows.length,
    successCount: rows.length,
    elapsedMs: Date.now() - startedAt,
    rows,
    dataset,
    workProducts: buildWorkProducts(rows, dataset),
    errors,
    warnings
  };
}

function makeActionPlan(
  tenantId: string,
  functionId: string,
  row: NormalizedRHRow,
  title: string,
  sourceType: ActionPlan["sourceType"],
  sourceRecordId: string,
  evidenceRequired: string,
  now: Date,
  dueInDays: number
): ActionPlan {
  return {
    id: `ap_${sourceRecordId}`,
    tenantId,
    title,
    description: `${title}. Competências: ${row.requiredCompetencies.join(", ") || "não informadas"}. Impacto SGQ: ${row.sgqImpact}. ${evidenceRequired}`,
    status: ActionStatus.PENDING,
    priority: actionPriority(row.criticality),
    ownerEmployeeId: null,
    functionId,
    sourceType,
    sourceRecordId,
    dueDate: addBusinessDays(now, dueInDays),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
}

function buildWorkProducts(rows: NormalizedRHRow[], dataset: PeopleIntelligenceDataset): ImportedWorkProduct[] {
  const highRiskRows = rows.filter(row => row.criticality === Priority.CRITICAL || row.criticality === Priority.HIGH);
  const maxScore = Math.max(0, ...rows.map(row => row.scoreGut));
  const dominantClassification = rows.some(row => row.criticality === Priority.CRITICAL)
    ? Priority.CRITICAL
    : rows.some(row => row.criticality === Priority.HIGH)
    ? Priority.HIGH
    : Priority.MEDIUM;

  const evidence = "Todo item gerado exige evidência objetiva vinculada a competência, OJT, impacto SGQ e cláusula ISO.";
  return [
    ["workforce_map", "Workforce Map", dataset.assignments.length],
    ["critical_functions_ranking", "Critical Functions Ranking", highRiskRows.length],
    ["backup_matrix", "Backup Matrix", dataset.backups.length],
    ["succession_plan", "Succession Plan", dataset.successors.length],
    ["training_ojt_plan", "Training & OJT Plan", dataset.ojts.length],
    ["evidence_center", "Evidence Center", dataset.evidences.length],
    ["pdca_action_plan", "PDCA Action Plan", dataset.actionPlans.length],
    ["executive_dashboard", "Executive Dashboard", rows.length]
  ].map(([module, title, count]) => ({
    id: String(module),
    module: module as ImportedWorkProduct["module"],
    title: String(title),
    priorityScore: maxScore,
    classification: dominantClassification,
    evidenceRequired: evidence,
    isoClause: rows.map(row => row.isoClause).filter(Boolean)[0],
    rowsAffected: Number(count)
  }));
}

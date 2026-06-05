/**
 * Types and constants for RJT NEXUS PEOPLE
 * Unified Workforce Intelligence & Operational Continuity Platform
 */

// ============================================================================
// 1. ENUMS AND PORTUGUESE DISPLAY LABELS
// ============================================================================

export enum CriticalityLevel {
  CRITICAL = "CRITICAL",
  IMPORTANT = "IMPORTANT",
  SUPPORT = "SUPPORT"
}

export const CriticalityLabels: Record<CriticalityLevel, string> = {
  [CriticalityLevel.CRITICAL]: "Crítica",
  [CriticalityLevel.IMPORTANT]: "Importante",
  [CriticalityLevel.SUPPORT]: "Apoio"
};

export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

export const RiskLabels: Record<RiskLevel, string> = {
  [RiskLevel.LOW]: "Baixo",
  [RiskLevel.MEDIUM]: "Médio",
  [RiskLevel.HIGH]: "Alto",
  [RiskLevel.CRITICAL]: "Crítico"
};

export enum ActionStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export const ActionStatusLabels: Record<ActionStatus, string> = {
  [ActionStatus.PENDING]: "Pendente",
  [ActionStatus.IN_PROGRESS]: "Em andamento",
  [ActionStatus.COMPLETED]: "Concluído",
  [ActionStatus.CANCELLED]: "Cancelado"
};

export enum MaturityLevel {
  JUNIOR = "JUNIOR",
  PLENO = "PLENO",
  SENIOR = "SENIOR",
  SPECIALIST = "SPECIALIST"
}

export const MaturityNumericValues: Record<MaturityLevel, number> = {
  [MaturityLevel.JUNIOR]: 1,
  [MaturityLevel.PLENO]: 2,
  [MaturityLevel.SENIOR]: 3,
  [MaturityLevel.SPECIALIST]: 4
};

// All competencies start as UNASSESSED until evaluated with evidence
export enum CompetencyLevel {
  UNASSESSED = "UNASSESSED",
  NOT_TRAINED = "NOT_TRAINED",
  IN_TRAINING = "IN_TRAINING",
  ASSISTED = "ASSISTED",
  INDEPENDENT = "INDEPENDENT",
  MULTIPLIER = "MULTIPLIER"
}

export const CompetencyLabels: Record<CompetencyLevel, string> = {
  [CompetencyLevel.UNASSESSED]: "Não avaliado",
  [CompetencyLevel.NOT_TRAINED]: "Não treinado",
  [CompetencyLevel.IN_TRAINING]: "Em treinamento",
  [CompetencyLevel.ASSISTED]: "Apto com apoio",
  [CompetencyLevel.INDEPENDENT]: "Apto independente",
  [CompetencyLevel.MULTIPLIER]: "Multiplicador"
};

export const CompetencyNumericValues: Record<CompetencyLevel, number> = {
  [CompetencyLevel.UNASSESSED]: 0,
  [CompetencyLevel.NOT_TRAINED]: 0,
  [CompetencyLevel.IN_TRAINING]: 1,
  [CompetencyLevel.ASSISTED]: 2,
  [CompetencyLevel.INDEPENDENT]: 3,
  [CompetencyLevel.MULTIPLIER]: 4
};

export enum SkillType {
  TECHNICAL = "TECHNICAL",
  REGULATORY = "REGULATORY",
  OPERATIONAL = "OPERATIONAL"
}

export enum AlertSeverity {
  INFO = "INFO",
  WARNING = "WARNING",
  CRITICAL = "CRITICAL"
}

export enum AlertType {
  BACKUP_SHORTAGE = "BACKUP_SHORTAGE",
  EXPIRED_TRAINING = "EXPIRED_TRAINING",
  MATURITY_GAP = "MATURITY_GAP",
  SPOF = "SPOF"
}

// ============================================================================
// 2. SUPPORTING SUB-TYPES AND SCHEMAS
// ============================================================================

export interface OperationalCriteria {
  productionImpact: boolean;
  knowledgeConcentration: boolean;
  trainingTime: boolean;
  replacementDifficulty: boolean;
  qualityImpact: boolean;
  customerImpact: boolean;
  operationalContinuityRisk: boolean;
}

export interface RequiredSkillConfig {
  skillId: string; // FK to Skill
  requiredProficiencyLevel: CompetencyLevel;
  isMandatory: boolean;
}

// ============================================================================
// 3. NORMALIZED DATABASE ENTITIES
// ============================================================================

export interface Skill {
  id: string; // PK
  name: string;
  description: string;
  type: SkillType;
}

export interface CollaboratorSkill {
  skillId: string; // FK to Skill
  proficiencyLevel: CompetencyLevel;
  acquiredAt?: string; // ISO Date String
  expiresAt?: string; // ISO Date String (for NRs/regulatory compliance)
  isCertified: boolean;
}

export interface Collaborator {
  id: string; // PK
  name: string;
  primaryFunctionId: string; // FK to CriticalFunction / FuncaoCritica
  currentMaturity: MaturityLevel;
  skills: CollaboratorSkill[];
}

export interface CompetencyAssessment {
  id: string; // PK
  collaboratorId: string; // FK to Collaborator
  skillId: string; // FK to Skill
  assessedLevel: CompetencyLevel;
  assessedById: string; // FK to Collaborator
  assessmentDate: string; // ISO Date String
  evidenceDocumentUrl?: string; // Link to PDF or physical record UBG
  observations?: string;
  nextAssessmentDueDate?: string; // Recycle date
}

// Keep legacy ActionPlan and ISOEvidence matching App.tsx routing
export interface ActionPlan {
  id: number;
  funcaoCriticaId: number;
  funcaoCriticaCodigo: string;
  funcaoCriticaNome: string;
  descricaoAcao: string;
  tipoAcao: "Treinamento" | "Sucessão" | "Documentação" | "Processo";
  responsavel: string;
  dataInicio: string;
  dataPrazo: string;
  status: "Planejado" | "Em Execução" | "Concluido" | "Cancelado";
  acaoPDCA: "P" | "D" | "C" | "A";
  observacoes: string;
}

export interface ISOEvidence {
  id: number;
  requisitoISO: string;
  descricaoRequisito: string;
  evidenciaNecessaria: string;
  codigoDocumentoUBG: string;
  descricaoDocumento: string;
  status: "Pendente" | "Em Análise" | "Validada";
  dataColeta: string;
  responsavelColeta: string;
  // Relationship mappings (optional for legacy backward compatibility)
  collaboratorId?: string;
  functionId?: string;
  validUntil?: string;
}

export interface FunctionAlert {
  id: string;
  label: string;
  desc: string;
  severity: "critical" | "warning";
  active: boolean;
}

export interface FuncaoCritica {
  id: number;
  idFuncao: string; // e.g. FC001 / UBG-001
  setor: string;
  processo: string;
  funcaoCritica: string;
  atividadeTecnicaCritica: string;
  colaboradorPrincipal: string;
  backup1: string;
  backup2: string;
  existeBackup: "SIM" | "NÃO";
  quantidadePessoasAptas: number;
  nivelPolivalencia: number; // 1-4
  grauDependenciaTecnica: number; // 1-5
  tempoEstimadoFormacao: string;
  complexidadeTecnica: "Baixa" | "Média" | "Alta";
  impactoProducao: number; // 1-5
  impactoCliente: number; // 1-5
  impactoQualidade: number; // 1-5
  gravidade: number; // 1-5
  urgencia: number; // 1-5
  tendencia: number; // 1-5
  scoreGUT: number; // Calculated: G * U * T
  scoreVulnerabilidade: number; // Calculated
  wreIndex: number; // Calculated WRE Risk Stack
  classificacaoFinal: "Crítico" | "Alto" | "Alta" | "Médio" | "Média" | "Baixo" | "Baixa";
  necessidadeIT: string;
  necessidadeTreinamento: string;
  necessidadeSucessao: string;
  requisitoISO: string;
  evidenciaNecessaria: string;
  codigoDocumentoUBG: string;
  acaoPDCARelacionada: string;
  responsavel: string;
  prazo: string; // YYYY-MM-DD
  status: "Planejado" | "Em Execução" | "Concluído" | "Atrasado";
  
  // Normalized Relationship IDs (Added for advanced Matrix layer)
  mainOperatorIds?: string[];
  backupOperatorIds?: string[];
  requiredSkillIds?: string[];
  requiredBackupQuantity?: number;
  requiredSkills?: RequiredSkillConfig[];
}

export type CriticalFunction = FuncaoCritica;

// Helper constants
export const SETORES = [
  "Produção – Corte",
  "Produção – Costura",
  "Produção – Apoio",
  "Expedição",
  "Logística / Transporte",
  "Compras / Suprimentos",
  "Financeiro",
  "Recursos Humanos",
  "Manutenção Fabril",
  "Serviços Gerais",
  "Restaurante Industrial",
  "Gestão Administrativa",
  "Acabamento & Enfardamento",
  "Almoxarifado",
  "Frota & Distribuição",
  "Inspeção & Laudos (Qualidade)"
];

export const REQUISITOS_ISO = [
  { id: "7.1", desc: "Recursos (Pessoas, Infraestrutura, Ambiente)" },
  { id: "7.1.6", desc: "Conhecimento Organizacional (Instruções Técnicas e Retenção)" },
  { id: "7.2", desc: "Competência (Treinamento, Polivalência e Sucessão)" },
  { id: "7.3", desc: "Conscientização" },
  { id: "8.1", desc: "Planejamento e Controle Operacional" },
  { id: "8.2", desc: "Determinação de Requisitos" },
  { id: "8.4", desc: "Controle de Processos Providos Externamente" },
  { id: "8.5", desc: "Produção e Provisão de Serviço" }
];

// Legacy GUT and Vulnerability helpers
export function calculateGUT(g: number, u: number, t: number): number {
  return g * u * t;
}

export function calculateVulnerability(
  dep: number,
  prod: number,
  cl: number,
  qual: number,
  backup: "SIM" | "NÃO"
): number {
  return dep + prod + cl + qual + (backup === "NÃO" ? 10 : 0);
}

export function calculateWREIndex(gut: number, vuln: number): number {
  const normalizedGUT = Math.round((gut / 125) * 100);
  const normalizedVuln = Math.round(((vuln - 4) / 26) * 100);
  return Math.round((normalizedGUT * 0.6) + (normalizedVuln * 0.4));
}

export function getWREClassification(wreIndex: number): "Crítico" | "Alto" | "Médio" | "Baixo" {
  if (wreIndex >= 75) return "Crítico";
  if (wreIndex >= 40) return "Alto";
  if (wreIndex >= 20) return "Médio";
  return "Baixo";
}

export function getFinalClassification(scoreGUT: number): "Crítico" | "Alto" | "Médio" | "Baixo" {
  if (scoreGUT >= 100) return "Crítico";
  if (scoreGUT >= 60) return "Alto";
  if (scoreGUT >= 30) return "Médio";
  return "Baixo";
}

export function getPriorityRank(classification: "Crítico" | "Alto" | "Médio" | "Baixo"): number {
  switch (classification) {
    case "Crítico": return 1;
    case "Alto": return 2;
    case "Médio": return 3;
    case "Baixo": return 4;
  }
}

// ============================================================================
// 4. ADVANCED COMPETENCY MATRIX SELECTOR ALGORITHMS
// ============================================================================

/**
 * Strict Auditable Business Rule:
 * Collaborator is a valid backup for a function ONLY if:
 * 1. Has all mandatory required skills for the function.
 * 2. Proficiency on those skills is at least INDEPENDENT (level >= 3).
 * 3. Has a validated, non-expired ISO evidence OR a completed training plan in the system.
 */
export function selectIsValidBackup(
  collaborator: Collaborator,
  func: FuncaoCritica,
  isoEvidencesList: ISOEvidence[] = [],
  trainingPlansList: any[] = [] // Any list representing action plans of Training
): boolean {
  if (!func.requiredSkills || func.requiredSkills.length === 0) return false;
  
  const mandatorySkills = func.requiredSkills.filter(s => s.isMandatory);
  
  // 1 & 2. Competency checks
  for (const reqSkill of mandatorySkills) {
    const colabSkill = collaborator.skills.find(s => s.skillId === reqSkill.skillId);
    if (!colabSkill) return false; // Missing competency entirely
    
    const currentVal = CompetencyNumericValues[colabSkill.proficiencyLevel] || 0;
    const requiredMin = CompetencyNumericValues[CompetencyLevel.INDEPENDENT];
    
    if (currentVal < requiredMin) return false; // Not yet INDEPENDENT
  }
  
  // 3. ISO Evidence check (status must be 'Validada' and refer to this collaborator/function)
  // Or a concluded training action plan
  const hasValidEvidence = isoEvidencesList.some(ev => 
    ev.status === "Validada" &&
    ev.codigoDocumentoUBG === func.codigoDocumentoUBG &&
    // Safely match names/descriptions to avoid strict relational gaps
    (ev.descricaoDocumento.toLowerCase().includes(collaborator.name.toLowerCase()) || 
     ev.descricaoRequisito.toLowerCase().includes(collaborator.name.toLowerCase()))
  );
  
  const hasCompletedTraining = trainingPlansList.some(tp =>
    tp.status === "Concluido" &&
    tp.funcaoCriticaId === func.id &&
    tp.tipoAcao === "Treinamento" &&
    tp.descricaoAcao.toLowerCase().includes(collaborator.name.toLowerCase())
  );
  
  return hasValidEvidence || hasCompletedTraining;
}

/**
 * Computes the quality-weighted Backup Score.
 * - Backups with UNASSESSED or incomplete competencies: Weight 0.3 (Paper backup)
 * - Fully validated backups (INDEPENDENT): Weight 1.0
 * - Multiplier backups: Weight 1.2
 */
export function calculateBackupScore(
  f: FuncaoCritica, 
  collaboratorsList: Collaborator[] = [], 
  isoEvidencesList: ISOEvidence[] = [], 
  trainingPlansList: any[] = []
): number {
  if (collaboratorsList.length === 0) {
    // Legacy fallback string analysis
    if (f.existeBackup === "NÃO") return 0;
    let score = 0;
    if (f.backup1 && f.backup1 !== "Sem Backup Cadastrado" && f.backup1.trim() !== "" && !f.backup1.toLowerCase().includes("nenhum")) {
      score += 50;
    }
    if (f.backup2 && f.backup2 !== "Sem Backup Cadastrado" && f.backup2.trim() !== "" && !f.backup2.toLowerCase().includes("nenhum") && !f.backup2.toLowerCase().includes("sem backup")) {
      score += 50;
    }
    return score;
  }
  
  const backupIds = f.backupOperatorIds || [];
  if (backupIds.length === 0) return 0;
  
  const reqQty = f.requiredBackupQuantity || 2;
  let scoreSum = 0;
  
  backupIds.forEach(id => {
    const colab = collaboratorsList.find(c => c.id === id);
    if (!colab) return;
    
    const isValid = selectIsValidBackup(colab, f, isoEvidencesList, trainingPlansList);
    if (!isValid) {
      scoreSum += 0.3; // Paper/Unassessed backup
      return;
    }
    
    // Check if they are Multiplier in all mandatory skills
    const isMultiplier = (f.requiredSkills || [])
      .filter(s => s.isMandatory)
      .every(reqSkill => {
        const cs = colab.skills.find(s => s.skillId === reqSkill.skillId);
        return cs && cs.proficiencyLevel === CompetencyLevel.MULTIPLIER;
      });
      
    scoreSum += isMultiplier ? 1.2 : 1.0;
  });
  
  return Math.min(Math.round((scoreSum / reqQty) * 100), 100);
}

export function calculateCoverageScore(
  f: FuncaoCritica,
  collaboratorsList: Collaborator[] = [],
  isoEvidencesList: ISOEvidence[] = [],
  trainingPlansList: any[] = []
): number {
  if (collaboratorsList.length === 0) {
    const base = f.existeBackup === "NÃO" ? 30 : (f.quantidadePessoasAptas >= 3 ? 100 : (f.quantidadePessoasAptas === 2 ? 70 : 30));
    return base;
  }
  
  const mainOps = f.mainOperatorIds || [];
  const hasMain = mainOps.length > 0;
  
  const bScore = calculateBackupScore(f, collaboratorsList, isoEvidencesList, trainingPlansList);
  
  const mainWeight = hasMain ? 40 : 0;
  const backupWeight = (bScore / 100) * 60;
  
  return Math.round(mainWeight + backupWeight);
}

export function calculateTrainingScore(f: FuncaoCritica, acoes: ActionPlan[] = []): number {
  let score = 0;
  if (f.nivelPolivalencia === 1) score = 25;
  else if (f.nivelPolivalencia === 2) score = 50;
  else if (f.nivelPolivalencia === 3) score = 75;
  else if (f.nivelPolivalencia === 4) score = 100;
  
  const openTrainingActions = acoes.filter(ac => 
    ac.funcaoCriticaId === f.id && 
    ac.tipoAcao === "Treinamento" && 
    ac.status !== "Concluido"
  );
  
  score = Math.max(10, score - (openTrainingActions.length * 15));
  return score;
}

export function calculateMaturityScore(backup: number, training: number, coverage: number): number {
  return Math.round((backup * 0.4) + (training * 0.3) + (coverage * 0.3));
}

// Selectors for UI listing and dropdown bindings
export function selectCollaboratorsQualifiedForFunction(
  func: FuncaoCritica,
  collaborators: Collaborator[],
  isoEvidencesList: ISOEvidence[] = [],
  trainingPlansList: any[] = []
): Collaborator[] {
  return collaborators.filter(c => selectIsValidBackup(c, func, isoEvidencesList, trainingPlansList));
}

export interface SkillGapItem {
  skillId: string;
  requiredLevel: CompetencyLevel;
  currentLevel: CompetencyLevel;
  gap: number;
  isMandatory: boolean;
}

export function selectSkillGapsForFunction(
  func: FuncaoCritica,
  collaborator: Collaborator
): SkillGapItem[] {
  const gaps: SkillGapItem[] = [];
  if (!func.requiredSkills) return gaps;
  
  func.requiredSkills.forEach(reqSkill => {
    const colabSkill = collaborator.skills.find(s => s.skillId === reqSkill.skillId);
    const currentLevel = colabSkill ? colabSkill.proficiencyLevel : CompetencyLevel.UNASSESSED;
    
    const currentVal = CompetencyNumericValues[currentLevel] || 0;
    const requiredVal = CompetencyNumericValues[reqSkill.requiredProficiencyLevel] || 0;
    
    if (currentVal < requiredVal) {
      gaps.push({
        skillId: reqSkill.skillId,
        requiredLevel: reqSkill.requiredProficiencyLevel,
        currentLevel,
        gap: requiredVal - currentVal,
        isMandatory: reqSkill.isMandatory
      });
    }
  });
  
  return gaps;
}

export interface CandidateReadiness {
  collaborator: Collaborator;
  totalGap: number;
  mandatoryGapsCount: number;
  completedSkillsCount: number;
}

export function selectBackupCandidatesForFunction(
  func: FuncaoCritica,
  collaborators: Collaborator[],
  isoEvidencesList: ISOEvidence[] = [],
  trainingPlansList: any[] = []
): CandidateReadiness[] {
  const mainOps = func.mainOperatorIds || [];
  
  // Exclude main operator and already valid backups
  const candidates = collaborators.filter(colab => 
    !mainOps.includes(colab.id) &&
    !selectIsValidBackup(colab, func, isoEvidencesList, trainingPlansList)
  );
  
  const readinessList = candidates.map(colab => {
    const gaps = selectSkillGapsForFunction(func, colab);
    const totalGap = gaps.reduce((sum, item) => sum + item.gap, 0);
    const mandatoryGapsCount = gaps.filter(item => item.isMandatory).length;
    const completedSkillsCount = (func.requiredSkills || []).length - gaps.length;
    
    return {
      collaborator: colab,
      totalGap,
      mandatoryGapsCount,
      completedSkillsCount
    };
  });
  
  return readinessList.sort((a, b) => {
    if (a.mandatoryGapsCount !== b.mandatoryGapsCount) {
      return a.mandatoryGapsCount - b.mandatoryGapsCount;
    }
    if (a.totalGap !== b.totalGap) {
      return a.totalGap - b.totalGap;
    }
    return b.completedSkillsCount - a.completedSkillsCount;
  });
}

export function selectPolivalencyIndexByCollaborator(
  collaborator: Collaborator,
  functionsList: FuncaoCritica[],
  isoEvidencesList: ISOEvidence[] = [],
  trainingPlansList: any[] = []
): number {
  return functionsList.filter(func => 
    func.colaboradorPrincipal.toLowerCase() !== collaborator.name.toLowerCase() &&
    selectIsValidBackup(collaborator, func, isoEvidencesList, trainingPlansList)
  ).length;
}

export function getFunctionAlerts(f: FuncaoCritica, acoes: ActionPlan[] = []): FunctionAlert[] {
  const alerts: FunctionAlert[] = [];
  
  const hasNoBackup = f.existeBackup === "NÃO" || (f.backupOperatorIds && f.backupOperatorIds.length === 0);
  alerts.push({
    id: "missing_backup",
    label: "Sem Backup Habilitado",
    desc: "Nenhum operador substituto ativo foi cadastrado para cobrir ausências.",
    severity: "critical",
    active: hasNoBackup
  });
  
  const coverage = f.quantidadePessoasAptas;
  alerts.push({
    id: "low_coverage",
    label: "Baixa Cobertura de Equipe",
    desc: "Menos de 2 pessoas aptas na linha operacional. Risco de parada elevado.",
    severity: "critical",
    active: coverage < 2
  });
  
  alerts.push({
    id: "missing_skills",
    label: "Competência em Desenvolvimento",
    desc: "O operador principal possui nível de polivalência menor que o ideal (Grau 3 - Autônomo).",
    severity: "warning",
    active: f.nivelPolivalencia < 3
  });
  
  const formatTime = f.tempoEstimadoFormacao.toLowerCase();
  const isLongRecovery = formatTime.includes("6") || formatTime.includes("8") || formatTime.includes("12") || formatTime.includes("ano") || formatTime.includes("semestre");
  alerts.push({
    id: "long_recovery",
    label: "Longo Tempo de Capacitação",
    desc: "Tempo de formação estimado é igual ou superior a 6 meses. Sucessão lenta.",
    severity: "warning",
    active: isLongRecovery
  });
  
  const openActions = acoes.filter(ac => ac.funcaoCriticaId === f.id && ac.status !== "Concluido");
  const isCriticalRisk = f.classificacaoFinal === "Crítico" || f.classificacaoFinal === "Alto";
  alerts.push({
    id: "open_critical_actions",
    label: "Ações do Plano Pendentes",
    desc: "Função de alta criticidade possui planos de ação PDCA abertos e não concluídos.",
    severity: "warning",
    active: isCriticalRisk && openActions.length > 0
  });
  
  return alerts;
}

export function selectRiskScore(
  f: FuncaoCritica,
  collaboratorsMap: Record<string, Collaborator>,
  isoEvidencesList: ISOEvidence[] = [],
  trainingPlansList: any[] = []
): number {
  const bkp = calculateBackupScore(f, Object.values(collaboratorsMap), isoEvidencesList, trainingPlansList);
  const cov = calculateCoverageScore(f, Object.values(collaboratorsMap), isoEvidencesList, trainingPlansList);
  const trn = calculateTrainingScore(f, trainingPlansList);
  const mat = calculateMaturityScore(bkp, trn, cov);
  
  const baseRisk = f.wreIndex || f.scoreVulnerabilidade;
  const factor = (100 - mat) / 100;
  return Math.round(baseRisk + (100 - baseRisk) * factor);
}

// Preloaded mock seeds
export const INITIAL_FUNCOES: FuncaoCritica[] = [];
export const INITIAL_ACTIONS: ActionPlan[] = [];
export const INITIAL_EVIDENCES: ISOEvidence[] = [];

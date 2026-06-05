import {
  Employee,
  OrganizationUnit,
  Function,
  CriticalFunctionAssessment,
  BackupAssignment,
  SuccessionCandidate,
  TrainingProgram,
  OjtPlan,
  KnowledgeAsset,
  EvidenceRecord,
  VulnerabilitySnapshot,
  ActionPlan,
  EmployeeAssignment
} from "../../shared/domain/people/entities";

import { Priority, ActionStatus, EvidenceStatus } from "../../shared/domain/people/enums";

// ============================================================================
// TENANTS LIST
// ============================================================================
export const DEMO_TENANTS = [
  { id: "tenant_ubg", name: "União Bag Demo Tenant" },
  { id: "tenant_dummy", name: "Isolated Dummy Tenant" }
];

// ============================================================================
// 1. ORGANIZATION UNITS
// ============================================================================
export const DEMO_UNITS: OrganizationUnit[] = [
  // Tenant 1 (União Bag)
  { id: "unit_corte", tenantId: "tenant_ubg", name: "Corte Automático", type: "sector" },
  { id: "unit_costura", tenantId: "tenant_ubg", name: "Costura de Sacos", type: "sector" },
  { id: "unit_expedicao", tenantId: "tenant_ubg", name: "Expedição", type: "sector" },
  { id: "unit_adm", tenantId: "tenant_ubg", name: "Administrativo", type: "department" },

  // Tenant 2 (Dummy)
  { id: "unit_dummy_prod", tenantId: "tenant_dummy", name: "Dummy Production", type: "sector" }
];

// ============================================================================
// 2. EMPLOYEES
// ============================================================================
export const DEMO_EMPLOYEES: Employee[] = [
  // Tenant 1 (União Bag)
  {
    id: "emp_kaiky",
    tenantId: "tenant_ubg",
    name: "Kaiky Principal",
    email: "kaiky@uniaobag.com.br",
    organizationUnitId: "unit_corte",
    status: "active",
    skills: [
      { skillId: "func_corte", proficiencyLevel: "Multiplier", certified: true }
    ]
  },
  {
    id: "emp_eliane",
    tenantId: "tenant_ubg",
    name: "Eliane Backup",
    email: "eliane@uniaobag.com.br",
    organizationUnitId: "unit_costura",
    status: "active",
    skills: [
      { skillId: "func_corte", proficiencyLevel: "Operational", certified: true }
    ]
  },
  {
    id: "emp_arthur",
    tenantId: "tenant_ubg",
    name: "Arthur Apprentice",
    email: "arthur@uniaobag.com.br",
    organizationUnitId: "unit_corte",
    status: "active",
    skills: [
      { skillId: "func_corte", proficiencyLevel: "Junior", certified: false }
    ]
  },
  {
    id: "emp_silva",
    tenantId: "tenant_ubg",
    name: "João Silva Manager",
    email: "joao.silva@uniaobag.com.br",
    organizationUnitId: "unit_adm",
    status: "active",
    skills: []
  },
  {
    id: "emp_roberto",
    tenantId: "tenant_ubg",
    name: "Roberto Expeditor",
    email: "roberto@uniaobag.com.br",
    organizationUnitId: "unit_expedicao",
    status: "active",
    skills: []
  },
  {
    id: "emp_inactive",
    tenantId: "tenant_ubg",
    name: "Antigo Colaborador",
    email: "antigo@uniaobag.com.br",
    organizationUnitId: "unit_corte",
    status: "inactive",
    skills: []
  },

  // Tenant 2 (Dummy)
  {
    id: "emp_dummy_1",
    tenantId: "tenant_dummy",
    name: "John Dummy",
    email: "john@dummy.com",
    organizationUnitId: "unit_dummy_prod",
    status: "active",
    skills: []
  }
];

// ============================================================================
// 3. FUNCTIONS
// ============================================================================
export const DEMO_FUNCTIONS: Function[] = [
  // Tenant 1 (União Bag)
  {
    id: "func_corte",
    tenantId: "tenant_ubg",
    code: "FC-01",
    name: "Operador de Corte Automático",
    description: "Operação da mesa computadorizada de corte de tecidos de ráfia.",
    organizationUnitId: "unit_corte",
    isCritical: true,
    requiredBackupQuantity: 2
  },
  {
    id: "func_costura",
    tenantId: "tenant_ubg",
    code: "FC-02",
    name: "Operador de Costura Industrial",
    description: "Costura de fechamento e colocação de alças de Big Bags.",
    organizationUnitId: "unit_costura",
    isCritical: true,
    requiredBackupQuantity: 1
  },
  {
    id: "func_expedicao",
    tenantId: "tenant_ubg",
    code: "FN-03",
    name: "Auxiliar de Expedição",
    description: "Paletização, amarração e carregamento de fardos de sacos.",
    organizationUnitId: "unit_expedicao",
    isCritical: false,
    requiredBackupQuantity: 1
  },
  {
    id: "func_empty",
    tenantId: "tenant_ubg",
    code: "FN-EMPTY",
    name: "Função Sem Colaboradores Mapeados",
    description: "Nova função criada no organograma sem pessoal vinculado.",
    organizationUnitId: "unit_adm",
    isCritical: false,
    requiredBackupQuantity: 1
  },

  // Tenant 2 (Dummy)
  {
    id: "func_dummy_op",
    tenantId: "tenant_dummy",
    code: "DMY-01",
    name: "Dummy Operator",
    description: "Dummy operator function",
    organizationUnitId: "unit_dummy_prod",
    isCritical: false,
    requiredBackupQuantity: 1
  }
];

// ============================================================================
// 4. EMPLOYEE ASSIGNMENTS
// ============================================================================
export const DEMO_ASSIGNMENTS: EmployeeAssignment[] = [
  // Tenant 1 (União Bag)
  {
    id: "asg_corte_primary",
    tenantId: "tenant_ubg",
    employeeId: "emp_kaiky",
    organizationUnitId: "unit_corte",
    functionId: "func_corte",
    positionTitle: "Operador Principal de Corte",
    status: "active",
    isPrimary: true,
    startDate: "2026-01-01",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01"
  },
  {
    id: "asg_costura_primary",
    tenantId: "tenant_ubg",
    employeeId: "emp_eliane",
    organizationUnitId: "unit_costura",
    functionId: "func_costura",
    positionTitle: "Costureira Especialista",
    status: "active",
    isPrimary: true,
    startDate: "2026-02-15",
    createdAt: "2026-02-15",
    updatedAt: "2026-02-15"
  },
  {
    id: "asg_adm_primary",
    tenantId: "tenant_ubg",
    employeeId: "emp_silva",
    organizationUnitId: "unit_adm",
    functionId: "func_empty", // mapped as manager of empty function area
    positionTitle: "Gerente Operacional",
    status: "active",
    isPrimary: true,
    startDate: "2025-06-01",
    createdAt: "2025-06-01",
    updatedAt: "2025-06-01"
  },
  {
    id: "asg_exp_primary",
    tenantId: "tenant_ubg",
    employeeId: "emp_roberto",
    organizationUnitId: "unit_expedicao",
    functionId: "func_expedicao",
    positionTitle: "Expeditor Auxiliar",
    status: "active",
    isPrimary: true,
    startDate: "2026-05-10",
    createdAt: "2026-05-10",
    updatedAt: "2026-05-10"
  },

  // Tenant 2 (Dummy)
  {
    id: "asg_dummy_primary",
    tenantId: "tenant_dummy",
    employeeId: "emp_dummy_1",
    organizationUnitId: "unit_dummy_prod",
    functionId: "func_dummy_op",
    positionTitle: "Operator",
    status: "active",
    isPrimary: true,
    startDate: "2026-01-01",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01"
  }
];

// ============================================================================
// 5. CRITICAL FUNCTION ASSESSMENTS
// ============================================================================
export const DEMO_CF_ASSESSMENTS: CriticalFunctionAssessment[] = [
  // Tenant 1 (União Bag)
  {
    id: "cf_asg_corte",
    tenantId: "tenant_ubg",
    functionId: "func_corte",
    gutScore: 125, // 5 x 5 x 5
    vulnerabilityScore: 40,
    classification: Priority.CRITICAL
  },
  {
    id: "cf_asg_costura",
    tenantId: "tenant_ubg",
    functionId: "func_costura",
    gutScore: 64, // 4 x 4 x 4
    vulnerabilityScore: 25,
    classification: Priority.HIGH
  }
];

// ============================================================================
// 6. BACKUP ASSIGNMENTS
// ============================================================================
export const DEMO_BACKUPS: BackupAssignment[] = [
  // Tenant 1 (União Bag)
  {
    id: "bkp_corte_eliane",
    tenantId: "tenant_ubg",
    functionId: "func_corte",
    employeeId: "emp_eliane",
    status: "active" // Validated active backup
  },
  {
    id: "bkp_corte_arthur",
    tenantId: "tenant_ubg",
    functionId: "func_corte",
    employeeId: "emp_arthur",
    status: "in_training" // Backup in training
  }
];

// ============================================================================
// 7. SUCCESSION CANDIDATES
// ============================================================================
export const DEMO_SUCCESSORS: SuccessionCandidate[] = [
  // Tenant 1 (União Bag)
  {
    id: "succ_corte_eliane",
    tenantId: "tenant_ubg",
    functionId: "func_corte",
    employeeId: "emp_eliane",
    readinessScore: 85 // High readiness level
  }
];

// ============================================================================
// 8. TRAINING PROGRAMS
// ============================================================================
export const DEMO_PROGRAMS: TrainingProgram[] = [
  // Tenant 1 (União Bag)
  { id: "prog_corte", tenantId: "tenant_ubg", name: "Formação de Cortador Computadorizado", skillId: "func_corte" },
  { id: "prog_costura", tenantId: "tenant_ubg", name: "Treinamento Costura Industrial Segura", skillId: "func_costura" }
];

// ============================================================================
// 9. OJT PLANS
// ============================================================================
export const DEMO_OJTS: OjtPlan[] = [
  // Tenant 1 (União Bag)
  {
    id: "ojt_kaiky_corte",
    tenantId: "tenant_ubg",
    employeeId: "emp_kaiky",
    skillId: "func_corte",
    status: "completed"
  },
  {
    id: "ojt_eliane_corte",
    tenantId: "tenant_ubg",
    employeeId: "emp_eliane",
    skillId: "func_corte",
    status: "completed"
  },
  {
    id: "ojt_arthur_corte",
    tenantId: "tenant_ubg",
    employeeId: "emp_arthur",
    skillId: "func_corte",
    status: "in_progress"
  }
];

// ============================================================================
// 10. KNOWLEDGE ASSETS
// ============================================================================
export const DEMO_ASSETS: KnowledgeAsset[] = [
  // Tenant 1 (União Bag)
  {
    id: "asset_corte_sop",
    tenantId: "tenant_ubg",
    code: "SOP-01",
    title: "SOP - Calibração e Operação Cortadora Automatizada",
    functionId: "func_corte",
    lastReviewedAt: "2026-05-20"
  }
];

// ============================================================================
// 11. EVIDENCE RECORDS
// ============================================================================
export const DEMO_EVIDENCES: EvidenceRecord[] = [
  // Tenant 1 (União Bag)
  {
    id: "ev_kaiky_corte",
    tenantId: "tenant_ubg",
    employeeId: "emp_kaiky",
    functionId: "func_corte",
    status: EvidenceStatus.VALIDATED,
    evidenceUrl: "https://rjt-compliance.s3.amazonaws.com/evidence-corte-kaiky.pdf",
    uploadedAt: "2026-05-22"
  }
];

// ============================================================================
// 12. VULNERABILITY SNAPSHOTS
// ============================================================================
export const DEMO_SNAPSHOTS: VulnerabilitySnapshot[] = [
  // Tenant 1 (União Bag)
  { id: "snap_corte", tenantId: "tenant_ubg", functionId: "func_corte", score: 28, riskLevel: Priority.LOW }
];

// ============================================================================
// 13. ACTION PLANS
// ============================================================================
export const DEMO_ACTION_PLANS: ActionPlan[] = [
  // Tenant 1 (União Bag)
  {
    id: "ap_01",
    tenantId: "tenant_ubg",
    title: "Resolver GAP de Treinamento Backup Arthur",
    description: "Completar a instrução prática OJT de Arthur na mesa de corte computadorizada.",
    status: ActionStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    ownerEmployeeId: "emp_silva",
    functionId: "func_corte",
    sourceType: "backup_gap",
    sourceRecordId: "bkp_corte_arthur",
    dueDate: "2026-06-30",
    createdAt: "2026-05-01",
    updatedAt: "2026-05-25"
  }
];

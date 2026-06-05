import { 
  Skill, 
  SkillType, 
  Collaborator, 
  MaturityLevel, 
  CompetencyLevel,
  RequiredSkillConfig
} from "../types";

// ============================================================================
// 1. SKILL CATALOG (13 RIGOROUS MANUFACTURING SKILLS)
// ============================================================================
export const UBG_SKILLS: Skill[] = [
  // Corte & Preparação (3 Habilidades)
  {
    id: "SK-CUT-01",
    name: "Parametrização de CLP Starlinger",
    description: "Ajuste eletrônico de parâmetros térmicos, velocidades de avanço e facas pneumáticas no CLP Starlinger.",
    type: SkillType.TECHNICAL
  },
  {
    id: "SK-CUT-02",
    name: "Regulagem de Guilhotinas Térmicas",
    description: "Troca, afiação e calibração fina de lâminas de corte térmico sob a norma de segurança NR-12.",
    type: SkillType.TECHNICAL
  },
  {
    id: "SK-CUT-03",
    name: "Manuseio de Bobinas Pesadas de Ráfia",
    description: "Operação segura no desbobinamento, alinhamento e tracionamento primário de tecidos tubulares.",
    type: SkillType.OPERATIONAL
  },
  
  // Costura & Montagem (3 Habilidades)
  {
    id: "SK-SEW-01",
    name: "Costura Ponto Corrente Duplo",
    description: "Operação de cabeçotes de costura pesada (Newlong/Union Special) com ponto corrente duplo de alta tenacidade.",
    type: SkillType.TECHNICAL
  },
  {
    id: "SK-SEW-02",
    name: "Ancoragem de Alças de Elevação",
    description: "Técnica de fixação e reforço de alças de elevação para garantia de Fator de Segurança 5:1 e 6:1.",
    type: SkillType.TECHNICAL
  },
  {
    id: "SK-SEW-03",
    name: "Tripla Fixação de Corpo de Big Bag",
    description: "Montagem estrutural complexa envolvendo emendas de cantos, inserção de saias de carga e descarga.",
    type: SkillType.OPERATIONAL
  },

  // Garantia da Qualidade (3 Habilidades)
  {
    id: "SK-QLY-01",
    name: "Inspeção Visual e Dimensional ISO 21898",
    description: "Auditoria final dimensional e visual de costuras, dobras e trações em 100% dos lotes acabados.",
    type: SkillType.REGULATORY
  },
  {
    id: "SK-QLY-02",
    name: "Ensaios Destrutivos de Tração Lab",
    description: "Operação de dinamômetros laboratoriais para testes de ruptura de tecidos e resistência de costuras.",
    type: SkillType.REGULATORY
  },
  {
    id: "SK-QLY-03",
    name: "Rastreabilidade de Lotes de Sacaria",
    description: "Codificação, preenchimento de planilhas de rastreabilidade física de PP e emissão de laudos União Bag.",
    type: SkillType.REGULATORY
  },

  // Engenharia de Manutenção (2 Habilidades)
  {
    id: "SK-MNT-01",
    name: "Sincronismo de Cabeçotes de Costura",
    description: "Ajuste mecânico de sincronismo entre agulha e laçador de cabeçotes Union Special industriais.",
    type: SkillType.TECHNICAL
  },
  {
    id: "SK-MNT-02",
    name: "Manutenção Eletropneumática NR-12",
    description: "Diagnóstico e reparo de sistemas pneumáticos de acionamento de facas e teares de ráfia Starlinger.",
    type: SkillType.TECHNICAL
  },

  // Logística & Apoio (2 Habilidades)
  {
    id: "SK-LOG-01",
    name: "Operação de Balança Rodoviária Inmetro",
    description: "Interface com sistemas de pesagem e geração de romaneios alfandegários e fiscais de faturamento.",
    type: SkillType.OPERATIONAL
  },
  {
    id: "SK-LOG-02",
    name: "Movimentação de Cargas por Empilhadeiras",
    description: "Logística física interna, empilhamento de fardos prensados de Big Bags e descarga de PP.",
    type: SkillType.OPERATIONAL
  }
];

// Helper to pre-populate all skills for a collaborator with UNASSESSED status
export function getInitialUnassessedSkills() {
  return UBG_SKILLS.map(skill => ({
    skillId: skill.id,
    proficiencyLevel: CompetencyLevel.UNASSESSED,
    isCertified: false
  }));
}

// ============================================================================
// 2. THE 55 REAL COLLABORATORS OF UNIÃO BAG S/A
// ============================================================================
export const UBG_COLLABORATORS: Collaborator[] = [
  {
    id: "colab_01",
    name: "GUSTAVO DE SALES DA SILVA",
    primaryFunctionId: "UBG-018",
    currentMaturity: MaturityLevel.SENIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_02",
    name: "ANA HELENA BATISTA DE BARROS FERREIRA",
    primaryFunctionId: "UBG-018",
    currentMaturity: MaturityLevel.JUNIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_03",
    name: "ELIANE MARCHESINE NETTO",
    primaryFunctionId: "UBG-015",
    currentMaturity: MaturityLevel.SENIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_04",
    name: "WELINTON NASCIMENTO MOREIRA",
    primaryFunctionId: "UBG-006",
    currentMaturity: MaturityLevel.JUNIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_05",
    name: "ANDREIA APARECIDA VIEIRA",
    primaryFunctionId: "UBG-006",
    currentMaturity: MaturityLevel.JUNIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_06",
    name: "DANIEL SANTANA MARQUES PAIVA",
    primaryFunctionId: "UBG-018",
    currentMaturity: MaturityLevel.JUNIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_07",
    name: "ANDREIA DA SILVA SANTOS",
    primaryFunctionId: "UBG-007",
    currentMaturity: MaturityLevel.JUNIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_08",
    name: "CACILDA DE FATIMA DE SOUZA",
    primaryFunctionId: "UBG-014",
    currentMaturity: MaturityLevel.JUNIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_09",
    name: "ELIENE SILVA DE SANTANA",
    primaryFunctionId: "UBG-013",
    currentMaturity: MaturityLevel.SENIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_10",
    name: "FATIMA MARIA DA SILVA GARCIA",
    primaryFunctionId: "UBG-013",
    currentMaturity: MaturityLevel.SENIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_11",
    name: "LUCIA HELENA ESPITTI FERREIRA",
    primaryFunctionId: "UBG-013",
    currentMaturity: MaturityLevel.SENIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_12",
    name: "MARIA ISABEL DE SOUZA MENDES",
    primaryFunctionId: "UBG-010",
    currentMaturity: MaturityLevel.SENIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_13",
    name: "MARINEIDE DA SILVA",
    primaryFunctionId: "UBG-013",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_14",
    name: "MARLENE GUDERCIO",
    primaryFunctionId: "UBG-013",
    currentMaturity: MaturityLevel.SENIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_15",
    name: "NEUCI ALVES DE BONFIM",
    primaryFunctionId: "UBG-013",
    currentMaturity: MaturityLevel.SENIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_16",
    name: "PATRICIA APARECIDA DE GODOI",
    primaryFunctionId: "UBG-001",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_17",
    name: "ROSA DA SILVA CAMARGO",
    primaryFunctionId: "UBG-013",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_18",
    name: "ROSELI DE SOUZA MELO",
    primaryFunctionId: "UBG-013",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_19",
    name: "SUELI PEREIRA",
    primaryFunctionId: "UBG-013",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_20",
    name: "DANIELE FERNANDA CARVALHO",
    primaryFunctionId: "UBG-005",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_21",
    name: "MARLENE ANITA DA CONCEIÇÃO PAVAN",
    primaryFunctionId: "UBG-013",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_22",
    name: "SANDRA MARIA BATISTA CRIVELARO",
    primaryFunctionId: "UBG-013",
    currentMaturity: MaturityLevel.SENIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_23",
    name: "VITOR ESTEVES PEREIRA",
    primaryFunctionId: "UBG-018",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_24",
    name: "ADRIANA CAETANO DA SILVA",
    primaryFunctionId: "UBG-014",
    currentMaturity: MaturityLevel.JUNIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_25",
    name: "ESLINE JACQUET MASSOLAS",
    primaryFunctionId: "UBG-014",
    currentMaturity: MaturityLevel.JUNIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_26",
    name: "SOLANGE CRISTINA PAULINO",
    primaryFunctionId: "UBG-014",
    currentMaturity: MaturityLevel.JUNIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_27",
    name: "VILMA CERQUEIRA FERREIRA MEDRADO",
    primaryFunctionId: "UBG-014",
    currentMaturity: MaturityLevel.JUNIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_28",
    name: "MIRELLA FOGAÇA ALEXANDRE",
    primaryFunctionId: "UBG-004",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_29",
    name: "VANESSA PEGO SALOMÃO",
    primaryFunctionId: "UBG-014",
    currentMaturity: MaturityLevel.JUNIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_30",
    name: "MARIA DE SOUZA BEZERRA",
    primaryFunctionId: "UBG-014",
    currentMaturity: MaturityLevel.JUNIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_31",
    name: "THAIS GABRIELLY CUSTODIO PEREIRA",
    primaryFunctionId: "UBG-007",
    currentMaturity: MaturityLevel.JUNIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_32",
    name: "GRAZIELLA LORRAINE DE SOUZA DURAN",
    primaryFunctionId: "UBG-014",
    currentMaturity: MaturityLevel.JUNIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_33",
    name: "VANESSA DIAS LEITE",
    primaryFunctionId: "UBG-013",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_34",
    name: "RAQUEL CRISTINA MOTTA TOSO",
    primaryFunctionId: "UBG-002",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_35",
    name: "RODOLFO BARRETO DE ALMEIDA",
    primaryFunctionId: "UBG-002",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_36",
    name: "DAYANE GALHARDONI DE OLIVEIRA",
    primaryFunctionId: "UBG-014",
    currentMaturity: MaturityLevel.JUNIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_37",
    name: "HELDER MARTINS PEREIRA",
    primaryFunctionId: "UBG-017",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_38",
    name: "VAGNER VIEIRA DE JESUS",
    primaryFunctionId: "UBG-003",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_39",
    name: "FELIPE MENDES DA FONSECA",
    primaryFunctionId: "UBG-006",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_40",
    name: "ROSEANA DA SILVA DIAS",
    primaryFunctionId: "UBG-001",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_41",
    name: "REGIANE PEREIRA DOS SANTOS",
    primaryFunctionId: "UBG-002",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_42",
    name: "LUCAS FERNANDO DE SOUZA MENDES",
    primaryFunctionId: "UBG-008",
    currentMaturity: MaturityLevel.SENIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_43",
    name: "DAIANA CRISTINA DE SOUZA",
    primaryFunctionId: "UBG-013",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_44",
    name: "LEONICE KLESSE",
    primaryFunctionId: "UBG-014",
    currentMaturity: MaturityLevel.JUNIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_45",
    name: "MARCIA REGINA DOS SANTOS",
    primaryFunctionId: "UBG-012",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_46",
    name: "FLAVIO SCOMPARIN GOMES",
    primaryFunctionId: "UBG-002",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_47",
    name: "LEONARDO FELIPE PINTO GUEDES",
    primaryFunctionId: "UBG-001",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_48",
    name: "ANDREA DE ARAUJO BERGAMIM",
    primaryFunctionId: "UBG-013",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_49",
    name: "NATANI DE FATIMA AUGUSTO FRANCESCHET",
    primaryFunctionId: "UBG-013",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_50",
    name: "SAMIRES FERREIRA SANTOS CARDOSO",
    primaryFunctionId: "UBG-006",
    currentMaturity: MaturityLevel.JUNIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_51",
    name: "ADRIANA SANTOS PIRES VIEIRA",
    primaryFunctionId: "UBG-013",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_52",
    name: "PATRICIA APARECIDA DE FREITAS MENDES",
    primaryFunctionId: "UBG-012",
    currentMaturity: MaturityLevel.JUNIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_53",
    name: "VALDENE DE FATIMA VINHAES DE MORAIS",
    primaryFunctionId: "UBG-014",
    currentMaturity: MaturityLevel.JUNIOR,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_54",
    name: "PRISCILA BARBOSA FERNANDES",
    primaryFunctionId: "UBG-013",
    currentMaturity: MaturityLevel.PLENO,
    skills: getInitialUnassessedSkills()
  },
  {
    id: "colab_55",
    name: "TAYNARA ALMEIDA SANTOS",
    primaryFunctionId: "UBG-014",
    currentMaturity: MaturityLevel.JUNIOR,
    skills: getInitialUnassessedSkills()
  }
];

// ============================================================================
// 3. SEED REQUIRED SKILLS FOR EACH CRITICAL FUNCTION (AUDIT READY CONFIG)
// ============================================================================
export const UBG_FUNCTION_SKILLS_MAP: Record<string, RequiredSkillConfig[]> = {
  // Abastecedor de Linha
  "UBG-001": [
    { skillId: "SK-CUT-03", requiredProficiencyLevel: CompetencyLevel.INDEPENDENT, isMandatory: true }
  ],
  // Assistente Administrativo
  "UBG-002": [
    { skillId: "SK-QLY-03", requiredProficiencyLevel: CompetencyLevel.INDEPENDENT, isMandatory: true }
  ],
  // Assistente de Compras
  "UBG-003": [
    { skillId: "SK-QLY-03", requiredProficiencyLevel: CompetencyLevel.INDEPENDENT, isMandatory: true }
  ],
  // Analista Financeiro
  "UBG-004": [
    { skillId: "SK-LOG-01", requiredProficiencyLevel: CompetencyLevel.INDEPENDENT, isMandatory: true }
  ],
  // Analista de RH
  "UBG-005": [
    { skillId: "SK-QLY-03", requiredProficiencyLevel: CompetencyLevel.INDEPENDENT, isMandatory: false }
  ],
  // Auxiliar de Corte
  "UBG-006": [
    { skillId: "SK-CUT-03", requiredProficiencyLevel: CompetencyLevel.INDEPENDENT, isMandatory: true }
  ],
  // Auxiliar de Limpeza
  "UBG-007": [],
  // Auxiliar de Manutenção
  "UBG-008": [
    { skillId: "SK-MNT-02", requiredProficiencyLevel: CompetencyLevel.INDEPENDENT, isMandatory: true }
  ],
  // Comprador
  "UBG-009": [
    { skillId: "SK-QLY-03", requiredProficiencyLevel: CompetencyLevel.INDEPENDENT, isMandatory: true }
  ],
  // Coordenador Administrativo
  "UBG-010": [
    { skillId: "SK-QLY-03", requiredProficiencyLevel: CompetencyLevel.INDEPENDENT, isMandatory: true }
  ],
  // Coordenadora de Restaurante
  "UBG-011": [],
  // Cozinheira
  "UBG-012": [],
  // Costureira
  "UBG-013": [
    { skillId: "SK-SEW-01", requiredProficiencyLevel: CompetencyLevel.INDEPENDENT, isMandatory: true },
    { skillId: "SK-SEW-02", requiredProficiencyLevel: CompetencyLevel.INDEPENDENT, isMandatory: true },
    { skillId: "SK-SEW-03", requiredProficiencyLevel: CompetencyLevel.INDEPENDENT, isMandatory: false }
  ],
  // Costureira Júnior
  "UBG-014": [
    { skillId: "SK-SEW-01", requiredProficiencyLevel: CompetencyLevel.INDEPENDENT, isMandatory: true }
  ],
  // Líder de Corte
  "UBG-015": [
    { skillId: "SK-CUT-01", requiredProficiencyLevel: CompetencyLevel.INDEPENDENT, isMandatory: true },
    { skillId: "SK-CUT-02", requiredProficiencyLevel: CompetencyLevel.INDEPENDENT, isMandatory: true }
  ],
  // Líder de Expedição
  "UBG-016": [
    { skillId: "SK-LOG-01", requiredProficiencyLevel: CompetencyLevel.INDEPENDENT, isMandatory: true }
  ],
  // Motorista
  "UBG-017": [
    { skillId: "SK-LOG-02", requiredProficiencyLevel: CompetencyLevel.INDEPENDENT, isMandatory: true }
  ],
  // Operador de Corte / Máquina
  "UBG-018": [
    { skillId: "SK-CUT-01", requiredProficiencyLevel: CompetencyLevel.INDEPENDENT, isMandatory: true },
    { skillId: "SK-CUT-02", requiredProficiencyLevel: CompetencyLevel.INDEPENDENT, isMandatory: true },
    { skillId: "SK-CUT-03", requiredProficiencyLevel: CompetencyLevel.INDEPENDENT, isMandatory: false }
  ]
};

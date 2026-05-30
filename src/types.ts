/**
 * Types and constants for RJT NEXUS PEOPLE
 * Unified Workforce Intelligence & Operational Continuity Platform
 */

export interface FuncaoCritica {
  id: number;
  idFuncao: string; // e.g. FC001
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
  scoreVulnerabilidade: number; // Calculated: D + Prod + Cl + Qual + Penalty(no backup)
  wreIndex: number; // Calculated WRE Risk Stack: (GUT * 0.6) + (Vuln * 0.4)
  classificacaoFinal: "Crítico" | "Alto" | "Médio" | "Baixo"; // Calculated by WRE Index
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
}

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
}

export const SETORES = [
  "Produção – Corte",
  "Produção – Costura",
  "Produção – Apoio",
  "Expedição",
  "Logística / Transporte",
  "Compras",
  "Financeiro",
  "Recursos Humanos",
  "Manutenção",
  "Serviços Gerais",
  "Restaurante Industrial",
  "Gestão Administrativa"
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

// Helper functions for scoring
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
  // Normalize GUT (1-125) to a 100-point scale: (gut / 125) * 100
  const normalizedGUT = Math.round((gut / 125) * 100);
  // Normalize Vulnerability (4-30) to a 100-point scale: ((vuln - 4) / 26) * 100
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

export interface FunctionAlert {
  id: string;
  label: string;
  desc: string;
  severity: "critical" | "warning";
  active: boolean;
}

// Workforce Intelligence Custom Calculators
export function calculateBackupScore(f: FuncaoCritica): number {
  if (f.existeBackup === "NÃO") return 0;
  let score = 0;
  if (f.backup1 && f.backup1 !== "Sem Backup Cadastrado" && f.backup1.trim() !== "" && !f.backup1.toLowerCase().includes("nenhum")) {
    score += 50;
  }
  if (f.backup2 && f.backup2 !== "Sem Backup Cadastrado" && f.backup2.trim() !== "" && !f.backup2.toLowerCase().includes("nenhum") && !f.backup2.toLowerCase().includes("sem backup")) {
    score += 50;
  }
  if (f.existeBackup === "SIM" && score === 0) {
    score = 50; // Safely fall back if marked SIM but names are generic
  }
  return score;
}

export function calculateCoverageScore(f: FuncaoCritica): number {
  const base = f.existeBackup === "NÃO" ? 30 : (f.quantidadePessoasAptas >= 3 ? 100 : (f.quantidadePessoasAptas === 2 ? 70 : 30));
  return base;
}

export function calculateTrainingScore(f: FuncaoCritica, acoes: ActionPlan[]): number {
  let score = 0;
  if (f.nivelPolivalencia === 1) score = 25;
  else if (f.nivelPolivalencia === 2) score = 50;
  else if (f.nivelPolivalencia === 3) score = 75;
  else if (f.nivelPolivalencia === 4) score = 100;
  
  // Deduct 15% for each open training action plan linked to this function
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

export function getFunctionAlerts(f: FuncaoCritica, acoes: ActionPlan[]): FunctionAlert[] {
  const alerts: FunctionAlert[] = [];
  
  // 1. Missing backup
  const hasNoBackup = f.existeBackup === "NÃO" || calculateBackupScore(f) === 0;
  alerts.push({
    id: "missing_backup",
    label: "Sem Backup Habilitado",
    desc: "Nenhum operador substituto ativo foi cadastrado para cobrir ausências.",
    severity: "critical",
    active: hasNoBackup
  });
  
  // 2. Low coverage
  const coverage = calculateCoverageScore(f);
  alerts.push({
    id: "low_coverage",
    label: "Baixa Cobertura de Equipe",
    desc: "Menos de 2 pessoas aptas na linha operacional. Risco de parada elevado.",
    severity: "critical",
    active: coverage < 50 || f.quantidadePessoasAptas < 2
  });
  
  // 3. Missing skills
  alerts.push({
    id: "missing_skills",
    label: "Competência em Desenvolvimento",
    desc: "O operador principal possui nível de polivalência menor que o ideal (Grau 3 - Autônomo).",
    severity: "warning",
    active: f.nivelPolivalencia < 3
  });
  
  // 4. Long recovery time
  const formatTime = f.tempoEstimadoFormacao.toLowerCase();
  const isLongRecovery = formatTime.includes("6") || formatTime.includes("8") || formatTime.includes("12") || formatTime.includes("ano") || formatTime.includes("semestre");
  alerts.push({
    id: "long_recovery",
    label: "Longo Tempo de Capacitação",
    desc: "Tempo de formação estimado é igual ou superior a 6 meses. Sucessão lenta.",
    severity: "warning",
    active: isLongRecovery
  });
  
  // 5. Open critical actions
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

// Default pre-populated seed data with real União Bag S/A departments and functions
export const INITIAL_FUNCOES: FuncaoCritica[] = [
  {
    id: 1,
    idFuncao: "FC001",
    setor: "Produção – Corte",
    processo: "Corte de Filme Tubular e Ráfia",
    funcaoCritica: "Operador de Corte I",
    atividadeTecnicaCritica: "Calibração e ajuste fino das lâminas de guilhotina e corte pneumático de alta precisão para big bags.",
    colaboradorPrincipal: "Alessandro Ribeiro",
    backup1: "Auxiliar de Corte - João Silva",
    backup2: "Sem Backup Cadastrado",
    existeBackup: "SIM",
    quantidadePessoasAptas: 2,
    nivelPolivalencia: 3,
    grauDependenciaTecnica: 5,
    tempoEstimadoFormacao: "6 meses",
    complexidadeTecnica: "Alta",
    impactoProducao: 5,
    impactoCliente: 5,
    impactoQualidade: 4,
    gravidade: 5,
    urgencia: 5,
    tendencia: 5,
    scoreGUT: 125,
    scoreVulnerabilidade: 19, // 5+5+5+4 + 0
    wreIndex: 83, // GUT Normalized (100% * 0.6) + Vuln Normalized (58% * 0.4) = 60 + 23 = 83
    classificacaoFinal: "Crítico",
    necessidadeIT: "Instrução Operacional de Regulagem de Guilhotina I.O-COR-01",
    necessidadeTreinamento: "Treinamento de calibração eletrônica e segurança em guilhotinas",
    necessidadeSucessao: "Formação acelerada do auxiliar de corte júnior",
    requisitoISO: "7.2",
    evidenciaNecessaria: "Testes práticos de corte e ficha de polivalência técnica",
    codigoDocumentoUBG: "UBG-IT-COR-101",
    acaoPDCARelacionada: "PDCA-CORTE-2026-001",
    responsavel: "Eng. Cláudio Santos (SGQ)",
    prazo: "2026-06-15",
    status: "Em Execução"
  },
  {
    id: 2,
    idFuncao: "FC002",
    setor: "Produção – Costura",
    processo: "Costura Guia e Reforço de Alças",
    funcaoCritica: "Costureira",
    atividadeTecnicaCritica: "Costura de alças com ponto corrente duplo de alta tenacidade e ancoragem em fator de segurança 5:1.",
    colaboradorPrincipal: "Maria Helena",
    backup1: "Costureira Júnior - Regina Santos",
    backup2: "Sem Backup Cadastrado",
    existeBackup: "SIM",
    quantidadePessoasAptas: 2,
    nivelPolivalencia: 4,
    grauDependenciaTecnica: 4,
    tempoEstimadoFormacao: "4 meses",
    complexidadeTecnica: "Alta",
    impactoProducao: 5,
    impactoCliente: 5,
    impactoQualidade: 5,
    gravidade: 5,
    urgencia: 4,
    tendencia: 4,
    scoreGUT: 80,
    scoreVulnerabilidade: 19, // 4+5+5+5 + 0
    wreIndex: 61, // GUT Normalized (64% * 0.6) + Vuln Normalized (58% * 0.4) = 38 + 23 = 61
    classificacaoFinal: "Alto",
    necessidadeIT: "Instrução de Trabalho de Costura de Alças de Elevação",
    necessidadeTreinamento: "Treinamento em ergonomia e costura de alta tração de ráfia",
    necessidadeSucessao: "Capacitar Costureira Júnior para tripla fixação",
    requisitoISO: "8.5",
    evidenciaNecessaria: "Ensaio destrutivo de tração e folha de presença de treinamento prático",
    codigoDocumentoUBG: "UBG-IT-COS-203",
    acaoPDCARelacionada: "PDCA-RH-COMPET-302",
    responsavel: "Supervisora de Produção Marcos Paulo",
    prazo: "2026-07-28",
    status: "Planejado"
  },
  {
    id: 3,
    idFuncao: "FC003",
    setor: "Expedição",
    processo: "Liberação de Lotes e Faturamento",
    funcaoCritica: "Líder de Expedição",
    atividadeTecnicaCritica: "Interface operacional de expedição física e validação de peso de lotes industriais sob a ISO 21898.",
    colaboradorPrincipal: "Jonathan Barros",
    backup1: "Abastecedor de Linha - Roberto Silva",
    backup2: "Sem Backup Cadastrado",
    existeBackup: "SIM",
    quantidadePessoasAptas: 2,
    nivelPolivalencia: 3,
    grauDependenciaTecnica: 3,
    tempoEstimadoFormacao: "3 meses",
    complexidadeTecnica: "Média",
    impactoProducao: 4,
    impactoCliente: 5,
    impactoQualidade: 4,
    gravidade: 4,
    urgencia: 4,
    tendencia: 4,
    scoreGUT: 64,
    scoreVulnerabilidade: 16, // 3+4+5+4 + 0
    wreIndex: 49, // GUT (51% * 0.6) + Vuln (46% * 0.4) = 31 + 18 = 49
    classificacaoFinal: "Alto",
    necessidadeIT: "Procedimento de Pesagem e Liberação de Big Bags",
    necessidadeTreinamento: "Operação de balanças industriais e calibração de células de carga",
    necessidadeSucessao: "Treinamento intensivo do abastecedor de linha",
    requisitoISO: "7.1.6",
    evidenciaNecessaria: "Ficha de inspeção e etiqueta de faturamento assinada",
    codigoDocumentoUBG: "UBG-EXP-IT-008",
    acaoPDCARelacionada: "PDCA-EXP-ISO-12",
    responsavel: "Karina Mendes (SGQ)",
    prazo: "2026-05-30",
    status: "Concluído"
  },
  {
    id: 4,
    idFuncao: "FC004",
    setor: "Manutenção",
    processo: "Eletromecânica de Teares Circulares",
    funcaoCritica: "Auxiliar de Manutenção",
    atividadeTecnicaCritica: "Manutenção de primeiro nível, lubrificação de guias de lançadeira e troca preventiva de pinças Starlinger.",
    colaboradorPrincipal: "Edmilson Bento",
    backup1: "Nenhum habilitado para Starlinger",
    backup2: "Sem Backup Cadastrado",
    existeBackup: "NÃO",
    quantidadePessoasAptas: 1,
    nivelPolivalencia: 3,
    grauDependenciaTecnica: 5,
    tempoEstimadoFormacao: "12 meses",
    complexidadeTecnica: "Alta",
    impactoProducao: 5,
    impactoCliente: 4,
    impactoQualidade: 4,
    gravidade: 5,
    urgencia: 5,
    tendencia: 5,
    scoreGUT: 125,
    scoreVulnerabilidade: 28, // 5+5+4+4 + 10
    wreIndex: 97, // GUT (100% * 0.6) + Vuln (92% * 0.4) = 60 + 37 = 97
    classificacaoFinal: "Crítico",
    necessidadeIT: "Plano de Manutenção Periódica de Teares de Ráfia",
    necessidadeTreinamento: "Curso avançado de sincronismo eletropneumático de teares",
    necessidadeSucessao: "Contratar técnico de sobreaviso externo Starlinger",
    requisitoISO: "8.1",
    evidenciaNecessaria: "Ordem de serviço preventiva finalizada pelo SGQ",
    codigoDocumentoUBG: "UBG-MP-TEAR-03",
    acaoPDCARelacionada: "PDCA-MANUT-COMP-55",
    responsavel: "Diretoria Industrial / RH",
    prazo: "2026-08-10",
    status: "Planejado"
  },
  {
    id: 5,
    idFuncao: "FC005",
    setor: "Compras",
    processo: "Aquisição de Insumos Críticos",
    funcaoCritica: "Comprador",
    atividadeTecnicaCritica: "Negociação de aditivos poliméricos especiais, fios de poliéster e polipropileno sob especificações da ISO 9001.",
    colaboradorPrincipal: "Jonathan Santos",
    backup1: "Assistente de Compras - Roberta Lima",
    backup2: "Sem Backup Cadastrado",
    existeBackup: "SIM",
    quantidadePessoasAptas: 2,
    nivelPolivalencia: 2,
    grauDependenciaTecnica: 3,
    tempoEstimadoFormacao: "3 meses",
    complexidadeTecnica: "Média",
    impactoProducao: 4,
    impactoCliente: 3,
    impactoQualidade: 4,
    gravidade: 3,
    urgencia: 3,
    tendencia: 3,
    scoreGUT: 27,
    scoreVulnerabilidade: 14, // 3+4+3+4 + 0
    wreIndex: 28, // GUT (21% * 0.6) + Vuln (38% * 0.4) = 13 + 15 = 28
    classificacaoFinal: "Médio",
    necessidadeIT: "Critérios de Qualificação de Fornecedores de PP UBG-COM-01",
    necessidadeTreinamento: "Avaliação técnica de fichas de segurança química e reologia",
    necessidadeSucessao: "Co-participação com o assistente de compras",
    requisitoISO: "8.4",
    evidenciaNecessaria: "Relatório de Qualificação de Fornecedor cadastrado no SGQ",
    codigoDocumentoUBG: "UBG-IT-COM-08",
    acaoPDCARelacionada: "Nenhuma",
    responsavel: "Líder Adalto Ferreira",
    prazo: "2026-09-01",
    status: "Planejado"
  }
];

export const INITIAL_ACTIONS: ActionPlan[] = [
  {
    id: 1,
    funcaoCriticaId: 1,
    funcaoCriticaCodigo: "FC001",
    funcaoCriticaNome: "Operador de Corte I",
    descricaoAcao: "Ministrar treinamento prático sênior sobre reologia e resfriamento de matriz para João Silva ser backup pleno.",
    tipoAcao: "Treinamento",
    responsavel: "Dr. Roberto Albuquerque (Consultor Técnico UBG)",
    dataInicio: "2026-05-10",
    dataPrazo: "2026-06-12",
    status: "Em Execução",
    acaoPDCA: "D",
    observacoes: "João já concluiu a parte teórica online, agora necessita das horas supervisionadas de partida de máquina."
  },
  {
    id: 2,
    funcaoCriticaId: 2,
    funcaoCriticaCodigo: "FC002",
    funcaoCriticaNome: "Costureira",
    descricaoAcao: "Revisar instruções de trabalho (IT-COS) detalhando a técnica de tripla fixação e homologação de bags sob norma ISO 21898.",
    tipoAcao: "Documentação",
    responsavel: "Regina Santos (Qualidade)",
    dataInicio: "2026-05-20",
    dataPrazo: "2026-06-25",
    status: "Planejado",
    acaoPDCA: "P",
    observacoes: "Documentação servirá de base regulatória indispensável para o próximo concurso interno de costureiras."
  },
  {
    id: 3,
    funcaoCriticaId: 4,
    funcaoCriticaCodigo: "FC004",
    funcaoCriticaNome: "Auxiliar de Manutenção",
    descricaoAcao: "Firmar convênio institucional com a Starlinger do Brasil para capacitação periódica e fornecimento de manuais digitais urgentes.",
    tipoAcao: "Sucessão",
    responsavel: "Patricia Giffoni (RH / Gestão de Pessoas)",
    dataInicio: "2026-05-15",
    dataPrazo: "2026-07-10",
    status: "Em Execução",
    acaoPDCA: "D",
    observacoes: "Contrato em análise no departamento jurídico para repasse de bolsas de estudo técnicas."
  }
];

export const INITIAL_EVIDENCES: ISOEvidence[] = [
  {
    id: 1,
    requisitoISO: "7.2",
    descricaoRequisito: "Competência: assegurar que pessoas sob seu controle sejam competentes com base em educação, treinamento ou experiência.",
    evidenciaNecessaria: "Testes teóricos de ajuste de espessura de matriz plana e ficha técnica de polidominância de reologia.",
    codigoDocumentoUBG: "UBG-IT-COR-101",
    descricaoDocumento: "Instrução de Trabalho Completa de Calibração Térmica e de Regulagem de Guilhotinas.",
    status: "Em Análise",
    dataColeta: "2026-05-28",
    responsavelColeta: "Cláudio Santos (SGQ)"
  },
  {
    id: 2,
    requisitoISO: "8.5",
    descricaoRequisito: "Produção e Provisão de Serviço: controle nas operações de produção com liberação rigorosa, monitoramento e medição.",
    evidenciaNecessaria: "Ensaio e laudo destrutivo de cisalhamento em costura em bags fator de segurança 5:1.",
    codigoDocumentoUBG: "UBG-IT-COS-203",
    descricaoDocumento: "Relatório Mensal de Ensaio de Tração de Alças União Bag.",
    status: "Validada",
    dataColeta: "2026-05-25",
    responsavelColeta: "Tiago Nogueira (Analista Lab)"
  },
  {
    id: 3,
    requisitoISO: "7.1.6",
    descricaoRequisito: "Conhecimento Organizacional: determinar o conhecimento necessário para a operação de seus processos e conformidade.",
    evidenciaNecessaria: "Matriz de polivalência atualizada de todos os técnicos e backups por linha de produção.",
    codigoDocumentoUBG: "UBG-RH-POL-001",
    descricaoDocumento: "Mapeamento e Matriz Geral de Polivalência do Chão de Fábrica União Bag 2026.",
    status: "Validada",
    dataColeta: "2026-05-18",
    responsavelColeta: "Karina Mendes (SGQ)"
  }
];

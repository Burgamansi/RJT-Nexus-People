export interface PeopleFeature {
  id: string;
  title: string;
  description: string;
  route: string;
  status: "ativo" | "modernizado" | "estavel" | "piloto";
  category: "Estrutura da Forca de Trabalho" | "Competencia e Cobertura" | "Risco e Conformidade";
  businessPurpose: string;
}

export const peopleFeatureRegistry: PeopleFeature[] = [
  {
    id: "workforce-map",
    title: "Mapa da Forca de Trabalho",
    description: "Gerencie estrutura operacional, setores, funcoes e alocacoes de pessoas com isolamento por tenant.",
    route: "/workforce-map",
    status: "modernizado",
    category: "Estrutura da Forca de Trabalho",
    businessPurpose: "Manter uma base organizacional precisa para operacao SaaS multiempresa."
  },
  {
    id: "critical-functions",
    title: "Funcoes Criticas",
    description: "Identifique e avalie funcoes criticas usando Score GxUxT, criticidade e exposicao operacional.",
    route: "/critical-functions",
    status: "modernizado",
    category: "Estrutura da Forca de Trabalho",
    businessPurpose: "Reduzir riscos de continuidade em pontos operacionais sensiveis."
  },
  {
    id: "polyvalence-matrix",
    title: "Matriz de Polivalencia",
    description: "Mapeie titulares, backups e niveis de qualificacao por pessoa e funcao.",
    route: "/polyvalence-matrix",
    status: "modernizado",
    category: "Competencia e Cobertura",
    businessPurpose: "Acompanhar cobertura operacional e polivalencia da equipe."
  },
  {
    id: "backup-succession",
    title: "Backup e Sucessao",
    description: "Analise lacunas de backup, sucessores preparados e riscos de continuidade.",
    route: "/backup-succession",
    status: "modernizado",
    category: "Competencia e Cobertura",
    businessPurpose: "Eliminar funcoes sem cobertura por meio de pipelines estruturados."
  },
  {
    id: "training-ojt",
    title: "Treinamento e OJT",
    description: "Monitore treinamentos teoricos, validacao pratica OJT e evidencias de competencia.",
    route: "/training-ojt",
    status: "modernizado",
    category: "Competencia e Cobertura",
    businessPurpose: "Garantir competencia operacional alinhada ao SGQ e a ISO 9001."
  },
  {
    id: "knowledge-hub",
    title: "Base de Conhecimento",
    description: "Acompanhe documentos, historico de revisao e ativos de conhecimento tecnico.",
    route: "/knowledge-hub",
    status: "modernizado",
    category: "Risco e Conformidade",
    businessPurpose: "Prevenir perda de conhecimento critico com revisoes documentadas."
  },
  {
    id: "evidence-center",
    title: "Central de Evidencias",
    description: "Valide evidencias objetivas, vencimentos e prontidao para auditoria.",
    route: "/evidence-center",
    status: "modernizado",
    category: "Risco e Conformidade",
    businessPurpose: "Oferecer rastreabilidade pronta para auditorias e controles do SGQ."
  },
  {
    id: "vulnerability-analytics",
    title: "Analise de Vulnerabilidade",
    description: "Consolide indices de vulnerabilidade e tendencias de risco por lacuna operacional.",
    route: "/vulnerability-analytics",
    status: "modernizado",
    category: "Risco e Conformidade",
    businessPurpose: "Apoiar decisoes preventivas com indicadores objetivos de risco."
  },
  {
    id: "action-plans",
    title: "Planos de Acao",
    description: "Acompanhe acoes corretivas e preventivas ligadas a gaps de competencia e continuidade.",
    route: "/action-plans",
    status: "modernizado",
    category: "Risco e Conformidade",
    businessPurpose: "Resolver desvios com fluxo PDCA rastreavel e evidencia objetiva."
  }
];

/**
 * Serviço de Geração Automática da Matriz de Polivalência
 * Gera automaticamente a matriz a partir do CATALOGO_MESTRE
 */

import * as XLSX from 'xlsx';

export interface CriticalFunction {
  idFuncao: string;
  funcaoCritica: string;
  setor: string;
  processo: string;
  gravidade: number;
  urgencia: number;
  tendencia: number;
  scoreGUT: number;
  criticidade: string;
  backupMinimo: number;
}

export interface Collaborator {
  id: string;
  nome: string;
  setor: string;
  processo: string;
  nivel: 0 | 1 | 2 | 3;
  processoCritico: boolean;
  aptoOperar: boolean;
  dataAvaliacao: string;
  validadeCompetencia: string;
  avaliador: string;
}

export interface PolyvalenceMatrix {
  id: string;
  colaborador: string;
  setor: string;
  processo: string;
  nivel: 0 | 1 | 2 | 3;
  processoCritico: boolean;
  aptoOperar: boolean;
  dataAvaliacao: string;
  validadeCompetencia: string;
  avaliador: string;
  criticidade?: string;
  scoreGUT?: number;
}

/**
 * Extrai funções críticas do CATALOGO_MESTRE
 */
export function extractCriticalFunctions(workbook: XLSX.WorkBook): CriticalFunction[] {
  const ws = workbook.Sheets['CATALOGO_MESTRE'];
  if (!ws) return [];

  const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
  const functions: CriticalFunction[] = [];

  // Encontrar linha de cabeçalho (linha 5 no Excel)
  let headerRow = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === 'ID da Função' || data[i][0] === 'idFuncao') {
      headerRow = i;
      break;
    }
  }

  if (headerRow === -1) return [];

  // Processar dados
  for (let i = headerRow + 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0] || !row[1]) continue; // Pular linhas vazias

    const criticidade = row[8]?.toString() || '';
    
    // Apenas funções críticas (Gravíssimo, Grande)
    if (criticidade.includes('Gravíssimo') || criticidade.includes('Grande')) {
      functions.push({
        idFuncao: row[0]?.toString() || '',
        funcaoCritica: row[1]?.toString() || '',
        setor: row[2]?.toString() || '',
        processo: row[3]?.toString() || '',
        gravidade: parseInt(row[4]?.toString()) || 0,
        urgencia: parseInt(row[5]?.toString()) || 0,
        tendencia: parseInt(row[6]?.toString()) || 0,
        scoreGUT: parseInt(row[7]?.toString()) || 0,
        criticidade: criticidade,
        backupMinimo: parseInt(row[9]?.toString()) || 1,
      });
    }
  }

  return functions;
}

/**
 * Gera matriz de polivalência a partir de funções críticas e colaboradores
 */
export function generatePolyvalenceMatrix(
  criticalFunctions: CriticalFunction[],
  collaborators: Collaborator[]
): PolyvalenceMatrix[] {
  const matrix: PolyvalenceMatrix[] = [];

  // Para cada função crítica
  for (const func of criticalFunctions) {
    // Encontrar colaboradores que trabalham neste processo
    const relatedCollaborators = collaborators.filter(
      (c) => c.processo === func.processo || c.setor === func.setor
    );

    // Se não há colaboradores, criar entrada vazia
    if (relatedCollaborators.length === 0) {
      matrix.push({
        id: `${func.idFuncao}-empty`,
        colaborador: 'SEM COLABORADOR MAPEADO',
        setor: func.setor,
        processo: func.processo,
        nivel: 0,
        processoCritico: true,
        aptoOperar: false,
        dataAvaliacao: new Date().toISOString().split('T')[0],
        validadeCompetencia: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        avaliador: 'Sistema',
        criticidade: func.criticidade,
        scoreGUT: func.scoreGUT,
      });
    } else {
      // Adicionar cada colaborador à matriz
      for (const collab of relatedCollaborators) {
        matrix.push({
          id: `${func.idFuncao}-${collab.id}`,
          colaborador: collab.nome,
          setor: collab.setor,
          processo: func.processo,
          nivel: collab.nivel,
          processoCritico: true,
          aptoOperar: collab.nivel >= 2, // Nível 2+ é apto
          dataAvaliacao: collab.dataAvaliacao || new Date().toISOString().split('T')[0],
          validadeCompetencia: collab.validadeCompetencia || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          avaliador: collab.avaliador || 'Gestor',
          criticidade: func.criticidade,
          scoreGUT: func.scoreGUT,
        });
      }
    }
  }

  return matrix;
}

/**
 * Exporta matriz de polivalência para Excel
 */
export function exportPolyvalenceMatrixToExcel(
  matrix: PolyvalenceMatrix[],
  filename: string = 'Matriz_Polivalencia_Gerada.xlsx'
): void {
  // Preparar dados
  const data = matrix.map((item, index) => ({
    'Nº': index + 1,
    'Colaborador': item.colaborador,
    'Setor': item.setor,
    'Processo': item.processo,
    'Nível (0-3)': item.nivel,
    'Processo Crítico': item.processoCritico ? 'Sim' : 'Não',
    'Apto Operar?': item.aptoOperar ? 'Sim' : 'Não',
    'Data Última Avaliação': item.dataAvaliacao,
    'Validade da Competência': item.validadeCompetencia,
    'Avaliador': item.avaliador,
    'Criticidade (G.U.T)': item.criticidade,
    'Score G×U×T': item.scoreGUT,
  }));

  // Criar workbook
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'MATRIZ_POLIVALENCIA');

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 5 },   // Nº
    { wch: 25 },  // Colaborador
    { wch: 20 },  // Setor
    { wch: 30 },  // Processo
    { wch: 12 },  // Nível
    { wch: 15 },  // Processo Crítico
    { wch: 15 },  // Apto Operar
    { wch: 18 },  // Data Avaliação
    { wch: 20 },  // Validade
    { wch: 15 },  // Avaliador
    { wch: 18 },  // Criticidade
    { wch: 12 },  // Score
  ];
  ws['!cols'] = colWidths;

  // Salvar
  XLSX.writeFile(wb, filename);
}

/**
 * Calcula índices de polivalência
 */
export function calculatePolyvalenceIndices(matrix: PolyvalenceMatrix[]) {
  const totalEntries = matrix.length;
  const aptosLevel2Plus = matrix.filter((m) => m.nivel >= 2).length;
  const aptos = matrix.filter((m) => m.aptoOperar).length;
  const bloqueados = matrix.filter((m) => m.nivel === 0).length;

  return {
    totalEntries,
    aptosLevel2Plus,
    percentualAptos: totalEntries > 0 ? (aptos / totalEntries) * 100 : 0,
    percentualBloqueados: totalEntries > 0 ? (bloqueados / totalEntries) * 100 : 0,
    indicePolivalencia: totalEntries > 0 ? (aptosLevel2Plus / totalEntries) : 0,
  };
}

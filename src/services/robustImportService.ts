/**
 * Serviço Robusto de Importação - RJT NEXUS PEOPLE
 * Detecta automaticamente cabeçalho e importa dados com validação completa
 */

import * as XLSX from 'xlsx';

export interface ImportedFunction {
  idFuncao: string;
  nomeFuncao: string;
  setor: string;
  processo: string;
  gravidade: string;
  urgencia: string;
  tendencia: string;
  scoreGUT: number;
  criticidade: string;
  tempoTreinamento: string;
  qtdBackupRecomendada: number;
  descricao: string;
  responsabilidades: string;
  competencias: string;
  justificativa: string;
  nivelCompetencia: string;
  requisitoBackup: string;
  impactoSGQ: string;
  clausulaISO: string;
  status: string;
}

export interface ImportValidationResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: string[];
  warnings: string[];
  data: ImportedFunction[];
  stats: {
    totalFunctions: number;
    sectors: number;
    processes: number;
    criticalFunctions: number;
    totalBackupsRecommended: number;
    functionsByStatus: Record<string, number>;
    functionsByCriticality: Record<string, number>;
  };
}

/**
 * Detecta automaticamente a linha de cabeçalho
 */
export function detectHeaderRow(workbook: XLSX.WorkBook, sheetName: string = 'CATALOGO_MESTRE'): number {
  const ws = workbook.Sheets[sheetName];
  if (!ws) throw new Error(`Planilha "${sheetName}" não encontrada`);

  const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
  
  // Procurar pela linha com "ID da Função"
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i];
    if (row && row.some((cell: any) => String(cell).includes('ID da Função'))) {
      return i;
    }
  }
  
  throw new Error('Cabeçalho não encontrado. Procure por "ID da Função"');
}

/**
 * Normaliza nomes de colunas
 */
function normalizeColumnName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/\s+/g, '_');
}

/**
 * Mapeia colunas da planilha para campos do sistema
 */
function mapColumns(headers: string[]): Record<string, number> {
  const mapping: Record<string, number> = {};
  
  const fieldMappings: Record<string, string[]> = {
    idFuncao: ['id da função', 'id_funcao', 'id'],
    nomeFuncao: ['nome da função', 'nome_funcao', 'nome', 'function name'],
    setor: ['setor', 'sector', 'departamento'],
    processo: ['processo', 'process', 'processamento'],
    gravidade: ['gravidade', 'severity', 'g'],
    urgencia: ['urgência', 'urgencia', 'urgency', 'u'],
    tendencia: ['tendência', 'tendencia', 'trend', 't'],
    scoreGUT: ['score g×u×t', 'score gut', 'score', 'gut'],
    criticidade: ['criticidade g.u.t', 'criticidade', 'criticality'],
    tempoTreinamento: ['tempo de treinamento', 'tempo_treinamento', 'training time'],
    qtdBackupRecomendada: ['qtd. de backup recomendada', 'qtd_backup', 'backup recommended'],
    descricao: ['descrição da função', 'descricao', 'description'],
    responsabilidades: ['principais responsabilidades', 'responsabilidades', 'responsibilities'],
    competencias: ['competências requeridas', 'competencias', 'competencies'],
    justificativa: ['justificativa da criticidade', 'justificativa', 'justification'],
    nivelCompetencia: ['nível de competência requerido', 'nivel_competencia', 'competency level'],
    requisitoBackup: ['requisito de backup', 'requisito_backup', 'backup requirement'],
    impactoSGQ: ['impacto no sgq', 'impacto_sgq', 'impact'],
    clausulaISO: ['cláusula iso 9001', 'clausula_iso', 'iso clause'],
    status: ['status', 'situação'],
  };

  for (const [field, aliases] of Object.entries(fieldMappings)) {
    for (let i = 0; i < headers.length; i++) {
      const normalized = normalizeColumnName(headers[i]);
      if (aliases.some(alias => normalized.includes(alias))) {
        mapping[field] = i;
        break;
      }
    }
  }

  return mapping;
}

/**
 * Valida e importa dados da planilha
 */
export function validateAndImportData(workbook: XLSX.WorkBook): ImportValidationResult {
  const result: ImportValidationResult = {
    success: true,
    totalRows: 0,
    validRows: 0,
    invalidRows: 0,
    errors: [],
    warnings: [],
    data: [],
    stats: {
      totalFunctions: 0,
      sectors: new Set<string>().size,
      processes: new Set<string>().size,
      criticalFunctions: 0,
      totalBackupsRecommended: 0,
      functionsByStatus: {},
      functionsByCriticality: {},
    },
  };

  try {
    // Detectar cabeçalho
    const headerRowIndex = detectHeaderRow(workbook);
    const ws = workbook.Sheets['CATALOGO_MESTRE'];
    
    // Ler dados com cabeçalho correto
    const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
    const headers = rawData[headerRowIndex] as string[];
    const columnMapping = mapColumns(headers);

    // Validar que encontrou colunas essenciais
    const essentialFields = ['idFuncao', 'nomeFuncao', 'setor', 'processo'];
    for (const field of essentialFields) {
      if (!(field in columnMapping)) {
        result.errors.push(`Coluna essencial não encontrada: ${field}`);
        result.success = false;
        return result;
      }
    }

    // Processar dados
    const sectors = new Set<string>();
    const processes = new Set<string>();
    const criticalities: Record<string, number> = {};
    const statuses: Record<string, number> = {};

    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || !row[columnMapping.idFuncao]) continue; // Pular linhas vazias

      result.totalRows++;

      try {
        const func: ImportedFunction = {
          idFuncao: String(row[columnMapping.idFuncao] || '').trim(),
          nomeFuncao: String(row[columnMapping.nomeFuncao] || '').trim(),
          setor: String(row[columnMapping.setor] || '').trim(),
          processo: String(row[columnMapping.processo] || '').trim(),
          gravidade: String(row[columnMapping.gravidade] || '').trim(),
          urgencia: String(row[columnMapping.urgencia] || '').trim(),
          tendencia: String(row[columnMapping.tendencia] || '').trim(),
          scoreGUT: parseInt(String(row[columnMapping.scoreGUT] || '0')) || 0,
          criticidade: String(row[columnMapping.criticidade] || '').trim(),
          tempoTreinamento: String(row[columnMapping.tempoTreinamento] || '').trim(),
          qtdBackupRecomendada: parseInt(String(row[columnMapping.qtdBackupRecomendada] || '0')) || 0,
          descricao: String(row[columnMapping.descricao] || '').trim(),
          responsabilidades: String(row[columnMapping.responsabilidades] || '').trim(),
          competencias: String(row[columnMapping.competencias] || '').trim(),
          justificativa: String(row[columnMapping.justificativa] || '').trim(),
          nivelCompetencia: String(row[columnMapping.nivelCompetencia] || '').trim(),
          requisitoBackup: String(row[columnMapping.requisitoBackup] || '').trim(),
          impactoSGQ: String(row[columnMapping.impactoSGQ] || '').trim(),
          clausulaISO: String(row[columnMapping.clausulaISO] || '').trim(),
          status: String(row[columnMapping.status] || 'Ativo').trim(),
        };

        // Validações
        if (!func.idFuncao) {
          result.invalidRows++;
          result.warnings.push(`Linha ${i}: ID da Função vazio`);
          continue;
        }

        if (!func.nomeFuncao) {
          result.invalidRows++;
          result.warnings.push(`Linha ${i}: Nome da Função vazio`);
          continue;
        }

        // Coletar estatísticas
        sectors.add(func.setor);
        processes.add(func.processo);
        criticalities[func.criticidade] = (criticalities[func.criticidade] || 0) + 1;
        statuses[func.status] = (statuses[func.status] || 0) + 1;

        if (func.criticidade === 'Crítica') {
          result.stats.criticalFunctions++;
        }

        result.stats.totalBackupsRecommended += func.qtdBackupRecomendada;

        result.data.push(func);
        result.validRows++;
      } catch (error) {
        result.invalidRows++;
        result.warnings.push(`Linha ${i}: Erro ao processar - ${String(error)}`);
      }
    }

    // Atualizar estatísticas finais
    result.stats.totalFunctions = result.validRows;
    result.stats.sectors = sectors.size;
    result.stats.processes = processes.size;
    result.stats.functionsByCriticality = criticalities;
    result.stats.functionsByStatus = statuses;

    if (result.validRows === 0) {
      result.success = false;
      result.errors.push('Nenhuma função válida foi importada');
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Erro geral de importação: ${String(error)}`);
  }

  return result;
}

/**
 * Exporta resultado de validação para relatório
 */
export function generateImportReport(result: ImportValidationResult): string {
  const lines: string[] = [
    '=== RELATÓRIO DE IMPORTAÇÃO ===',
    '',
    `Status: ${result.success ? '✅ SUCESSO' : '❌ ERRO'}`,
    `Data: ${new Date().toLocaleString('pt-BR')}`,
    '',
    '--- RESUMO ---',
    `Total de linhas processadas: ${result.totalRows}`,
    `Linhas válidas: ${result.validRows}`,
    `Linhas inválidas: ${result.invalidRows}`,
    '',
    '--- ESTATÍSTICAS ---',
    `Total de Funções: ${result.stats.totalFunctions}`,
    `Setores: ${result.stats.sectors}`,
    `Processos: ${result.stats.processes}`,
    `Funções Críticas: ${result.stats.criticalFunctions}`,
    `Backups Recomendados: ${result.stats.totalBackupsRecommended}`,
    '',
    '--- DISTRIBUIÇÃO POR CRITICIDADE ---',
  ];

  for (const [crit, count] of Object.entries(result.stats.functionsByCriticality)) {
    lines.push(`  ${crit}: ${count}`);
  }

  lines.push('');
  lines.push('--- DISTRIBUIÇÃO POR STATUS ---');
  for (const [status, count] of Object.entries(result.stats.functionsByStatus)) {
    lines.push(`  ${status}: ${count}`);
  }

  if (result.errors.length > 0) {
    lines.push('');
    lines.push('--- ERROS ---');
    result.errors.forEach(err => lines.push(`  ❌ ${err}`));
  }

  if (result.warnings.length > 0) {
    lines.push('');
    lines.push('--- AVISOS ---');
    result.warnings.slice(0, 10).forEach(warn => lines.push(`  ⚠️ ${warn}`));
    if (result.warnings.length > 10) {
      lines.push(`  ... e mais ${result.warnings.length - 10} avisos`);
    }
  }

  return lines.join('\n');
}

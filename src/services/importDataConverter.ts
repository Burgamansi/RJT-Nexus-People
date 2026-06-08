/**
 * Conversor de Dados Importados
 * Converte dados do CATALOGO_MESTRE para o formato PeopleIntelligenceDataset
 */

import { PeopleIntelligenceDataset } from "../features/import-center/rhSpreadsheetEngine";
import { ImportValidationResult, ImportedFunction } from "./robustImportService";
import { Priority } from "../shared/domain/people/enums";

export function convertImportedDataToDataset(
  importResult: ImportValidationResult,
  tenantId: string = "tenant_ubg",
  tenantName: string = "UNIÃO BAG - Empresa Oficial"
): PeopleIntelligenceDataset {
  
  // Criar dataset vazio
  const dataset: PeopleIntelligenceDataset = {
    tenantId,
    tenants: [{ id: tenantId, name: tenantName }],
    employees: [],
    units: [],
    functions: [],
    assignments: [],
    assessments: [],
    backups: [],
    successors: [],
    programs: [],
    ojts: [],
    assets: [],
    evidences: [],
    snapshots: [],
    actionPlans: []
  };

  // Mapear funções importadas
  const functionsMap = new Map<string, any>();
  const unitsSet = new Set<string>();
  const processesSet = new Set<string>();

  for (const func of importResult.data) {
    // Coletar setores e processos
    if (func.setor) unitsSet.add(func.setor);
    if (func.processo) processesSet.add(func.processo);

    // Criar função
    const functionId = `func_${func.idFuncao.toLowerCase().replace(/\s+/g, '_')}`;
    
    functionsMap.set(functionId, {
      id: functionId,
      code: func.idFuncao,
      name: func.nomeFuncao,
      description: func.descricao || func.nomeFuncao,
      organizationUnitId: `unit_${func.setor?.toLowerCase().replace(/\s+/g, '_')}`,
      isCritical: func.criticidade === 'Crítica',
      requiredBackupQuantity: func.qtdBackupRecomendada || 0,
      tenantId,
      status: func.status === 'Ativo' ? 'active' : 'inactive'
    });

    // Criar avaliação de criticidade
    const gutScore = func.scoreGUT || calculateGUT(
      parseInt(func.gravidade) || 1,
      parseInt(func.urgencia) || 1,
      parseInt(func.tendencia) || 1
    );

    const classification = mapCriticality(func.criticidade);

    dataset.assessments.push({
      id: `assess_${functionId}`,
      functionId,
      employeeId: null,
      gutScore,
      vulnerabilityScore: calculateVulnerability(gutScore),
      classification,
      evaluationDate: new Date().toISOString(),
      evaluator: 'System Import',
      notes: func.justificativa || '',
      tenantId
    });

    // Criar ativo/documento
    if (func.clausulaISO) {
      dataset.assets.push({
        id: `asset_${functionId}`,
        code: func.clausulaISO,
        title: `SOP - ${func.nomeFuncao}`,
        description: func.descricao,
        functionId,
        type: 'SOP',
        url: '',
        uploadedDate: new Date().toISOString(),
        owner: 'RH',
        status: 'active',
        tenantId
      });
    }
  }

  // Criar setores/unidades
  for (const setor of unitsSet) {
    const unitId = `unit_${setor.toLowerCase().replace(/\s+/g, '_')}`;
    dataset.units.push({
      id: unitId,
      code: setor.substring(0, 3).toUpperCase(),
      name: setor,
      description: `Setor: ${setor}`,
      parentUnitId: null,
      tenantId,
      status: 'active'
    });
  }

  // Adicionar funções ao dataset
  for (const func of functionsMap.values()) {
    dataset.functions.push(func);
  }

  // Criar colaboradores fictícios para demonstração
  // (será substituído por dados reais quando houver importação de RH)
  dataset.employees = createDemoEmployees(dataset.units, tenantId);

  // Criar atribuições (assignments) básicas
  for (let i = 0; i < dataset.functions.length && i < dataset.employees.length; i++) {
    const func = dataset.functions[i];
    const emp = dataset.employees[i];

    dataset.assignments.push({
      id: `assign_${func.id}_${emp.id}`,
      functionId: func.id,
      employeeId: emp.id,
      isPrimary: true,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: null,
      tenantId
    });
  }

  return dataset;
}

/**
 * Calcula score GUT (Gravidade × Urgência × Tendência)
 */
function calculateGUT(gravidade: number, urgencia: number, tendencia: number): number {
  return gravidade * urgencia * tendencia;
}

/**
 * Mapeia criticidade textual para enum
 */
function mapCriticality(criticidade: string): Priority {
  const lower = criticidade?.toLowerCase() || '';
  if (lower.includes('crítica')) return Priority.CRITICAL;
  if (lower.includes('alta')) return Priority.HIGH;
  if (lower.includes('média')) return Priority.MEDIUM;
  return Priority.LOW;
}

/**
 * Calcula score de vulnerabilidade baseado em GUT
 */
function calculateVulnerability(gutScore: number): number {
  if (gutScore >= 27) return 85;
  if (gutScore >= 18) return 72;
  if (gutScore >= 12) return 58;
  if (gutScore >= 8) return 40;
  return 20;
}

/**
 * Cria colaboradores fictícios para demonstração
 */
function createDemoEmployees(units: any[], tenantId: string): any[] {
  const employees = [
    { name: 'Kaiky Principal', role: 'Operador' },
    { name: 'Eliane Backup', role: 'Operador' },
    { name: 'Roberto Expeditor', role: 'Auxiliar' },
    { name: 'João Silva Manager', role: 'Supervisor' },
    { name: 'Maria Santos', role: 'Técnica' },
    { name: 'Carlos Oliveira', role: 'Operador' },
  ];

  return employees.map((emp, idx) => ({
    id: `emp_${idx + 1}`,
    code: `EMP${String(idx + 1).padStart(3, '0')}`,
    name: emp.name,
    email: `${emp.name.toLowerCase().replace(/\s+/g, '.')}@unionbag.com.br`,
    organizationUnitId: units.length > 0 ? units[idx % units.length].id : 'unit_default',
    role: emp.role,
    status: 'active',
    hireDate: new Date(2020, 0, 1).toISOString(),
    tenantId
  }));
}

/**
 * Salva dataset no localStorage
 */
export function saveDatasetToLocalStorage(dataset: PeopleIntelligenceDataset): void {
  if (typeof window === 'undefined') return;
  
  try {
    const json = JSON.stringify(dataset);
    localStorage.setItem('rjt_nexus_people_imported_dataset_v1', json);
    
    // Disparar evento de atualização
    window.dispatchEvent(new CustomEvent('rjt-people-dataset-updated', {
      detail: dataset.tenantId
    }));
    
    console.log('✅ Dataset salvo no localStorage com sucesso');
    console.log(`   - Funções: ${dataset.functions.length}`);
    console.log(`   - Setores: ${dataset.units.length}`);
    console.log(`   - Colaboradores: ${dataset.employees.length}`);
    console.log(`   - Avaliações: ${dataset.assessments.length}`);
  } catch (error) {
    console.error('❌ Erro ao salvar dataset:', error);
    throw error;
  }
}

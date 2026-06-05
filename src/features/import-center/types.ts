import {
  Employee,
  OrganizationUnit,
  Function as DomainFunction,
  EmployeeAssignment,
  TrainingProgram,
  OjtPlan,
  KnowledgeAsset,
  EvidenceRecord,
  ActionPlan
} from "../../shared/domain/people/entities";

export type ImportType =
  | "employee"
  | "organization_unit"
  | "function"
  | "employee_assignment"
  | "training_program"
  | "ojt_plan"
  | "knowledge_asset"
  | "evidence_record"
  | "action_plan";

export interface ImportError {
  row: number;
  column?: string;
  message: string;
  value?: string;
  isCritical: boolean;
}

export interface ImportWarning {
  row: number;
  column?: string;
  message: string;
  value?: string;
}

export interface ImportMapping {
  columnMappings: Record<string, string>; // Maps CSV/XLSX header name -> entity property name
  fallbackValues: Record<string, any>;   // Fallback values if missing in row
}

export interface ImportResult<T> {
  importType: ImportType;
  tenantId: string;
  processedCount: number;
  successCount: number;
  entities: T[];
  errors: ImportError[];
  warnings: ImportWarning[];
  elapsedMs: number;
}

// Raw row object parsed from CSV/XLSX
export type RawImportRow = Record<string, string>;

export interface XLSXParseMetadata {
  sheetName: string;
  headerRowNumber: number;
  totalRowsRead: number;
  totalDataRows: number;
  detectedHeaders: string[];
}

// Interfaces representing the target parsed forms (before mapper step)
export interface XLSXAdapter {
  parseWorkbook(fileBuffer: ArrayBuffer, sheetName?: string): RawImportRow[];
  getLastParseMetadata?(): XLSXParseMetadata | null;
}

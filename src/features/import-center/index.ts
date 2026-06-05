import { ImportType, RawImportRow, ImportError, ImportWarning, ImportResult, ImportMapping } from "./types";
import { parseCSV } from "./parsers";
import { validateRow } from "./validators";
import { mapRowToEntity } from "./mappers";

// Export everything from submodules
export * from "./types";
export * from "./parsers";
export * from "./validators";
export * from "./mappers";

export interface PipelineOptions {
  importType: ImportType;
  tenantId: string;
  delimiter?: "," | ";" | "\t";
  mapping?: ImportMapping;
}

/**
 * High-level orchestration pipeline. Parses raw string data, validates every entry,
 * isolates by tenant, maps valid rows into typing-compliant shared domain entities,
 * collects errors and warnings, and compiles them into a complete ImportResult.
 */
export function processImportPipeline<T>(
  rawData: string,
  options: PipelineOptions
): ImportResult<T> {
  const start = Date.now();
  const delimiter = options.delimiter || ",";
  
  // 1. Parsing
  const rawRows = parseCSV(rawData, delimiter);
  
  const entities: T[] = [];
  const errors: ImportError[] = [];
  const warnings: ImportWarning[] = [];

  // 2. Row-by-Row Validation & Mapping
  rawRows.forEach((row, index) => {
    const rowNumber = index + 2; // 1-indexed row offsets accounting for CSV header
    
    // Validate
    const validation = validateRow(row, rowNumber, options.importType, options.tenantId);
    
    // Collect errors/warnings
    errors.push(...validation.errors);
    warnings.push(...validation.warnings);

    // If critical validation errors exist, skip mapping this specific row
    const hasCriticalError = validation.errors.some(e => e.isCritical);
    if (!hasCriticalError) {
      try {
        const entity = mapRowToEntity<T>(row, options.importType, options.mapping);
        entities.push(entity);
      } catch (err: any) {
        errors.push({
          row: rowNumber,
          message: `Mapping failed: ${err.message || String(err)}`,
          isCritical: true
        });
      }
    }
  });

  const elapsedMs = Date.now() - start;

  return {
    importType: options.importType,
    tenantId: options.tenantId,
    processedCount: rawRows.length,
    successCount: entities.length,
    entities,
    errors,
    warnings,
    elapsedMs
  };
}

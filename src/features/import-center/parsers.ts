import { RawImportRow, XLSXAdapter, XLSXParseMetadata } from "./types";
import * as XLSX from "xlsx";

const REQUIRED_RH_HEADERS = [
  "ID da Função",
  "Nome da Função",
  "Setor",
  "Processo",
  "Score G×U×T",
  "Criticidade G.U.T",
  "Tempo de Treinamento Recomendado",
  "Qtd. de Backup Recomendada",
  "Competências Requeridas",
  "Impacto no SGQ",
  "Cláusula ISO 9001",
  "Status"
];

function normalizeHeader(value: string): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[×*]/g, "x")
    .replace(/[^\w\s.]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function findHeaderRowIndex(matrix: unknown[][]): number {
  const required = REQUIRED_RH_HEADERS.map(normalizeHeader);
  let bestIndex = -1;
  let bestScore = 0;

  matrix.forEach((row, index) => {
    const rowHeaders = new Set(row.map(cell => normalizeHeader(String(cell ?? ""))).filter(Boolean));
    const score = required.filter(header => rowHeaders.has(header)).length;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestScore >= REQUIRED_RH_HEADERS.length ? bestIndex : -1;
}

function selectSheetName(workbook: XLSX.WorkBook, requestedSheetName?: string): string | undefined {
  if (requestedSheetName && workbook.Sheets[requestedSheetName]) return requestedSheetName;
  const catalog = workbook.SheetNames.find(name => normalizeHeader(name) === "catalogo_mestre");
  return catalog || workbook.SheetNames[0];
}

/**
 * A robust RFC-4180 compliant CSV parser implemented from first principles.
 * Correctly parses complex scenarios:
 * - Commas/delimiters inside double-quoted fields.
 * - Escaped double quotes ("") inside double-quoted fields.
 * - Multi-line fields (newlines within quotes).
 * - Automatic trimming of header keys and row values.
 */
export function parseCSV(
  csvContent: string,
  delimiter: "," | ";" | "\t" = ","
): RawImportRow[] {
  const results: RawImportRow[] = [];
  if (!csvContent || csvContent.trim() === "") return results;

  let inQuotes = false;
  let currentVal = "";
  const currentFields: string[] = [];
  const parsedRows: string[][] = [];

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote character
          currentVal += '"';
          i++; // skip subsequent quote
        } else {
          // Closing quote boundary
          inQuotes = false;
        }
      } else {
        currentVal += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentFields.push(currentVal);
        currentVal = "";
      } else if (char === "\r" || char === "\n") {
        currentFields.push(currentVal);
        currentVal = "";
        // Save row only if it has content (filtering clean lines)
        if (currentFields.some(f => f.trim() !== "")) {
          parsedRows.push([...currentFields]);
        }
        currentFields.length = 0;
        // Safely skip standard carriage return newlines
        if (char === "\r" && nextChar === "\n") {
          i++;
        }
      } else {
        currentVal += char;
      }
    }
  }

  // Flush remaining fields in buffer
  if (currentVal !== "" || currentFields.length > 0) {
    currentFields.push(currentVal);
    if (currentFields.some(f => f.trim() !== "")) {
      parsedRows.push([...currentFields]);
    }
  }

  if (parsedRows.length === 0) return results;

  // Process mapping headers to normalized dictionary items
  const headers = parsedRows[0].map(h => h.trim().toLowerCase());
  for (let i = 1; i < parsedRows.length; i++) {
    const row = parsedRows[i];
    const rowObject: RawImportRow = {};
    headers.forEach((header, idx) => {
      if (header && header.trim() !== "") {
        const val = row[idx] !== undefined ? row[idx].trim() : "";
        rowObject[header] = val;
      }
    });
    results.push(rowObject);
  }

  return results;
}

/**
 * Standard XLSX Adapter executing row conversions.
 * Serves as the primary bridge to bind actual xlsx/exceljs sheet reading.
 */
export class DefaultXLSXAdapter implements XLSXAdapter {
  private lastParseMetadata: XLSXParseMetadata | null = null;

  getLastParseMetadata(): XLSXParseMetadata | null {
    return this.lastParseMetadata;
  }

  parseWorkbook(
    fileBuffer: ArrayBuffer,
    sheetName?: string
  ): RawImportRow[] {
    this.lastParseMetadata = null;
    const textDecoder = new TextDecoder("utf-8");
    const decoded = textDecoder.decode(fileBuffer);
    if (decoded.startsWith("{") || decoded.startsWith("[")) {
      try {
        const json = JSON.parse(decoded);
        return Array.isArray(json) ? json : [json];
      } catch {
        // fallback to CSV parsing of text
      }
    }

    try {
      const workbook = XLSX.read(fileBuffer, { type: "array", cellDates: false });
      const targetSheetName = selectSheetName(workbook, sheetName);
      if (!targetSheetName) return [];
      const sheet = workbook.Sheets[targetSheetName];
      if (!sheet) return [];

      const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        defval: "",
        raw: false
      });
      const headerRowIndex = findHeaderRowIndex(matrix);

      if (headerRowIndex >= 0) {
        const headers = matrix[headerRowIndex].map(cell => String(cell ?? "").trim());
        const dataRows = matrix
          .slice(headerRowIndex + 1)
          .filter(row => row.some(cell => String(cell ?? "").trim() !== ""));

        this.lastParseMetadata = {
          sheetName: targetSheetName,
          headerRowNumber: headerRowIndex + 1,
          totalRowsRead: matrix.filter(row => row.some(cell => String(cell ?? "").trim() !== "")).length,
          totalDataRows: dataRows.length,
          detectedHeaders: headers.filter(Boolean)
        };

        return dataRows.map(row => {
          const normalized: RawImportRow = {};
          headers.forEach((header, index) => {
            if (header) normalized[header] = String(row[index] ?? "").trim();
          });
          return normalized;
        });
      }

      const fallbackRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
        raw: false
      }).map(row => {
        const normalized: RawImportRow = {};
        Object.entries(row).forEach(([key, value]) => {
          normalized[String(key).trim()] = String(value ?? "").trim();
        });
        return normalized;
      });

      this.lastParseMetadata = {
        sheetName: targetSheetName,
        headerRowNumber: 1,
        totalRowsRead: fallbackRows.length,
        totalDataRows: fallbackRows.length,
        detectedHeaders: fallbackRows[0] ? Object.keys(fallbackRows[0]) : []
      };

      return fallbackRows;
    } catch {
      return parseCSV(decoded);
    }
  }
}

import { describe, it } from "node:test";
import assert from "node:assert";
import * as XLSX from "xlsx";
import { DefaultXLSXAdapter } from "./parsers";
import { buildPeopleIntelligenceFromRHRows } from "./rhSpreadsheetEngine";
import { Priority } from "../../shared/domain/people/enums";

describe("RH Spreadsheet Intelligence Engine", () => {
  it("should transform real RH rows into tenant-aware intelligence without inventing people", () => {
    const result = buildPeopleIntelligenceFromRHRows(
      [
        {
          "ID da Função": "PRD-999",
          "Nome da Função": "Operador de Extrusora",
          "Setor": "Extrusão",
          "Processo": "Produção",
          "Score G×U×T": "125",
          "Criticidade G.U.T": "Crítico",
          "Tempo de Treinamento Recomendado": "90 dias",
          "Qtd. de Backup Recomendada": "2",
          "Competências Requeridas": "Setup; Controle de temperatura; Segurança",
          "Impacto no SGQ": "Produto não conforme",
          "Cláusula ISO 9001": "8.5.1"
        }
      ],
      { tenantId: "tenant_ubg", tenantName: "União Bag" }
    );

    assert.strictEqual(result.successCount, 1);
    assert.strictEqual(result.dataset.functions.length, 1);
    assert.strictEqual(result.dataset.employees.length, 0);
    assert.strictEqual(result.dataset.backups.length, 0);
    assert.strictEqual(result.dataset.assessments[0].gutScore, 125);
    assert.strictEqual(result.dataset.assessments[0].classification, Priority.CRITICAL);
    assert.ok(result.dataset.actionPlans.some(action => action.sourceType === "backup_gap"));
    assert.ok(result.dataset.actionPlans.some(action => action.description.includes("Evidência objetiva obrigatória")));
  });

  it("should use real primary and backup names when present", () => {
    const result = buildPeopleIntelligenceFromRHRows(
      [
        {
          "ID da Função": "QUA-999",
          "Nome da Função": "Inspetor da Qualidade",
          "Setor": "Qualidade",
          "Processo": "Inspeção final",
          "Score G×U×T": "64",
          "Criticidade G.U.T": "Alto",
          "Tempo de Treinamento Recomendado": "45 dias",
          "Qtd. de Backup Recomendada": "1",
          "Competências Requeridas": "Plano de controle, Registro SGQ",
          "Impacto no SGQ": "Liberação de produto",
          "Cláusula ISO 9001": "8.6",
          "Colaborador Principal": "Ana Souza",
          "Backup 1": "Bruno Lima",
          "Link Evidência": "https://evidence.local/ana.pdf"
        }
      ],
      { tenantId: "tenant_ubg" }
    );

    assert.strictEqual(result.dataset.employees.length, 2);
    assert.strictEqual(result.dataset.assignments.length, 1);
    assert.strictEqual(result.dataset.backups.length, 1);
    assert.strictEqual(result.dataset.evidences[0].status, "validated");
    assert.strictEqual(result.dataset.programs[0].name.includes("45 dias"), true);
  });

  it("should import UBG official-like workbook with 4 preamble rows and header on row 5", () => {
    const headers = [
      "ID da Função",
      "Nome da Função",
      "Setor",
      "Processo",
      "Gravidade (G)",
      "Urgência (U)",
      "Tendência (T)",
      "Score G×U×T",
      "Criticidade G.U.T",
      "Tempo de Treinamento Recomendado",
      "Qtd. de Backup Recomendada",
      "Descrição da Função",
      "Principais Responsabilidades",
      "Competências Requeridas",
      "Justificativa da Criticidade",
      "Nível de Competência Requerido",
      "Requisito de Backup",
      "Impacto no SGQ",
      "Cláusula ISO 9001",
      "Status"
    ];
    const criticalities = [
      ...Array.from({ length: 28 }, () => "Crítica"),
      ...Array.from({ length: 27 }, () => "Alta"),
      ...Array.from({ length: 15 }, () => "Média"),
      "Baixa"
    ];
    const backups = criticalities.map((_, index) => (index < 43 ? 2 : 1));
    const matrix = [
      ["UNIÃO BAG — BIG BAGS E SACARIAS | RJT NEXUS PEOPLE"],
      ["WORKFORCE MASTER CATALOG — Catálogo Mestre de Funções"],
      ["Documento controlado — ISO 9001:2015 — PDCA 01"],
      [],
      headers,
      ...criticalities.map((criticality, index) => [
        `UBG-${String(index + 1).padStart(3, "0")}`,
        `FUNÇÃO UBG ${String(index + 1).padStart(3, "0")}`,
        index % 2 === 0 ? "Produção / Corte" : "Qualidade",
        index % 2 === 0 ? "Corte" : "Gestão da Qualidade",
        "5-Gravíssimo",
        "5-Gravíssimo",
        "5-Gravíssimo",
        criticality === "Crítica" ? "125" : criticality === "Alta" ? "48" : criticality === "Média" ? "8" : "1",
        criticality,
        "90 dias",
        String(backups[index]),
        "Descrição oficial da função.",
        "Responsabilidades oficiais.",
        "Competência técnica; Registro SGQ",
        "Justificativa oficial.",
        criticality === "Crítica" ? "Especialista" : "Avançado",
        criticality === "Crítica" ? "Obrigatório — manter backup(s) treinado(s) e plano de sucessão ativo." : "Recomendado — manter backup(s) qualificado(s).",
        criticality === "Crítica" ? "Direto e significativo" : "Direto",
        "8.5.1 / 7.2",
        "Ativo"
      ])
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(matrix), "CATALOGO_MESTRE");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["outra aba"]]), "ANALISE_GAP");
    const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;

    const adapter = new DefaultXLSXAdapter();
    const rows = adapter.parseWorkbook(buffer);
    const result = buildPeopleIntelligenceFromRHRows(rows, {
      tenantId: "tenant_ubg",
      tenantName: "UNIÃO BAG",
      parseMetadata: adapter.getLastParseMetadata()
    });

    assert.strictEqual(adapter.getLastParseMetadata()?.sheetName, "CATALOGO_MESTRE");
    assert.strictEqual(adapter.getLastParseMetadata()?.headerRowNumber, 5);
    assert.strictEqual(rows.length, 71);
    assert.strictEqual(result.successCount, 71);
    assert.strictEqual(result.dataset.tenantId, "tenant_ubg");
    assert.strictEqual(result.dataset.functions.length, 71);
    assert.strictEqual(result.dataset.functions[0].code, "UBG-001");
    assert.strictEqual(result.dataset.functions[0].name, "FUNÇÃO UBG 001");
    assert.strictEqual(result.dataset.assessments.filter(item => item.classification === Priority.CRITICAL).length, 28);
    assert.strictEqual(result.dataset.assessments.filter(item => item.classification === Priority.HIGH).length, 27);
    assert.strictEqual(result.dataset.assessments.filter(item => item.classification === Priority.MEDIUM).length, 15);
    assert.strictEqual(result.dataset.assessments.filter(item => item.classification === Priority.LOW).length, 1);
    assert.strictEqual(result.dataset.functions.reduce((sum, item) => sum + item.requiredBackupQuantity, 0), 114);
    assert.strictEqual(result.dataset.actionPlans.length, 284);
    assert.strictEqual(result.dataset.employees.length, 0);
  });
});

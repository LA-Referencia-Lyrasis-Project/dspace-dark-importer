import Papa from "papaparse";
import type { CsvDataset, CsvImportRow, ValidationIssue, ValidationSummary } from "@/types";
import { buildHandleUri } from "@/lib/oai";
import { translations, type TranslationDictionary } from "@/lib/i18n";

const REQUIRED_COLUMNS = ["oai_identifier", "dark"] as const;
type CsvMessages = TranslationDictionary["csv"];
type OaiMessages = TranslationDictionary["oai"];

function normalizeHeader(header: string): string {
  return header.trim();
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function parseCsvFile(file: File, messages: CsvMessages = translations.en.csv): Promise<CsvDataset> {
  if (!file.name.toLowerCase().endsWith(".csv")) {
    throw new Error(messages.uploadCsvFile);
  }

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: normalizeHeader,
      complete: (result) => {
        if (result.errors.length > 0) {
          const firstError = result.errors[0];
          reject(new Error(firstError?.message ?? messages.csvCouldNotBeParsed));
          return;
        }

        const headers = result.meta.fields ?? [];
        const rows: CsvImportRow[] = result.data.map((row, index) => ({
          rowNumber: index + 2,
          oaiIdentifier: stringValue(row.oai_identifier),
          darkId: stringValue(row.dark)
        }));

        resolve({
          filename: file.name,
          headers,
          rows
        });
      },
      error: (error: Error) => {
        reject(error);
      }
    });
  });
}

export function validateCsvDataset(
  dataset: CsvDataset | null,
  handleBaseUrl: string,
  messages: CsvMessages = translations.en.csv,
  oaiMessages: OaiMessages = translations.en.oai
): ValidationSummary {
  if (!dataset) {
    return {
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      errors: [{ severity: "error", field: "csv", message: messages.uploadBeforeContinuing }],
      warnings: []
    };
  }

  const issues: ValidationIssue[] = [];
  const oaiCounts = new Map<string, number[]>();
  const darkIdCounts = new Map<string, number[]>();
  const invalidRowNumbers = new Set<number>();

  for (const column of REQUIRED_COLUMNS) {
    if (!dataset.headers.includes(column)) {
      issues.push({
        severity: "error",
        field: "csv",
        message: messages.missingRequiredColumn(column)
      });
    }
  }

  for (const row of dataset.rows) {
    if (!row.oaiIdentifier) {
      invalidRowNumbers.add(row.rowNumber);
      issues.push({
        severity: "error",
        rowNumber: row.rowNumber,
        field: "oai_identifier",
        message: messages.oaiIdentifierRequired
      });
    } else {
      const existing = oaiCounts.get(row.oaiIdentifier) ?? [];
      oaiCounts.set(row.oaiIdentifier, [...existing, row.rowNumber]);

      try {
        buildHandleUri(row.oaiIdentifier, handleBaseUrl, oaiMessages);
      } catch (error) {
        invalidRowNumbers.add(row.rowNumber);
        issues.push({
          severity: "error",
          rowNumber: row.rowNumber,
          field: "oai_identifier",
          message: error instanceof Error ? error.message : messages.malformedOaiIdentifier
        });
      }
    }

    if (!row.darkId) {
      invalidRowNumbers.add(row.rowNumber);
      issues.push({
        severity: "error",
        rowNumber: row.rowNumber,
        field: "dark",
        message: messages.darkIdRequired
      });
    } else {
      const existing = darkIdCounts.get(row.darkId) ?? [];
      darkIdCounts.set(row.darkId, [...existing, row.rowNumber]);
    }
  }

  for (const [identifier, rowNumbers] of oaiCounts.entries()) {
    if (rowNumbers.length > 1) {
      for (const rowNumber of rowNumbers) {
        invalidRowNumbers.add(rowNumber);
      }

      issues.push({
        severity: "error",
        field: "oai_identifier",
        message: messages.duplicateOaiIdentifier(identifier, rowNumbers.join(", "))
      });
    }
  }

  for (const [darkId, rowNumbers] of darkIdCounts.entries()) {
    if (rowNumbers.length > 1) {
      issues.push({
        severity: "warning",
        field: "dark",
        message: messages.duplicateDarkId(darkId, rowNumbers.join(", "))
      });
    }
  }

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  return {
    totalRows: dataset.rows.length,
    validRows: Math.max(0, dataset.rows.length - invalidRowNumbers.size),
    invalidRows: invalidRowNumbers.size,
    errors,
    warnings
  };
}

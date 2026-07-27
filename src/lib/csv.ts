import Papa from "papaparse";
import type { CsvDataset, CsvImportRow, ValidationIssue, ValidationSummary } from "@/types";
import { buildHandleUri } from "@/lib/oai";

const REQUIRED_COLUMNS = ["oai_identifier", "dark_id"] as const;

function normalizeHeader(header: string): string {
  return header.trim();
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function parseCsvFile(file: File): Promise<CsvDataset> {
  if (!file.name.toLowerCase().endsWith(".csv")) {
    throw new Error("Upload a .csv file.");
  }

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: normalizeHeader,
      complete: (result) => {
        if (result.errors.length > 0) {
          const firstError = result.errors[0];
          reject(new Error(firstError?.message ?? "The CSV could not be parsed."));
          return;
        }

        const headers = result.meta.fields ?? [];
        const rows: CsvImportRow[] = result.data.map((row, index) => ({
          rowNumber: index + 2,
          oaiIdentifier: stringValue(row.oai_identifier),
          darkId: stringValue(row.dark_id)
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

export function validateCsvDataset(dataset: CsvDataset | null, handleBaseUrl: string): ValidationSummary {
  if (!dataset) {
    return {
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      errors: [{ severity: "error", field: "csv", message: "Upload a CSV file before continuing." }],
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
        message: `Missing required column "${column}".`
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
        message: "OAI identifier is required."
      });
    } else {
      const existing = oaiCounts.get(row.oaiIdentifier) ?? [];
      oaiCounts.set(row.oaiIdentifier, [...existing, row.rowNumber]);

      try {
        buildHandleUri(row.oaiIdentifier, handleBaseUrl);
      } catch (error) {
        invalidRowNumbers.add(row.rowNumber);
        issues.push({
          severity: "error",
          rowNumber: row.rowNumber,
          field: "oai_identifier",
          message: error instanceof Error ? error.message : "Malformed OAI identifier."
        });
      }
    }

    if (!row.darkId) {
      invalidRowNumbers.add(row.rowNumber);
      issues.push({
        severity: "error",
        rowNumber: row.rowNumber,
        field: "dark_id",
        message: "Dark ID is required."
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
        message: `Duplicate OAI identifier "${identifier}" appears on rows ${rowNumbers.join(", ")}.`
      });
    }
  }

  for (const [darkId, rowNumbers] of darkIdCounts.entries()) {
    if (rowNumbers.length > 1) {
      issues.push({
        severity: "warning",
        field: "dark_id",
        message: `Duplicate Dark ID "${darkId}" appears on rows ${rowNumbers.join(", ")}.`
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

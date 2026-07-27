export interface ImportConfig {
  restApiUrl: string;
  handleBaseUrl: string;
  bearerToken: string;
  metadataSearchField: string;
  metadataUpdateField: string;
}

export interface RecentConfig {
  restApiUrls: string[];
  handleBaseUrls: string[];
}

export interface CsvImportRow {
  rowNumber: number;
  oaiIdentifier: string;
  darkId: string;
}

export interface CsvDataset {
  filename: string;
  rows: CsvImportRow[];
  headers: string[];
}

export type ValidationSeverity = "error" | "warning";

export interface ValidationIssue {
  severity: ValidationSeverity;
  rowNumber?: number;
  field?: "oai_identifier" | "dark_id" | "csv";
  message: string;
}

export interface ValidationSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export type ImportStatus =
  | "UPDATED"
  | "SKIPPED"
  | "NOT FOUND"
  | "MULTIPLE MATCHES"
  | "API ERROR"
  | "VALIDATION ERROR"
  | "AUTHENTICATION ERROR"
  | "NETWORK ERROR";

export interface ImportReportRow {
  oai_identifier: string;
  generated_uri: string;
  dark_id: string;
  item_uuid: string;
  item_handle: string;
  status: ImportStatus;
  message: string;
}

export interface ProcessingStats {
  total: number;
  processed: number;
  updated: number;
  skipped: number;
  notFound: number;
  multipleMatches: number;
  errors: number;
  remaining: number;
}

export interface ProcessingLogEntry {
  id: string;
  level: "success" | "error" | "info" | "warning";
  message: string;
  rowNumber?: number;
  timestamp: string;
}

export interface DSpaceMetadataValue {
  value: string;
  language: string | null;
  authority: string | null;
  confidence: number;
  place?: number;
}

export interface DSpaceItem {
  uuid: string;
  handle: string | null;
  name?: string;
  metadata: Record<string, DSpaceMetadataValue[]>;
  type: "item";
  _links?: {
    self?: {
      href: string;
    };
  };
}

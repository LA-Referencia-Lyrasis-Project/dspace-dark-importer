import { saveAs } from "file-saver";
import Papa from "papaparse";
import type { ImportReportRow } from "@/types";

const REPORT_COLUMNS: Array<keyof ImportReportRow> = [
  "oai_identifier",
  "generated_uri",
  "dark_id",
  "item_uuid",
  "item_handle",
  "status",
  "message"
];

export function createReportCsv(rows: ImportReportRow[]): string {
  return Papa.unparse(rows, {
    columns: REPORT_COLUMNS,
    header: true
  });
}

export function downloadReport(rows: ImportReportRow[]): void {
  const csv = createReportCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, "report.csv");
}

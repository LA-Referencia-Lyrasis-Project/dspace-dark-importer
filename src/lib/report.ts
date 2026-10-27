import { saveAs } from "file-saver";
import Papa from "papaparse";
import type { ImportReportRow } from "@/types";

interface ExportRow {
  id: string;
  "dc.identifier.dark": string;
}

const REPORT_COLUMNS: Array<keyof ImportReportRow> = [
  "oai_identifier",
  "generated_uri",
  "dark",
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

export function createItemsDarksCsv(rows: ImportReportRow[]): string {
  const exportRows: ExportRow[] = rows
    .filter((row) => row.status === "READY FOR EXPORT")
    .map((row) => ({ id: row.item_uuid, "dc.identifier.dark": row.dark }));

  return Papa.unparse(exportRows, { columns: ["id", "dc.identifier.dark"], header: true });
}

export function downloadItemsDarks(rows: ImportReportRow[]): void {
  const csv = createItemsDarksCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, "items-darks.csv");
}

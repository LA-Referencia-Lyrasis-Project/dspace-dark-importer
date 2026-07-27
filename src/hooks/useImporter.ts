import { useCallback, useMemo, useRef, useState } from "react";
import type {
  CsvImportRow,
  DSpaceItem,
  ImportConfig,
  ImportReportRow,
  ImportStatus,
  ProcessingLogEntry,
  ProcessingStats
} from "@/types";
import { createDSpaceClient } from "@/lib/dspace";
import { buildHandleUri } from "@/lib/oai";
import { HttpError, NetworkError } from "@/lib/retry";

type ImportRunStatus = "idle" | "authenticating" | "processing" | "completed" | "cancelled";

interface ImporterState {
  status: ImportRunStatus;
  startedAt: number | null;
  finishedAt: number | null;
  stats: ProcessingStats;
  logs: ProcessingLogEntry[];
  reportRows: ImportReportRow[];
}

const initialStats: ProcessingStats = {
  total: 0,
  processed: 0,
  updated: 0,
  skipped: 0,
  notFound: 0,
  multipleMatches: 0,
  errors: 0,
  remaining: 0
};

function createLog(level: ProcessingLogEntry["level"], message: string, rowNumber?: number): ProcessingLogEntry {
  return {
    id: crypto.randomUUID(),
    level,
    message,
    rowNumber,
    timestamp: new Date().toLocaleTimeString()
  };
}

function classifyStatus(error: unknown): ImportStatus {
  if (error instanceof HttpError && error.status === 401) {
    return "AUTHENTICATION ERROR";
  }

  if (error instanceof TypeError || error instanceof NetworkError) {
    return "NETWORK ERROR";
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return "API ERROR";
  }

  return "API ERROR";
}

function messageFromError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error.";
}

function reportFor(row: CsvImportRow, generatedUri: string, status: ImportStatus, message: string, item?: DSpaceItem): ImportReportRow {
  return {
    oai_identifier: row.oaiIdentifier,
    generated_uri: generatedUri,
    dark_id: row.darkId,
    item_uuid: item?.uuid ?? "",
    item_handle: item?.handle ?? "",
    status,
    message
  };
}

function generatedUriForReport(row: CsvImportRow, handleBaseUrl: string): string {
  try {
    return buildHandleUri(row.oaiIdentifier, handleBaseUrl);
  } catch {
    return "";
  }
}

function itemAlreadyHasMetadataValue(item: DSpaceItem, metadataField: string, value: string): boolean {
  const normalizedValue = value.trim();
  return (item.metadata[metadataField] ?? []).some((metadataValue) => metadataValue.value.trim() === normalizedValue);
}

export function useImporter(config: ImportConfig, rows: CsvImportRow[]) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [state, setState] = useState<ImporterState>({
    status: "idle",
    startedAt: null,
    finishedAt: null,
    stats: { ...initialStats, total: rows.length, remaining: rows.length },
    logs: [],
    reportRows: []
  });

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setState({
      status: "idle",
      startedAt: null,
      finishedAt: null,
      stats: { ...initialStats, total: rows.length, remaining: rows.length },
      logs: [],
      reportRows: []
    });
  }, [rows.length]);

  const appendLog = useCallback((entry: ProcessingLogEntry) => {
    setState((current) => ({
      ...current,
      logs: [...current.logs.slice(-299), entry]
    }));
  }, []);

  const recordResult = useCallback((result: ImportReportRow) => {
    setState((current) => {
      const updated = result.status === "UPDATED" ? current.stats.updated + 1 : current.stats.updated;
      const skipped = result.status === "SKIPPED" ? current.stats.skipped + 1 : current.stats.skipped;
      const notFound = result.status === "NOT FOUND" ? current.stats.notFound + 1 : current.stats.notFound;
      const multipleMatches = result.status === "MULTIPLE MATCHES" ? current.stats.multipleMatches + 1 : current.stats.multipleMatches;
      const errors = ["API ERROR", "VALIDATION ERROR", "AUTHENTICATION ERROR", "NETWORK ERROR"].includes(result.status)
        ? current.stats.errors + 1
        : current.stats.errors;
      const processed = current.stats.processed + 1;

      return {
        ...current,
        reportRows: [...current.reportRows, result],
        stats: {
          ...current.stats,
          processed,
          updated,
          skipped,
          notFound,
          multipleMatches,
          errors,
          remaining: Math.max(0, current.stats.total - processed)
        }
      };
    });
  }, []);

  const start = useCallback(async () => {
    if (abortControllerRef.current) {
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const client = createDSpaceClient(config, abortController.signal);

    setState({
      status: "authenticating",
      startedAt: Date.now(),
      finishedAt: null,
      stats: { ...initialStats, total: rows.length, remaining: rows.length },
      logs: [createLog("info", "Starting import session.")],
      reportRows: []
    });

    try {
      await client.authenticate();
      appendLog(
        createLog(
          "success",
          config.authMethod === "bearer" ? "Bearer token configured. DSpace will validate it on API requests." : "Authenticated with DSpace."
        )
      );
    } catch (error) {
      const now = Date.now();
      const message = messageFromError(error);
      const authReportRows = rows.map((row) => reportFor(row, generatedUriForReport(row, config.handleBaseUrl), "AUTHENTICATION ERROR", message));

      setState((current) => ({
        ...current,
        status: "completed",
        finishedAt: now,
        stats: { ...current.stats, errors: rows.length, processed: rows.length, remaining: 0 },
        logs: [...current.logs, createLog("error", message)],
        reportRows: authReportRows
      }));
      abortControllerRef.current = null;
      return;
    }

    try {
      const metadataFieldResult = await client.ensureMetadataField(config.metadataUpdateField);
      appendLog(
        createLog(
          "success",
          metadataFieldResult.created
            ? `Metadata field created: ${config.metadataUpdateField}.`
            : `Metadata field verified: ${config.metadataUpdateField}.`
        )
      );
    } catch (error) {
      const now = Date.now();
      const message = messageFromError(error);
      setState((current) => ({
        ...current,
        status: "completed",
        finishedAt: now,
        stats: { ...current.stats, errors: rows.length, processed: rows.length, remaining: 0 },
        logs: [...current.logs, createLog("error", message)],
        reportRows: rows.map((row) => reportFor(row, generatedUriForReport(row, config.handleBaseUrl), "VALIDATION ERROR", message))
      }));
      abortControllerRef.current = null;
      return;
    }

    setState((current) => ({ ...current, status: "processing" }));

    for (const row of rows) {
      if (abortController.signal.aborted) {
        appendLog(createLog("warning", "Import cancelled."));
        break;
      }

      let generatedUri = "";

      try {
        generatedUri = buildHandleUri(row.oaiIdentifier, config.handleBaseUrl);
        appendLog(createLog("info", `Searching item for ${generatedUri}.`, row.rowNumber));

        const matches = await client.searchItemByMetadata(config.metadataSearchField, generatedUri);

        if (matches.length === 0) {
          appendLog(createLog("warning", "Item not found.", row.rowNumber));
          recordResult(reportFor(row, generatedUri, "NOT FOUND", "No item matched the generated URI."));
          continue;
        }

        if (matches.length > 1) {
          appendLog(createLog("warning", "Multiple matching items found.", row.rowNumber));
          recordResult(reportFor(row, generatedUri, "MULTIPLE MATCHES", "More than one item matched the generated URI."));
          continue;
        }

        const item = matches[0];
        appendLog(createLog("success", `Item found: ${item.uuid}.`, row.rowNumber));

        if (itemAlreadyHasMetadataValue(item, config.metadataUpdateField, row.darkId)) {
          appendLog(createLog("info", "Metadata value already exists. Skipping row.", row.rowNumber));
          recordResult(reportFor(row, generatedUri, "SKIPPED", "Metadata value already exists on item.", item));
          continue;
        }

        await client.updateItemMetadata(item, config.metadataUpdateField, row.darkId);
        appendLog(createLog("success", "Metadata updated.", row.rowNumber));
        recordResult(reportFor(row, generatedUri, "UPDATED", "Metadata value appended.", item));
      } catch (error) {
        if (abortController.signal.aborted) {
          appendLog(createLog("warning", "Import cancelled."));
          break;
        }

        const status = classifyStatus(error);
        const message = messageFromError(error);
        appendLog(createLog("error", message, row.rowNumber));
        recordResult(reportFor(row, generatedUri, status, message));
      }
    }

    const cancelled = abortController.signal.aborted;
    abortControllerRef.current = null;
    setState((current) => ({
      ...current,
      status: cancelled ? "cancelled" : "completed",
      finishedAt: Date.now()
    }));
  }, [appendLog, config, recordResult, rows]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const isProcessing = state.status === "authenticating" || state.status === "processing";
  const elapsedMs = useMemo(() => {
    if (!state.startedAt) {
      return 0;
    }

    return (state.finishedAt ?? Date.now()) - state.startedAt;
  }, [state.finishedAt, state.startedAt, state.stats.processed]);

  return {
    ...state,
    elapsedMs,
    isProcessing,
    start,
    cancel,
    reset
  };
}

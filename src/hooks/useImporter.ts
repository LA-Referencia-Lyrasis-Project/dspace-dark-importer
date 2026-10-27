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
import { buildHandleUri, extractHandleSuffix } from "@/lib/oai";
import { HttpError, NetworkError } from "@/lib/retry";
import { translations, type TranslationDictionary } from "@/lib/i18n";

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
  readyForExport: 0,
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

function translatedMessageFromError(error: unknown, messages: TranslationDictionary["importer"]): string {
  if (error instanceof Error) {
    return error.message;
  }

  return messages.unexpectedError;
}

function reportFor(row: CsvImportRow, generatedUri: string, status: ImportStatus, message: string, item?: DSpaceItem): ImportReportRow {
  return {
    oai_identifier: row.oaiIdentifier,
    generated_uri: generatedUri,
    dark: row.darkId,
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

export function useImporter(config: ImportConfig, rows: CsvImportRow[], messages: TranslationDictionary["importer"] = translations.en.importer) {
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
      const readyForExport = result.status === "READY FOR EXPORT" ? current.stats.readyForExport + 1 : current.stats.readyForExport;
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
          readyForExport,
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
      logs: [createLog("info", messages.startingSession)],
      reportRows: []
    });

    setState((current) => ({ ...current, status: "processing" }));

    for (const row of rows) {
      if (abortController.signal.aborted) {
        appendLog(createLog("warning", messages.importCancelled));
        break;
      }

      let generatedUri = "";

      try {
        generatedUri = buildHandleUri(row.oaiIdentifier, config.handleBaseUrl);
        appendLog(createLog("info", messages.searchingItem(generatedUri), row.rowNumber));

        const handle = extractHandleSuffix(row.oaiIdentifier);
        const resolution = await client.resolveObjectByHandle(handle, generatedUri);
        const matches = resolution.objects;

        appendLog(
          createLog(
            resolution.source === "pid" ? "success" : "warning",
            resolution.source === "pid" ? messages.pidResolved(handle) : messages.discoveryFallback(handle),
            row.rowNumber
          )
        );

        if (matches.length === 0) {
          appendLog(createLog("warning", messages.itemNotFound, row.rowNumber));
          recordResult(reportFor(row, generatedUri, "NOT FOUND", messages.noItemMatched));
          continue;
        }

        if (matches.length > 1) {
          appendLog(createLog("warning", messages.multipleItemsFound, row.rowNumber));
          recordResult(reportFor(row, generatedUri, "MULTIPLE MATCHES", messages.moreThanOneItemMatched));
          continue;
        }

        const item = matches[0];
        appendLog(createLog("success", messages.itemFound(item.uuid), row.rowNumber));

        appendLog(createLog("success", messages.readyForExport, row.rowNumber));
        recordResult(reportFor(row, generatedUri, "READY FOR EXPORT", messages.readyForExport, item));
      } catch (error) {
        if (abortController.signal.aborted) {
          appendLog(createLog("warning", messages.importCancelled));
          break;
        }

        const status = classifyStatus(error);
        const message = translatedMessageFromError(error, messages);
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
  }, [appendLog, config, messages, recordResult, rows]);

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

const TRANSIENT_STATUSES = new Set([408, 409, 429, 500, 502, 503, 504]);

export class HttpError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly body: string;

  constructor(status: number, statusText: string, body: string) {
    super(buildHttpMessage(status, statusText, body));
    this.name = "HttpError";
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

export class NetworkError extends Error {
  readonly method: string;
  readonly url: string;
  readonly originalMessage: string;

  constructor(method: string, url: string, originalMessage: string) {
    super(`Network request failed: ${method} ${url}. Browser error: ${originalMessage}`);
    this.name = "NetworkError";
    this.method = method;
    this.url = url;
    this.originalMessage = originalMessage;
  }
}

function buildHttpMessage(status: number, statusText: string, body: string): string {
  const detail = body.trim().slice(0, 300);
  return detail ? `HTTP ${status} ${statusText}: ${detail}` : `HTTP ${status} ${statusText}`;
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("The request was cancelled.", "AbortError"));
      return;
    }

    const timeout = window.setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeout);
        reject(new DOMException("The request was cancelled.", "AbortError"));
      },
      { once: true }
    );
  });
}

export function shouldRetry(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") {
    return false;
  }

  if (error instanceof HttpError) {
    return TRANSIENT_STATUSES.has(error.status);
  }

  return error instanceof TypeError || error instanceof NetworkError;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: { attempts?: number; initialDelayMs?: number; signal?: AbortSignal } = {}
): Promise<T> {
  const attempts = options.attempts ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 500;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt >= attempts || !shouldRetry(error)) {
        break;
      }

      await delay(initialDelayMs * 2 ** (attempt - 1), options.signal);
    }
  }

  throw lastError;
}

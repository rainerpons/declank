import pLimit from "p-limit";
import pRetry, { AbortError } from "p-retry";
import { log, warn } from "@/utils/logger";
import {
  MAX_CONCURRENT_REQUESTS,
  MAX_RETRIES,
  RETRY_BASE_DELAY_MS,
  RETRYABLE_STATUS_CODES,
  PERMANENT_FAILURE_CODES,
} from "@/utils/constants";

const limiter = pLimit(MAX_CONCURRENT_REQUESTS);

/** Map of in-flight request promises keyed by URL to prevent duplicates */
const inflightRequests = new Map<string, Promise<Response>>();

export interface FetchResult {
  ok: boolean;
  status: number;
  data: unknown;
  retryAfter?: number;
}

async function fetchWithRetry(url: string): Promise<FetchResult> {
  const run = async () => {
    const response = await fetch(url);

    if (response.ok) {
      const data: unknown = await response.json();
      return { ok: true, status: response.status, data };
    }

    if (PERMANENT_FAILURE_CODES.has(response.status)) {
      throw new AbortError(`Permanent failure: HTTP ${response.status} for ${url}`);
    }

    if (RETRYABLE_STATUS_CODES.has(response.status)) {
      const retryAfter = parseRetryAfter(response.headers.get("Retry-After"));
      if (retryAfter) {
        log(`Retry-After header indicates ${retryAfter}ms wait for ${url}`);
      }
      throw new Error(`Retryable failure: HTTP ${response.status} for ${url}`);
    }

    // Unknown non-OK status - don't retry
    throw new AbortError(`Unexpected HTTP ${response.status} for ${url}`);
  };

  try {
    return await pRetry(run, {
      retries: MAX_RETRIES,
      minTimeout: RETRY_BASE_DELAY_MS,
      factor: 2.5,
      randomize: true,
      onFailedAttempt: (error) => {
        log(
          `Request attempt ${error.attemptNumber} failed for ${url}.`,
          `${error.retriesLeft} retries remaining.`
        );
      },
    });
  } catch (err) {
    if (err instanceof AbortError) {
      warn(`Permanent failure for ${url}:`, err.message);
      return { ok: false, status: 0, data: null };
    }
    warn(`All retries exhausted for ${url}:`, err);
    return { ok: false, status: 0, data: null };
  }
}

function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined;
  const seconds = Number(header);
  if (!Number.isNaN(seconds) && seconds > 0) {
    return seconds * 1000;
  }
  const date = Date.parse(header);
  if (!Number.isNaN(date)) {
    const delay = date - Date.now();
    return delay > 0 ? delay : undefined;
  }
  return undefined;
}

/**
 * Fetch a URL with concurrency limiting, deduplication, and retry.
 * Multiple calls for the same URL will share the same in-flight request.
 */
export function limitedFetch(url: string): Promise<FetchResult> {
  const existing = inflightRequests.get(url);
  if (existing) {
    log(`Deduplicating request for ${url}`);
    return existing as unknown as Promise<FetchResult>;
  }

  const promise = limiter(() => fetchWithRetry(url));
  
  // Store as in-flight and remove when complete
  const tracked = promise.finally(() => {
    inflightRequests.delete(url);
  });

  inflightRequests.set(url, tracked as unknown as Promise<Response>);
  return tracked;
}

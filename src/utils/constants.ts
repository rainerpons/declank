/** Maximum concurrent Reddit account API requests */
export const MAX_CONCURRENT_REQUESTS = 4;

/** Maximum number of retry attempts for transient failures */
export const MAX_RETRIES = 3;

/** Base delay in milliseconds for exponential backoff */
export const RETRY_BASE_DELAY_MS = 2000;

/** Reddit account about.json URL template */
export const REDDIT_ABOUT_URL = (username: string): string =>
  `https://www.reddit.com/user/${encodeURIComponent(username)}/about.json`;

/** HTTP status codes that should trigger retries */
export const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

/** HTTP status codes that indicate a permanent failure (no retry) */
export const PERMANENT_FAILURE_CODES = new Set([404]);

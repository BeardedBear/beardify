import ky, { HTTPError, TimeoutError } from "ky";

export const BEARDIFY_USER_AGENT = "Beardify/1.0.0 (https://github.com/BeardedBear/beardify)";
export const DEFAULT_TIMEOUT_MS = 5000;
export const DEFAULT_RETRY_LIMIT = 3;
export const DEFAULT_RETRY_METHODS = ["get", "put", "delete", "patch", "post"];
export const DEFAULT_RETRY_STATUS_CODES = [408, 413, 429, 500, 502, 503, 504];

/**
 * Shared HTTP client for external services.
 */
export const http = ky.create({
  retry: {
    limit: DEFAULT_RETRY_LIMIT,
    maxRetryAfter: 5000,
    methods: DEFAULT_RETRY_METHODS,
    // POST isn't idempotent (adding to a playlist or the queue): a 5xx or a
    // timeout may already have been applied, so only a 429 is safe to replay.
    shouldRetry: ({ error }) => {
      if (error instanceof TimeoutError && error.request.method === "POST") return false;
      if (error instanceof HTTPError && error.request.method === "POST" && error.response.status !== 429) return false;
      return undefined;
    },
    statusCodes: DEFAULT_RETRY_STATUS_CODES,
  },
  timeout: DEFAULT_TIMEOUT_MS,
});

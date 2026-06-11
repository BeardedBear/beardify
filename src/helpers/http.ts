import ky from "ky";

export const BEARDIFY_USER_AGENT = "Beardify/1.0.0 (https://github.com/BeardedBear/beardify)";
const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_RETRY_LIMIT = 3;
const DEFAULT_RETRY_METHODS = ["get", "put", "delete", "patch", "post"];
const DEFAULT_RETRY_STATUS_CODES = [408, 413, 429, 500, 502, 503, 504];

/**
 * Shared HTTP client for external services.
 */
export const http = ky.create({
  retry: {
    limit: DEFAULT_RETRY_LIMIT,
    maxRetryAfter: 5000,
    methods: DEFAULT_RETRY_METHODS,
    statusCodes: DEFAULT_RETRY_STATUS_CODES,
  },
  timeout: DEFAULT_TIMEOUT_MS,
});

import ky, { Options } from "ky";

import { ApiResponse, SpotifyOptions } from "@/@types/Api";
import { clearAuthData } from "@/helpers/authUtils";
import { http } from "@/helpers/http";
import { useAuth } from "@/views/auth/AuthStore";

/**
 * Spotify API configuration object
 */
export const api = {
  clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  redirectUri:
    import.meta.env.MODE !== "production"
      ? import.meta.env.VITE_REDIRECT_URI_DEV
      : import.meta.env.VITE_REDIRECT_URI_PROD,
  scopes:
    "user-read-private,user-modify-playback-state,user-read-playback-state,user-read-currently-playing,playlist-read-private,playlist-read-collaborative,playlist-modify-private,playlist-modify-public,user-follow-modify,user-follow-read,streaming,user-read-email,user-top-read,user-library-read,user-library-modify,user-read-playback-position,user-read-recently-played",
  url: "https://api.spotify.com/v1/",
};

/**
 * Interface for API instance methods
 */
interface ApiInstance {
  delete: <T = unknown>(url: string, options?: SpotifyOptions) => ApiResponse<{ data: T }>;
  get: <T = unknown>(url: string, options?: SpotifyOptions) => ApiResponse<{ data: T }>;
  patch: <T = unknown>(url: string, body?: unknown, options?: SpotifyOptions) => ApiResponse<{ data: T }>;
  post: <T = unknown>(url: string, body?: unknown, options?: SpotifyOptions) => ApiResponse<{ data: T }>;
  put: <T = unknown>(url: string, body?: unknown, options?: SpotifyOptions) => ApiResponse<{ data: T }>;
  raw: typeof ky;
}

/**
 * Type definition for HTTP methods in alphabetical order
 */
type HttpMethod = "delete" | "get" | "patch" | "post" | "put";

/**
 * Interface for request options with method type
 */
interface RequestOptions {
  body?: unknown;
  method: HttpMethod;
  options?: SpotifyOptions;
  url: string;
}

/**
 * Creates and returns an API instance with methods for HTTP requests
 * @returns ApiInstance - Object with methods for different HTTP requests
 */
export function instance(): ApiInstance {
  const kyInstance = createKyInstance();

  /**
   * Common function to handle HTTP requests with proper error handling
   * @template T - The expected response data type
   * @param requestOptions - Options for the request
   * @returns Promise resolving to the response data
   */
  const handleRequest = async <T = unknown>(requestOptions: RequestOptions): ApiResponse<{ data: T }> => {
    const { body, method, options, url } = requestOptions;
    const opts: Options = { ...options };

    // Handle request body or data from options
    if ((method !== "get" && body) || (method === "delete" && options?.data)) {
      opts.json = method === "delete" ? options?.data : body;
    }

    // Make the request using the appropriate method
    const response = await kyInstance[method](url, opts);
    let data: T;
    try {
      data = await response.json<T>();
    } catch {
      // fallback empty object – satisfies generic shape without unsafe assertion
      data = {} as T; // retain minimal assertion since satisfies can't help with generic unknown
    }
    return { data };
  };

  return {
    delete: <T = unknown>(url: string, options?: SpotifyOptions): ApiResponse<{ data: T }> =>
      handleRequest<T>({ method: "delete", options, url }),

    get: <T = unknown>(url: string, options?: SpotifyOptions): ApiResponse<{ data: T }> =>
      handleRequest<T>({ method: "get", options, url }),

    patch: <T = unknown>(url: string, body?: unknown, options?: SpotifyOptions): ApiResponse<{ data: T }> =>
      handleRequest<T>({ body, method: "patch", options, url }),

    post: <T = unknown>(url: string, body?: unknown, options?: SpotifyOptions): ApiResponse<{ data: T }> =>
      handleRequest<T>({ body, method: "post", options, url }),

    put: <T = unknown>(url: string, body?: unknown, options?: SpotifyOptions): ApiResponse<{ data: T }> =>
      handleRequest<T>({ body, method: "put", options, url }),

    // Direct access to the underlying ky instance
    raw: kyInstance,
  };
}

// Module-level state shared across all instance() calls to prevent concurrent refresh attempts
let isRefreshing = false;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

/**
 * Creates a base ky instance with authentication and common configuration
 * @returns Configured ky instance
 */
function createKyInstance(): typeof ky {
  const authStore = useAuth();

  return http.extend({
    baseUrl: api.url,
    headers: {
      Authorization: `Bearer ${authStore.accessToken}`,
      "Content-Type": "application/json",
    },
    hooks: {
      afterResponse: [
        async ({ response }): Promise<void> => {
          if (response.status === 401 && !isRefreshing && refreshAttempts < MAX_REFRESH_ATTEMPTS) {
            isRefreshing = true;
            refreshAttempts++;
            try {
              await authStore.refresh();
              isRefreshing = false;
              refreshAttempts = 0;
              // No page reload — future instance() calls read the updated token from the store
            } catch {
              isRefreshing = false;
              if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
                refreshAttempts = 0;
                clearAuthData();
                const currentPath = window.location.pathname;
                if (currentPath !== "/login/") {
                  window.location.href = `/login/?ref=${encodeURIComponent(currentPath)}`;
                }
              }
            }
          }
        },
      ],
    },
  });
}

import ky, { Options } from "ky";

import { SpotifyOptions } from "./@types/Api";
import { useAuth } from "./views/auth/AuthStore";

export const api = {
  clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  redirectUri:
    import.meta.env.MODE !== "production"
      ? import.meta.env.VITE_REDIRECT_URI_DEV
      : import.meta.env.VITE_REDIRECT_URI_PROD,
  scopes:
    "user-read-private,user-modify-playback-state,user-read-playback-state,user-read-currently-playing,playlist-read-private,playlist-read-collaborative,playlist-modify-private,playlist-modify-public,user-follow-modify,user-follow-read,streaming,user-read-email,user-top-read,user-library-read,user-read-playback-position,user-read-recently-played",
  url: "https://api.spotify.com/v1/",
};

// Type for API instance methods
type ApiInstance = {
  delete: <T = unknown>(url: string, options?: SpotifyOptions) => Promise<{ data: T }>;
  get: <T = unknown>(url: string, options?: SpotifyOptions) => Promise<{ data: T }>;
  patch: <T = unknown>(url: string, body?: unknown, options?: SpotifyOptions) => Promise<{ data: T }>;
  post: <T = unknown>(url: string, body?: unknown, options?: SpotifyOptions) => Promise<{ data: T }>;
  put: <T = unknown>(url: string, body?: unknown, options?: SpotifyOptions) => Promise<{ data: T }>;
  raw: typeof ky;
};

// Native ky instance for API calls
export function instance(): ApiInstance {
  const kyInstance = createKyInstance();

  return {
    delete: async <T = unknown>(url: string, options?: SpotifyOptions): Promise<{ data: T }> => {
      const opts: Options = { ...options };
      if (options?.data) {
        // Extract the data property from options and set it as json
        opts.json = options.data;
      }
      const response = await kyInstance.delete(url, opts);
      try {
        const data = await response.json<T>();
        return { data };
      } catch {
        return { data: {} as T };
      }
    },
    get: async <T = unknown>(url: string, options?: SpotifyOptions): Promise<{ data: T }> => {
      const response = await kyInstance.get(url, options);
      try {
        const data = await response.json<T>();
        return { data };
      } catch {
        return { data: {} as T };
      }
    },
    patch: async <T = unknown>(url: string, body?: unknown, options?: SpotifyOptions): Promise<{ data: T }> => {
      const opts: Options = { ...options };
      if (body) {
        opts.json = body;
      }
      const response = await kyInstance.patch(url, opts);
      try {
        const data = await response.json<T>();
        return { data };
      } catch {
        return { data: {} as T };
      }
    },
    post: async <T = unknown>(url: string, body?: unknown, options?: SpotifyOptions): Promise<{ data: T }> => {
      const opts: Options = { ...options };
      if (body) {
        opts.json = body;
      }
      const response = await kyInstance.post(url, opts);
      try {
        const data = await response.json<T>();
        return { data };
      } catch {
        return { data: {} as T };
      }
    },
    put: async <T = unknown>(url: string, body?: unknown, options?: SpotifyOptions): Promise<{ data: T }> => {
      const opts: Options = { ...options };
      if (body) {
        opts.json = body;
      }
      const response = await kyInstance.put(url, opts);
      try {
        const data = await response.json<T>();
        return { data };
      } catch {
        return { data: {} as T };
      }
    },
    // Direct access to the ky instance
    raw: kyInstance,
  };
}

// Base ky instance
function createKyInstance(): typeof ky {
  const authStore = useAuth();

  return ky.create({
    headers: {
      Authorization: `Bearer ${authStore.accessToken}`,
      "Content-Type": "application/json",
    },
    prefixUrl: api.url,
    timeout: 5000,
  });
}

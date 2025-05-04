import ky, { Options } from "ky";

import { SpotifyOptions } from "./@types/Api";
import { useAuth } from "./views/auth/AuthStore";

export const api = {
  clientId: "29a0936f4c6c46399f33f6f60a0855e8",
  redirectUri:
    process.env.NODE_ENV !== "production" ? "http://localhost:3000/auth" : "http://beardify.netlify.app/auth",
  scopes:
    "user-read-private,user-modify-playback-state,user-read-playback-state,user-read-currently-playing,playlist-read-private,playlist-read-collaborative,playlist-modify-private,playlist-modify-public,user-follow-modify,user-follow-read,streaming,user-read-email,user-top-read,user-library-read,user-read-playback-position,user-read-recently-played",
  url: "https://api.spotify.com/v1/",
};

// Type pour les méthodes d'instance API
type ApiInstance = {
  delete: <T = unknown>(url: string, options?: SpotifyOptions) => Promise<{ data: T }>;
  get: <T = unknown>(url: string, options?: SpotifyOptions) => Promise<{ data: T }>;
  patch: <T = unknown>(url: string, body?: unknown, options?: SpotifyOptions) => Promise<{ data: T }>;
  post: <T = unknown>(url: string, body?: unknown, options?: SpotifyOptions) => Promise<{ data: T }>;
  put: <T = unknown>(url: string, body?: unknown, options?: SpotifyOptions) => Promise<{ data: T }>;
  raw: typeof ky;
};

// Instance native de ky pour les appels API
export function instance(): ApiInstance {
  const kyInstance = createKyInstance();

  return {
    delete: async <T = unknown>(url: string, options?: SpotifyOptions): Promise<{ data: T }> => {
      const response = await kyInstance.delete(url, options);
      try {
        const data = await response.json<T>();
        return { data };
      } catch {
        return { data: {} as T };
      }
    },
    get: async <T = unknown>(url: string, options?: SpotifyOptions): Promise<{ data: T }> => {
      const response = await kyInstance.get(url, options);
      const data = await response.json<T>();
      return { data };
    },
    patch: async <T = unknown>(url: string, body?: unknown, options?: SpotifyOptions): Promise<{ data: T }> => {
      const opts: Options = { ...(options || {}) };
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
      const opts: Options = { ...(options || {}) };
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
      const opts: Options = { ...(options || {}) };
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
    // Accès direct à l'instance ky
    raw: kyInstance,
  };
}

// Instance ky de base
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

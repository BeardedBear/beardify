import ky from "ky";

import { ExtendedOptions, kyDelete, kyGet, kyPatch, kyPost, kyPut } from "./helpers/ky-adapter";
import { useAuth } from "./views/auth/AuthStore";

// Interface pour étendre la promesse avec une méthode json()
interface JsonPromise<T> extends Promise<T> {
  json<J>(): Promise<J>;
}

export const api = {
  clientId: "29a0936f4c6c46399f33f6f60a0855e8",
  redirectUri:
    process.env.NODE_ENV !== "production" ? "http://localhost:3000/auth" : "http://beardify.netlify.app/auth",
  scopes:
    "user-read-private,user-modify-playback-state,user-read-playback-state,user-read-currently-playing,playlist-read-private,playlist-read-collaborative,playlist-modify-private,playlist-modify-public,user-follow-modify,user-follow-read,streaming,user-read-email,user-top-read,user-library-read,user-read-playback-position,user-read-recently-played",
  url: "https://api.spotify.com/v1/",
};

// Instance compatible avec l'API axios et ky
export function instance(): {
  delete: <T = unknown>(url: string, options?: ExtendedOptions) => JsonPromise<{ data: T }>;
  get: <T = unknown>(url: string, options?: ExtendedOptions) => JsonPromise<{ data: T }>;
  patch: <T = unknown>(url: string, body?: unknown, options?: ExtendedOptions) => JsonPromise<{ data: T }>;
  post: <T = unknown>(url: string, body?: unknown, options?: ExtendedOptions) => JsonPromise<{ data: T }>;
  put: <T = unknown>(url: string, body?: unknown, options?: ExtendedOptions) => JsonPromise<{ data: T }>;
  raw: typeof ky;
} {
  const kyInstance = createKyInstance();

  // Fonction utilitaire pour ajouter une méthode json() à une promesse
  function addJsonMethod<T>(promise: Promise<T>): JsonPromise<T> {
    // Ajoute la méthode json() à la promesse
    (promise as { json?: <J>() => Promise<J> }).json = function <J>(): Promise<J> {
      return promise.then((response) => {
        if (response && typeof response === "object" && "data" in response) {
          return (response as { data: unknown }).data as J;
        }
        return response as unknown as J;
      });
    };
    return promise as JsonPromise<T>;
  }

  return {
    delete: <T = unknown>(url: string, options?: ExtendedOptions): JsonPromise<{ data: T }> =>
      addJsonMethod(kyDelete<T>(kyInstance, url, options)),
    get: <T = unknown>(url: string, options?: ExtendedOptions): JsonPromise<{ data: T }> =>
      addJsonMethod(kyGet<T>(kyInstance, url, options)),
    patch: <T = unknown>(url: string, body?: unknown, options?: ExtendedOptions): JsonPromise<{ data: T }> =>
      addJsonMethod(kyPatch<T>(kyInstance, url, body, options)),
    post: <T = unknown>(url: string, body?: unknown, options?: ExtendedOptions): JsonPromise<{ data: T }> =>
      addJsonMethod(kyPost<T>(kyInstance, url, body, options)),
    put: <T = unknown>(url: string, body?: unknown, options?: ExtendedOptions): JsonPromise<{ data: T }> =>
      addJsonMethod(kyPut<T>(kyInstance, url, body, options)),
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

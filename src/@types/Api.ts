import type { Options } from "ky";

// Types pour les options spécifiques à l'API Spotify
export interface SpotifyOptions extends Options {
  context_uri?: string;
  data?: unknown;
  device_id?: string;
  device_ids?: string[];
  insert_before?: number;
  name?: string;
  position_ms?: number;
  uris?: string[];
}

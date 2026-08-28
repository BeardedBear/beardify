/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly VITE_REDIRECT_URI_DEV: string;
  readonly VITE_REDIRECT_URI_PROD: string;
  readonly VITE_SPOTIFY_CLIENT_ID: string;
  /** Supabase project holding the scraped release listing. Optional: the source degrades to nothing. */
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_URL: string;
}

/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly VITE_REDIRECT_URI_DEV: string;
  readonly VITE_REDIRECT_URI_PROD: string;
  readonly VITE_SPOTIFY_CLIENT_ID: string;
}

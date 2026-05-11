interface TauriWindow extends Window {
  __TAURI_INTERNALS__?: unknown;
}

export const isTauri = (): boolean =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in (window as TauriWindow);

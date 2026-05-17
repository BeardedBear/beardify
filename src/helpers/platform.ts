interface TauriWindow extends Window {
  __TAURI_INTERNALS__?: unknown;
}

/**
 * Returns true when the app is running inside a Tauri desktop window.
 * Detected by the presence of the `__TAURI_INTERNALS__` property injected by the Tauri runtime.
 */
export const isTauri = (): boolean =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in (window as TauriWindow);

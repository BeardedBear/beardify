import { isTauri } from "@/helpers/platform";

/**
 * Open a URL in the appropriate way depending on the runtime environment.
 * Uses Tauri's native opener when running as a desktop app, falls back to window.open.
 * @param url - The URL to open
 */
export async function openLink(url: string): Promise<void> {
  if (isTauri()) {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  } else {
    window.open(url, "_blank");
  }
}

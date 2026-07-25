import { isTauri } from "@/helpers/platform";

/**
 * Open a URL in the appropriate way depending on the runtime environment.
 * Uses Tauri's native opener when running as a desktop app, falls back to window.open.
 * Only http(s) URLs are opened: window.open("javascript:...") executes in a document
 * that inherits this origin, so third-party URLs (Discogs, MusicBrainz) must be filtered.
 * @param url - The URL to open
 */
export async function openLink(url: string): Promise<void> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return;

  if (isTauri()) {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  } else {
    window.open(url, "_blank");
  }
}

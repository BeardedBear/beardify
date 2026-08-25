/**
 * Minimal shape of the Spotify SDK's `track_window.current_track` — the full
 * types differ between the SDK and the Web API, so only what the title needs
 * is required here.
 */
interface WindowTrack {
  artists: { name: string }[];
  name: string;
}

/**
 * Builds the window title: "Artists — Track" when something is playing,
 * otherwise the plain app name. Shared by the native taskbar title
 * (tauriBootstrap) and the custom TitleBar.
 */
export function getWindowTitle(track?: null | WindowTrack): string {
  return track?.name ? `${track.artists.map((a) => a.name).join(", ")} — ${track.name}` : "Beardify";
}

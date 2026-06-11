/**
 * Remove all authentication and persisted app-state keys from localStorage and sessionStorage.
 * Config, sidebar, and player keys are intentionally preserved across logouts.
 */
export function clearAuthData(): void {
  const authKeys = [
    "Beardify",
    "beardify-auth",
    // "beardify-config",
    // "beardify-sidebar",
    // "beardify-player",
    "spotify_token_last_refresh",
  ];

  authKeys.forEach((key) => {
    localStorage.removeItem(key);
  });

  sessionStorage.removeItem("spotify_token_last_refresh");
}

/**
 * Nettoie toutes les données d'authentification et d'état de l'application
 * du localStorage pour repartir sur des bases saines
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

  // Nettoyer aussi le sessionStorage si nécessaire
  sessionStorage.removeItem("spotify_token_last_refresh");
}

/**
 * Effectue une déconnexion complète et redirige vers la page de login
 */
export function logoutAndRedirect(): void {
  clearAuthData();
  window.location.href = "/login";
}

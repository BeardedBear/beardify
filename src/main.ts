import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createApp } from "vue";

import { NotificationType } from "./@types/Notification";
import App from "./App.vue";
import { useConfig } from "./components/config/ConfigStore";
import { clearAuthData } from "./helpers/authUtils";
import { notification } from "./helpers/notifications";
import router, { RouteName } from "./router";
import { useAuth } from "./views/auth/AuthStore";

// Global handler for Spotify SDK errors
const handleSpotifySDKErrors = (): void => {
  window.addEventListener("error", (event) => {
    // Check if the error is related to the Spotify SDK
    if (
      event.message &&
      (event.message.includes("Spotify") || event.message.includes("playback") || event.message.includes("player"))
    ) {
      // Silent error handling for non-critical SDK errors
      event.preventDefault(); // Prevent error propagation
    }
  });

  // Handle unhandled promise rejections (very common with the Spotify SDK)
  window.addEventListener("unhandledrejection", (event) => {
    if (
      event.reason &&
      event.reason.message &&
      (event.reason.message.includes("PlayLoad") ||
        event.reason.message.includes("Spotify") ||
        event.reason.message.includes("404") ||
        event.reason.message.includes("item_before_load"))
    ) {
      // Common Spotify SDK errors during playback
      event.preventDefault(); // Prevent error display in console

      // Completely suppress PlayLoad 404 errors (very common and harmless)
      if (event.reason.message.includes("PlayLoad event failed with status 404")) {
        // Silent handling - these errors are expected and harmless with the Spotify SDK
        // They typically occur during item transitions or when connection state changes
        return;
      }

      // For other PlayLoad errors that might need token refresh
      if (event.reason.message.includes("PlayLoad event failed")) {
        const authStore = useAuth();
        // Check if the token hasn't been refreshed recently
        const lastRefresh = sessionStorage.getItem("spotify_token_last_refresh");
        const now = Date.now();

        if (!lastRefresh || now - parseInt(lastRefresh) > 300000) {
          // 5 minutes
          sessionStorage.setItem("spotify_token_last_refresh", now.toString());

          authStore
            .refresh()
            .then(() => {
              // No notification needed in case of success
            })
            .catch(() => {
              // In case of failure, inform the user only if necessary
              notification({
                msg: "Connection problem with Spotify. Try reconnecting.",
                type: NotificationType.Warning,
              });
            });
        }
      }
    }
  });
};

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);

function syncLS(key: string, value: string): void {
  if (!localStorage.getItem(key)) localStorage.setItem(key, value);
}

// Initialize the Spotify SDK error handler
handleSpotifySDKErrors();

const authStore = useAuth();

// Check if we have a refresh token before attempting refresh
if (authStore.storage?.refreshToken) {
  authStore
    .refresh()
    .then((done) => {
      if (done) {
        app.mount("#app");
        useConfig().switchScheme(useConfig().schemeLabel);
        useConfig().switchTheme(useConfig().themeLabel);
        syncLS("beardify-config", JSON.stringify(useConfig().$state));
        syncLS("beardify-auth", JSON.stringify(useAuth().$state));
      }
    })
    .catch((error) => {
      // Check error type to decide whether to clear localStorage
      const errorMessage = error?.message || String(error);

      // If it's a 400/401 error, the refresh token is probably invalid
      if (errorMessage.includes("400") || errorMessage.includes("401") || errorMessage.includes("invalid_grant")) {
        clearAuthData();
      }

      // In all cases, mount the app and redirect to login
      app.mount("#app");
      router.push(`${RouteName.Login}?ref=${window.location.pathname}`);
    });
} else {
  // No refresh token, go directly to login without clearing localStorage
  app.mount("#app");
  router.push(`${RouteName.Login}?ref=${window.location.pathname}`);
}

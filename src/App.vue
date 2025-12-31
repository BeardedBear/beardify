<template>
  <template v-if="useRoute().name === 'Login'"><router-view></router-view></template>
  <template v-else>
    <DialogList />
    <div id="app-content">
      <Sidebar />
      <div class="main-content">
        <MobileHeader />
        <router-view :key="useRoute().fullPath" v-slot="{ Component }"><component :is="Component" /></router-view>
      </div>
    </div>
    <Player key="player" />
    <Notification />
    <Frame />
    <MinimizedWindows />
  </template>
</template>

<script lang="ts" setup>
import { onBeforeUnmount } from "vue";
import { RouterView, useRoute } from "vue-router";

import DialogList from "@/components/dialog/DialogList.vue";
import { useDialog } from "@/components/dialog/DialogStore";
import Frame from "@/components/frame/FrameIndex.vue";
import MinimizedWindows from "@/components/minimized/MinimizedWindows.vue";
import Notification from "@/components/notification/NotificationIndex.vue";
import Player from "@/components/player/PlayerIndex.vue";
import { usePlayer } from "@/components/player/PlayerStore";
import MobileHeader from "@/components/sidebar/MobileHeader.vue";
import Sidebar from "@/components/sidebar/SidebarIndex.vue";
import { useKeyboardEvents } from "@/helpers/useKeyboardEvents";
import { useAuth } from "@/views/auth/AuthStore";

useKeyboardEvents();

const authStore = useAuth();
const dialog = useDialog();

// Check Widevine support for Brave Browser
if (!navigator.userAgent.includes("Macintosh")) {
  (async () => {
    const config = [
      {
        audioCapabilities: [{ contentType: 'audio/mp4;codecs="mp4a.40.2"' }],
        initDataTypes: ["cenc"],
      },
    ];
    try {
      await navigator.requestMediaKeySystemAccess("com.widevine.alpha", config);
    } catch {
      dialog.open({ type: "widevine" });
    }
  })();
}

// Keep token active - store interval ID for cleanup
// Refresh every 20 minutes for safety margin (tokens expire after 1 hour)
const tokenRefreshInterval = setInterval(async () => {
  try {
    await authStore.refresh();
  } catch {
    // silent keep-alive failure
  }
}, 1_200_000); // 20 minutes

// Keep device active every 5 minutes - store interval ID for cleanup
const deviceRefreshInterval = setInterval(async () => {
  try {
    await usePlayer().getDeviceList();
  } catch {
    // silent
  }
}, 300_000);

// Refresh token when the page becomes visible again after being hidden
// This handles cases where the user closes the laptop, switches tabs for a long time, etc.
const handleVisibilityChange = async (): Promise<void> => {
  if (!document.hidden) {
    // Check if we need to refresh the token based on time elapsed
    const lastRefresh = localStorage.getItem("spotify_token_last_refresh");
    const now = Date.now();
    const REFRESH_THRESHOLD = 15 * 60 * 1000; // 15 minutes (safety margin before 20min interval)

    if (!lastRefresh || now - parseInt(lastRefresh) > REFRESH_THRESHOLD) {
      // Token needs refresh
      let retries = 3; // Multiple attempts to keep the session alive
      while (retries > 0) {
        try {
          await authStore.refresh();
          await usePlayer().getDeviceList();
          break; // Success, exit retry loop
        } catch {
          retries--;
          if (retries > 0) {
            // Wait a bit before retrying (exponential backoff)
            await new Promise((resolve) => setTimeout(resolve, 2000 * (4 - retries)));
          }
          // If all retries fail, the API error handler will eventually redirect to login
        }
      }
    } else {
      // Token is still fresh, just refresh device list
      try {
        await usePlayer().getDeviceList();
      } catch {
        // silent
      }
    }
  }
};

document.addEventListener("visibilitychange", handleVisibilityChange);

// Cleanup intervals and event listeners when app is unmounted
onBeforeUnmount(() => {
  clearInterval(tokenRefreshInterval);
  clearInterval(deviceRefreshInterval);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});
</script>

<style lang="scss">
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/responsive" as responsive;
@use "@/assets/scss/heading" as heading;
@use "@/assets/scss/mixins" as mixins;
@use "@/assets/scss/typography" as typography;
@import "../node_modules/normalize.css/normalize.css";

*,
*::before,
*::after {
  box-sizing: border-box;
}

input {
  &::placeholder {
    color: var(--font-color);
    font-style: italic;
    opacity: 0.3;
  }
}


body {
  overflow: hidden;
  scrollbar-color: var(--primary-color-dark) var(--bg-color-dark);
  scrollbar-width: thin;
}

::selection {
  background-color: var(--primary-color-dark);
}

::-webkit-scrollbar {
  height: 0.6rem;
  width: 0.6rem;
}

::-webkit-scrollbar-corner {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-clip: content-box;
  background-color: var(--bg-color-light);
  border: 2px solid transparent;
}

::-webkit-scrollbar-track {
  background-color: rgb(0 0 0 / 0%);
}

#app {
  background-color: var(--bg-color-darker);
  color: var(--font-color);
  display: grid;
  font-family: "IBM Plex Sans Condensed", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  grid-template-rows: 1fr auto;
  height: 100vh;
  line-height: 1.4;
  min-height: 100vh;
  overflow: hidden;
}

#app-content {
  display: grid;
  grid-template-columns: 19rem 1fr;
  overflow: hidden;
  position: relative;

  @include responsive.hdpi {
    grid-template-columns: 25rem 1fr;
  }

  @include responsive.tablet-down {
    grid-template-columns: 1fr;
  }
}

.main-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.loading {
  display: grid;
  place-content: center;
}
</style>

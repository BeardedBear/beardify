<template>
  <template v-if="useRoute().name === 'Login'">
    <router-view />
  </template>
  <template v-else>
    <DialogList />
    <div id="app-content">
      <Sidebar />
      <div class="main-content">
        <MobileHeader />
        <router-view v-slot="{ Component, route }">
          <component :is="Component" :key="route.fullPath" />
        </router-view>
      </div>
    </div>
    <Player key="player" />
    <PlayerSlideUp />
    <Notification />
    <Frame />
    <MinimizedWindows />
    <UpdateToast />
  </template>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted } from "vue";
import { RouterView, useRoute } from "vue-router";

import DialogList from "@/components/dialog/DialogList.vue";
import { useDialog } from "@/components/dialog/DialogStore";
import Frame from "@/components/frame/FrameIndex.vue";
import MinimizedWindows from "@/components/minimized/MinimizedWindows.vue";
import Notification from "@/components/notification/NotificationIndex.vue";
import Player from "@/components/player/PlayerIndex.vue";
import PlayerSlideUp from "@/components/player/PlayerSlideUp.vue";
import { usePlayer } from "@/components/player/PlayerStore";
import MobileHeader from "@/components/sidebar/MobileHeader.vue";
import Sidebar from "@/components/sidebar/SidebarIndex.vue";
import UpdateToast from "@/components/ui/UpdateToast.vue";
import { useUpdater } from "@/composables/useUpdater";
import { isTauri } from "@/helpers/platform";
import { sleep } from "@/helpers/sleep";
import { useKeyboardEvents } from "@/helpers/useKeyboardEvents";
import { useAuth } from "@/views/auth/AuthStore";

useKeyboardEvents();

const authStore = useAuth();
const { checkForUpdate } = useUpdater();
const dialog = useDialog();

onMounted(() => {
  if (isTauri()) {
    setTimeout(() => checkForUpdate().catch(() => undefined), 5_000);
  }
});

// Check Widevine support for Brave Browser
if (!navigator.userAgent.includes("Macintosh")) {
  (async () => {
    const config = [
      {
        audioCapabilities: [{ contentType: "audio/mp4;codecs=\"mp4a.40.2\"" }],
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

// Token auto-refresh is handled by AuthStore.startAutoRefresh() called in main.ts.
// No duplicate interval here.

// Keep device list fresh every 5 minutes
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
    const lastRefresh = localStorage.getItem("spotify_token_last_refresh");
    const now = Date.now();
    const REFRESH_THRESHOLD = 15 * 60 * 1000; // 15 minutes

    if (!lastRefresh || now - parseInt(lastRefresh) > REFRESH_THRESHOLD) {
      let retries = 3;
      while (retries > 0) {
        try {
          await authStore.refresh();
          break;
        } catch {
          retries--;
          if (retries > 0) {
            await sleep(2000 * (4 - retries));
          }
        }
      }
    }

    try {
      await usePlayer().getDeviceList();
    } catch {
      // silent
    }
  }
};

document.addEventListener("visibilitychange", handleVisibilityChange);

onBeforeUnmount(() => {
  clearInterval(deviceRefreshInterval);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});
</script>

<style lang="scss">
@use "@/assets/scss/button";
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/font-size" as *;
@use "@/assets/scss/responsive" as responsive;
@use "@/assets/scss/heading" as heading;
@use "@/assets/scss/mixins" as *;
@use "@/assets/scss/typography" as typography;
@import "../node_modules/normalize.css/normalize.css";

*,
*::before,
*::after {
  box-sizing: border-box;
}

input {
  &::placeholder {
    @include font-italic;

    color: var(--font-color);
    font-size: var(--font-size-base);
    opacity: 0.3;
  }
}

body {
  font-family: var(--font-family-base);
  -webkit-font-smoothing: subpixel-antialiased;
  -webkit-font-smoothing: antialiased;
  font-variation-settings:
    "slnt" var(--font-variation-slnt),
    "wdth" var(--font-variation-wdth),
    "GRAD" var(--font-variation-grad),
    "ROND" var(--font-variation-rond),
    "wght" var(--font-variation-wght);
  overflow: hidden;
  scrollbar-color: var(--bg-color-light) var(--bg-color-dark);
  scrollbar-width: thin;

  /* Improve font rendering on many platforms */
  text-rendering: optimizelegibility;

  @include responsive.tablet-up {
    --font-variation-wdth: 70;
  }
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
  font-optical-sizing: auto;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  grid-template-rows: 1fr auto;
  height: 100dvh;
  line-height: 1.4;
  min-height: 100dvh;
  overflow: hidden;
  text-rendering: optimizelegibility;
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

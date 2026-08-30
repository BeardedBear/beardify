<template>
  <TitleBar v-if="showTitleBar" />
  <template v-if="route.meta.chromeless">
    <router-view />
  </template>
  <template v-else>
    <DialogList />
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div id="app-content">
      <Sidebar />
      <main id="main-content" class="main-content" tabindex="-1">
        <MobileHeader />
        <router-view v-slot="{ Component, route: currentRoute }">
          <component :is="Component" :key="currentRoute.fullPath" />
        </router-view>
      </main>
    </div>
    <Player key="player" />
    <PlayerSlideUp />
    <BdToaster />
    <Frame />
    <MinimizedWindows />
    <UpdateToast />
  </template>
</template>

<script lang="ts" setup>
import { BdToaster } from "bearded-ui";
import { defineAsyncComponent, onBeforeUnmount, onMounted } from "vue";
import { RouterView, useRoute } from "vue-router";

import { useDialog } from "@/components/dialog/DialogStore";
import { usePlayer } from "@/components/player/PlayerStore";
import UpdateToast from "@/components/ui/UpdateToast.vue";
import { useUpdater } from "@/composables/useUpdater";
import { isTauri } from "@/helpers/platform";
import { sleep } from "@/helpers/sleep";
import { useKeyboardEvents } from "@/helpers/useKeyboardEvents";
import { useAuth } from "@/views/auth/AuthStore";

/*
 * The whole shell lives behind `v-else`, so a chromeless route — the public
 * /share page, the OAuth callback — renders none of it. Importing it statically
 * still pulled the sidebar, the player and every dialog into the entry chunk,
 * which meant a stranger opening a shared link downloaded the entire logged-in
 * app before seeing a single cover. Async, they follow the branch that uses
 * them.
 */
const DialogList = defineAsyncComponent(() => import("@/components/dialog/DialogList.vue"));
const Frame = defineAsyncComponent(() => import("@/components/frame/FrameIndex.vue"));
const MinimizedWindows = defineAsyncComponent(() => import("@/components/minimized/MinimizedWindows.vue"));
const MobileHeader = defineAsyncComponent(() => import("@/components/sidebar/MobileHeader.vue"));
const Player = defineAsyncComponent(() => import("@/components/player/PlayerIndex.vue"));
const PlayerSlideUp = defineAsyncComponent(() => import("@/components/player/PlayerSlideUp.vue"));
const Sidebar = defineAsyncComponent(() => import("@/components/sidebar/SidebarIndex.vue"));
const TitleBar = defineAsyncComponent(() => import("@/components/titlebar/TitleBar.vue"));

useKeyboardEvents();

const authStore = useAuth();
const { checkForUpdate } = useUpdater();
const dialog = useDialog();
const route = useRoute();
// Custom title bar replaces the native one in the Tauri desktop build.
const showTitleBar = isTauri();

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

// Chromeless routes render without a Spotify session (see the branch above) —
// polling for a device list or refreshing a token there would only waste requests.
const hasNoSession = (): boolean => !!route.meta.chromeless;

// Keep device list fresh every 5 minutes
const deviceRefreshInterval = setInterval(async () => {
  if (hasNoSession()) return;
  try {
    await usePlayer().getDeviceList();
  } catch {
    // silent
  }
}, 300_000);

// Refresh token when the page becomes visible again after being hidden
// This handles cases where the user closes the laptop, switches tabs for a long time, etc.
const handleVisibilityChange = async (): Promise<void> => {
  if (!document.hidden && !hasNoSession()) {
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

    // Reconnects the SDK, refreshes the device list and re-reads playback:
    // after a long sleep all three are stale (the SDK still says "playing").
    await usePlayer().resyncPlayback();
  }
};

document.addEventListener("visibilitychange", handleVisibilityChange);

// Suspend detection: a sleeping machine freezes timers without ever hiding the tab, so
// visibilitychange never fires and the SDK state stays stale ("playing" forever).
// A wall-clock gap much larger than the tick means we just came back from a suspend.
const SUSPEND_TICK_MS = 5000;
const SUSPEND_GAP_MS = 15_000;
let lastTick = Date.now();
const suspendCheckInterval = setInterval(() => {
  const now = Date.now();
  const gap = now - lastTick;
  lastTick = now;
  if (gap > SUSPEND_GAP_MS) handleVisibilityChange();
}, SUSPEND_TICK_MS);

onBeforeUnmount(() => {
  clearInterval(deviceRefreshInterval);
  clearInterval(suspendCheckInterval);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});
</script>

<style>
@import url("../node_modules/normalize.css/normalize.css");
@import url("@/assets/css/index.css");

*,
*::before,
*::after {
  box-sizing: border-box;
}

input {
  &::placeholder {
    color: var(--bd-font-color-dark);
    font-size: var(--bd-font-size-base);
    font-style: var(--bd-style-italic-fallback);
    font-variation-settings: var(--bd-font-variation-settings-italic);
  }
}

body {
  /*
   * Le curseur de saisie et les contrôles natifs (case à cocher, `input[type=range]`
   * là où il n'est pas entièrement redessiné) arrivent avec le bleu du système.
   * Ce sont les dernières surfaces du navigateur qui n'appartenaient à aucun thème.
   */
  accent-color: var(--bd-primary);
  caret-color: var(--bd-primary);
  font-family: var(--bd-font-family);
  -webkit-font-smoothing: antialiased;
  font-stretch: var(--bd-font-stretch);
  font-variation-settings: var(--bd-font-variation-settings);
  overflow: hidden;
  scrollbar-color: var(--bd-bg-light) var(--bd-bg-dark);
  scrollbar-width: thin;

  /* Improve font rendering on many platforms */
  text-rendering: optimizelegibility;
}

/*
 * La couleur du texte manquait : la sélection ne reposait que sur un fond. Sur
 * un thème clair, `--bd-primary-dark` est un accent sombre et le texte
 * restait `--bd-font-color`, sombre lui aussi — sélection illisible.
 */
::selection {
  background-color: var(--bd-primary-dark);
  color: var(--bd-on-primary);
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
  background-color: var(--bd-bg-light);
  border: 2px solid transparent;
}

::-webkit-scrollbar-track {
  background-color: rgb(0 0 0 / 0%);
}

#app {
  background-color: var(--bd-bg-darker);
  color: var(--bd-font-color);
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

/*
 * When the custom title bar is rendered (Tauri build only), it takes a row of
 * its own at the top; `:has()` keeps index.html's #app untouched.
 */
#app:has(> .titlebar) {
  grid-template-rows: auto 1fr auto;
}

/*
 * The rail width lives in layout.css as --sidebar-width so overlays that must
 * clear it (MinimizedWindows) read the same number instead of hardcoding their
 * own. Below --tablet-down the token is 0 and the sidebar overlays rather than
 * occupying a column, so the grid collapses to one track.
 */
#app-content {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  overflow: hidden;
  position: relative;

  @media (--tablet-down) {
    grid-template-columns: 1fr;
  }
}

.main-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* Focused only via the skip link, so it must not draw a ring of its own. */
  &:focus {
    outline: none;
  }
}

/*
 * Off-screen until focused rather than `display: none`, which would take it out
 * of the tab order and defeat the point. First stop for a keyboard user, and
 * the only way past the sidebar's long playlist list.
 */
.skip-link {
  background-color: var(--bd-bg-light);
  border-radius: 0 0 var(--bd-radius-sm);
  color: var(--bd-font-color);
  left: 0;
  padding: var(--bd-space-2) var(--bd-space-4);
  position: fixed;
  text-decoration: none;
  top: 0;
  transform: translateY(-110%);
  z-index: 10000;

  &:focus-visible {
    transform: translateY(0);
  }
}

.loading {
  display: grid;
  place-content: center;
}
</style>

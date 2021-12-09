<template>
  <Dialog />
  <Topbar />
  <div id="app__content">
    <Sidebar />
    <router-view v-slot="{ Component }" :key="$route.fullPath">
      <transition name="scale" mode="out-in"><component :is="Component" /></transition>
    </router-view>
  </div>
  <Player key="player" />
  <Notification />
</template>

<script lang="ts" setup>
import Topbar from "./components/Topbar.vue";
import Player from "./components/player/Player.vue";
import Sidebar from "./components/sidebar/Sidebar.vue";
import Dialog from "./components/dialog/Dialog.vue";
import Notification from "./components/notification/Notification.vue";
import { useAuth } from "./views/auth/AuthStore";
import { usePlayer } from "./components/player/PlayerStore";
import { useWindowFocus } from "@vueuse/core";
import { watch } from "vue";
import { useDialog } from "./components/dialog/DialogStore";

const authStore = useAuth();
const playerStore = usePlayer();
const focused = useWindowFocus();
const dialog = useDialog();

// Check Widevine support for Brave Browser
if (!navigator.userAgent.includes("Macintosh")) {
  const config = [{ initDataTypes: ["cenc"], audioCapabilities: [{ contentType: 'audio/mp4;codecs="mp4a.40.2"' }] }];
  navigator.requestMediaKeySystemAccess("com.widevine.alpha", config).catch(() => {
    dialog.open({ type: "widevine" });
  });
}

// Keep token active
setInterval(() => authStore.refresh(), 1800000); // 30 minutes

// Keep device active
setInterval(() => playerStore.getDeviceList(), 900000); // 15 minutes

watch(focused, (isFocused) => {
  if (isFocused) {
    playerStore.getPlayerState();
    document.dispatchEvent(new CustomEvent("updateState"));
  }
});
</script>

<style lang="scss">
@import "../node_modules/normalize.css/normalize.css";
@import "./assets/scss/button";
@import "./assets/scss/colors";
@import "./assets/scss/heading";
@import "./assets/scss/mixins";

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  font-size: 16px;

  @media (min-resolution: 2.9dppx) {
    font-size: 32px;
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
  height: 0.4rem;
  width: 0.4rem;
}

::-webkit-scrollbar-corner {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-clip: content-box;
  background-color: var(--primary-color-dark);
}

::-webkit-scrollbar-track {
  background-color: rgb(0 0 0 / 0%);
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.1s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: translateY(-0.4rem);
}

#app {
  background-color: var(--bg-color-darker);
  color: var(--font-color);
  display: grid;
  font-family: "IBM Plex Sans Condensed", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
  line-height: 1.4;
  min-height: 100vh;
  overflow: hidden;

  &__content {
    display: grid;
    grid-template-columns: 19rem 1fr;
    overflow: hidden;
  }
}

.loading {
  display: grid;
  place-content: center;
}
</style>

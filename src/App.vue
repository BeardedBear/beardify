<template>
  <template v-if="useRoute().name === 'Login'"><router-view></router-view></template>
  <template v-else>
    <DialogList />
    <div id="app__content">
      <Sidebar />
      <router-view v-slot="{ Component }" :key="useRoute().fullPath"><component :is="Component" /></router-view>
    </div>
    <Player key="player" />
    <Notification />
    <Frame />
  </template>
</template>

<script lang="ts" setup>
import { RouterView, useRoute } from "vue-router";
import DialogList from "./components/dialog/DialogList.vue";
import { useDialog } from "./components/dialog/DialogStore";
import Frame from "./components/frame/FrameIndex.vue";
import Notification from "./components/notification/NotificationIndex.vue";
import Player from "./components/player/PlayerIndex.vue";
import { usePlayer } from "./components/player/PlayerStore";
import Sidebar from "./components/sidebar/SidebarIndex.vue";
import { useKeyboardEvents } from "./helpers/useKeyboardEvents";
import { useAuth } from "./views/auth/AuthStore";

useKeyboardEvents();

const authStore = useAuth();
const dialog = useDialog();

// Check Widevine support for Brave Browser
if (!navigator.userAgent.includes("Macintosh")) {
  const config = [{ initDataTypes: ["cenc"], audioCapabilities: [{ contentType: 'audio/mp4;codecs="mp4a.40.2"' }] }];
  navigator.requestMediaKeySystemAccess("com.widevine.alpha", config).catch(() => {
    dialog.open({ type: "widevine" });
  });
}

// Keep token active
setInterval(() => authStore.refresh(), 1_800_000); // 30 minutes

// Keep device active every 5 minutes
setInterval(() => usePlayer().getDeviceList(), 300_000);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) usePlayer().getDeviceList();
});
</script>

<style lang="scss">
@import "../node_modules/normalize.css/normalize.css";
@import "./assets/scss/button";
@import "./assets/scss/colors";
@import "./assets/scss/responsive";
@import "./assets/scss/heading";
@import "./assets/scss/mixins";

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  font-size: 16px;

  @media (resolution >= 2.9dppx) {
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

  &__content {
    display: grid;
    grid-template-columns: 19rem 1fr;
    overflow: hidden;

    @include hdpi {
      grid-template-columns: 25rem 1fr;
    }
  }
}

.loading {
  display: grid;
  place-content: center;
}
</style>

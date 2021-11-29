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
import { api } from "./api";
import Sidebar from "./components/sidebar/Sidebar.vue";
import Dialog from "./components/dialog/Dialog.vue";
import router, { RouteName } from "./router";
import Notification from "./components/notification/Notification.vue";
import { useAuth } from "./views/auth/AuthStore";
import { useSidebar } from "./components/sidebar/SidebarStore";
import { usePlayer } from "./components/player/PlayerStore";
import { useWindowFocus } from "@vueuse/core";

const authStore = useAuth();
const sidebarStore = useSidebar();
const playerStore = usePlayer();

// onMounted(() => {
//   if (localS) {
//     const storage: Storage = JSON.parse(localS || "");
//     configStore.switchTheme(storage.config.themeLabel);
//     configStore.switchScheme(storage.config.schemeLabel);
//   }
// });

// watch([authStore, configStore], ([auth, config]) => {
//   localStorage.setItem(storageLabel, JSON.stringify({ auth, config }));
// });

// Keep app active
setInterval(() => {
  playerStore.getPlayerState();
  authStore.refresh();
}, 120000); // 2 minutes

if (useWindowFocus()) playerStore.getPlayerState();

setInterval(() => {
  if (document.hasFocus() && router.currentRoute.value.path !== RouteName.Login) {
    if (!sidebarStore.playlists.length) sidebarStore.getPlaylists(`${api.url}me/playlists?limit=50`);
    playerStore.getPlayerState();
  }
}, 1000);

addEventListener("initdevice", ((e: CustomEvent) => {
  playerStore.thisDevice(e.detail.thisDevice);
}) as { (): void });
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

body {
  overflow: hidden;
}

::selection {
  background-color: var(--primary-color);
}

::-webkit-scrollbar {
  height: 5px;
  width: 5px;
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
  transform: translateY(-5px);
}

#app {
  background-color: var(--bg-color-darker);
  color: var(--font-color);
  display: grid;
  font-family: Quicksand, Helvetica, Arial, sans-serif;
  font-size: 0.9rem;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: 500;
  font-weight: 600;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
  line-height: 1.4;
  min-height: 100vh;
  overflow: hidden;

  &__content {
    display: grid;
    grid-template-columns: 300px 1fr;
    overflow: hidden;
  }
}

.loading {
  display: grid;
  height: 100vh;
  place-content: center;
}
</style>

<template>
  <Dialog />
  <Topbar />
  <div id="app__content">
    <Sidebar />
    <router-view v-slot="{ Component }" :key="$route.fullPath">
      <transition name="scale" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
  <Player key="player" />
  <Notification />
</template>

<script lang="ts" setup>
import Topbar from "./components/Topbar.vue";
import Player from "./components/player/Player.vue";
import { api, instance } from "./api";
import Sidebar from "./components/sidebar/Sidebar.vue";
import Dialog from "./components/dialog/Dialog.vue";
import KeyboardEvents from "./composition/KeyboardEvents";
import router, { RouteName } from "./router";
import Notification from "./components/notification/Notification.vue";
import { useAuth } from "./views/auth/AuthStore";
import { useSidebar } from "./components/sidebar/SidebarStore";
import { usePlayer } from "./components/player/PlayerStore";

const authStore = useAuth();
const sidebarStore = useSidebar();
const playerStore = usePlayer();

// onBeforeMount(() => (localS ? authStore.refresh() : router.push(RouteName.Login)));

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

async function getPlayerStatus(): Promise<void> {
  if (!sidebarStore.playlists.length) sidebarStore.getPlaylists(`${api.url}me/playlists?limit=50`);
  if (!playerStore.devices.list.length) playerStore.getDeviceList();
  playerStore.getPlayerState();
}

KeyboardEvents();
authStore.refresh();

// Keep app active
setInterval(() => {
  playerStore.getDeviceList();
  if (!playerStore.currentlyPlaying.is_playing) playerStore.setDevice(playerStore.devices.activeDevice);
  authStore.refresh();
}, 120000);

addEventListener("focus", () => {
  playerStore.getDeviceList();
  getPlayerStatus();
});

setInterval(() => {
  if (document.hasFocus() && router.currentRoute.value.path !== RouteName.Login) {
    getPlayerStatus();
  }
}, 1000);

addEventListener("initdevice", ((e: CustomEvent) => {
  if (playerStore.devices.list.filter((d) => d.is_active).length === 0) {
    instance().put("me/player", { device_ids: [e.detail.thisDevice] });
  }
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
  background-color: rgba(0, 0, 0, 0);
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
  font-family: "Quicksand", Helvetica, Arial, sans-serif;
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

  @supports (-webkit-touch-callout: none) {
    height: -webkit-fill-available;
    min-height: -webkit-fill-available;
  }

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

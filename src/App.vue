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

const authStore = useAuth();
const playerStore = usePlayer();
const focused = useWindowFocus();

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
  playerStore.getDeviceList();
  authStore.refresh();
}, 120000); // 2 minutes

watch(focused, (isFocused) => isFocused && playerStore.getPlayerState());
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
    font-size: 40px;
  }
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
  height: 100vh;
  place-content: center;
}
</style>

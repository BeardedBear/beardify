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
</template>

<script lang="ts">
import { defineComponent, watchEffect } from "vue";
import { useStore } from "vuex";
import Topbar from "./components/Topbar.vue";
import { Mutations, PlayerActions } from "./components/player/PlayerStore";
import Player from "./components/player/Player.vue";
import { RootState } from "./@types/RootState";
import { AuthActions } from "./views/auth/AuthStore";
import { api, instance } from "./api";
import Sidebar from "./components/sidebar/Sidebar.vue";
import Dialog from "./components/dialog/Dialog.vue";
import { ThemeColor } from "./@types/Config";
import { SidebarActions } from "./components/sidebar/SidebarStore";
import KeyboardEvents from "./composition/KeyboardEvents";

export default defineComponent({
  components: { Dialog, Topbar, Player, Sidebar },
  setup() {
    const store = useStore<RootState>();

    KeyboardEvents();

    store.dispatch(`player/${PlayerActions.getDeviceList}`);
    store.dispatch(`auth/${AuthActions.refresh}`);
    store.state.config.theme.forEach((c: ThemeColor) => document.documentElement.style.setProperty(c.var, c.color));
    store.state.config.scheme.forEach((c: ThemeColor) => document.documentElement.style.setProperty(c.var, c.color));

    // Keep app active
    setInterval(() => {
      if (!store.state.player.currentlyPlaying.is_playing) {
        store.dispatch(`player/${PlayerActions.setDevice}`, store.state.player.devices.activeDevice);
      }
      store.dispatch(`auth/${AuthActions.refresh}`);
    }, 120000);

    function getPlayerStatus() {
      if (store.state.sidebar.playlists.length <= 1) {
        store.dispatch(`sidebar/${SidebarActions.getPlaylists}`, `${api.url}me/playlists?limit=50`);
      }
      store.dispatch(`player/${PlayerActions.getDeviceList}`);
      store.dispatch(`player/${PlayerActions.getPlayerState}`);
    }

    watchEffect(() => {
      if (store.state.auth.me !== null) {
        setInterval(() => {
          if (document.hasFocus()) getPlayerStatus();
        }, 1000);
      }
    });

    addEventListener("initdevice", ((e: CustomEvent) => {
      if (store.state.player.devices.list.filter((d) => d.is_active).length === 0) {
        instance.put("me/player", { device_ids: [e.detail.thisDevice] });
      }
      store.commit(`player/${Mutations.THIS_DEVICE}`, e.detail.thisDevice);
    }) as { (evt: Event): void });

    return { store };
  },
});
</script>

<style lang="scss">
@import "../node_modules/normalize.css/normalize.css";
@import "./assets/scss/button";
@import "./assets/scss/colors";
@import "./assets/scss/heading";
@import "./assets/scss/mixins";

body {
  min-height: 100vh;
  min-height: -webkit-fill-available;
}
html {
  height: -webkit-fill-available;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

::selection {
  background-color: var(--primary-color);
}

::-webkit-scrollbar {
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
  font-family: "Quicksand", Helvetica, Arial, sans-serif;
  font-weight: 500;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--font-color);
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  background-color: var(--bg-color-darker);
  font-size: 0.9rem;
  font-weight: 600;
  min-height: 100vh;
  height: 100vh;

  @supports (-webkit-touch-callout: none) {
    min-height: -webkit-fill-available;
    height: -webkit-fill-available;
  }

  &__content {
    display: grid;
    grid-template-columns: 300px 1fr;
  }
}
</style>

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
import { instance } from "./api";
import Sidebar from "./components/sidebar/Sidebar.vue";
import Dialog from "./components/dialog/Dialog.vue";
import { ThemeColor } from "./@types/Config";
import { SidebarActions } from "./components/sidebar/SidebarStore";

export default defineComponent({
  components: { Dialog, Topbar, Player, Sidebar },
  setup() {
    const store = useStore<RootState>();

    store.dispatch(`player/${PlayerActions.getDeviceList}`);
    store.dispatch(`auth/${AuthActions.refresh}`);
    store.state.config.theme.forEach((c: ThemeColor) => document.documentElement.style.setProperty(c.var, c.color));
    store.state.config.scheme.forEach((c: ThemeColor) => document.documentElement.style.setProperty(c.var, c.color));

    // Keep app active
    setInterval(() => {
      if (!store.state.player.currentlyPlaying.is_playing) {
        store.dispatch(`player/${PlayerActions.setDevice}`, store.state.player.devices.activeDevice.id);
      }
      store.dispatch(`auth/${AuthActions.refresh}`);
    }, 120000);

    function getPlayerStatus() {
      if (!store.state.sidebar.playlists.length) {
        store.dispatch(`sidebar/${SidebarActions.getPlaylists}`, "https://api.spotify.com/v1/me/playlists?limit=50");
      }
      store.dispatch(`player/${PlayerActions.getDeviceList}`);
      instance
        .get("https://api.spotify.com/v1/me/player")
        .then(e => store.commit(`player/${Mutations.PLAYER_STATE_CHANGED}`, e.data))
        .catch(error => console.error("error", error));
    }

    watchEffect(() => {
      if (store.state.auth.me !== null) {
        setInterval(() => {
          if (document.hasFocus()) getPlayerStatus();
        }, 1000);
      }
    });

    addEventListener("initdevice", ((e: CustomEvent) => {
      store.dispatch(`player/${PlayerActions.getDeviceList}`);
      if (store.state.player.devices.list.filter(d => d.is_active).length === 0) {
        store.dispatch(`player/${PlayerActions.setDevice}`, e.detail.thisDevice);
      }
      store.commit(`player/${Mutations.THIS_DEVICE}`, e.detail.thisDevice);

      console.log("init device", e.detail.thisDevice);
    }) as { (evt: Event): void });

    addEventListener("keydown", e => {
      let currentVolume = store.state.player.devices.activeDevice.volume_percent;
      const delta = 2;

      function setVolume(volume: number) {
        store.dispatch(`player/${PlayerActions.setVolume}`, volume);
      }

      if (currentVolume && e.shiftKey) {
        if (e.key === "ArrowUp") {
          100 - delta > currentVolume ? setVolume(currentVolume + delta) : setVolume(100);
        } else if (e.key === "ArrowDown") {
          currentVolume - delta < 0 ? setVolume(1) : setVolume(currentVolume - delta);
        }
      }
    });

    return { store };
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
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  background-color: var(--bg-color-darker);
  font-size: 0.9rem;
  font-weight: 600;

  &__content {
    display: grid;
    grid-template-columns: 300px 1fr;
  }
}
</style>

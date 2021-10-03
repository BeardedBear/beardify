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

<script lang="ts">
import { defineComponent, onBeforeMount, watch, onMounted } from "vue";
import { useStore } from "vuex";
import Topbar from "./components/Topbar.vue";
import { Mutations, PlayerActions } from "./components/player/PlayerStore";
import Player from "./components/player/Player.vue";
import { RootState } from "./@types/RootState";
import { api, instance } from "./api";
import Sidebar from "./components/sidebar/Sidebar.vue";
import Dialog from "./components/dialog/Dialog.vue";
import KeyboardEvents from "./composition/KeyboardEvents";
import router, { RouteName } from "./router";
import { ErrorType } from "./@types/Error";
import Notification from "./components/notification/Notification.vue";
import { useAuth } from "./views/auth/AuthStore";
import { useConfig } from "./components/config/ConfigStore";
import { Storage } from "./@types/Storage";
import { useSidebar } from "./components/sidebar/SidebarStore";

export default defineComponent({
  components: { Dialog, Topbar, Player, Sidebar, Notification },
  setup() {
    const store = useStore<RootState>();
    const authStore = useAuth();
    const configStore = useConfig();
    const sidebarStore = useSidebar();
    const storageLabel = "beardifyPinia";
    const localS = localStorage.getItem(storageLabel);

    onBeforeMount(() => (localS ? authStore.refresh() : router.push(RouteName.Login)));

    onMounted(() => {
      if (localS) {
        const storage: Storage = JSON.parse(localS || "");
        configStore.switchTheme(storage.config.themeLabel);
        configStore.switchScheme(storage.config.schemeLabel);
      }
    });

    watch([authStore, configStore], ([auth, config]) => {
      localStorage.setItem(storageLabel, JSON.stringify({ auth, config }));
    });

    KeyboardEvents();

    async function getPlayerStatus(): Promise<void> {
      if (!sidebarStore.playlists.length) {
        sidebarStore.getPlaylists(`${api.url}me/playlists?limit=50`);
      }
      if (!store.state.player.devices.list.length) {
        store.dispatch(PlayerActions.getDeviceList);
      }
      store.dispatch(PlayerActions.getPlayerState);
    }

    store.dispatch(PlayerActions.getDeviceList);
    // store.dispatch(AuthActions.refresh);

    // Keep app active
    setInterval(() => {
      store.dispatch(PlayerActions.getDeviceList);
      if (!store.state.player.currentlyPlaying.is_playing) {
        store.dispatch(PlayerActions.setDevice, store.state.player.devices.activeDevice);
      }
      // store.dispatch(AuthActions.refresh);
    }, 120000);

    addEventListener("focus", () => {
      store.dispatch(PlayerActions.getDeviceList);
      getPlayerStatus();
    });

    setInterval(() => {
      if (document.hasFocus() && router.currentRoute.value.path !== RouteName.Login) {
        getPlayerStatus();
      }
    }, 1000);

    addEventListener("initdevice", ((e: CustomEvent) => {
      if (store.state.player.devices.list.filter((d) => d.is_active).length === 0) {
        instance()
          .put("me/player", { device_ids: [e.detail.thisDevice] })
          .catch((err: Error) => {
            if (err.message === ErrorType.DeviceNotInitialized) {
              // localStorage.removeItem("beardify");
            }
          });
      }
      store.commit(Mutations.THIS_DEVICE, e.detail.thisDevice);
    }) as { (): void });
  },
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
</style>

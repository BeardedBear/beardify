<template>
  <Topbar />
  <div id="app__content">
    <div class="sidebar">sidebar</div>
    <router-view v-slot="{ Component }">
      <transition name="scale" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
  <Player />
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { useStore } from "vuex";
import Topbar from "./components/Topbar.vue";
import { PlayerActions, Mutations } from "./components/PlayerStore";
import Player from "./components/Player.vue";
import { RootState } from "./@types/rootStore";
import { Device } from "./@types/Player";
import { instance } from "./api";
import { AuthActions } from "./views/AuthStore";

export default defineComponent({
  components: { Topbar, Player },
  setup() {
    const store = useStore<RootState>();

    // setInterval(() => {
    //   const activeDevice = store.state.player.devices.list.filter(
    //     (d: Device) => d.id === store.state.player.devices.activeDevice
    //   );
    //   if (activeDevice[0].name !== "Beardify3") {
    //     console.log("non");

    //     instance.get("https://api.spotify.com/v1/me/player").then((e) => {
    //       store.commit(`player/${Mutations.PLAYER_STATE_CHANGED}`, {
    //         // duration: detail.detail.duration,
    //         position: e.data.progress_ms,
    //         // paused: detail.detail.paused,
    //         // repeatMode: detail.detail.repeat_mode,
    //         // shuffle: detail.detail.shuffle,
    //         // trackWindow: detail.detail.trackWindow,
    //       });
    //       console.log(e.data);
    //     });
    //   }
    //   console.log(activeDevice);
    // }, 1000);

    onMounted(() => {
      // window.onfocus = () => {
      //   store.dispatch(`player/${PlayerActions.getDeviceList}`);
      //   store.commit(`player/${Mutations.SET_THIS_DEVICE}`, store.state.player.devices.thisDevice);
      // };
      // store.dispatch (`auth/${AuthActions.auth}`);

      store.dispatch(`player/${PlayerActions.getDeviceList}`);
      // store.commit(`player/${Mutations.SET_THIS_DEVICE}`, store.state.player.devices.thisDevice);

      // console.log(typeof store.state.auth.me.displayName, store.state.auth.me.displayName);

      window.addEventListener("initdevice", (() => {
        // store.commit(`player/${Mutations.SET_THIS_DEVICE}`, customEvent.detail.thisDevice);
        store.dispatch(`player/${PlayerActions.getDeviceList}`);
      }) as { (evt: Event): void });
    });

    return { store };
  },
});
</script>

<style lang="scss">
@import "../node_modules/normalize.css/normalize.css";
@import "./assets/scss/button";
@import "./assets/scss/colors";

::selection {
  background-color: $primary-color;
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

.sidebar {
  background: $bg-color-dark;
  padding: 30px;
}

#app {
  font-family: "Quicksand", Helvetica, Arial, sans-serif;
  font-weight: 500;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #c5ccd3;
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  background-color: $bg-color-darker;

  &__content {
    display: grid;
    grid-template-columns: 300px 1fr;
  }
}
</style>

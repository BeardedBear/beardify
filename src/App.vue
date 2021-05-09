<template>
  <Topbar />
  <div id="app__content">
    <div class="sidebar">
      <router-link class="artistname" to="/artist/31u3refS0tKDq8JFs4rgVx"> Luna Sol </router-link>
      <br />
      <router-link class="artistname" to="/artist/6xPOeIDWmM9ooOw7SBknMl">
        The Night Flight Orchestra
      </router-link>
    </div>
    <router-view v-slot="{ Component }">
      <transition name="scale" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
  <Player />
</template>

<script lang="ts">
import { defineComponent, onBeforeMount } from "vue";
import { useStore } from "vuex";
import Topbar from "./components/Topbar.vue";
import { Mutations, PlayerActions } from "./components/player/PlayerStore";
import Player from "./components/player/Player.vue";
import { RootState } from "./@types/RootState";
import { AuthActions } from "./views/auth/AuthStore";
import { instance } from "./api";
import AOS from "aos";
import { log } from "console";

export default defineComponent({
  components: { Topbar, Player },
  setup() {
    const store = useStore<RootState>();

    // Params : https://github.com/michalsnik/aos#1-initialize-aos
    onBeforeMount(() => {
      AOS.init({
        easing: "ease-in-out-back",
        duration: 300
      });
    });

    store.dispatch(`player/${PlayerActions.getDeviceList}`);
    store.dispatch(`auth/${AuthActions.refresh}`);

    // Keep app active
    setInterval(() => {
      store.dispatch(`player/${PlayerActions.getDeviceList}`);
      store.dispatch(`auth/${AuthActions.refresh}`);
    }, 120000);

    setInterval(() => {
      instance
        .get("https://api.spotify.com/v1/me/player")
        .then(e => {
          store.commit(`player/${Mutations.PLAYER_STATE_CHANGED}`, e.data);
        })
        .catch(error => {
          console.error("error", error);
        });
    }, 1000);

    addEventListener("initdevice", (() => {
      store.dispatch(`player/${PlayerActions.getDeviceList}`);
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
  background-color: $primary-color;
}

::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-corner {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-clip: content-box;
  background-color: rgba($primary-color, 0.7);
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
  color: #d5dbe0;
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  background-color: $bg-color-darker;
  font-size: 0.9rem;
  font-weight: 600;

  &__content {
    display: grid;
    grid-template-columns: 300px 1fr;
  }
}
</style>

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
import { connectUrl } from "@/api";
import Topbar from "@/components/Topbar.vue";
import { PlayerActions, Mutations } from "@/components/PlayerStore";
import Player from "@/components/Player.vue";
import { RootState } from "./@types/rootStore";

export default defineComponent({
  components: { Topbar, Player },
  setup() {
    const store = useStore<RootState>();

    onMounted(() => {
      window.addEventListener("noAccess", (() => {
        window.location.href = connectUrl;
      }) as EventListener);

      window.onfocus = () => {
        store.commit(`player/${Mutations.SET_THIS_DEVICE}`, store.state.player.devices.thisDevice);
      };

      window.addEventListener("initdevice", ((customEvent: CustomEvent) => {
        store.commit(`player/${Mutations.SET_THIS_DEVICE}`, customEvent.detail.thisDevice);
        store.dispatch(`player/${PlayerActions.getDeviceList}`);
      }) as EventListener);
    });
  }
});
</script>

<style lang="scss">
@import "../node_modules/normalize.css/normalize.css";

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
  background: rgba(#1b1e26, 0.5);
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
  background-color: #16181d;

  &__content {
    display: grid;
    grid-template-columns: 300px 1fr;
  }
}
</style>

<template>
  <Topbar />
  <router-view />
  <Player />
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { useStore } from "vuex";
import { connectUrl } from "@/api";
import Topbar from "@/components/Topbar.vue";
import { PlayerActions } from "@/components/PlayerStore";
import Player from "@/components/Player.vue";

export default defineComponent({
  components: { Topbar, Player },
  setup() {
    const store = useStore<RootState>();

    onMounted(() => {
      window.addEventListener("noAccess", (() => {
        window.location.href = connectUrl;
      }) as EventListener);

      window.addEventListener("initdevice", ((customEvent: CustomEvent) => {
        store.dispatch(`player/${PlayerActions.setThisDevice}`, customEvent.detail.thisDevice);
        store.dispatch(`player/${PlayerActions.getDeviceList}`);
      }) as EventListener);
    });
  }
});
</script>

<style lang="scss">
@import "../node_modules/normalize.css/normalize.css";

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
}
</style>

<template>
  <Topbar />
  <router-view />
  <Player />
  <vue-plyr ref="plyr"><audio crossorigin playsinline></audio></vue-plyr>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, provide } from "vue";
import { useStore } from "vuex";
import { connectUrl } from "@/api";
import Topbar from "@/components/Topbar.vue";
import { PlayerActions } from "@/components/PlayerStore";
import Player from "@/components/Player.vue";

export default defineComponent({
  components: { Topbar, Player },
  setup() {
    const store = useStore<RootState>();
    const plyr = ref();
    const playlist = useStore<RootState>().state.player.playlist;
    provide("plyr", plyr);

    onMounted(() => {
      plyr.value.player.source = playlist[0].data;

      window.addEventListener("noAccess", (() => {
        window.location.href = connectUrl;
      }) as EventListener);

      window.addEventListener("initdevice", ((customEvent: CustomEvent) => {
        store.dispatch(`player/${PlayerActions.setThisDevice}`, customEvent.detail.thisDevice);
        store.dispatch(`player/${PlayerActions.getDeviceList}`);
      }) as EventListener);
    });

    return { plyr };
  }
});
</script>

<style lang="scss">
@import "../node_modules/normalize.css/normalize.css";

.plyr--audio {
  display: none !important;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
}
</style>

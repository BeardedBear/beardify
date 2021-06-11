<template>
  <PlayerLoading v-if="!store.state.player.currentlyPlaying" />
  <div v-else class="player">
    <div class="meta">
      <What />
      <Controls />
      <div class="options">
        <Volume />
        <Devices />
      </div>
    </div>
    <SeekBar />
  </div>
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import SeekBar from "./SeekBar.vue";
import Volume from "./Volume.vue";
import Devices from "./Devices.vue";
import What from "./What.vue";
import PlayerLoading from "./PlayerLoading.vue";
import Controls from "./Controls.vue";
import { useTitle } from "@vueuse/core";

export default defineComponent({
  components: { Controls, SeekBar, Volume, Devices, What, PlayerLoading },
  setup() {
    const store = useStore<RootState>();

    watch(
      () => store.state.player.currentlyPlaying,
      () => {
        useTitle(
          `${store.state.player.currentlyPlaying.item.album.artists[0].name} - ${store.state.player.currentlyPlaying.item.name}`,
        );
      },
    );

    return { store };
  },
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.player {
  background: var(--bg-color);
}

.meta {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}
.options {
  text-align: right;
}
</style>

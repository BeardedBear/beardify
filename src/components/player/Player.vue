<template>
  <PlayerLoading v-if="!store.state.player.currentlyPlaying" />
  <div v-else class="player">
    <div class="meta">
      <Controls />
      <What />
      <div class="options">
        <Volume />
        <Devices />
      </div>
    </div>
    <SeekBar />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import SeekBar from "./SeekBar.vue";
import Volume from "./Volume.vue";
import Devices from "./Devices.vue";
import What from "./What.vue";
import PlayerLoading from "./PlayerLoading.vue";
import Controls from "./Controls.vue";

export default defineComponent({
  components: { Controls, SeekBar, Volume, Devices, What, PlayerLoading },
  setup() {
    const store = useStore<RootState>();

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
  $sidewidth: 300px;
  display: grid;
  grid-template-columns: $sidewidth auto $sidewidth;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
}
.options {
  text-align: right;
}
</style>

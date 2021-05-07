<template>
  <div>
    <div class="heading">Top tracks</div>
    <div
      class="item"
      v-for="(trackItem, index) in store.state.artist.topTracks.tracks"
      :key="index"
      :class="{ active: store.state.player.currentlyPlaying.item.id === trackItem.id }"
      @click="playSongs(index, store.state.artist.topTracks.tracks)"
    >
      <img class="cover" :src="trackItem.album.images[2].url" alt="" />
      <div class="name">{{ trackItem.name }}</div>
      <div class="duration">{{ timecode(trackItem.duration_ms) }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/rootStore";
import { timecode } from "../../helpers/date";
import { playSongs } from "../../helpers/play";

export default defineComponent({
  setup() {
    const store = useStore<RootState>();

    return { store, timecode, playSongs };
  }
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 5px;
  padding-right: 10px;
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background-color: rgba($primary-color, 0.1);
  }
  &.active {
    background-color: rgba($primary-color, 0.2);
    color: $primary-color;
  }
}

.cover {
  height: 25px;
  border-radius: 3px;
}

.name {
  flex: 1;
}
</style>

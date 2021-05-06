<template>
  <div>
    <div class="heading">Top tracks</div>
    <div class="item" v-for="(trackItem, _, index) in store.state.artist.topTracks.tracks" :key="index">
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

export default defineComponent({
  setup(props) {
    const store = useStore<RootState>();

    return { store, timecode };
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
}

.cover {
  height: 25px;
}

.name {
  flex: 1;
}
</style>

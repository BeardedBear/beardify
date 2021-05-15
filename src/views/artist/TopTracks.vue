<template>
  <div v-if="store.state.artist.topTracks.tracks.length">
    <div class="heading">Top tracks</div>
    <div
      v-for="(trackItem, index) in store.state.artist.topTracks.tracks"
      :key="index"
      class="item"
      :class="{ active: store.state.player.currentlyPlaying.item.id === trackItem.id }"
      @click="playSongs(index, store.state.artist.topTracks.tracks)"
    >
      <Cover size="small" :images="trackItem.album.images" class-name="cover" />
      <div class="name">
        {{ trackItem.name }}
      </div>
      <div class="duration">
        {{ timecode(trackItem.duration_ms) }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import { timecode } from "../../helpers/date";
import { playSongs } from "../../helpers/play";
import Cover from "../../components/Cover.vue";

export default defineComponent({
  components: { Cover },
  setup() {
    const store = useStore<RootState>();

    return { store, timecode, playSongs };
  },
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  padding-right: 10px;
  border-radius: 3px;
  cursor: pointer;

  img {
    margin-right: 15px;
  }

  &:hover {
    background-color: rgba(rgb(74, 75, 103), 0.15);
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

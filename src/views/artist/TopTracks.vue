<template>
  <div v-if="artistStore.topTracks.tracks?.length">
    <div class="heading sticky-heading" :style="{ top: artistStore.headerHeight + 'px' }">Top tracks</div>
    <div
      v-for="(trackItem, index) in artistStore.topTracks.tracks"
      :key="index"
      class="item"
      :class="{ active: playerStore.currentlyPlaying.item?.id === trackItem.id }"
      @click="playSongs(index, artistStore.topTracks.tracks)"
    >
      <Cover size="small" :images="trackItem.album.images" class-name="cover" />
      <div class="name">{{ trackItem.name }}</div>
      <div class="duration">
        {{ timecode(trackItem.duration_ms) }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { timecode } from "../../helpers/date";
import { playSongs } from "../../helpers/play";
import Cover from "../../components/Cover.vue";
import { useArtist } from "./ArtistStore";
import { usePlayer } from "../../components/player/PlayerStore";

const artistStore = useArtist();
const playerStore = usePlayer();
</script>

<style lang="scss" scoped>
@use "sass:color";
@import "../../assets/scss/colors";

.item {
  align-items: center;
  border-radius: 0.3rem;
  cursor: pointer;
  display: flex;
  margin-bottom: 0.4rem;
  padding-right: 0.8rem;

  img {
    margin-right: 1rem;
  }

  &:hover {
    background-color: color.change(rgb(74 75 103), $alpha: 0.15);
  }
}

.cover {
  border-radius: 0.3rem;
  height: 2rem;
}

.name {
  flex: 1;
}
</style>

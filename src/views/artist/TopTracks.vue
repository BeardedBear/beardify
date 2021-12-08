<template>
  <div v-if="artistStore.topTracks.tracks?.length">
    <div class="heading sticky-heading" :style="{ top: artistStore.headerHeight + 'px' }">Top tracks</div>
    <div
      v-for="(trackItem, index) in artistStore.topTracks.tracks"
      :key="index"
      class="item"
      :class="{ active: playerStore.currentlyPlaying.item?.id === trackItem.id }"
      @dblclick="playSongs(index, artistStore.topTracks.tracks)"
    >
      <div class="cover-wrap">
        <Cover size="small" :images="trackItem.album.images" class-name="cover" />
        <div class="hover" @click="dialogStore.open({ type: 'addSong', songUri: trackItem.uri })">
          <i class="add icon-plus"></i>
        </div>
      </div>
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
import { useDialog } from "../../components/dialog/DialogStore";

const artistStore = useArtist();
const playerStore = usePlayer();
const dialogStore = useDialog();
</script>

<style lang="scss" scoped>
@use "sass:color";
@import "../../assets/scss/colors";

.cover-wrap {
  position: relative;

  .add {
    font-size: 1rem;
    transition: 0.15s;
    will-change: transform;

    &:hover {
      transform: scale(1.2);
    }
  }

  .hover {
    align-items: center;
    background-color: color.change(black, $alpha: 0.8);
    border-radius: 0.3rem;
    cursor: pointer;
    display: flex;
    inset: 0;
    justify-content: center;
    opacity: 0;
    position: absolute;
    transition: 0.15s;
  }

  &:hover {
    .hover {
      opacity: 1;
    }
  }
}

.item {
  align-items: center;
  border-radius: 0.3rem;
  cursor: default;
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  padding-right: 0.8rem;

  &:hover {
    background-color: color.change(rgb(74 75 103), $alpha: 0.15);
  }

  &:active {
    background-color: color.change(rgb(74 75 103), $alpha: 0.25);
  }
}

.cover {
  border-radius: 0.3rem;
  display: block;
  height: 1.7rem;
}

.name {
  flex: 1;
}
</style>

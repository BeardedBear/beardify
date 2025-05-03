<template>
  <div v-if="artistStore.topTracks.tracks?.length">
    <div :style="{ top: artistStore.headerHeight + 'px' }" class="heading sticky-heading">Top tracks</div>
    <div
      :class="{ active: isCurrentTrack(trackItem, playerStore.playerState?.track_window.current_track) }"
      :key="index"
      @click="playSongs(index, artistStore.topTracks.tracks)"
      class="item"
      v-for="(trackItem, index) in artistStore.topTracks.tracks"
    >
      <div class="cover-wrap">
        <Cover :images="trackItem.album.images" class="cover" size="small" />
        <div @click.prevent.stop="dialogStore.open({ type: 'addSong', track: trackItem })" class="hover">
          <i class="add icon-plus"></i>
        </div>
      </div>
      <div class="name">{{ trackItem.name }}</div>
      <div class="duration">{{ timecode(trackItem.duration_ms) }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { timecode } from "../../helpers/date";
import { isCurrentTrack } from "../../helpers/helper";
import { playSongs } from "../../helpers/play";
import { useArtist } from "../../views/artist/ArtistStore";
import Cover from "../AlbumCover.vue";
import { useDialog } from "../dialog/DialogStore";
import { usePlayer } from "../player/PlayerStore";

const artistStore = useArtist();
const playerStore = usePlayer();
const dialogStore = useDialog();
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "../../assets/scss/colors" as colors;

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
  cursor: pointer;
  display: flex;
  font-size: 0.9rem;
  font-weight: bold;
  gap: 1rem;
  margin-bottom: 0.5rem;
  padding-right: 0.8rem;

  &:hover {
    background-color: var(--bg-color);
  }

  &:active {
    background-color: var(--bg-color-light);
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

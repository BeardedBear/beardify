<template>
  <div v-if="artistStore.topTracks.tracks?.length">
    <div :style="{ top: artistStore.headerHeight + 'px' }" class="bd-heading sticky-heading">Top tracks</div>
    <div
      v-for="(trackItem, index) in artistStore.topTracks.tracks"
      :key="index"
      :class="{ active: isCurrentTrack(trackItem, playerStore.playerState?.track_window.current_track) }"
      class="item bd-font-bold"
      @click="playSongs(index, artistStore.topTracks.tracks)"
    >
      <div class="cover-wrap">
        <Cover :images="trackItem.album.images" class="cover" size="small" />
        <div class="hover" @click.prevent.stop="dialogStore.open({ type: 'addSong', track: trackItem })">
          <i class="add icon-plus" />
        </div>
      </div>
      <div class="name">
        {{ trackItem.name }}
      </div>
      <div class="duration">
        {{ timecode(trackItem.duration_ms) }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useDialog } from "@/components/dialog/DialogStore";
import { usePlayer } from "@/components/player/PlayerStore";
import Cover from "@/components/ui/AlbumCover.vue";
import { timecode } from "@/helpers/date";
import { isCurrentTrack } from "@/helpers/helper";
import { playSongs } from "@/helpers/play";
import { useArtist } from "@/views/artist/ArtistStore";

const artistStore = useArtist();
const playerStore = usePlayer();
const dialogStore = useDialog();
</script>

<style scoped>

.cover-wrap {
  position: relative;

  .add {
    font-size: var(--bd-font-size-base);
    transition: transform var(--bd-transition-fast);
    will-change: transform;

    &:hover {
      transform: scale(1.2);
    }
  }

  .hover {
    align-items: center;
    background-color: rgb(0 0 0 / 80%);
    border-radius: var(--bd-radius-sm);
    cursor: pointer;
    display: flex;
    inset: 0;
    justify-content: center;
    opacity: 0;
    position: absolute;
    transition: opacity var(--bd-transition-fast);
  }

  &:hover {
    .hover {
      opacity: 1;
    }
  }
}

.item {
  align-items: center;
  border-radius: var(--bd-radius-sm);
  cursor: pointer;
  display: flex;
  gap: var(--bd-space-4);
  margin-bottom: var(--bd-space-2);
  padding-right: var(--bd-space-3);

  &:hover {
    background-color: var(--bd-hover-overlay);
  }

  &:active {
    background-color: var(--bd-bg-light);
  }
}

.cover {
  border-radius: var(--bd-radius-sm);
  display: block;
  height: 1.7rem;
}

.name {
  flex: 1;
}

.duration {
  font-variant-numeric: tabular-nums;
}
</style>

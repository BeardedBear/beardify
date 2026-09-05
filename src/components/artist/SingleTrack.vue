<template>
  <div
    :class="{ active: isCurrentTrack(single, playerStore.playerState?.track_window.current_track) }"
    class="single"
    @click="playSingle(single.uri)"
  >
    <div class="what">
      <Cover :images="single.images" :size="'small'" class="cover" />
      <div>
        <div class="name bd-font-bold">
          {{ single.name }}
        </div>
        <ArtistList :artist-list="single.artists" feat />
      </div>
    </div>
    <div class="release-date">
      {{ date(single.release_date) }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AlbumSimplified } from "@/@types/Album";
import ArtistList from "@/components/artist/ArtistList.vue";
import { usePlayer } from "@/components/player/PlayerStore";
import Cover from "@/components/ui/AlbumCover.vue";
import { date } from "@/helpers/date";
import { isCurrentTrack } from "@/helpers/helper";
import { playAlbum } from "@/helpers/playAlbum";

defineProps<{
  single: AlbumSimplified;
}>();

const playerStore = usePlayer();

function playSingle(albumUri: string): void {
  playAlbum(albumUri);
}
</script>

<style scoped>

.single {
  align-items: center;
  border-radius: var(--bd-radius-sm);
  cursor: pointer;
  display: flex;
  gap: var(--bd-space-4);
  justify-content: space-between;
  margin-bottom: var(--bd-space-1);
  padding: var(--bd-space-2);
  padding-right: var(--bd-space-4);

  &:hover {
    background-color: var(--bd-hover-overlay);
  }

  &:active {
    background-color: var(--bd-bg-light);
  }
}

.what {
  align-items: center;
  display: flex;
  gap: var(--bd-space-4);
}

.release-date {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-sm);
  font-style: italic;
}

.cover {
  border-radius: var(--bd-radius-sm);
  height: 2.4rem;
}
</style>

<template>
  <div
    :class="{ active: isCurrentTrack(single, playerStore.playerState?.track_window.current_track) }"
    @click="playSingle(single.uri)"
    class="single"
  >
    <div class="what">
      <Cover :images="single.images" :size="'small'" class="cover" />
      <div>
        <div class="name">{{ single.name }}</div>
        <ArtistList :artist-list="single.artists" feat />
      </div>
    </div>
    <div class="release-date">{{ date(single.release_date) }}</div>
  </div>
</template>

<script lang="ts" setup>
import { AlbumSimplified } from "@/@types/Album";
import { instance } from "@/api";
import ArtistList from "@/components/artist/ArtistList.vue";
import { usePlayer } from "@/components/player/PlayerStore";
import Cover from "@/components/ui/AlbumCover.vue";
import { date } from "@/helpers/date";
import { isCurrentTrack } from "@/helpers/helper";

defineProps<{
  single: AlbumSimplified;
}>();

const playerStore = usePlayer();

function playSingle(albumUri: string): void {
  instance().put("me/player/play", { context_uri: albumUri });
}
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

.single {
  align-items: center;
  border-radius: 0.3rem;
  cursor: pointer;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 0.3rem;
  padding: 0.5rem;
  padding-right: 1rem;

  &:hover {
    background-color: var(--bg-color);
  }

  &:active {
    background-color: var(--bg-color-light);
  }
}

.what {
  align-items: center;
  display: flex;
  gap: 1rem;
}

.release-date {
  font-size: var(--font-size-sm);
  font-style: italic;
  opacity: 0.5;
}

.name {
  font-size: var(--font-size-sm);

  @include font-bold;
}

.cover {
  border-radius: 0.2rem;
  height: 2.4rem;
}
</style>

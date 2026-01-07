<template>
  <div class="track">
    <div class="meta">
      <i class="icon-note note" />
      <div>
        <div class="name">{{ track?.name }}</div>
        <div class="artist">{{ track?.artists[0].name }}</div>
      </div>
    </div>
    <div class="options">
      <ButtonIndex @click="addTrackToQueue(track.uri)">Add</ButtonIndex>
      <ButtonIndex
        variant="nude"
        no-default-class
        class="link"
        @click="openLink(`https://www.youtube.com/results?search_query=${track?.artists[0].name}+${track?.name}`)"
      >
        <i class="icon-youtube" />
      </ButtonIndex>
      <ShareContent :spotify-url="`https://open.spotify.com/track/${track.id}`" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Track, TrackSimplified } from "@/@types/Track";
import { usePlayer } from "@/components/player/PlayerStore";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import ShareContent from "@/components/ui/ShareContent.vue";

const { addTrackToQueue } = usePlayer();

defineProps<{
  track: Spotify.Track | Track | TrackSimplified;
}>();

function openLink(url: string): void {
  window.open(url, "_blank");
}
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/mixins" as *;

.track {
  align-items: center;
  display: flex;
  gap: 30px;
  justify-content: space-between;

  .meta {
    align-items: center;
    display: flex;
    gap: 0.8rem;
  }
}

.note {
  background-color: var(--bg-color-lighter);
  border-radius: 5px;
  font-size: var(--font-size-xl);
  opacity: 0.5;
  padding: 10px;
}

.artist {
  color: var(--text-color-light);
  font-size: var(--font-size-sm);
  opacity: 0.5;
}

.name {
  @include font-bold;
}

.options {
  align-items: center;
  display: flex;
  gap: 0.7rem;

  .link {
    align-items: center;
    color: currentcolor;
    cursor: pointer;
    display: flex;
    font-size: var(--font-size-xl);
    opacity: 0.3;
    text-decoration: none;

    &:hover {
      opacity: 1;
    }
  }
}
</style>

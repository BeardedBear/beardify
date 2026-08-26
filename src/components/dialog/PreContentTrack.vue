<template>
  <div class="track">
    <div class="meta">
      <i class="icon-note note" />
      <div>
        <div class="name bd-font-bold">
          {{ track?.name }}
        </div>
        <div class="artist">
          {{ track?.artists[0].name }}
        </div>
      </div>
    </div>
    <div class="options">
      <BdButton @click="addTrackToQueue(track.uri)">Add</BdButton>
      <IconButton
        class="link"
        icon="youtube"
        label="Search this track on YouTube"
        @click="openLink(`https://www.youtube.com/results?search_query=${track?.artists[0].name}+${track?.name}`)"
      />
      <ShareContent :spotify-url="`https://open.spotify.com/track/${track.id}`" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BdButton } from "bearded-ui";

import { Track, TrackSimplified } from "@/@types/Track";
import { usePlayer } from "@/components/player/PlayerStore";
import IconButton from "@/components/ui/IconButton.vue";
import ShareContent from "@/components/ui/ShareContent.vue";
import { openLink } from "@/helpers/openLink";

const { addTrackToQueue } = usePlayer();

defineProps<{
  track: Spotify.Track | Track | TrackSimplified;
}>();
</script>

<style scoped>

.track {
  align-items: center;
  display: flex;
  gap: var(--bd-space-6);
  justify-content: space-between;

  .meta {
    align-items: center;
    display: flex;
    gap: var(--bd-space-3);
  }
}

.note {
  background-color: var(--bd-bg-lighter);
  border-radius: var(--bd-radius-sm);
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xl);
  padding: var(--bd-space-2);
}

.artist {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-sm);
}

.options {
  align-items: center;
  display: flex;
  gap: var(--bd-space-3);

  .link {
    align-items: center;
    background-color: transparent;
    border: 0;
    color: currentcolor;
    cursor: pointer;
    display: flex;
    font-size: var(--bd-font-size-xl);
    opacity: 0.3;
    text-decoration: none;

    &:hover {
      opacity: 1;
    }
  }
}
</style>

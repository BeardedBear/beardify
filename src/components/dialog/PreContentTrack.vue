<template>
  <div class="track">
    <i class="icon-note note" />
    <div>
      <div class="name">{{ track?.name }}</div>
      <div class="artist">{{ track?.artists[0].name }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Track, TrackSimplified } from "../../@types/Track";

defineProps<{
  track: Track | TrackSimplified | Spotify.Track;
}>();
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.track {
  align-items: center;
  display: flex;
  gap: 0.8rem;
}

.note {
  background-color: var(--bg-color-lighter);
  border-radius: 5px;
  font-size: 1.5rem;
  opacity: 0.5;
  padding: 10px;
}

.artist {
  color: var(--text-color-light);
  font-size: 0.9rem;
  opacity: 0.5;
}

.name {
  font-weight: bold;
}
</style>

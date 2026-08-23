<template>
  <BdDropdown v-model="queueOpen" class="wrap" placement="top-end" size="small">
    <template #trigger>
      <BdButton icon-only>
        <i class="icon-queue" />
      </BdButton>
    </template>

    <div class="queue-list">
      <div class="section-title font-bold">Now</div>
      <TrackHistory v-if="currentTrack" :cover-url="currentTrack.album.images[1].url" :track="currentTrack" />
      <div class="section-title font-bold">Next</div>
      <div v-for="(track, key) in playerStore.queue" :key="key">
        <TrackHistory :cover-url="track.album.images[2].url" :index="key" :track="track" />
      </div>
      <div v-if="playerStore.queue.length === 0" class="empty-queue">
        <div class="empty-message font-italic">
          {{ isPlayingPodcast ? "Queue not available for podcast episodes" : "No tracks in queue" }}
        </div>
      </div>
    </div>
  </BdDropdown>
</template>

<script lang="ts" setup>
import { BdButton, BdDropdown } from "bearded-ui";
import { computed, watch } from "vue";

import TrackHistory from "@/components/player/history/TrackHistory.vue";
import { usePlayer } from "@/components/player/PlayerStore";

const playerStore = usePlayer();
const currentTrack = computed(() => playerStore.playerState?.track_window.current_track);
const isPlayingPodcast = computed(() => {
  const track = currentTrack.value;
  return track?.type === "episode" || track?.uri?.includes("spotify:episode:");
});
// The store owns the panel state (the player toggles it from elsewhere too);
// opening through it also refreshes the queue.
const queueOpen = computed<boolean>({
  get: () => playerStore.queueOpened,
  set: (value) => (value ? playerStore.openQueue() : playerStore.closeQueue()),
});

watch(currentTrack, (track) => {
  if (track) {
    // Only get queue if not playing a podcast episode
    const isPlayingPodcast = track.type === "episode" || track.uri?.includes("spotify:episode:");
    if (!isPlayingPodcast) {
      playerStore.getQueue();
    }
  }
});
</script>

<style scoped>

.wrap {
  @media (--mobile) {
    display: none;
  }
}

.section-title {
  font-size: var(--font-size-xs);
  margin-top: 10px;
  opacity: 0.5;
  padding: 0 10px;
  text-transform: uppercase;
}

.queue-list {
  font-size: var(--font-size-sm);
  height: 300px;
  overflow: auto;
  white-space: nowrap;
  width: 250px;
}

.empty-queue {
  padding: 20px 10px;
  text-align: center;
}

.empty-message {
  color: var(--font-color);
  font-size: var(--font-size-sm);
  opacity: 0.6;
}
</style>

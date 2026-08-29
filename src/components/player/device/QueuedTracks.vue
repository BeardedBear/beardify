<template>
  <BdDropdown v-model="queueOpen" class="wrap" placement="top-end" size="small">
    <template #trigger>
      <BdTooltip bare content="Queue">
        <BdButton icon-only label="Queue">
          <i aria-hidden="true" class="icon-queue" />
        </BdButton>
      </BdTooltip>
    </template>

    <div class="queue-list">
      <div class="section-title bd-font-bold">Now</div>
      <TrackHistory
        v-if="currentTrack"
        :cover-url="coverUrl(currentTrack.album.images, 'medium')"
        :track="currentTrack"
      />
      <div class="section-title bd-font-bold">Next</div>
      <div v-for="(track, key) in playerStore.queue" :key="key">
        <TrackHistory :cover-url="coverUrl(track.album.images, 'small')" :index="key" :track="track" />
      </div>
      <div v-if="playerStore.queue.length === 0" class="empty-queue">
        <div class="empty-message bd-font-italic">
          {{ isPlayingPodcast ? "Queue not available for podcast episodes" : "No tracks in queue" }}
        </div>
      </div>
    </div>
  </BdDropdown>
</template>

<script lang="ts" setup>
import { BdButton, BdDropdown, BdTooltip } from "bearded-ui";
import { computed, watch } from "vue";

import TrackHistory from "@/components/player/history/TrackHistory.vue";
import { usePlayer } from "@/components/player/PlayerStore";
import { coverUrl } from "@/helpers/cover";

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
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  margin-top: var(--bd-space-2);
  padding: 0 var(--bd-space-2);
  text-transform: uppercase;
}

.queue-list {
  font-size: var(--bd-font-size-sm);
  height: 300px;
  overflow: auto;
  white-space: nowrap;
  width: 250px;
}

.empty-queue {
  padding: var(--bd-space-4) var(--bd-space-2);
  text-align: center;
}

.empty-message {
  color: var(--bd-font-color);
  font-size: var(--bd-font-size-sm);
  opacity: 0.6;
}
</style>

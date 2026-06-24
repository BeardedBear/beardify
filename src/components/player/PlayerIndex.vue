<template>
  <div class="player">
    <div
      v-if="coverImageUrl" class="player-bg" aria-hidden="true"
      :style="{ backgroundImage: `url(${coverImageUrl})` }"
    />
    <template v-if="playerStore.currentlyPlaying?.currently_playing_type === 'episode'">
      <PlayerEpisode />
    </template>
    <template v-else>
      <PlayerSong />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch, watchEffect } from "vue";

import PlayerEpisode from "@/components/player/PlayerEpisode.vue";
import PlayerSong from "@/components/player/PlayerSong.vue";
import { usePlayer } from "@/components/player/PlayerStore";

const LOADING_WATCHDOG_MS = 5000;

const playerStore = usePlayer();

const coverImageUrl = computed(() => {
  const track = playerStore.playerState?.track_window?.current_track;
  return track?.album?.images?.[1]?.url ?? null;
});
const interval = ref<number | undefined>(undefined);
let loadingWatchdog: null | number = null;

function watchExternalPlayerState(): void {
  // Clear existing interval before setting a new one
  if (interval.value !== undefined) {
    window.clearInterval(interval.value);
    interval.value = undefined;
  }
  // Only set interval if external device is active
  if (playerStore.isExternalDevice) {
    interval.value = window.setInterval(() => {
      if (document.visibilityState === "visible") playerStore.getExternalPlayerState();
    }, 2000);
  }
}

watchEffect(() => {
  const hasTrack = !!playerStore.playerState.track_window?.current_track?.id;
  const switching = !!playerStore.isSettingDevice;

  if (!hasTrack && !switching) {
    if (!loadingWatchdog) {
      loadingWatchdog = window.setTimeout(() => {
        loadingWatchdog = null;
        if (!playerStore.playerState.track_window?.current_track?.id) {
          playerStore.getExternalPlayerState().catch(() => {});
        }
      }, LOADING_WATCHDOG_MS);
    }
  } else if (loadingWatchdog) {
    clearTimeout(loadingWatchdog);
    loadingWatchdog = null;
  }
});

onMounted(() => watchExternalPlayerState());

watch(
  () => playerStore.isExternalDevice,
  () => watchExternalPlayerState(),
);

// Cleanup interval when component is unmounted
onBeforeUnmount(() => {
  if (interval.value !== undefined) {
    window.clearInterval(interval.value);
    interval.value = undefined;
  }
  if (loadingWatchdog) {
    clearTimeout(loadingWatchdog);
    loadingWatchdog = null;
  }
});
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/responsive" as responsive;

.player {
  background: var(--bg-color);
  position: relative;

  @include responsive.mobile {
    overflow: hidden;
  }

  .player-bg {
    display: none;

    @include responsive.mobile {
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
      display: block;
      filter: blur(12px);
      height: 100%;
      left: 0;
      opacity: 0.3;
      position: absolute;
      top: 0;
      width: 100%;
      z-index: 0;
    }
  }

  > :not(.player-bg) {
    position: relative;
    z-index: 1;
  }
}
</style>

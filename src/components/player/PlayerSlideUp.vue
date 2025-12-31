<template>
  <transition name="slide-up">
    <div v-if="playerStore.panelOpened" class="player-slide-up" role="dialog" aria-modal="true">
      <div class="backdrop" @click="playerStore.closePanel"></div>
      <div class="panel" tabindex="0" @keydown.esc="playerStore.closePanel">
        <div class="handle" @click="playerStore.closePanel" aria-hidden>
          <div class="bar"></div>
        </div>
        <div class="content">
          <div class="cover">
            <img :src="currentTrack?.album?.images[0]?.url" alt="cover" v-if="currentTrack" />
          </div>
          <div class="metas">
            <h3 class="title">{{ currentTrack?.name }}</h3>
            <p class="artists">{{ artistNames }}</p>
            <div class="controls">
              <PlayerControls />
              <div class="extra">
                <Device />
              </div>
            </div>
            <SeekBar />
            <div class="more-info">
              <!-- Queue / repeat / shuffle / device info -->
              <div class="row">
                <ButtonIndex icon-only @click="playerStore.openQueue()" title="Queue" />
                <ButtonIndex icon-only :class="playerStore.currentlyPlaying.repeat_state !== 'off' ? 'active' : ''" @click="playerStore.toggleRepeat()" title="Repeat" />
                <ButtonIndex icon-only :class="playerStore.currentlyPlaying.shuffle_state ? 'active' : ''" @click="playerStore.toggleShuffle()" title="Shuffle" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import Device from "@/components/player/device/DeviceIndex.vue";
import PlayerControls from "@/components/player/PlayerControls.vue";
import { usePlayer } from "@/components/player/PlayerStore";
import SeekBar from "@/components/player/SeekBar.vue";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import { computed } from "vue";

const playerStore = usePlayer();

const currentTrack = computed(() => playerStore.playerState?.track_window?.current_track);
const artistNames = computed(() => (currentTrack.value?.artists || []).map(a => a.name).join(', '));
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/responsive" as responsive;

.player-slide-up {
  inset: 0;
  position: fixed;
  z-index: 1000;

  .backdrop {
    backdrop-filter: blur(8px);
    background-image: linear-gradient(to top, var(--bg-color-darker), transparent);
    inset: 0;
    position: fixed;
    z-index: 999;
  }

  .panel {
    background-color: var(--bg-color);
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    bottom: 0;
    box-shadow: 0 -6px 24px rgb(0 0 0 / 40%);
    left: 0;
    max-height: 92vh;
    overflow: auto;
    padding: 1rem;
    position: absolute;
    right: 0;
    z-index: 1000;

    /* Tablet+ layout */
    @include responsive.tablet-up {
      border-radius: 12px;
      bottom: 2rem;
      left: 0;
      margin: 0 auto;
      max-width: 720px;
      right: 0;
    }
  }

  .handle {
    cursor: pointer;
    display: flex;
    justify-content: center;
    padding: 0.4rem 0;

    .bar {
      background: var(--bg-color-light);
      border-radius: 4px;
      height: 0.35rem;
      opacity: 0.8;
      width: 3rem;
    }
  }

  .content {
    display: grid;
    gap: 1rem;
    grid-template-columns: 120px 1fr;
    padding-bottom: 2rem;

    .cover img {
      border-radius: 8px;
      height: auto;
      width: 100%;
    }

    .metas {
      .title {
        font-size: 1.1rem;
        margin: 0 0 0.25rem;
      }

      .artists {
        margin: 0 0 0.75rem;
        opacity: 0.8;
      }

      .controls {
        align-items: center;
        display: flex;
        gap: 0.5rem;
      }

      .more-info {
        margin-top: 0.75rem;
      }
    }
  }
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 280ms ease;

}

.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(100%);
}
</style>

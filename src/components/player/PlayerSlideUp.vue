<template>
  <dialog
    ref="dialogEl"
    aria-label="Now playing"
    class="player-slide-up"
    @click="onBackdropClick"
    @close="playerStore.closePanel"
  >
    <div class="panel">
      <div class="content">
        <div class="cover">
          <img v-if="currentTrack" :src="currentTrack?.album?.images[0]?.url" alt="" />
        </div>
        <div class="metas">
          <div class="meta-header">
            <div>
              <h2 class="title">
                {{ currentTrack?.name }}
              </h2>
              <p class="artists">
                <ArtistList :artist-list="currentTrack?.artists" :feat="false" />
              </p>
              <p v-if="currentTrack?.album?.name" class="album">
                <router-link
:to="`/album/${transformUriToid(currentTrack.album.uri)}`" class="link"
                  @click="playerStore.closePanel"
>
                  {{ currentTrack?.album?.name }}
                </router-link>
              </p>
            </div>
            <div class="device-inline">
              <Device force-mobile />
            </div>
          </div>

          <div class="controls">
            <PlayerControls force-mobile />
          </div>
        </div>
      </div>
      <div class="bottom-bar">
        <SeekBar />
      </div>
    </div>
  </dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";

import ArtistList from "@/components/artist/ArtistList.vue";
import Device from "@/components/player/device/DeviceIndex.vue";
import PlayerControls from "@/components/player/PlayerControls.vue";
import { usePlayer } from "@/components/player/PlayerStore";
import SeekBar from "@/components/player/SeekBar.vue";
import { transformUriToid } from "@/helpers/helper";

const playerStore = usePlayer();
const dialogEl = ref<HTMLDialogElement | null>(null);

const currentTrack = computed(() => playerStore.playerState?.track_window?.current_track);

/*
 * A native <dialog> opened with showModal(), rather than the div that used to
 * claim `aria-modal="true"` here. The browser then owns the three things the
 * div never did: it traps focus inside the panel, makes everything behind it
 * inert, and closes on Escape (which previously only fired if you had somehow
 * focused .panel first — nothing ever did). Closing is routed back through the
 * store so its own state stays the single source of truth.
 */
watch(
  () => playerStore.panelOpened,
  (opened) => {
    if (opened) dialogEl.value?.showModal();
    else dialogEl.value?.close();
  },
);

// showModal() stretches the dialog's hit area over the whole viewport, so a
// click lands on the element itself only when it missed the panel inside it.
function onBackdropClick(event: MouseEvent): void {
  if (event.target === dialogEl.value) playerStore.closePanel();
}
</script>

<style scoped>

.player-slide-up {
  background: transparent;
  border: 0;
  height: 100%;
  inset: 0;
  max-height: 100dvh;
  max-width: 100vw;
  padding: 0;
  width: 100%;

  &::backdrop {
    backdrop-filter: blur(8px);
    background-image: linear-gradient(to top, var(--bg-color-darker), transparent);
  }

  .panel {
    background-color: var(--bg-color);
    border-top-left-radius: 2rem;
    border-top-right-radius: 2rem;
    bottom: 0;
    box-shadow: 0 -1rem 3rem rgb(0 0 0);
    left: 0;
    max-height: 92dvh;
    overflow: auto;
    padding: 2rem;
    position: absolute;
    right: 0;
    touch-action: pan-y;
    z-index: 1000;

    /* Tablet+ layout */
    @media (--tablet-up) {
      border-radius: 12px;
      bottom: 2rem;
      left: 0;
      margin: 0 auto;
      max-width: 720px;
      right: 0;
    }
  }

  .content {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
    padding-bottom: 2rem;

    @media (--tablet-up) {
      grid-template-columns: auto 1fr;
    }

    .cover img {
      border-radius: 8px;
      height: auto;
      max-width: 250px;
      width: 100%;
    }

    @media (--mobile) {
      .cover {
        display: flex;
        justify-content: center;
      }

      .cover img {
        border-radius: 8px;
        max-width: 250px;
        object-fit: contain;
        width: 100%;
      }
    }

    .metas {
      .meta-header {
        align-items: center;
        display: flex;
        gap: 1rem;
        justify-content: space-between;
        margin-bottom: 0.5rem;

        @media (--mobile) {
          align-items: flex-start;
          flex-direction: column;
        }

        @media (--tablet-up) {
          align-items: flex-start;
          flex-direction: column;
        }
      }

      .title {
        font-size: var(--font-size-lg);
        margin: 0 0 0.25rem;
      }

      .artists {
        margin: 0 0 0.25rem;
        opacity: 0.8;
      }

      .album {
        margin: 0 0 0.5rem;
        opacity: 0.8;

        .link {
          color: currentcolor;
          cursor: pointer;
          opacity: 0.8;
          text-decoration: none;

          &:hover {
            color: var(--primary-color);
            opacity: 1;
          }
        }
      }

      .device-inline {
        align-items: center;
        display: flex;
        justify-content: flex-end;
        min-width: 130px;

        @media (--mobile) {
          justify-content: center;
          margin-top: 0.5rem;
          width: 100%;
        }
      }

      .controls {
        align-items: center;
        display: flex;
        gap: 0.75rem;
        justify-content: center;
        margin-top: 1rem;
      }

      .controls .extra {
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

@keyframes slide-up-panel {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}

.player-slide-up[open] .panel {
  /* Exponential ease-out: fast off the mark, settles without a bounce. */
  animation: slide-up-panel 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
</style>

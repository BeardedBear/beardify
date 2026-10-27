<template>
  <dialog
    ref="dialogEl"
    aria-label="Now playing"
    :class="['player-slide-up', { closing }]"
    @cancel.prevent="playerStore.closePanel"
    @click="onBackdropClick"
    @close="playerStore.closePanel"
  >
    <div ref="panelEl" class="panel">
      <!--
        The grip is the close button: one visible way out, inside the thumb's
        reach of the sheet's top edge, and a 44px target rather than a 4px bar.
      -->
      <button aria-label="Close" class="handle" type="button" @click="playerStore.closePanel">
        <span class="grip" />
      </button>

      <div v-if="currentTrack" class="content">
        <!-- Duplicate of the album link below, so kept out of the tab order. -->
        <router-link
          :to="albumPath"
          aria-hidden="true"
          class="cover"
          tabindex="-1"
          @click="playerStore.closePanel"
        >
          <img :src="coverUrl(currentTrack.album.images, 'large')" alt="" class="bd-squircle" />
        </router-link>

        <div class="info">
          <!--
            Focus lands here on open (dialog honours autofocus), so a screen
            reader starts with the track instead of the first link.
          -->
          <h2 autofocus class="title bd-font-bold" tabindex="-1">
            {{ currentTrack.name }}
          </h2>
          <p class="artists">
            <ArtistList :artist-list="currentTrack.artists" :feat="false" />
          </p>
          <p class="album">
            <router-link :to="albumPath" class="link" @click="playerStore.closePanel">
              {{ currentTrack.album.name }}
            </router-link>
          </p>

          <div class="seek">
            <SeekBar />
            <!--
              The bar's own read-out only shows on hover, which a finger never
              produces. Elapsed follows the shared clock, so it also tracks a
              scrub live — that is the preview on touch.
            -->
            <div class="times bd-font-bold" aria-hidden="true">
              <span>{{ timecode(position) || "0:00" }}</span>
              <span>-{{ timecode(remaining) || "0:00" }}</span>
            </div>
          </div>

          <PlayerControls class="transport" force-mobile />

          <div class="device">
            <Device force-mobile />
          </div>
        </div>
      </div>
      <!-- Between tracks or mid device switch the state is briefly empty. -->
      <BdLoader v-else class="empty" />
    </div>
  </dialog>
</template>

<script lang="ts" setup>
import { BdLoader } from "bearded-ui";
import { computed, nextTick, ref, watch } from "vue";

import ArtistList from "@/components/artist/ArtistList.vue";
import Device from "@/components/player/device/DeviceIndex.vue";
import PlayerControls from "@/components/player/PlayerControls.vue";
import { usePlayer } from "@/components/player/PlayerStore";
import SeekBar from "@/components/player/SeekBar.vue";
import { usePlaybackClock } from "@/composables/usePlaybackClock";
import { coverUrl } from "@/helpers/cover";
import { timecode } from "@/helpers/date";
import { transformUriToid } from "@/helpers/helper";

const playerStore = usePlayer();
const dialogEl = ref<HTMLDialogElement | null>(null);
const panelEl = ref<HTMLDivElement | null>(null);
const closing = ref(false);
const { position } = usePlaybackClock();

const currentTrack = computed(() => playerStore.playerState?.track_window?.current_track);
const albumId = computed(() => (currentTrack.value ? transformUriToid(currentTrack.value.album.uri) : ""));
const albumPath = computed(() => `/album/${albumId.value}`);
const remaining = computed(() => Math.max((playerStore.playerState?.duration ?? 0) - position.value, 0));

/*
 * A native <dialog> opened with showModal(), rather than the div that used to
 * claim `aria-modal="true"` here. The browser then owns the three things the
 * div never did: it traps focus inside the panel, makes everything behind it
 * inert, and closes on Escape. Closing is routed back through the store so its
 * own state stays the single source of truth.
 *
 * close() hides the dialog on the spot, so the exit is played first and the
 * dialog closed once it ends. Pure CSS (`allow-discrete` + `overlay`) was tried:
 * iOS Safari has no `overlay`, dropped the sheet out of the top layer at once
 * and slid it out behind the page. Escape and Android back go through `cancel`,
 * prevented above, so they get the same exit instead of the native snap.
 */
watch(
  () => playerStore.panelOpened,
  async (opened) => {
    const dialog = dialogEl.value;
    if (!dialog) return;

    if (opened) {
      closing.value = false;
      if (!dialog.open) dialog.showModal();
      return;
    }
    if (!dialog.open) return;

    closing.value = true;
    await nextTick();
    // Own animations only: the subtree holds spinners that never finish.
    // Reduced motion leaves none, so this resolves at once.
    await Promise.allSettled(panelEl.value?.getAnimations().map((a) => a.finished) ?? []);
    if (playerStore.panelOpened) return;
    closing.value = false;
    dialog.close();
  },
);

// showModal() stretches the dialog's hit area over the whole viewport, so a
// click lands on the element itself only when it missed the panel inside it.
function onBackdropClick(event: MouseEvent): void {
  if (event.target === dialogEl.value) playerStore.closePanel();
}
</script>

<style scoped>

@keyframes sheet-in {
  from {
    transform: translateY(calc(100% + 2rem));
  }
}

@keyframes sheet-out {
  to {
    transform: translateY(calc(100% + 2rem));
  }
}

@keyframes scrim-in {
  from {
    opacity: 0;
  }
}

@keyframes scrim-out {
  to {
    opacity: 0;
  }
}

/*
 * Keyframes rather than transitions: a keyframe plays from display:none
 * without @starting-style, which older iOS lacks. Exponential ease-out in,
 * a shorter ease-in out — the sheet leaves faster than it arrives. The extra
 * 2rem clears the tablet layout's bottom gap.
 */
.player-slide-up {
  background: transparent;
  border: 0;
  height: 100%;
  inset: 0;
  max-height: 100dvh;
  max-width: 100vw;
  padding: 0;
  width: 100%;

  /*
   * A plain scrim, no backdrop blur: fading a full-screen blur is the one
   * thing here a mid-range phone can't hold at 60fps, and the sheet covers
   * most of what it blurred anyway.
   */
  &::backdrop {
    animation: scrim-in 300ms ease-out;
    background-color: rgb(0 0 0 / 55%);
  }

  .panel {
    animation: sheet-in 300ms cubic-bezier(0.16, 1, 0.3, 1);
    background-color: var(--bd-bg);
    border-top-left-radius: var(--bd-radius-lg);
    border-top-right-radius: var(--bd-radius-lg);
    bottom: 0;
    box-shadow: 0 -0.5rem 2rem rgb(0 0 0 / 40%);
    left: 0;
    max-height: 92dvh;
    overflow: auto;

    /* Scrolling the sheet to its end must not drag the page behind it. */
    overscroll-behavior: contain;
    padding: 0 var(--bd-space-5) calc(var(--bd-space-5) + env(safe-area-inset-bottom));
    position: absolute;
    right: 0;

    @media (--tablet-up) {
      border-radius: var(--bd-radius-md);
      bottom: 2rem;
      margin: 0 auto;
      max-width: 720px;
    }
  }

  &.closing {
    pointer-events: none;

    &::backdrop {
      animation: scrim-out 200ms ease-in forwards;
    }

    .panel {
      animation: sheet-out 200ms cubic-bezier(0.4, 0, 1, 1) forwards;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &::backdrop,
    &.closing::backdrop,
    .panel,
    &.closing .panel {
      animation: none;
    }
  }
}

.handle {
  background: transparent;
  border: 0;
  cursor: pointer;
  display: grid;
  height: 44px;
  margin: 0 auto;
  place-items: center;
  width: 100%;

  .grip {
    background-color: var(--bd-bg-lighter);
    border-radius: var(--bd-radius-lg);
    height: 0.3rem;
    transition: background-color 0.15s;
    width: 2.5rem;
  }

  &:hover .grip,
  &:focus-visible .grip {
    background-color: var(--bd-font-color-dark);
  }
}

.empty {
  padding: var(--bd-space-6) 0;
}

.content {
  display: grid;
  gap: var(--bd-space-5);

  @media (--tablet-up) {
    align-items: start;
    grid-template-columns: 250px 1fr;
  }
}

/*
 * The album is the mental unit, so on a phone the cover takes the width — capped
 * by height so the transport still lands without scrolling on a short screen.
 */
.cover {
  display: block;
  justify-self: center;
  width: min(100%, 42dvh);

  @media (--tablet-up) {
    width: 100%;
  }

  img {
    aspect-ratio: 1;
    border-radius: var(--bd-radius-md);
    display: block;
    object-fit: cover;
    width: 100%;
  }
}

.info {
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-1);
  min-width: 0;
}

.title {
  -webkit-box-orient: vertical;
  display: -webkit-box;
  font-size: var(--bd-font-size-xl);
  -webkit-line-clamp: 2;
  line-height: 1.15;
  margin: 0;
  overflow: hidden;
  text-wrap: balance;

  /* Programmatic focus target only; nothing to activate, so no ring. */
  &:focus {
    outline: none;
  }
}

.artists,
.album {
  margin: 0;
}

.album .link {
  color: var(--bd-font-color-dark);
  text-decoration: none;

  &:hover {
    color: var(--bd-primary);
  }
}

/* Bleeds to the sheet's edges: the seek bar carries its own inset. */
.seek {
  margin: var(--bd-space-3) calc(-1 * var(--bd-space-5)) 0;
}

/*
 * Pulled up into the seek row's bottom padding so the numbers read as the
 * bar's caption. They sit under the invisible range, which keeps the touches.
 */
.times {
  color: var(--bd-font-color-dark);
  display: flex;
  font-size: var(--bd-font-size-sm);
  font-variant-numeric: tabular-nums;
  justify-content: space-between;
  margin-top: calc(-1 * var(--bd-space-3));
  padding: 0 var(--bd-space-4);

  /* Same inset as the seek bar, so the numbers line up with its ends. */
  @media (--mobile) {
    padding: 0 var(--bd-space-3);
  }
}

.transport {
  margin-top: var(--bd-space-2);
}

.device {
  border-top: 1px solid var(--bd-bg-light);
  margin-top: var(--bd-space-3);
  padding-top: var(--bd-space-4);
}
</style>

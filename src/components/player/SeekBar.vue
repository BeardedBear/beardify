<template>
  <div class="seek-bar">
    <div ref="progressWrap" class="progress-wrap">
      <div class="progress">
        <div v-if="playerStore.playerState" :style="{ transform: `scaleX(${playedRatio})` }" class="bar" />
        <div :style="`width:${previewPercent}%`" class="seek">
          <div class="time font-bold">
            {{ previewTime }}
          </div>
        </div>
      </div>
      <!--
        Same trick as the volume wedge: the bar is painted, the range handles
        input. It replaces a mouse-only click listener on a div, so the position
        is now reachable with arrow keys and by touch — including on the phone,
        where seeking used to be switched off entirely.
      -->
      <input
        :value="position"
        :aria-valuetext="`${timecode(position) || '0:00'} of ${timecode(duration) || '0:00'}`"
        :disabled="!duration"
        :max="duration"
        :step="step"
        aria-label="Seek"
        class="range"
        min="0"
        type="range"
        @change="onCommit"
        @input="onScrub"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useMouseInElement } from "@vueuse/core";
import { computed, ref } from "vue";

import { usePlayer } from "@/components/player/PlayerStore";
import { usePlaybackClock } from "@/composables/usePlaybackClock";
import { timecode } from "@/helpers/date";

/** Arrow-key steps to cross the whole track. 200 keeps a 4min song at 1s and an hour-long episode at 18s. */
const KEYBOARD_STEPS = 200;
const MIN_STEP_MS = 1000;

const progressWrap = ref<HTMLDivElement>();

const { elementWidth, elementX, isOutside } = useMouseInElement(progressWrap);
const playerStore = usePlayer();
const { position, setPosition, setScrubbing } = usePlaybackClock();

const duration = computed<number>(() => playerStore.playerState?.duration ?? 0);

/*
 * One arrow press covers a fixed share of the track instead of a fixed second.
 * At the old flat 1s, crossing an hour-long episode took 3600 presses.
 */
const step = computed<number>(() => Math.max(MIN_STEP_MS, Math.round(duration.value / KEYBOARD_STEPS)));

const playedRatio = computed<number>(() => (duration.value ? Math.min(position.value / duration.value, 1) : 0));

/*
 * The read-out previews a position you have not committed to. With a pointer it
 * follows the pointer; opened by keyboard focus it follows the scrub instead.
 */
const previewPercent = computed<number>(() => {
  // Pointer away means the read-out was opened by keyboard focus, so it tracks
  // the position being scrubbed rather than collapsing to the left edge.
  if (isOutside.value || !elementWidth.value) return playedRatio.value * 100;
  return Math.min(Math.max((elementX.value / elementWidth.value) * 100, 0), 100);
});

const previewTime = computed<string>(() => timecode((duration.value / 100) * previewPercent.value) || "0:00");

// Scrubbing only moves the painted bar; the seek request goes out on release.
const onScrub = (e: Event): void => {
  setScrubbing(true);
  setPosition(Number((e.target as HTMLInputElement).value));
};

const onCommit = (e: Event): void => {
  const target = Number((e.target as HTMLInputElement).value);

  setPosition(target);
  setScrubbing(false);
  playerStore.seek(target);
};
</script>

<style scoped>

@keyframes pop-seek {
  from {
    opacity: 0;
  }

  to {
    opacity: 0.5;
  }
}

.seek-bar {
  padding: 0 1.2rem;

  @media (--mobile) {
    padding: 0 0.8rem;
  }
}

.progress {
  background: var(--bg-color-light);
  border-radius: 1rem;
  height: 0.2rem;
  position: relative;

  .seek {
    /*
     * 120ms, and the keyframe lands on the resting opacity rather than on 1:
     * an animation outranks a plain declaration and `both` holds that override
     * forever, so the old `to { opacity: 1 }` quietly killed the 0.5 below it.
     */
    animation: pop-seek 0.12s ease both;
    background-color: var(--bg-color-lighter);
    border-radius: 1rem;
    bottom: 0;
    display: none;
    left: 0;
    opacity: 0.5;
    pointer-events: none;
    position: absolute;
    top: 0;

    /*
     * Neutral chip, not an accent one. White on `--primary-color` measures
     * 3.85:1 at this size — under the 4.5 small text needs — and the accent is
     * user-chosen, so no fixed foreground can be guaranteed against it. The
     * theme's own text/background pair is contrasty in both themes by
     * construction, and it leaves the accent to the bar it floats above.
     */
    .time {
      background: var(--bg-color-darker);
      border-radius: 0.3rem;
      bottom: calc(100% + 0.4rem);
      color: var(--font-color);
      font-size: var(--font-size-sm);

      /* Same as the timecode in the controls: the digits must not shift width mid-scrub. */
      font-variant-numeric: tabular-nums;
      padding: 0.1rem 0.4rem;
      pointer-events: none;
      position: absolute;
      right: 0;
      transform: translateX(50%);
    }
  }

  /*
   * scaleX, not a width transition. The position ticks every 200ms and the old
   * version re-ran a layout pass each time — for the whole length of every
   * track, on a component that is always on screen. A transform is composited
   * instead, so the same movement costs no layout at all.
   */
  .bar {
    background: var(--primary-color);
    border-radius: 1rem;
    bottom: 0;
    left: 0;
    position: absolute;
    top: 0;
    transform-origin: left center;
    transition: transform linear 0.2s;
    width: 100%;
  }
}

.progress-wrap {
  padding: 0.3rem 0 0.8rem;
  position: relative;

  &:hover {
    .seek {
      display: block;
    }
  }

  /* The rail is 0.2rem tall; the target you can actually hit is the whole row. */
  .range {
    appearance: none;
    background: transparent;
    cursor: pointer;
    height: 100%;
    inset: 0;
    margin: 0;
    opacity: 0;
    position: absolute;
    width: 100%;
    z-index: 2;

    &:disabled {
      cursor: default;
    }
  }

  /*
   * A range spreads its value over the track minus one thumb width, so a click
   * lands up to half a thumb from the pixel it hit — 8px of a 1400px bar is
   * 20 seconds of an hour-long episode, and the hover read-out, which follows
   * the pointer exactly, made the gap visible. A zero-width thumb maps the
   * value linearly across the whole bar; the position is painted by `.bar`.
   */
  .range::-webkit-slider-thumb {
    appearance: none;
    height: 100%;
    width: 0;
  }

  .range::-moz-range-thumb {
    border: 0;
    height: 100%;
    width: 0;
  }

  /* Keyboard scrubbing needs the read-out too — the bar alone is 2px tall. */
  &:has(.range:focus-visible) {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;

    .seek {
      display: block;
    }
  }

  @media (pointer: coarse) {
    padding: 0.9rem 0 1.4rem;
  }
}
</style>

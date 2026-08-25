import { useIntervalFn } from "@vueuse/core";
import { effectScope, ref, type Ref, watch } from "vue";

import { usePlayer } from "@/components/player/PlayerStore";

/**
 * How often the local clock advances. The seek bar's `transition` matches this
 * exactly, so every transition is replaced the frame it ends and the bar moves
 * continuously instead of stepping.
 */
const TICK_MS = 200;

/**
 * How far the local clock may drift from the player before it snaps back.
 * Below this, the SDK's own jitter would make the read-out twitch.
 */
const RESYNC_THRESHOLD_MS = 1500;

const position = ref<number>(0);
/*
 * Held while a drag is in progress. Without it the ticker kept adding 200ms to
 * the value bound to the range, so the thumb crept forward under a finger that
 * was holding still.
 */
const held = ref<boolean>(false);
/*
 * Detached: the interval and the watcher belong to the module, not to whichever
 * component happened to call first — otherwise unmounting that component (the
 * mobile slide-up, say) would stop the clock for the desktop bar still on screen.
 */
const scope = effectScope(true);
let started = false;

/**
 * The single playback clock, shared by every component that shows a position.
 *
 * There used to be two: the seek bar counted at 200ms and the timecode at
 * 1000ms, each resyncing on its own threshold. They drifted up to 1.5s apart,
 * so the number under the bar disagreed with the bar — and a keyboard scrub
 * moved the bar while the number sat still, because it was watching the store
 * rather than the drag.
 */
export function usePlaybackClock(): {
  position: Ref<number>;
  setPosition: (ms: number) => void;
  setScrubbing: (scrubbing: boolean) => void;
} {
  const playerStore = usePlayer();

  if (!started) {
    started = true;
    scope.run(() => {
      useIntervalFn(() => {
        const state = playerStore.playerState;

        if (held.value || !state || state.paused) return;
        // Clamped: a stale "playing" state would otherwise run the clock past the track.
        position.value = Math.min(position.value + TICK_MS, state.duration);
      }, TICK_MS);

      watch(
        () => playerStore.playerState.position,
        (newPosition) => {
          if (held.value) return;
          if (Math.abs(newPosition - position.value) > RESYNC_THRESHOLD_MS) position.value = newPosition;
        },
      );
    });
  }

  return {
    position,
    /** Moves the clock without waiting for the store — used while scrubbing. */
    setPosition: (ms: number): void => {
      position.value = ms;
    },
    /** Freezes the clock for the length of a drag, so the value cannot move under the pointer. */
    setScrubbing: (scrubbing: boolean): void => {
      held.value = scrubbing;
    },
  };
}

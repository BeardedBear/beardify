import { useMagicKeys } from "@vueuse/core";
import { watch } from "vue";

import { useDialog } from "@/components/dialog/DialogStore";
import { usePlayer } from "@/components/player/PlayerStore";

/** How far one arrow press moves the playhead. Matches what podcast apps use for a skip button. */
const SEEK_DELTA_MS = 10_000;

/**
 * Register global keyboard shortcuts for the player:
 * - Shift+Up / Shift+Down: adjust volume by 2%
 * - Shift+Left / Shift+Right: seek by 10 seconds
 * - Space (on body): toggle play/pause
 * - Ctrl/Cmd+K: open search
 */
export function useKeyboardEvents(): void {
  const playerStore = usePlayer();
  const dialogStore = useDialog();
  const { shift_down, shift_left, shift_right, shift_up } = useMagicKeys();
  const delta = 2;

  /*
   * Shift-modified like the volume pair, for the same reason: a bare arrow key
   * belongs to whatever is focused — a list, a scroll container, the seek bar's
   * own range — and stealing it globally would break all three.
   */
  const seekBy = (offset: number): void => {
    const duration = playerStore.playerState?.duration;

    if (!duration) return;
    playerStore.seek(Math.min(Math.max(playerStore.playerState.position + offset, 0), duration));
  };

  watch(shift_right, (v) => {
    if (v) seekBy(SEEK_DELTA_MS);
  });

  watch(shift_left, (v) => {
    if (v) seekBy(-SEEK_DELTA_MS);
  });

  watch(shift_up, (v) => {
    const currentVolume = playerStore.devices.activeDevice ? playerStore.devices.activeDevice.volume_percent : 0;
    if (v && currentVolume)
      if (100 - delta > currentVolume) {
        playerStore.setVolume(currentVolume + delta);
      } else {
        playerStore.setVolume(100);
      }
  });

  watch(shift_down, (v) => {
    const currentVolume = playerStore.devices.activeDevice ? playerStore.devices.activeDevice.volume_percent : 0;
    if (v && currentVolume)
      if (currentVolume - delta < 0) {
        playerStore.setVolume(1);
      } else {
        playerStore.setVolume(currentVolume - delta);
      }
  });

  useMagicKeys({
    onEventFired(keyboardEvent) {
      /*
       * preventDefault matters: Ctrl+K is the browsers' own address-bar search
       * shortcut, so without it both fire and the browser wins.
       */
      if (keyboardEvent.key.toLowerCase() === "k" && (keyboardEvent.ctrlKey || keyboardEvent.metaKey)) {
        keyboardEvent.preventDefault();
        if (keyboardEvent.type === "keydown") dialogStore.open({ type: "search" });
        return;
      }

      if (keyboardEvent.key === " " && keyboardEvent.target === document.body) {
        keyboardEvent.preventDefault();
        if (playerStore.currentlyPlaying.is_playing) {
          playerStore.pause();
        } else {
          playerStore.play();
        }
      }
    },
    passive: false,
  });
}

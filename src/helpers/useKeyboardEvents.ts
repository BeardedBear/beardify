import { useMagicKeys } from "@vueuse/core";
import { watch } from "vue";

import { useDialog } from "@/components/dialog/DialogStore";
import { usePlayer } from "@/components/player/PlayerStore";

/**
 * Register global keyboard shortcuts for the player:
 * - Shift+Up / Shift+Down: adjust volume by 2%
 * - Space (on body): toggle play/pause
 * - Ctrl/Cmd+K: open search
 */
export function useKeyboardEvents(): void {
  const playerStore = usePlayer();
  const dialogStore = useDialog();
  const { shift_down, shift_up } = useMagicKeys();
  const delta = 2;

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

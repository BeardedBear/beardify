import { useMagicKeys } from "@vueuse/core";
import { watch } from "vue";

import { usePlayer } from "../components/player/PlayerStore";

export function useKeyboardEvents(): void {
  const playerStore = usePlayer();
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

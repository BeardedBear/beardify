import { usePlayer } from "../components/player/PlayerStore";
import { useMagicKeys } from "@vueuse/core";
import { watch } from "vue";

export function useKeyboardEvents(): void {
  const playerStore = usePlayer();
  const { shift_up, shift_down } = useMagicKeys();
  const delta = 2;

  watch(shift_up, (v) => {
    const currentVolume = playerStore.devices.activeDevice ? playerStore.devices.activeDevice.volume_percent : 0;
    if (v && currentVolume)
      100 - delta > currentVolume ? playerStore.setVolume(currentVolume + delta) : playerStore.setVolume(100);
  });

  watch(shift_down, (v) => {
    const currentVolume = playerStore.devices.activeDevice ? playerStore.devices.activeDevice.volume_percent : 0;
    if (v && currentVolume)
      currentVolume - delta < 0 ? playerStore.setVolume(1) : playerStore.setVolume(currentVolume - delta);
  });

  useMagicKeys({
    passive: false,
    onEventFired(keyboardEvent) {
      if (keyboardEvent.key === " " && keyboardEvent.target === document.body) {
        keyboardEvent.preventDefault();
        playerStore.currentlyPlaying.is_playing ? playerStore.pause() : playerStore.play();
      }
    },
  });
}

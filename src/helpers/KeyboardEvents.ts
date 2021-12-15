import { usePlayer } from "../components/player/PlayerStore";

export default function (): void {
  const playerStore = usePlayer();

  function setVolume(volume: number): void {
    playerStore.setVolume(volume);
  }

  addEventListener("keydown", (keyboardEvent: KeyboardEvent) => {
    const currentVolume = playerStore.devices.activeDevice ? playerStore.devices.activeDevice.volume_percent : 0;
    const delta = 2;

    if (currentVolume && keyboardEvent.shiftKey) {
      if (keyboardEvent.key === "ArrowUp") {
        100 - delta > currentVolume ? setVolume(currentVolume + delta) : setVolume(100);
      } else if (keyboardEvent.key === "ArrowDown") {
        currentVolume - delta < 0 ? setVolume(1) : setVolume(currentVolume - delta);
      }
    }
  });

  window.addEventListener("keydown", (keyboardEvent: KeyboardEvent) => {
    if (keyboardEvent.code === "Space" && keyboardEvent.target == document.body) {
      keyboardEvent.preventDefault();
      playerStore.currentlyPlaying.is_playing ? playerStore.pause() : playerStore.play();
    }
  });
}

import { usePlayer } from "../components/player/PlayerPinia";

export default (): void => {
  const playerStore = usePlayer();

  function setVolume(volume: number): void {
    playerStore.setVolume(volume);
  }

  addEventListener("keydown", (e) => {
    const currentVolume = playerStore.devices.activeDevice ? playerStore.devices.activeDevice.volume_percent : 0;
    const delta = 2;

    if (currentVolume && e.shiftKey) {
      if (e.key === "ArrowUp") {
        100 - delta > currentVolume ? setVolume(currentVolume + delta) : setVolume(100);
      } else if (e.key === "ArrowDown") {
        currentVolume - delta < 0 ? setVolume(1) : setVolume(currentVolume - delta);
      }
    }
  });
};

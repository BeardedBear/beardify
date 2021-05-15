import { useStore } from "vuex";
import { RootState } from "../@types/RootState";
import { PlayerActions } from "../components/player/PlayerStore";

export default () => {
  const store = useStore<RootState>();

  function setVolume(volume: number) {
    store.dispatch(`player/${PlayerActions.setVolume}`, volume);
  }

  addEventListener("keydown", e => {
    let currentVolume = store.state.player.devices.activeDevice
      ? store.state.player.devices.activeDevice.volume_percent
      : 0;
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

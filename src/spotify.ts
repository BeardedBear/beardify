import { usePlayer } from "./components/player/PlayerStore";
import { useAuth } from "./views/auth/AuthStore";

window.onSpotifyWebPlaybackSDKReady = (): void => {
  const player = new Spotify.Player({
    name: "Beardify",
    getOAuthToken: (cb): void => cb(useAuth().accessToken),
    volume: 1,
  });

  function getState(state: Spotify.PlaybackState | null): void {
    if (state && state.track_window) {
      usePlayer().updateFromSDK(state?.track_window.current_track, state.position);
    }
  }

  player.connect();
  player.on("authentication_error", () => dispatchEvent(new CustomEvent("noAccess")));

  player.addListener("ready", ({ device_id }) => {
    usePlayer().thisDevice(device_id);
  });

  player.addListener("player_state_changed", (state) => {
    getState(state);
    if (document.hasFocus()) usePlayer().getPlayerState();
  });
};

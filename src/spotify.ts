import { usePlayer } from "./components/player/PlayerStore";
import { useAuth } from "./views/auth/AuthStore";

window.onSpotifyWebPlaybackSDKReady = (): void => {
  const authStore = useAuth();
  const player = new Spotify.Player({
    name: "Beardify",
    getOAuthToken: (cb): void => cb(authStore.accessToken),
    volume: 1,
  });

  player.connect();
  player.on("authentication_error", () => dispatchEvent(new CustomEvent("noAccess")));

  player.addListener("ready", ({ device_id }) => {
    usePlayer().thisDevice(device_id);
  });

  player.addListener("player_state_changed", (e) => {
    usePlayer().updateFromSDK(e.track_window.current_track, e.position);
    if (document.hasFocus()) usePlayer().getPlayerState();
  });
};

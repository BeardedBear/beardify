import { usePlayer } from "./components/player/PlayerStore";
import { useAuth } from "./views/auth/AuthStore";

export default window.onSpotifyWebPlaybackSDKReady = (): Spotify.Player => {
  const player = new Spotify.Player({
    getOAuthToken: (cb): void => cb(useAuth().accessToken),
    name: "Beardify",
    volume: 1,
  });

  player.connect();

  player.addListener("ready", ({ device_id }) => {
    usePlayer().thisDevice(device_id);
  });

  player.addListener("player_state_changed", (state) => {
    usePlayer().syncPlayerState(state);
  });

  return player;
};

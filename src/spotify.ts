/* eslint-disable no-console */
import { NotificationType } from "./@types/Notification";
import { useNotification } from "./components/notification/NotificationStore";
import { usePlayer } from "./components/player/PlayerStore";
import { useAuth } from "./views/auth/AuthStore";

window.onSpotifyWebPlaybackSDKReady = (): void => {
  const player = new Spotify.Player({
    name: "Beardify",
    getOAuthToken: (cb): void => cb(useAuth().accessToken),
    volume: 1,
  });

  // function getState(state: Spotify.PlaybackState | null): void {
  //   if (state?.track_window) {
  //     usePlayer().updateFromSDK(state?.track_window.current_track, state.position);
  //   }
  // }

  player.connect();

  // Errors
  player.on("initialization_error", ({ message }) => {
    const msg = "Failed to initialize";
    console.error(msg, message);
    useNotification().addNotification({ type: NotificationType.Error, msg });
  });

  player.resume().then(() => {
    console.log("Resumed!");
  });

  player.on("authentication_error", ({ message }) => {
    const msg = "Failed to authenticate";
    console.error(msg, message);
    useNotification().addNotification({ type: NotificationType.Error, msg });
  });

  player.on("account_error", ({ message }) => {
    const msg = "Failed to validate Spotify account";
    console.error(msg, message);
    useNotification().addNotification({ type: NotificationType.Error, msg });
  });

  player.on("playback_error", ({ message }) => {
    const msg = "Failed to perform playback";
    console.error(msg, message);
    useNotification().addNotification({ type: NotificationType.Error, msg });
  });

  player.addListener("not_ready", ({ device_id }) => {
    const msg = "Device ID is not ready for playback";
    console.error(msg, device_id);
    useNotification().addNotification({ type: NotificationType.Error, msg });
  });

  player.addListener("ready", ({ device_id }) => {
    usePlayer().thisDevice(device_id);
  });

  player.addListener("player_state_changed", (state) => {
    console.log("playerstate", state);
    usePlayer().syncPlayerState(state);
    // getState(state);
    if (document.hasFocus()) usePlayer().syncPlayerState(state);
  });
  player.nextTrack().then(() => {
    console.log("Skipped to next track!");
  });
};

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
    dispatchEvent(
      new CustomEvent("initdevice", {
        detail: { thisDevice: device_id },
      }),
    );
  });
};

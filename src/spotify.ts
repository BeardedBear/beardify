window.onSpotifyWebPlaybackSDKReady = (): void => {
  const player = new Spotify.Player({
    name: "Beardify",
    getOAuthToken: (cb): void => cb(JSON.parse(localStorage.getItem("beardify") || "").auth.auth.accessToken),
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

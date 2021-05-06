window.onSpotifyWebPlaybackSDKReady = () => {
  const player = new Spotify.Player({
    name: "Beardify3",
    getOAuthToken: cb => cb(JSON.parse(localStorage.getItem("beardify") || "").auth.auth.accessToken),
    volume: 0.5
  });

  player.connect();
  player.on("authentication_error", () => window.dispatchEvent(new CustomEvent("noAccess")));

  // Update current player state
  setInterval(() => {
    player?.getCurrentState().then(state => {
      window.dispatchEvent(
        new CustomEvent("playerStateChanged", {
          detail: {
            duration: state?.duration,
            position: state?.position,
            paused: state?.paused,
            repeat_mode: state?.repeat_mode,
            shuffle: state?.shuffle,
            track_window: state?.track_window
          }
        })
      );
    });
  }, 500);

  player.addListener("player_state_changed", event => {
    window.dispatchEvent(new CustomEvent("refreshToken"));
  });

  player.addListener("ready", ({ device_id }) => {
    window.dispatchEvent(
      new CustomEvent("initdevice", {
        detail: { thisDevice: device_id }
      })
    );
  });
};

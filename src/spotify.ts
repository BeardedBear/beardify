import { NotificationType } from "@/@types/Notification";
import { usePlayer } from "@/components/player/PlayerStore";
import { clearAuthData } from "@/helpers/authUtils";
import { notification } from "@/helpers/notifications";
import { getLastStoredVolume, getStoredDeviceVolume } from "@/helpers/player";
import { useAuth } from "@/views/auth/AuthStore";

// Global error handler for uncaught SDK errors
const handleSDKError = (error: Error): void => {
  // Intercept specific errors related to Cloud Playback
  if (
    error.message
    && (error.message.includes("PlayLoad event failed with status 404") || error.message.includes("item_before_load"))
  ) {
    // Don't notify the user for these specific error types
    // These are expected during normal operation of the Spotify SDK
    // Common during track transitions or connection state changes
    // Silent handling with no logging or notification
    return;
  }

  // Handle other PlayLoad errors separately
  if (error.message && error.message.includes("PlayLoad event failed")) {
    // These might be temporary, so let's not alert the user unless they persist
    // Silent handling for now, might add retry logic later
    return;
  }

  notification({
    msg: "Spotify player error: " + (error.message || "Unknown error"),
    type: NotificationType.Error,
  });
};

// Use a singleton player instance so repeated calls reuse the same SDK player
let spotifyPlayer: null | Spotify.Player = null;

const createPlayer = (): Spotify.Player => {
  if (spotifyPlayer) return spotifyPlayer;

  // Capture uncaught SDK errors
  try {
    // Determine initial volume: prefer stored volume, then active device, then last used volume
    // We check localStorage first because on page refresh, the Pinia store is not yet populated
    // and thisDeviceId is empty until the "ready" event fires
    const playerStore = usePlayer();
    const storedVolume = getStoredDeviceVolume(playerStore.thisDeviceId);
    const activeVolumePercent = playerStore.devices.activeDevice?.volume_percent;
    const lastVolume = getLastStoredVolume();

    // Use stored volume for device first, then API-reported volume, then last used volume as fallback
    const volumePercent = storedVolume ?? activeVolumePercent ?? lastVolume;
    const initialVolume
      = typeof volumePercent === "number" && !Number.isNaN(volumePercent)
        ? Math.max(0, Math.min(1, volumePercent / 100))
        : undefined;

    const playerInit: Spotify.PlayerInit = {
      getOAuthToken: (cb: (token: string) => void): void => {
        try {
          const token = useAuth().accessToken;
          cb(token);
        } catch {
          // Notification only, no need for the error variable
          notification({
            msg: "Failed to authenticate with Spotify",
            type: NotificationType.Error,
          });

          // Redirect to login in case of critical authentication failure
          setTimeout(() => {
            clearAuthData();
            window.location.href = "/login";
          }, 3000);
        }
      },
      name: "Beardify",
    };

    const initOptions = typeof initialVolume === "number" ? { ...playerInit, volume: initialVolume } : playerInit;
    const player = new Spotify.Player(initOptions as Spotify.PlayerInit);

    // Managing successful connection events
    player.addListener("ready", ({ device_id }) => {
      usePlayer().thisDevice(device_id);

      // Attempt to refresh the device list (populates volume_percent) and then restore volume
      (async (): Promise<void> => {
        try {
          await usePlayer().getDeviceList();
        } catch {
          // ignore network errors here
        }

        // Prefer stored volume (from localStorage) over API-reported volume
        const stored = getStoredDeviceVolume(device_id);
        const apiVolPercent = usePlayer().devices.activeDevice?.volume_percent;
        const lastVol = getLastStoredVolume();
        const volPercent = stored ?? apiVolPercent ?? lastVol;

        if (typeof volPercent === "number") {
          const v = Math.max(0, Math.min(1, volPercent / 100));
          player.setVolume(v).catch((e) => {
            if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.debug("Failed to restore SDK volume on ready:", e);
            }
          });
        }
      })();
    });

    // Managing player state changes
    player.addListener("player_state_changed", (state) => {
      if (state) {
        usePlayer().syncPlayerState(state);
      }
    });

    // Error handling
    player.addListener("initialization_error", ({ message }) => {
      notification({
        msg: "Player initialization error: " + message,
        type: NotificationType.Error,
      });
    });

    player.addListener("authentication_error", ({ message }) => {
      notification({
        msg: "Authentication error: " + message,
        type: NotificationType.Error,
      });

      // Try to reconnect with a delay to avoid infinite loops
      setTimeout(() => {
        player.connect();
      }, 3000);
    });

    player.addListener("account_error", ({ message }) => {
      notification({
        msg: "Spotify account error: " + message,
        type: NotificationType.Error,
      });
    });

    player.addListener("playback_error", ({ message }) => {
      // For playback errors, we may have specific cases
      if (message && message.includes("404")) {
        // Common 404 errors during playback - maybe just a temporary problem
        // Silent handling for common 404 errors
        return;
      }

      notification({
        msg: "Playback error: " + message,
        type: NotificationType.Error,
      });
    });

    // Handling disconnection
    player.addListener("not_ready", () => {
      notification({
        msg: "Lost connection to Spotify",
        type: NotificationType.Warning,
      });
    });

    // Connection strategy with progressive retries
    let connectAttempt = 0;
    const maxAttempts = 5;

    const attemptConnect = async (): Promise<void> => {
      connectAttempt++;
      try {
        const success = await player.connect();
        if (success) {
          connectAttempt = 0; // Reset counter in case of success
          // Refresh device list to ensure we have the latest volume_percent set by the API
          try {
            await usePlayer().getDeviceList();
          } catch {
            // ignore
          }

          // Prefer persisted stored volume for this device when available (avoid sudden max)
          const devId = usePlayer().devices.activeDevice?.id;
          const stored = getStoredDeviceVolume(devId);
          const lastVol = getLastStoredVolume();
          const volPercentOnConnect = stored ?? usePlayer().devices.activeDevice?.volume_percent ?? lastVol;
          if (typeof volPercentOnConnect === "number") {
            const v = Math.max(0, Math.min(1, volPercentOnConnect / 100));
            player.setVolume(v).catch((e) => {
              if (import.meta.env.DEV) {
                // eslint-disable-next-line no-console
                console.debug("Failed to restore SDK volume on connect:", e);
              }
            });
          }
        } else if (connectAttempt < maxAttempts) {
          const delay = Math.min(1000 * Math.pow(2, connectAttempt), 30000); // Exponential backoff limited to 30s
          notification({
            msg: `Reconnection attempt to Spotify (${connectAttempt}/${maxAttempts})...`,
            type: NotificationType.Warning,
          });
          setTimeout(attemptConnect, delay);
        } else {
          notification({
            msg: "Unable to connect to Spotify player after several attempts",
            type: NotificationType.Error,
          });
        }
      } catch (e) {
        if (e instanceof Error) {
          handleSDKError(e);
        } else {
          handleSDKError(new Error("Unknown Spotify connection error"));
        }
      }
    };

    // Start the first connection attempt
    attemptConnect();

    // Intercept uncaught SDK errors
    window.addEventListener("unhandledrejection", (event) => {
      if (
        event.reason
        && event.reason.message
        && (event.reason.message.includes("Spotify")
          || event.reason.message.includes("PlayLoad")
          || event.reason.message.includes("item_before_load"))
      ) {
        event.preventDefault(); // Prevent propagation of the unhandled error
        handleSDKError(event.reason);
      }
    });

    spotifyPlayer = player;
    return player;
  } catch {
    // No need for error variable since we're only showing a notification
    notification({
      msg: "Error initializing Spotify player",
      type: NotificationType.Error,
    });

    // Return a minimal stub that satisfies the Spotify.Player interface to avoid runtime crashes
    const stub = {
      _options: {
        // No-op implementation; parameter omitted to avoid unused var lint warning
        getOAuthToken: (): void => {},
        id: "stub",
        name: "Beardify (stub)",
      },
      addListener: (): undefined => undefined,
      connect: async (): Promise<boolean> => false,
      disconnect: (): void => undefined,
      getCurrentState: async (): Promise<null | Spotify.PlaybackState> => null,
      getVolume: async (): Promise<number> => 0,
      nextTrack: async (): Promise<void> => undefined,
      on: (): undefined => undefined,
      pause: async (): Promise<void> => undefined,
      previousTrack: async (): Promise<void> => undefined,
      removeListener: (): void => undefined,
      resume: async (): Promise<void> => undefined,
      seek: async (): Promise<void> => undefined,
      setName: async (): Promise<void> => undefined,
      setVolume: async (): Promise<void> => undefined,
      togglePlay: async (): Promise<void> => undefined,
    } satisfies Spotify.Player;

    spotifyPlayer = stub;
    return stub;
  }
};

// Export the player creation function for use elsewhere in the app
export const createSpotifyPlayer = (): Spotify.Player => createPlayer();

// !! IMPORTANT: Assign the function to window.onSpotifyWebPlaybackSDKReady
// This is what the Spotify SDK is looking for
window.onSpotifyWebPlaybackSDKReady = createPlayer;

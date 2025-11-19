import { NotificationType } from "@/@types/Notification";
import { usePlayer } from "@/components/player/PlayerStore";
import { clearAuthData } from "@/helpers/authUtils";
import { notification } from "@/helpers/notifications";
import { useAuth } from "@/views/auth/AuthStore";

// Global error handler for uncaught SDK errors
const handleSDKError = (error: Error): void => {
  // Intercept specific errors related to Cloud Playback
  if (
    error.message &&
    (error.message.includes("PlayLoad event failed with status 404") || error.message.includes("item_before_load"))
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

// Create a player factory function that the global handler will call
const createPlayer = (): Spotify.Player => {
  // Capture uncaught SDK errors
  try {
    const player = new Spotify.Player({
      getOAuthToken: (cb): void => {
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
      volume: 1,
    });

    // Managing successful connection events
    player.addListener("ready", ({ device_id }) => {
      usePlayer().thisDevice(device_id);
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
        event.reason &&
        event.reason.message &&
        (event.reason.message.includes("Spotify") ||
          event.reason.message.includes("PlayLoad") ||
          event.reason.message.includes("item_before_load"))
      ) {
        event.preventDefault(); // Prevent propagation of the unhandled error
        handleSDKError(event.reason);
      }
    });

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
    return stub;
  }
};

// Export the player creation function for use elsewhere in the app
export const createSpotifyPlayer = createPlayer;

// !! IMPORTANT: Assign the function to window.onSpotifyWebPlaybackSDKReady
// This is what the Spotify SDK is looking for
window.onSpotifyWebPlaybackSDKReady = createPlayer;

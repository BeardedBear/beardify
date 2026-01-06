/**
 * Helper functions for handling API errors in Beardify
 */
import { NotificationType } from "@/@types/Notification";
import { instance } from "@/api";
import { usePlayer } from "@/components/player/PlayerStore";
import { notification } from "@/helpers/notifications";
import { createSpotifyPlayer } from "@/spotify";

// Define a type for API errors
export interface ApiError {
  response?: {
    status: number;
  };
}

/**
 * Ensures a device is active and ready before attempting playback
 * @returns Promise resolving to a valid device ID or null if unavailable
 */
export async function ensureActiveDevice(): Promise<null | string> {
  const playerStore = usePlayer();
  let deviceId = playerStore.devices.activeDevice?.id;

  // If we have an active device, use it
  if (deviceId) {
    return deviceId;
  }

  // Otherwise refresh the device list and try to find/activate one
  try {
    // First get the latest device list
    await playerStore.getDeviceList();
    deviceId = playerStore.devices.activeDevice?.id;

    // If we found an active device after refresh, use it
    if (deviceId) {
      return deviceId;
    }

    // If we have this device available, try to activate it
    if (playerStore.thisDeviceId) {
      await playerStore.setDevice(playerStore.thisDeviceId);
      // Wait a moment for the device to activate if needed
      await new Promise((resolve) => setTimeout(resolve, 250));
      return playerStore.thisDeviceId;
    }

    // If we have any device in the list, try to activate the first one
    if (playerStore.devices.list.length > 0) {
      const firstDeviceId = playerStore.devices.list[0].id;
      await playerStore.setDevice(firstDeviceId);
      // Wait a moment for the device to activate if needed
      await new Promise((resolve) => setTimeout(resolve, 250));
      return firstDeviceId;
    }
  } catch {
    // Silent error handling
    // This is an internal function, so we don't need to notify the user here
    return null;
  }

  // No device found or could be activated
  return null;
}

/**
 * Execute a Spotify API call with proper error handling
 * @param deviceId - The device ID to use for playback
 * @param payload - The payload to send to the API
 * @param endpoint - The API endpoint to call (e.g., 'me/player/play')
 */
export async function executePlaybackApiCall(
  deviceId: string,
  payload: Record<string, unknown>,
  endpoint: string = "me/player/play",
): Promise<void> {
  try {
    await instance().put(`${endpoint}?device_id=${deviceId}`, payload);
  } catch (error: unknown) {
    await handlePlaybackApiError(error, async (newDeviceId) => {
      await instance().put(`${endpoint}?device_id=${newDeviceId}`, payload);
    });
  }
}

/**
 * Handle playback API errors with retries for device-related errors
 * @param error - The error that occurred during the API call
 * @param retry - Function to call for retrying the operation
 */
export async function handlePlaybackApiError(
  error: unknown,
  retry: (deviceId: string) => Promise<void>,
): Promise<void> {
  if (isApiError(error) && error.response?.status === 404) {
    // Device might not be ready yet. Try a retry, and proactively attempt to connect the Web Playback SDK
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // First pass: try to find an active device
      let newDeviceId = await ensureActiveDevice();

      // If still not present, try to kick the Web Playback SDK (might register this device)
      if (!newDeviceId) {
        try {
          createSpotifyPlayer().connect();
        } catch {
          // ignore any errors from SDK connect attempt
        }

        // Wait a bit longer for SDK to register a device
        await new Promise((resolve) => setTimeout(resolve, 1500));
        newDeviceId = await ensureActiveDevice();
      }

      if (newDeviceId) {
        await retry(newDeviceId);
        return;
      } else {
        throw new Error("No device available");
      }
    } catch (e) {
      // If still failing after retry and SDK attempt, refresh device list and notify user with clearer guidance
      const playerStore = usePlayer();
      try {
        await playerStore.getDeviceList();
      } catch {
        // ignore refresh errors
      }

      notification({
        msg: "No active device found. Please open Spotify on one of your devices or enable the Web Player, then retry. Refreshing device list...",
        type: NotificationType.Warning,
      });

      // Log original error for debugging (keeps user-facing message concise)
      // eslint-disable-next-line no-console
      console.debug("Playback API error (404 / NO_ACTIVE_DEVICE):", e);
    }
  } else if (isApiError(error) && error.response?.status === 403) {
    notification({
      msg: "You don't have permission to play on this device.",
      type: NotificationType.Error,
    });
  } else {
    notification({
      msg: "Unable to start playback. Please check your device.",
      type: NotificationType.Error,
    });
  }
}

/**
 * Type guard for API errors
 * @param error - The error to check
 * @returns True if the error is an API error, false otherwise
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "status" in error.response &&
    typeof error.response.status === "number"
  );
}

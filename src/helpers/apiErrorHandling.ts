/**
 * Helper functions for handling API errors in Beardify
 */
import { NotificationType } from "../@types/Notification";
import { instance } from "../api";
import { usePlayer } from "../components/player/PlayerStore";
import { notification } from "./notifications";
import { ensureActiveDevice } from "./play";

// Define a type for API errors
export interface ApiError {
  response?: {
    status: number;
  };
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
    // Device might not be ready yet, try once more with a delay
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newDeviceId = await ensureActiveDevice();

      if (newDeviceId) {
        await retry(newDeviceId);
      } else {
        throw new Error("No device available");
      }
    } catch {
      // If still failing after retry, notify user
      const playerStore = usePlayer();
      playerStore.getDeviceList();
      notification({
        msg: "Device not found. Refreshing device list...",
        type: NotificationType.Warning,
      });
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

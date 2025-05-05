import { NotificationType } from "../@types/Notification";
import { Track, TrackSimplified } from "../@types/Track";
import { instance } from "../api";
import { usePlayer } from "../components/player/PlayerStore";
import { notification } from "./notifications";

// Define a type for API errors
interface ApiError {
  response?: {
    status: number;
  };
}

export async function playSong(trackUri: string, position?: number): Promise<void> {
  const deviceId = await ensureActiveDevice();

  if (!deviceId) {
    notification({
      msg: "No active device found. Please select a device.",
      type: NotificationType.Warning,
    });
    return;
  }

  // The device_id must be passed as a URL query parameter, not in the body
  const payload = position ? { position_ms: position, uris: [trackUri] } : { uris: [trackUri] };

  try {
    await instance().put(`me/player/play?device_id=${deviceId}`, payload);
  } catch (error: unknown) {
    if (isApiError(error) && error.response?.status === 404) {
      // Device might not be ready yet, try once more with a delay
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const newDeviceId = await ensureActiveDevice();
        if (newDeviceId) {
          await instance().put(`me/player/play?device_id=${newDeviceId}`, payload);
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
}

export async function playSongs(sliceIndex: number, tracks: Track[] | TrackSimplified[]): Promise<void> {
  const deviceId = await ensureActiveDevice();

  if (!deviceId) {
    notification({
      msg: "No active device found. Please select a device.",
      type: NotificationType.Warning,
    });
    return;
  }

  const flatTracks = tracks.map((track: Track | TrackSimplified) => track.uri);
  const uris = flatTracks.slice(sliceIndex);

  if (uris.length === 0) {
    notification({
      msg: "No tracks found to play.",
      type: NotificationType.Warning,
    });
    return;
  }

  const payload = { uris };

  try {
    await instance().put(`me/player/play?device_id=${deviceId}`, payload);
  } catch (error: unknown) {
    if (isApiError(error) && error.response?.status === 404) {
      // Device might not be ready yet, try once more with a delay
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const newDeviceId = await ensureActiveDevice();
        if (newDeviceId) {
          await instance().put(`me/player/play?device_id=${newDeviceId}`, payload);
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
}

/**
 * Ensures a device is active and ready before attempting playback
 * @returns Promise resolving to a valid device ID or null if unavailable
 */
async function ensureActiveDevice(): Promise<null | string> {
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
      // Wait a moment for the device to activate
      await new Promise((resolve) => setTimeout(resolve, 500));
      return playerStore.thisDeviceId;
    }

    // If we have any device in the list, try to activate the first one
    if (playerStore.devices.list.length > 0) {
      const firstDeviceId = playerStore.devices.list[0].id;
      await playerStore.setDevice(firstDeviceId);
      // Wait a moment for the device to activate
      await new Promise((resolve) => setTimeout(resolve, 500));
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

// Type guard for API errors
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as ApiError).response === "object" &&
    (error as ApiError).response !== null &&
    "status" in (error as ApiError).response!
  );
}

import { NotificationType } from "../@types/Notification";
import { Track, TrackSimplified } from "../@types/Track";
import { usePlayer } from "../components/player/PlayerStore";
import { notification } from "./notifications";

// API error types moved to apiErrorHandling.ts helper

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

  // Import here to avoid circular dependency
  const { executePlaybackApiCall } = await import("./apiErrorHandling");
  await executePlaybackApiCall(deviceId, payload);
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

  // Import here to avoid circular dependency
  const { executePlaybackApiCall } = await import("./apiErrorHandling");
  await executePlaybackApiCall(deviceId, payload);
}

// API error handling moved to apiErrorHandling.ts helper

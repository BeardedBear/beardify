import { NotificationType } from "@/@types/Notification";
import { Track, TrackSimplified } from "@/@types/Track";
import { ensureActiveDevice, executePlaybackApiCall } from "@/helpers/apiErrorHandling";
import { notification } from "@/helpers/notifications";

// API error types moved to apiErrorHandling.ts helper

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

  await executePlaybackApiCall(deviceId, payload);
}

// API error handling moved to apiErrorHandling.ts helper

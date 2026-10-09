import { NotificationType } from "@/@types/Notification";
import { startPlayback } from "@/helpers/apiErrorHandling";
import { notification } from "@/helpers/notifications";

/**
 * Play a single track by URI on the active device.
 * @param trackUri - Spotify track URI (e.g. "spotify:track:abc123")
 * @param position - Optional playback start position in milliseconds
 */
export async function playSong(trackUri: string, position?: number): Promise<void> {
  // The device_id must be passed as a URL query parameter, not in the body
  await startPlayback(position ? { position_ms: position, uris: [trackUri] } : { uris: [trackUri] });
}

/**
 * Play a slice of a track list starting from a given index.
 * Sends all URIs from sliceIndex onwards to Spotify so the queue is pre-populated.
 * @param sliceIndex - Index of the track to start from
 * @param tracks - Full list of tracks to play from; anything carrying a `uri`
 */
export async function playSongs(sliceIndex: number, tracks: { uri: string }[]): Promise<void> {
  const uris = tracks.slice(sliceIndex).map((track) => track.uri);

  if (uris.length === 0) {
    notification({
      msg: "No tracks found to play",
      type: NotificationType.Warning,
    });
    return;
  }

  await startPlayback({ uris });
}

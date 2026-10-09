import { NotificationType } from "@/@types/Notification";
import { Track } from "@/@types/Track";
import { notification } from "@/helpers/notifications";
import { clamp } from "@/helpers/volume";

/**
 * Returns true if the given track is a podcast episode (type "episode" or episode URI).
 * Used to skip podcast-specific controls that don't apply to music tracks.
 * @param track - Track-like object with optional type and URI
 */
export function isPodcastTrack(track?: { type?: string; uri?: string } | null): boolean {
  if (!track) return false;
  return track.type === "episode" || !!track.uri?.includes("spotify:episode:");
}

/**
 * Convert Spotify API Track objects to the Spotify Web Playback SDK Track shape.
 * Needed because the SDK and REST API use different object structures.
 * @param queue - Array of full API Track objects
 * @returns Array of SDK-compatible Spotify.Track objects
 */
export function mapQueueToSpotifyTracks(queue: Track[]): Spotify.Track[] {
  return queue.map((track) => {
    return {
      album: {
        images: track.album.images,
        name: track.album.name,
        uri: track.album.uri,
      },
      artists: track.artists.map((artist) => ({ name: artist.name, uri: artist.uri })),
      duration_ms: track.duration_ms,
      id: track.id,
      is_playable: track.is_playable ?? true,
      media_type: "audio",
      name: track.name,
      type: "track",
      uid: track.id,
      uri: track.uri,
    } as Spotify.Track;
  });
}

/** Show a user-facing error notification when the playback queue cannot be fetched. */
export function notifyQueueError(): void {
  notification({ msg: "Unable to load the queue", type: NotificationType.Error });
}

// Persist device volume in localStorage so we can restore when the API reports a default 100
const STORAGE_PREFIX = "beardify.deviceVolume.";
const LAST_VOLUME_KEY = `${STORAGE_PREFIX}last`;

/**
 * Volume to hand the SDK (0-1): this device's stored volume, else the API-reported
 * one, else the last volume used on any device (device id unknown on page load).
 * Stored values come first because the API reports a default 100 after a refresh.
 * @param deviceId - Spotify device ID, if known
 * @param apiVolumePercent - Volume reported by `me/player/devices`
 * @returns SDK volume, or undefined when nothing is known
 */
export function resolveSdkVolume(
  deviceId: null | string | undefined,
  apiVolumePercent: null | number | undefined,
): number | undefined {
  const stored = deviceId ? readVolume(`${STORAGE_PREFIX}${deviceId}`) : null;
  const percent = stored ?? apiVolumePercent ?? readVolume(LAST_VOLUME_KEY);
  return typeof percent === "number" && !Number.isNaN(percent) ? clamp(percent) / 100 : undefined;
}

/**
 * Persist a device's volume in localStorage so it can be restored after page refresh.
 * Also updates the generic "last used" volume key as a device-agnostic fallback.
 * @param deviceId - Spotify device ID
 * @param volumePercent - Volume to store (0-100)
 */
export function saveDeviceVolume(deviceId: null | string | undefined, volumePercent: number): void {
  if (!deviceId) return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${deviceId}`, String(Math.round(volumePercent)));
    // Also save as last used volume for fallback on page refresh
    localStorage.setItem(LAST_VOLUME_KEY, String(Math.round(volumePercent)));
  } catch {
    // ignore storage errors
  }
}

function readVolume(key: string): null | number {
  try {
    const v = localStorage.getItem(key);
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

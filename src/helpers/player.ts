import { NotificationType } from "@/@types/Notification";
import { Track } from "@/@types/Track";
import { instance } from "@/api";
import { notification } from "@/helpers/notifications";

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
  notification({ msg: "Error getting queue", type: NotificationType.Error });
}

/**
 * Set the repeat mode on the active Spotify device.
 * @param state - "context" to repeat the current context, "off" to disable repeat
 * @returns true on success, false if the API call fails
 */
export async function setRepeatState(state: "context" | "off"): Promise<boolean> {
  try {
    await instance().put(`me/player/repeat?state=${state}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Enable or disable shuffle on the active Spotify device.
 * @param state - true to enable shuffle, false to disable
 * @returns true on success, false if the API call fails
 */
export async function setShuffleState(state: boolean): Promise<boolean> {
  try {
    await instance().put(`me/player/shuffle?state=${state ? "true" : "false"}`);
    return true;
  } catch {
    return false;
  }
}

// Persist device volume in localStorage so we can restore when the API reports a default 100
const STORAGE_PREFIX = "beardify.deviceVolume.";
const LAST_VOLUME_KEY = `${STORAGE_PREFIX}last`;

// Get the last used volume (fallback when device ID is not yet known)
/**
 * Retrieve the last volume used across all devices from localStorage.
 * Used as a fallback when the current device ID is not yet known (e.g. on page load).
 * @returns Volume percentage (0-100) or null if not stored
 */
export function getLastStoredVolume(): null | number {
  try {
    const v = localStorage.getItem(LAST_VOLUME_KEY);
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/**
 * Retrieve the last known volume for a specific device from localStorage.
 * @param deviceId - Spotify device ID
 * @returns Volume percentage (0-100) or null if not stored or deviceId is falsy
 */
export function getStoredDeviceVolume(deviceId: null | string | undefined): null | number {
  if (!deviceId) return null;
  try {
    const v = localStorage.getItem(`${STORAGE_PREFIX}${deviceId}`);
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
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

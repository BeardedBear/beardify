import { NotificationType } from "@/@types/Notification";
import { Track } from "@/@types/Track";
import { instance } from "@/api";
import { notification } from "@/helpers/notifications";

export function isPodcastTrack(track?: { type?: string; uri?: string } | null): boolean {
  if (!track) return false;
  return track.type === "episode" || !!track.uri?.includes("spotify:episode:");
}

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

export function notifyQueueError(): void {
  notification({ msg: "Error getting queue", type: NotificationType.Error });
}

export async function setRepeatState(state: "context" | "off"): Promise<boolean> {
  try {
    await instance().put(`me/player/repeat?state=${state}`);
    return true;
  } catch {
    return false;
  }
}

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
const GLOBAL_VOLUME_KEY = "beardify.lastVolume";

// Get the last used volume (fallback when device ID is not yet known)
export function getLastStoredVolume(): null | number {
  try {
    const v = localStorage.getItem(GLOBAL_VOLUME_KEY);
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

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

export function saveDeviceVolume(deviceId: null | string | undefined, volumePercent: number): void {
  if (!deviceId) return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${deviceId}`, String(Math.round(volumePercent)));
    // Also save as last used volume for fallback on page refresh
    localStorage.setItem(GLOBAL_VOLUME_KEY, String(Math.round(volumePercent)));
  } catch {
    // ignore storage errors
  }
}

import type { Track, TrackSimplified } from "@/@types/Track";

import { AlbumSimplified } from "@/@types/Album";

/**
 * Check whether a track matches the currently playing track.
 * Comparison is done by artist name + track name (not by ID, to handle SDK/API object discrepancies).
 * @param track - Track to test
 * @param currentTrack - The track currently playing
 */
export function isCurrentTrack(
  track: AlbumSimplified | Spotify.Track | Track | TrackSimplified | undefined,
  currentTrack: AlbumSimplified | Spotify.Track | Track | TrackSimplified | undefined,
): boolean {
  if (!track || !currentTrack) return false;
  return currentTrack?.artists[0].name === track.artists[0].name && currentTrack?.name === track.name;
}

/**
 * Normalizes a string for comparison (lowercase, remove special chars, trim)
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim();
}

/**
 * Extract the Spotify ID from a Spotify URI (e.g. "spotify:track:abc123" → "abc123").
 * Returns an empty string if the URI is undefined.
 * @param uri - Spotify URI string
 */
export function transformUriToid(uri: string | undefined): string {
  if (!uri) return "";
  return uri.split(":").pop() || uri;
}

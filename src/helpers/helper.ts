import type { Track, TrackSimplified } from "../@types/Track";

import { AlbumSimplified } from "../@types/Album";

export function isCurrentTrack(
  track: AlbumSimplified | Spotify.Track | Track | TrackSimplified | undefined,
  currentTrack: AlbumSimplified | Spotify.Track | Track | TrackSimplified | undefined,
): boolean {
  if (!track || !currentTrack) return false;
  return currentTrack?.artists[0].name === track.artists[0].name && currentTrack?.name === track.name;
}

export function transformUriToid(uri: string | undefined): string {
  if (!uri) return "";
  return uri.split(":").pop() || uri;
}

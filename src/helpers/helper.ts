import { AlbumSimplified } from "../@types/Album";
import type { Track, TrackSimplified } from "../@types/Track";

export function transformUriToid(uri: string | undefined): string {
  if (!uri) return "";
  return uri.split(":").pop() || uri;
}

export function isCurrentTrack(
  track: Spotify.Track | AlbumSimplified | Track | TrackSimplified | undefined,
  currentTrack: Spotify.Track | AlbumSimplified | Track | TrackSimplified | undefined,
) {
  if (!track || !currentTrack) return false;
  return currentTrack?.artists[0].name === track.artists[0].name && currentTrack?.name === track.name;
}

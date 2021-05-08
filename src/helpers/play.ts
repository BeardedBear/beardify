import { Track, TrackSimplified } from "../@types/Track";
import { instance } from "../api";

export function playSongs(i: number, tracks: TrackSimplified[] | Track[]) {
  const flatTracks = tracks.map((e: TrackSimplified | Track) => e.uri);
  const uris = flatTracks.slice(i);
  instance.put("https://api.spotify.com/v1/me/player/play", { uris });
}

export function playSong(trackUri: string) {
  instance.put("https://api.spotify.com/v1/me/player/play", { uris: [trackUri] });
}

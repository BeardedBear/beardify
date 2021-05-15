import { Track, TrackSimplified } from "../@types/Track";
import { api, instance } from "../api";

export function playSongs(i: number, tracks: TrackSimplified[] | Track[]): void {
  const flatTracks = tracks.map((e: TrackSimplified | Track) => e.uri);
  const uris = flatTracks.slice(i);
  instance.put(`${api.url}me/player/play`, { uris });
}

export function playSong(trackUri: string): void {
  instance.put(`${api.url}me/player/play`, { uris: [trackUri] });
}

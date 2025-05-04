import { Track, TrackSimplified } from "../@types/Track";
import { instance } from "../api";

export function playSong(trackUri: string, position?: number): void {
  instance().put(`me/player/play`, position ? { position_ms: position, uris: [trackUri] } : { uris: [trackUri] });
}

export function playSongs(sliceIndex: number, tracks: Track[] | TrackSimplified[]): void {
  const flatTracks = tracks.map((track: Track | TrackSimplified) => track.uri);
  const uris = flatTracks.slice(sliceIndex);
  instance().put(`me/player/play`, { uris });
}

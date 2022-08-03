import { Track, TrackSimplified } from "../@types/Track";
import { instance } from "../api";
import { usePlayer } from "../components/player/PlayerStore";

export function playSongs(sliceIndex: number, tracks: TrackSimplified[] | Track[]): void {
  const flatTracks = tracks.map((track: TrackSimplified | Track) => track.uri);
  const uris = flatTracks.slice(sliceIndex);
  instance().put(`me/player/play`, { uris });
}

export function playSong(trackUri: string, position?: number): void {
  instance().put(`me/player/play`, position ? { uris: [trackUri], position_ms: position } : { uris: [trackUri] });
}

export function updatePlayerState(): void {
  usePlayer().getDeviceList();
}

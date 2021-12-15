import { Track, TrackSimplified } from "../@types/Track";
import { instance } from "../api";
import { syncOfficialSpotifyClient } from "./getSpotifyPlayerState";

export function playSongs(sliceIndex: number, tracks: TrackSimplified[] | Track[]): void {
  const flatTracks = tracks.map((track: TrackSimplified | Track) => track.uri);
  const uris = flatTracks.slice(sliceIndex);
  instance()
    .put(`me/player/play`, { uris })
    .then(() => syncOfficialSpotifyClient());
}

export function playSong(trackUri: string): void {
  instance()
    .put(`me/player/play`, { uris: [trackUri] })
    .then(() => syncOfficialSpotifyClient());
}

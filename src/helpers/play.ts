import { Track, TrackSimplified } from "../@types/Track";
import { instance } from "../api";
import { syncOfficialSpotifyClient } from "./getSpotifyPlayerState";

export function playSongs(i: number, tracks: TrackSimplified[] | Track[]): void {
  const flatTracks = tracks.map((e: TrackSimplified | Track) => e.uri);
  const uris = flatTracks.slice(i);
  instance()
    .put(`me/player/play`, { uris })
    .then(() => syncOfficialSpotifyClient());
}

export function playSong(trackUri: string): void {
  instance()
    .put(`me/player/play`, { uris: [trackUri] })
    .then(() => syncOfficialSpotifyClient());
}

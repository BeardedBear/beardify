import { ReleaseDatePrecision } from "./Album";
import { Artist } from "./Artist";
import { Image } from "./Image";
import { Device } from "./Device";

export interface CurrentlyPlayingItem {
  album: CurrentlyPlayingAlbum;
  artists: Artist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number | null | undefined;
  explicit: boolean;
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
}

export type CurrentlyPlayingType = "track" | "episode" | "ad" | "unknown";
export interface CurrentlyPlaying {
  context: CurrentlyPlayingContext;
  currently_playing_type: CurrentlyPlayingType;
  device: Device;
  is_playing: boolean;
  item: CurrentlyPlayingItem | null;
  progress_ms: number;
  repeat_state: "off" | "track" | "context";
  shuffle_state: boolean;
  timestamp: number;
}

export type ContextType = "artist" | "playlist" | "album" | "show";
export interface CurrentlyPlayingContext {
  href: string;
  type: ContextType;
  uri: string;
}

export interface CurrentlyPlayingAlbum {
  album_type: string;
  artists: Artist[];
  available_markets: string[];
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: ReleaseDatePrecision;
  total_tracks: number;
  type: string;
  uri: string;
}

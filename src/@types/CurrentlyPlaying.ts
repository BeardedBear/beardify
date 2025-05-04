import { AlbumType, ReleaseDatePrecision } from "./Album";
import { Artist } from "./Artist";
import { Device } from "./Device";
import { Image } from "./Image";

export type ContextType = "album" | "artist" | "playlist" | "show";

export interface CurrentlyPlaying {
  context: CurrentlyPlayingContext;
  currently_playing_type: CurrentlyPlayingType;
  device: Device;
  is_playing: boolean;
  item: CurrentlyPlayingItem | null;
  progress_ms: number;
  repeat_state: "context" | "off" | "track";
  shuffle_state: boolean;
  timestamp: number;
}
export interface CurrentlyPlayingAlbum {
  album_type: AlbumType;
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

export interface CurrentlyPlayingContext {
  href: string;
  type: ContextType;
  uri: string;
}
export interface CurrentlyPlayingItem {
  album: CurrentlyPlayingAlbum;
  artists: Artist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
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

export type CurrentlyPlayingType = "ad" | "episode" | "track" | "unknown";

import { Artist, Image } from "./Artist";

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

export interface CurrentlyPlayingDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}
export interface CurrentlyPlaying {
  context: CurrentlyPlayingContext;
  currently_playing_type: string;
  device: CurrentlyPlayingDevice;
  is_playing: boolean;
  item: CurrentlyPlayingItem;
  progress_ms: number;
  repeat_state: string;
  shuffle_state: boolean;
  timestamp: number;
}
export interface CurrentlyPlayingContext {
  href: string;
  type: string;
  uri: string;
}

interface CurrentlyPlayingAlbum {
  album_type: string;
  artists: Artist[];
  available_markets: string[];
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: string;
  total_tracks: number;
  type: string;
  uri: string;
}

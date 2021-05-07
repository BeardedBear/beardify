import { Artist, AlbumSimplified, defaultAlbumSimplified, defaultArtist, Image } from "./Artist";

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

const defaultCurrentlyPlayingContext = {
  href: "",
  type: "",
  uri: ""
};

const defaultCurrentlyPlayingDevice = {
  id: "",
  is_active: false,
  is_private_session: false,
  is_restricted: false,
  name: "",
  type: "",
  volume_percent: 0
};

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

const defaultCurrentlyPlayingAlbum = {
  album_type: "",
  artists: [defaultArtist],
  available_markets: ["FR"],
  href: "",
  id: "",
  images: [],
  name: "",
  release_date: "",
  release_date_precision: "",
  total_tracks: 0,
  type: "",
  uri: ""
};

const defaultCurrentlyPlayingItem = {
  album: defaultCurrentlyPlayingAlbum,
  artists: [defaultArtist],
  available_markets: ["FR"],
  disc_number: 0,
  duration_ms: 0,
  explicit: false,
  href: "",
  id: "",
  is_local: false,
  name: "",
  popularity: 0,
  preview_url: "",
  track_number: 0,
  type: "",
  uri: ""
};

export const defaultCurrentlyPlaying = {
  context: defaultCurrentlyPlayingContext,
  currently_playing_type: "",
  device: defaultCurrentlyPlayingDevice,
  is_playing: false,
  item: defaultCurrentlyPlayingItem,
  progress_ms: 0,
  repeat_state: "",
  shuffle_state: false,
  timestamp: 0
};

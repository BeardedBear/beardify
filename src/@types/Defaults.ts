import { Album, AlbumSimplified } from "./Album";
import { Artist, ExternalUrls } from "./Artist";
import { TrackSimplified, Track } from "./Track";

export const defaultImage = {
  height: 0,
  url: "",
  width: 0
};

export const defaultExternalUrls: ExternalUrls = {
  spotify: ""
};

export const defaultAlbumSimplified: AlbumSimplified = {
  album_type: "",
  artists: [],
  external_urls: defaultExternalUrls,
  href: "",
  id: "",
  images: [defaultImage],
  name: "",
  release_date: "",
  release_date_precision: "",
  total_tracks: 0,
  type: "",
  uri: ""
};

export const defaultArtist: Artist = {
  external_urls: {
    spotify: ""
  },
  followers: {
    href: null,
    total: 0
  },
  genres: [""],
  href: "",
  id: "",
  images: [defaultImage],
  name: "",
  popularity: 0,
  type: "",
  uri: ""
};

const defaultCurrentlyPlayingAlbum = {
  album_type: "",
  artists: [defaultArtist],
  available_markets: ["FR"],
  href: "",
  id: "",
  images: [defaultImage],
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
export const defaultTrack: Track = {
  album: defaultAlbumSimplified,
  artists: [],
  disc_number: 0,
  duration_ms: 0,
  explicit: false,
  href: "",
  id: "",
  items: [],
  is_local: false,
  is_playable: false,
  name: "",
  popularity: 0,
  preview_url: "",
  track_number: 0,
  type: "",
  uri: ""
};
export const defaultTrackSimplified: TrackSimplified = {
  artists: [],
  available_markets: [],
  disc_number: 0,
  duration_ms: 0,
  explicit: false,
  external_urls: {
    spotify: ""
  },
  href: "",
  id: "",
  is_local: false,
  name: "",
  preview_url: "",
  track_number: 0,
  type: "",
  uri: ""
};

export const defaultAlbum: Album = {
  album_type: "",
  artists: [],
  available_markets: [],
  genres: [],
  href: "",
  id: "",
  images: [defaultImage],
  label: "",
  name: "",
  popularity: 0,
  release_date: "",
  release_date_precision: "",
  total_tracks: 0,
  tracks: defaultTrack,
  type: "",
  uri: ""
};

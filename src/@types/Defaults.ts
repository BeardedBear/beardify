import { Album, AlbumSimplified } from "./Album";
import { Artist } from "./Artist";
import {
  CurrentlyPlaying,
  CurrentlyPlayingContext,
  CurrentlyPlayingItem,
  CurrentlyPlayingAlbum
} from "./CurrentlyPlaying";
import { Image } from "./Image";
import { ExternalUrls } from "./Misc";
import { TrackSimplified, Track } from "./Track";
import { Followers, Me } from "./Me";
import { PlaylistTracksRef, SimplifiedPlaylist } from "./Playlist";
import { PublicUser } from "./PublicUser";
import { defaultDevice } from "./Player";

export const defaultImage: Image = {
  height: 0,
  url: "",
  width: 0
};

export const defaultPaging = {
  href: "",
  items: [],
  limit: 0,
  next: "",
  offset: 0,
  previous: null,
  total: 0
};

export const defaultExternalUrls: ExternalUrls = {
  spotify: ""
};

export const defaultAlbumSimplified: AlbumSimplified = {
  album_group: "album",
  album_type: "album",
  artists: [],
  external_urls: defaultExternalUrls,
  href: "",
  id: "",
  images: [defaultImage],
  name: "",
  release_date: "",
  release_date_precision: "year",
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

const defaultCurrentlyPlayingAlbum: CurrentlyPlayingAlbum = {
  album_type: "",
  artists: [defaultArtist],
  available_markets: ["FR"],
  href: "",
  id: "",
  images: [defaultImage],
  name: "",
  release_date: "",
  release_date_precision: "year",
  total_tracks: 0,
  type: "",
  uri: ""
};

const defaultCurrentlyPlayingItem: CurrentlyPlayingItem = {
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

const defaultCurrentlyPlayingContext: CurrentlyPlayingContext = {
  href: "",
  type: "album",
  uri: ""
};

export const defaultCurrentlyPlaying: CurrentlyPlaying = {
  context: defaultCurrentlyPlayingContext,
  currently_playing_type: "track",
  device: defaultDevice,
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
  album_type: "album",
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
  release_date_precision: "year",
  total_tracks: 0,
  tracks: defaultTrack,
  type: "",
  uri: ""
};

const defaultFollowers: Followers = {
  href: null,
  total: 0
};

export const defaultMe: Me = {
  country: "",
  display_name: "",
  email: "",
  external_urls: defaultExternalUrls,
  followers: defaultFollowers,
  href: "",
  id: "",
  images: [defaultImage],
  product: "premium",
  type: "",
  uri: ""
};

export const defaultPublicUser: PublicUser = {
  display_name: "",
  external_urls: defaultExternalUrls,
  followers: defaultFollowers,
  href: "",
  id: "",
  images: [defaultImage],
  type: "",
  uri: ""
};

export const defaultPlaylistTracksRef: PlaylistTracksRef = {
  href: "",
  total: 0
};

export const defaultSimplifiedPlaylist: SimplifiedPlaylist = {
  collaborative: false,
  description: "",
  external_urls: defaultExternalUrls,
  href: "",
  id: "",
  images: [defaultImage],
  name: "",
  owner: defaultPublicUser,
  public: false,
  snapshot_id: "",
  tracks: defaultPlaylistTracksRef,
  type: "",
  uri: ""
};

export const defaultPlaylistTrack = {
  added_at: 0,
  added_by: defaultPublicUser,
  is_local: false,
  track: defaultTrack
};

export const defaultPlaylist = {
  collaborative: false,
  description: "",
  external_urls: defaultExternalUrls,
  followers: defaultFollowers,
  href: "",
  id: "",
  images: [defaultImage],
  name: "",
  owner: defaultPublicUser,
  public: false,
  snapshot_id: "",
  tracks: defaultPaging,
  type: "",
  uri: ""
};

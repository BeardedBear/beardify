import { Album, AlbumSimplified } from "./Album";
import { Artist } from "./Artist";
import { CurrentlyPlaying, CurrentlyPlayingContext } from "./CurrentlyPlaying";
import { Device } from "./Device";
import { Image } from "./Image";
import { Followers } from "./Me";
import { ExternalUrls } from "./Misc";
import { PlaylistTracksRef, SimplifiedPlaylist } from "./Playlist";
import { PublicUser } from "./PublicUser";
import { Track, TrackSimplified } from "./Track";

export const defaultImage: Image = {
  height: 0,
  url: "",
  width: 0,
};

export const defaultPaging = {
  href: "",
  items: [],
  limit: 0,
  next: "",
  offset: 0,
  previous: null,
  total: 0,
};

export const defaultExternalUrls: ExternalUrls = {
  spotify: "",
};

export const defaultAlbumSimplified: AlbumSimplified = {
  album_group: "album",
  album_type: "album",
  artists: [],
  available_markets: [],
  external_urls: defaultExternalUrls,
  href: "",
  id: "",
  images: [],
  name: "",
  release_date: "",
  release_date_precision: "year",
  total_tracks: 0,
  type: "",
  uri: "",
};

export const defaultArtist: Artist = {
  external_urls: {
    spotify: "",
  },
  followers: {
    href: null,
    total: 0,
  },
  genres: [""],
  href: "",
  id: "",
  images: [],
  name: "",
  popularity: 0,
  type: "",
  uri: "",
};

const defaultCurrentlyPlayingContext: CurrentlyPlayingContext = {
  href: "",
  type: "album",
  uri: "",
};

export const defaultDevice: Device = {
  id: null,
  is_active: false,
  is_private_session: false,
  is_restricted: false,
  name: "",
  type: "computer",
  volume_percent: null,
};

export const defaultCurrentlyPlaying: CurrentlyPlaying = {
  context: defaultCurrentlyPlayingContext,
  currently_playing_type: "track",
  device: defaultDevice,
  is_playing: false,
  item: null,
  progress_ms: 1,
  repeat_state: "off",
  shuffle_state: false,
  timestamp: 0,
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
  uri: "",
};
export const defaultTrackSimplified: TrackSimplified = {
  artists: [],
  available_markets: [],
  disc_number: 0,
  duration_ms: 0,
  explicit: false,
  external_urls: {
    spotify: "",
  },
  href: "",
  id: "",
  is_local: false,
  name: "",
  preview_url: "",
  track_number: 0,
  type: "",
  uri: "",
};

export const defaultAlbum: Album = {
  album_type: "album",
  artists: [],
  available_markets: [],
  genres: [],
  copyrights: [],
  external_urls: defaultExternalUrls,
  href: "",
  id: "",
  images: [],
  label: "",
  name: "",
  popularity: 0,
  release_date: "",
  release_date_precision: "year",
  total_tracks: 0,
  tracks: defaultTrack,
  type: "",
  uri: "",
};

const defaultFollowers: Followers = {
  href: null,
  total: 0,
};

export const defaultPublicUser: PublicUser = {
  display_name: "",
  external_urls: defaultExternalUrls,
  followers: defaultFollowers,
  href: "",
  id: "",
  images: [],
  type: "",
  uri: "",
};

export const defaultPlaylistTracksRef: PlaylistTracksRef = {
  href: "",
  total: 0,
};

export const defaultSimplifiedPlaylist: SimplifiedPlaylist = {
  collaborative: false,
  description: "",
  external_urls: defaultExternalUrls,
  href: "",
  id: "",
  images: [],
  name: "",
  owner: defaultPublicUser,
  public: false,
  snapshot_id: "",
  tracks: defaultPlaylistTracksRef,
  type: "",
  uri: "",
};

export const defaultPlaylistTrack = {
  added_at: 0,
  added_by: defaultPublicUser,
  is_local: false,
  track: defaultTrack,
};

export const defaultPlaylist = {
  collaborative: false,
  description: "",
  external_urls: defaultExternalUrls,
  followers: defaultFollowers,
  href: "",
  id: "",
  images: [],
  name: "",
  owner: defaultPublicUser,
  public: false,
  snapshot_id: "",
  tracks: defaultPaging,
  type: "",
  uri: "",
};

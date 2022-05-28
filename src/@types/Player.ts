import { CurrentlyPlaying } from "./CurrentlyPlaying";
import { Device } from "./Device";

export interface Player {
  devices: {
    activeDevice: Device;
    list: Device[];
  };
  thisDeviceId: string;
  currentlyPlaying: CurrentlyPlaying;
  currentFromSDK: Spotify.Track | null;
  currentPositionFromSDK: number;
}

export type PlayerError =
  | "NO_PREV_TRACK"
  | "NO_NEXT_TRACK"
  | "NO_SPECIFIC_TRACK"
  | "ALREADY_PAUSED"
  | "NOT_PAUSED"
  | "NOT_PLAYING_LOCALLY"
  | "NOT_PLAYING_TRACK"
  | "NOT_PLAYING_CONTEXT"
  | "ENDLESS_CONTEXT"
  | "CONTEXT_DISALLOW"
  | "ALREADY_PLAYING"
  | "RATE_LIMITED"
  | "REMOTE_CONTROL_DISALLOW"
  | "DEVICE_NOT_CONTROLLABLE"
  | "VOLUME_CONTROL_DISALLOW"
  | "NO_ACTIVE_DEVICE"
  | "PREMIUM_REQUIRED"
  | "UNKNOWN";

const defaultAlbum: Spotify.Album = {
  uri: "",
  name: "",
  images: [],
};

const defaultArtist: Spotify.Artist[] = [
  {
    uri: "",
    name: "",
  },
];

const defaultTrack: Spotify.Track = {
  uri: "",
  uid: "",
  id: null,
  type: "track",
  media_type: "audio",
  name: "",
  is_playable: true,
  album: defaultAlbum,
  artists: defaultArtist,
  duration_ms: 0,
};

const defaultTrackWindow: Spotify.PlaybackTrackWindow = {
  current_track: defaultTrack,
  previous_tracks: [],
  next_tracks: [],
};

const defaultPlaybackDisallows = {
  pausing: false,
  peeking_next: false,
  peeking_prev: false,
  resuming: false,
  seeking: false,
  skipping_next: false,
  skipping_prev: false,
};

const defaultPlaybackRestrictions = {
  disallow_pausing_reasons: [],
  disallow_peeking_next_reasons: [],
  disallow_peeking_prev_reasons: [],
  disallow_resuming_reasons: [],
  disallow_seeking_reasons: [],
  disallow_skipping_next_reasons: [],
  disallow_skipping_prev_reasons: [],
};

export const defaultPlaybackState: Spotify.PlaybackState = {
  context: {
    metadata: "",
    uri: null,
  },
  loading: false,
  playback_features: { hifi_status: "NONE" },
  playback_id: "",
  playback_quality: "VERY_HIGH",
  timestamp: 0,
  disallows: defaultPlaybackDisallows,
  duration: 0,
  position: 0,
  paused: true,
  repeat_mode: 0,
  shuffle: false,
  restrictions: defaultPlaybackRestrictions,
  track_window: defaultTrackWindow,
};

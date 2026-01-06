import { CurrentlyPlaying } from "./CurrentlyPlaying";
import { Device } from "./Device";

export interface Player {
  currentFromSDK: null | Spotify.Track;
  currentlyPlaying: CurrentlyPlaying;
  currentPositionFromSDK: number;
  devices: {
    activeDevice: Device;
    list: Device[];
  };
  heartbeatFailureCount?: number;
  heartbeatFailureNotified?: boolean;
  heartbeatInterval: null | number; // Interval ID for keeping the device active
  isSettingDevice?: boolean;
  lastRequestedDeviceId?: null | string;
  panelOpened?: boolean;
  playerState: Spotify.PlaybackState;
  queue: Spotify.Track[];
  queueOpened: boolean;
  thisDeviceId: string;
}

export type PlayerError =
  | "ALREADY_PAUSED"
  | "ALREADY_PLAYING"
  | "CONTEXT_DISALLOW"
  | "DEVICE_NOT_CONTROLLABLE"
  | "ENDLESS_CONTEXT"
  | "NO_ACTIVE_DEVICE"
  | "NO_NEXT_TRACK"
  | "NO_PREV_TRACK"
  | "NO_SPECIFIC_TRACK"
  | "NOT_PAUSED"
  | "NOT_PLAYING_CONTEXT"
  | "NOT_PLAYING_LOCALLY"
  | "NOT_PLAYING_TRACK"
  | "PREMIUM_REQUIRED"
  | "RATE_LIMITED"
  | "REMOTE_CONTROL_DISALLOW"
  | "UNKNOWN"
  | "VOLUME_CONTROL_DISALLOW";

const defaultAlbum: Spotify.Album = {
  images: [],
  name: "",
  uri: "",
};

const defaultArtist: Spotify.Artist[] = [
  {
    name: "",
    uri: "",
  },
];

const defaultTrack: Spotify.Track = {
  album: defaultAlbum,
  artists: defaultArtist,
  duration_ms: 0,
  id: null,
  is_playable: true,
  media_type: "audio",
  name: "",
  type: "track",
  uid: "",
  uri: "",
};

const defaultTrackWindow: Spotify.PlaybackTrackWindow = {
  current_track: defaultTrack,
  next_tracks: [],
  previous_tracks: [],
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
  disallows: defaultPlaybackDisallows,
  duration: 0,
  loading: false,
  paused: true,
  playback_features: { hifi_status: "NONE" },
  playback_id: "",
  playback_quality: "VERY_HIGH",
  position: 0,
  repeat_mode: 0,
  restrictions: defaultPlaybackRestrictions,
  shuffle: false,
  timestamp: 0,
  track_window: defaultTrackWindow,
};

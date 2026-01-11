interface Window {
  onSpotifyWebPlaybackSDKReady(): void;
  Spotify: typeof Spotify;
}

declare namespace Spotify {
  type AddListenerFn = ((event: "not_ready" | "ready", cb: PlaybackInstanceListener) => void)
    & ((event: "player_state_changed", cb: PlaybackStateListener) => void)
    & ((event: ErrorTypes, cb: ErrorListener) => void);

  interface Album {
    images: Image[];
    name: string;
    uri: string;
  }

  interface Artist {
    name: string;
    uri: string;
  }

  interface Error {
    message: string;
  }

  type ErrorListener = (err: Error) => void;

  type ErrorTypes = "account_error" | "authentication_error" | "initialization_error" | "playback_error";

  interface Image {
    height?: null | number;
    url: string;
    width?: null | number;
  }

  interface PlaybackContext {
    metadata: unknown;
    uri: null | string;
  }

  interface PlaybackDisallows {
    pausing: boolean;
    peeking_next: boolean;
    peeking_prev: boolean;
    resuming: boolean;
    seeking: boolean;
    skipping_next: boolean;
    skipping_prev: boolean;
  }

  type PlaybackInstanceListener = (inst: WebPlaybackInstance) => void;

  interface PlaybackRestrictions {
    disallow_pausing_reasons: string[];
    disallow_peeking_next_reasons: string[];
    disallow_peeking_prev_reasons: string[];
    disallow_resuming_reasons: string[];
    disallow_seeking_reasons: string[];
    disallow_skipping_next_reasons: string[];
    disallow_skipping_prev_reasons: string[];
  }

  interface PlaybackState {
    context: PlaybackContext;
    disallows: PlaybackDisallows;
    duration: number;
    loading: boolean;
    paused: boolean;
    playback_features: { hifi_status: string };
    playback_id: string;
    playback_quality: string;
    position: number;
    /**
     * 0: NO_REPEAT
     * 1: ONCE_REPEAT
     * 2: FULL_REPEAT
     */
    repeat_mode: 0 | 1 | 2;
    restrictions: PlaybackRestrictions;
    shuffle: boolean;
    timestamp: number;
    track_window: PlaybackTrackWindow;
  }
  type PlaybackStateListener = (s: PlaybackState) => void;
  interface PlaybackTrackWindow {
    current_track: Track;
    next_tracks: Track[];
    previous_tracks: Track[];
  }

  interface PlayerInit {
    getOAuthToken(cb: (token: string) => void): void;
    name: string;
    volume?: number;
  }

  interface Track {
    album: Album;
    artists: Artist[];
    duration_ms: number;
    id: null | string;
    is_playable: boolean;
    is_playable: boolean;
    media_type: "audio" | "video";
    name: string;
    type: "ad" | "episode" | "track";
    uid: string;
    uri: string;
  }

  interface WebPlaybackInstance {
    device_id: string;
  }

  class Player {
    readonly _options: { id: string } & PlayerInit;
    addListener: AddListenerFn;

    on: AddListenerFn;
    constructor(options: PlayerInit);
    connect(): Promise<boolean>;
    disconnect(): void;
    getCurrentState(): Promise<null | PlaybackState>;

    getVolume(): Promise<number>;
    nextTrack(): Promise<void>;

    pause(): Promise<void>;

    previousTrack(): Promise<void>;
    removeListener(
      event: "not_ready" | "player_state_changed" | "ready" | ErrorTypes,
      cb?: ErrorListener | PlaybackInstanceListener | PlaybackStateListener,
    ): void;
    resume(): Promise<void>;
    seek(pos_ms: number): Promise<void>;
    setName(name: string): Promise<void>;
    setVolume(volume: number): Promise<void>;
    togglePlay(): Promise<void>;
  }
}

import { Track, TrackSimplified } from "./Track";

export interface UpdatePlaylistValues {
  name: string;
  public: boolean;
  collaborative: boolean;
  description: string;
}

export interface Dialog {
  show: boolean;
  type: DialogType;
  isClosing: boolean;
  albumId?: string;
  track?: Track | TrackSimplified | Spotify.Track;
  playlistId?: string;
}

export type DialogType =
  | null
  | "createCollection"
  | "createPlaylist"
  | "addalbum"
  | "addSong"
  | "editPlaylist"
  | "search"
  | "widevine";

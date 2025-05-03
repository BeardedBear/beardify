import { Track, TrackSimplified } from "./Track";

export interface Dialog {
  albumId?: string;
  isClosing: boolean;
  playlistId?: string;
  show: boolean;
  track?: Spotify.Track | Track | TrackSimplified;
  type: DialogType;
}

export type DialogType =
  | "addalbum"
  | "addSong"
  | "createCollection"
  | "createPlaylist"
  | "editPlaylist"
  | "search"
  | "widevine"
  | null;

export interface UpdatePlaylistValues {
  collaborative: boolean;
  description: string;
  name: string;
  public: boolean;
}

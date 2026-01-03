import { AlbumGroup } from "@/helpers/groupAlbumVariants";

import { Track, TrackSimplified } from "./Track";

export interface Dialog {
  albumGroup?: AlbumGroup;
  albumId?: string;
  isClosing: boolean;
  isMinimized: boolean;
  playlistId?: string;
  show: boolean;
  track?: Spotify.Track | Track | TrackSimplified;
  type: DialogType;
}

export type DialogType =
  | "addalbum"
  | "addSong"
  | "albumVariants"
  | "artistOptions"
  | "createCollection"
  | "createPlaylist"
  | "editPlaylist"
  | "playlistOptions"
  | "search"
  | "widevine"
  | null;

export interface UpdatePlaylistValues {
  collaborative: boolean;
  description: string;
  name: string;
  public: boolean;
}

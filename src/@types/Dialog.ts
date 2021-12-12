export interface Dialog {
  show: boolean;
  type: DialogType;
  albumId?: string;
  songUri?: string;
  playlistId?: string;
  isClosing: boolean;
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

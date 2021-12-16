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
  songUri?: string;
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

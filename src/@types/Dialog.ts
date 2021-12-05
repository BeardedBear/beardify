export interface Dialog {
  show: boolean;
  type: DialogType;
  albumId?: string;
  playlistId?: string;
  isClosing: boolean;
}

export type DialogType = null | "addalbum" | "addPlaylist" | "editPlaylist" | "addCollection";

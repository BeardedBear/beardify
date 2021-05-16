export interface Dialog {
  show: boolean;
  type: DialogType;
  albumId?: string;
  playlistId?: string;
}

export type DialogType = "none" | "addalbum" | "addPlaylist" | "editPlaylist" | "addCollection";

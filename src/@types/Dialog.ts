export interface Dialog {
  show: boolean;
  type: DialogType;
  albumId?: string;
}

export type DialogType = "none" | "addalbum" | "addPlaylist";

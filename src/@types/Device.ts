export type DeviceType =
  | "computer"
  | "tablet"
  | "smartphone"
  | "speaker"
  | "tv"
  | "avr"
  | "stb"
  | "audio_dongle"
  | "game_console"
  | "cast_video"
  | "cast_audio"
  | "automobile";

export interface Device {
  id: string | null;
  is_active: boolean;
  is_restricted: boolean;
  name: string;
  type: DeviceType;
  volume_percent: number | null;
}

export interface DevicesResponse {
  devices: Device[];
}

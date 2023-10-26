export type DeviceType =
  | "audio_dongle"
  | "automobile"
  | "avr"
  | "cast_audio"
  | "cast_video"
  | "computer"
  | "game_console"
  | "smartphone"
  | "speaker"
  | "stb"
  | "tablet"
  | "tv";

export interface Device {
  id: null | string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: DeviceType;
  volume_percent: null | number;
}

export interface DevicesResponse {
  devices: Device[];
}

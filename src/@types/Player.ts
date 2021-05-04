interface Player {
  devices: {
    thisDevice: string;
    list: Device[];
  };
  currentlyPlaying: {
    index: number;
    track: Track;
    item: PlaylistItem;
  };
  playlist: PlaylistItem[];
}

interface Track {
  duration: number;
  position: number;
}

interface Device {
  id: string;
  is_active: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

interface PlaylistItem {
  type: string;
  label: string;
  uri?: string;
  data?: {
    type: string;
    sources: {
      src: string;
      type: string;
    }[];
  };
}

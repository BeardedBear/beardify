export interface Player {
  devices: {
    thisDevice: string;
    list: Device[];
  };
  currentlyPlaying: {
    track: Track;
  };
}

export interface Artist {
  name: string;
  uri: string;
}

export interface Images {
  height: number;
  url: string;
  width: number;
}
export interface Album {
  images: Images[];
  name: string;
  uri: string;
}
export interface TrackWindow {
  current_track: {
    artists: Artist[];
    name: string;
    album: Album;
  };
}

export const defaultTrack: Track = {
  duration: 0,
  position: 0,
  paused: true,
  repeatMode: 0,
  shuffle: false,
  trackWindow: {
    current_track: {
      artists: [],
      name: "",
      album: {
        images: [],
        name: "",
        uri: ""
      }
    }
  }
};

export interface Track {
  duration: number;
  position: number;
  paused: boolean;
  repeatMode: number;
  shuffle: boolean;
  trackWindow: TrackWindow;
}

export interface Device {
  id: string;
  is_active: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

export interface PlaylistItem {
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

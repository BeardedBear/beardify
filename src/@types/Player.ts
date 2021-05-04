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

interface Artist {
  name: string;
  uri: string;
}

interface Images {
  height: number;
  url: string;
  width: number;
}
interface Album {
  images: Images[];
  name: string;
  uri: string;
}
interface TrackWindow {
  current_track: {
    artists: Artist[];
    name: string;
    album: Album;
  };
}

interface Track {
  duration: number;
  position: number;
  trackWindow: TrackWindow;
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

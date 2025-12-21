import { SimplifiedPlaylist } from "./Playlist";

export interface Sidebar {
  collections: SimplifiedPlaylist[];
  isOpen: boolean;
  playlists: SimplifiedPlaylist[];
}

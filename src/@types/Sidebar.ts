import { SimplifiedPlaylist } from "./Playlist";

export interface Sidebar {
  collections: SimplifiedPlaylist[];
  isOpen: boolean;
  loadFailed: boolean;
  playlists: SimplifiedPlaylist[];
}

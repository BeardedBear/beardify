import { AlbumPage } from "./Album";
import { ArtistPage } from "./Artist";
import { Auth } from "./Auth";
import { Config } from "./Config";
import { Dialog } from "./Dialog";
import { HomePage } from "./Home";
import { NotificationStore } from "./Notification";
import { Player } from "./Player";
import { PlaylistPage } from "./Playlist";
import { Search } from "./Search";
import { Sidebar } from "./Sidebar";

export interface RootState {
  auth: Auth;
  player: Player;
  artist: ArtistPage;
  album: AlbumPage;
  search: Search;
  sidebar: Sidebar;
  playlist: PlaylistPage;
  dialog: Dialog;
  config: Config;
  home: HomePage;
  notification: NotificationStore;
}

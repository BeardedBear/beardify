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
  album: AlbumPage;
  artist: ArtistPage;
  auth: Auth;
  config: Config;
  dialog: Dialog;
  home: HomePage;
  notification: NotificationStore;
  player: Player;
  playlist: PlaylistPage;
  search: Search;
  sidebar: Sidebar;
}

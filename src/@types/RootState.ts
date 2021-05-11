import { Auth } from "./Auth";
import { Player } from "./Player";
import { ArtistPage } from "./Artist";
import { AlbumPage } from "./Album";
import { Search } from "./Search";
import { Sidebar } from "./Sidebar";
import { PlaylistPage } from "./Playlist";
import { Dialog } from "./Dialog";
import { Config } from "./Config";

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
}

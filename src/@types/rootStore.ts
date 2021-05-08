import { Auth } from "./Auth";
import { Player } from "./Player";
import { ArtistPage } from "./Artist";
import { AlbumPage } from "./Album";
import { Search } from "./Search";

export interface RootState {
  auth: Auth;
  player: Player;
  artist: ArtistPage;
  album: AlbumPage;
  search: Search;
}

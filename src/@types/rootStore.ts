import { Auth } from "./Auth";
import { Player } from "./Player";
import { ArtistPage } from "./Artist";
import { AlbumPage } from "./Album";

export interface RootState {
  auth: Auth;
  player: Player;
  artist: ArtistPage;
  album: AlbumPage;
}

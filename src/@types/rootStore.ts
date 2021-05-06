import { Auth } from "./Auth";
import { Player } from "./Player";
import { ArtistPage } from "./Artist";

export interface RootState {
  auth: Auth;
  player: Player;
  artist: ArtistPage;
}

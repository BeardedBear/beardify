import { Auth } from "./Auth";
import { Player } from "./Player";

export interface RootState {
  auth: Auth;
  player: Player;
}

import { Auth } from "./Auth";
import { Config } from "./Config";

export interface Storage {
  auth: Auth;
  config: Config;
}

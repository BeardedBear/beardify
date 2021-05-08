import { Me } from "./Me";

export interface Auth {
  auth: AuthData;
  me: Me;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  code: string;
}

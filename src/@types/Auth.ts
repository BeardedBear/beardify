import { Me } from "./Me";

export interface Auth {
  auth: AuthData;
  me: Me | null;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  code: string;
}

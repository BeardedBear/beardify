import { Me } from "./Me";

export interface Auth {
  auth: AuthData;
  me: Me | null;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  code: string;
  codeVerifier: string;
  codeChallenge: string;
}

export interface AuthAPIResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: "Bearer";
}

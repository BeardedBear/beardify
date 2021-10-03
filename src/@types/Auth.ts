import { Me } from "./Me";

export interface Auth {
  accessToken: string;
  refreshToken: string;
  code: string;
  codeVerifier: string;
  codeChallenge: string;
  me: Me | null;
}

export interface AuthAPIResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: "Bearer";
}

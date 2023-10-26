import { User } from "./User";

export interface Auth {
  accessToken: string;
  code: string;
  me: null | User;
  storage: null | StorageAuth;
}

export interface StorageAuth {
  codeChallenge: string;
  codeVerifier: string;
  referer: string;
  refreshToken: string;
}

export interface AuthAPIResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: "Bearer";
}

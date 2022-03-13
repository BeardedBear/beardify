import { User } from "./User";

export interface Auth {
  accessToken: string;
  code: string;
  me: User | null;
  storage: StorageAuth | null;
}

export interface StorageAuth {
  codeChallenge: string;
  codeVerifier: string;
  refreshToken: string;
  referer: string;
}

export interface AuthAPIResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: "Bearer";
}

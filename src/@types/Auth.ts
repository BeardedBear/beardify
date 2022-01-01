import { User } from "./User";

export interface Auth {
  accessToken: string;
  code: string;
  me: User | null;
}

export interface AuthAPIResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: "Bearer";
}

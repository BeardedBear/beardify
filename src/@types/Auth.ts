export interface Auth {
  auth: AuthData;
  me: Me;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  code: string;
}

export interface Me {
  displayName: string;
}

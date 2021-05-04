interface Auth {
  auth: AuthData;
  me: Me;
}

interface AuthData {
  accessToken: string;
  refreshToken: string;
  code: string;
  codeVerifier: string;
  codeChallenge: string;
}

interface Me {
  displayName: string;
}

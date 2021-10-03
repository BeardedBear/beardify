import axios, { AxiosResponse } from "axios";
import formUrlEncoded from "form-urlencoded";
import { defineStore } from "pinia";
import { create } from "pkce";
import { Auth, AuthAPIResponse } from "../../@types/Auth";
import { defaultAuth, defaultMe } from "../../@types/Defaults";
import { Me } from "../../@types/Me";
import { api } from "../../api";
import router from "../../router";

export const useAuth = defineStore("auth", {
  state: (): Auth => ({
    auth: {
      accessToken: "",
      refreshToken: "",
      code: "",
      codeVerifier: "",
      codeChallenge: "",
    },
    me: defaultMe,
  }),

  actions: {
    async generateCodeChallenge(): Promise<void> {
      const code: {
        codeVerifier: string;
        codeChallenge: string;
      } = create();

      this.auth.codeChallenge = code.codeChallenge;
      this.auth.codeVerifier = code.codeVerifier;
    },

    resetLogin() {
      this.auth = defaultAuth;
      this.me = defaultMe;
    },

    refreshToken() {
      const storage = localStorage.getItem("beardifyPinia");

      axios
        .post<string, AxiosResponse<AuthAPIResponse>>(
          "https://accounts.spotify.com/api/token",
          formUrlEncoded({
            grant_type: "refresh_token",
            refresh_token: JSON.parse(storage || "").refreshToken,
            client_id: api.clientId,
          }),
        )
        .then((res) => {
          this.auth.accessToken = res.data.access_token;
          this.auth.refreshToken = res.data.refresh_token;
          this.getMe(res.data.access_token);
        })
        .catch((err) => console.error("From refresh token", err));
    },

    getMe(token: string) {
      axios.get<Me>(`${api.url}me`, { headers: { Authorization: `Bearer ${token}` } }).then((p) => {
        this.me = p.data;
        router.push("/");
      });
    },

    async authentification(query: string) {
      const storage = localStorage.getItem("beardifyPinia") || "";

      axios
        .post<string, AxiosResponse<AuthAPIResponse>>(
          "https://accounts.spotify.com/api/token",
          formUrlEncoded({
            grant_type: "authorization_code",
            code: query,
            redirect_uri: api.redirectUri,
            client_id: api.clientId,
            code_verifier: JSON.parse(storage).codeVerifier,
          }),
        )
        .then(({ data }) => {
          this.getMe(data.access_token);
          this.auth.accessToken = data.access_token;
          this.auth.refreshToken = data.refresh_token;
          this.auth.code = query;
        })
        .catch((err) => console.error("From auth", err));
    },
  },
});
